class ChoroplethMap {

  /**
   * Class constructor with basic configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _data) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 1000,
      containerHeight: _config.containerHeight || 650,
      margin: _config.margin || { top: 20, right: 20, bottom: 20, left: 20 },
      tooltipPadding: 10,
      legendBottom: 50,
      legendLeft: 50,
      legendRectHeight: 12,
      legendRectWidth: 150
    }
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
    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    // Define size of SVG drawing area
    vis.svg = d3.select(vis.config.parentElement).append('svg')
      .attr('class', 'center-container')
      .attr('width', vis.config.containerWidth)
      .attr('height', vis.config.containerHeight);

    vis.svg.append('rect')
      .attr('class', 'background center-container')
      .attr('height', vis.config.containerWidth) //height + margin.top + margin.bottom)
      .attr('width', vis.config.containerHeight) //width + margin.left + margin.right)
      .on('click', vis.clicked);

    var borderPath = vis.svg.append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("height", vis.config.containerHeight)
      .attr("width", vis.config.containerWidth)
      .style("stroke", "#000000")
      .style("fill", "none")
      .style("stroke-width", "2");

    vis.projection = d3.geoAlbersUsa()
      .translate([vis.width / 2, vis.height / 2])
      .scale(vis.width);

    vis.colorScale = d3.scaleLinear()
      .domain(d3.extent(vis.data.objects.counties.geometries, d => d.properties.median_household_income))
      .range(['#dfe2f2', '#0d003b'])
      .interpolate(d3.interpolateHcl);

    vis.path = d3.geoPath()
      .projection(vis.projection);

    vis.g = vis.svg.append("g")
      .attr('class', 'center-container center-items us-state')
      .attr('transform', 'translate(' + vis.config.margin.left + ',' + vis.config.margin.top + ')')
      .attr('width', vis.width + vis.config.margin.left + vis.config.margin.right)
      .attr('height', vis.height + vis.config.margin.top + vis.config.margin.bottom)


    vis.counties = vis.g.append("g")
      .attr("id", "counties")
      .selectAll("path")
      .data(topojson.feature(vis.us, vis.us.objects.counties).features)
      .enter().append("path")
      .attr("d", vis.path)
      // .attr("class", "county-boundary")
      .attr('fill', d => {
        if (d.properties.median_household_income) {
          return vis.colorScale(d.properties.median_household_income);
        } else {
          return 'url(#lightstripe)';
        }
      });

    vis.counties
      .on('mousemove', (d, event) => {
        //console.log(d);
        //console.log(event);
        const popDensity = d.properties.pop ? `<strong>${d.properties.pop}</strong> pop. density per km<sup>2</sup>` : 'No pop data available';
        const medianHouseholdIncome = d.properties.median_household_income ? `<strong>$${d.properties.median_household_income}</strong> median household income` : 'No income data available';
        const percentStroke = d.properties.percent_stroke ? `<strong>${d.properties.percent_stroke}%</strong> of people have had a stroke` : 'No stroke data available';
        const airQuality = d.properties.air_quality ? `<strong>${d.properties.air_quality}</strong> air quality index` : 'No air quality data available';
        d3.select('.tooltip')
          .style('display', 'block')
          .style('left', (vis.config.margin.left + vis.config.tooltipPadding) + 'px')
          .style('top', (event.pageY) + 'px')
          .html(`
                        <div class="tooltip-title">${d.properties.name} County</div>
                        <div>${medianHouseholdIncome}</div>
                        <div>${percentStroke}</div>
                        <div>${airQuality}</div>  
                      `);
      })
      .on('mouseleave', () => {
        d3.select('.tooltip').style('display', 'none');
      });



    vis.g.append("path")
      .datum(topojson.mesh(vis.us, vis.us.objects.states, function (a, b) { return a !== b; }))
      .attr("id", "state-borders")
      .attr("d", vis.path);

  }


}