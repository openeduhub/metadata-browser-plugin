document.getElementById("testbutton").addEventListener("click", function() {

    var active_url = getCurrentTab();
    
    active_url.then(function(result) {
        document.getElementById("url_id").value = result;
        myFunction();
    });

    
});


async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  let [tab] = await chrome.tabs.query(queryOptions);
  //return tab;
  let active_url = tab.url;
  return tab.url;
  
}


var currentURL;
function find_url(){
    chrome.tabs.query({'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT}, 
    function(tabs){
        getCurrentURL(tabs[0].url);
    });
}
function getCurrentURL(tab){
    currentURL = tab;
}


function myFunction() {
    local_url = document.getElementById("url_id").value;
    //local_url = "https://www.weltderphysik.de/gebiet/teilchen/quanteneffekte/";
    fetch("http://127.0.0.1:5500/metadata", {
        method: 'post',
        body: JSON.stringify({ 
                url: local_url
            }) ,
        headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json'
        }
    }).then((response) => {
        return response.json()
    }).then((res) => {
        let ojson = res.resultjson;
        ojson = ojson.replace(/'/g, '"');
        ojson = JSON.parse(ojson);
        
        document.getElementById("title_id").value = ojson.title;
        document.getElementById("description_id").value = ojson.description;
        document.getElementById("discipline_id").value = ojson.valuespaces.discipline;
        document.getElementById("educontext_id").value = ojson.valuespaces.educationalContext;
        document.getElementById("keywords_id").value = ojson.keyword;
        document.getElementById("license_id").value = ojson.license.author;
        if (res.status === 200) {

            console.log("Post successfully created!")
        }
    }).catch((error) => {
        console.log(error)
    });
}