import fetch from 'node-fetch'
import dotenv from 'dotenv'
import inside from 'point-in-polygon'
import cities from './assets/data/cities'
dotenv.config()

const token = '$$app_token=' + process.env.OPENDATA_RDW_APPTOKEN

const endpoints = [
  'https://opendata.rdw.nl/resource/b3us-f26s.json?$where=chargingpointcapacity>0', // Added query for filtering out facilities with at least 1 charging point capicity
  'https://opendata.rdw.nl/resource/nsk3-v9n7.json'
]

const sharedKey = 'areaid' // This is the key where we can copy
const keys = ['areaid', 'capacity', 'chargingpointcapacity', 'areageometryastext'] // Keys we will need for our dataset

// This function will get data from an API and set the limit to 20000 so we can load all the data
async function getData(uriString) {
  let uri = uriString
  if (uri.includes('opendata')) {
    if (uri.endsWith('json')) {
      uri = uri + '?' + token + '&$limit=20000'
    } else if (uri.includes('$')) {
      uri = uri + '&' + token + '&$limit=20000'
    }
  }
  const response = await fetch(uri)
  const data = await response.json()
  return data
}

// This function
function sharedIds(endpointA, endpointB, sharedKey) {
  const resultA = getData(endpointA)
  const resultB = getData(endpointB)
  let idsA = [];
  let sharedIds = [];
  return Promise.all([resultA, resultB]).then(result => {
    idsA = result[0].map(x => x[sharedKey])
    sharedIds = result[1].filter(x => idsA.includes(x[sharedKey])).map(x => x[sharedKey])
    sharedIds = sharedIds.filter((item, pos) => { // This removes duplicate values from the array https://stackoverflow.com/questions/9229645/remove-duplicate-values-from-js-array
      return sharedIds.indexOf(item) == pos;
    })
    return {
      sharedIds: sharedIds,
      resultA: result[0],
      resultB: result[1]
    }
  })
}

function filterData(data, keys) {
  let combinedData = [];

  data.forEach(dataset => {
    dataset.forEach(obj => {
      let cleanedObj = {};
      const objInArray = combinedData.find(x => x.areaid === obj.areaid);

      // areaid is already in, just add missing key/values
      if (objInArray) {
        cleanedObj = objInArray;
      }

      keys.forEach(key => {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          // object has key, set it
          cleanedObj[key] = obj[key];
        }
      });

      combinedData = combinedData.filter(x => x.areaid !== obj.areaid);
      combinedData.push(cleanedObj);

    })
  });
  return combinedData;
}

function getCenterCord(coordinates) {
  const type = coordinates.split(' ')[0]
  let longLat = []
  let coords = coordinates
    .replace(type, '')
    .replace(' ', '')
    .replace(' (', '')
    .replace('((', '')
    .replace('))', '')
    .replace('(', '')
    .replace(')', '')
    .replace(/,/g, '')
    .split(' ')

  if (coords.length > 2) {
    let long = 0
    let lat = 0

    coords.forEach((coord, i) => {
      if (i % 2 == 0) { // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Remainder
        return long += Number(coord)
      }
      return lat += Number(coord)
    })

    longLat = [long / (coords.length / 2), lat / (coords.length / 2)]

  } else {
    longLat = [Number(coords[0]), Number(coords[1])]
  }
  return longLat
}

async function getUuid(areaid) {
  let uuid = undefined
  let getUuid = await getData('https://opendata.rdw.nl/resource/mz4f-59fw.json?areaid=' + areaid)
  uuid = getUuid[0].uuid
  return uuid
}

async function mergeData() {
  const result = await sharedIds(endpoints[0], endpoints[1], sharedKey);
  let dataA = result.resultA.filter(x => result.sharedIds.includes(x.areaid));
  let dataB = result.resultB.filter(x => result.sharedIds.includes(x.areaid));

  return filterData([dataA, dataB], keys);
}

function coordInPolygon(centerCoord, polygons) {
  let city = undefined

  let cities = polygons.features

  for (let i = 0; i < cities.length; i++) {
    let cityCoords = cities[i].geometry.coordinates[0]
    for (let j = 0; j < cityCoords.length; j++) {
      if (inside(centerCoord, cityCoords[j])) {
        city = cities[i].properties.name;
        return city
      }
    }
  }
  return city;
}

mergeData().then(x => {
  const newArray = x
    .map(y => {
      let obj = y
      obj.centerCoord = getCenterCord(obj.areageometryastext)
      return obj
    })
    .map(y => {
      let obj = y
      obj.city = coordInPolygon(obj.centerCoord, cities)
      return obj
    })
    .map(async y => {
      let obj = y
      obj.uuid = await getUuid(obj.areaid)
      return obj
    })
    // .map(async y => {
    //   let obj = y
    //   obj.tarifs = await getTarifs(obj.tarifs)
    //   return obj
    // })
  Promise.all(newArray).then(x => console.log(x))
});