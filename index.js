import fetch from 'node-fetch'
import dotenv from 'dotenv'
dotenv.config()

const endpoints = [
  'https://opendata.rdw.nl/resource/b3us-f26s.json?$where=chargingpointcapacity>0',
  'https://opendata.rdw.nl/resource/nsk3-v9n7.json'
]
const sharedKey = 'areaid'
const token = '$$app_token=' + process.env.OPENDATA_RDW_APPTOKEN
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
    return {
      sharedIds: sharedIds,
      resultA: result[0],
      resultB: result[1]
    }
  })
}

function filterData(data, sharedKey) {

  let filteredData = [{
    areaid: '193_noord',
    capacity: 47523453,
    chargingpointcapacity: 4,
    areageometryastext: 'POLYGON 48576348576'
  }]

}

async function mergeData() {

  const result = await sharedIds(endpoints[0], endpoints[1], sharedKey)
  const dataA = result.resultA.filter(x => result.sharedIds.includes(x.areaid))
  const dataB = result.resultB.filter(x => result.sharedIds.includes(x.areaid))

  console.log(dataB.map(x => x.areaid).sort())

  filterData([dataA, dataB], keys)

}

// filterData(endpoints, sharedKey)

mergeData()