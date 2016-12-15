var year='2012';
var data_1 = "Bevtotaal";
var data_2 = "Wkoop";

// slider function from jquery-ui
// it will create slider interface in the map page
$( function() {
  $( "#slider" ).slider({
    value:year,
    min: 2000,
    max: 2016,
    step: 1,
    slide: function( event, ui ) {
      $( "#amount" ).val( " " + ui.value );
      update(ui.value,"left",data_1);
      update(ui.value,"right",data_2);
    }
  });
  $( "#amount" ).val( " " + $( "#slider" ).slider( "value" ) );
} );

// easy autocomplete
var options = {
  url: "buurt.json",
  getValue: "name", 
  list: {
    onClickEvent: function() {
      d3.json('../map/topo_real_map.json', function(error, map) {
        var code = $("#search").getSelectedItemData().code;
        var topodata = topojson.feature(map, map.objects.new_wijk_water).features;
        var select;
        for(var i in topodata)
        {
          if(topodata[i].id == code)
          {
            mouseClicked(topodata[i]);
          }
        }
      })
    },
    match: {
      enabled: true
    }
  }
};

$("#search").easyAutocomplete(options);

function draw()
{
  data_1 = $("#variableA").val();
  data_2 = $("#variableB").val();
  drawLegend(data_1, "left");
  drawLegend(data_2, "right");
  update(year,"left",data_1);
  update(year,"right",data_2);
}

// initialize the width and height of the map
var width = 550;
var height = 500;
var centered;

// initialize the data with pre-selected value to draw the map
// setting color domain for the left div
var color = {};
color["left"] = "";
drawLegend(data_1, "left");

// setting color domain for the right div
color["right"] = "";
drawLegend(data_2, "right");

// create a tooltip div for mouseover action on the map
// the tooltip will show information on the selected neighbourhoods and the value associated with it
var divTooltipFirst = d3.select("body").append("div")   
  .attr("class", "tooltip")               
  .style("opacity", 0);

var divTooltipSecond = d3.select("body").append("div")   
  .attr("class", "tooltip")               
  .style("opacity", 0);

// initialize the svg in left column
var svg = d3.select("#left_column").append("svg")
  .attr("width", width)
  .attr("height", height);

var legendLeft = d3.select("#left_column").append("svg")
  .attr("width", width)
  .attr("height", 50)
  .attr("id", "legend_left");

// initialize the svg in the right column
var svg_right = d3.select("#right_column").append("svg")
  .attr("width", width)
  .attr("height", height);

var legendRight = d3.select("#right_column").append("svg")
  .attr("width", width)
  .attr("height", 50)
  .attr("id", "legend_right");

// projection using geoAlbers
var projection = d3.geoAlbers()
  .center([4.88, 52.36])
  .rotate(4.88)
  .scale(150000)
  .translate([width / 2, height / 2]);

// save the projection variable that will later be used to draw the map
var path = d3.geoPath()
            .projection(projection);

// reading map file and data
d3.queue()
  .defer(d3.json, "../map/topo_real_map.json")
  .defer(d3.tsv, "../datasets/data_tab_delimited.txt")
  .await(queue);

// initialize some variables for the first option that user choose
var dataValue = {};
dataValue["leftValue"] = {};
dataValue["leftId"] = {};
dataValue["leftRange"] = {};
dataValue["rightValue"] = {};
dataValue["rightId"] = {};
dataValue["rightRange"] = {};

// initialize variable for the svg selector g
// g = left column
// g2 = right column
var g;
var g2;

