var width = 400;
var height = 500;
var centered;

// setting color domain

var color_domain = [2000, 4000, 8000, 16000];
var ext_color_domain = [0, 2000, 4000, 8000, 16000];

var legend_labels = ["< 2000", "2000+", "4000+", "8000+", "16000+"];

var color = d3.scaleThreshold().domain(d3.range(-0.2, 1, 0.15)).range(d3.schemeGreens[7]);
var color2 = d3.scaleThreshold().domain(d3.range(-0.2, 1, 0.15)).range(d3.schemeBlues[7]);

var divTooltipFirst = d3.select("body").append("div")   
  .attr("class", "tooltip")               
  .style("opacity", 0);

var divTooltipSecond = d3.select("body").append("div")   
  .attr("class", "tooltip")               
  .style("opacity", 0);

var svg = d3.select("#left_column").append("svg")
  .attr("width", width)
  .attr("height", height);

var svg_right = d3.select("#right_column").append("svg")
  .attr("width", width)
  .attr("height", height);

var projection = d3.geoAlbers()
  .center([4.88, 52.36])
  .rotate(4.88)
  .scale(120000)
  .translate([width / 2, height / 2]);

var path = d3.geoPath()
            .projection(projection);

// reading map file and data
d3.queue()
  .defer(d3.json, "../map/topo_real_map.json")
  .defer(d3.tsv, "data.csv")
  .await(ready);

d3.queue()
  .defer(d3.json, "../map/topo_real_map.json")
  .defer(d3.tsv, "households.csv")
  .await(ready2);

var rateById = {};
var nameById = {};
var rangeById = {};

var rateById_2 = {};
var nameById_2 = {};
var rangeById_2 = {};


var g;
var g2;

function ready(error, map, data) {
   //var rateById = {};
   //var nameById = {};

  var max = 0;
  var min = 100000;
  
  data.forEach(function(d) {
    rateById[d.id] = +d.pop;
    nameById[d.id] = d.wijk_name;
    if(d.pop > max && d.pop>0)
    {
      max = +d.pop;
    }
    if(d.pop < min && d.pop>0)
    {
      min = +d.pop;
    }
  });

  data.forEach(function(d) {
    rangeById[d.id] = (d.pop-min)/(max-min);
  });

//
  g = svg.append("g")
        .attr("class", "path-borders")
        .attr("id", "leftG")        
        .selectAll("path")
        .data(topojson.feature(map, map.objects.new_wijk_water).features) 
        .enter().append("path")
        .attr("d", path)
        .attr("id", function(d) { return "pathLeft"+d.id; })
        .style("fill", function(d) {
          return color(rangeById[d.id]); 
        })
        .style("opacity", 0.8)
        .on("mouseover", mouseOver)
        .on("mouseout", mouseOut)
        .on("click", mouseClicked);
};

function ready2(error, map, data) {
   //var rateById = {};
   //var nameById = {};
  var max2 = 0;
  var min2 = 10000000000;

   data.forEach(function(d) {
    rateById_2[d.id] = +d.households;
    nameById_2[d.id] = d.wijk_name;
    if(d.households > max2 && d.households > 0)
    {
      max2 = +d.households;
    }
    if(d.households < min2 && d.households > 0)
    {
      min2 = +d.households;
    }
  });

  data.forEach(function(d) {
    rangeById_2[d.id] = (d.households-min2)/(max2-min2);
  });

//
  g2 = svg_right.append("g")
        .attr("class", "path-borders")
        .attr("id", "rightG")
        .selectAll("path")
        .data(topojson.feature(map, map.objects.new_wijk_water).features) 
        .enter().append("path")
        .attr("d", path)
        .attr("id", function(d) { return "pathRight"+d.id; })
        .style("fill", function(d) {
          return color2(rangeById_2[d.id]); 
        })
        .style("opacity", 0.8)
        .on("mouseover", mouseOver)
        .on("mouseout", mouseOut)
        .on("click", mouseClicked);
};

