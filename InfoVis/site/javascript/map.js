var width = 500;
var height = 500;

var projection = d3.geoAlbers()
    .center([4.88, 52.36])
    .parallels([52.2, 100])
    .rotate(4.88)
    .scale(90000)
    .translate([width / 2, height / 2]);

var path = d3.geoPath()
    .projection(projection);

var svg = d3.select("#left_column").append("svg")
    .attr("width", width)
    .attr("height", height);

d3.json("../map/topo_real_map.json", function(error, data) {
  svg.append("path")
      .datum(topojson.feature(data, data.objects.new_wijk_water))
      .attr("d", path);
});

