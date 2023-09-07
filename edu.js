
function pushUrlToRepo(url) {
    chrome.storage.sync.get({
        edu_accesstoken: '',
        edu_institution: '',
        edu_institutionname: ''
    }, function(items) {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", items.edu_institution+"rest/node/v1/nodes/-home-/-inbox-/children?type=ccm%3Aio&renameIfExists=true&versionComment=MAIN_FILE_UPLOAD", true);
        xhr.setRequestHeader("Content-type", "application/json");
        xhr.setRequestHeader("Accept", "application/json");
        xhr.crossDomain = true;
        xhr.withCredentials = true;
        xhr.setRequestHeader("Authorization", "Bearer " + items.edu_accesstoken);
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4 && xhr.status === 200) {
                var notification = new Notification("Seite wurde in Ihrer Inbox auf " + items.edu_institutionname + " abgelegt.");
            }
        }
        var post = '{"ccm:wwwurl":["'+url+'"]}';
        xhr.send(post);
    });
}

function createNode(url, callback) {
    chrome.storage.sync.get({
        edu_accesstoken: '',
        edu_institution: ''
    }, function(items) {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", items.edu_institution+"rest/node/v1/nodes/-home-/-inbox-/children?type=ccm%3Aio&renameIfExists=true&versionComment=MAIN_FILE_UPLOAD", true);
        xhr.setRequestHeader("Content-type", "application/json");
        xhr.setRequestHeader("Accept", "application/json");
        xhr.crossDomain = true;
        xhr.withCredentials = true;
        xhr.setRequestHeader("Authorization", "Bearer " + items.edu_accesstoken);
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4 && xhr.status === 200) {
                var node = JSON.parse(xhr.responseText);
                callback(node.node.ref.id);
            }
        }
        var post = '{"cm:name":["Textsnippet von '+url+'"]}';
        xhr.send(post);
    });
}

function saveText(nodeId, text) {
    chrome.storage.sync.get({
        edu_accesstoken: '',
        edu_institution: '',
        edu_institutionname: ''
    }, function(items) {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", items.edu_institution+"rest/node/v1/nodes/-home-/"+nodeId+"/textContent?mimetype=text%2Fplain", true);
        xhr.setRequestHeader("Content-type", "multipart/form-data");
        xhr.setRequestHeader("Accept", "application/json");
        xhr.crossDomain = true;
        xhr.withCredentials = true;
        xhr.setRequestHeader("Authorization", "Bearer " + items.edu_accesstoken);
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4 && xhr.status === 200) {
                var notification = new Notification("Textsnippet wurde in Ihrer Inbox auf " + items.edu_institutionname + " abgelegt.");
            }
        }
        var post = text;
        xhr.send(post);
    });
}

function createImageNode(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "http://edu40.edu-sharing.de/edu-sharing/rest/node/v1/nodes/-home-/-inbox-/children?type=ccm%3Aio&renameIfExists=true&versionComment=MAIN_FILE_UPLOAD", true);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.setRequestHeader("Accept", "application/json");
    xhr.crossDomain = true;
    xhr.withCredentials = true;
    xhr.setRequestHeader("Authorization", "Basic VGVzdEhhY2thdGhvbjE3MDY6VGVzdEhhY2thdGhvbjE3MDY=");
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status === 200) {
            var node = JSON.parse(xhr.responseText);
            callback(node.node.ref.id);
        }
    }
    var post = '{"cm:name":["Bild von '+url+'"]}';
    xhr.send(post);
}

function setImageContent(nodeId, formdata, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "http://edu40.edu-sharing.de/edu-sharing/rest/node/v1/nodes/-home-/"+nodeId+"/content?versionComment=MAIN_FILE_UPLOAD&mimetype=image%2Fpng", true);
    xhr.setRequestHeader("Content-type", "multipart/form-data");
    xhr.setRequestHeader("Accept", "text/html");
    xhr.crossDomain = true;
    xhr.withCredentials = true;
    xhr.setRequestHeader("Authorization", "Basic VGVzdEhhY2thdGhvbjE3MDY6VGVzdEhhY2thdGhvbjE3MDY=");
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status === 200) {
            var notification = new Notification("Bild wurde in Ihrer Inbox abgelegt.");
        }
    }
    xhr.send(formdata);
}

/*
chrome.browserAction.onClicked.addListener(function(tab) {
    var url = tab.url;
    console.assert(typeof url == 'string', 'tab.url should be a string');
    pushUrlToRepo(url);
});
*/

chrome.contextMenus.create({
    title: "An Inbox senden",
    contexts: ["selection", "image"],
    id: "edu-sharing"
});

chrome.contextMenus.onClicked.addListener(function(clickData) {
    console.log(clickData);
   /* if(clickData.mediaType == 'image') {

        var xhr = new XMLHttpRequest();
        xhr.open('GET', clickData.srcUrl, true);
        xhr.crossDomain = true;
        xhr.responseType = 'arraybuffer';
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4 && xhr.status === 200) {
                var bb = new Blob(xhr.response);
                //bb.append(xhr.response);

                bb.lastModifiedDate = new Date();
                bb.name = 'img.png';

                var blob = bb.getBlob('image/png');
                var file = new File(blob, "Image.jpg");
                var formData = new FormData();
                formData.append("file", bb);
console.log(formData);
                createImageNode(clickData.pageUrl, function (nodeId) {
                    console.log(nodeId);
                    setImageContent(nodeId, formData);
                });


            }


        }

        xhr.send();
    }
*/
    if(clickData.menuItemId == 'edu-sharing' && clickData.selectionText) {
        createNode(clickData.pageUrl, function(nodeId) {
            saveText(nodeId, clickData.selectionText);
        });
    }
});
