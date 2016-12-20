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
	var canvas_height = 500;
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
		.attr("id", function(d) {
			return "scatter_"+d.id;
		})
		.attr("class", "circle_scatter")
		.attr("r", 5)
		.on("mouseover", function(d) {
			d3.select(this)
				.transition()
				.duration(100)
				.attr("fill", "red");
          	tooltip.transition()
               .duration(200)
               .style("opacity", .9);
            tooltip.html(d["name"] + "<br/> (" + d[data_1] 
	        + ", " + d[data_2] + ")")
               .style("left", (d3.event.pageX + 5) + "px")
               .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
			d3.select(this)
				.transition()
				.duration(100)
				.attr("fill", "black");
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
	var dict_dataset_scatter = {};
	dict_dataset_scatter[data_1] = {};
	dict_dataset_scatter[data_2] = {};
	dataset_year.forEach(function(x) {
		dict_dataset_scatter[data_1][x["id"]] = x[data_1];
		dict_dataset_scatter[data_2][x["id"]] = x[data_2];		
	});
	svgScatterplot.selectAll("circle")
		.each(function() {
			var cid = this.id.split("_")[1];
			d3.select(this)
				.transition()
				.duration(300)
				.attr("cx", function(d) {
					return xScale(dict_dataset_scatter[data_1][cid]);
				})
				.attr("cy", function(d) {
					return yScale(dict_dataset_scatter[data_2][cid]);
				});
		});
}