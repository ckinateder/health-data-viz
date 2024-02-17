/**
 * Load TopoJSON data of the world and the data of the world wonders
 */

Promise.all([
  d3.json('data/counties-10m.json'),
  d3.csv('data/population.csv'),
  d3.csv('data/national_health_data.csv')
]).then(data => {
  const geoData = data[0];
  const countyPopulationData = data[1];
  const nationalHealthData = data[2];
  // Combine both datasets by adding the population density to the TopoJSON file
  geoData.objects.counties.geometries.forEach(d => {
    for (let i = 0; i < countyPopulationData.length; i++) {
      if (d.id === countyPopulationData[i].cnty_fips) {
        d.properties.population = +countyPopulationData[i].Value;
      }
    }
    for (let i = 0; i < nationalHealthData.length; i++) {
      if (d.id === nationalHealthData[i].cnty_fips) {
        d.properties.median_household_income = +nationalHealthData[i].median_household_income;
        d.properties.percent_stroke = +nationalHealthData[i].percent_stroke;
        d.properties.air_quality = +nationalHealthData[i].air_quality;
        d.properties.education_less_than_high_school_percent = +nationalHealthData[i].education_less_than_high_school_percent;
        d.properties.poverty_perc = +nationalHealthData[i].poverty_perc;
        d.properties.park_access = +nationalHealthData[i].park_access;
        d.properties.percent_inactive = +nationalHealthData[i].percent_inactive;
        d.properties.percent_smoking = +nationalHealthData[i].percent_smoking;
        d.properties.urban_rural_status = nationalHealthData[i].urban_rural_status;
        d.properties.elderly_percentage = +nationalHealthData[i].elderly_percentage;
        d.properties.number_of_hospitals = +nationalHealthData[i].number_of_hospitals;
        d.properties.number_of_primary_care_physicians = +nationalHealthData[i].number_of_primary_care_physicians;
        d.properties.percent_no_heath_insurance = +nationalHealthData[i].percent_no_heath_insurance;
        d.properties.percent_high_blood_pressure = +nationalHealthData[i].percent_high_blood_pressure;
        d.properties.percent_coronary_heart_disease = +nationalHealthData[i].percent_coronary_heart_disease;
        d.properties.percent_stroke = +nationalHealthData[i].percent_stroke;
        d.properties.percent_high_cholesterol = +nationalHealthData[i].percent_high_cholesterol;
      }
    }
    //console.log(d);
  });
  console.log(geoData);

  const countyData = geoData.objects.counties.geometries;

  const choroplethMap = new ChoroplethMap({
    parentElement: '.viz',
    'containerWidth': 1000,
    'containerHeight': 650,
  }, geoData);


  let attributes = [
    "median_household_income",
    "percent_stroke",
  ];

  const scatterplot = new ScatterPlot({
    parentElement: '.scatterplot',
    'containerWidth': 1000,
    'containerHeight': 400,
  }, countyData, attributes);

}).catch(error => console.error(error));
