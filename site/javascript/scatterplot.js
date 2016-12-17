var viewWidth = 500;
var viewHeight = 450;
d3.select(window).on("resize", resize);

var margin = {top: 20, right: 20, bottom: 30, left: 40};
var width = viewWidth - margin.left - margin.right;
var height = viewHeight - margin.top - margin.bottom;

var scatterplot_svg = d3.select("#scatterplot_svg")
    .attr("width", viewWidth)
    .attr("height", viewHeight)
    .attr("margin", "auto")
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var x = d3.scaleLinear()
  .range([0, width]);
var y = d3.scaleLinear()
  .range([height, 0]);

var xAxis = d3.axisBottom()
  .scale(x);
var yAxis = d3.axisLeft()
  .scale(y);

var boats = boat_data.boats;   

x.domain(d3.extent(boats, function(d) { return d.x; })).nice();
y.domain(d3.extent(boats, function(d) { return d.y; })).nice();

scatterplot_svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)
  .append("text")
    .attr("class", "label")
    .attr("x", width)
    .attr("y", -6)
    .style("text-anchor", "end")
    .text("x values");

scatterplot_svg.append("g")
    .attr("class", "y axis")
    .call(yAxis)
  .append("text")
    .attr("class", "label")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("y values")

var tooltip = d3.select(".tooltip");
var drawn = false;

d3.queue()
  .defer(d3.tsv, "resources/data_year.csv")
  .await(drawScatterplot);

var DATA = null;

function getDataForYear(year) {
  var result = [];
  for (var i = 0; i < DATA.length; i++) {
    if (DATA[i].year == year) {
      result.push(DATA[i]);
    }
  }
  return result;
}

function getAbsoluteValue(v) {
  if(v == null || v == NaN || v == "") {
    return 0;
  }
  return v;
}

function drawScatterplot(error, data) {
  DATA = data;
  //You can implement your scatterplot here

  //The svg is already defined, you can just focus on the creation of the scatterplot
  //you should at least draw the data points and the axes.
  console.log("Draw Scatterplot");
	
	dots = scatterplot_svg.selectAll(".dot")
		.data(getDataForYear(2005));

	dots.enter().append("circle")
	.attr("class", "dot")
	.attr("r", 3.5)
	.attr("cx", function(d) {return x(getAbsoluteValue(d["data1"]));})
	.attr("cy", function(d) {return y(getAbsoluteValue(d["data2"]));})
	.style("fill", '#2222aa')
  .on('mouseover', function(d) {
    d3.select(this).style("fill", '#aa2222');
    tooltip.transition().duration(200).style("opacity", 1);
    tooltip.text(getAbsoluteValue(d["data1"]) + ", " + getAbsoluteValue(d["data2"]))
      .style("left", (d3.event.pageX) + "px")
      .style("top", (d3.event.pageY - 30) + "px");
  })
  .on('mouseout', function(d) {
    d3.select(this).style("fill", '#2222aa');
    // d3.select(this).attr('class', function(d){return d.class})
    tooltip.transition().duration(300).style("opacity", 0);
  })

  drawn = true;
}

function updateScatterplot(year) {
  console.log("update Scatterplot " + year);
  
  dots = scatterplot_svg.selectAll(".dot")
    .data(getDataForYear(year));

  dots
  .transition()
  .duration(1000)
  .attr("class", "dot")
  .attr("r", 3.5)
  .attr("cx", function(d) {return x(getAbsoluteValue(d["data1"]));})
  .attr("cy", function(d) {return y(getAbsoluteValue(d["data2"]));})
  .style("fill", '#2222aa');
    
  //Additional tasks are given at the end of this file
}

function resize() {
  //This function is called if the window is resized
  //You can update your scatterplot here
  viewWidth = window.innerWidth;
  viewHeight = window.innerHeight;
}


//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
////////////////////    ADDITIONAL TASKS   ///////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
/*
Once that you have implemented your basic scatterplot you can work on new features
  * Color coding of the points based on a third attribute
  * Legend for the third attribute with color scale
  * Interactive selection of the 3 attributes visualized in the scatterplot
  * Resizing of the window updates the scatterplot
*/
