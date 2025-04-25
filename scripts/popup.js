/**
 * This file is part of the WLO Browser Extension.
 *
 * Copyright (C) 2025 Harald Holzmann, Various Interactive GmbH
 * Contact: harald@various.at
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

document.addEventListener("DOMContentLoaded", function () {
    checkLoginStatus();
    loadSystemOptions();

    document.getElementById("login-btn").addEventListener("click", login);

    document.getElementById("propose-work-btn").addEventListener("click", async function () {
        showSpinner();

        document.getElementById("auth-container").classList.add("hidden");

        const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
        const url = tab.url;

        const result = await checkUrl(url);
        
        if (result.alreadyExists) {
            window.close();

            const node = result.node;

            chrome.tabs.sendMessage(tab.id, {
                action: "showInfoFrame",
                node,
                new: true
            });
        } else {
            openSubmissionForm(url);
        }
    });

    document.getElementById("forgot-password").addEventListener("click", function () {
        let systemSelect = document.getElementById("system-select");
        let selectedOption = systemSelect.options[systemSelect.selectedIndex];
        let systemUrl = selectedOption.getAttribute("data-url");

        if (selectedOption.text.includes("WLO") || selectedOption.text.includes("WirLernenOnline")) {
            systemUrl = defaultConfig.auth.wloPasswordResetUrl;
        } else {
            systemUrl = systemUrl + defaultConfig.auth.passwordResetUrl;
        }

        chrome.tabs.create({url: systemUrl});
    });

    document.getElementById("register").addEventListener("click", function () {
        let systemSelect = document.getElementById("system-select");
        let selectedOption = systemSelect.options[systemSelect.selectedIndex];
        let systemUrl = selectedOption.getAttribute("data-url");

        if (selectedOption.text.includes("WLO") || selectedOption.text.includes("WirLernenOnline")) {
            systemUrl = defaultConfig.auth.wloRegisterUrl;
        } else {
            systemUrl = systemUrl + defaultConfig.auth.registerUrl;
        }

        chrome.tabs.create({url: systemUrl});
    });

    document.getElementById("start-btn").addEventListener("click", async function () {
        showSpinner();

        document.getElementById("main-content").classList.add("hidden");

        const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
        const url = tab.url;

        const result = await checkUrl(url);
        
        if (result.alreadyExists) {
            window.close();

            const node = result.node;

            chrome.tabs.sendMessage(tab.id, {
                action: "showInfoFrame",
                node,
                new: true
            });
        } else {
            openSubmissionForm(url);
        }

    });

    document.getElementById("help-btn").addEventListener("click", function () {
        chrome.tabs.create({url: "https://wirlernenonline.de/faq/"});
    });

    document.getElementById("settings-btn").addEventListener("click", function () {
        chrome.runtime.openOptionsPage();
    });
});

async function openSubmissionForm(currentUrl) {
    const myHeaders = new Headers();
    myHeaders.append("X-API-Key", defaultConfig.crawler.apiKey);

    const requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow"
    };

    let crawlerResponse;
    try {
        crawlerResponse = await fetch(defaultConfig.crawler.url + `?url=${encodeURIComponent(currentUrl)}`, requestOptions);
        if (!crawlerResponse.ok) {
            throw new Error(`HTTP-Fehler: ${crawlerResponse.status} ${crawlerResponse.statusText}`);
        }
    } catch(error) {
        console.error("Fehler beim Crawler-Request:", error.message);
        hideSpinner();
        showErrorScreen(error.message);
    }

    hideSpinner();
    let crawlerData = await crawlerResponse.json();
    let formData = buildFormData(crawlerData);

    let encodedData = encodeURIComponent(JSON.stringify(formData));

    chrome.storage.local.get(["selectedSystemUrl"], async (data) => {
        let formUrl = data.selectedSystemUrl + `${defaultConfig.formUrl}&data=${encodedData}`;
        if (!data.selectedSystemUrl) {
            formUrl = `${defaultConfig.publishPublic.formUrl}&data=${encodedData}`;
        }

        document.getElementById("main-content").style.display = "none";
        document.getElementById("help-btn").style.display = "none";
        document.getElementById("settings-btn").style.display = "none";
        document.getElementById("propose-work-btn").style.display = "none";

        let formFrame = document.getElementById("form-frame");
        formFrame.src = formUrl;
        formFrame.classList.remove("hidden");
        hideSpinner();
    });
}

async function loadSystemOptions() {
    try {
        let response = await fetch(defaultConfig.systems);
        let systems = await response.json();
        let systemSelect = document.getElementById("system-select");

        systemSelect.innerHTML = "";
        systems.forEach(system => {
            if (system.name === "WLO (staging)") {
                let option = document.createElement("option");
                option.value = system.name;
                option.textContent = "WLO (Staging)";
                option.dataset.url = system.url;
                systemSelect.appendChild(option);
            } else {
                let option = document.createElement("option");
                option.value = system.name;
                option.textContent = system.name;
                option.dataset.url = system.url;
                //TODO: Uncomment if other systems than staging should be used
                //systemSelect.appendChild(option);
            }
        });
    } catch (error) {
    }
}

async function checkLoginStatus() {
    chrome.storage.local.get(["authToken", "selectedSystem", "selectedSystemUrl"], async (data) => {
        if (data.authToken && data.selectedSystem && data.selectedSystemUrl) {
            try {
                let response = await fetch(data.selectedSystemUrl + defaultConfig.auth.loginUrl, {
                    method: "GET",
                    headers: {
                        "Authorization": `Basic ${data.authToken}`,
                        "Accept": "application/json"
                    }
                });

                let result = await response.json();

                if (result.statusCode === "OK") {
                    showPublishMenu();

                    const proposeWorkBtn = document.getElementById("propose-work-btn");
                    if (proposeWorkBtn) {
                        proposeWorkBtn.style.display = "none";
                    }

                } else {
                    showLoginForm();
                }
            } catch (error) {
                showLoginForm();
            }
        } else {
            showLoginForm();
        }
    });
}

function showLoginForm() {
    document.getElementById("auth-container").classList.remove("hidden");
    document.getElementById("main-content").classList.add("hidden");
}

function showPublishMenu() {
    document.getElementById("auth-container").classList.add("hidden");
    document.getElementById("main-content").classList.remove("hidden");
}

async function login() {
    let username = document.getElementById("username").value.trim();
    let password = document.getElementById("password").value.trim();

    let systemSelect = document.getElementById("system-select");
    let selectedOption = systemSelect.options[systemSelect.selectedIndex];
    let systemUrl = selectedOption.getAttribute("data-url");

    if (username.length < 3 || password.length < 3) {
        showErrorMessage("❌ Benutzername und Passwort müssen mindestens 3 Zeichen lang sein.");
        return;
    }

    hideErrorMessage();

    let authToken = btoa(`${username}:${password}`);

    let loginUrl = systemUrl + defaultConfig.auth.loginUrl;

    try {
        let response = await fetch(loginUrl, {
            method: "GET",
            headers: {
                "Authorization": `Basic ${authToken}`,
                "Accept": "application/json"
            }
        });

        let result = await response.json();

        if (result.statusCode === "OK") {
            chrome.storage.local.set({
                authToken: authToken,
                selectedSystem: systemSelect.value,
                username: username,
                selectedSystemUrl: systemUrl
            });

            document.getElementById("login-success-message").classList.add("visible");
            document.getElementById("login-success-message").classList.remove("hidden");
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } else {
            showErrorMessage("Login fehlgeschlagen. Bitte überprüfe deine Zugangsdaten.");
        }
    } catch (error) {
        showErrorMessage("Netzwerkfehler. Bitte versuche es später erneut.");
    }
}

function showErrorMessage(message) {
    let errorMessage = document.getElementById("error-message");
    if (errorMessage) {
        errorMessage.textContent = message;
        errorMessage.classList.remove("hidden");
        errorMessage.classList.add("visible");
        errorMessage.style.display = "block";
    }
}

function hideErrorMessage() {
    let errorMessage = document.getElementById("error-message");
    if (errorMessage) {
        errorMessage.classList.add("hidden");
        errorMessage.classList.remove("visible");
        errorMessage.style.display = "none";
        errorMessage.textContent = "";
    }
}

window.addEventListener("message", (event) => {
    chrome.storage.local.get(["selectedSystemUrl"], async (data) => {
        let formEventOrigin = "";
        if (data.selectedSystemUrl) {
            formEventOrigin = data.selectedSystemUrl.replaceAll('/edu-sharing/', '');
        }

        if (event.data.event === 'POST_DATA') {
            if (event.origin === formEventOrigin || event.origin === defaultConfig.publishPublic.eventOrigin) {
                sendPostData(event);
            }
        }
    });
});

async function sendPostData(event) {
    chrome.storage.local.get(["authToken", "selectedSystemUrl"], async (data) => {
        let formFrame = document.getElementById("form-frame");
        formFrame.classList.add("hidden");

        showSpinner();

        if (!data.authToken) {
            await proposeWorkAsGuest(event, data);
        } else {
            await saveToRepository(event, data);
        }

        hideSpinner();
    });
}

async function proposeWorkAsGuest(event, data) {
    const username = defaultConfig.publishPublic.username;
    const password = defaultConfig.publishPublic.password;
    const createNodeUrl = defaultConfig.publishPublic.createNode;

    const authHeader = "Basic " + btoa(`${username}:${password}`);

    let formData = event.data.data;

    try {
        const createNodeResponse = await fetch(createNodeUrl,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Authorization": authHeader
                },
                body: buildMetaData(formData)
            }
        );

        if (!createNodeResponse.ok) {
            throw new Error("Fehler beim Erstellen des Knotens.");
        }

        const createNodeData = await createNodeResponse.json();
        const nodeId = createNodeData.node.ref.id;

        await setMetadata(nodeId, formData, createNodeData);
    } catch (error) {
        showErrorScreen()
    }
}

function buildMetaData(eventData) {
    const updatedData = JSON.parse(JSON.stringify(eventData));
    if (updatedData?.["ccm:custom_license"]?.[0]) {
        const licenseUrl = updatedData["ccm:custom_license"][0];
        const license = licenseUrl.substring(licenseUrl.lastIndexOf('/') + 1);

        if (license.endsWith('_40')) {
            updatedData['ccm:commonlicense_key'] = [license.slice(0, -3)];
            updatedData['ccm:commonlicense_cc_version'] = ['4.0'];
        } else if (license === 'OTHER') {
            updatedData['ccm:commonlicense_key'] = 'CUSTOM';
        } else {
            updatedData['ccm:commonlicense_key'] = [license];
        }
    }

    return JSON.stringify(updatedData);
}

async function setMetadata(nodeId, data, createNodeData) {
    const username = defaultConfig.publishPublic.username;
    const password = defaultConfig.publishPublic.password;
    const addMetadataUrl = defaultConfig.publishPublic.addMetadata;
    const authHeader = "Basic " + btoa(`${username}:${password}`);

    try {
        const metadataResponse = await fetch(`${addMetadataUrl}${nodeId}/metadata?versionComment=WLO-Browser-Extension`,
            {
                method: "POST",
                headers: {
                    "Authorization": authHeader,
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: buildMetaData(data)
            }
        );

        if (!metadataResponse.ok) {
            throw new Error("Fehler beim Speichern der Metadaten");
        }

        await setCollections(nodeId, data, createNodeData);
    } catch (error) {
        showErrorScreen();
    }
}

async function startWorkflow(nodeId, data, createNodeData) {
    const username = defaultConfig.publishPublic.username;
    const password = defaultConfig.publishPublic.password;
    const startWorkflowUrl = defaultConfig.publishPublic.startWorflow;
    const authHeader = "Basic " + btoa(`${username}:${password}`);

    const workflowPayload = {
        "receiver": [
            {
                "authorityName": "GROUP_ORG_WLO-Uploadmanager"
            }
        ],
        "comment": "Upload via Browser-Extension",
        "status": "200_tocheck"
    };

    try {
        const workflowResponse = await fetch(
            `${startWorkflowUrl}${nodeId}/workflow`,
            {
                method: "PUT",
                headers: {
                    "Authorization": authHeader,
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify(workflowPayload)
            }
        );

        if (!workflowResponse.ok) {
            throw new Error(`Fehler beim Starten des Workflows`);
        }

        window.close();

        const [tab] = await chrome.tabs.query({active: true, currentWindow: true});

        chrome.tabs.sendMessage(tab.id, {
            action: "showInfoFrame",
            node: createNodeData
        });

    } catch (error) {
        showErrorScreen(error.message);
    }
}

function showErrorScreen() {
    document.getElementById("main-content").style.display = "none";
    document.getElementById("form-frame").classList.add("hidden");

    let errorContainer = document.createElement("div");
    errorContainer.classList.add("error-container");
    errorContainer.innerHTML = `
        <p style="color: red; font-weight: bold;">Ein unbekannter Fehler ist aufgetreten</p>
        <button id="restart-btn" style="margin-top: 10px; padding: 10px; background: #0056b3; color: white; border: none; cursor: pointer;">
            Nocheinmal versuchen
        </button>
    `;

    document.body.appendChild(errorContainer);

    document.getElementById("restart-btn").addEventListener("click", function () {
        window.location.reload();
    });
}

async function saveToRepository(event, data) {
    const response = await fetch(data.selectedSystemUrl + defaultConfig.saveUrl, {
        method: "POST",
        headers: {
            "Authorization": `Basic ${data.authToken}`,
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: buildMetaData(event.data.data)
    });

    let result = await response.json();

    if (response.status === 200) {
        document.getElementById("form-frame").classList.add("hidden");

        const [tab] = await chrome.tabs.query({active: true, currentWindow: true});

        const node = result.node;

        const nodeId = node.ref.id;
        setCollections(nodeId, event.data.data);

        chrome.tabs.sendMessage(tab.id, {
            action: "showInfoFrame",
            node
        });

        window.close();
    } else {
        let errorMessage = document.createElement("p");
        errorMessage.innerHTML = "❌ Fehler beim Speichern. Bitte versuche es später erneut.";
        errorMessage.style.color = "red";
        errorMessage.style.fontWeight = "bold";
        errorMessage.style.textAlign = "center";
        document.body.appendChild(errorMessage);
    }
}

function buildFormData(crawlerData) {
    let title = "";
    let description = "";
    let url = "";
    let taxon = "";
    let keyword = "";
    let licenseVersion = "";
    let licenseKey = "";

    if (crawlerData.lom && crawlerData.lom.general && crawlerData.lom.general.title) {
        title = crawlerData.lom.general.title;
    }

    if (crawlerData.lom && crawlerData.lom.general && crawlerData.lom.general.description) {
        description = crawlerData.lom.general.description;
    }

    if (!description &&
        crawlerData.ai_prompts &&
        Array.isArray(crawlerData.ai_prompts) &&
        crawlerData.ai_prompts.length > 0 &&
        Array.isArray(crawlerData.ai_prompts[0].ai_response) &&
        crawlerData.ai_prompts[0].ai_response.length > 0
    ) {
        try {
            let aiResponse = JSON.parse(crawlerData.ai_prompts[0].ai_response[0]);
            if (aiResponse.description) {
                description = aiResponse.description;
            }
        } catch (error) {
        }
    }

    if (crawlerData.sourceId) {
        url = crawlerData.sourceId;
    }

    if (crawlerData.valuespaces && crawlerData.valuespaces.discipline) {
        taxon = crawlerData.valuespaces.discipline;
    }

    if ((!taxon || (Array.isArray(taxon) && taxon.length === 0)) &&
        crawlerData.kidra_raw &&
        crawlerData.kidra_raw.kidraDisciplines) {
        taxon = crawlerData.kidra_raw.kidraDisciplines;
    }

    if (crawlerData.lom && crawlerData.lom.general && crawlerData.lom.general.keyword) {
        keyword = crawlerData.lom.general.keyword;
    }

    if ((!keyword || (Array.isArray(keyword) && keyword.length === 0)) &&
        crawlerData.ai_prompts &&
        Array.isArray(crawlerData.ai_prompts) &&
        crawlerData.ai_prompts.length > 0 &&
        Array.isArray(crawlerData.ai_prompts[0].ai_response) &&
        crawlerData.ai_prompts[0].ai_response.length > 0
    ) {
        try {
            let aiResponse = JSON.parse(crawlerData.ai_prompts[0].ai_response[0]);
            if (aiResponse.keywords) {
                keyword = aiResponse.keywords;
            }
        } catch (error) {
        }
    }

    if (crawlerData.license && crawlerData.license.url) {
        const match = crawlerData.license.url.match(/creativecommons\.org\/licenses\/([a-z\-]+)\/(\d+\.\d+)/i);
        if (match) {
            licenseKey = `CC_${match[1].toUpperCase().replace(/-/g, "_")}`;
            licenseVersion = match[2];
        }
    }

    return {
        "cclom:title": [title],
        "cclom:general_description": [description],
        "ccm:wwwurl": [url],
        "ccm:taxonid": taxon,
        "cclom:general_keyword": keyword,
        "ccm:commonlicense_cc_version": [licenseVersion],
        "ccm:commonlicense_key": [licenseKey],
    };
}

async function setCollections(nodeId, data, createNodeData) {
    const username = defaultConfig.publishPublic.username;
    const password = defaultConfig.publishPublic.password;
    const addCollectionUrl = defaultConfig.publishPublic.addCollection;
    const authHeader = "Basic " + btoa(`${username}:${password}`);

    const collectionUrls = data?.['virtual:collection_id_primary'] || [];

    for (const collectionUrl of collectionUrls
        .filter(url => url && url.trim())
        .map(url => url.substring(url.lastIndexOf('/') + 1))) {
        try {

            await fetch(
                `${addCollectionUrl}${collectionUrl}/references/${nodeId}`,
                {
                    method: "PUT",
                    headers: {
                        "Authorization": authHeader,
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    }
                }
            );
        } catch (error) {
        }
    }

    if (createNodeData) {
        await startWorkflow(nodeId, data, createNodeData);
    }
}