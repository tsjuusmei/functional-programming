function cleanPets() {
    let pets = data.map(x => {
        return x.huisDieren
            .toLowerCase()
    })

    return pets
}

console.log(cleanPets())
