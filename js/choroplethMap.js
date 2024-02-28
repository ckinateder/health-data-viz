class ChoroplethMap {
  /**
   * Class constructor with basic configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _data, _attributeLabels) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 1000,
      containerHeight: _config.containerHeight || 650,
      margin: _config.margin || { top: 30, right: 0, bottom: 50, left: 0 },
      tooltipPadding: 10,
      tooltipTag: _config.tooltipTag || "#tooltip-choropleth",
    };
    this.data = _data;
    // this.config = _config;
    this.us = _data;
    this.active = d3.select(null);

    this.initVis();
  }

  /**
   * We initialize scales/axes and append static elements, such as axis titles.
   */
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

    // is this necessary
    vis.svg
      .append("rect")
      .attr("class", "background center-container")
      .attr("height", vis.config.containerWidth) //height + margin.top + margin.bottom)
      .attr("width", vis.config.containerHeight) //width + margin.left + margin.right)
      .on("click", vis.clicked);

    vis.projection = d3
      .geoAlbersUsa()
      .translate([vis.width / 2, vis.height / 2])
      .scale(vis.width);

    vis.colorScale = d3
      .scaleLinear()
      .domain(
        d3.extent(
          vis.data.objects.counties.geometries,
          (d) => d.properties[attributeLabels[0]]
        )
      )
      .range(colorRange)
      .interpolate(d3.interpolateHcl);

    vis.path = d3.geoPath().projection(vis.projection);

    vis.g = vis.svg
      .append("g")
      .attr("class", "center-container center-items us-state")
      .attr(
        "transform",
        "translate(" +
          vis.config.margin.left +
          "," +
          vis.config.margin.top +
          ")"
      )
      .attr(
        "width",
        vis.width + vis.config.margin.left + vis.config.margin.right
      )
      .attr(
        "height",
        vis.height + vis.config.margin.top + vis.config.margin.bottom
      );

    vis.counties = vis.g
      .append("g")
      .attr("id", "counties")
      .selectAll("path")
      .data(topojson.feature(vis.us, vis.us.objects.counties).features)
      .join("path")
      .attr("d", vis.path);

    vis.states = vis.g
      .append("path")
      .datum(
        topojson.mesh(vis.us, vis.us.objects.states, function (a, b) {
          return a !== b;
        })
      )
      .attr("id", "state-borders")
      .attr("d", vis.path);

    this.updateVis();
  }
  updateVis() {
    let vis = this;

    vis.svg.selectAll("text").remove();

    vis.colorScale = d3
      .scaleLinear()
      .domain(
        d3.extent(
          vis.data.objects.counties.geometries,
          (d) => d.properties[attributeLabels[0]]
        )
      )
      .range(colorRange)
      .interpolate(d3.interpolateHcl);

    vis.counties
      .transition()
      .duration(200)
      .attr("fill", (d) => {
        if (
          d.properties[attributeLabels[0]] !== undefined &&
          d.properties[attributeLabels[0]] !== -1
        ) {
          if (checkRange(d)) {
            return accentColor;
          } else {
            return vis.colorScale(d.properties[attributeLabels[0]]);
          }
        } else {
          return "url(#lightstripe)";
        }
      });

    vis.counties
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

        d3
          .select(vis.config.tooltipTag)
          .style("display", "block")
          .style("left", `${event.pageX + vis.config.tooltipPadding}px`)
          .style("top", `${event.pageY + vis.config.tooltipPadding}px`).html(`
                        <div class="tooltip-title">${d.properties.name} County</div>
                        <div>${a1}</div>
                        <div>${a2}</div>
                      `);

        d3.select(event.target)
          .transition()
          .duration(0)
          .attr("fill", accentColor);
      })
      .on("mouseleave", (event, d) => {
        d3.select(vis.config.tooltipTag).style("display", "none");
        d3.select(event.target)
          .transition()
          .duration(onTransitionDuration)
          .attr("fill", (d) => {
            if (
              d.properties[attributeLabels[0]] !== undefined &&
              d.properties[attributeLabels[0]] !== -1
            ) {
              if (checkRange(d)) {
                return accentColor;
              } else {
                return vis.colorScale(d.properties[attributeLabels[0]]);
              }
            } else {
              return "url(#lightstripe)";
            }
          });
      });
    // Add X axis label:
    vis.svg
      .append("text")
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("font-weight", 500)
      .attr(
        "transform",
        `translate(${vis.width / 2}, ${
          vis.height + vis.config.margin.bottom + 15
        })`
      )
      .text(attributeLabels[0]);

    this.renderVis();
  }

  // //leave this empty for now...
  renderVis() {}

  changeColorRange(colorRange) {
    colorRange = colorRange;
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
