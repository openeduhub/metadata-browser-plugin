function load_vocabs() {
    console.log("Load vocabs");
    fetch("https://vocabs.openeduhub.de/w3id.org/openeduhub/vocabs/educationalContext/index.json", {
        method: 'get',
        headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json'
        }
    }).then((response) => {
        return response.json()
    }).then((res) => {        
        concepts = res.hasTopConcept
        select = document.getElementById("educontext_id")
        concepts.map(concept => {
            console.log(concept.prefLabel.de)
            var option = document.createElement('option')
            option.value = concept.id
            option.text = concept.prefLabel.de
            select.appendChild(option)
        })
    }).catch((error) => {
        console.log(error)
    });
}

document.addEventListener('DOMContentLoaded', load_vocabs);