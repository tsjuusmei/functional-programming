import fetch from 'node-fetch'
import dotenv from 'dotenv'
import inside from 'point-in-polygon'
import cities from './assets/data/cities'
import allTariffs from './assets/data/tariffs'
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

// This function compares two endpoints, checks which shared key they have and returns them, also returns the data from the endpoints to work with later on
function sharedIds(endpointA, endpointB, sharedKey) {
  const resultA = getData(endpointA)
  const resultB = getData(endpointB)
  let idsA = [];
  let sharedIds = [];
  return Promise.all([resultA, resultB]).then(result => {
    idsA = result[0].map(x => x[sharedKey]) // Here the keys will be mapped in an array
    sharedIds = result[1].filter(x => idsA.includes(x[sharedKey])).map(x => x[sharedKey]) // Here the shared keys get filtered, compared and mapped out of the second result
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

// This function filters out unused keys and combines the datasets together
function filterData(data, keys) {
  let combinedData = [];

  data.forEach(dataset => {
    dataset.forEach(obj => {
      let cleanedObj = {};
      const objInArray = combinedData.find(x => x.areaid === obj.areaid); // Find shared areaids and puts them in a variable
      // areaid is already in, just add missing key/values
      if (objInArray) {
        cleanedObj = objInArray;
      }
      // Sets the keys that we need in our dataset
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



// async function getUuid(areaid) {
//   let uuid = undefined
//   let getUuid = await getData('https://opendata.rdw.nl/resource/mz4f-59fw.json?areaid=' + areaid)
//   uuid = getUuid[0].uuid
//   return uuid
// }

// This function checks what city a point coordinate is in based on polygons of cities
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

// async function getTarifs(uuid) {
//   const tariffObj = {}
//   let tariffs = undefined
//   let getTariffs = await getData('https://npropendata.rdw.nl//parkingdata/v2/static/' + uuid)
//   tariffs = getTariffs.parkingFacilityInformation.tariffs
//   tariffs.forEach(tariff => {
//     if (notExpiredTariff(tariff)) {
//       tariff.validityDays.forEach(day => {
//         const dayKey = day.split(' ').join('').toLowerCase();
//         if (tariffObj[dayKey]) return;
//         tariffObj[dayKey] = {
//           // validFrom: tariff.validityFromTime,
//           // validUntil: tariff.validityUntilTime,
//           // rateInterval: tariff.rateIntervals,
//           averageTariffPerMinute: getAverageTariffPerMinute(tariff)
//         };
//       });
//     }
//   });
//   return tariffObj 
// }


// This function will retreive the tariffs for the facilities with the areaids
function getTariffs(areaid) {
  const tariffObj = {}
  let getTariffs = allTariffs[areaid]
  if (!getTariffs) {
    return undefined
  }
  Object.keys(getTariffs).forEach(key => {
    tariffObj[key] = getTariffs[key].averageTariff
  })
  return tariffObj
}

// function notExpiredTariff(tariff) {
//   return tariff.startOfPeriod * 1000 < Date.now() && (tariff.endOfPeriod * 1000 > Date.now() || !tariff.endOfPeriod || tariff.endOfPeriod === -1);
// }

// function getAverageTariffPerMinute(tariff) {
//   if (!tariff.intervalRates) return null;

//   const minutesInDay = 1440;
//   let weightedTotalCharge = 0;
//   let totalMinutes = 0;

//   tariff.intervalRates.forEach(rate => {
//     const minutes = rate.durationUntil === -1 ? minutesInDay - rate.durationFrom : rate.durationUntil - rate.durationFrom;
//     const charge = rate.charge
//     const chargePeriod = rate.chargePeriod;
//     const weightedCharge = charge * minutes / chargePeriod;
//     weightedTotalCharge += weightedCharge;
//     totalMinutes += minutes;
//   });

//   return weightedTotalCharge / totalMinutes;
// }

// This function will put the coordinates in an array and calculate the middle coordinate of a polygon
function getCenterCord(coordinates) {
  const type = coordinates.split(' ')[0]
  let longLat = []
  let coords = coordinates // Clean the coordinates so we can use them
    .replace(type, '')
    .replace(' ', '')
    .replace(' (', '')
    .replace('((', '')
    .replace('))', '')
    .replace('(', '')
    .replace(')', '')
    .replace(/,/g, '')
    .split(' ')

  if (coords.length > 2) { // This code will run for polygons
    let long = 0
    let lat = 0

    coords.forEach((coord, i) => {
      if (i % 2 == 0) { // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Remainder
        return long += Number(coord)
      }
      return lat += Number(coord)
    })

    longLat = [long / (coords.length / 2), lat / (coords.length / 2)]

  } else { // This code will run for points
    longLat = [Number(coords[0]), Number(coords[1])] 
  }
  return longLat
}

// This function merges the datasets to 1 dataset
async function mergeData() {
  const result = await sharedIds(endpoints[0], endpoints[1], sharedKey);
  let dataA = result.resultA.filter(x => result.sharedIds.includes(x.areaid));
  let dataB = result.resultB.filter(x => result.sharedIds.includes(x.areaid));

  return filterData([dataA, dataB], keys);
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



    // Promise.all(newArray).then(x => {
    //   return x
    //     .map(async y => {
    //       let obj = y
    //       obj.tariffs = await getTarifs(obj.uuid)
    //       console.log(obj)
    //       return obj
    //     })
    // })

    // Get the tariffs
    .map(y => {
      let obj = y
      obj.tariffs = getTariffs(obj.areaid)
      return obj
    })

    // .map(async y => {
    //   let obj = y
    //   obj.uuid = await getUuid(obj.areaid)
    //   return obj
    // })

    // Filters out empty tariffs
    .filter(y => {
      Object.size = function (obj) { // Checks the size of an object https://stackoverflow.com/questions/5223/length-of-a-javascript-object
        var size = 0, key;
        for (key in obj) {
          if (obj.hasOwnProperty(key)) size++;
        }
        return size;
      };
      if (Object.size(y.tariffs) === 0) {
        return false
      }
      return y
    })
    
    // Filters out undefined cities
    .filter(y =>  y.city)

  // Promise.all(newArray).then(x => console.log(x))

  // console.log(newArray)
});