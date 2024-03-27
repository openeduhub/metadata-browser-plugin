window.addEventListener("DOMContentLoaded", (event) => {
    document.getElementById("testbutton").addEventListener("click", function() {
        
        var active_url = getCurrentTab();
        active_url.then(function(result) {
            document.getElementById("url_id").value = result;
            fetchMetadata();
        });
        
        // set_WLO_form();
        
    });

    document.getElementById("select_repository_id").addEventListener("click", function() {
        document.getElementById('content').style.display = 'none';
        document.getElementById('content_options').style.display = 'block';
    });

    document.getElementById('content_options').style.display = 'none';
    
    document.getElementById("weiter_id").addEventListener("click", function() {
        let local_url = document.getElementById("url_id").value;
        let title = document.getElementById("title_id").value;
        let description = document.getElementById("description_id").value;
        let disciplines = document.getElementById("discipline_id").value;
        disciplines_list = split_words(disciplines);

        let educational_context = document.getElementById("educontext_id").value;
        educational_context_list = split_words(educational_context);

        let keywords = document.getElementById("keywords_id").value;
        keywords_list = split_words(keywords);

        var license = document.getElementById("license_id").value;
        if (license === "") {
            license = "{}"
        }
        let license_dict = JSON.parse(license);
        // let license_author = document.getElementById("license_author_id").value;

        let new_lrt = document.getElementById("lrt_id").value;
        new_lrt_list = split_words(new_lrt);

        let result_json = JSON.stringify( {"url": local_url,
            "title": title, 
            "description":description, 
            "disciplines":disciplines_list, 
            "educational_context":educational_context_list, 
            "keywords":keywords_list, 
            "license":license_dict, 
            //"license_author":license_author, 
            "new_lrt":new_lrt_list } );
        
        sessionStorage.setItem("result_json", result_json);

        persist_metadata(result_json);
        // document.getElementById('content').style.display = 'none';
        // document.getElementById('content_options').style.display = 'block';
    });

    function set_status(status, message) {
        document.getElementById('status').innerHTML = message;
    }

    document.getElementById("form_options").addEventListener("submit", function(event){
    event.preventDefault();
        login();
    });

    function set_options() {

        var institutions = get_institutions();
        var selectInstitution = document.getElementById('institution');
        for(var i=0;i<institutions.length;i++) {
            var opt = document.createElement('option');
            opt.value = institutions[i].url;
            opt.innerHTML = institutions[i].name;
            selectInstitution.appendChild(opt);
        }

        chrome.storage.sync.get({
            edu_institution: '',
            edu_user: ''
        }, function(items) {
            document.getElementById('institution').value = items.edu_institution;
            document.getElementById('user').value = items.edu_user;
        });
    }
});


function split_words(string_words) {
    words = string_words.split(',');
    var words_list = [];
        for(var i=0,word;word=words[i];i++){
                words_list[i] = word.trim();
            }
    return words_list;
}

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

function set_WLO_form(ojson){
    const title = ojson.title;

    const description = ojson.description;

    var disciplines = ojson.disciplines;
    disciplines = disciplines.split(', ')

    var educontext = ojson.educational_context;
    educontext = educontext.split(', ')

    var keywords = ojson.keywords;
    keywords = keywords.split(', ')

    var lrt = ojson.new_lrt;
    lrt = lrt.split(', ')

    var dict = {"cclom:title":[title], "cclom:general_description":[description], "ccm:taxonid":disciplines, "ccm:educationalcontext":educontext, "cclom:general_keyword":keywords, "ccm:oeh_lrt":lrt };

    const decoded_url = JSON.stringify(dict);
    const encoded_url = encodeURIComponent(decoded_url);

    var base_WLO_url = "https://redaktion.openeduhub.net/edu-sharing/components/embed/mds?set=mds_oeh&group=wlo_upload_content&data=";
    var complete_WLO_url = base_WLO_url+encoded_url;
    load_WLO_url(complete_WLO_url);
}

