/**
 * Load TopoJSON data of the world and the data of the world wonders
 */

let allData, chloropleth, scatterplot, histogram1, histogram2;

Promise.all([
  d3.json("data/counties-10m.json"),
  d3.csv("data/population.csv"),
  d3.csv("data/national_health_data.csv"),
])
  .then((data) => {
    const geoData = data[0];
    const countyPopulationData = data[1];
    const nationalHealthData = data[2];

    // Combine both datasets by adding the population density to the TopoJSON file
    geoData.objects.counties.geometries.forEach((d) => {
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
     */

    // add categories to the attribute select dropdown
    d3.select("#attribute-1-select")
      .selectAll("option")
      .data(Object.keys(geoData.objects.counties.geometries[0].properties))
      .enter()
      .append("option")
      .text((d) => d);
    d3.select("#attribute-2-select")
      .selectAll("option")
      .data(Object.keys(geoData.objects.counties.geometries[0].properties))
      .enter()
      .append("option")
      .text((d) => d);
    // swap the attributes with swap button
    d3.select("#swap-btn").on("click", () => {
      let attribute1 = d3.select("#attribute-1-select").property("value");
      let attribute2 = d3.select("#attribute-2-select").property("value");
      d3.select("#attribute-1-select").property("value", attribute2);
      d3.select("#attribute-2-select").property("value", attribute1);
    });

    console.log(geoData);
    allData = geoData;
    let attributes = [
      "median_household_income",
      "percent_coronary_heart_disease",
    ];

    /**
    geoData.objects.counties.geometries = cleanData(
      geoData.objects.counties.geometries,
      attributes
    );
    */

    /**
     * Rewrite the data to only include the attributes we want to use, use buttons
     * to switch between the attributes, add dropdown to select the 2 attributes
     * Maybe pass two arrays of data to the scatterplot and choroplethmap
     */

    let panelWidth =
      (window.innerWidth ||
        document.documentElement.clientWidth ||
        document.body.clientWidth) / 2;
    let panelHeight =
      (window.innerHeight ||
        document.documentElement.clientHeight ||
        document.body.clientHeight) / 2.52;

    console.log(panelWidth, panelHeight);

    panelWidth = 900;
    panelHeight = 500;

    // colored by first attribute
    choroplethMap = new ChoroplethMap(
      {
        parentElement: ".choropleth",
        containerWidth: panelWidth,
        containerHeight: panelHeight,
        tooltipTag: "#tooltip-choropleth",
      },
      allData,
      attributes
    );

    scatterplot = new ScatterPlot(
      {
        parentElement: ".scatterplot",
        containerWidth: panelWidth,
        containerHeight: panelHeight,
        tooltipTag: "#tooltip-scatter",
      },
      allData,
      attributes
    );

    histogram1 = new Histogram(
      {
        parentElement: ".histogram1",
        containerWidth: panelWidth,
        containerHeight: panelHeight,
        tooltipTag: "#tooltip-hist-1",
      },
      allData,
      attributes[0]
    );

    histogram2 = new Histogram(
      {
        parentElement: ".histogram2",
        containerWidth: panelWidth,
        containerHeight: panelHeight,
        tooltipTag: "#tooltip-hist-2",
      },
      allData,
      attributes[1]
    );
  })
  .catch((error) => console.error(error));
