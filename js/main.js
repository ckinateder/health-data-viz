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
  colorRange,
  accentColor,
  panelWidth,
  panelHeight,
  defaultAccentColor,
  defaultWidth,
  defaultHeight,
  defaultLiveBrushing,
  liveBrushing,
  dotSize,
  defaultDotSize;

let attributeRanges;

let union = true;

const onTransitionDuration = 50;
const offTransitionDuration = 50;

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
    const labels = [
      "population",
      "median_household_income",
      "percent_stroke",
      "air_quality",
      "education_less_than_high_school_percent",
      "poverty_perc",
      "park_access",
      "percent_inactive",
      "percent_smoking",
      "elderly_percentage",
      "number_of_hospitals",
      "number_of_primary_care_physicians",
      "percent_no_heath_insurance",
      "percent_high_blood_pressure",
      "percent_coronary_heart_disease",
      "percent_stroke",
      "percent_high_cholesterol",
    ];

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
    defaultAccentColor = "#ff9b00";
    defaultWidth = 650;
    defaultHeight = 400;
    defaultLiveBrushing = false;
    defaultDotSize = 2;

    panelWidth = defaultWidth;
    panelHeight = defaultHeight;
    dotSize = defaultDotSize;
    attributeLabels = defaultAttributeLabels;
    colorRange = defaultColorRange;
    accentColor = defaultAccentColor;
    liveBrushing = defaultLiveBrushing;

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
    d3.select("#colorpicker-3").property("value", accentColor);
    d3.select("#panel-width").property("value", defaultWidth);
    d3.select("#panel-height").property("value", defaultHeight);
    d3.select("#live-brushing").property("checked", defaultLiveBrushing);
    d3.select("#scatter-dot-size").property("value", defaultDotSize);

    //const colorRange = ["#386C30", "#04F11B"];

    // colored by first attribute
    chloropleth = new ChoroplethMap(
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

function histogramBrushUpdate() {
  union = true; // union of the ranges for histogram update
  chloropleth.updateVis();
  scatterplot.updateVis();
}
function scatterplotBrushUpdate() {
  union = false; // intersection of the ranges for scatterplot update
  chloropleth.updateVis();
  histogram1.updateVis();
  histogram2.updateVis();
}

function resetHistogramBrushes() {
  histogram1.updateVis();
  histogram2.updateVis();
}

function updateDimensions() {
  panelWidth = d3.select("#panel-width").property("value");
  panelHeight = d3.select("#panel-height").property("value");

  scatterplot.setDimensions(panelWidth, panelHeight);
  chloropleth.setDimensions(panelWidth, panelHeight);
  histogram1.setDimensions(panelWidth, panelHeight);
  histogram2.setDimensions(panelWidth, panelHeight);

  updateButton();
}

d3.select("#scatter-dot-size").on("change", () => {
  dotSize = d3.select("#scatter-dot-size").property("value");
  scatterplot.setDotSize(dotSize);
  scatterplot.updateVis();
});

d3.select("#live-brushing").on("change", () => {
  liveBrushing = d3.select("#live-brushing").property("checked");
});

//update width and height of the panel
d3.select("#panel-width").on("change", () => {
  updateDimensions();
});

d3.select("#panel-height").on("change", () => {
  updateDimensions();
});

// swap the attributes with swap button
d3.select("#swap-btn").on("click", () => {
  let attribute1 = d3.select("#attribute-1-select").property("value");
  let attribute2 = d3.select("#attribute-2-select").property("value");
  d3.select("#attribute-1-select").property("value", attribute2);
  d3.select("#attribute-2-select").property("value", attribute1);
  attributeLabels = [attribute2, attribute1];

  attributeRanges = {};
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
  d3.select("#colorpicker-3").property("value", defaultAccentColor);
  d3.select("#panel-width").property("value", defaultWidth);
  d3.select("#panel-height").property("value", defaultHeight);
  d3.select("#live-brushing").property("checked", defaultLiveBrushing);
  d3.select("#scatter-dot-size").property("value", defaultDotSize);

  updateDimensions();

  histogram1.changeNumBins(defaultHistogramBins);
  histogram2.changeNumBins(defaultHistogramBins);
  scatterplot.setDotSize(defaultDotSize);

  updateDropdown();
  updateColor();
  updateButton();
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
d3.select("#colorpicker-3").on("change", () => {
  updateButton();
});

d3.select("#histogram-1-bins").on("change", () => {
  histogram1.changeNumBins(d3.select("#histogram-1-bins").property("value"));
  attributeRanges = {};
  histogram1.updateVis();
});

d3.select("#histogram-2-bins").on("change", () => {
  histogram2.changeNumBins(d3.select("#histogram-2-bins").property("value"));
  attributeRanges = {};
  histogram2.updateVis();
});

function updateColor() {
  let color1 = d3.select("#colorpicker-1").property("value");
  let color2 = d3.select("#colorpicker-2").property("value");
  accentColor = d3.select("#colorpicker-3").property("value");
  colorRange = [color1, color2];
}

// update the attributes with update button
function updateDropdown() {
  let attribute1Label = d3.select("#attribute-1-select").property("value");
  let attribute2Label = d3.select("#attribute-2-select").property("value");

  attributeLabels = [attribute1Label, attribute2Label];

  attributeRanges = {
    attribute1Label: [],
    attribute2Label: [],
  };

  scatterplot.cleanData();
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
