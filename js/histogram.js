class Histogram {
  constructor(_config, _data, _attributeLabel) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 500,
      containerHeight: _config.containerHeight || 140,
      margin: _config.margin || { top: 50, right: 50, bottom: 50, left: 80 },
      numBins: _config.numBins || 40,
      tooltipPadding: 10,
      tooltipTag: _config.tooltipTag || "#tooltip-histogram",
      disabledOpacity: 0.3,
      enabledOpacity: 1,
    };

    this.data = _data.objects.counties.geometries;
    this.active = d3.select(null);
    this.attributeLabel = _attributeLabel;
    this.setExpression((d) => {
      return false;
    });
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
      .attr("class", vis.config.parentElement + "-svg")
      .attr("class", "center-container")
      .attr("width", vis.config.containerWidth)
      .attr("height", vis.config.containerHeight);

    this.updateVis(); //leave this empty for now...
  }

  //  //leave this empty for now
  updateVis() {
    let vis = this;
    // clear the svg
    vis.svg.selectAll("*").remove();

    // Extract the values from the data
    const values = vis.data.map((d) => d.properties[vis.attributeLabel]);

    vis.brush = d3
      .brushX()
      .extent([
        [vis.config.margin.left, vis.config.margin.top],
        [
          vis.config.margin.left + vis.width,
          vis.height + vis.config.margin.top,
        ],
      ])
      .on("brush", (event) => {
        const extent = event.selection;
        extent[0] = extent[0] - vis.config.margin.left;
        extent[1] = extent[1] - vis.config.margin.left;

        let range = [
          vis.xScale.invert(extent[0]),
          vis.xScale.invert(extent[1]),
        ];
        attributeRanges[vis.attributeLabel] = range;
        //histogramBrushUpdate();
      })
      .on("end", (event) => {
        histogramBrushUpdate();
        if (!event.selection) {
          attributeRanges[vis.attributeLabel] = [];
          histogramBrushUpdate();
          this.updateVis();
        }
      });

    const brushG = vis.svg.append("g").attr("class", "brush").call(vis.brush);
    vis.xScale = d3
      .scaleLinear()
      .domain([0, d3.max(values)])
      .range([0, vis.width]);

    vis.histogram = d3
      .histogram()
      .domain(vis.xScale.domain())
      .thresholds(vis.xScale.ticks(vis.config.numBins));

    vis.bins = vis.histogram(values);

    // add all bins to the attributeRanges for filtering on update

    vis.yScale = d3
      .scaleLinear()
      .domain([0, d3.max(vis.bins, (d) => d.length)])
      .range([vis.height, 0]); // d3.hist has to be called before the Y axis obviously

    vis.chart = vis.svg
      .append("g")
      .attr(
        "transform",
        `translate(${vis.config.margin.left}, ${vis.config.margin.top})`
      );

    vis.colorScale = d3
      .scaleLinear()
      .domain([0, d3.max(vis.bins, (d) => d.length)])
      .range(colorRange)
      .interpolate(d3.interpolateHcl);

    // append the bar rectangles to the svg element
    vis.rects = vis.chart
      .append("g")
      .selectAll("rect")
      .data(vis.bins)
      .join("rect")
      .attr("x", 1)
      .attr(
        "transform",
        (d) =>
          "translate(" + vis.xScale(d.x0) + "," + vis.yScale(d.length) + ")"
      )
      .attr("width", (d) => {
        let r = vis.xScale(d.x1) - vis.xScale(d.x0) - 1;
        return r < 0 ? 0 : r; // if the width is negative, set it to 0
      })
      .attr("height", (d) => vis.height - vis.yScale(d.length))
      .attr("fill", (d) => {
        return vis.colorScale(d.length);
      })
      .attr("opacity", vis.config.enabledOpacity);

    vis.rects
      .on("mousemove", (event, d) => {
        d3.select(event.currentTarget)
          .transition()
          .duration(onTransitionDuration)
          .style("fill", accentColor);

        const x = event.pageX;
        const y = event.pageY;
        d3.select(vis.config.tooltipTag)
          .style("display", "block")
          .style("left", `${x + vis.config.tooltipPadding}px`)
          .style("top", `${y + vis.config.tooltipPadding}px`)
          .html(
            `<strong>${d.length}</strong> counties between <strong>${d.x0}</strong> and <strong>${d.x1}</strong>`
          );
      })
      .on("mouseout", (event, d) => {
        d3.select(vis.config.tooltipTag).style("display", "none");
        if (!d3.select(event.currentTarget).classed("active")) {
          d3.select(event.currentTarget)
            .transition()
            .duration(onTransitionDuration)
            .style("fill", (d) => {
              return vis.colorScale(d.length);
            });
        }
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
      .attr("font-weight", 500)
      .attr(
        "transform",
        `translate(${vis.width / 2}, ${
          vis.height + vis.config.margin.bottom - 15
        })`
      )
      .text(this.attributeLabel);

    // Y axis label:
    vis.chart
      .append("text")
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("font-weight", 500)
      .attr(
        "transform",
        `translate(${-vis.config.margin.left + 15}, ${
          vis.height / 2
        }) rotate(-90)`
      )
      .attr("dy", "1em")
      .text("Frequency");
    this.renderVis();
  }

  // //leave this empty for now...
  renderVis() {}

  setAttributeLabel(attributeLabel) {
    this.attributeLabel = attributeLabel;
    //this.data = cleanData(this.data, [this.attributeLabel]); // clean
  }

  changeAttribute(attributeLabel) {
    this.setAttributeLabel(attributeLabel);
  }

  changeColorRange(colorRange) {
    colorRange = colorRange;
  }

  changeNumBins(numBins) {
    this.config.numBins = numBins;
    attributeRanges[this.attributeLabel] = []; // reset the attributeRanges
    histogramBrushUpdate();
  }
  setExpression(expression) {
    this.expression = expression;
  }

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
}
