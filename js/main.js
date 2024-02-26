/**
 * Load TopoJSON data of the world and the data of the world wonders
 */

let allData,
  chloropleth,
  scatterplot,
  histogram1,
  histogram2,
  attributeLabels,
  defaultAttributeLabels,
  defaultHistogramBins,
  defaultColorRange,
  colorRange;

let attributeRanges;

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
      return item !== "name" && item !== "urban_rural_status";
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

    // default attributes
    defaultAttributeLabels = ["median_household_income", "percent_stroke"];
    defaultColorRange = ["#00BEFF", "#571846"];
    defaultHistogramBins = 40;

    attributeLabels = defaultAttributeLabels;
    colorRange = defaultColorRange;

    attributeRanges = {
      [attributeLabels[0]]: [],
      [attributeLabels[1]]: [],
    };

    // set #attribute-1-select and #attribute-2-select to default attributes
    d3.select("#attribute-1-select").property("value", attributeLabels[0]);
    d3.select("#attribute-2-select").property("value", attributeLabels[1]);
    d3.select("#colorpicker-1").property("value", colorRange[0]);
    d3.select("#colorpicker-2").property("value", colorRange[1]);
    d3.select("#histogram-1-bins").property("value", defaultHistogramBins);
    d3.select("#histogram-2-bins").property("value", defaultHistogramBins);

    const panelWidth = 800;
    const panelHeight = 475;
    //const colorRange = ["#386C30", "#04F11B"];

    // colored by first attribute
    chloropleth = new ChoroplethMap(
      {
        parentElement: ".choropleth",
        containerWidth: panelWidth,
        containerHeight: panelHeight,
        tooltipTag: "#tooltip-choropleth",
        colorRange: colorRange,
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
        colorRange: colorRange,
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
        colorRange: colorRange,
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
        colorRange: colorRange,
      },
      allData,
      attributeLabels[1]
    );
  })
  .catch((error) => console.error(error));

/** Example:
 * filterData(
    testdata,
    "median_household_income",
    (d) => d > 50000 && d < 52000
  );
*/

function buildExpression(attributeLabel1, attributeLabel2) {
  // given a list of ranges, build an expression that returns true if the value is in any of the ranges
  return (expression = (d) => {
    for (let i = 0; i < attributeRanges[attributeLabel1].length; i++) {
      if (
        d.properties[attributeLabel1] >=
          attributeRanges[attributeLabel1][i][0] &&
        d.properties[attributeLabel1] <= attributeRanges[attributeLabel1][i][1]
      ) {
        for (let j = 0; j < attributeRanges[attributeLabel2].length; j++) {
          if (
            d.properties[attributeLabel2] >=
              attributeRanges[attributeLabel2][j][0] &&
            d.properties[attributeLabel2] <=
              attributeRanges[attributeLabel2][j][1]
          ) {
            return true;
          }
        }
      }
    }
    return false;
  });
}

function updateScatterplotData() {
  // make data equal to the original data filtered by the ranges in attributeRanges for both attributes
  let data = allData.objects.counties.geometries.filter(
    buildExpression(attributeLabels[0], attributeLabels[1])
  );
  scatterplot.setData(data);
  scatterplot.updateVis();
}

// swap the attributes with swap button
d3.select("#swap-btn").on("click", () => {
  let attribute1 = d3.select("#attribute-1-select").property("value");
  let attribute2 = d3.select("#attribute-2-select").property("value");
  d3.select("#attribute-1-select").property("value", attribute2);
  d3.select("#attribute-2-select").property("value", attribute1);

  updateButton();
});
d3.select("#update-btn").on("click", () => {
  updateButton();
});

d3.select("#reset-btn").on("click", () => {
  resetAll();
});

function resetAll() {
  d3.select("#attribute-1-select").property("value", defaultAttributeLabels[0]);
  d3.select("#attribute-2-select").property("value", defaultAttributeLabels[1]);
  d3.select("#colorpicker-1").property("value", defaultColorRange[0]);
  d3.select("#colorpicker-2").property("value", defaultColorRange[1]);
  d3.select("#histogram-1-bins").property("value", defaultHistogramBins);
  d3.select("#histogram-2-bins").property("value", defaultHistogramBins);
  histogram1.config.numBins = d3.select("#histogram-1-bins").property("value");
  histogram2.config.numBins = d3.select("#histogram-2-bins").property("value");

  attributeRanges = {
    [defaultAttributeLabels[0]]: [],
    [defaultAttributeLabels[1]]: [],
  };

  updateDropdown();
  updateColor();
  updateButton();
  updateScatterplotData();
}

// automataically update the attributes when the dropdown is changed
d3.select("#attribute-1-select").on("change", () => {
  updateButton();
});
d3.select("#attribute-2-select").on("change", () => {
  updateButton();
});

d3.select("#colorpicker-1").on("change", () => {
  updateButton();
});
d3.select("#colorpicker-2").on("change", () => {
  updateButton();
});
d3.select("#histogram-1-bins").on("change", () => {
  histogram1.config.numBins = d3.select("#histogram-1-bins").property("value");
  histogram1.updateVis();
});

d3.select("#histogram-2-bins").on("change", () => {
  histogram2.config.numBins = d3.select("#histogram-2-bins").property("value");
  histogram2.updateVis();
});

function updateColor() {
  let color1 = d3.select("#colorpicker-1").property("value");
  let color2 = d3.select("#colorpicker-2").property("value");
  let colorRange = [color1, color2];
  chloropleth.changeColorRange(colorRange);
  scatterplot.changeColorRange(colorRange);
  histogram1.changeColorRange(colorRange);
  histogram2.changeColorRange(colorRange);
}

// update the attributes with update button
function updateDropdown() {
  let attribute1Label = d3.select("#attribute-1-select").property("value");
  let attribute2Label = d3.select("#attribute-2-select").property("value");

  attributeLabels = [attribute1Label, attribute2Label];

  chloropleth.changeAttributes(attributeLabels);
  scatterplot.changeAttributes(attributeLabels);
  histogram1.changeAttribute(attribute1Label);
  histogram2.changeAttribute(attribute2Label);
}

function updateButton() {
  updateDropdown();
  updateColor();
  chloropleth.updateVis();
  scatterplot.updateVis();
  histogram1.updateVis();
  histogram2.updateVis();
}