function set_metadata_form(ojson){
    document.getElementById("title_id").value = ojson.title;
    document.getElementById("description_id").value = ojson.description;

    document.getElementById("kidra_disciplines_id").value = ojson.kidra_disciplines;
    document.getElementById("text_difficulty_id").value = ojson.text_difficulty;
    document.getElementById("reading_time_id").value = ojson.text_reading_time;
    document.getElementById("curriculum_id").value = ojson.curriculum;

    document.getElementById("discipline_id").value = ojson.disciplines;
    document.getElementById("educontext_id").value = ojson.educational_context;
    document.getElementById("keywords_id").value = ojson.keywords;
    let license = JSON.stringify(ojson.license)
    document.getElementById("license_id").value = license;
    document.getElementById("lrt_id").value = ojson.new_lrt;

}

function load_WLO_url(composed_url) {
    var myIframe = document.getElementById('wlo_iframe');
    myIframe.setAttribute("src", composed_url);
}

function fetchMetadata() {
    local_url = document.getElementById("url_id").value;
    fetch("http://127.0.0.1:5500/metadata", {
    // fetch("https://generic-crawler.staging.openeduhub.net/metadata", {
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

        sessionStorage.setItem("result_json", ojson);

        set_WLO_form(ojson);
        // set_metadata_form(ojson);
        

        const ul = document.querySelector("ul"),
        input = document.querySelector("input");
        // tagNumb = document.querySelector(".details span");

        let maxTags = 10,
        tags = ojson.disciplines;
        //countTags();
        //createTag();
        function countTags(){
            input.focus();
            // tagNumb.innerText = maxTags - tags.length;
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
        /*removeBtn.addEventListener("click", () =>{
            tags.length = 0;
            ul.querySelectorAll("li").forEach(li => li.remove());
            countTags();
        });*/




    }).catch((error) => {
        console.log(error)
    });
}

function persist_metadata(result_json) {
    fetch("http://127.0.0.1:5500/set_metadata", {
    // fetch("https://generic-crawler.staging.openeduhub.net/set_metadata", {
        method: 'post',
        body: result_json,
        headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json'
        }
    }).then((response) => {
        return response.json()
    }).then((res) => {        
        console.log(res)
        let result_code = res.code;
        let result_message = res.message;
        if (result_code == "0") {
            document.getElementById("persist_metadata_id").innerHTML = "Metadata successfully inserted in pre-staging Edu-sharing";
        } else {
            document.getElementById("persist_metadata_id").innerHTML = "Error inserting metadata in pre-staging Edu-sharing";
        }


    }).catch((error) => {
        document.getElementById("persist_metadata_id").innerHTML = "Error inserting metadata in pre-staging Edu-sharing";
        console.log(error)

    });
}


// options.js



function login() {


    // var selectInstitution = document.getElementById('institution');
    // var institution = selectInstitution.options[selectInstitution.selectedIndex].value;
    // var institutionName = selectInstitution.options[selectInstitution.selectedIndex].innerHTML;
    
    var institution;
    chrome.storage.sync.get(['edu_institution'], function(result) {
        //console.log('Value currently is ' + result.edu_institution);
        // institution = result.edu_institution;
        // institution = "https://redaktion.openeduhub.net/edu-sharing/";
        institution = "https://repository.staging.openeduhub.net/edu-sharing/";
        repoLogin(institution);
    });
}

function repoLogin(institution) {
    var user = document.getElementById('user').value;
    var password = document.getElementById('password').value;

    console.log('institution: '+institution);
    var xhr = new XMLHttpRequest();
    xhr.open("POST", institution + "oauth2/token", true);
    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.crossDomain = true;
    xhr.withCredentials = true;
    xhr.onreadystatechange = function() {
        console.log(xhr.status);
        if (xhr.readyState == 4 && xhr.status === 200) {
            chrome.storage.sync.set({
                edu_institution: institution,
                edu_institutionname: institution,
                edu_user: user,
                edu_accesstoken: JSON.parse(xhr.responseText).access_token,
                edu_refreshtoken: JSON.parse(xhr.responseText).refresh_token,
                edu_expires: Math.floor(Date.now() / 1000 + JSON.parse(xhr.responseText).expires_in)
            }, function() {
                set_status('success', 'Angemeldet als ' + user + ' bei ' + institution);
                document.getElementById('form_options').style.display = 'none';
                document.getElementById('logout').style.display = 'block';
                document.getElementById("persist_metadata_id").innerHTML = "User Logged in";
            });
        }
        set_status('error', 'Login fehlgeschlagen');
    }
    var post = 'grant_type=password&client_id=eduApp&client_secret=secret&username=' + user + '&password=' + password;
    xhr.send(post);
}

