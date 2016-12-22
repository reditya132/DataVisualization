// slider function from jquery-ui
// it will create slider interface in the map page
$( function() {
  $( "#slider" ).slider({
    value:2005,
    min: 2000,
    max: 2016,
    step: 1,
    slide: function( event, ui ) {
      $( "#amount" ).val( " " + ui.value );
      update(ui.value);
      update2(ui.value);
    }
  });
  $( "#amount" ).val( " " + $( "#slider" ).slider( "value" ) );
} );

// references : http://bl.ocks.org/WilliamQLiu/bd12f73d0b79d70bfbae

var width = 400;
var height = 400;
var padding = 30;

// initial data 
var year='2010';
var data_1 = "data1";
var data_2 = "data2";

// create x scale functions
var xScale; // var A
returnMax(data_1, "left");

var yScale; // var B
returnMax(data_2, "right");

// define x axis
var xAxis = d3.svg.axis()
              .scale(xScale)
              .orient("bottom")
              .ticks(5);
              
function returnMax(dataVar,pos)
{
  d3.tsv("data_year.csv", function(error, data1) {
    var max = 0;
    var min = 100000;
    
    data1.forEach(function(d) {
      if(d.year > 0)
      {
        leftValue[d.id] = +d[dataVar];
        leftId[d.id] = d.name;
      }
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

    //if(pos == "left") { color = d3.scaleThreshold().domain(d3.range(0, max, tick)).range(d3.schemeGreens[9]); }
    if(pos == "left") { 
      xScale = d3.scaleLinear().domain([0, max]).range([padding, width - padding * 2]);
    }
    else if(pos == "right") {   
      yScale = d3.scaleLinear().domain([0, max]).range([height - padding, padding]);
    }
  });
}