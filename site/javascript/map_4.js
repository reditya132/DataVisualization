var year='2012';
var data_1 = "";
var data_2 = "";
var dataset = [];
var zoomState;
var selected;

var dataset_line = {};

// Extra variables for scatterplot.
var dataset_year = [];
var minVar1;
var minVar2;
var maxVar1;
var maxVar2;

// slider function from jquery-ui
// it will create slider interface in the map page

function updateView(value)
{
  update(value,"left",data_1);
  update(value,"right",data_2);
  console.log(value);
  year = value;
  if(zoomState == 1)
  {
    d3.selectAll(".class_circle").style("fill", "black").attr("r", "3");
    d3.select("#left_line_circle_"+year).style("fill", "#F57F17").attr("r", "6");
    d3.select("#right_line_circle_"+year).style("fill", "#F57F17").attr("r", "6");
  }  
  dataset_year = [];
  dataset.forEach(function(d){
    if(d.year == year){
      dataset_year.push(d);
    }
  });
  scatter_change();  
}

// easy autocomplete
var options = {
  url: "map/buurt.json",
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
  d3.tsv("../../datasets/data_tab_delimited.txt", function(error, tsv_data) {
    dataset = [];
  	minVar1 = Number.MAX_VALUE;
  	minVar2 = Number.MAX_VALUE;
  	maxVar1 = 0;
  	maxVar2 = 0;
    data_1 = $("#variableA").val();
    data_2 = $("#variableB").val();
    dataset_year = [];    
    tsv_data.forEach(function(d) {
      var temp = {};
      temp["id"] = d.id;
      temp["name"] = d.name;
      temp["year"] = d.year;
      temp[data_1] = d[data_1];
      temp[data_2] = d[data_2];
      dataset.push(temp);
  	  
  	  // Computes the minima and maxima of the variables.
  	  if (d.year == year){
  		  dataset_year.push(temp);
  	  }
  	
  	  if (+d[data_1] < minVar1){
  		  minVar1 = +d[data_1];
      }
  	  if (+d[data_1] > maxVar1){
  		  maxVar1 = +d[data_1];
  	  }
  	  if (+d[data_2] < minVar2){
  		  minVar2 = +d[data_2];
  	  }
  	  if (+d[data_2] > maxVar2){
  		  maxVar2 = +d[data_2];
  	  }
    });
    //console.log(dataset);
    drawLegend(data_1, "left");
    drawLegend(data_2, "right");
    update(year,"left",data_1);
    update(year,"right",data_2); 
    if(zoomState == 1)
    {
        console.log(selected);
        $("#left_line").html("");
        $("#right_line").html("");        
        drawLinechart(selected,data_1,"left_line");
        drawLinechart(selected,data_2,"right_line"); 
    }
	  drawScatterplot(); 
	});   
}

