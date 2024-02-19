class Histogram {

  constructor(_config, _data, _attribute) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 500,
      containerHeight: _config.containerHeight || 140,
      margin: { top: 10, bottom: 50, right: 10, left: 50 }
    }

    this.data = _data;
    this.active = d3.select(null);
    this.attribute = _attribute;
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

    // Extract the values from the data
    const values = vis.data.map(d => d.properties[vis.attribute]);

    vis.xScale = d3.scaleLinear()
      .domain([0, d3.max(values)])
      .range([0, vis.width]);

    vis.histogram = d3.histogram()
      .domain(vis.xScale.domain())
      .thresholds(vis.xScale.ticks(70));
    vis.bins = vis.histogram(values);

    vis.yScale = d3.scaleLinear()
      .domain([0, d3.max(vis.bins, d => d.length)])
      .range([vis.height, 0]);   // d3.hist has to be called before the Y axis obviously


    vis.chart = vis.svg.append('g')
      .attr('transform', `translate(${vis.config.margin.left}, ${vis.config.margin.top})`);

    // append the bar rectangles to the svg element
    vis.chart.append('g')
      .selectAll("rect")
      .data(vis.bins)
      .enter()
      .append("rect")
      .attr("x", 1)
      .attr("transform", d => "translate(" + vis.xScale(d.x0) + "," + vis.yScale(d.length) + ")")
      .attr("width", d => vis.xScale(d.x1) - vis.xScale(d.x0) - 1)
      .attr("height", d => vis.height - vis.yScale(d.length))
      .style("fill", "#69b3a2");

    vis.xAxis = d3.axisBottom(vis.xScale);
    vis.yAxis = d3.axisLeft(vis.yScale);

    vis.xAxisGroup = vis.chart.append('g')
      .attr('class', 'axis x-axis')
      .attr('transform', `translate(0, ${vis.height})`)
      .call(vis.xAxis);

    vis.yAxisGroup = vis.chart.append('g')
      .attr('class', 'axis y-axis')
      .call(vis.yAxis);


    // Add X axis label:
    vis.chart.append("text")
      .attr("text-anchor", "end")
      .attr("x", vis.width / 2)
      .attr("y", vis.height + (vis.config.margin.top + 30))
      .text(this.attribute);

    // Y axis label:
    vis.chart.append("text")
      .attr("text-anchor", "end")
      .attr("transform", "rotate(-90)")
      .attr("y", -vis.config.margin.left)
      .attr("x", 0 - (vis.height / 2))
      .attr("dy", "1em")
      .text("Frequency");
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