/**
 * Load TopoJSON data of the world and the data of the world wonders
 */

let allData, chloropleth, scatterplot, histogram1, histogram2, attributeLabels;

Promise.all([
  d3.json("data/counties-10m.json"),
  d3.csv("data/population.csv"),
  d3.csv("data/national_health_data.csv"),
])
  .then((data) => {
    allData = data[0];
    const countyPopulationData = data[1];
    const nationalHealthData = data[2];

    // Combine both datasets by adding the population density to the TopoJSON file
    allData.objects.counties.geometries.forEach((d) => {
      for (let i = 0; i < countyPopulationData.length; i++) {
        if (d.id === countyPopulationData[i].cnty_fips) {
          d.properties.population = +countyPopulationData[i].Value;
        }
      }
      for (let i = 0; i < nationalHealthData.length; i++) {
        if (d.id === nationalHealthData[i].cnty_fips) {
          d.properties.median_household_income =
            +nationalHealthData[i].median_household_income;
          d.properties.percent_stroke = +nationalHealthData[i].percent_stroke;
          d.properties.air_quality = +nationalHealthData[i].air_quality;
          d.properties.education_less_than_high_school_percent =
            +nationalHealthData[i].education_less_than_high_school_percent;
          d.properties.poverty_perc = +nationalHealthData[i].poverty_perc;
          d.properties.park_access = +nationalHealthData[i].park_access;
          d.properties.percent_inactive =
            +nationalHealthData[i].percent_inactive;
          d.properties.percent_smoking = +nationalHealthData[i].percent_smoking;
          d.properties.urban_rural_status =
            nationalHealthData[i].urban_rural_status;
          d.properties.elderly_percentage =
            +nationalHealthData[i].elderly_percentage;
          d.properties.number_of_hospitals =
            +nationalHealthData[i].number_of_hospitals;
          d.properties.number_of_primary_care_physicians =
            +nationalHealthData[i].number_of_primary_care_physicians;
          d.properties.percent_no_heath_insurance =
            +nationalHealthData[i].percent_no_heath_insurance;
          d.properties.percent_high_blood_pressure =
            +nationalHealthData[i].percent_high_blood_pressure;
          d.properties.percent_coronary_heart_disease =
            +nationalHealthData[i].percent_coronary_heart_disease;
          d.properties.percent_stroke = +nationalHealthData[i].percent_stroke;
          d.properties.percent_high_cholesterol =
            +nationalHealthData[i].percent_high_cholesterol;
        }
      }
      //console.log(d);
    });

    /**
     * Data that doesnt work:
     * urban_rural_status
     *
     */ /**
     * attributeLabels = [label1, label2]
     * attributeValues = [value1Array, value2Array]
     * pass both to the scatterplot, hist, and choropleth
     */

    const labels = Object.keys(
      allData.objects.counties.geometries[0].properties
    ).filter((item) => {
      return item !== "name";
    });

    // add categories to the attribute select dropdown
    d3.select("#attribute-1-select")
      .selectAll("option")
      .data(labels)
      .enter()
      .append("option")
      .text((d) => d);
    d3.select("#attribute-2-select")
      .selectAll("option")
      .data(labels)
      .enter()
      .append("option")
      .text((d) => d);

    attributeLabels = [
      "median_household_income",
      "percent_coronary_heart_disease",
    ];
    const panelWidth = 900;
    const panelHeight = 500;

    // colored by first attribute
    choroplethMap = new ChoroplethMap(
      {
        parentElement: ".choropleth",
        containerWidth: panelWidth,
        containerHeight: panelHeight,
        tooltipTag: "#tooltip-choropleth",
      },
      allData,
      attributeLabels
    );

    scatterplot = new ScatterPlot(
      {
        parentElement: ".scatterplot",
        containerWidth: panelWidth,
        containerHeight: panelHeight,
        tooltipTag: "#tooltip-scatter",
      },
      allData,
      attributeLabels
    );

    histogram1 = new Histogram(
      {
        parentElement: ".histogram1",
        containerWidth: panelWidth,
        containerHeight: panelHeight,
        tooltipTag: "#tooltip-hist-1",
      },
      allData,
      attributeLabels[0]
    );

    histogram2 = new Histogram(
      {
        parentElement: ".histogram2",
        containerWidth: panelWidth,
        containerHeight: panelHeight,
        tooltipTag: "#tooltip-hist-2",
      },
      allData,
      attributeLabels[1]
    );
  })
  .catch((error) => console.error(error));

// swap the attributes with swap button
d3.select("#swap-btn").on("click", () => {
  let attribute1 = d3.select("#attribute-1-select").property("value");
  let attribute2 = d3.select("#attribute-2-select").property("value");
  d3.select("#attribute-1-select").property("value", attribute2);
  d3.select("#attribute-2-select").property("value", attribute1);
});
d3.select("#update-btn").on("click", () => {
  let attribute1Label = d3.select("#attribute-1-select").property("value");
  let attribute2Label = d3.select("#attribute-2-select").property("value");

  attributeLabels = [attribute1Label, attribute2Label];

  scatterplot.setAttributeLabels(attributeLabels);
  scatterplot.updateVis();
});
