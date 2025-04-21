import pygame
import json
import os

ZONE_ID = 2

# Initialize pygame
pygame.init()

# Constants for default rectangle size
DEFAULT_WIDTH = 45
DEFAULT_HEIGHT = 25
MIN_RECT_SIZE = 10  # Minimum width and height for a rectangle to be considered a drag

# Load the image
image_path = f"zones/{ZONE_ID}/map.png"  # Ensure this file is in the same directory or provide the full path
image = pygame.image.load(image_path)
image_rect = image.get_rect()

# Set up the display
screen = pygame.display.set_mode((image_rect.width, image_rect.height))
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

# Font for displaying text (increased size for better visibility)
font = pygame.font.Font(None, 24)

# Function to load rectangles from rectangles.json
def load_rectangles():
    global last_identifier
    if os.path.exists(f"zones/{ZONE_ID}/rectangles.json"):
        with open(f"zones/{ZONE_ID}/rectangles.json", "r") as f:
            data = json.load(f)
            for item in data:
                # Resize rectangles to default dimensions
                x, y = item["coordinates"]["x"], item["coordinates"]["y"]
                width, height = item["coordinates"]["width"], item["coordinates"]["height"]
                if width > height:  # Horizontal rectangle
                    rect = pygame.Rect(x, y, DEFAULT_WIDTH, DEFAULT_HEIGHT)
                else:  # Vertical rectangle
                    rect = pygame.Rect(x, y, DEFAULT_HEIGHT, DEFAULT_WIDTH)
                rectangles.append({"id": item["id"], "rect": rect})
            # Update the last identifier to the highest identifier in the file
            if data:
                last_identifier = max(item["id"] for item in data)
        print("Rectangles loaded from rectangles.json")

# Load rectangles at the start
load_rectangles()

# Main loop
running = True
while running:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False

        elif event.type == pygame.MOUSEBUTTONDOWN:
            if event.button == 1:  # Left mouse button
                # Cancel typing mode if active
                if typing:
                    typing = False
                    print("Typing canceled due to new click.")
                start_pos = event.pos
                drawing = True

                # Check if clicking on an existing rectangle
                for rect_data in rectangles:
                    if rect_data["rect"].collidepoint(start_pos):
                        selected_rectangle = rect_data
                        print(f"Selected rectangle with ID: {selected_rectangle['id']}")
                        break
                else:
                    selected_rectangle = None

        elif event.type == pygame.MOUSEBUTTONUP:
            if event.button == 1 and drawing and not selected_rectangle:
                end_pos = event.pos
                drawing = False
                if start_pos and end_pos:
                    # Calculate rectangle dimensions
                    x1, y1 = start_pos
                    x2, y2 = end_pos
                    width = abs(x2 - x1)
                    height = abs(y2 - y1)

                    # Check if it's a drag or a single click (or small drag)
                    if start_pos == end_pos or (width < MIN_RECT_SIZE and height < MIN_RECT_SIZE):
                        # Single click: create a rectangle with default size
                        center_x, center_y = start_pos
                        rect = pygame.Rect(
                            center_x - DEFAULT_WIDTH // 2,
                            center_y - DEFAULT_HEIGHT // 2,
                            DEFAULT_WIDTH,
                            DEFAULT_HEIGHT,
                        )
                        # Increment the last identifier by 1
                        last_identifier = str(int(last_identifier) + 1)
                        current_identifier = last_identifier
                        rectangles.append({"id": current_identifier, "rect": rect})
                        print(f"Rectangle created at center: {start_pos}, size: {DEFAULT_WIDTH}x{DEFAULT_HEIGHT}")
                        print(f"Identifier '{current_identifier}' assigned to rectangle {rect}")
                    else:
                        # Drag: create a rectangle from start_pos to end_pos
                        rect = pygame.Rect(min(x1, x2), min(y1, y2), width, height)
                        typing = True
                        current_identifier = ""
                        print(f"Rectangle drawn: {rect}")

        elif event.type == pygame.KEYDOWN:
            if typing:
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

            elif selected_rectangle:
                # Move the selected rectangle with arrow keys (1px increments)
                if event.key == pygame.K_UP:
                    selected_rectangle["rect"].y -= 1
                elif event.key == pygame.K_DOWN:
                    selected_rectangle["rect"].y += 1
                elif event.key == pygame.K_LEFT:
                    selected_rectangle["rect"].x -= 1
                elif event.key == pygame.K_RIGHT:
                    selected_rectangle["rect"].x += 1
                elif event.key == pygame.K_DELETE:  # Delete the selected rectangle
                    print(f"Deleted rectangle with ID: {selected_rectangle['id']}")
                    rectangles.remove(selected_rectangle)
                    selected_rectangle = None
                    drawing = False  # Reset the drawing flag to prevent unintended dragging

            elif event.key == pygame.K_s:  # Save rectangles to a file
                output_data = [
                    {
                        "id": rect_data["id"],
                        "coordinates": {
                            "x": rect_data["rect"].x,
                            "y": rect_data["rect"].y,
                            "width": rect_data["rect"].width,
                            "height": rect_data["rect"].height,
                        },
                    }
                    for rect_data in rectangles
                ]
                with open(f"zones/{ZONE_ID}/rectangles.json", "w") as f:
                    json.dump(output_data, f, indent=4)
                print("Rectangles saved to rectangles.json")

    # Draw everything
    screen.fill((0, 0, 0))  # Clear screen
    screen.blit(image, (0, 0))  # Draw the image

    # Draw rectangles and their identifiers
    for rect_data in rectangles:
        color = (0, 0, 255) if rect_data == selected_rectangle else (255, 0, 0)  # Blue if selected, red otherwise
        pygame.draw.rect(screen, color, rect_data["rect"], 2)
        # Render the identifier text and draw it at the center of the rectangle
        if rect_data["rect"].width == DEFAULT_HEIGHT:  # Vertical rectangle
            text_surface = font.render(rect_data["id"], True, (0, 0, 0))  # Black text
            text_surface = pygame.transform.rotate(text_surface, 90)  # Rotate text 90 degrees
        else:
            text_surface = font.render(rect_data["id"], True, (0, 0, 0))  # Black text
        text_rect = text_surface.get_rect(center=rect_data["rect"].center)
        screen.blit(text_surface, text_rect)

    # Draw the currently drawn rectangle
    if drawing and start_pos and not selected_rectangle:
        current_pos = pygame.mouse.get_pos()
        x1, y1 = start_pos
        x2, y2 = current_pos
        temp_rect = pygame.Rect(min(x1, x2), min(y1, y2), abs(x2 - x1), abs(y2 - y1))
        pygame.draw.rect(screen, (0, 255, 0), temp_rect, 2)

    # Display the identifier being typed
    if typing:
        text_surface = font.render(f"Identifier: {current_identifier}", True, (255, 255, 255))
        screen.blit(text_surface, (10, 10))

    pygame.display.flip()

pygame.quit()