// function queueLeft is called after the queue above
function queue(error, map, data) {
  var max = {};
  max["left"] = 0;
  max["right"] = 0;
  //var min = 100000;
  var min = {};
  min["left"] = 100000;
  min["right"] = 100000;

  // save corresponding map data for the variable that user choose
  // at first, it will choose the minimum year that the data is available
  data.forEach(function(d) {
    if(d.year == year)
    {
      dataValue["leftValue"][d.id] = +d[data_1];
      dataValue["leftId"][d.id] = d.name;
      dataValue["rightValue"][d.id] = +d[data_2];
      dataValue["rightId"][d.id] = d.name;
    }
    if(d[data_1] > max["left"] && d[data_1]>0 && d.year == year)
    {
      max["left"] = +d[data_1];
    }
    if(d[data_1] < min["left"] && d[data_1]>0 && d.year == year)
    {
      min["left"] = +d[data_1];
    }
    if(d[data_1] > max["right"] && d[data_1]>0 && d.year == year)
    {
      max["right"] = +d[data_1];
    }
    if(d[data_1] < min["right"] && d[data_1]>0 && d.year == year)
    {
      min["right"] = +d[data_1];
    }
  });

  data.forEach(function(d) {
    if( d.year == year) { 
      dataValue["leftRange"][d.id] = (d[data_1]-min["left"])/(max["left"]-min["left"]); 
      dataValue["rightRange"][d.id] = (d[data_2]-min["right"])/(max["right"]-min["right"]); 
    }
  });

  g = svg.append("g")
        .attr("class", "path-borders")
        .attr("id", "leftG")        
        .selectAll("path")
        .data(topojson.feature(map, map.objects.new_wijk_water).features) 
        .enter().append("path")
        .attr("d", path)
        .attr("id", function(d) { return "pathLeft"+d.id; })
        .style("fill", function(d) {
          return color["left"](dataValue["leftValue"][d.id]); 
        })
        .style("opacity", 1)
        .on("mouseover", mouseOver)
        .on("mouseout", mouseOut)
        .on("click", mouseClicked);

  g2 = svg_right.append("g")
        .attr("class", "path-borders")
        .attr("id", "rightG")
        .selectAll("path")
        .data(topojson.feature(map, map.objects.new_wijk_water).features) 
        .enter().append("path")
        .attr("d", path)
        .attr("id", function(d) { return "pathRight"+d.id; })
        .style("fill", function(d) {
          return color["right"](dataValue["rightValue"][d.id]); 
        })
        .style("opacity", 1)
        .on("mouseover", mouseOver)
        .on("mouseout", mouseOut)
        .on("click", mouseClicked);

  //g.transition().duration(100).style("opacity", 1);

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

  if(mouseDiv == "left_column")
  {
    divTooltipFirst.transition().duration(200).style("opacity", 1);
    divTooltipFirst.text(dataValue["leftId"][d.id] + " : " + dataValue["leftValue"][d.id])
      .style("left", (d3.event.pageX) + "px")
      .style("top", (d3.event.pageY - 30) + "px");
  
    divTooltipSecond.transition().duration(200).style("opacity", 1);
    divTooltipSecond.text(dataValue["rightId"][d.id] + " : " + dataValue["rightValue"][d.id])
      .style("left", (d3.event.pageX - locationDivLeft.left + locationDivRight.left) + "px")
      .style("top", (d3.event.pageY - 30 - locationDivLeft.top + locationDivRight.top) + "px");
  }

  else if(mouseDiv == "right_column")
  {
    divTooltipFirst.transition().duration(200).style("opacity", 1);
    divTooltipFirst.text(dataValue["rightId"][d.id] + " : " + dataValue["rightValue"][d.id])
      .style("left", (d3.event.pageX) + "px")
      .style("top", (d3.event.pageY - 30) + "px");
  
    divTooltipSecond.transition().duration(200).style("opacity", 1);
    divTooltipSecond.text(dataValue["leftId"][d.id] + " : " + dataValue["leftValue"][d.id])
      .style("left", (d3.event.pageX - locationDivRight.left + locationDivLeft.left) + "px")
      .style("top", (d3.event.pageY - 30 - locationDivRight.top + locationDivLeft.top) + "px");    
  }
}

