// Reference: http://bl.ocks.org/WilliamQLiu/bd12f73d0b79d70bfbae
// Reference: http://bl.ocks.org/weiglemc/6185069

var svgScatterplot;
var xScale;
var yScale;
var xAxis;
var YAxis;
var tooltip;

function drawScatterplot(){
	// Setup settings for graphic
	$("#scatterplot").html("");
	var canvas_width = 600;
	var canvas_height = 600;
	var padding = 60;  // for chart edges

	// Create scale functions
	xScale = d3.scaleLinear()  // xScale is width of graphic
				.domain([minVar1, maxVar1])
				.range([padding, canvas_width - padding * 2]); // output range

	yScale = d3.scaleLinear()  // yScale is height of graphic
				.domain([minVar2, maxVar2])
				.range([canvas_height - padding, padding]);  // remember y starts on top going down so we flip

	// Define X axis
	xAxis = d3.axisBottom()
				.scale(xScale);

	// Define Y axis
	yAxis = d3.axisLeft()
				.scale(yScale);

	// Create SVG element
	svgScatterplot = d3.select("#scatterplot")  // This is where we put our vis
	.append("svg")
	.attr("width", canvas_width)
	.attr("height", canvas_height)
	
	// add the tooltip area to the webpage
	tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

	// Create Circles
	svgScatterplot.selectAll("circle")
		.data(dataset_year)
		.enter()
		.append("circle")  // Add circle svg
		.attr("cx", function(d) {
			return xScale(d[data_1]);  // Circle's X
		})
		.attr("cy", function(d) {  // Circle's Y
			return yScale(d[data_2]);
		})
		.attr("r", 5)
		.on("mouseover", function(d) {
          tooltip.transition()
               .duration(200)
               .style("opacity", .9);
            tooltip.html(d["name"] + "<br/> (" + d[data_1] 
	        + ", " + d[data_2] + ")")
               .style("left", (d3.event.pageX + 5) + "px")
               .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
            tooltip.transition()
               .duration(500)
               .style("opacity", 0);
      });

	// Add to X axis
	svgScatterplot.append("g")
	.attr("class", "x axis")
	.attr("transform", "translate(0," + (canvas_height - padding) +")")
	.call(xAxis);

	// Add to Y axis
	svgScatterplot.append("g")
	.attr("class", "y axis")
	.attr("transform", "translate(" + padding +",0)")
	.call(yAxis);
}

function scatter_change(){
	// Update scale domains
	//xScale.domain([minVar1, maxVar1]);
	//yScale.domain([minVar2, maxVar2]);

	// Update circles
	svgScatterplot.selectAll("circle")
		.data(dataset_year)  // Update with new data
		.transition()  // Transition from old to new
		.duration(200)  // Length of animation
		//.ease("linear")  // Transition easing - default 'variable' (i.e. has acceleration), also: 'circle', 'elastic', 'bounce', 'linear'
		.attr("cx", function(d) {
			return xScale(d[data_1]);  // Circle's X
		})
		.attr("cy", function(d) {
			return yScale(d[data_2]);  // Circle's Y
		})
		.on("end", function() {  // End animation
			d3.select(this)  // 'this' means the current element
				.transition()
				.duration(500)
				.attr("fill", "black")  // Change color
				.attr("r", 5);  // Change radius
		})
		.on("mouseover", function(d) {
          tooltip.transition()
               .duration(200)
               .style("opacity", .9);
            tooltip.html(d["name"] + "<br/> (" + d[data_1] 
	        + ", " + d[data_2] + ")")
               .style("left", (d3.event.pageX + 5) + "px")
               .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
            tooltip.transition()
               .duration(500)
               .style("opacity", 0);
      });

	// Update X Axis
	svgScatterplot.select(".x.axis")
		.transition()
		.duration(1000)
		.call(xAxis);

	// Update Y Axis
	svgScatterplot.select(".y.axis")
		.transition()
		.duration(100)
		.call(yAxis);
}

function scatterTooltipOver(d)
{

}