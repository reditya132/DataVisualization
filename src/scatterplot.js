var viewWidth = window.innerWidth;
var viewHeight = window.innerHeight;
d3.select(window).on("resize", resize);

var margin = {top: 20, right: 20, bottom: 30, left: 40};
var width = viewWidth - margin.left - margin.right;
var height = viewHeight - margin.top - margin.bottom;

var svg = d3.select("svg")
    .attr("width", viewWidth)
    .attr("height", viewHeight)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

function drawScatterplot() {
	var boats = boat_data.boats; 
  //You can implement your scatterplot here

  //The svg is already defined, you can just focus on the creation of the scatterplot
  //you should at least draw the data points and the axes.
  console.log("Draw Scatterplot");

  //The data can be found in the boat_data.boats variable
  //console.log(boat_data.boats); //IMPORTANT - Remove this, it is here just to show you how to access the data

  //You can start with a simple scatterplot that shows the x and y attributes in boat_data.boats
  
  // used http://bl.ocks.org/weiglemc/6185069
  // used http://bl.ocks.org/mbostock/3887118
	   
	var x = d3.scale.linear()
		.range([0, width]);
	var y = d3.scale.linear()
		.range([height, 0]);
	var color = d3.scale.category10();
	
	var xAxis = d3.svg.axis()
		.scale(x)
		.orient("bottom");
	var yAxis = d3.svg.axis()
		.scale(y)
		.orient("left");
		
	x.domain(d3.extent(boats, function(d) { return d.x; })).nice();
	y.domain(d3.extent(boats, function(d) { return d.y; })).nice();
	
	svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .append("text")
      .attr("class", "label")
      .attr("x", width)
      .attr("y", -6)
      .style("text-anchor", "end")
      .text("x values");

	svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("y values")
	
	svg.selectAll(".dot")
		.data(boats)
		.enter().append("circle")
		.attr("class", "dot")
		.attr("r", 3.5)
		.attr("cx", function(d) {return x(d.x);})
		.attr("cy", function(d) {return y(d.y);})
		.style("fill", color(1.0));
		
  //Additional tasks are given at the end of this file
}

function resize() {
  //This function is called if the window is resized
  //You can update your scatterplot here
  viewWidth = window.innerWidth;
  viewHeight = window.innerHeight;
}


drawScatterplot();


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
