import requests
import polyline

def calc_full_route(segments_coordinates, OSRM_SERVER_URL):
    all_coordinates = merge_segments(segments_coordinates)
    full_route = orsm_route(all_coordinates, OSRM_SERVER_URL)
    return full_route


def merge_segments(segments):
    merged = []

    for i, segment in enumerate(segments):
        if i == 0:
            merged.extend(segment)
        else:
            merged.extend(segment[1:])

    return merged


def orsm_route(all_coordinates, OSRM_SERVER_URL):

    coordinates_lon_lat = [[lat, lon] for lon, lat in all_coordinates]
    coordinates_polyline = polyline.encode(coordinates_lon_lat, precision=5)
    
    url = f"{OSRM_SERVER_URL}/route/v1/driving/polyline({coordinates_polyline})"
    
    params = {
        "overview": "full",
        "geometries": "geojson",
        "steps": "false"
    }
    
    response = requests.get(url, params=params)

    if response.status_code != 200:
        raise Exception(f"Chyba OSRM API: {response.status_code} {response.text}")
    print(response.json()["routes"][0]["distance"]) 
    return response.json()["routes"][0]["geometry"]
