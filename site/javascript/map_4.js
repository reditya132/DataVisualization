////////// DEFINITION OF GLOBAL VARIABLE ////////////

// Initialization of global variable used across different functions
var year = "2012"; // default year selected for initial drawing of the choropleths
var data_1 = ""; // initially blank, but later will be assigned a value of the 1st variable selected by user
var data_2 = ""; // initially blank, but later will be assigned a value of the 2nd variable selected by user
var dataset = []; // contains the ID, name, and value of the choropleths
var zoomState; // a state whether now the view is zoomed in or not
var selected; // an ID for the currently selected neighbourhood
var dataset_line = {}; // contains time series data for a particular neighbourhood
var dataValue = {}; // variable that contains ID and name of the choropleths

// Extra variables for scatterplot.
var dataset_year = [];
var minVar1;
var minVar2;
var maxVar1;
var maxVar2;
var dataset_selected = [];

// global variable for topological data
var topodata;

// initialize the width and height of the map
var width = 500;
var height = 400;
var centered; 

// initialize variable for the svg selector g
// g = Left column
// g2 = Right column
var g;
var g2;

////////// END DEFINITION OF GLOBAL VARIABLE /////////

/*
  updateView() is called when the slider of the year is moved around.
  Basically, it will update all the corresponding view across the choropleths, line charts, and the scatterplots.
*/
function updateView(value)
{
  update(value,"left",data_1);
  update(value,"right",data_2);
  year = value;
  
  // The state of zoomState == 1 means that currently an user clicks on a particular neighbourhood.
  // A circle for a particular year will be highlighted and enlarged.
  if(zoomState == 1)
  {
    d3.selectAll(".class_circle").style("fill", "black").attr("r", "3");
    d3.select("#left_line_circle_"+year).style("fill", "#F57F17").attr("r", "6");
    d3.select("#right_line_circle_"+year).style("fill", "#F57F17").attr("r", "6");
  }  

  // Assignment for dataset_year that will be used to draw the updated scatter plot
  dataset_year = [];
  dataset_selected = [];
  dataset.forEach(function(d){
    if(d.year == year){
      dataset_year.push(d);
    }
  });
  
  // Update the scatterplot with this function
  scatter_change();  
}

