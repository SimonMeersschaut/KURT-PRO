import requests



def load_zone(zone_id: int, cookies):
    output = []
    # Load general information
    resp = requests.get(f"https://kurt3.ghum.kuleuven.be/api/zones/{zone_id}", cookies=cookies)
    print(resp.status_code)
    print(resp.text)
    location_id = resp.json()["locationId"]
    
    # Load data
    resp = requests.get(f"https://kurt3.ghum.kuleuven.be/api/zoneavailabilities?locationId={location_id}&zoneId={zone_id}&startDate=2025-05-07&startTime=21:00", cookies=cookies)
    
    for seat in resp.json()["availabilities"]:
        output.append({
            "id": seat['resourceName'].split(' ')[-1],
            "coordinates": {
                "x": seat["positionX"],
                "y": seat["positionY"],
                "width": 45,
                "height": 25
            }
        })
    print(output)

def main():
    # read cookies
    cookies = {}
    with open("cookies.env", "r") as f:
        for entry in f.read().split("; "):
            cookies.update({entry.split("=")[0]: entry.split("=")[1]})
    # load
    load_zone(2, cookies)

if __name__ == "__main__":
    main()