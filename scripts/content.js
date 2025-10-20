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

isSidebarOpen = false;

function openSidebar(file) {
    closeSidebar();
    file = file ?? "html/info.html";
    const iframe = document.createElement("iframe");
    iframe.id = "wlo-info-frame";
    iframe.src = chrome.runtime.getURL(file);
    document.body.appendChild(iframe);
    document.body.style.marginRight = "600px"; // Match sidebar width
    isSidebarOpen = true;
    return iframe;
}

// Open Canvas component in sidebar
function openCanvas(canvasUrl, pageData) {
    console.log('🎨 openCanvas called with URL:', canvasUrl);
    console.log('📦 Page data:', { url: pageData.url, title: pageData.title });
    console.log('🔍 Canvas URL breakdown:', {
        fullUrl: canvasUrl,
        hostname: new URL(canvasUrl).hostname,
        isVercel: canvasUrl.includes('vercel.app')
    });
    
    closeSidebar();
    const iframe = document.createElement("iframe");
    iframe.id = "wlo-info-frame";
    iframe.src = canvasUrl;
    iframe.style.border = "none";
    iframe.style.width = "600px";
    iframe.style.height = "100vh";
    iframe.style.position = "fixed";
    iframe.style.top = "0";
    iframe.style.right = "0";
    iframe.style.zIndex = "999999";
    iframe.style.backgroundColor = "white";
    iframe.style.boxShadow = "-2px 0 8px rgba(0,0,0,0.1)";
    
    console.log('📍 About to append iframe to body...');
    document.body.appendChild(iframe);
    document.body.style.marginRight = "600px";
    isSidebarOpen = true;
    
    console.log('✅ iframe created and added to DOM');
    console.log('🔗 iframe.src =', iframe.src);
    
    // Listen for messages from Canvas
    window.addEventListener('message', handleCanvasMessage);
    
    // Error handling for iframe
    iframe.onerror = (error) => {
        console.error('❌ iframe loading error:', error);
        alert('Canvas konnte nicht geladen werden. Bitte prüfe die Netzwerkverbindung.');
    };
    
    // Send page data to Canvas when iframe loads
    iframe.onload = () => {
        console.log('✅ iframe loaded successfully');
        
        // Check if iframe content is accessible
        try {
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            console.log('📄 iframe document accessible:', !!iframeDoc);
        } catch (e) {
            console.warn('⚠️ Cannot access iframe document (expected for cross-origin):', e.message);
        }
        
        setTimeout(() => {
            console.log('📤 Sending page data to Canvas via postMessage');
            try {
                iframe.contentWindow.postMessage({
                    type: 'PLUGIN_PAGE_DATA',
                    url: pageData.url,
                    html: pageData.html,
                    text: pageData.text,
                    title: pageData.title,
                    metadata: pageData.metadata,
                    mode: 'browser-extension'
                }, '*');
                console.log('✅ postMessage sent successfully');
            } catch (error) {
                console.error('❌ Failed to send postMessage:', error);
            }
        }, 1000); // Increased timeout to 1000ms
    };
    
    return iframe;
}

function handleCanvasMessage(event) {
    // Security: Check origin if Canvas is hosted
    // For local dev: accept localhost
    // For production: check against deployed URL
    
    if (event.data.type === 'CANVAS_CLOSE') {
        closeSidebar();
        window.removeEventListener('message', handleCanvasMessage);
    }
    
    if (event.data.type === 'CANVAS_METADATA_READY') {
        // Send metadata to background script
        chrome.runtime.sendMessage({
            action: 'saveMetadata',
            metadata: event.data.metadata
        });
    }
}

function getSidebar() {
    return document.getElementById("wlo-info-frame");
}

function closeSidebar() {
    // it might be the case that we opened multiple sidebars
    document.querySelectorAll("#wlo-info-frame").forEach(frame => frame.remove());
    isSidebarOpen = false;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {    
    if (request.action === "showInfoFrame") {
        console.log('📥 Received showInfoFrame message');
        try {
            if (request.closeIfOpen && isSidebarOpen) {
                closeSidebar();
                sendResponse({ success: true, action: 'closed' });
            } else {
                const sidebar = openSidebar(request.file);
                sidebar.onload = () => {
                    sidebar.contentWindow.postMessage({
                        type: "wlo-share-data",
                        node: request.node,
                        new: request.new
                    }, "*");
                };
                sendResponse({ success: true, action: 'opened' });
            }
        } catch (error) {
            console.error('❌ showInfoFrame error:', error);
            sendResponse({ success: false, error: error.message });
        }
        return true; // Keep channel open for async response
    }
    
    // NEW: Open Canvas component with page data
    if (request.action === "openCanvas") {
        console.log('📥 Received openCanvas message');
        try {
            openCanvas(request.canvasUrl, request.pageData);
            sendResponse({ success: true });
        } catch (error) {
            console.error('❌ openCanvas error:', error);
            sendResponse({ success: false, error: error.message });
        }
        return true; // Keep channel open for async response
    }
    
    // Extract content action
    if (request.action === 'extractContent') {
        // This is handled in content-extractor.js
        return true; // Keep channel open
    }
});

window.addEventListener("message", (event) => {
    if (event.data?.action === "close-wlo-frame") {
        closeSidebar();
    }
});