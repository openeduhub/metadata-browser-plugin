document.querySelectorAll('[data-locale]').forEach(elem => {
    console.log("replace i18n keys with messages")
    elem.innerText = chrome.i18n.getMessage(elem.dataset.locale)
})