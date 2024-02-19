class ScatterPlot {

    constructor(_config, _data, _attributes) {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth || 500,
            containerHeight: _config.containerHeight || 140,
            margin: { top: 10, bottom: 50, right: 10, left: 50 }
        }

        this.data = _data;
        this.active = d3.select(null);
        this.attributes = _attributes;
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

        console.log(d3.min(this.data, d => d.properties[this.attributes[1]]));

        vis.xScale = d3.scaleLinear()
            .domain([d3.min(this.data, d => d.properties[this.attributes[0]]), d3.max(this.data, d => d.properties[this.attributes[0]])])
            .range([0, vis.width]);

        vis.yScale = d3.scaleLinear()
            .domain([d3.min(this.data, d => d.properties[this.attributes[1]]), d3.max(this.data, d => d.properties[this.attributes[1]])])
            .range([vis.height, 0]);

        vis.chart = vis.svg.append('g')
            .attr('transform', `translate(${vis.config.margin.left}, ${vis.config.margin.top})`);

        // translate these betters
        vis.chart.append('g')
            .selectAll("dot")
            .data(this.data)
            .enter()
            .append("circle")
            .attr("cx", d => vis.xScale(d.properties[this.attributes[0]]))
            .attr("cy", d => vis.yScale(d.properties[this.attributes[1]]))
            .attr("r", 2)
            .attr('fill', d => {
                if (!isNaN(d.properties[this.attributes[0]]) && !isNaN(d.properties[this.attributes[1]])) {
                    return '#aa0011';
                } else {
                    return 'url(#lightstripe)';
                }
            });

        vis.chart
            .on('mousemove', (d, event) => {
            })
            .on('mouseleave', () => {
                d3.select('.tooltip').style('display', 'none');
            }); // come back to this later

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
            .attr("y", vis.height + (vis.config.margin.top + 20))
            .text(this.attributes[0]);

        // Y axis label:
        vis.chart.append("text")
            .attr("text-anchor", "end")
            .attr("transform", "rotate(-90)")
            .attr("y", -vis.config.margin.left)
            .attr("x", 0 - (vis.height / 2))
            .attr("dy", "1em")
            .text(this.attributes[1]);

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