function mouseOut(d)
{
  d3.select(this).transition().duration(300).style("opacity", 0.8);
  divTooltipFirst.transition().duration(300).style("opacity", 0);
  divTooltipSecond.transition().duration(300).style("opacity", 0);
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
  console.log(d);
  // inspired from this : http://stackoverflow.com/questions/10692100/invoke-a-callback-at-the-end-of-a-transition
  g.transition().duration(700)
    .attr("transform", "translate(" + width/2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
    .on("end", function(d) { 
      if(zoomState == 1)
      {
        d3.select(this).style('stroke','#757575').style('stroke-width','0.5px');
        var select2 = "#"+"pathLeft"+selected;
        var y = $("#leftG");
        y.find(select2).appendTo(y);
        //var select = d3.select(this.select("#"+"pathRight"+selected);
        d3.select(select2).transition().duration(300)
          .style('stroke', '#F57F17')
          .style('stroke-width','2px');
      }
      else
      {
        d3.select("#"+"pathLeft"+selected).transition().duration(300)
          .style('stroke', '#757575')
          .style('stroke-width', '0.5px');        
      }
    })

  g2.transition().duration(700)
    .attr("transform", "translate(" + width/2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
    .on("end", function(d) { 
      if(zoomState == 1)
      {
        d3.select(this).style('stroke','#757575').style('stroke-width','0.5px');
        var select = "#"+"pathRight"+selected;
        var x = $("#rightG");
        x.find(select).appendTo(x);
        //var select = d3.select(this.select("#"+"pathRight"+selected);
        d3.select(select).transition().duration(300)
          .style('stroke', '#F57F17')
          .style('stroke-width','2px');
      }
      else
      {
        d3.select("#"+"pathRight"+selected).transition().duration(300)
          .style('stroke', '#757575')
          .style('stroke-width', '0.5px');        
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

function update(year1,pos,datadraw)
{
  d3.tsv("../datasets/data_tab_delimited.txt", function(error, data1) {
    var max = 0;
    var min = 100000;

    for (var key in dataValue[pos+"Id"])
    {
      dataValue[pos+"Value"][key] = 0;
    }
    
    data1.forEach(function(d) {
      if(d.year == year1)
      {
        dataValue[pos+"Value"][d.id] = +d[datadraw];
        dataValue[pos+"Id"][d.id] = d.name;
      }
      if(d[datadraw] > max && d[datadraw]>0 && d.year == year1)
      {
        max = +d[datadraw];
      }
      if(d[datadraw] < min && d[datadraw]>0 && d.year == year1)
      {
        min = +d[datadraw];
      }
    });

    data1.forEach(function(d) {
      if( d.year == year) { dataValue[pos+"Range"][d.id] = (d[datadraw]-min)/(max-min); }
    });   
    if(pos == "left")
     {
      g = d3.select("#"+pos+"G")
      .selectAll("path")
      .each(function(d,i) {
        d3.select(this).transition().duration(200).style("fill", function(d){
          var mapValue = dataValue[pos+"Value"][d.id];
          if(mapValue == 0) { return "white"; }
          else { return color[pos](mapValue); }
        })
      });
    }
    if(pos == "right")
     {
      g2 = d3.select("#"+pos+"G")
      .selectAll("path")
      .each(function(d,i) {
        d3.select(this).transition().duration(200).style("fill", function(d){
          var mapValue = dataValue[pos+"Value"][d.id];
          if(mapValue == 0) { return "white"; }
          else { return color[pos](mapValue); }
        })
      });
    }    
  });
}

function update2(year1)
{
  d3.tsv("../datasets/data_tab_delimited.txt", function(error, data1) {
    var max = 0;
    var min = 100000;

    for (var key in dataValue["rightId"])
    {
      dataValue["rightValue"][key] = 0;
    }    
    
    data1.forEach(function(d) {
      if(d.year == year1)
      {
        dataValue["rightValue"][d.id] = +d[data_2];
        dataValue["rightId"][d.id] = d.name;
      }
      if(d[data_2] > max && d[data_2]>0 && d.year == year1)
      {
        max = +d[data_2];
      }
      if(d[data_2] < min && d[data_2]>0 && d.year == year1)
      {
        min = +d[data_2];
      }
    });

    data1.forEach(function(d) {
      if( d.year == year) { dataValue["rightRange"][d.id] = (d[data_2]-min)/(max-min); }
    });   
     g2 = d3.select("#rightG")
      .selectAll("path")
      .each(function(d,i) {
        d3.select(this).transition().duration(200).style("fill", function(d){
          var mapValue = dataValue["rightValue"][d.id];
          if(mapValue == 0) { return "white"; }
          else { return color["right"](mapValue); }
        })
      });
  });
}

function drawLegend(dataVar,pos)
{
  d3.tsv("../datasets/data_tab_delimited.txt", function(error, data1) {
    var max = 0;
    var min = 100000;
    $("#legend_"+pos).html("");

    data1.forEach(function(d) {
      if(d[dataVar] > max && d[dataVar]>0 && d.year > 0)
      {
        max = +d[dataVar];
      }
      if(d[dataVar] < min && d[dataVar]>0 && d.year > 0)
      {
        min = +d[dataVar];
      }
    });
    var tick = max/9;

    if(pos == "left") { color[pos] = d3.scaleThreshold().domain(d3.range(0, max, tick)).range(d3.schemeGreens[9]); }
    else if(pos == "right") { color[pos] = d3.scaleThreshold().domain(d3.range(0, max, tick)).range(d3.schemeBlues[9]); }

    var ssvg = d3.select("#legend_"+pos);

    ssvg.append("g")
      .attr("class", "legendLinear")
      .attr("transform", "translate(100,10)");

    var legendLinear = d3.legendColor()
      .shapeWidth(35)
      .orient('horizontal')
      .scale(color[pos]);

    ssvg.select(".legendLinear")
      .call(legendLinear);
  });
}


