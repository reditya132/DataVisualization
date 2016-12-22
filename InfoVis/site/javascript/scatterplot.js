// Reference: http://bl.ocks.org/WilliamQLiu/bd12f73d0b79d70bfbae
// Reference: http://bl.ocks.org/weiglemc/6185069
// Reference: https://bl.ocks.org/d3noob/6f082f0e3b820b6bf68b78f2f7786084

////////// DEFINITION OF GLOBAL VARIABLES FOR SCATTERPLOT ////////////
var svgScatterplot;
var xScale;
var yScale;
var xAxis;
var YAxis;
var tooltip;
var dict_dataset_scatter;
////////// END DEFINITION OF GLOBAL VARIABLES FOR SCATTERPLOT /////////

/* Draws the initial scatterplot including datapoints,mouse interactions and tooltip for the global year variable.*/
function drawScatterplot(){
	// calculate data
	dict_dataset_scatter = {};
	dict_dataset_scatter[data_1] = {};
	dict_dataset_scatter[data_2] = {};
	dataset_year.forEach(function(x) {
		dict_dataset_scatter[data_1][x["id"]] = x[data_1];
		dict_dataset_scatter[data_2][x["id"]] = x[data_2];		
	});	
	
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

	// Create Circles with mouse inteaction and tooltip
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
				.style("fill", function(d) {
					if(d.id != selected) { return "red"; }
					else { return "#F57F17"; }
				});
          	tooltip.transition()
               .duration(200)
               .style("opacity", .9);
            tooltip.html(d["name"] + "<br/> (" + dict_dataset_scatter[data_1][d.id]
	        	+ ", " + dict_dataset_scatter[data_2][d.id]+ ")")
               .style("left", (d3.event.pageX + 5) + "px")
               .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
			d3.select(this)
				.transition()
				.duration(100)
				.style("fill", function(d) {
					if(d.id != selected) { return "black"; }
					else { return "#F57F17"; }
				});
            tooltip.transition()
               .duration(500)
               .style("opacity", 0)
		})
		.on("click", function(d) {
	        for(var i in topodata)
	        {
	          if(topodata[i].id == d.id)
	          {
	            mouseClicked(topodata[i]);
	          }
	        }
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

/* Updates the points position. Can be used when the year has been changed for the scatterplot. */
function scatter_change(){
	// Update scale domains
	//xScale.domain([minVar1, maxVar1]);
	//yScale.domain([minVar2, maxVar2]);

	// Update circles data
	dict_dataset_scatter = {};
	dict_dataset_scatter[data_1] = {};
	dict_dataset_scatter[data_2] = {};
	dataset_year.forEach(function(x) {
		dict_dataset_scatter[data_1][x["id"]] = x[data_1];
		dict_dataset_scatter[data_2][x["id"]] = x[data_2];		
	});

	// Update circles by transition
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

// Computes path points, line and the path itselft for a selected district over time. And draws that in the scatterplot.
function scatter_path(){
	dataset_selected = [];
	dataset.forEach(function(d){
		// Store the data for one district over all years if there is a district selected
		// zoomState is a global variable which states wether a disctrict has been selected or not.
		if(zoomState == 1){
			if(d.id == selected){
				dataset_selected.push(d);
			}
		}
	});
  
	// Sort the data for one district on year (to make a path in the scatterplot).
	dataset_selected.sort(function(a,b) {return (a.year > b.year) ? 1 : ((b.year > a.year) ? -1 : 0);} );
	
	// Remove current line
	svgScatterplot.selectAll(".line").remove();

	// Define the line
	var valueline = d3.line()
		.x(function(d) { return xScale(d[data_1]); })
		.y(function(d) { return yScale(d[data_2]); });
		
	// Add the value line path.
	svgScatterplot.append("path")
		.data([dataset_selected])
		.attr("class", "line")
		.attr("d", valueline);
}

/* Computes and shows the correlation coefficient for all data points within the selected year.*/
function showCorrelationCoefficient(){
  correlationCoefficient = 0;
  var xMean = 0, yMean = 0, count = 0, CovXY = 0, VarX = 0, VarY = 0;
  // Sum the selected variable values.
  dataset.forEach(function(d){
    if(d.year == year){
	  count++;
	  xMean += +d[data_1];
	  yMean += +d[data_2];
    }
  });
  // Calculattion of means for the selected variables
  xMean = xMean/count;
  yMean = yMean/count;
  
  // Caclutation of Covariance(X,Y), Variance(X), Variance(Y)
  dataset_year.forEach(function(d){
	  CovXY += ((+d[data_1]) - xMean)*((+d[data_2]) - yMean);
	  VarX += Math.pow(((+d[data_1]) - xMean),2);
	  VarY += Math.pow(((+d[data_2]) - yMean),2);
  });
 
 // Computation of the correlation coefficient of X and Y.
  correlationCoefficient = CovXY / (Math.sqrt(VarX * VarY) );
  var roundedCC = Math.round(correlationCoefficient * 1000) / 1000;
  
  // Shows the value with some visual feedback of the amount of correlation.
  if(Math.abs(roundedCC) >= 0.66){
	$( "#correlationCoefficient" ).empty().append( "<span class='alert alert-success'>Correlation Coefficient: " + roundedCC + "</span>" );
  }
  else if(Math.abs(roundedCC) >= 0.33){
	$( "#correlationCoefficient" ).empty().append( "<span class='alert alert-warning'>Correlation Coefficient: " + roundedCC + "</span>" );
  }
  else{
	$( "#correlationCoefficient" ).empty().append( "<span class='alert alert-danger'>Correlation Coefficient: " + roundedCC + "</span>" );
  }
}