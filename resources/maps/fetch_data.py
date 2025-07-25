import requests
import os
import json
import shutil
import cv2

def load_zone(zone_id: int, cookies):
    output = []
    # Load general information
    resp = requests.get(f"https://kurt3.ghum.kuleuven.be/api/zones/{zone_id}", cookies=cookies)
    data = resp.json()
    if "status" in data.keys() and data["status"] != 200:
        with open("errors.txt", "a") as f:
            f.write(f"{zone_id}\n")
        if "title" in data.keys():
            # some error occured (probably an overlflow on the zone_id)
            print(data["title"])
        return
    location_id = data["locationId"]
    floor_plan_id = data["floorPlanId"]

    # Load data
    resp = requests.get(f"https://kurt3.ghum.kuleuven.be/api/zoneavailabilities?locationId={location_id}&zoneId={zone_id}&startDate=2025-05-07&startTime=21:00", cookies=cookies)
    data = resp.json()
    if not "availabilities" in data.keys():
        print(resp.json())
        with open("errors.txt", "a") as f:
            f.write(f"{zone_id}\n")
        return
    for seat in data["availabilities"]:
        try:
            output.append({
                "id": int(seat['resourceName'].split(' ')[-1]),
                "x": round(seat["positionX"]),
                "y": round(seat["positionY"]),
                "width": 45,
                "height": 25,
                "rotation":0
            })
        except ValueError:
            print("value error for "+seat['resourceName'].split(' ')[-1])
    # create directory
    if not os.path.exists(f"zones/{zone_id}"):
        os.mkdir(f"zones/{zone_id}")

    # Fetch image
    url = f"https://kurtfloorplan.blob.core.windows.net/floorplans/FloorPlan_{floor_plan_id}.png"
    r = requests.get(url, stream=True)
    if r.status_code == 200:
        with open(f"zones/{zone_id}/map.png", 'wb') as f:
            r.raw.decode_content = True
            shutil.copyfileobj(r.raw, f)    

    im = cv2.imread(f"zones/{zone_id}/map.png")

    # Write rectangles file
    with open(f"zones/{zone_id}/rectangles.json", 'w+') as f:
        # im returns (height, width, channels)
        json.dump({
            "image_height": im.shape[0], # width
            "image_width": im.shape[1], # height
            "seats": output,
        }, f)

    print(output)

def main():
    # read cookies
    cookies = {}
    with open("cookies.env", "r") as f:
        for entry in f.read().split("; "):
            cookies.update({entry.split("=")[0]: entry.split("=")[1]})
    # load
    for i in range(1, 70): # zone 0 does not exist
        # input(i)
        load_zone(i, cookies)

if __name__ == "__main__":
    main()