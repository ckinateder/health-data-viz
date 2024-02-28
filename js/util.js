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

const inRange = (value, range) => {
  return (
    (value >= range[0] && value <= range[1]) ||
    (value <= range[0] && value >= range[1])
  );
};

const checkRange = (object) => {
  let coordinate = [
    object.properties[attributeLabels[0]],
    object.properties[attributeLabels[1]],
  ];

  if (
    attributeRanges[attributeLabels[0]] === undefined &&
    attributeRanges[attributeLabels[1]] === undefined
  ) {
    return false;
  }

  if (attributeRanges[attributeLabels[0]] === undefined) {
    attributeRanges[attributeLabels[0]] = [];
  }
  if (attributeRanges[attributeLabels[1]] === undefined) {
    attributeRanges[attributeLabels[1]] = [];
  }

  if (attributeRanges[attributeLabels[0]].length === 0) {
    return inRange(coordinate[1], attributeRanges[attributeLabels[1]]);
  } else if (attributeRanges[attributeLabels[1]].length === 0) {
    return inRange(coordinate[0], attributeRanges[attributeLabels[0]]);
  }

  if (union) {
    return (
      inRange(coordinate[1], attributeRanges[attributeLabels[1]]) ||
      inRange(coordinate[0], attributeRanges[attributeLabels[0]])
    );
  } else {
    return (
      inRange(coordinate[1], attributeRanges[attributeLabels[1]]) &&
      inRange(coordinate[0], attributeRanges[attributeLabels[0]])
    );
  }
};
