var width = 1000;
var height = 1000;

var projection = d3.geoAlbers()
    .center([4.88, 52.36])
    .parallels([52.2, 55])
    .rotate(4.88)
    .scale(90000)
    .translate([width / 2, height / 2]);

var svg = d3.select("#left_column").append("svg")
    .attr("width", width)
    .attr("height", height);

var working = d3.map();

var path = d3.geoPath().projection(projection);

var x = d3.scaleLinear()
    .domain([1, 10])
    .rangeRound([600, 860]);

var color = d3.scaleThreshold().domain(d3.range(2, 10)).range(d3.schemeBlues[9]);

var g = svg.append("g").attr("class", "key").attr("transform", "translate(0,40)");

g.selectAll("rect")
  .data(color.range().map(function(d) {
      d = color.invertExtent(d);
      if (d[0] == null) d[0] = x.domain()[0];
      if (d[1] == null) d[1] = x.domain()[1];
      return d;
    }))
  .enter().append("rect")
    .attr("height", 8)
    .attr("x", function(d) { return x(d[0]); })
    .attr("width", function(d) { return x(d[1]) - x(d[0]); })
    .attr("fill", function(d) { return color(d[0]); });

g.append("text")
    .attr("class", "caption")
    .attr("x", x.range()[0])
    .attr("y", -6)
    .attr("fill", "#000")
    .attr("text-anchor", "start")
    .attr("font-weight", "bold")
    .text("Unemployment rate");

g.call(d3.axisBottom(x)
    .tickSize(13)
    .tickFormat(function(x, i) { return i ? x : x + "%"; })
    .tickValues(color.domain()))
  .select(".domain")
    .remove();

d3.queue()
    .defer(d3.json, "../map/topo_real_map.json")
    .defer(d3.csv, "data.csv", function(d) { working.set(d.id, +d.pop); })
    .await(ready);

 function ready(error, data) {
  if (error) throw error;

  svg.append("g")
      .attr("class", "wijk")
    .selectAll("path")
    .data(topojson.feature(data, data.objects.new_wijk_water).features)
    .enter().append("path")
      .attr("fill", function(d) { return color(d.pop = working.get(d.id)); })
      .attr("d", path)
    .append("title")
      .text(function(d) { return d.pop + " people"; });
}

