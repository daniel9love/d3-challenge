var svgWidth = 960 * 1.25;
var svgHeight = 500 * 1.25;

var margin = {
  top: 25,
  right: 85,
  bottom: 80,
  left: 85
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3.select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// Updates x-scale var upon click on x-axis label
function xScale(census, chosenXAxis) {
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(census, d => d[chosenXAxis]) * 0.9,
      d3.max(census, d => d[chosenXAxis]) * 1.1])
    .range([0, width]);
  return xLinearScale;
}

// Updates y-scale var upon click on y-axis label
function yScale(census, chosenYAxis) {
  var yLinearScale = d3.scaleLinear()
    .domain([0, d3.max(census, d => d[chosenYAxis]) * 1.15])
    .range([height, 0]);
  return yLinearScale;
}

// Updates x-axis var upon click on x-axis label
function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// Updates y-axis var upon click on y-axis label
function renderYAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}

// Updates circles with transition (x-axis)
function renderCircles(circlesGroup, newXScale, chosenXAxis) {

  d3.selectAll(".circle").transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))

  return circlesGroup;
}

// Updates circles with transition (y-axis)
function changeCircles(circlesGroup, newYScale, chosenYAxis) {

  d3.selectAll(".circle").transition()
    .duration(1000)
    .attr("cy", d => newYScale(d[chosenYAxis]));

  return circlesGroup;
}

// Updates text on circles with transition (x-axis)
function renderText(textCircles, newXScale, chosenXAxis) {

  textCircles.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]) - 11);

  return textCircles;
}

// Updates text on circles with transition (y-axis)
function changeText(textCircles, newYScale, chosenYAxis) {

  textCircles.transition()
    .duration(1000)
    .attr("y", d => newYScale(d[chosenYAxis]) + 5);

  return textCircles;
}
// Updates circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
  // console.log(`TOOLTIP X: ${chosenXAxis}`); 
  // console.log(`TOOLTIP Y: ${chosenYAxis}`); 
  var label;
  var label2;
  // Parse through what data to display
  if (chosenXAxis === "poverty") {
    label = "In Poverty (%): ";
  }
  else if (chosenXAxis === "age") {
    label = "Median Age: ";
  }
  else if (chosenXAxis === "income") {
    label = "Median Income: ";
  }

  if (chosenYAxis === "healthcare") {
    label2 = "Lacks Healthcare: ";
  }
  else if (chosenYAxis === "smokes") {
    label2 = "Tobacco Users: ";
  }
  else if (chosenYAxis === "obesity") {
    label2 = "Obese Percentage: ";
  }
  // Update display data 
  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([0, 0])
    .html(function(d) {
      return (`${d.state}<br>${label}${d[chosenXAxis]}<br>${label2}${d[chosenYAxis]}%`);
    });

  d3.selectAll(".circle").call(toolTip);
  
  // Display data about each circle on scatter plot 
  d3.selectAll(".circle").on("mouseover", function(data) {
    toolTip.show(data);
  })
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

