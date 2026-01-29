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
isWarenkorbOpen = false;

function openSidebar(file) {
    closeSidebar();
    file = file ?? "html/info.html";
    const iframe = document.createElement("iframe");
    iframe.id = "wlo-info-frame";
    iframe.src = chrome.runtime.getURL(file);
    document.body.appendChild(iframe);
    document.body.style.marginRight = "400px"; // oder 0px beim Entfernen
    isSidebarOpen = true;
    return iframe;
}

function getSidebar() {
    return document.getElementById("wlo-info-frame");
}

function closeSidebar() {
    // it might be the case that we opened multiple sidebars
    document.querySelectorAll("#wlo-info-frame").forEach(frame => frame.remove());
    isSidebarOpen = false;
}

/**
 * Öffnet die Unified Sidebar mit Warenkorb und Publishing
 */
function openWarenkorb() {
    closeWarenkorb();
    const iframe = document.createElement("iframe");
    iframe.id = "wlo-warenkorb-frame";
    iframe.src = chrome.runtime.getURL("html/sidebar.html");
    iframe.style.cssText = `
        position: fixed;
        top: 0;
        right: 0;
        width: 400px;
        height: 100vh;
        border: none;
        z-index: 999999;
        box-shadow: -2px 0 10px rgba(0,0,0,0.1);
    `;
    document.body.appendChild(iframe);
    document.body.style.marginRight = "400px";
    isWarenkorbOpen = true;
    console.log('📂 Unified Sidebar geöffnet');
    return iframe;
}

/**
 * Schließt die Unified Sidebar
 */
function closeWarenkorb() {
    document.querySelectorAll("#wlo-warenkorb-frame").forEach(frame => frame.remove());
    document.body.style.marginRight = "0px";
    isWarenkorbOpen = false;
    console.log('📂 Unified Sidebar geschlossen');
}

/**
 * Sendet ein Item an den Warenkorb über Background Script
 */
function sendItemToWarenkorb(item) {
    console.log('📤 Sende Item an Warenkorb:', item);
    console.log('📦 Warenkorb offen:', isWarenkorbOpen);
    
    if (isWarenkorbOpen) {
        console.log('✅ Sende Message an Background Script');
        chrome.runtime.sendMessage({
            action: "addItemToWarenkorb",
            item: item
        }, (response) => {
            if (chrome.runtime.lastError) {
                console.error('❌ Fehler beim Senden:', chrome.runtime.lastError);
            } else {
                console.log('✅ Item erfolgreich an Warenkorb gesendet');
            }
        });
    } else {
        console.warn('⚠️ Warenkorb nicht offen');
    }
}

/**
 * Extrahiert Inhalte von der aktuellen Seite
 */
function extractPageContent() {
    const title = document.title || document.querySelector('h1')?.textContent || 'Unbenannter Inhalt';
    const description = document.querySelector('meta[name="description"]')?.content || 
                       document.querySelector('p')?.textContent?.substring(0, 200) || '';
    const url = window.location.href;
    const thumbnail = document.querySelector('meta[property="og:image"]')?.content ||
                     document.querySelector('img')?.src || '';

    return {
        id: 'page-' + Date.now(),
        title: title,
        description: description,
        url: url,
        thumbnail: thumbnail,
        type: '📄 Webseite'
    };
}

/**
 * Injiziert Overlay-Buttons in WLO-Karten
 */
function injectOverlayButtons() {
    // Verschiedene Selektoren für WLO-Kacheln
    const cardSelectors = [
        '.result-card',
        '.edu-sharing-card',
        '[class*="card"]',
        '.search-result-item'
    ];

    cardSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(card => {
            if (card.querySelector('.wk-add-overlay')) return;
            
            // Positionierung für Overlay
            const style = window.getComputedStyle(card);
            if (style.position === 'static') {
                card.style.position = 'relative';
            }

            // Button erstellen
            const btn = document.createElement('button');
            btn.className = 'wk-add-overlay';
            btn.innerHTML = '🛒';
            btn.title = 'Zum Warenkorb hinzufügen';
            btn.style.cssText = `
                position: absolute;
                top: 8px;
                right: 8px;
                width: 32px;
                height: 32px;
                background: #2563eb;
                color: white;
                border: none;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                opacity: 0;
                transform: scale(0.8);
                transition: all 0.2s;
                z-index: 1000;
            `;
            
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                addCardToCurrentPhase(card);
            });

            // Hover-Effekt für Button
            card.addEventListener('mouseenter', () => {
                btn.style.opacity = '1';
                btn.style.transform = 'scale(1)';
            });

            card.addEventListener('mouseleave', () => {
                btn.style.opacity = '0';
                btn.style.transform = 'scale(0.8)';
            });

            card.appendChild(btn);
        });
    });
}

