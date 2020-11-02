import fetch from 'node-fetch'

async function getData(endpoint) {
    const response = await fetch(endpoint)
    const data = await response.json()
    console.log(data)
    return data
}

getData('https://opendata.rdw.nl/resource/b3us-f26s.json?$limit=2000')