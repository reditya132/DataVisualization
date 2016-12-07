var width = 400;
var height = 500;
var centered;

// setting color domain

var color_domain = [2000, 4000, 8000, 16000];
var ext_color_domain = [0, 2000, 4000, 8000, 16000];

var legend_labels = ["< 2000", "2000+", "4000+", "8000+", "16000+"];

var color = d3.scaleThreshold().domain(d3.range(100, 28000, 3000)).range(d3.schemeGreens[7]);

var div = d3.select("body").append("div")   
  .attr("class", "tooltip")               
  .style("opacity", 0);

var svg = d3.select("#left_column").append("svg")
  .attr("width", width)
  .attr("height", height);

var projection = d3.geoAlbers()
  .center([4.88, 52.36])
  .rotate(4.88)
  .scale(120000)
  .translate([width / 2, height / 2]);

var path = d3.geoPath().projection(projection);

// reading map file and data
d3.queue()
  .defer(d3.json, "../map/topo_real_map.json")
  .defer(d3.tsv, "data.csv")
  .await(ready);

var rateById = {};
var nameById = {};

var g;

function ready(error, map, data) {
   //var rateById = {};
   //var nameById = {};

   data.forEach(function(d) {
    rateById[d.id] = +d.pop;
    nameById[d.id] = d.wijk_name;
  });

//
  g = svg.append("g")
        .attr("id", "path-borders")
        .selectAll("path")
        .data(topojson.feature(map, map.objects.new_wijk_water).features) 
        .enter().append("path")
        .attr("d", path)
        .style("fill", function(d) {
          return color(rateById[d.id]); 
        })
        .style("opacity", 0.8)
        .on("mouseover", mouseOver)
        .on("mouseout", mouseOut)
        .on("click", mouseClicked);
};

function mouseOver(d)
{
  d3.select(this).transition().duration(200).style("opacity", 1);
  div.transition().duration(200).style("opacity", 1);
  div.text(nameById[d.id] + " : " + rateById[d.id])
    .style("left", (d3.event.pageX) + "px")
    .style("top", (d3.event.pageY - 30) + "px");
}

function mouseOut()
{
  d3.select(this).transition().duration(300).style("opacity", 0.8);
  div.transition().duration(300).style("opacity", 0);
}

function mouseClicked(d)
{
  var x, y, k;
  if (d && centered != d) {
    var centroid = path.centroid(d);
    x = centroid[0];
    y = centroid[1];
    k = 5;
    centered = d;
  }
  else {
    x = width / 2;
    y = height / 2;
    k = 1;
    centered = null;
  }

  g.selectAll("path")
    .classed("active", centered && function(d) {
      return d === centered;
    });
  g.transition().duration(700).attr("transform", "translate(" + width/2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")");
}