/**
 * Extrahiert Daten aus einer WLO-Karte
 */
function extractCardData(card) {
    const title = card.querySelector('h2, h3, .title, [class*="title"]')?.textContent?.trim() || 
                  card.querySelector('a')?.textContent?.trim() ||
                  'Unbenannter Inhalt';
    
    const description = card.querySelector('p, .description, [class*="desc"]')?.textContent?.trim() || '';
    const url = card.querySelector('a')?.href || '';
    const thumbnail = card.querySelector('img')?.src || '';

    return {
        id: 'wlo-' + Date.now(),
        title: title,
        description: description,
        url: url,
        thumbnail: thumbnail,
        type: '📦 WLO-Inhalt'
    };
}

/**
 * Fügt eine WLO-Karte zum Warenkorb hinzu
 */
function addCardToCurrentPhase(card) {
    if (!isWarenkorbOpen) {
        openWarenkorb();
    }
    
    const item = extractCardData(card);
    sendItemToWarenkorb(item);
}

/**
 * Fügt WLO-Overlay-Buttons hinzu und beobachtet dynamisch geladene Karten
 */
function setupWLOOverlays() {
    // Beobachter für dynamisch geladene Karten
    const observer = new MutationObserver(() => {
        injectOverlayButtons();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Initial ausführen
    setTimeout(() => injectOverlayButtons(), 1000);
}

/**
 * Prüft ob wir auf einer WLO-Seite sind
 */
function isWLOPage() {
    return window.location.hostname.includes('wirlernenonline') ||
           window.location.hostname.includes('openeduhub');
}

// WLO-Overlays nur auf WLO-Seiten hinzufügen
if (isWLOPage()) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupWLOOverlays);
    } else {
        setupWLOOverlays();
    }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {    
    if (request.action === "showInfoFrame") {
        if (request.closeIfOpen && isSidebarOpen) {
            closeSidebar();
        } else {
            const sidebar = openSidebar(request.file);
            sidebar.onload = () => {
                sidebar.contentWindow.postMessage({
                    type: "wlo-share-data",
                    node: request.node,
                    new: request.new
                }, "*");
            };
        }
    }
    
    if (request.action === "showSidebar") {
        console.log('📨 showSidebar Message empfangen');
        if (request.closeIfOpen && isWarenkorbOpen) {
            console.log('📂 Schließe existierende Sidebar');
            closeWarenkorb();
        } else {
            console.log('📂 Öffne Unified Sidebar');
            openWarenkorb();
        }
    }
    
    if (request.action === "forwardItemToWarenkorb") {
        console.log('📨 forwardItemToWarenkorb Message empfangen');
        const warenkorbFrame = document.getElementById("wlo-warenkorb-frame");
        
        if (warenkorbFrame && isWarenkorbOpen) {
            console.log('✅ Leite Item an Warenkorb-iframe weiter');
            warenkorbFrame.contentWindow.postMessage({
                action: "addItemToPhase",
                item: request.item
            }, "*");
        } else {
            console.warn('⚠️ Warenkorb-Frame nicht verfügbar');
        }
    }
    
    if (request.action === "searchWLO") {
        console.log('🔍 WLO-Suche angefordert:', request.query);
        const warenkorbFrame = document.getElementById("wlo-warenkorb-frame");
        
        if (!warenkorbFrame || !isWarenkorbOpen) {
            console.warn('⚠️ Warenkorb-Frame nicht verfügbar');
            return;
        }
        
        // Suche durchführen
        (async () => {
            try {
                const results = await WLO_API.search(request.query, { maxItems: request.maxItems || 3 });
                console.log('✅ WLO-Suche erfolgreich:', results.length, 'Ergebnisse');
                
                // Sende Ergebnisse an iframe
                warenkorbFrame.contentWindow.postMessage({
                    action: "searchResults",
                    phaseId: request.phaseId,
                    results: results
                }, "*");
            } catch (error) {
                console.error('❌ WLO-Suche fehlgeschlagen:', error);
                warenkorbFrame.contentWindow.postMessage({
                    action: "searchError",
                    phaseId: request.phaseId,
                    error: error.message
                }, "*");
            }
        })();
    }
});

window.addEventListener("message", (event) => {
    if (event.data?.action === "close-wlo-frame") {
        closeSidebar();
    }
});