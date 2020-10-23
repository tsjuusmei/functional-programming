function cleanPets() {
    // Clean empty entries
    let pets = data.map(x => {
        return x.huisDieren
            .toLowerCase()
            .replace('geen', '')
            .replace(/'/g, '')
            .replace(/-/g, '')
            .replace('n>v>t>', '')
            .replace(/[0-9]/g, '')
    })

    // Replacing typos and plural
    .map((x) => {
        return x
            .replace('hont', 'hond')
            .replace(/dwerg teckel/g, 'hond')
            .replace('katten', 'kat')
    })

    // Creating the same setup for values
    .map((x) => {
        return x    
            .replace(/ /g, '')
            .replace(/,/g, '.')
            .replace(/:/g, '.')
    })

return pets
}

console.log(cleanPets())
