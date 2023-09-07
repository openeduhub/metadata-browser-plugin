

chrome.tabs.query({'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT},
    function(tabs){
        //alert(tabs[0].url);
        chrome.storage.sync.get({
            edu_institution: '',
        }, function(items) {
            document.getElementById("collection_iframe").src = items.edu_institution+'components/share-link?url='+tabs[0].url;
        });

    }
);

window.addEventListener("message", receiveMessage, false);
function receiveMessage(event){
    if(event.data.event=='SHARED'){ // Event Name hier festlegen
        window.close();
        //alert("You opened "+event.data.data +", excellent choice!"); // Data Objekt liegt unter event.data.data
        document.getElementById('collection_iframe').style.display = 'none';
        var iFrame = document.getElementById("collection_iframe");
        iFrame.parentNode.removeChild(iFrame);
    }
}




