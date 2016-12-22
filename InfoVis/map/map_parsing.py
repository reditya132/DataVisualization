import json

mapfile = "wijk_amsterdam.json"

with open(mapfile) as json_data:
	data = json.load(json_data)

data_dict = {}
data_dict["type"] = "FeatureCollection"
data_dict["features"] = []
counter = 0

for i in data['features']:
	data_features = {}
	data_features["type"] = "Feature"
	data_features["geometry"] = {}
	data_features["properties"] = {}
	data_features["geometry"]["type"] = "Polygon"
	data_features["geometry"]["coordinates"] = []


	polygon = i['properties']['locatie'].replace("POLYGON","")
	polygon = polygon.replace("(","")
	polygon = polygon.replace(")","")
	polygon_array = polygon.split(",")
	polygon_list = []
	
	for j in polygon_array:
		k = j.split(" ")
		arr = []
		for l in k:
			arr.append(float(l))
		polygon_list.append(arr)

	data_features["geometry"]["coordinates"].append(polygon_list)
	data_features["properties"]["name"] = i["properties"]["titel"]
	print i["properties"]["titel"]

	if counter < 1000000:
		data_dict["features"].append(data_features)

	counter = counter + 1

#print json.dumps(data_dict)