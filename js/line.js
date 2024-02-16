class LineChart {

  constructor(_config, _data) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 500,
      containerHeight: _config.containerHeight || 140,
      margin: { top: 10, bottom: 50, right: 10, left: 50 }
    }

    this.data = _data;
    this.active = d3.select(null);

    // Call a class function
    this.initVis();
  }

  initVis() {
    console.log("Let's draw a line chart of the data!!");
    console.log(this.data);

    let vis = this;

    // Calculate inner chart size. Margin specifies the space around the actual chart.
    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    // Define size of SVG drawing area
    vis.svg = d3.select(vis.config.parentElement).append('svg')
      .attr('class', 'center-container')
      .attr('width', vis.config.containerWidth)
      .attr('height', vis.config.containerHeight);


    vis.chart = vis.svg.append('g')
      .attr('transform', `translate(${vis.config.margin.left}, ${vis.config.margin.top})`);

    vis.xScale = d3.scaleLinear()
      .domain([d3.min(vis.data, d => d.properties.median_household_income), d3.max(vis.data, d => d.properties.median_household_income)])
      .range([0, vis.width]);

    vis.yScale = d3.scaleLinear()
      .domain([0, d3.max(vis.data, d => d.properties.air_quality)])
      .range([vis.height, 0]);

    vis.line = d3.line()
      .x(d => vis.xScale(d.properties.median_household_income))
      .y(d => vis.yScale(d.properties.air_quality));

    vis.chart.append('path')
      .datum(vis.data)
      .attr('fill', 'none')
      .attr('stroke', 'black')
      .attr('stroke-width', 2)
      .attr('d', vis.line);

    vis.xAxis = d3.axisBottom(vis.xScale);
    vis.yAxis = d3.axisLeft(vis.yScale);

    vis.xAxis.axisLabel = 'Median Household Income ($)';
    vis.yAxis.axisLabel = 'Air Quality Index';

    vis.xAxisGroup = vis.chart.append('g')
      .attr('class', 'axis x-axis')
      .attr('transform', `translate(0, ${vis.height})`)
      .call(vis.xAxis);

    vis.yAxisGroup = vis.chart.append('g')
      .attr('class', 'axis y-axis')
      .call(vis.yAxis);

    this.updateVis(); //leave this empty for now...
  }


  //  //leave this empty for now
  updateVis() {

    this.renderVis();

  }


  // //leave this empty for now...
  renderVis() {

  }



}