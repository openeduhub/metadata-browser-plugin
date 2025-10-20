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

// VERSION CHECK: 2025-01-19-v9 - Fixed Array normalization (critical!)
console.log('🔧 WLO Plugin Background Script loaded - VERSION 2025-01-19-v9');

importScripts('../settings/config.js');

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "logout") {
        chrome.storage.local.remove("authToken");
    }
    
    // Handle metadata from Canvas
    if (request.action === "saveMetadata") {
        handleMetadataSave(request.metadata).then(sendResponse);
        return true; // Async response
    }
});

async function handleMetadataSave(metadata) {
    console.log('📥 Received metadata from Canvas:', metadata);
    
    // Get auth data
    const storage = await chrome.storage.local.get([
        'authToken',
        'selectedSystemUrl',
        'username'
    ]);
    
    try {
        if (!storage.authToken) {
            // Guest mode
            await saveMetadataAsGuest(metadata);
        } else {
            // User mode
            await saveMetadataAsUser(metadata, storage);
        }
        
        // Show success notification
        chrome.notifications.create({
            type: 'basic',
            iconUrl: chrome.runtime.getURL('icons/128.png'),
            title: 'WLO Metadata Agent',
            message: storage.authToken 
                ? '✅ Werk wurde veröffentlicht!'
                : '✅ Vorschlag wurde eingereicht!',
            priority: 2
        });
        
        return { success: true };
        
    } catch (error) {
        console.error('❌ Save failed:', error);
        console.error('❌ Error stack:', error.stack);
        
        // More user-friendly error message
        let userMessage = 'Fehler beim Speichern';
        if (error.message.includes('Failed to get user home')) {
            userMessage = 'Fehler beim Zugriff auf Benutzerordner. Bitte prüfe deine Login-Daten.';
        } else if (error.message.includes('Create node failed')) {
            userMessage = 'Fehler beim Erstellen des Knotens. Bitte versuche es erneut.';
        } else if (error.message.includes('parse')) {
            userMessage = 'Server-Antwort ungültig. Bitte kontaktiere den Support.';
        }
        
        chrome.notifications.create({
            type: 'basic',
            iconUrl: chrome.runtime.getURL('icons/128.png'),
            title: 'WLO Metadata Agent',
            message: '❌ ' + userMessage + '\n\nDetails: ' + error.message,
            priority: 2
        });
        
        return { success: false, error: error.message };
    }
}

