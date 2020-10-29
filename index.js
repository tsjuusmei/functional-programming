import { data } from './data/data'
import * as pets from './assets/pets.json'

const animals = pets.default;

function cleanPets() {

    let cleanPetsData = data
        .map(x => {
            return x.huisDieren
                .toLowerCase()
        })

        // Fixing typos
        .map((x) => {
            return x
                .replace('hont', 'hond')
                .replace(/dwerg teckel/g, 'hond')
                .replace('katten', 'kat')
        })

        // Emptying out unused words and numbers
        .map((x) => {
            return x
                .replace(/-/g, '')
                .replace('geen', '')
                .replace(/'/g, '')
                .replace('n>v>t>', '')
                .replace(/[0-9]/g, '')
        })

        // Putting dots inbetween names and removing double and triple dots to have better clearance in the array
        .map((x) => {
            return x
                .replace(/,/g, '.')
                .replace(/ /g, '.')
                .replace(/:/g, '.')
        })

        // Filtering out empty objects
        .filter(x => !!x)

        // Transform to strings and split the words
        .toString().split('.')


    // Filtering on animal names
    const petsTotal = cleanPetsData.filter(name => animals.includes(name.toLowerCase()))

    // Returning the mentioned pet names in an array
    return petsTotal
}

console.log(cleanPets())