// Draw the search neighbourhood box with Jquery EasyAutocomplete plugin : http://easyautocomplete.com/
var options = {
  url: "map/buurt.json",
  getValue: "name", 
  list: {
    onClickEvent: function() {
      /* 
        On click event is an event that will be called when user selects a particular neighbourhood in the search box.
        It will scan through the topological data and select one that match the user's choice.
        After that, it will "simulate" a mouse click on that neighbourhood to zoom in the choropleths
      */
      d3.json('../map/topo_real_map.json', function(error, map) {
        var code = $("#search").getSelectedItemData().code;
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


// This function is called everytime the user clicks the "SUBMIT" button to choose new variables
function draw()
{
  // Parse the datasets and take the corresponding variable selected by the user
  d3.tsv("../../datasets/data_tab_delimited.txt", function(error, tsv_data) {
    dataset = []; // empty the dataset to be assigned new values
    dataset_year = []; // empty the dataset to be assigned new values
  	minVar1 = Number.MAX_VALUE;
  	minVar2 = Number.MAX_VALUE;
  	maxVar1 = 0;
  	maxVar2 = 0;
    data_1 = $("#variableA").val();
    data_2 = $("#variableB").val();

    // Start assigning new values to the dataset and dataset_year variable
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

    // Draw the legend in both choropleths on the left and right
    drawLegend(data_1, "left");
    drawLegend(data_2, "right");

    // Update the value and color of the choropleths
    update(year,"left",data_1);
    update(year,"right",data_2); 

    // If it is currently zoomed in a particular neighbourhood, draw the linecharts for the new variable selected by the users.
    if(zoomState == 1)
    {
        $("#left_line").html("");
        $("#right_line").html("");        
        drawLinechart(selected,data_1,"left_line");
        drawLinechart(selected,data_2,"right_line"); 
    }

    // Draw and update the scatterplot
	  drawScatterplot(); 
	});   
}

//////////////////////////////////////////////////////////
// START OF CHOROPLETHS DRAWING LOGIC                   
// References on the internet are used but many modifications and logics are changed so that it matches our intention.
// 1. https://bost.ocks.org/mike/map/ ==> Reference for converting GeoJSON -> TopoJSON -> Draw Map with GeoAlbers
// 2. 
//////////////////////////////////////////////////////////

// Initialize the data with pre-selected value to draw the map
// Setting color domain for the left div
var color = {};
color["left"] = "";
drawLegend(data_1, "left");

// setting color domain for the right div
color["right"] = "";
drawLegend(data_2, "right");

// Create a tooltip div for mouseover action on the map
// The tooltip will show information on the selected neighbourhoods and the value associated with it
var divTooltipFirst = d3.select("body").append("div")   
  .attr("class", "tooltip")               
  .style("opacity", 0);

var divTooltipSecond = d3.select("body").append("div")   
  .attr("class", "tooltip")               
  .style("opacity", 0);

// Initialize the svg for the left choropleths
var svg = d3.select("#left_column").append("svg")
  .attr("width", width)
  .attr("height", height);

// Initialize the legend for the left choropleths
var legendLeft = d3.select("#left_column").append("svg")
  .attr("width", width)
  .attr("height", 50)
  .attr("id", "legend_left");

// Initialize the svg for the right choropleths
var svg_right = d3.select("#right_column").append("svg")
  .attr("width", width)
  .attr("height", height);

var legendRight = d3.select("#right_column").append("svg")
  .attr("width", width)
  .attr("height", 50)
  .attr("id", "legend_right");

// Project using geoAlbers projection
var projection = d3.geoAlbers()
  .center([4.88, 52.36])
  .rotate(4.88)
  .scale(150000)
  .translate([width / 2, height / 2]);

// The projection variable that will later be used to draw the map
var path = d3.geoPath()
            .projection(projection);

// reading map file and data
d3.queue()
  .defer(d3.json, "../map/topo_real_map.json")
  .defer(d3.tsv, "../../datasets/data_tab_delimited.txt")
  .await(queue);

// Initialize some variables for the first option that user choose
dataValue["leftValue"] = {};
dataValue["leftId"] = {};
dataValue["leftRange"] = {};

// Initialize some variables for the second option that user choose
dataValue["rightValue"] = {};
dataValue["rightId"] = {};
dataValue["rightRange"] = {};

// Function queue is after the loading of the page to draw an "empty" map with zero value for all neighbourhood
function queue(error, map, data) {
  // save corresponding map data for the variable that user choose
  data.forEach(function(d) {
    dataValue["leftValue"][d.id] = 0;
    dataValue["leftId"][d.id] = d.name;
    dataValue["rightValue"][d.id] = 0;
    dataValue["rightId"][d.id] = d.name;
  });

  // Assign the topodata variable by reading the features of the TopoJSON file
  topodata = topojson.feature(map, map.objects.new_wijk_water).features;

  // Start appending path to the left choropleths
  g = svg.append("g")
        .attr("class", "path-borders")
        .attr("id", "leftG")        
        .selectAll("path")
        .data(topodata) 
        .enter().append("path")
        .attr("d", path)
        // This is an important part as now each neighbourhood will have an ID, makes it easier for us to select a specific neighbourhood later in the map
        .attr("id", function(d) { return "path_left_"+d.id; }) 
        .style("fill", function(d) {
          return color["left"](dataValue["leftValue"][d.id]); 
        })
        .style("opacity", 1)
        .on("mouseover", mouseOver)
        .on("mouseout", mouseOut)
        .on("click", mouseClicked);

  // Start appending path to the second choropleths
  g2 = svg_right.append("g")
        .attr("class", "path-borders")
        .attr("id", "rightG")
        .selectAll("path")
        .data(topodata) 
        .enter().append("path")
        .attr("d", path)
        // This is an important part as now each neighbourhood will have an ID, makes it easier for us to select a specific neighbourhood later in the map
        .attr("id", function(d) { return "path_right_"+d.id; })
        .style("fill", function(d) {
          return color["right"](dataValue["rightValue"][d.id]); 
        })
        .style("opacity", 1)
        .on("mouseover", mouseOver)
        .on("mouseout", mouseOut)
        .on("click", mouseClicked);
};

/*
  Function mouseOver will be called when the user moves the mouse over a particular neighbourhood
  At first, it will detect at which part of the area the mouse is currently at (left/right parts of the choropleth).
  And then, based on that position, two tooltips will be drawn in both the choropleths.
*/
function mouseOver(d,i)
{
  d3.select(this).transition().duration(200).style("opacity", 1);

  // Get the position of the mouse whether it is located in the left or right choropleth
  var mouseDiv = this.id.split("_")[1];
  console.log(mouseDiv);

  // Save the position of the left and right div
  var locationDivLeft = $("#left_column").position();
  var locationDivRight = $("#right_column").position();
  
  // There are two different logic depending whether the mouse is in the left or right column
  if(mouseDiv == "left")
  {
    // The first tooltip position will be a function of the X and Y position of the mouse
    divTooltipFirst.transition().duration(200).style("opacity", 1);
    divTooltipFirst.text(dataValue["leftId"][d.id] + " : " + dataValue["leftValue"][d.id])
      .style("left", (d3.event.pageX) + "px")
      .style("top", (d3.event.pageY - 30) + "px");
  
    // The second tooltip position will have an offset of the location of the left and right div
    divTooltipSecond.transition().duration(200).style("opacity", 1);
    divTooltipSecond.text(dataValue["rightId"][d.id] + " : " + dataValue["rightValue"][d.id])
      .style("left", (d3.event.pageX - locationDivLeft.left + locationDivRight.left) + "px")
      .style("top", (d3.event.pageY - 30 - locationDivLeft.top + locationDivRight.top) + "px");
  }

  else if(mouseDiv == "right")
  {
    // The first tooltip position will be a function of the X and Y position of the mouse
    divTooltipFirst.transition().duration(200).style("opacity", 1);
    divTooltipFirst.text(dataValue["rightId"][d.id] + " : " + dataValue["rightValue"][d.id])
      .style("left", (d3.event.pageX) + "px")
      .style("top", (d3.event.pageY - 30) + "px");

    // The second tooltip position will have an offset of the location of the left and right div
    divTooltipSecond.transition().duration(200).style("opacity", 1);
    divTooltipSecond.text(dataValue["leftId"][d.id] + " : " + dataValue["leftValue"][d.id])
      .style("left", (d3.event.pageX - locationDivRight.left + locationDivLeft.left) + "px")
      .style("top", (d3.event.pageY - 30 - locationDivRight.top + locationDivLeft.top) + "px");    
  }
}

// This function is called when the user move out their mouse from a particular neighbourhood
function mouseOut(d)
{
  d3.select(this).transition().duration(300).style("opacity", 0.8);
  divTooltipFirst.transition().duration(300).style("opacity", 0);
  divTooltipSecond.transition().duration(300).style("opacity", 0);
}

/*
  Function mouseClicked() will be called across different function in our implementation.
  Mouse click will trigger several actions : 
  1. Zoom into a particular neighbourhood
  2. Change the text of the Search Neighbourhood text-box
  3. Draw a linechart
  4. Draw a path on the scatterplot, and highlight points corresponding to the neighbourhood selected

  The click to zoom implementation is inspired from : https://bl.ocks.org/mbostock/2206590
*/
function mouseClicked(d)
{
  var x, y, k;
  selected = d.id;

  // Detect whether currently the state is already zoomed in or not.
  // Initially it starts from zoomed-out state
  if (d && centered != d) {
    var centroid = path.centroid(d);
    x = centroid[0];
    y = centroid[1];
    k = 3;
    centered = d;
    zoomState = 1;

    // Draw the linechart
    drawLinechart(selected,data_1,"left_line");
    drawLinechart(selected,data_2,"right_line"); 

    // Set the text on the Search Neigbourhood box
    $("#search").val(dataValue["leftId"][d.id]);   

    // Highlight circle on the scatterplot
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

  // If it is currently zoomed in, and the user click on the same area again, then it will be zoomed out
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

  // Inspired from this : http://stackoverflow.com/questions/10692100/invoke-a-callback-at-the-end-of-a-transition
  // However, we write our own implementation inside the callback
  g.transition().duration(700)
    .attr("transform", "translate(" + width/2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
    .on("end", function(d) { 
      // On end of transition, highlight the selected neighbourhood by adding bold orange stroke around it.
      if(zoomState == 1)
      {
        d3.select(this).style('stroke','#757575').style('stroke-width','0.5px');
        var select2 = "#"+"path_left_"+selected;

        d3.select(select2).raise().transition().duration(300)
          .style('stroke', '#F57F17')
          .style('stroke-width','2px');
      }
      // If it's zoomed out, "delete" the stroke and return it to the normal stroke
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
      // On end of transition, highlight the selected neighbourhood by adding bold orange stroke around it.      
      if(zoomState == 1)
      {
        d3.select(this).style('stroke','#757575').style('stroke-width','0.5px');
        var select = "#"+"path_right_"+selected;

        d3.select(select).raise().transition().duration(300)
          .style('stroke', '#F57F17')
          .style('stroke-width','2px');
      }
      // If it's zoomed out, "delete" the stroke and return it to the normal stroke      
      else
      {
        d3.select("#"+"path_right_"+selected).transition().duration(300)
          .style('stroke', '#757575')
          .style('stroke-width', '0.5px');        
      }
    });

  // Draw a path for a particular neighbourhood in the scatterplot
	scatter_path();
}

/*
  Function update() will be called everytime the user move the year's slider.
  It will trigger several action as follows : 
  1. Update and assign a new value for all variables related to the datasets used across function.
  2. Change the color and value of the choropleths
  yearSelected = year selected in the slider
  pos = left or right, the update() function will be called twice to update the left and right choropleths
  datadraw = whether we will update the first or second variables that the user initially selects.
*/
function update(yearSelected,pos,datadraw)
{
  var data_temp = dataset;

  for (var key in dataValue[pos+"Id"])
  {
    dataValue[pos+"Value"][key] = 0;
  }

  data_temp.forEach(function(d) {
    if(d.year == yearSelected)
    {
      dataValue[pos+"Value"][d.id] = +d[datadraw];
      dataValue[pos+"Id"][d.id] = d.name;
    }
  });

  // There are two separate logic for left and right because the "g" or "g2" that will be updated are different according to the left/right options
  if(pos == "left")
   {
    g = d3.select("#"+pos+"G")
    .selectAll("path")
    .each(function(d,i) {
      // For each path inside the choropleths, change its value and color
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
      // For each path inside the choropleths, change its value and color
      d3.select(this).transition().duration(300).style("fill", function(d){
        var mapValue = dataValue[pos+"Value"][d.id];
        if(mapValue == 0) { return "white"; }
        else { return color[pos](mapValue); }
      })
    });
  }    
}

/*
  Function drawLegend() is responsible for drawing the legend for the choropleths.
  dataVar = whether it is data_1 or data_2 (first or second variable selected by the user)
  pos = left/right, to indicate what position that needs to be updated
  We use D3.legend library to achieve this functionality : http://d3-legend.susielu.com/
*/
function drawLegend(dataVar,pos)
{
  var data_temp = dataset;
  var max = 0;
  var min = 100000;
  // Everytime, clean out the legend div first and draw the new one.
  $("#legend_"+pos).html("");

  // Logic to assign minimum and maximum value of the legend
  data_temp.forEach(function(d) {
    if(d[dataVar] > max && d[dataVar]>0 && d.year > 0)
    {
      max = +d[dataVar];
    }
    if(d[dataVar] < min && d[dataVar]>0 && d.year > 0)
    {
      min = +d[dataVar];
    }
  });

  // The jump in every ticks of the legend
  var tick = max/9;

  // Assign a color scheme of schemeGreens to the left choropleth and schemeBlues to the right one
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


//////////////////////////////////////////////////////////
///////// END OF CHOROPLETHS DRAWING LOGIC ///////////////
//////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////
// START OF LINECHARTS DRAWING LOGIC                   
// References on the internet are used but some modifications and logics are changed so that it matches our intention.
// 1. https://bl.ocks.org/mbostock/3883245
// 2. http://bl.ocks.org/d3noob/38744a17f9c0141bcd04
//////////////////////////////////////////////////////////

// Most of the functionality in this drawLinechart() function is inspired from the https://bl.ocks.org/mbostock/3883245
function drawLinechart(wijk,variable,div)
{
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

  // Draw a circle in every year
  gg.selectAll("dot")
    .data(dataset_line[div])
    .enter().append("circle")
    .attr("id", function(d) { return div+"_circle_"+d.year; }) 
    .attr("class", "class_circle")   
    .attr("r", function(d) {
      if(d.year == year) // Enlarge the circle corresponding to the year selected by the slider
      {
        return "6";
      }
      else
      {
        return "3";
      }      
    })
    .style("fill", function(d) { // Change the color to orange for the circle corresponding to the year selected by the slider
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
    .on("mouseover", lineTooltipOver) // Call lineTooltipOver below when the mouse is over the circle
    .on("mouseout", lineTooltipOut); // Call lineTooltipOut below when the mouse is moving out the circle
}

// Initialize the tooltip for the first line
var divTooltipLine1 = d3.select("body").append("div")   
  .attr("class", "tooltipLine")               
  .style("opacity", 0);

// Initialize the tooltip for the second line
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

  // Assign a new dictionary variable for easier variable selection
  dict[pos1] = {};
  dict[pos2] = {};
  dataset_line[pos1+"_line"].forEach(function(x) {
    dict[pos1][x.year] = x["value"];
  });
  dataset_line[pos2+"_line"].forEach(function(x) {
    dict[pos2][x.year] = x["value"];
  });

  // Reference from here : http://stackoverflow.com/questions/16256454/d3-js-position-tooltips-using-element-position-not-mouse-position
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

//////////////////////////////////////////////////////////
///////// END OF LINECHARTS DRAWING LOGIC ////////////////
//////////////////////////////////////////////////////////

