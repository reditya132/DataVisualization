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


var tip = d3.select('#scatterplot_vis')
      .append('div')
      .attr('class', 'tip')
      .html('I am a tooltip...')
      .style('border', '1px solid steelblue')
      .style('padding', '5px')
      .style('position', 'relative')
      .style('display', 'none')
      .style('background-color', 'yellow  ')
      .on('mouseover', function(d, i) {
        tip.transition().duration(0);
      })
      .on('mouseout', function(d, i) {
        tip.style('display', 'none');
      });

var drawn = false;

function drawScatterplot(year) {
  var year = (year - 2005) * 5;
	var boats = boat_data.boats; 
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
	   
	var x = d3.scaleLinear()
		.range([0, width]);
	var y = d3.scaleLinear()
		.range([height, 0]);
	var color = '#2222aa';
  var hoverColor = '#aa2222';
	
	var xAxis = d3.axisBottom()
		.scale(x);
	var yAxis = d3.axisLeft()
		.scale(y);
		
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
	
	dots = scatterplot_svg.selectAll(".dot")
		.data(boats);

  if (drawn) {
    dots.transition()
    .duration(1000)
    .attr("class", "dot")
    .attr("r", 3.5)
    .attr("cx", function(d) {return x(d.x - year);})
    .attr("cy", function(d) {return y(d.y - year * 2);})
    .style("fill", color);
  } else {
		dots.enter().append("circle")
		.attr("class", "dot")
		.attr("r", 3.5)
		.attr("cx", function(d) {return x(d.x - year);})
		.attr("cy", function(d) {return y(d.y - year * 2);})
		.style("fill", color)
    .on('mouseover', function() {
    d3.select(this).style("fill", hoverColor);
    })
    .on('mouseout', function() {
      d3.select(this).style("fill", color);
      // d3.select(this).attr('class', function(d){return d.class})
    })
    /*.on('click', function(d, i) {
      obj = d3.select(this);
      console.log("top: " + obj.style('cy') + " left: " + obj.style('cx'));
      tip.transition().duration(0);
      tip.style('top', y(d.y - year * 2) + 'px');
      tip.style('left', x(d.x - year) + 'px');
      //tip.style('cy', obj.style('cy'));
      //tip.style('cx', obj.style('cx'));
      //tip.style('top', obj.style('top'));
      //tip.style('left', obj.style('left'));
      //tip.style('top', y(d.y) - 20 + 'px');
      //tip.style('left', x(d.x) + 'px');
      tip.style('display', 'block');

      // fade out
      tip.transition()
      .delay(3000)
      .style('display', 'none');
    });
  */

    drawn = true;
  }

  dots.on('mouseover', function() {
    d3.select(this).style("fill", hoverColor);
  })
  .on('mouseout', function() {
    d3.select(this).style("fill", color);
    // d3.select(this).attr('class', function(d){return d.class})
  })
  /*.on('click', function(d, i) {
    obj = d3.select(this);
    console.log("top: " + obj.style('cy') + " left: " + obj.style('cx'));
    tip.transition().duration(0);
    tip.style('top', y(d.y - year * 2) + 'px');
    tip.style('left', x(d.x - year) + 'px');
    //tip.style('cy', obj.style('cy'));
    //tip.style('cx', obj.style('cx'));
    //tip.style('top', obj.style('top'));
    //tip.style('left', obj.style('left'));
    //tip.style('top', y(d.y) - 20 + 'px');
    //tip.style('left', x(d.x) + 'px');
    tip.style('display', 'block');

    // fade out
    tip.transition()
    .delay(3000)
    .style('display', 'none');
  });
*/
		
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
