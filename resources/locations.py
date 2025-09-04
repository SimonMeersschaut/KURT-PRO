import requests
import json

# data = [
#   {"name": "Leuven", "id": 1, "libraries": [
#       {"name": "2Bergen Arenberg", "id": "1", "zones":[
#           {"name": "Silent study 2"}, "id": ...}
#       ]}
#   ]}
#   ...
# ]



def get_library_json(data: dict, cookies: dict):
    # get all zones in this library
    resp = requests.get("https://kurt3.ghum.kuleuven.be/api/locations/"+str(data["id"]), cookies=cookies)
    zones = resp.json()["zones"]
    return {
        "name": data["unit"],
        "id": data["id"],
        "zones":zones
    }

def get_city_json(data: dict, cookies:dict):
    return {
        "name": data["name"],
        "id": data["id"],
        "libraries": [
            get_library_json(library, cookies)
            for library in data["locations"]

        ]
    }


def main():
    # read cookies
    cookies = {}
    with open("maps/cookies.env", "r") as f:
        for entry in f.read().split("; "):
            cookies.update({entry.split("=")[0]: entry.split("=")[1]})
    # fetch locations
    resp = requests.get("https://kurt3.ghum.kuleuven.be/api/tiles", cookies=cookies)
    cities = resp.json()

    output = []
    for city in cities:
        output.append(get_city_json(city, cookies))
    
    with open('zones.json', 'w+') as f:
        json.dump(output, f, indent=2)

    # [{"id":1,"tileGroup":1,"name":"Leuven","thumbnailUrl":"assets/tiles/Leuven.png","locations":[{"id":1,"unit":"2Bergen Arenberg","city":"Leuven","thumbnailUrl":"assets/locations/001-thumbnail.png"},{"id":2,"unit":"2Bergen Désiré Collen","city":"Leuven","thumbnailUrl":"assets/locations/002-thumbnail.png"},{"id":10,"unit":"Agora Learning Centre","city":"Leuven","thumbnailUrl":"assets/locations/010-thumbnail.png"},{"id":3,"unit":"Artes Erasmushuis","city":"Leuven","thumbnailUrl":"assets/locations/003-thumbnail.png"},{"id":7,"unit":"Economics and Business Library","city":"Leuven","thumbnailUrl":"assets/locations/007-thumbnail.png"},{"id":9,"unit":"Institute of Philosophy Library","city":"Leuven","thumbnailUrl":"assets/locations/009-thumbnail.png"},{"id":26,"unit":"Law and Criminology Library","city":"Leuven","thumbnailUrl":"assets/locations/026-thumbnail.png"},{"id":16,"unit":"Psychology and Educational Sciences Library","city":"Leuven","thumbnailUrl":"assets/locations/016-thumbnail.png"},{"id":12,"unit":"Social Sciences Library","city":"Leuven","thumbnailUrl":"assets/locations/012-thumbnail.png"}]},{"id":2,"tileGroup":1,"name":"Antwerp","thumbnailUrl":"assets/tiles/Antwerp.png","locations":[{"id":47,"unit":"Antwerp Library","city":"Antwerpen","thumbnailUrl":"assets/locations/047-thumbnail.png"}]},{"id":3,"tileGroup":1,"name":"Bruges","thumbnailUrl":"assets/tiles/Bruges.png","locations":[{"id":4,"unit":"2Bergen Bruges","city":"Brugge","thumbnailUrl":"assets/locations/004-thumbnail.png"}]},{"id":4,"tileGroup":1,"name":"Brussels","thumbnailUrl":"assets/tiles/Brussels.png","locations":[{"id":5,"unit":"Brussels Library","city":"Brussel","thumbnailUrl":"assets/locations/005-thumbnail.png"}]},{"id":5,"tileGroup":1,"name":"Kortrijk","thumbnailUrl":"assets/tiles/Kortrijk.png","locations":[{"id":15,"unit":"Kortrijk Library","city":"Kortrijk","thumbnailUrl":"assets/locations/015-thumbnail.png"}]},{"id":8,"tileGroup":2,"name":"Learning Lab","thumbnailUrl":"assets/tiles/Recording.png","locations":[{"id":54,"unit":"TLD Celestijnenlaan","city":"Leuven","thumbnailUrl":""},{"id":52,"unit":"TLD Herestraat","city":"Leuven","thumbnailUrl":""},{"id":36,"unit":"TLD Kapeldreef","city":"Leuven","thumbnailUrl":""},{"id":51,"unit":"TLD Minderbroedersstraat","city":"Leuven","thumbnailUrl":""},{"id":53,"unit":"TLD Sabbelaan","city":"Kortrijk","thumbnailUrl":""}]}]

main()