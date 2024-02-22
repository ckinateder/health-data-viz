function cleanData(data, attributes) {
  return data.filter((d) => {
    return attributes.every((attribute) => {
      return (
        d.properties[attribute] &&
        !isNaN(d.properties[attribute]) &&
        d.properties[attribute] !== -1
      );
    });
  });
}
