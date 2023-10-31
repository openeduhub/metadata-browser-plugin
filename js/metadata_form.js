window.addEventListener("DOMContentLoaded", (event) => {
    document.getElementById("testbutton").addEventListener("click", function() {

        var active_url = getCurrentTab();
        
        active_url.then(function(result) {
            document.getElementById("url_id").value = result;
            myFunction();
        });
    });

    const ul = document.querySelector("ul"),
    input = document.querySelector("input"),
    tagNumb = document.querySelector(".details span");

    let maxTags = 10,
    tags = ["test_tag1", "test_tag2"];
    //countTags();
    //createTag();
    function countTags(){
        input.focus();
        tagNumb.innerText = maxTags - tags.length;
    }
    function createTag(){
        ul.querySelectorAll("li").forEach(li => li.remove());
        tags.slice().reverse().forEach(tag =>{
            let liTag = `<li>${tag} <i class="uit uit-multiply" onclick="remove(this, '${tag}')"></i></li>`;
            ul.insertAdjacentHTML("afterbegin", liTag);
        });
        countTags();
    }
    function remove(element, tag){
        let index  = tags.indexOf(tag);
        tags = [...tags.slice(0, index), ...tags.slice(index + 1)];
        element.parentElement.remove();
        countTags();
    }
    function addTag(e){
        if(e.key == "Enter"){
            let tag = e.target.value.replace(/\s+/g, ' ');
            if(tag.length > 1 && !tags.includes(tag)){
                if(tags.length < 10){
                    tag.split(',').forEach(tag => {
                        tags.push(tag);
                        createTag();
                    });
                }
            }
            e.target.value = "";
        }
    }
    input.addEventListener("keyup", addTag);
    const removeBtn = document.querySelector(".details button");
    //removeBtn.addEventListener("click", () =>{
    //    tags.length = 0;
    //    ul.querySelectorAll("li").forEach(li => li.remove());
    //    //countTags();
    //});

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
        let ojson = res;

        document.getElementById("title_id").value = ojson.title;
        document.getElementById("description_id").value = ojson.description;
        document.getElementById("discipline_id").value = ojson.disciplines;
        document.getElementById("educontext_id").value = ojson.educational_context;
        document.getElementById("keywords_id").value = ojson.keywords;
        document.getElementById("license_id").value = ojson.license;
        document.getElementById("license_author_id").value = ojson.license_author;
        document.getElementById("lrt_id").value = ojson.new_lrt;
    }).catch((error) => {
        console.log(error)
    });
}

