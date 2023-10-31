function load_vocabs(name, selector) {
    console.log("Load vocabs");
    fetch("https://w3id.org/openeduhub/vocabs/" + name + "/index.json", {
        method: 'get',
        headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json'
        }
    }).then((response) => {
        return response.json()
    }).then((res) => {        
        concepts = res.hasTopConcept
        select = document.getElementById(selector)
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

function load_and_set() {
    load_vocabs("educationalContext", "educontext_id");
    load_vocabs("discipline", "discipline_id");
}

document.addEventListener('DOMContentLoaded', load_and_set);