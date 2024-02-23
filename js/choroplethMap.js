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
      margin: _config.margin || { top: 20, right: 20, bottom: 20, left: 20 },
      tooltipPadding: 10,
      legendBottom: 50,
      legendLeft: 50,
      legendRectHeight: 12,
      legendRectWidth: 150,
      tooltipTag: _config.tooltipTag || "#tooltip-choropleth",
      colorRange: _config.colorRange || ["#0A2F51", "#BFE1B0"],
    };
    this.data = _data;
    // this.config = _config;
    this.attributeLabels = _attributeLabels;
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
      .attr("class", "center-container")
      .attr("width", vis.config.containerWidth)
      .attr("height", vis.config.containerHeight);

    vis.svg
      .append("rect")
      .attr("class", "background center-container")
      .attr("height", vis.config.containerWidth) //height + margin.top + margin.bottom)
      .attr("width", vis.config.containerHeight) //width + margin.left + margin.right)
      .on("click", vis.clicked);

    var borderPath = vis.svg
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("height", vis.config.containerHeight)
      .attr("width", vis.config.containerWidth)
      .style("stroke", "#999999")
      .style("fill", "none")
      .style("stroke-width", "1");

    vis.projection = d3
      .geoAlbersUsa()
      .translate([vis.width / 2, vis.height / 2])
      .scale(vis.width);

    vis.colorScale = d3
      .scaleLinear()
      .domain(
        d3.extent(
          vis.data.objects.counties.geometries,
          (d) => d.properties[this.attributeLabels[0]]
        )
      )
      .range(this.config.colorRange)
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

    vis.colorScale = d3
      .scaleLinear()
      .domain(
        d3.extent(
          vis.data.objects.counties.geometries,
          (d) => d.properties[this.attributeLabels[0]]
        )
      )
      .range(vis.config.colorRange)
      .interpolate(d3.interpolateHcl);

    vis.counties.attr("fill", (d) => {
      if (d.properties[this.attributeLabels[0]]) {
        return vis.colorScale(d.properties[this.attributeLabels[0]]);
      } else {
        return "url(#lightstripe)";
      }
    });

    vis.counties
      .on("mousemove", (event, d) => {
        const a1 = d.properties[this.attributeLabels[0]]
          ? `<strong>${d.properties[this.attributeLabels[0]]}</strong> ${
              this.attributeLabels[0]
            }`
          : "No data available";
        const a2 = d.properties[this.attributeLabels[1]]
          ? `<strong>${d.properties[this.attributeLabels[1]]}</strong> ${
              this.attributeLabels[1]
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

        d3.select(event.target).transition().duration(0).attr("fill", "orange");
      })
      .on("mouseleave", (event, d) => {
        d3.select(vis.config.tooltipTag).style("display", "none");
        d3.select(event.target)
          .transition()
          .duration(250)
          .attr("fill", (d) => {
            if (d.properties[this.attributeLabels[0]]) {
              return vis.colorScale(d.properties[this.attributeLabels[0]]);
            } else {
              return "url(#lightstripe)";
            }
          });
      });

    this.renderVis();
  }

  // //leave this empty for now...
  renderVis() {}

  setAttributeLabels(attributeLabels) {
    this.attributeLabels = attributeLabels;
  }
  changeAttributes(attributeLabels) {
    this.setAttributeLabels(attributeLabels);
    this.updateVis();
  }
}
