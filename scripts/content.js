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
});

window.addEventListener("message", (event) => {
    if (event.data?.action === "close-wlo-frame") {
        closeSidebar();
    }
});