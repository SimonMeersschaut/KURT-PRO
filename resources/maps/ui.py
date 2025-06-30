import pygame
import json
import os

ZONE_ID = 10

# Initialize pygame
pygame.init()

# Constants for default rectangle size
DEFAULT_WIDTH = 45
DEFAULT_HEIGHT = 25
MIN_RECT_SIZE = 10  # Minimum width and height for a rectangle to be considered a drag

# Load the image
image_path = f"zones/{ZONE_ID}/map.png"
image = pygame.image.load(image_path)
image_rect = image.get_rect()

# Get screen size
display_info = pygame.display.Info()
screen_width, screen_height = display_info.current_w, display_info.current_h

# Determine scale factor if image is too big
scale_factor = min(
    screen_width / image_rect.width if image_rect.width > screen_width else 1,
    screen_height / image_rect.height if image_rect.height > screen_height else 1,
)

if scale_factor < 1:
    new_width = int(image_rect.width * scale_factor)
    new_height = int(image_rect.height * scale_factor)
    image = pygame.transform.smoothscale(image, (new_width, new_height))
    image_rect = image.get_rect()
else:
    new_width = image_rect.width
    new_height = image_rect.height

# Set up the display
screen = pygame.display.set_mode((new_width, new_height))
pygame.display.set_caption("Select Rectangles and Assign Identifiers")

# Variables for rectangle selection
start_pos = None
end_pos = None
drawing = False
rectangles = []
typing = False
current_identifier = ""
last_identifier = "0"  # Start with 0 as the default last identifier
selected_rectangle = None  # Currently selected rectangle
selected_rectangles = []   # List for multi-selection

# Font for displaying text (increased size for better visibility)
font = pygame.font.Font(None, 24)

# Function to load rectangles from rectangles.json (new format)
def load_rectangles():
    global last_identifier
    rectangles.clear()
    if os.path.exists(f"zones/{ZONE_ID}/rectangles.json"):
        with open(f"zones/{ZONE_ID}/rectangles.json", "r") as f:
            data = json.load(f)
            seats = data.get("seats", [])
            for item in seats:
                x, y = item["x"], item["y"]
                width, height = item["width"], item["height"]
                rotation = item.get("rotation", 0)
                rect = pygame.Rect(x, y, width, height)
                rectangles.append({"id": item["id"], "rect": rect, "rotation": rotation})
            if seats:
                last_identifier = str(max(item["id"] for item in seats))
        print("Rectangles loaded from rectangles.json")

# Load rectangles at the start
load_rectangles()

# When drawing rectangles and handling positions, scale coordinates if scale_factor < 1
def scale_rect(rect, scale):
    return pygame.Rect(
        int(rect.x * scale),
        int(rect.y * scale),
        int(rect.width * scale),
        int(rect.height * scale),
    )

