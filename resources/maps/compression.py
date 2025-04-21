import json
from collections import OrderedDict

ZONE_ID = 2
 
IMAGE_SIZE = (1060, 1500) # width, height
GRID = (424, 600) # columns, rows

RATIO = (GRID[0]/IMAGE_SIZE[0], GRID[1]/IMAGE_SIZE[1])

with open(f"resources/maps/zones/{ZONE_ID}/rectangles.json", "r") as f:
    data = json.load(f)

output_data = {}
for seat in data:
    column_start = round(seat['coordinates']['x']*RATIO[0])
    column_end = round(seat['coordinates']['x']*RATIO[0] + (seat['coordinates']['width'] + 2)*RATIO[0])
    row_start = round(seat['coordinates']['y']*RATIO[1])
    row_end = round(seat['coordinates']['y']*RATIO[1] + (seat['coordinates']['height'] + 4)*RATIO[1])
    output_data.update({
        seat['id']: f"{column_start}/{column_end};{row_start}/{row_end}"
    })

# Sort the output data by identifier
sorted_output_data = OrderedDict(sorted(output_data.items(), key=lambda x: int(x[0])))

with open(f"resources/maps/zones/{ZONE_ID}/compression.json", "w+") as f:
    json.dump(sorted_output_data, f, indent=4)