function mouseOver(d,i)
{
  d3.select(this).transition().duration(200).style("opacity", 1);
  
  // get the name of the div where the mouse position is located
  var arr = allElementsFromPoint(d3.event.pageX, d3.event.pageY);
  var mouseDiv = arr[3].id;
  //console.log(mouseDiv);
  var locationDivLeft = $("#left_column").position();
  var locationDivRight = $("#right_column").position();
  
  // reference : http://stackoverflow.com/questions/17917072/choropleth-maps-changing-stroke-color-in-mouseover-shows-overlapping-boundari
  //console.log(this.parentNode.appendChild(this));
  //console.log(this.parentNode);
  //console.log(arr[5]);

  /*d3.select("#"+"pathLeft"+d.id).transition().duration(300)
    .style('stroke', '#F00');

  d3.select("#"+"pathRight"+d.id).transition().duration(300)
    .style('stroke', '#F00');*/


  if(mouseDiv == "left_column")
  {
    divTooltipFirst.transition().duration(200).style("opacity", 1);
    divTooltipFirst.text(nameById[d.id] + " : " + rateById[d.id])
      .style("left", (d3.event.pageX) + "px")
      .style("top", (d3.event.pageY - 30) + "px");
  
    divTooltipSecond.transition().duration(200).style("opacity", 1);
    divTooltipSecond.text(nameById_2[d.id] + " : " + rateById_2[d.id])
      .style("left", (d3.event.pageX - locationDivLeft.left + locationDivRight.left) + "px")
      .style("top", (d3.event.pageY - 30 - locationDivLeft.top + locationDivRight.top) + "px");
  }

  else if(mouseDiv == "right_column")
  {
    divTooltipFirst.transition().duration(200).style("opacity", 1);
    divTooltipFirst.text(nameById_2[d.id] + " : " + rateById_2[d.id])
      .style("left", (d3.event.pageX) + "px")
      .style("top", (d3.event.pageY - 30) + "px");
  
    divTooltipSecond.transition().duration(200).style("opacity", 1);
    divTooltipSecond.text(nameById[d.id] + " : " + rateById[d.id])
      .style("left", (d3.event.pageX - locationDivRight.left + locationDivLeft.left) + "px")
      .style("top", (d3.event.pageY - 30 - locationDivRight.top + locationDivLeft.top) + "px");    
  }
}

function mouseOut(d)
{
  d3.select(this).transition().duration(300).style("opacity", 0.8);
  divTooltipFirst.transition().duration(300).style("opacity", 0);
  divTooltipSecond.transition().duration(300).style("opacity", 0);
  /*d3.select("#"+"pathLeft"+d.id).transition().duration(300)
    .style('stroke', '#fff');

  d3.select("#"+"pathRight"+d.id).transition().duration(300)
    .style('stroke', '#fff');*/
}

function mouseClicked(d)
{
  var x, y, k;
  var zoomState;
  if (d && centered != d) {
    var centroid = path.centroid(d);
    x = centroid[0];
    y = centroid[1];
    k = 3;
    centered = d;
    zoomState = 1;
  }
  else {
    x = width / 2;
    y = height / 2;
    k = 1;
    centered = null;
    zoomState = 0;
  }

  g.selectAll("path")
    .classed("active", centered && function(d) {
      return d === centered;
    });

  g2.selectAll("path")
    .classed("active", centered && function(d) {
      return d === centered;
    });

  var selected = d.id;
  // inspired from this : http://stackoverflow.com/questions/10692100/invoke-a-callback-at-the-end-of-a-transition
  g.transition().duration(700)
    .attr("transform", "translate(" + width/2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
    .on("end", function(d) { 
      if(zoomState == 1)
      {
        d3.select(this).style('stroke','#FFF');
        d3.select("#"+"pathLeft"+selected).transition().duration(300)
          .style('stroke', '#F00');
      }
      else
      {
        d3.select("#"+"pathLeft"+selected).transition().duration(300)
          .style('stroke', '#FFF');        
      }
    })

  g2.transition().duration(700)
    .attr("transform", "translate(" + width/2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
    .on("end", function(d) { 
      if(zoomState == 1)
      {
        d3.select(this).style('stroke','#FFF');
        d3.select("#"+"pathRight"+selected).transition().duration(300)
          .style('stroke', '#F00');
      }
      else
      {
        d3.select("#"+"pathRight"+selected).transition().duration(300)
          .style('stroke', '#FFF');        
      }
    })
}

// reference : http://stackoverflow.com/questions/8813051/determine-which-element-the-mouse-pointer-is-on-top-of-in-javascript
// this function will return all the div associated with a particular mouse position
function allElementsFromPoint(x, y) {
  var element, elements = [];
  var old_visibility = [];
  while (true) {
      element = document.elementFromPoint(x, y);
      if (!element || element === document.documentElement) {
          break;
      }
      elements.push(element);
      old_visibility.push(element.style.visibility);
      element.style.visibility = 'hidden'; // Temporarily hide the element (without changing the layout)
  }
  for (var k = 0; k < elements.length; k++) {
      elements[k].style.visibility = old_visibility[k];
  }
  elements.reverse();
  return elements;
}



