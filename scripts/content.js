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

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "showInfoFrame" && request.node) {
        const existingFrame = document.getElementById("wlo-info-frame");
        if (existingFrame) existingFrame.remove();

        const iframe = document.createElement("iframe");
        iframe.id = "wlo-info-frame";
        iframe.src = chrome.runtime.getURL("html/info.html");
        iframe.style.position = "fixed";
        iframe.style.top = "0";
        iframe.style.right = "0";
        iframe.style.width = "420px";
        iframe.style.height = "100%";
        iframe.style.border = "none";
        iframe.style.zIndex = "999999";
        iframe.style.boxShadow = "rgba(0, 0, 0, 0.3) -4px 0px 10px";

        document.body.appendChild(iframe);

        document.body.style.marginRight = "400px"; // oder 0px beim Entfernen

        //send data to iframe
        iframe.onload = () => {
            iframe.contentWindow.postMessage({
                type: "wlo-share-data",
                node: request.node
            }, "*");
        };
    }
});

window.addEventListener("message", (event) => {
    if (event.data?.action === "close-wlo-frame") {
        const iframe = document.getElementById("wlo-info-frame");
        if (iframe) iframe.remove();
    }
});