function cleanPets() {
    // Clean empty entries
    let pets = data.map(x => {
        return x.huisDieren
            .toLowerCase()
            .replace('geen', '')
            .replace(/'/g, '')
            .replace(/-/g, '')
            .replace('n>v>t>', '')
    })

return pets
}

console.log(cleanPets())