// initialize the width and height of the map
var width = 500;
var height = 400;
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
  .defer(d3.tsv, "../../datasets/data_tab_delimited.txt")
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
  // save corresponding map data for the variable that user choose
  // at first, it will choose the minimum year that the data is available
  data.forEach(function(d) {
    dataValue["leftValue"][d.id] = 0;
    dataValue["leftId"][d.id] = d.name;
    dataValue["rightValue"][d.id] = 0;
    dataValue["rightId"][d.id] = d.name;
  });

  g = svg.append("g")
        .attr("class", "path-borders")
        .attr("id", "leftG")        
        .selectAll("path")
        .data(topojson.feature(map, map.objects.new_wijk_water).features) 
        .enter().append("path")
        .attr("d", path)
        .attr("id", function(d) { return "path_left_"+d.id; })
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
        .attr("id", function(d) { return "path_right_"+d.id; })
        .style("fill", function(d) {
          return color["right"](dataValue["rightValue"][d.id]); 
        })
        .style("opacity", 1)
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
  console.log(arr);
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
  selected = d.id;

  if (d && centered != d) {
    var centroid = path.centroid(d);
    x = centroid[0];
    y = centroid[1];
    k = 3;
    centered = d;
    zoomState = 1;
    drawLinechart(selected,data_1,"left_line");
    drawLinechart(selected,data_2,"right_line");   
    $("#search").val(dataValue["leftId"][d.id]);   
    d3.selectAll(".circle_scatter")
      .transition().duration(1000)
      .attr("r", 5)
      .style("fill", "black");
    d3.select("#scatter_"+selected)
      .raise() // .raise() is a new function in D3v4 to move an element to the end
      .transition().duration(1000)
      .attr("r", 9)
      .style("fill","#F57F17");    
  }
  else {
    x = width / 2;
    y = height / 2;
    k = 1;
    centered = null;
    zoomState = 0;
    $("#left_line").html("");  
    $("#right_line").html("");  
    d3.selectAll(".circle_scatter")
      .transition()
      .duration(1000)
      .attr("r", 5)
      .style("fill","black");    
  }

  g.selectAll("path")
    .classed("active", centered && function(d) {
      return d === centered;
    });

  g2.selectAll("path")
    .classed("active", centered && function(d) {
      return d === centered;
    });

  //console.log(d);
  // inspired from this : http://stackoverflow.com/questions/10692100/invoke-a-callback-at-the-end-of-a-transition
  g.transition().duration(700)
    .attr("transform", "translate(" + width/2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
    .on("end", function(d) { 
      if(zoomState == 1)
      {
        d3.select(this).style('stroke','#757575').style('stroke-width','0.5px');
        var select2 = "#"+"path_left_"+selected;

        d3.select(select2).raise().transition().duration(300)
          .style('stroke', '#F57F17')
          .style('stroke-width','2px');
      }
      else
      {
        d3.select("#"+"path_left_"+selected).transition().duration(300)
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
        var select = "#"+"path_right_"+selected;

        d3.select(select).raise().transition().duration(300)
          .style('stroke', '#F57F17')
          .style('stroke-width','2px');
      }
      else
      {
        d3.select("#"+"path_right_"+selected).transition().duration(300)
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
  var data1 = dataset;
  var max = 0;
  var min = 100000;

  for (var key in dataValue[pos+"Id"])
  {
    dataValue[pos+"Value"][key] = 0;
  }
  //console.log(data1);
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
      d3.select(this).transition().duration(300).style("fill", function(d){
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
      d3.select(this).transition().duration(300).style("fill", function(d){
        var mapValue = dataValue[pos+"Value"][d.id];
        if(mapValue == 0) { return "white"; }
        else { return color[pos](mapValue); }
      })
    });
  }    
}

function drawLegend(dataVar,pos)
{
  var data1 = dataset;
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
}

// global variable for line chart
//dataset_line["left_line"] = [];
//dataset_line["right_line"] = [];

function drawLinechart(wijk,variable,div)
{
  // reference : http://bl.ocks.org/d3noob/38744a17f9c0141bcd04
  dataset_line[div] = [];
  $("#"+div).html("");

  var width_linechart = 250;
  var height_linechart = 150;
  var margin = {top: 10, right: 30, bottom: 30, left: 50},
  width_linechart = width_linechart - margin.left - margin.right;
  height_linechart = height_linechart - margin.top - margin.bottom;
  var svg_scatterplot = d3.select("#"+div).append("svg")
      .attr("width", 300)
      .attr("height", 150);    
  var gg = svg_scatterplot.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var x = d3.scaleLinear().rangeRound([0, width_linechart]);
  var y = d3.scaleLinear().rangeRound([height_linechart, 0]);
  // define axis
  var xAxis = d3.axisBottom().scale(x).ticks(4).tickFormat(d3.format("d"));;
  var yAxis = d3.axisLeft().scale(y).ticks(5);
  var data_selected = variable;

  // draw the line
  var line = d3.line()
                .x(function(d) { 
                  return x(+d.year); 
                })
                .y(function(d) { return y(+d["value"]); })

  dataset.forEach(function(d) {
    if(d.id == wijk)
    {
      var temp = [];
      temp["year"] = d.year;
      temp["value"] = +d[data_selected];
      dataset_line[div].push(temp);
      //data_wijk.push(temp);
    }
  });

  x.domain(d3.extent(dataset_line[div], function(d) { 
    console.log(d.year);
    return d.year; 
  }));
  y.domain(d3.extent(dataset_line[div], function(d) { return +d["value"]; }));  

  gg.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height_linechart + ")")
      .call(xAxis);

  gg.append("g")
      .attr("class", "axis axis--y")
      .call(yAxis)
      .append("text")
      .attr("fill", "#000")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .style("text-anchor", "end")
      .text(data_selected);

  gg.append("path")
      .datum(dataset_line[div])
      .transition()
      .duration(1000)
      .attr("class", "line_"+div)
      .attr("d", line);

  gg.selectAll("dot")
    .data(dataset_line[div])
    .enter().append("circle")
    .attr("id", function(d) { return div+"_circle_"+d.year; }) 
    .attr("class", "class_circle")   
    .attr("r", function(d) {
      if(d.year == year)
      {
        return "6";
      }
      else
      {
        return "3";
      }      
    })
    .style("fill", function(d) {
      if(d.year == year)
      {
        return "#F57F17";
      }
      else
      {
        return "black";
      }
    })
    .attr("cx", function(d) { return x(+d.year); })
    .attr("cy", function(d) { return y(+d["value"]); })
    .on("mouseover", lineTooltipOver)
    .on("mouseout", lineTooltipOut);
}

var divTooltipLine1 = d3.select("body").append("div")   
  .attr("class", "tooltipLine")               
  .style("opacity", 0);

var divTooltipLine2 = d3.select("body").append("div")   
  .attr("class", "tooltipLine")               
  .style("opacity", 0);

function lineTooltipOver(d)
{
  var year_selected = this.id.slice(-4);
  var split = this.id.split("_");
  var pos1 = split[0]; // left or right
  var dict = {};

  console.log(pos1);
  if(pos1 == "left") { 
    var pos2 = "right";
    var id_selectedOpposite = this.id.replace("left", "right"); 
  }
  else if(pos1 == "right") {
    var pos2 = "left"; 
    var id_selectedOpposite = this.id.replace("right", "left"); 
  }  
  console.log(pos2);
  // ref for this method : http://stackoverflow.com/questions/19253753/javascript-find-json-value
  console.log(dataset_line);
  dict[pos1] = {};
  dict[pos2] = {};
  dataset_line[pos1+"_line"].forEach(function(x) {
    dict[pos1][x.year] = x["value"];
  });
  dataset_line[pos2+"_line"].forEach(function(x) {
    dict[pos2][x.year] = x["value"];
  });

  // reference from here : http://stackoverflow.com/questions/16256454/d3-js-position-tooltips-using-element-position-not-mouse-position
  divTooltipLine1.transition().duration(200).style("opacity", 1);    
  divTooltipLine1.html(d).text(dict[pos1][year_selected])
      .style("left", (parseInt(d3.select("#"+this.id).attr("cx")) + document.getElementById(pos1+"_line").offsetLeft) + 40 + "px")     
      .style("top", (parseInt(d3.select("#"+this.id).attr("cy")) + document.getElementById(pos1+"_line").offsetTop) - 20 + "px");    


  divTooltipLine2.transition().duration(200).style("opacity", 1);    
  divTooltipLine2.html(d).text(dict[pos2][year_selected])
      .style("left", (parseInt(d3.select("#"+id_selectedOpposite).attr("cx")) + document.getElementById(pos2+"_line").offsetLeft) + 40 + "px")     
      .style("top", (parseInt(d3.select("#"+id_selectedOpposite).attr("cy")) + document.getElementById(pos2+"_line").offsetTop) - 20 + "px");    
  console.log(dict);  
}

function lineTooltipOut(d)
{
  divTooltipLine1.transition().duration(200).style("opacity", 0);    
  divTooltipLine2.transition().duration(200).style("opacity", 0);    
}
