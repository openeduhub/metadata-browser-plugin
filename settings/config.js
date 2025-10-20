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

const defaultConfig = {
    // Repository Configuration (ONLY STAGING)
    repository: {
        staging: {
            baseUrl: "https://repository.staging.openeduhub.net/edu-sharing/",
            name: "WLO Staging",
            enabled: true
        },
        production: {
            baseUrl: "https://repository.openeduhub.net/edu-sharing/",
            name: "WLO Production",
            enabled: false // ← Deaktiviert für jetzt
        }
    },
    
    // Active repository (only staging)
    activeRepository: "staging",
    
    siteInRepository: {
        default: "https://repository.staging.openeduhub.net/edu-sharing/",
        apiURL: "rest/search/v1/queries/",
        repository: "-home-",
        queryPath: "mds_oeh/ngsearch",
    },
    formUrl: "components/embed/mds?set=mds_oeh&group=browser_extension",
    
    // Canvas Component Configuration
    canvas: {
        url: "https://metadata-agent-canvas.vercel.app/",
        mode: "browser-extension"
    },
    auth: {
        loginUrl: "rest/authentication/v1/validateSession",
        logoutUrl: "rest/authentication/v1/destroySession",
        passwordResetUrl: "components/register/request",
        registerUrl: "components/register",
        wloPasswordResetUrl: "https://wirlernenonline.de/password-reset/",
        wloRegisterUrl: "https://wirlernenonline.de/mitmachen/"
    },
    publishPublic: {
        username: "WLO-Upload",
        password: "wlo#upload!20",
        eventOrigin: "https://repository.staging.openeduhub.net",
        formUrl: "https://repository.staging.openeduhub.net/edu-sharing/components/embed/mds?set=mds_oeh&group=browser_extension",
        createNode: "https://repository.staging.openeduhub.net/edu-sharing/rest/node/v1/nodes/-home-/21144164-30c0-4c01-ae16-264452197063/children?type=ccm%3Aio&renameIfExists=true&versionComment=MAIN_FILE_UPLOAD",
        setPermissions: "https://repository.staging.openeduhub.net/edu-sharing/rest/node/v1/nodes/-home-/",
        startWorflow: "https://repository.staging.openeduhub.net/edu-sharing/rest/node/v1/nodes/-home-/",
        addMetadata: "https://repository.staging.openeduhub.net/edu-sharing/rest/node/v1/nodes/-home-/",
        addCollection: "https://repository.staging.openeduhub.net/edu-sharing/rest/collection/v1/collections/-home-/"
    },
    saveUrl: "rest/node/v1/nodes/-home-/-userhome-/children?type=ccm%3Aio&renameIfExists=true",
    systems: "https://app-registry.edu-sharing.com/servers.php?version=all",
    crawler: {
        //url : "https://wlo-api.neu.vrs.at/crawler.php",
        url : "https://generic-crawler-ui-metadataapi.staging.openeduhub.net/metadata",
        apiKey: "xxx"
    }
};