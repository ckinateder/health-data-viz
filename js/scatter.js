class ScatterPlot {
  constructor(_config, _data, _attributes) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 500,
      containerHeight: _config.containerHeight || 140,
      margin: _config.margin || { top: 50, right: 50, bottom: 50, left: 50 },
      tooltipPadding: 10,
    };

    this.data = _data.objects.counties.geometries;
    this.active = d3.select(null);
    this.attributes = _attributes;
    // Call a class function
    this.initVis();
  }

  initVis() {
    let vis = this;

    // Calculate inner chart size. Margin specifies the space around the actual chart.
    vis.width =
      vis.config.containerWidth -
      vis.config.margin.left -
      vis.config.margin.right;
    vis.height =
      vis.config.containerHeight -
      vis.config.margin.top -
      vis.config.margin.bottom;

    // Define size of SVG drawing area
    vis.svg = d3
      .select(vis.config.parentElement)
      .append("svg")
      .attr("class", "center-container")
      .attr("width", vis.config.containerWidth)
      .attr("height", vis.config.containerHeight);

    var borderPath = vis.svg
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("height", vis.config.containerHeight)
      .attr("width", vis.config.containerWidth)
      .style("stroke", "#999999")
      .style("fill", "none")
      .style("stroke-width", "1");

    vis.xScale = d3
      .scaleLinear()
      .domain([
        d3.min(this.data, (d) => d.properties[this.attributes[0]]),
        d3.max(this.data, (d) => d.properties[this.attributes[0]]),
      ])
      .range([0, vis.width]);

    vis.yScale = d3
      .scaleLinear()
      .domain([
        d3.min(this.data, (d) => d.properties[this.attributes[1]]),
        d3.max(this.data, (d) => d.properties[this.attributes[1]]),
      ])
      .range([vis.height, 0]);

    vis.chart = vis.svg
      .append("g")
      .attr(
        "transform",
        `translate(${vis.config.margin.left}, ${vis.config.margin.top})`
      );

    // translate these better
    vis.dots = vis.chart
      .append("g")
      .selectAll("dot")
      .data(this.data)
      .enter()
      .append("circle")
      .attr("cx", (d) => vis.xScale(d.properties[this.attributes[0]]))
      .attr("cy", (d) => vis.yScale(d.properties[this.attributes[1]]))
      .attr("r", 2)
      .attr("fill", (d) => {
        if (
          !isNaN(d.properties[this.attributes[0]]) &&
          !isNaN(d.properties[this.attributes[1]])
        ) {
          return "#aa0011";
        } else {
          return "url(#lightstripe)";
        }
      });

    vis.dots
      .on("mousemove", (d, event) => {
        const a1 = d.properties[this.attributes[0]]
          ? `<strong>${d.properties[this.attributes[0]]}</strong> ${
              this.attributes[0]
            }`
          : "No data available";
        const a2 = d.properties[this.attributes[1]]
          ? `<strong>${d.properties[this.attributes[1]]}</strong> ${
              this.attributes[1]
            }`
          : "No data available";
        const a3 = d.properties.name
          ? `<strong>${d.properties.name}</strong> County`
          : "No data available";

        const x = d3.event.pageX;
        const y = d3.event.pageY;

        d3
          .select("#tooltip-scatter")
          .style("display", "block")
          .style("left", `${x + vis.config.tooltipPadding}px`)
          .style("top", `${y + vis.config.tooltipPadding}px`).html(`
                              <div class="tooltip-title">${a3} County</div>
                              <div>${a1}</div>
                              <div>${a2}</div>
                            `);
      })
      .on("mouseleave", () => {
        d3.select("#tooltip-scatter").style("display", "none");
      });

    vis.xAxis = d3.axisBottom(vis.xScale);
    vis.yAxis = d3.axisLeft(vis.yScale);

    vis.xAxisGroup = vis.chart
      .append("g")
      .attr("class", "axis x-axis")
      .attr("transform", `translate(0, ${vis.height})`)
      .call(vis.xAxis);

    vis.yAxisGroup = vis.chart
      .append("g")
      .attr("class", "axis y-axis")
      .call(vis.yAxis);

    // Add X axis label:
    vis.chart
      .append("text")
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr(
        "transform",
        `translate(${vis.width / 2}, ${
          vis.height + vis.config.margin.bottom - 15
        })`
      )
      .text(this.attributes[0]);

    // Y axis label:
    vis.chart
      .append("text")
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr(
        "transform",
        `translate(${-vis.config.margin.left + 5}, ${
          vis.height / 2
        }) rotate(-90)`
      )
      .attr("dy", "1em")
      .text(this.attributes[1]);

    this.updateVis(); //leave this empty for now...
  }

  //  //leave this empty for now
  updateVis() {
    this.renderVis();
  }

  // //leave this empty for now...
  renderVis() {}
}