async function saveMetadataAsGuest(metadata) {
    const username = defaultConfig.publishPublic.username;
    const password = defaultConfig.publishPublic.password;
    const authHeader = 'Basic ' + btoa(`${username}:${password}`);
    
    console.log('📮 Saving as guest...');
    
    // Filter metadata for createNode (only 5 essential fields)
    const essentialFields = ['cclom:title', 'cclom:general_description', 'cclom:general_keyword', 'ccm:wwwurl', 'cclom:general_language'];
    
    // Filter and clean metadata (like Webkomponente)
    const cleanMetadata = {};
    essentialFields.forEach(field => {
        const value = metadata[field];
        // Skip null, undefined, empty strings, and empty arrays
        if (value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
            return;
        }
        cleanMetadata[field] = value;
    });
    
    // Normalize to arrays (KRITISCHER FIX! Wie in Webkomponente repository-proxy.js)
    const createNodeData = {};
    for (const [key, value] of Object.entries(cleanMetadata)) {
        if (Array.isArray(value)) {
            createNodeData[key] = value;
        } else if (value !== null && value !== undefined && value !== '') {
            createNodeData[key] = [value];  // ALLE Werte werden Arrays!
        }
    }
    
    // Debug: Log what we're sending to createNode
    console.log('🔍 createNodeData (normalized to arrays):', JSON.stringify(createNodeData, null, 2));
    console.log('📍 POST to:', defaultConfig.publishPublic.createNode);
    console.log('🔐 Auth:', authHeader.substring(0, 20) + '...');
    console.log('📦 Sending request...');
    
    // 1. Create node
    const createResponse = await fetch(defaultConfig.publishPublic.createNode, {
        method: 'POST',
        headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(createNodeData)
    });
    
    if (!createResponse.ok) {
        let errorMsg = `Create node failed: ${createResponse.status}`;
        try {
            const errorText = await createResponse.text();
            console.error('❌ Create node failed (Guest):', createResponse.status);
            console.error('❌ Error response (first 500 chars):', errorText.substring(0, 500));
            
            // Try to parse as JSON
            try {
                const errorJson = JSON.parse(errorText);
                console.error('❌ Error JSON:', JSON.stringify(errorJson, null, 2));
                errorMsg = errorJson.message || errorJson.error || errorMsg;
            } catch (jsonErr) {
                // Not JSON - probably HTML error page
                console.error('❌ Response is not JSON (HTML error page)');
                // Extract error info from HTML if possible
                if (errorText.includes('<!DOCTYPE') || errorText.includes('<html')) {
                    errorMsg += ' (Server returned HTML error page)';
                } else {
                    errorMsg += ': ' + errorText.substring(0, 100);
                }
            }
        } catch (textErr) {
            console.error('❌ Could not read error response:', textErr);
        }
        throw new Error(errorMsg);
    }
    
    let nodeData;
    try {
        nodeData = await createResponse.json();
    } catch (jsonErr) {
        const responseText = await createResponse.text();
        console.error('❌ Success response is not JSON:', responseText.substring(0, 200));
        throw new Error('Server returned invalid JSON response (possible HTML redirect)');
    }
    
    if (!nodeData || !nodeData.node || !nodeData.node.ref || !nodeData.node.ref.id) {
        console.error('❌ Invalid node data structure:', nodeData);
        throw new Error('Invalid response structure from server');
    }
    
    const nodeId = nodeData.node.ref.id;
    console.log('✅ Node created:', nodeId);
    
    // 2. Set metadata (all remaining fields)
    const metadataUrl = defaultConfig.publishPublic.addMetadata + nodeId + '/metadata?versionComment=Canvas_Upload';
    
    // Filter: Remove fields already sent in createNode and virtual fields
    const metadataToSet = {};
    for (const [key, value] of Object.entries(metadata)) {
        if (!essentialFields.includes(key) && !key.startsWith('virtual:')) {
            metadataToSet[key] = value;
        }
    }
    
    if (Object.keys(metadataToSet).length > 0) {
        await fetch(metadataUrl, {
            method: 'POST',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(metadataToSet)
        });
        console.log('✅ Metadata set:', Object.keys(metadataToSet).join(', '));
    }
    
    // 3. Collections
    if (metadata['virtual:collection_id_primary'] || metadata['ccm:collection_id']) {
        await setCollections(nodeId, metadata, authHeader);
    }
    
    // 4. Workflow
    const workflowUrl = defaultConfig.publishPublic.startWorflow + nodeId + '/workflow';
    console.log('📋 Starting workflow:', workflowUrl);
    
    const workflowResponse = await fetch(workflowUrl, {
        method: 'PUT',
        headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            receiver: [{ authorityName: 'GROUP_ORG_WLO-Uploadmanager' }],
            comment: 'Upload via Canvas + Browser Extension (Gast)',
            status: '200_tocheck',
            logLevel: 'info'  // Required: Set log level to info
        })
    });
    
    if (!workflowResponse.ok) {
        const errorText = await workflowResponse.text();
        console.warn('⚠️ Workflow request failed (non-critical):', workflowResponse.status);
        console.warn('⚠️ Workflow error:', errorText.substring(0, 500));
        // Don't throw - workflow is optional, node was already created
    } else {
        console.log('✅ Workflow started successfully');
    }
    
    console.log('✅ Guest submission complete');
}