# Main loop
running = True
while running:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False

        elif event.type == pygame.MOUSEBUTTONDOWN:
            if event.button == 1:  # Left mouse button
                if typing:
                    typing = False
                    print("Typing canceled due to new click.")
                start_pos = tuple(int(coord / scale_factor) for coord in event.pos)
                drawing = True

                ctrl_held = pygame.key.get_mods() & pygame.KMOD_CTRL
                found = False
                for rect_data in rectangles:
                    if rect_data["rect"].collidepoint(start_pos):
                        found = True
                        if ctrl_held:
                            if rect_data not in selected_rectangles:
                                selected_rectangles.append(rect_data)
                                print(f"Added rectangle with ID: {rect_data['id']} to selection")
                        else:
                            selected_rectangle = rect_data
                            selected_rectangles = [rect_data]
                            print(f"Selected rectangle with ID: {selected_rectangle['id']}")
                        break
                if not found:
                    if not ctrl_held:
                        selected_rectangle = None
                        selected_rectangles = []
                    # Start selection rectangle mode
                    selection_rect_start = start_pos
                    selection_rect_end = start_pos
                    selection_mode = True
                else:
                    selection_mode = False

        elif event.type == pygame.MOUSEMOTION:
            if drawing and 'selection_mode' in locals() and selection_mode:
                selection_rect_end = tuple(int(coord / scale_factor) for coord in event.pos)

        elif event.type == pygame.MOUSEBUTTONUP:
            if event.button == 1 and drawing:
                end_pos = tuple(int(coord / scale_factor) for coord in event.pos)
                drawing = False

                # If we were in selection mode, select all rectangles in the selection rectangle
                if 'selection_mode' in locals() and selection_mode:
                    selection_mode = False
                    x1, y1 = selection_rect_start
                    x2, y2 = selection_rect_end
                    sel_rect = pygame.Rect(min(x1, x2), min(y1, y2), abs(x2 - x1), abs(y2 - y1))
                    selected_rectangles = [
                        rect_data for rect_data in rectangles
                        if sel_rect.colliderect(rect_data["rect"])
                    ]
                    selected_rectangle = selected_rectangles[0] if selected_rectangles else None
                    print(f"Selected {len(selected_rectangles)} rectangles with selection rectangle.")
                    # Remove selection rectangle variables
                    del selection_rect_start, selection_rect_end
                elif not selected_rectangle:
                    # Only allow drag-to-create, not single click
                    if start_pos and end_pos:
                        x1, y1 = start_pos
                        x2, y2 = end_pos
                        width = abs(x2 - x1)
                        height = abs(y2 - y1)
                        if not (start_pos == end_pos or (width < MIN_RECT_SIZE and height < MIN_RECT_SIZE)):
                            rect = pygame.Rect(min(x1, x2), min(y1, y2), width, height)
                            typing = True
                            current_identifier = ""
                            print(f"Rectangle drawn: {rect}")

        elif event.type == pygame.KEYDOWN:
            if event.key == pygame.K_ESCAPE:
                running = False

            elif typing:
                if event.key == pygame.K_RETURN:  # Finish typing
                    if current_identifier:
                        rectangles.append({"id": current_identifier, "rect": rect})
                        typing = False
                        # Update last_identifier to the custom identifier
                        last_identifier = current_identifier
                        print(f"Identifier '{current_identifier}' assigned to rectangle {rect}")
                elif event.key == pygame.K_BACKSPACE:  # Remove last character
                    current_identifier = current_identifier[:-1]
                else:
                    current_identifier += event.unicode  # Add typed character

            elif selected_rectangles:
                move_amount = 5
                if event.key == pygame.K_UP:
                    for rect in selected_rectangles:
                        rect["rect"].y -= move_amount
                elif event.key == pygame.K_DOWN:
                    for rect in selected_rectangles:
                        rect["rect"].y += move_amount
                elif event.key == pygame.K_LEFT:
                    for rect in selected_rectangles:
                        rect["rect"].x -= move_amount
                elif event.key == pygame.K_RIGHT:
                    for rect in selected_rectangles:
                        rect["rect"].x += move_amount
                elif event.key == pygame.K_DELETE:
                    for rect in selected_rectangles:
                        print(f"Deleted rectangle with ID: {rect['id']}")
                        rectangles.remove(rect)
                    selected_rectangle = None
                    selected_rectangles = []
                    drawing = False
                elif event.key == pygame.K_r:
                    # Rotate clockwise (22 degrees) if R, counterclockwise if Shift+R
                    if pygame.key.get_mods() & pygame.KMOD_SHIFT:
                        for rect in selected_rectangles:
                            current_rotation = rect.get("rotation", 0)
                            rect["rotation"] = (current_rotation - 22) % 360
                            print(f"Rotated rectangle {rect['id']} to {rect['rotation']} degrees (counterclockwise)")
                    else:
                        for rect in selected_rectangles:
                            current_rotation = rect.get("rotation", 0)
                            rect["rotation"] = (current_rotation + 11) % 360
                            print(f"Rotated rectangle {rect['id']} to {rect['rotation']} degrees (clockwise)")

            # Saving should always work, regardless of selection or typing
            if event.key == pygame.K_s:
                output_data = {
                    "image_width": image_rect.width,
                    "image_height": image_rect.height,
                    "seats": [
                        {
                            "id": int(rect_data["id"]),
                            "x": rect_data["rect"].x,
                            "y": rect_data["rect"].y,
                            "width": rect_data["rect"].width,
                            "height": rect_data["rect"].height,
                            "rotation": rect_data.get("rotation", 0),
                        }
                        for rect_data in rectangles
                    ],
                }
                with open(f"zones/{ZONE_ID}/rectangles.json", "w") as f:
                    json.dump(output_data, f, indent=4)
                print("Rectangles saved to rectangles.json")

            # Add rectangle at mouse position when pressing N
            if event.key == pygame.K_n:
                mouse_pos = pygame.mouse.get_pos()
                center_x, center_y = [int(coord / scale_factor) for coord in mouse_pos]
                rect = pygame.Rect(
                    center_x - DEFAULT_WIDTH // 2,
                    center_y - DEFAULT_HEIGHT // 2,
                    DEFAULT_WIDTH,
                    DEFAULT_HEIGHT,
                )
                last_identifier = str(int(last_identifier) + 1)
                current_identifier = last_identifier
                rectangles.append({"id": current_identifier, "rect": rect})
                print(f"Rectangle created at center: ({center_x}, {center_y}), size: {DEFAULT_WIDTH}x{DEFAULT_HEIGHT}")
                print(f"Identifier '{current_identifier}' assigned to rectangle {rect}")

    # Draw everything
    screen.fill((0, 0, 0))  # Clear screen
    screen.blit(image, (0, 0))  # Draw the image

    # Draw rectangles and their identifiers
    for rect_data in rectangles:
        if rect_data in selected_rectangles:
            color = (0, 255, 255)
        elif rect_data == selected_rectangle:
            color = (0, 0, 255)
        else:
            color = (255, 0, 0)
        draw_rect = scale_rect(rect_data["rect"], scale_factor)
        rotation = rect_data.get("rotation", 0)

        # Draw rotated rectangle
        rect_surface = pygame.Surface((draw_rect.width, draw_rect.height), pygame.SRCALPHA)
        pygame.draw.rect(rect_surface, color, rect_surface.get_rect(), 2)
        rotated_surface = pygame.transform.rotate(rect_surface, rotation)
        rotated_rect = rotated_surface.get_rect(center=draw_rect.center)
        screen.blit(rotated_surface, rotated_rect.topleft)

        # Render and rotate the identifier text
        text_surface = font.render(str(rect_data["id"]), True, (0, 0, 0))
        text_surface = pygame.transform.rotate(text_surface, rotation)
        text_rect = text_surface.get_rect(center=draw_rect.center)
        screen.blit(text_surface, text_rect)

    # Draw the selection rectangle if in selection mode
    if drawing and 'selection_mode' in locals() and selection_mode:
        x1, y1 = selection_rect_start
        x2, y2 = selection_rect_end
        temp_rect = pygame.Rect(min(x1, x2), min(y1, y2), abs(x2 - x1), abs(y2 - y1))
        draw_temp_rect = scale_rect(temp_rect, scale_factor)
        pygame.draw.rect(screen, (0, 255, 0), draw_temp_rect, 2)

    # Draw the currently drawn rectangle (for new rectangle creation)
    if drawing and start_pos and not selected_rectangle and not ('selection_mode' in locals() and selection_mode):
        current_pos = pygame.mouse.get_pos()
        x1, y1 = [int(coord / scale_factor) for coord in start_pos]
        x2, y2 = [int(coord / scale_factor) for coord in current_pos]
        temp_rect = pygame.Rect(min(x1, x2), min(y1, y2), abs(x2 - x1), abs(y2 - y1))
        draw_temp_rect = scale_rect(temp_rect, scale_factor)
        pygame.draw.rect(screen, (0, 255, 0), draw_temp_rect, 2)

    # Display the identifier being typed
    if typing:
        text_surface = font.render(f"Identifier: {current_identifier}", True, (255, 255, 255))
        screen.blit(text_surface, (10, 10))

    pygame.display.flip()

pygame.quit()