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
const includesArray = (data, arr) => {
  return data.some(
    (e) => Array.isArray(e) && e.every((o, i) => Object.is(arr[i], o))
  );
};

const removeArrayFromArray = (data, arr) => {
  // get index of arr in data and remove it
  let index = data.findIndex((e) => {
    return Array.isArray(e) && e.every((o, i) => Object.is(arr[i], o));
  });
  data.splice(index, 1);
  return data;
};