// Retrieve data from the CSV file
d3.csv("assets/data/data.csv").then(function(census, err) {
  if (err) throw err;
    
  // Convert data to integers
  census.forEach(function(data) {
    data.poverty = +data.poverty;
    data.age = +data.age;
    data.income = +data.income;
    data.obesity = +data.obesity;
    data.smokes = +data.smokes;
    data.healthcare = +data.healthcare
  });

  // xLinearScale function 
  var xLinearScale = xScale(census, chosenXAxis);

  // yLinearScale function
  var yLinearScale = yScale(census, chosenYAxis);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // Append x-axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // Append y-axis
  var yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    // .attr("transform", `translate(${width}, 0)`)
    .call(leftAxis);

  // Found help with this here: https://bl.ocks.org/Andrew-Reid/1a339c3b03e6cb77304cd9fb66ffc3c3
  var grabCircles = chartGroup.selectAll("circle")
    .data(census)
    .enter().append("g");

  // Append circles and text on scatter plot
  var circlesGroup = grabCircles.append("circle")
    .classed("circle", true)
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 20)
    .attr("fill", "#003300")
    .attr("opacity", ".65");
  
  var textCircles = grabCircles.append("text")
    .classed("stateABBR", true)
    .text(state => state.abbr)
    .attr("x", d => xLinearScale(d[chosenXAxis])-11)
    .attr("y", d => yLinearScale(d[chosenYAxis])+5)
    .attr("fill", "white");

  // Create group for multiple x-axis labels
  var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var povertyLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("In Poverty (%)");

  var ageLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age (Median)");
  
  var incomeLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Household Income (Median)");

  // Create group for multiple y-axis labels
  var ylabelsGroup = chartGroup.append("g")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - (margin.left/1.5))
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em");
    
  var healthcareLabel = ylabelsGroup.append("text")
    .attr("x", -225)
    .attr("y", -30)
    .attr("value", "healthcare") // value to grab for event listener
    .classed("active", true)
    .text("Lacks Healthcare (%)");

  var smokeLabel = ylabelsGroup.append("text")
    .attr("x", -225)
    .attr("y", -50)
    .attr("value", "smokes") // value to grab for event listener
    .classed("inactive", true)
    .text("Smokes (%)");

  var obeseLabel = ylabelsGroup.append("text")
    .attr("x", -225)
    .attr("y", -70)
    .attr("value", "obesity") // value to grab for event listener
    .classed("inactive", true)
    .text("Obese (%)");

  // UpdateToolTip function 
  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

  // X-axis labels event listener
  labelsGroup.selectAll("text").on("click", function() {
    // Grab value of input
    var value = d3.select(this).attr("value");
    if (value !== chosenXAxis) {

      // Replaces chosenXAxis with value
      chosenXAxis = value;
      console.log(chosenXAxis);

      // Update x scale for new data
      xLinearScale = xScale(census, chosenXAxis);

      // Update x axis with transition
      xAxis = renderAxes(xLinearScale, xAxis);

      // Update circles with new x values
      circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

      // Update circle text with new x values
      textCircles = renderText(textCircles, xLinearScale, chosenXAxis);

      // Update tooltips with new info
      circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

      // Change classes to active or inactive
      if (chosenXAxis === "age") {
        ageLabel
          .classed("active", true)
          .classed("inactive", false);
        povertyLabel
          .classed("active", false)
          .classed("inactive", true);
        incomeLabel
          .classed("active", false)
          .classed("inactive", true);
      }
      else if (chosenXAxis === "poverty") {
        ageLabel
          .classed("active", false)
          .classed("inactive", true);
        povertyLabel
          .classed("active", true)
          .classed("inactive", false);
        incomeLabel
          .classed("active", false)
          .classed("inactive", true); 
      }
      else if (chosenXAxis === "income") {
        ageLabel
          .classed("active", false)
          .classed("inactive", true);
        povertyLabel
          .classed("active", false)
          .classed("inactive", true);
        incomeLabel
          .classed("active", true)
          .classed("inactive", false);
      }
    }
  });
  // Y-axis labels event listener
  ylabelsGroup.selectAll("text").on("click", function() {
    // Grab value of input
    var value = d3.select(this).attr("value");
    if (value !== chosenYAxis) {

      // Replaces chosenYAxis with value
      chosenYAxis = value;
      console.log(chosenYAxis)

      // Update y scale for new data
      yLinearScale = yScale(census, chosenYAxis);

      // Update y axis with transition
      yAxis = renderYAxes(yLinearScale, yAxis);

      // Update circles with new y values
      circlesGroup = changeCircles(circlesGroup, yLinearScale, chosenYAxis);

      // Update circle text with new x values
      textCircles = changeText(textCircles, yLinearScale, chosenYAxis);

      // Update tooltips with new info
      circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

      // Change classes to active or inactive
      if (chosenYAxis === "healthcare") {
        healthcareLabel
          .classed("active", true)
          .classed("inactive", false);
        smokeLabel
          .classed("active", false)
          .classed("inactive", true);
        obeseLabel
          .classed("active", false)
          .classed("inactive", true);
      }
      else if (chosenYAxis === "smokes") {
        healthcareLabel
          .classed("active", false)
          .classed("inactive", true);
        smokeLabel
          .classed("active", true)
          .classed("inactive", false);
        obeseLabel
          .classed("active", false)
          .classed("inactive", true); 
      }
      else if (chosenYAxis === "obesity") {
        healthcareLabel
          .classed("active", false)
          .classed("inactive", true);
        smokeLabel
          .classed("active", false)
          .classed("inactive", true);
        obeseLabel
          .classed("active", true)
          .classed("inactive", false);
      }
    }
  });
}).catch(function(error) {
  console.log(error);
});
