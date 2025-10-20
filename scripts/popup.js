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
    console.log('🚀 Popup loaded');
    
    checkLoginStatus();
    loadSystemOptions();

    // Login button
    const loginBtn = document.getElementById("login-btn");
    if (loginBtn) {
        loginBtn.addEventListener("click", login);
        console.log('✅ Login button event listener registered');
    } else {
        console.error('❌ Login button not found');
    }

    // Propose work button (Guest mode)
    const proposeWorkBtn = document.getElementById("propose-work-btn");
    if (proposeWorkBtn) {
        proposeWorkBtn.addEventListener("click", async function () {
            console.log('📤 Propose work button clicked (Guest mode)');
            
            try {
                showSpinner();
                document.getElementById("auth-container").classList.add("hidden");

                const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
                console.log('🔍 Current tab:', tab.id, tab.url);
                const url = tab.url;

                console.log('🔎 Checking if URL already exists...');
                const result = await checkUrl(url);
                console.log('✅ URL check result:', result);
                
                if (result.alreadyExists) {
                    console.log('ℹ️ URL already exists, showing info frame');
                    window.close();

                    const node = result.node;

                    chrome.tabs.sendMessage(tab.id, {
                        action: "showInfoFrame",
                        node,
                        new: true
                    });
                } else {
                    console.log('✨ URL is new, opening submission form');
                    await openSubmissionForm(url);
                }
            } catch (error) {
                console.error('❌ Propose work button error:', error);
                console.error('❌ Stack:', error.stack);
                alert('Fehler: ' + error.message);
                hideSpinner();
            }
        });
        console.log('✅ Propose work button event listener registered');
    } else {
        console.error('❌ Propose work button not found in DOM');
    }

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

    // Start button (User mode)
    const startBtn = document.getElementById("start-btn");
    if (startBtn) {
        startBtn.addEventListener("click", async function () {
            console.log('▶️ Start button clicked (User mode)');
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
        console.log('✅ Start button event listener registered');
    } else {
        console.error('❌ Start button not found in DOM');
    }

    document.getElementById("help-btn").addEventListener("click", function () {
        chrome.tabs.create({url: "https://wirlernenonline.de/faq/"});
    });

    document.getElementById("settings-btn").addEventListener("click", function () {
        chrome.runtime.openOptionsPage();
    });
});

async function openSubmissionForm(currentUrl) {
    console.log('📋 openSubmissionForm called with URL:', currentUrl);
    console.log('🔍 Current URL:', currentUrl);
    try {
        await openCanvasWithExtraction(currentUrl);
        console.log('✅ openCanvasWithExtraction completed');
    } catch (error) {
        console.error('❌ openSubmissionForm failed:', error);
        console.error('❌ Error stack:', error.stack);
        alert('Fehler beim Öffnen der Canvas-Komponente: ' + error.message);
        hideSpinner();
    }
}

/**
 * Format extracted page data as readable text for Canvas textarea
 */
function formatPageDataAsText(dataPackage) {
    let text = '';
    
    // Title
    if (dataPackage.title) {
        text += `Titel: ${dataPackage.title}\n\n`;
    }
    
    // URL
    text += `URL: ${dataPackage.url}\n\n`;
    
    // Meta Description
    if (dataPackage.meta?.description) {
        text += `Beschreibung: ${dataPackage.meta.description}\n\n`;
    }
    
    // Meta Keywords
    if (dataPackage.meta?.keywords) {
        text += `Keywords: ${dataPackage.meta.keywords}\n\n`;
    }
    
    // Author
    if (dataPackage.meta?.author) {
        text += `Autor: ${dataPackage.meta.author}\n\n`;
    }
    
    // Crawler Data (if available)
    if (dataPackage.crawlerData) {
        text += `--- Generischer Crawler Daten ---\n`;
        if (dataPackage.crawlerData.title) {
            text += `Crawler Titel: ${dataPackage.crawlerData.title}\n`;
        }
        if (dataPackage.crawlerData.description) {
            text += `Crawler Beschreibung: ${dataPackage.crawlerData.description}\n`;
        }
        text += `\n`;
    }
    
    // Main Content (first 3000 chars)
    const content = dataPackage.content?.main || dataPackage.content?.cleaned || '';
    if (content) {
        text += `Inhalt:\n${content.substring(0, 3000)}`;
    }
    
    return text;
}

