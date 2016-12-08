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

function drawScatterplot(year) {
  var year = (year - 2005) * 5;
  //You can implement your scatterplot here

  //The svg is already defined, you can just focus on the creation of the scatterplot
  //you should at least draw the data points and the axes.
  console.log("Draw Scatterplot " + year);

  //The data can be found in the boat_data.boats variable
  //console.log(boat_data.boats); //IMPORTANT - Remove this, it is here just to show you how to access the data

  //You can start with a simple scatterplot that shows the x and y attributes in boat_data.boats
  
  // used http://bl.ocks.org/weiglemc/6185069
  // used http://bl.ocks.org/mbostock/3887118

  //var circles = svg.selectAll(".dot").data([]); //.selectAll('circles');
    
  //circles.exit().remove();
	
	dots = scatterplot_svg.selectAll(".dot")
		.data(boats);

  if (drawn) {
    dots.transition()
    .duration(1000)
    .attr("class", "dot")
    .attr("r", 3.5)
    .attr("cx", function(d) {return x(d.x - year);})
    .attr("cy", function(d) {return y(d.y - year * 2);})
    .style("fill", '#2222aa');
  } else {
		dots.enter().append("circle")
		.attr("class", "dot")
		.attr("r", 3.5)
		.attr("cx", function(d) {return x(d.x - year);})
		.attr("cy", function(d) {return y(d.y - year * 2);})
		.style("fill", '#2222aa')
    .on('mouseover', function(d) {
      d3.select(this).style("fill", '#aa2222');
      tooltip.transition().duration(200).style("opacity", 1);
      tooltip.text(d.x + ", " + d.y)
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
		
  //Additional tasks are given at the end of this file
}

function resize() {
  //This function is called if the window is resized
  //You can update your scatterplot here
  viewWidth = window.innerWidth;
  viewHeight = window.innerHeight;
}


drawScatterplot(2006);


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
