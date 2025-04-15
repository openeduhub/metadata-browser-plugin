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

document.addEventListener('DOMContentLoaded', () => {
    const logoutButton = document.getElementById("logout-btn");
    const notLoggedInMessage = document.getElementById("not-logged-in-message");
    const systemDisplay = document.getElementById("stored-system");
    const usernameDisplay = document.getElementById("stored-username");

    chrome.storage.local.get(["authToken", "selectedSystem", "username"], function (data) {
        if (data.authToken) {
            logoutButton.classList.remove("hidden");
        } else {
            logoutButton.classList.add("hidden");
            notLoggedInMessage.classList.remove("hidden");
        }

        if (data.selectedSystem && data.selectedSystem !== 'undefined') {
            systemDisplay.textContent = data.selectedSystem;
        } else {
            document.getElementById("user-system").classList.add("hidden");
        }

        if (data.username) {
            usernameDisplay.textContent = data.username;
        } else {
            document.getElementById("user-username").classList.add("hidden");
        }
    });

    document.getElementById("logout-btn").addEventListener("click", function () {
        chrome.storage.local.get(["authToken", "selectedSystemUrl"], function (data) {
            if (data.authToken && data.selectedSystemUrl) {
                fetch(data.selectedSystemUrl + defaultConfig.auth.logoutUrl, {
                    method: "GET",
                    headers: {
                        "Authorization": `Basic ${data.authToken}`,
                        "Accept": "application/json"
                    }
                })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`HTTP-Fehler! Status: ${response.status}`);
                        }
                        return response.text();
                    })
                    .then(text => {
                        return text ? JSON.parse(text) : {};
                    })
                    .then(result => {
                        chrome.storage.local.remove(["authToken", "selectedSystem", "selectedSystemUrl", "username"], function () {
                            document.getElementById("logout-message").classList.remove("hidden");

                            setTimeout(() => {
                                chrome.runtime.sendMessage({action: "logout"});
                                window.close();
                            }, 2000);
                        });
                    })
                    .catch(error => {
                    });
            }
        });
    });
});
