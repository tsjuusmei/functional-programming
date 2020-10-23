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

    // Replacing typos
    .map((x) => {
        return x
            .replace('hont', 'hond')
            .replace(/dwerg teckel/g, 'hond')
    })

return pets
}

console.log(cleanPets())
