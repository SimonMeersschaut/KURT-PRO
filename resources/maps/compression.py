import json
from collections import OrderedDict

with open("rectangles.json", "r") as f:
    data = json.load(f)

output_data = {}
for seat in data:
    column_start = seat['coordinates']['x']
    column_end = seat['coordinates']['x'] + seat['coordinates']['width']
    row_start = seat['coordinates']['y']
    row_end = seat['coordinates']['y'] + seat['coordinates']['height']
    output_data.update({
        seat['id']: f"{column_start}/{column_end};{row_start}/{row_end}"
    })

# Sort the output data by identifier
sorted_output_data = OrderedDict(sorted(output_data.items(), key=lambda x: int(x[0])))

with open("compression.json", "w+") as f:
    json.dump(sorted_output_data, f, indent=4)