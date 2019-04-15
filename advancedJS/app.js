//define chart area
var svgWidth = 900;
var svgHeight = 500;

//define margins.
var margin = {
  top: 20,
  right: 120,
  bottom: 80,
  left: 100
};

var height = svgHeight - margin.top - margin.bottom;
var width  = svgWidth - margin.left - margin.right;

//create SVG wrapper, apend an SVG group that will hold our chart, and shift
//the latter by left and top margins
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight)
//  .append('g')
//  .attr("transform", `translate(${margin.left}, ${margin.top})`);

var chartGroup = svg.append("g")
.attr("transform", `translate(${margin.left}, ${margin.top})`);

//initial params
var chosenXAxis = "poverty";

//function used for updating x-scale var upon click on axis label
function xScale(censusData, chosenXAxis) {
  //create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(censusData, d => d[chosenXAxis]) * 0.8,
      d3.max(censusData, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);
  
return xLinearScale; 
}

//function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

//function used for updating circles group with a transition to new circles
function renderCircles(circlesGroup, newXScale, chosenXaxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));

  return circlesGroup;
}

//function used for updating circles group with new tooltip 
function updateToolTip(chosenXAxis, circlesGroup) {

  if (chosenXAxis === "poverty") {
    var label = "In Poverty";  
  }
  else {
    var label = "Household Income";
  }

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .html(function(data) {
      var state = data.state;
      var poverty = +data.poverty;
      var healthcare = +data.healthcare;
      return (state + '<br> Poverty Percentage: ' + poverty + '<br> Lacks Healthcare Percentage: ' + healthcare);
  });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })

    //onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
  console.log(circlesGroup);
}

//import data from data.csv
d3.csv("/data/data.csv", function(error, censusData) {
  if (error) throw error;

  console.log(censusData);
    
  //process csv file using a for loop.
  //for (var i = 0; i < censusData.length; i++) {
  //    console.log(i, censusData[i].state, censusData[i].poverty, censusData[i].healthcare);
  //    console.log(i, censusData[i].obesity, censusData[i].income, censusData[i].abbr);
  //  }

//testing code
function updateCircleText(chosenXAxis, circlesGroup) {

  if (chosenXAxis === "poverty") {
    var label = "In Poverty";  
  }
  else {
    var label = "Household Income";
  }

  var circleText = chartGroup.selectAll(".dot")
    .data(censusData)
    .enter()
    .append("text")
    .text(function(data) { return data.abbr; })
    .attr('x', function(data) {
      return xLinearScale(data.poverty);
    })
    .attr('y', function(data) {
      return yLinearScale(data.healthcare);
    })
    .attr("font-size", "10px")
    .attr("fill", "black")
    .attr("text-anchor", "middle");

    return circlesGroup;
}
//testing code


  //parse data    
  censusData.forEach(function(data) {
    data.poverty = +data.poverty;
    data.healthcare = +data.healthcare;
    data.income = +data.income; 
  });

  //xLinearScale function
  var xLinearScale = xScale(censusData, chosenXAxis);

  // Create y scale function
  var yLinearScale = d3.scaleLinear()
    .domain([0, d3.max(censusData, d => d.healthcare)])
    .range([height, 0]);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  chartGroup.append("g")
    .call(leftAxis);

  //append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
      .data(censusData)
      .enter()
      .append("circle")
      .attr('cx', d => xLinearScale(d[chosenXAxis]))
      .attr('cy', d => yLinearScale(d.healthcare))
      .attr("r", 12)
      .attr("fill", "green")
      .attr("opacity", ".5");
  
  //testing code   
  //append text State Abbr inside circles   
  //chartGroup.selectAll(".dot")
  //  .data(censusData)
  //  .enter()
  //  .append("text")
  //  .text(function(data) { return data.abbr; })
  //  .attr('x', function(data) {
  //    return xLinearScale(data.poverty);
  //  })
  //  .attr('y', function(data) {
  //    return yLinearScale(data.healthcare);
  //  })
  //  .attr("font-size", "10px")
  //  .attr("fill", "black")
  //  .attr("text-anchor", "middle");

  // Create group for  2 x- axis labels
  var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var povertyLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("In Poverty (%)");

  var incomeLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Household Income (median)");
  
  // append y axis
  chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .classed("axis-text", true)
    .text("Lacks Healthcare (%)");

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

  //testing code
  var circlesGroup = updateCircleText(chosenXAxis, circlesGroup);


  // x axis labels event listener
  labelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        console.log(chosenXAxis);

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(censusData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

        //testing code
        circlesGroup = updateCircleText(chosenXAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenXAxis === "income") {
          incomeLabel
            .classed("active", true)
            .classed("inactive", false);
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
});
