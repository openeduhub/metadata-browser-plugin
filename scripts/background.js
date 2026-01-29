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

importScripts('../settings/config.js');

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "logout") {
        chrome.storage.local.remove("authToken");
    }
});

chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.get(["config"], (data) => {
        if (data.config === undefined) {
            chrome.storage.sync.set({config: defaultConfig});
        }
    });
});

// Speichert Referenz zum aktuellen Tab mit offener Sidebar
let sidebarTabId = null;
let sidebarFrame = null;

// open sidebar when activate the extension
chrome.action.onClicked.addListener(function (tab) {
    console.log('🔘 Plugin-Button geklickt');
    chrome.tabs.sendMessage(tab.id, {
        action: "showSidebar",
        closeIfOpen: true
    });
});

// Empfängt Items vom Content Script und leitet an Sidebar weiter
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('📨 Background Script empfängt Message:', request.action);
    
    if (request.action === "addItemToWarenkorb") {
        console.log('📦 Item empfangen:', request.item);
        
        // Speichere Tab-ID für später
        sidebarTabId = sender.tab.id;
        
        // Leite an alle Tabs weiter (der mit der Sidebar wird es empfangen)
        chrome.tabs.query({}, (tabs) => {
            tabs.forEach(tab => {
                chrome.tabs.sendMessage(tab.id, {
                    action: "forwardItemToWarenkorb",
                    item: request.item
                }).catch(() => {
                    // Tab antwortet nicht, ignorieren
                });
            });
        });
        
        sendResponse({ success: true });
    }
});
