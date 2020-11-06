// import fetch from 'node-fetch'
// import dotenv from 'dotenv'

const fetch = require('node-fetch')
const dotenv = require('dotenv')
dotenv.config()

const token = '$$app_token=' + process.env.OPENDATA_RDW_APPTOKEN

const endpoints = [
  'https://opendata.rdw.nl/resource/b3us-f26s.json?$where=chargingpointcapacity>0',
  'https://opendata.rdw.nl/resource/nsk3-v9n7.json'
]
const sharedKey = 'areaid'
const keys = ['areaid', 'capacity', 'chargingpointcapacity', 'areageometryastext']

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

function sharedIds(endpointA, endpointB, sharedKey) {
  const resultA = getData(endpointA)
  const resultB = getData(endpointB)
  let idsA = [];
  let sharedIds = [];
  return Promise.all([resultA, resultB]).then(result => {
    idsA = result[0].map(x => x[sharedKey])
    sharedIds = result[1].filter(x => idsA.includes(x[sharedKey])).map(x => x[sharedKey])
    sharedIds = sharedIds.filter((item, pos) => { // https://stackoverflow.com/questions/9229645/remove-duplicate-values-from-js-array
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

async function mergeData() {
  const result = await sharedIds(endpoints[0], endpoints[1], sharedKey);
  let dataA = result.resultA.filter(x => result.sharedIds.includes(x.areaid));
  let dataB = result.resultB.filter(x => result.sharedIds.includes(x.areaid));

  return filterData([dataA, dataB], keys);
}

mergeData().then(x => console.log(x));