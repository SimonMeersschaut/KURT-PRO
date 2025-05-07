import json
from collections import OrderedDict
from PIL import Image


def compress(zone_id)
    with Image.open(f"zones/{zone_id}/map.png") as img:
        # img.getbbox
        img.width
        img.height
        IMAGE_SIZE = (img.width, img.height)  # width, height
        GRID = (img.width, img.height)  # columns, rows


    RATIO = (GRID[0] / IMAGE_SIZE[0], GRID[1] / IMAGE_SIZE[1])

    # Crop parameters
    CROP_TOPLEFT = (230, 230)
    CROP_BOTTOMRIGHT = (845, 1370)

    # Adjusted image size after cropping
    CROPPED_IMAGE_SIZE = (
        CROP_BOTTOMRIGHT[0] - CROP_TOPLEFT[0],
        CROP_BOTTOMRIGHT[1] - CROP_TOPLEFT[1],
    )

    # Adjust the ratio for the cropped image
    RATIO = (GRID[0] / CROPPED_IMAGE_SIZE[0], GRID[1] / CROPPED_IMAGE_SIZE[1])



    # Load rectangle data
    with open(f"resources/maps/zones/{zone_id}/rectangles.json", "r") as f:
        data = json.load(f)

    output_data = {}
    for seat in data:
        # Adjust coordinates for the crop
        adjusted_x = seat['coordinates']['x'] - CROP_TOPLEFT[0]
        adjusted_y = seat['coordinates']['y'] - CROP_TOPLEFT[1]

        # Calculate grid positions
        column_start = round(adjusted_x * RATIO[0])
        column_end = round((adjusted_x + seat['coordinates']['width'] + 2) * RATIO[0])
        row_start = round(adjusted_y * RATIO[1])
        row_end = round((adjusted_y + seat['coordinates']['height'] + 4) * RATIO[1])

        output_data.update({
            seat['id']: f"{column_start}/{column_end};{row_start}/{row_end}"
        })

    # Sort the output data by identifier
    sorted_output_data = OrderedDict(sorted(output_data.items(), key=lambda x: int(x[0])))

    # Save the updated rectangle data
    with open(f"resources/maps/zones/{zone_id}/compression.json", "w+") as f:
        json.dump(sorted_output_data, f, indent=4)


    new_grid_width = round(424 * (615 / 1060))  # ≈ 246
    new_grid_height = round(600 * (1140 / 1500))  # ≈ 456
    print(f"WARNING: Please change the aspect ratio (in the css) to: '{new_grid_width} / {new_grid_height}'")


def main():
    compress(1)

if __name__ == "__main__":
    main()