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