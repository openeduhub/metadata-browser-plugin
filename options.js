
function set_status(status, message) {
    document.getElementById('status').innerHTML = message;
}

function login() {

/*
    var selectInstitution = document.getElementById('institution');
    var institution = selectInstitution.options[selectInstitution.selectedIndex].value;
    var institutionName = selectInstitution.options[selectInstitution.selectedIndex].innerHTML;
    */
    var institution;
    chrome.storage.sync.get(['edu_institution'], function(result) {
        //console.log('Value currently is ' + result.edu_institution);
        institution = result.edu_institution;
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
                document.getElementById('options').style.display = 'none';
                document.getElementById('logout').style.display = 'block';
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

        document.getElementById('options').style.display = 'block';
        chrome.storage.sync.set({
            edu_institution: event.data.data
        }, function() {
            console.log('edu_institution-value is set to ' + event.data.data);
        });
    }
}

set_status('', 'Nicht angemeldet');
document.addEventListener('DOMContentLoaded', set_options);
// implement document.addEventListener('DOMContentLoaded', get_status);
document.getElementById("options").addEventListener("submit", function(event){
    event.preventDefault();
    login();
});

document.getElementById("logout").addEventListener("click", logout);