function get_institutions() {
    var institutions = new Array();
    var client = new XMLHttpRequest();
    client.open('GET', 'http://app-registry.edu-sharing.com/servers.php?version=all',false);
    client.onreadystatechange = function() {
        institutions = JSON.parse(client.responseText.trim());
    }
    client.send();
    return institutions;
}

function set_options() {

    var institutions = get_institutions();
    var selectInstitution = document.getElementById('institution');
    for(var i=0;i<institutions.length;i++) {
        var opt = document.createElement('option');
        opt.value = institutions[i].url;
        opt.innerHTML = institutions[i].name;
        selectInstitution.appendChild(opt);
    }

    chrome.storage.sync.get({
        edu_institution: '',
        edu_user: ''
    }, function(items) {
        document.getElementById('institution').value = items.edu_institution;
        document.getElementById('user').value = items.edu_user;
    });
}

function logout() {
    chrome.storage.sync.set({
        edu_institution: '',
        edu_user: '',
        edu_accesstoken: '',
        edu_refreshtoken: '',
        edu_expires: ''
    }, function() {
        document.getElementById('password').value = '';
        document.getElementById('options').style.display = 'block';
        document.getElementById("logout").style.display = 'none';
        set_status('success', 'Erfolgreich abgemeldet');
    });
    set_options();

}

function refresh_tokens() {
    chrome.storage.sync.get({
        edu_refreshtoken: '',
        edu_institution: ''
    }, function(items) {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", items.edu_institution + "oauth2/token", true);
        xhr.setRequestHeader("Accept", "application/json");
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.crossDomain = true;
        xhr.withCredentials = true;
        xhr.onreadystatechange = function() {
            console.log(xhr.status);
            if (xhr.readyState == 4 && xhr.status === 200) {
                chrome.storage.sync.set({
                    edu_accesstoken: JSON.parse(xhr.responseText).access_token,
                    edu_refreshtoken: JSON.parse(xhr.responseText).refresh_token,
                    edu_expires: Math.floor(Date.now() / 1000 + JSON.parse(xhr.responseText).expires_in)
                }, function() {
                    set_status('success', 'Angemeldet als ' + user + ' bei ' + institutionName);
                    document.getElementById('options').style.display = 'none';
                    document.getElementById('logout').style.display = 'block';
                });

                chrome.storage.sync.get({
                    edu_accesstoken: '',
                    edu_institution: ''
                }, function(items) {

                });


                var xhr = new XMLHttpRequest();
                xhr.open("GET", items.edu_institution + "oauth2/token", true);
                xhr.setRequestHeader("Accept", "application/json");
                xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
                xhr.crossDomain = true;
                xhr.withCredentials = true;
                xhr.onreadystatechange = function() {
                    console.log(xhr.status);
                    if (xhr.readyState == 4 && xhr.status === 200) {

                    }
                    set_status('error', 'Login fehlgeschlagen');
                }
                xhr.send();

            }
            set_status('error', 'Login fehlgeschlagen');
        }
        var post = 'grant_type=refresh_token&refresh_token='+items.edu_refreshtoken+'&client_id=eduApp&client_secret=secret';
        xhr.send(post);
    });
}

function get_status() {
    chrome.storage.sync.get({
        edu_refreshtoken: ''
    }, function(items) {
        if(items.edu_refreshtoken) {
            refresh_tokens();
        }
    });
}

window.addEventListener("message", receiveMessage, false);
function receiveMessage(event){
    if(event.data.event=="ENDPOINT_CHOSEN"){ // Event Name hier festlegen
        //alert("You opened "+event.data.data +", excellent choice!"); // Data Objekt liegt unter event.data.data
        document.getElementById('institution-frame').style.display = 'none';
        var iFrame = document.getElementById("institution-frame");
        iFrame.parentNode.removeChild(iFrame);

        document.getElementById('form_options').style.display = 'block';
        chrome.storage.sync.set({
            edu_institution: event.data.data
        }, function() {
            console.log('edu_institution-value is set to ' + event.data.data);
            localStorage.setItem("edu_institution", event.data.data);

        });
    }
}

set_status('', 'Nicht angemeldet');
document.addEventListener('DOMContentLoaded', set_options);
// implement document.addEventListener('DOMContentLoaded', get_status);


document.getElementById("logout").addEventListener("click", logout);