async function openCanvasWithExtraction(currentUrl) {
    console.log('🎨 openCanvasWithExtraction called');
    const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    
    try {
        // 1. Extract page content
        console.log('📄 Extracting page content...');
        const pageData = await chrome.tabs.sendMessage(tab.id, {
            action: 'extractContent'
        });
        
        if (!pageData || !pageData.success) {
            console.error('❌ Content extraction failed:', pageData);
            throw new Error('Content extraction failed');
        }
        
        console.log('✅ Page content extracted:', pageData.data.url);
        
        // 2. Get auth data
        const authData = await chrome.storage.local.get([
            'authToken', 
            'selectedSystemUrl', 
            'username'
        ]);
        
        // 3. Optional: Get crawler data
        let crawlerData = null;
        try {
            const crawlerResponse = await fetch(
                `${defaultConfig.crawler.url}?url=${encodeURIComponent(currentUrl)}`,
                {
                    headers: { 'X-API-Key': defaultConfig.crawler.apiKey }
                }
            );
            if (crawlerResponse.ok) {
                crawlerData = await crawlerResponse.json();
                console.log(' Crawler data loaded');
            }
        } catch (e) {
            console.log(' Crawler not available, continuing without');
        }
        
        // 4. Build data package
        const dataPackage = {
            // Page data from content-extractor
            url: pageData.data.url,
            title: pageData.data.title,
            content: pageData.data.content,
            meta: pageData.data.meta,
            structuredData: pageData.data.structuredData,
            
            // Optional crawler data
            crawlerData: crawlerData,
            
            // User info
            userInfo: {
                isLoggedIn: !!authData.authToken,
                username: authData.username || 'Gast',
                systemName: authData.selectedSystemUrl?.includes('staging') ? 'WLO Staging' : 'WLO'
            }
        };
        
        // 5. Build Canvas URL (with URL params as fallback)
        const canvasUrl = new URL(defaultConfig.canvas.url);
        canvasUrl.searchParams.set('mode', 'browser-extension');
        canvasUrl.searchParams.set('theme', 'edu-sharing');
        
        const encodedData = btoa(encodeURIComponent(JSON.stringify(dataPackage)));
        canvasUrl.searchParams.set('data', encodedData);
        
        // 6. Open Canvas in content script
        console.log('🚀 Opening Canvas with URL:', canvasUrl.toString());
        console.log('📦 Sending page data:', {
            url: dataPackage.url,
            title: dataPackage.title,
            hasContent: !!dataPackage.content,
            isLoggedIn: dataPackage.userInfo.isLoggedIn
        });
        
        // Send BOTH: URL (with params as fallback) AND pageData (for postMessage)
        const response = await chrome.tabs.sendMessage(tab.id, {
            action: 'openCanvas',
            canvasUrl: canvasUrl.toString(),  // URL with params (fallback)
            pageData: {
                url: dataPackage.url,
                title: dataPackage.title,
                html: dataPackage.content?.main || dataPackage.content?.cleaned || '',
                text: formatPageDataAsText(dataPackage),
                metadata: {
                    meta: dataPackage.meta,
                    structuredData: dataPackage.structuredData,
                    crawlerData: dataPackage.crawlerData
                },
                mode: 'browser-extension'
            }
        });
        
        console.log('✅ Canvas opened successfully:', response);
        hideSpinner();
        window.close();
        
    } catch (error) {
        console.error('❌ openCanvasWithExtraction failed:', error);
        console.error('Error stack:', error.stack);
        hideSpinner();
        alert('Fehler beim Öffnen der Canvas:\n' + error.message + '\n\nBitte öffne die Browser-Console (F12) für Details.');
    }
}

async function loadSystemOptions() {
    try {
        // ONLY STAGING - Use local config instead of remote systems
        let systemSelect = document.getElementById("system-select");
        systemSelect.innerHTML = "";
        
        // Add only enabled repositories from config
        Object.entries(defaultConfig.repository).forEach(([key, repo]) => {
            if (repo.enabled) {
                let option = document.createElement("option");
                option.value = key;
                option.textContent = repo.name;
                option.dataset.url = repo.baseUrl;
                systemSelect.appendChild(option);
            }
        });
        
        // Fallback if no repository is enabled (should not happen)
        if (systemSelect.options.length === 0) {
            let option = document.createElement("option");
            option.value = "staging";
            option.textContent = "WLO Staging";
            option.dataset.url = "https://repository.staging.openeduhub.net/edu-sharing/";
            systemSelect.appendChild(option);
        }
        
        console.log('✅ Loaded repositories (staging only):', systemSelect.options.length);
    } catch (error) {
        console.error('Failed to load system options:', error);
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