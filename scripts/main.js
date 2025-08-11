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

async function checkUrl(url) {
    return new Promise((resolve) => {
        chrome.storage.sync.get(["authToken", "selectedSystemUrl"], async (data) => {
            let baseApiUrl = defaultConfig.siteInRepository.default + defaultConfig.siteInRepository.apiURL;

            if (data.authToken && data.selectedSystemUrl) {
                baseApiUrl = data.selectedSystemUrl + defaultConfig.siteInRepository.apiURL;
            }

            const fullApiUrl = `${baseApiUrl}${defaultConfig.siteInRepository.repository}/${defaultConfig.siteInRepository.queryPath}?contentType=FILES&maxItems=1&skipCount=0&propertyFilter=-all-`;

            const requestBody = {
                criteria: [{property: "ccm:wwwurl", values: [url]}]
            };

            try {
                const response = await fetch(fullApiUrl, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                    body: JSON.stringify(requestBody)
                });

                const json = await response.json();

                const nodes = Array.isArray(json?.nodes) ? json.nodes : [];

                // EXAKTER Match auf properties["ccm:wwwurl"]
                const exactNode = nodes.find((node) => {
                    const urls = Array.isArray(node?.properties?.["ccm:wwwurl"])
                        ? node.properties["ccm:wwwurl"]
                        : [];
                    return urls.some((u) => typeof u === "string" && u === url);
                });

                if (exactNode) {
                    resolve({
                        alreadyExists: true,
                        node: exactNode
                    });
                    return;
                }

                resolve({ alreadyExists: false });
            } catch (error) {
                resolve({ alreadyExists: false });
            }
        });
    });
}

function showSpinner() {
    if (document.getElementById("wlo-spinner")) {
        return;
    }

    const spinner = document.createElement("div");
    spinner.id = "wlo-spinner";
    spinner.innerHTML = `
        <div class="wlo-spinner-overlay">
            <div class="wlo-spinner"></div>
        </div>
    `;
    document.body.appendChild(spinner);
}

function hideSpinner() {
    const spinner = document.getElementById("wlo-spinner");
    if (spinner) {
        spinner.remove();
    }
}