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



// easy autocomplete
var options = {
  url: "buurt.json",
  getValue: "name", 
  list: {
    onClickEvent: function() {
      d3.json('../map/topo_real_map.json', function(error, map) {
        var code = $("#provider-json").getSelectedItemData().code;
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

$("#provider-json").easyAutocomplete(options);


// initialize the width and height of the map
var width = 550;
var height = 500;
var centered;

// initialize the data with pre-selected value to draw the map
var year='2010';
var data_1 = "Bevtotaal";
var data_2 = "Wkoop";

// setting color domain for the left div
// var color = d3.scaleThreshold().domain(d3.range(-0.2, 1, 0.15)).range(d3.schemeGreens[7]);
var color = "";
returnMax(data_1, "left");

// setting color domain for the right div
// var color2 = d3.scaleThreshold().domain(d3.range(-0.2, 1, 0.15)).range(d3.schemeBlues[7]);
var color2 = "";
returnMax(data_2, "right");

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
  .attr("id", "legendLeft");


// initialize the svg in the right column
var svg_right = d3.select("#right_column").append("svg")
  .attr("width", width)
  .attr("height", height);

var legendRight = d3.select("#right_column").append("svg")
  .attr("width", width)
  .attr("height", 50)
  .attr("id", "legendRight");


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
  .defer(d3.tsv, "data_year_2.csv")
  .await(queueLeft);

d3.queue()
  .defer(d3.json, "../map/topo_real_map.json")
  .defer(d3.tsv, "data_year_2.csv")
  .await(queueRight);

// initialize some variables for the first option that user choose
var leftValue = {};
var leftId = {};
var leftRange = {};

// initialize some variables for the second option that user choose
var rightValue = {};
var rightId = {};
var rightRange = {};

// initialize variable for the svg selector g
// g = left column
// g2 = right column
var g;
var g2;

// function queueLeft is called after the queue above
function queueLeft(error, map, data) {
  var max = 0;
  var min = 100000;
  
  // save corresponding map data for the variable that user choose
  // at first, it will choose the minimum year that the data is available
  data.forEach(function(d) {
    if(d.year == year)
    {
      leftValue[d.id] = +d[data_1];
      leftId[d.id] = d.name;
    }
    if(d[data_1] > max && d[data_1]>0 && d.year == year)
    {
      max = +d[data_1];
    }
    if(d[data_1] < min && d[data_1]>0 && d.year == year)
    {
      min = +d[data_1];
    }
  });

  data.forEach(function(d) {
    if( d.year == year) { leftRange[d.id] = (d[data_1]-min)/(max-min); }
  });

//
  g = svg.append("g")
        .attr("class", "path-borders")
        .attr("id", "leftG")        
        .selectAll("path")
        .data(topojson.feature(map, map.objects.new_wijk_water).features) 
        .enter().append("path")
        .attr("d", path)
        .attr("id", function(d) { return "pathLeft"+d.id; })
        .style("fill", function(d) {
          return color(leftValue[d.id]); 
        })
        .style("opacity", 1)
        .on("mouseover", mouseOver)
        .on("mouseout", mouseOut)
        .on("click", mouseClicked);

  //g.transition().duration(100).style("opacity", 1);

};

function queueRight(error, map, data) {
   //var leftValue = {};
   //var leftId = {};
  var max2 = 0;
  var min2 = 10000000000;

   data.forEach(function(d) {
    if(d.year == year)
    {
        rightValue[d.id] = +d[data_2];
        rightId[d.id] = d.name;
    }
    if(d[data_2] > max2 && d[data_2] > 0 && d.year == year)
    {
      max2 = +d[data_2];
    }
    if(d[data_2] < min2 && d[data_2] > 0 && d.year == year)
    {
      min2 = +d[data_2];
    }
  });

  console.log(year);

  data.forEach(function(d) {
    if(d.year == year) { rightRange[d.id] = (d[data_2]-min2)/(max2-min2); }
  });

//
  g2 = svg_right.append("g")
        .attr("class", "path-borders")
        .attr("id", "rightG")
        .selectAll("path")
        .data(topojson.feature(map, map.objects.new_wijk_water).features) 
        .enter().append("path")
        .attr("d", path)
        .attr("id", function(d) { return "pathRight"+d.id; })
        .style("fill", function(d) {
          return color2(rightValue[d.id]); 
        })
        .style("opacity", 1)
        .on("mouseover", mouseOver)
        .on("mouseout", mouseOut)
        .on("click", mouseClicked);

  //g2.transition().duration(100).style("opacity", 1);
};

function mouseOver(d,i)
{
  d3.select(this).transition().duration(200).style("opacity", 1);
  
  // get the name of the div where the mouse position is located
  var arr = allElementsFromPoint(d3.event.pageX, d3.event.pageY);
  var mouseDiv = arr[3].id;
  //console.log(mouseDiv);
  var locationDivLeft = $("#left_column").position();
  var locationDivRight = $("#right_column").position();
  
  // reference : http://stackoverflow.com/questions/17917072/choropleth-maps-changing-stroke-color-in-mouseover-shows-overlapping-boundari
  //console.log(this.parentNode.appendChild(this));
  //console.log(this.parentNode);
  //console.log(arr[5]);

  /*d3.select("#"+"pathLeft"+d.id).transition().duration(300)
    .style('stroke', '#F00');

  d3.select("#"+"pathRight"+d.id).transition().duration(300)
    .style('stroke', '#F00');*/


  if(mouseDiv == "left_column")
  {
    divTooltipFirst.transition().duration(200).style("opacity", 1);
    divTooltipFirst.text(leftId[d.id] + " : " + leftValue[d.id])
      .style("left", (d3.event.pageX) + "px")
      .style("top", (d3.event.pageY - 30) + "px");
  
    divTooltipSecond.transition().duration(200).style("opacity", 1);
    divTooltipSecond.text(rightId[d.id] + " : " + rightValue[d.id])
      .style("left", (d3.event.pageX - locationDivLeft.left + locationDivRight.left) + "px")
      .style("top", (d3.event.pageY - 30 - locationDivLeft.top + locationDivRight.top) + "px");
  }

  else if(mouseDiv == "right_column")
  {
    divTooltipFirst.transition().duration(200).style("opacity", 1);
    divTooltipFirst.text(rightId[d.id] + " : " + rightValue[d.id])
      .style("left", (d3.event.pageX) + "px")
      .style("top", (d3.event.pageY - 30) + "px");
  
    divTooltipSecond.transition().duration(200).style("opacity", 1);
    divTooltipSecond.text(leftId[d.id] + " : " + leftValue[d.id])
      .style("left", (d3.event.pageX - locationDivRight.left + locationDivLeft.left) + "px")
      .style("top", (d3.event.pageY - 30 - locationDivRight.top + locationDivLeft.top) + "px");    
  }
}

function mouseOut(d)
{
  d3.select(this).transition().duration(300).style("opacity", 0.8);
  divTooltipFirst.transition().duration(300).style("opacity", 0);
  divTooltipSecond.transition().duration(300).style("opacity", 0);
  /*d3.select("#"+"pathLeft"+d.id).transition().duration(300)
    .style('stroke', '#757575');

  d3.select("#"+"pathRight"+d.id).transition().duration(300)
    .style('stroke', '#757575');*/
}

function mouseClicked(d)
{
  var x, y, k;
  var zoomState;
  if (d && centered != d) {
    var centroid = path.centroid(d);
    x = centroid[0];
    y = centroid[1];
    k = 3;
    centered = d;
    zoomState = 1;
  }
  else {
    x = width / 2;
    y = height / 2;
    k = 1;
    centered = null;
    zoomState = 0;
  }

  g.selectAll("path")
    .classed("active", centered && function(d) {
      return d === centered;
    });

  g2.selectAll("path")
    .classed("active", centered && function(d) {
      return d === centered;
    });

  var selected = d.id;
  console.log(d);
  // inspired from this : http://stackoverflow.com/questions/10692100/invoke-a-callback-at-the-end-of-a-transition
  g.transition().duration(700)
    .attr("transform", "translate(" + width/2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
    .on("end", function(d) { 
      if(zoomState == 1)
      {
        d3.select(this).style('stroke','#757575').style('stroke-width','0.5px');
        var select2 = "#"+"pathLeft"+selected;
        var y = $("#leftG");
        y.find(select2).appendTo(y);
        //var select = d3.select(this.select("#"+"pathRight"+selected);
        d3.select(select2).transition().duration(300)
          .style('stroke', '#F57F17')
          .style('stroke-width','2px');
      }
      else
      {
        d3.select("#"+"pathLeft"+selected).transition().duration(300)
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
        var select = "#"+"pathRight"+selected;
        var x = $("#rightG");
        x.find(select).appendTo(x);
        //var select = d3.select(this.select("#"+"pathRight"+selected);
        d3.select(select).transition().duration(300)
          .style('stroke', '#F57F17')
          .style('stroke-width','2px');
      }
      else
      {
        d3.select("#"+"pathRight"+selected).transition().duration(300)
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

function update(year1)
{
  d3.tsv("data_year_2.csv", function(error, data1) {
    var max = 0;
    var min = 100000;

    for (var key in leftId)
    {
      leftValue[key] = 0;
    }
    
    data1.forEach(function(d) {
      if(d.year == year1)
      {
        leftValue[d.id] = +d[data_1];
        leftId[d.id] = d.name;
      }
      if(d[data_1] > max && d[data_1]>0 && d.year == year1)
      {
        max = +d[data_1];
      }
      if(d[data_1] < min && d[data_1]>0 && d.year == year1)
      {
        min = +d[data_1];
      }
    });

    data1.forEach(function(d) {
      if( d.year == year) { leftRange[d.id] = (d[data_1]-min)/(max-min); }
    });   
     g = d3.select("#leftG")
      .selectAll("path")
      .each(function(d,i) {
        d3.select(this).transition().duration(200).style("fill", function(d){
          var mapValue = leftValue[d.id];
          if(mapValue == 0) { return "white"; }
          else { return color(mapValue); }
        })
      });
  });
}

function update2(year1)
{
  d3.tsv("data_year_2.csv", function(error, data1) {
    var max = 0;
    var min = 100000;

    for (var key in rightId)
    {
      rightValue[key] = 0;
    }    
    
    data1.forEach(function(d) {
      if(d.year == year1)
      {
        rightValue[d.id] = +d[data_2];
        rightId[d.id] = d.name;
      }
      if(d[data_2] > max && d[data_2]>0 && d.year == year1)
      {
        max = +d[data_2];
      }
      if(d[data_2] < min && d[data_2]>0 && d.year == year1)
      {
        min = +d[data_2];
      }
    });

    data1.forEach(function(d) {
      if( d.year == year) { rightRange[d.id] = (d[data_2]-min)/(max-min); }
    });   
     g2 = d3.select("#rightG")
      .selectAll("path")
      .each(function(d,i) {
        d3.select(this).transition().duration(200).style("fill", function(d){
          var mapValue = rightValue[d.id];
          if(mapValue == 0) { return "white"; }
          else { return color2(mapValue); }
        })
      });
  });
}

function returnMax(dataVar,pos)
{
  d3.tsv("data_year_2.csv", function(error, data1) {
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
      color = d3.scaleThreshold().domain(d3.range(0, max, tick)).range(d3.schemeGreens[9]);
      var ssvg = d3.select("#legendLeft");

      ssvg.append("g")
        .attr("class", "legendLinear")
        .attr("transform", "translate(100,10)");

      var legendLinear = d3.legendColor()
        .shapeWidth(35)
        .orient('horizontal')
        .scale(color);

      ssvg.select(".legendLinear")
        .call(legendLinear);

      }
    else if(pos == "right") { 
      color2 = d3.scaleThreshold().domain(d3.range(0, max, tick)).range(d3.schemeBlues[9]); 
      var ssvg = d3.select("#legendRight");

      ssvg.append("g")
        .attr("class", "legendLinear")
        .attr("transform", "translate(100,10)");

      var legendLinear = d3.legendColor()
        .shapeWidth(35)
        .orient('horizontal')
        .scale(color2);

      ssvg.select(".legendLinear")
        .call(legendLinear);
    }
  });
}