async function saveMetadataAsUser(metadata, storage) {
    const authHeader = 'Basic ' + storage.authToken;
    
    console.log('👤 Saving as user:', storage.username);
    
    // Get user home (use -userhome- instead of -inbox-)
    const homeUrl = storage.selectedSystemUrl + '/rest/node/v1/nodes/-home-/-userhome-/metadata';
    console.log('📂 Fetching user home from:', homeUrl);
    
    const homeResponse = await fetch(homeUrl, {
        headers: { 'Authorization': authHeader }
    });
    
    if (!homeResponse.ok) {
        const errorText = await homeResponse.text();
        console.error('❌ User home request failed:', homeResponse.status);
        console.error('❌ Response:', errorText.substring(0, 500));
        throw new Error(`Failed to get user home: ${homeResponse.status}`);
    }
    
    let homeData;
    try {
        homeData = await homeResponse.json();
        console.log('✅ User home data received');
    } catch (jsonErr) {
        const errorText = await homeResponse.text();
        console.error('❌ User home response is not JSON:', errorText.substring(0, 500));
        throw new Error('Failed to parse user home response - Server returned invalid JSON');
    }
    
    if (!homeData || !homeData.node || !homeData.node.ref || !homeData.node.ref.id) {
        console.error('❌ Invalid home data structure:', homeData);
        throw new Error('Invalid user home data structure');
    }
    
    const homeId = homeData.node.ref.id;
    console.log('✅ User home ID:', homeId);
    
    // Filter metadata for createNode (only 5 essential fields)
    const essentialFields = ['cclom:title', 'cclom:general_description', 'cclom:general_keyword', 'ccm:wwwurl', 'cclom:general_language'];
    
    // Filter and clean metadata (like Webkomponente)
    const cleanMetadata = {};
    essentialFields.forEach(field => {
        const value = metadata[field];
        // Skip null, undefined, empty strings, and empty arrays
        if (value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
            return;
        }
        cleanMetadata[field] = value;
    });
    
    // Normalize to arrays (KRITISCHER FIX! Wie in Webkomponente repository-proxy.js)
    const createNodeData = {};
    for (const [key, value] of Object.entries(cleanMetadata)) {
        if (Array.isArray(value)) {
            createNodeData[key] = value;
        } else if (value !== null && value !== undefined && value !== '') {
            createNodeData[key] = [value];  // ALLE Werte werden Arrays!
        }
    }
    
    console.log('🔍 createNodeData (User, normalized to arrays):', JSON.stringify(createNodeData, null, 2));
    
    // Create node in user home
    const createUrl = `${storage.selectedSystemUrl}/rest/node/v1/nodes/-home-/${homeId}/children?type=ccm%3Aio&renameIfExists=true&versionComment=MAIN_FILE_UPLOAD`;
    
    const createResponse = await fetch(createUrl, {
        method: 'POST',
        headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(createNodeData)
    });
    
    if (!createResponse.ok) {
        throw new Error(`Create node failed: ${createResponse.status}`);
    }
    
    let nodeData;
    try {
        nodeData = await createResponse.json();
    } catch (jsonErr) {
        throw new Error('Failed to parse create node response (User mode)');
    }
    const nodeId = nodeData.node.ref.id;
    
    console.log('✅ Node created in user home:', nodeId);
    
    // Set metadata (all remaining fields)
    const metadataUrl = `${storage.selectedSystemUrl}/rest/node/v1/nodes/-home-/${nodeId}/metadata?versionComment=Canvas_Metadata`;
    
    // Filter: Remove fields already sent in createNode and virtual fields
    const metadataToSet = {};
    for (const [key, value] of Object.entries(metadata)) {
        if (!essentialFields.includes(key) && !key.startsWith('virtual:')) {
            metadataToSet[key] = value;
        }
    }
    
    if (Object.keys(metadataToSet).length > 0) {
        await fetch(metadataUrl, {
            method: 'POST',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(metadataToSet)
        });
        console.log('✅ Metadata set:', Object.keys(metadataToSet).join(', '));
    }
    
    console.log('✅ User save complete');
}

async function setCollections(nodeId, metadata, authHeader) {
    const collectionIds = [
        metadata['virtual:collection_id_primary'],
        ...(metadata['ccm:collection_id'] || [])
    ].filter(Boolean);
    
    for (const collectionId of collectionIds) {
        try {
            const url = defaultConfig.publishPublic.addCollection + collectionId + '/references/' + nodeId;
            
            await fetch(url, {
                method: 'PUT',
                headers: {
                    'Authorization': authHeader,
                    'Accept': 'application/json'
                }
            });
            
            console.log(`✅ Added to collection: ${collectionId}`);
        } catch (error) {
            console.warn(`⚠️ Failed to add to collection ${collectionId}:`, error);
        }
    }
}

chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.get(["config"], (data) => {
        if (data.config === undefined) {
            chrome.storage.sync.set({config: defaultConfig});
        }
    });
});

// open sidebar when activate the extension
chrome.action.onClicked.addListener(async function (tab) {
    console.log('🖱️ Plugin icon clicked, tab:', tab.id);
    
    if (!tab.id) {
        console.error('❌ No tab ID available');
        return;
    }
    
    try {
        // First, ensure content script is injected
        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['scripts/content-extractor.js', 'scripts/content.js']
        });
        
        console.log('✅ Content scripts injected');
        
        // Small delay to ensure scripts are ready
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Now send the message
        const response = await chrome.tabs.sendMessage(tab.id, {
            action: "showInfoFrame",
            file: "html/home.html",
            closeIfOpen: true
        });
        
        console.log('✅ Message sent to tab, response:', response);
        
    } catch (error) {
        console.error('❌ Failed to open sidebar:', error);
        console.error('Error details:', error.message, error.stack);
        
        // Show user-friendly error
        chrome.notifications.create({
            type: 'basic',
            iconUrl: chrome.runtime.getURL('icons/128.png'),
            title: 'WLO Metadata Agent',
            message: '❌ Fehler beim Öffnen. Bitte Seite neu laden (F5) und erneut versuchen.',
            priority: 1
        });
    }
});