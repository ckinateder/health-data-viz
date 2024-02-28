class ScatterPlot {
  constructor(_config, _data, _attributeLabels) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 500,
      containerHeight: _config.containerHeight || 140,
      margin: _config.margin || { top: 50, right: 50, bottom: 50, left: 80 },
      tooltipPadding: 10,
      dot_color: "#0d003b",
      tooltipTag: _config.tooltipTag || "#tooltip-scatter",
      disabledOpacity: 0.3,
      enabledOpacity: 1,
      dotSize: 2,
    };

    this.data = _data.objects.counties.geometries;
    this.data = cleanData(this.data, _attributeLabels); // clean

    this.active = d3.select(null);
    this.setExpression((d) => {
      return false;
    }); // default expression
    // Call a class function
    this.initVis();

    this.brushOn = false;
  }

  initVis() {
    let vis = this;

    // Calculate inner chart size. Margin specifies the space around the actual chart.
    this.calculateSize();

    // Define size of SVG drawing area
    vis.svg = d3
      .select(vis.config.parentElement)
      .append("svg")
      .attr("class", vis.config.parentElement + "-svg")
      .attr("class", "center-container")
      .attr("width", vis.config.containerWidth)
      .attr("height", vis.config.containerHeight);

    this.updateVis(); //leave this empty for now...
  }

  //  //leave this empty for now
  updateVis() {
    let vis = this;
    vis.brush = d3
      .brush()
      .extent([
        [vis.config.margin.left, vis.config.margin.top],
        [
          vis.config.margin.left + vis.width,
          vis.height + vis.config.margin.top,
        ],
      ])
      .on("brush", (event) => {
        this.brushOn = true;
        let extent = event.selection;
        // apply margins to extent

        extent[0][0] = extent[0][0] - vis.config.margin.left;
        extent[0][1] = extent[0][1] - vis.config.margin.top;
        extent[1][0] = extent[1][0] - vis.config.margin.left;
        extent[1][1] = extent[1][1] - vis.config.margin.top;

        const xRange = [
          vis.xScale.invert(extent[0][0]),
          vis.xScale.invert(extent[1][0]),
        ];

        const yRange = [
          vis.yScale.invert(extent[0][1]),
          vis.yScale.invert(extent[1][1]),
        ];

        attributeRanges[attributeLabels[0]] = xRange;
        attributeRanges[attributeLabels[1]] = yRange;

        if (liveBrushing) scatterplotBrushUpdate();
      })
      .on("end", (event) => {
        scatterplotBrushUpdate();
        this.updateVis();
        if (!event.selection) {
          this.brushOn = false;
          attributeRanges = {};
          scatterplotBrushUpdate();
          this.updateVis();
        }
      });

    // clear the svg
    vis.svg.selectAll("*").remove();
    const brushG = vis.svg.append("g").attr("class", "brush").call(vis.brush);

    this.calculateSize();

    vis.xScale = d3
      .scaleLinear()
      .domain([
        d3.min(this.data, (d) => d.properties[attributeLabels[0]]),
        d3.max(this.data, (d) => d.properties[attributeLabels[0]]),
      ])
      .range([0, vis.width]);

    vis.yScale = d3
      .scaleLinear()
      .domain([
        d3.min(this.data, (d) => d.properties[attributeLabels[1]]),
        d3.max(this.data, (d) => d.properties[attributeLabels[1]]),
      ])
      .range([vis.height, 0]);

    vis.chart = vis.svg
      .append("g")
      .attr(
        "transform",
        `translate(${vis.config.margin.left}, ${vis.config.margin.top})`
      );

    vis.midColor = d3.interpolateHcl(colorRange[0], colorRange[1])(0.5);

    // translate these better
    vis.dots = vis.chart
      .append("g")
      .selectAll("dot")
      .data(this.data)
      .join("circle")
      .attr("cx", (d) => vis.xScale(d.properties[attributeLabels[0]]))
      .attr("cy", (d) => vis.yScale(d.properties[attributeLabels[1]]))
      .attr("r", this.config.dotSize)
      .attr("opacity", 0.8);

    vis.dots
      .transition()
      .duration(onTransitionDuration)
      .attr("fill", (d) => {
        if (checkRange(d)) {
          return accentColor;
        } else {
          return vis.midColor;
        }
      });

    vis.dots
      .on("mousemove", (event, d) => {
        const a1 = d.properties[attributeLabels[0]]
          ? `<strong>${d.properties[attributeLabels[0]]}</strong> ${
              attributeLabels[0]
            }`
          : "No data available";
        const a2 = d.properties[attributeLabels[1]]
          ? `<strong>${d.properties[attributeLabels[1]]}</strong> ${
              attributeLabels[1]
            }`
          : "No data available";
        const a3 = d.properties.name
          ? `<strong>${d.properties.name}</strong> County`
          : "No data available";

        const x = event.pageX;
        const y = event.pageY;

        d3
          .select(vis.config.tooltipTag)
          .style("display", "block")
          .style("left", `${x + vis.config.tooltipPadding}px`)
          .style("top", `${y + vis.config.tooltipPadding}px`).html(`
                              <div class="tooltip-title">${a3}</div>
                              <div>${a1}</div>
                              <div>${a2}</div>
                            `);

        // make the dot bigger
        d3.select(event.target)
          .transition()
          .duration(onTransitionDuration)
          .attr("r", 5)
          .attr("fill", accentColor)
          .attr("opacity", 1);
      })
      .on("mouseleave", (event, d) => {
        d3.select(vis.config.tooltipTag).style("display", "none");
        d3.select(event.target)
          .transition()
          .duration(offTransitionDuration)
          .attr("r", this.config.dotSize)
          .attr("fill", (d) => {
            if (checkRange(d)) {
              return accentColor;
            } else {
              return vis.midColor;
            }
          })
          .attr("opacity", 0.8);
      });

    vis.xAxis = d3.axisBottom(vis.xScale);
    vis.yAxis = d3.axisLeft(vis.yScale);

    vis.xAxisGroup = vis.chart
      .append("g")
      .attr("class", "axis x-axis")
      .attr("transform", `translate(0, ${vis.height})`)
      .call(vis.xAxis.ticks(6).tickFormat(d3.format(".3s")));

    vis.yAxisGroup = vis.chart
      .append("g")
      .attr("class", "axis y-axis")
      .call(vis.yAxis.tickFormat(d3.format(".3s")));

    // Add X axis label:
    vis.chart
      .append("text")
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("font-weight", 500)
      .attr(
        "transform",
        `translate(${vis.width / 2}, ${
          vis.height + vis.config.margin.bottom - 15
        })`
      )
      .text(attributeLabels[0]);

    // Y axis label:
    vis.chart
      .append("text")
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("font-weight", 500)
      .attr(
        "transform",
        `translate(${-vis.config.margin.left + 10}, ${
          vis.height / 2
        }) rotate(-90)`
      )
      .attr("dy", "1em")
      .text(attributeLabels[1]);
    this.renderVis();
  }

  // //leave this empty for now...
  renderVis() {}
  calculateSize() {
    let vis = this;

    vis.width =
      vis.config.containerWidth -
      vis.config.margin.left -
      vis.config.margin.right;
    vis.height =
      vis.config.containerHeight -
      vis.config.margin.top -
      vis.config.margin.bottom;
  }

  setDimensions(width, height) {
    this.config.containerWidth = width;
    this.config.containerHeight = height;
    this.calculateSize();
  }

  cleanData() {
    this.data = cleanData(this.data, attributeLabels);
  }

  setExpression(expression) {
    this.expression = expression;
  }

  changeColorRange(colorRange) {
    colorRange = colorRange;
  }

  setDotSize(dotSize) {
    this.config.dotSize = dotSize;
  }
}
