import json
from collections import OrderedDict
from PIL import Image


def compress(zone_id):
    with Image.open(f"zones/{zone_id}/map.png") as img:
        # img.getbbox
        img.width
        img.height
        IMAGE_SIZE = (img.width, img.height)  # width, height
        GRID = (img.width, img.height)  # columns, rows


    # Adjust the ratio for the cropped image
    RATIO = (GRID[0] / IMAGE_SIZE[0], GRID[1] / IMAGE_SIZE[1])

    # Load rectangle data
    with open(f"zones/{zone_id}/rectangles.json", "r") as f:
        data = json.load(f)

    output_data = {}
    for seat in data:
        # Calculate grid positions
        column_start = round(seat['coordinates']['x'] * RATIO[0])
        column_end = round((seat['coordinates']['x'] + seat['coordinates']['width'] + 2) * RATIO[0])
        row_start = round(seat['coordinates']['y'] * RATIO[1])
        row_end = round((seat['coordinates']['y'] + seat['coordinates']['height'] + 4) * RATIO[1])

        output_data.update({
            seat['id']: f"{column_start}/{column_end};{row_start}/{row_end}"
        })

    # Sort the output data by identifier
    sorted_output_data = OrderedDict(sorted(output_data.items(), key=lambda x: int(x[0])))

    # add config data
    sorted_output_data.update({
        "config": {
            "columns": GRID[0],
            "rows": GRID[1],
        }
    })
    sorted_output_data.move_to_end("config", last=False) # insert at beginning (for a nice layout)

    # Save the updated rectangle data
    with open(f"zones/{zone_id}/compression.json", "w+") as f:
        json.dump(sorted_output_data, f, indent=4)


    new_grid_width = round(424 * (615 / 1060))  # ≈ 246
    new_grid_height = round(600 * (1140 / 1500))  # ≈ 456
    print(f"WARNING: Please change the aspect ratio (in the css) to: '{new_grid_width} / {new_grid_height}'")


def main():
    for i in range(1, 62):
        try:
            compress(i)
        except:
            print("error")
    
if __name__ == "__main__":
    main()