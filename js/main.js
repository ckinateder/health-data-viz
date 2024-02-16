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
        d.properties.pop = +countyPopulationData[i].Value;
      }
    }
    for (let i = 0; i < nationalHealthData.length; i++) {
      if (d.id === nationalHealthData[i].cnty_fips) {
        d.properties.median_household_income = +nationalHealthData[i].median_household_income;
        if (d.properties.median_household_income <= 0) { // clean
          d.properties.median_household_income = undefined;
        }
        d.properties.percent_stroke = +nationalHealthData[i].percent_stroke;
        d.properties.air_quality = +nationalHealthData[i].air_quality;
      }
    }
    //console.log(d);
  });
  console.log(geoData);

  const choroplethMap = new ChoroplethMap({
    parentElement: '.viz',
    'containerWidth': 1000,
    'containerHeight': 650,
  }, geoData);

  const scatterplot = new ScatterPlot({
    parentElement: '.scatterplot',
    'containerWidth': 1000,
    'containerHeight': 400,
  }, geoData);

}).catch(error => console.error(error));
