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

window.addEventListener("message", (event) => {
    if (event.data?.type === "wlo-share-data" && event.data.node) {

        const node = event.data.node;
        console.debug(node);
        
        const contentEl = document.createElement("wlo-share-content");

        let title = node?.properties?.["cclom:title"]?.[0] || node.title;
        let url = node.content?.url || "";
        let description = node?.properties?.["cclom:general_description"]?.[0] || "";
        
        if(node.node) {
            title = node.node?.properties?.["cclom:title"]?.[0] || node.node.title;
            description = node?.node?.properties?.["cclom:general_description"]?.[0] || "";
            url = node.node.content?.url || "";
        }

        console.debug(title);
        console.debug(url);
        console.debug(description);

        contentEl.setAttribute("title", title);
        contentEl.setAttribute("url", url);
        contentEl.setAttribute("description", description);

        const info = document.getElementById("info-container");
        if(!event.data.new) {
            info.remove();
        }

        const container = document.getElementById("wlo-container");
        if (container) container.innerHTML = "";
        document.body.appendChild(contentEl);
    }
});

document.getElementById("wlo-close-frame")?.addEventListener("click", () => {
    window.parent.postMessage({ action: "close-wlo-frame" }, "*");
});