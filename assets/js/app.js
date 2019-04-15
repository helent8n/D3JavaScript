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

var chartGroup = svg.append("g")
.attr("transform", `translate(${margin.left}, ${margin.top})`);

//import data from data.csv
d3.csv("/data/data.csv", function(error, censusData) {
  if (error) throw error;
  //print data to console
  console.log(censusData);

//parse data    
censusData.forEach(function(data) {
  data.poverty = +data.poverty;
  data.healthcare = +data.healthcare;
  data.income = +data.income; 
});

//create x scale functions
var xLinearScale = d3.scaleLinear()
  .domain([d3.min(censusData, d => d.poverty) * 0.8,
   d3.max(censusData, d => d.poverty) * 1.2])
  .range([0, width]);

//create y scale function
var yLinearScale = d3.scaleLinear()
  .domain([0, d3.max(censusData, d => d.healthcare)])
  .range([height, 0]);

//create axis functions
var bottomAxis = d3.axisBottom(xLinearScale);
var leftAxis = d3.axisLeft(yLinearScale);

// append axes to chart
chartGroup.append("g")
  .attr("transform", `translate(0, ${height})`)
  .call(bottomAxis);

chartGroup.append("g")
  .call(leftAxis);

//create tool tip
var toolTip = d3.tip()
  .attr("class", "tooltip")
  .offset([80, -60])
  .html(function(data) {
      var state = data.state;
      var poverty = +data.poverty;
      var healthcare = +data.healthcare;
      return (state + '<br> Poverty: ' + poverty + '%' + '<br> Lacks Healthcare: ' + healthcare + '%');
  });

//create tooltip in the chart
chartGroup.call(toolTip);    

//generate scatter plot 
//var circlesGroup = chartGroup.selectAll("circle")
chartGroup.selectAll("circle")
  .data(censusData)
  .enter()
  .append("circle")
  .attr('cx', d => xLinearScale(d.poverty))
  .attr('cy', d => yLinearScale(d.healthcare))
  .attr("r", 12)
  .attr("fill", "green")
  .attr("opacity", ".5")
  .on("mouseover",function(data) {
    toolTip.show(data);
  })
  // Hide and Show on mouseout
  .on("mouseout", function(data, index) {
    toolTip.hide(data);
  });

//append text inside circle
chartGroup.selectAll(".dot")
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

// Create axes labels
chartGroup.append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", 0 - margin.left + 40)
  .attr("x", 0 - (height / 2))
  .attr("dy", "1em")
  .attr("class", "axisText")
  .text("Lacks Healthcare (%)");

chartGroup.append("text")
  .attr("transform", `translate(${width / 2}, ${height + margin.top + 30})`)
  .attr("class", "axisText")
  .text("In Poverty (%)");

});

