import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

import globalTemperature from "./data/globalTemperature.js";

// derived from https://www.esri.com/arcgis-blog/products/arcgis-pro/mapping/a-meaningful-temperature-palette/
const tempColors = [
  "#254f77",
  "#275b80",
  "#27678a",
  "#287593",
  "#438190",
  "#648d89",
  "#879a84",
  "#aba87d",
  "#c2ac73",
  "#c19d61",
  "#c38a53",
  "#be704c",
  "#be704c",
];

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const baseTemp = globalTemperature.baseTemperature;
const dataset = globalTemperature.monthlyVariance;
const h = 700;
const padding = 60;
const w = 1200;
const cellHeight = (h + 2 * padding) / 12;

function dateFromDataMonth(dataMonth) {
  const date = new Date();
  date.setMonth(dataMonth - 1);
  return date;
}

const xScale = d3
  .scaleLinear()
  .domain([d3.min(dataset, (d) => d.year) - 1, d3.max(dataset, (d) => d.year)])
  .range([padding, w - padding]);

const yScale = d3
  .scaleLinear()
  .domain([0, 11])
  .range([h - padding, padding]);

const xAxis = d3.axisBottom(xScale).tickFormat(d3.format(".4"));

const yAxis = d3.axisLeft(yScale).tickFormat((month) => {
  const date = new Date();
  date.setMonth(month);
  return d3.timeFormat("%B")(date);
});

const svg = d3
  .select("#graph-container")
  .append("svg")
  .attr("width", w)
  .attr("height", h);

svg
  .append("g")
  .attr("transform", `translate(0,${h - padding})`)
  .attr("id", "x-axis")
  .call(xAxis);

svg
  .append("g")
  .attr("transform", `translate(${padding}, 0)`)
  .attr("id", "y-axis")
  .call(yAxis);

let minVariance = 0;
let maxVariance = 0;
for (let i = 0; i < dataset.length; i++) {
  if (dataset[i].variance < minVariance) minVariance = dataset[i].variance;
  if (dataset[i].variance > maxVariance) maxVariance = dataset[i].variance;
}

console.log(minVariance);
console.log(maxVariance);

svg
  .selectAll("rect")
  .data(dataset)
  .enter()
  .append("rect")
  .attr("x", (d) => xScale(d.year))
  .attr("y", (d) => yScale(d.month - 1) - cellHeight)
  .attr(
    "width",
    (d) =>
      (w - 2 * padding) /
      (d3.max(dataset, (d) => d.year) - d3.min(dataset, (d) => d.year))
  )
  .attr("height", cellHeight)
  .attr("fill", (d) => tempColors[Math.floor(baseTemp + d.variance - 1.6)])
  .attr("class", "cell")
  .attr("data-year", (d) => d.year)
  .attr("data-month", (d) => dateFromDataMonth(d.month).getMonth())
  .attr("data-temp", (d) => baseTemp + d.variance);

const legendHeight = 75;
const legendWidth = legendHeight * 12;

const legendSvg = d3
  .select("#legend-svg-container")
  .append("svg")
  .attr("height", legendHeight)
  .attr("width", legendWidth);

legendSvg
  .selectAll("rect")
  .data(tempColors)
  .enter()
  .append("rect")
  .attr("height", legendHeight)
  .attr("width", legendHeight)
  .attr("x", (_, i) => i * legendHeight)
  .attr("fill", (d) => d);

const tooltip = d3
  .select("body")
  .data(dataset)
  .append("div")
  .attr("class", "tooltip")
  .attr("id", "tooltip");

svg
  .selectAll("rect")
  .on("mouseover", (_, d) => {
    tooltip.transition().duration(200).style("opacity", 0.9);
    tooltip.html(
      `${months[d.month - 1]} ${d.year}<br>${(baseTemp + d.variance).toFixed(
        2
      )}℃`
    );
    tooltip.attr("data-year", d.year);
    tooltip
      .style("left", event.pageX + 20 + "px")
      .style("top", event.pageY + 20 + "px");
  })
  .on("mouseout", (d) => {
    tooltip.transition().duration(400).style("opacity", 0);
  });
