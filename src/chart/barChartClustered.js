import * as d3 from "d3";
import { default as palette } from "../palette";
import { default as dataParse } from "../dataParse";
import { default as component } from "../component";

/**
 * Clustered Bar Chart (also called: Multi-set Bar Chart; Grouped Bar Chart)
 * @see http://datavizproject.com/data-type/grouped-bar-chart/
 */
export default function() {

  /**
   * Default Properties
   */
  let svg;
  let chart;
  let classed = "barChartClustered";
  let width = 400;
  let height = 300;
  let margin = { top: 20, right: 20, bottom: 20, left: 40 };
  let transition = { ease: d3.easeBounce, duration: 500 };
  let colors = palette.categorical(3);
  let dispatch = d3.dispatch("customValueMouseOver", "customValueMouseOut", "customValueClick", "customSeriesMouseOver", "customSeriesMouseOut", "customSeriesClick");

  /**
   * Chart Dimensions
   */
  let chartW;
  let chartH;

  /**
   * Scales
   */
  let xScale;
  let yScale;
  let colorScale;

  /**
   * Other Customisation Options
   */
  let yAxisLabel = null;

  /**
   * Initialise Data, Scales and Series
   */
  function init(data) {
    chartW = width - (margin.left + margin.right);
    chartH = height - (margin.top + margin.bottom);

    // Slice Data, calculate totals, max etc.
    let slicedData = dataParse(data);
    let groupNames = slicedData.groupNames;
    let maxValue = slicedData.maxValue;
    let categoryNames = slicedData.categoryNames;

    // If the colorScale has not been passed then attempt to calculate.
    colorScale = (typeof colorScale === "undefined") ?
      d3.scaleOrdinal().domain(categoryNames).range(colors) :
      colorScale;

    // X & Y Scales
    xScale = d3.scaleBand()
      .domain(groupNames)
      .rangeRound([0, chartW])
      .padding(0.1);

    yScale = d3.scaleLinear()
      .domain([0, maxValue])
      .range([chartH, 0])
      .nice();
  }

  /**
   * Constructor
   */
  function my(selection) {
    selection.each(function(data) {
      // Initialise Data
      init(data);

      // Create SVG and Chart containers (if they do not already exist)
      if (!svg) {
        svg = (function(selection) {
          let el = selection._groups[0][0];
          if (!!el.ownerSVGElement || el.tagName === "svg") {
            return selection;
          } else {
            return selection.append("svg");
          }
        })(d3.select(this));

        svg.classed("d3ez", true)
          .attr("width", width)
          .attr("height", height);

        chart = svg.append("g").classed("chart", true);
        chart.append("g").classed("xAxis axis", true);
        chart.append("g").classed("yAxis axis", true)
          .append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", -35)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          .text(yAxisLabel);
      } else {
        chart = selection.select(".chart");
      }

      // Update the chart dimensions
      chart.classed(classed, true)
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .attr("width", chartW)
        .attr("height", chartH);

      let barsVertical = component.barsVertical()
        .width(xScale.bandwidth())
        .height(chartH)
        .colorScale(colorScale)
        //.xScale(xScale)
        //.yScale(yScale)
        .dispatch(dispatch);

      // Create bar group
      let seriesGroup = chart.selectAll(".seriesGroup")
        .data(data);

      seriesGroup.enter()
        .append("g")
        .classed("seriesGroup", true)
        .attr("transform", function(d) { return "translate(" + xScale(d.key) + ", 0)"; })
        .merge(seriesGroup)
        .call(barsVertical);

      seriesGroup.exit()
        .remove();

      // Add X Axis to chart
      let xAxis = d3.axisBottom(xScale);
      chart.select(".xAxis")
        .attr("transform", "translate(0," + chartH + ")")
        .call(xAxis);

      // Add Y Axis to chart
      let yAxis = d3.axisLeft(yScale);
      chart.select(".yAxis")
        .call(yAxis);
    });
  }

  /**
   * Configuration Getters & Setters
   */
  my.width = function(_) {
    if (!arguments.length) return width;
    width = _;
    return this;
  };

  my.height = function(_) {
    if (!arguments.length) return height;
    height = _;
    return this;
  };

  my.margin = function(_) {
    if (!arguments.length) return margin;
    margin = _;
    return this;
  };

  my.yAxisLabel = function(_) {
    if (!arguments.length) return yAxisLabel;
    yAxisLabel = _;
    return this;
  };

  my.transition = function(_) {
    if (!arguments.length) return transition;
    transition = _;
    return this;
  };

  my.colors = function(_) {
    if (!arguments.length) return colors;
    colors = _;
    return this;
  };

  my.colorScale = function(_) {
    if (!arguments.length) return colorScale;
    colorScale = _;
    return this;
  };

  my.dispatch = function(_) {
    if (!arguments.length) return dispatch();
    dispatch = _;
    return this;
  };

  my.on = function() {
    let value = dispatch.on.apply(dispatch, arguments);
    return value === dispatch ? my : value;
  };

  return my;
}
