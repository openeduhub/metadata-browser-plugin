/**
 * This file is part of the WLO Browser Extension.
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

/**
 * Configuration Manager für die WLO Browser Extension
 * 
 * Dieses Modul stellt eine Abstraktionsschicht für die Konfigurationsverwaltung bereit.
 * Es ermöglicht das Laden, Speichern und Wechseln zwischen verschiedenen Konfigurationen
 * zur Laufzeit, ohne direkt auf den Chrome Storage zugreifen zu müssen.
 */

// Import der Konfigurationen (falls als separates Script geladen)
// Falls inline verwendet, müssen defaultConfig und wloconfig verfügbar sein

class ConfigManager {
    constructor() {
        this.STORAGE_KEY = 'config';
    }

    /**
     * Lädt die aktuelle Konfiguration aus dem Chrome Storage
     * @returns {Promise<Object>} Die aktuelle Konfiguration
     */
    async getConfig() {
        return new Promise((resolve, reject) => {
            console.log("Suche nach einer Konfiguration");
            chrome.storage.sync.get([this.STORAGE_KEY], (result) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                    return;
                }
                
                // Falls keine Konfiguration gespeichert ist, verwende defaultConfig
                if (!result[this.STORAGE_KEY]) {
                    resolve(defaultConfig);
                } else {
                    resolve(result[this.STORAGE_KEY]);
                }
            });
        });
    }

    /**
     * Speichert eine Konfiguration im Chrome Storage
     * @param {Object} config - Die zu speichernde Konfiguration
     * @returns {Promise<void>}
     */
    async saveConfig(config) {
        return new Promise((resolve, reject) => {
            chrome.storage.sync.set({ [this.STORAGE_KEY]: config }, () => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                    return;
                }
                console.log(`Konfiguration gespeichert.`);
                resolve();
            });
        });
    }

    /**
     * Wechselt zur WLO-Konfiguration
     * @returns {Promise<void>}
     */
    async switchToWloConfig() {
        try {
            await this.saveConfig(wloconfig);
            console.log('Erfolgreich zur WLO-Konfiguration gewechselt');
        } catch (error) {
            console.error('Fehler beim Wechseln zur WLO-Konfiguration:', error);
            throw error;
        }
    }

    /**
     * Wechselt zur Standard-Konfiguration
     * @returns {Promise<void>}
     */
    async switchToDefaultConfig() {
        try {
            await this.saveConfig(defaultConfig);
            console.log('Erfolgreich zur Standard-Konfiguration gewechselt');
        } catch (error) {
            console.error('Fehler beim Wechseln zur Standard-Konfiguration:', error);
            throw error;
        }
    }

    /**
     * Initialisiert die Konfiguration beim ersten Start
     * @returns {Promise<void>}
     */
    async initializeConfig() {
        try {
            const currentConfig = await this.getConfig();
            
            // Falls noch keine Konfiguration gespeichert ist, speichere die Standard-Konfiguration
            if (!currentConfig || Object.keys(currentConfig).length === 0) {
                await this.saveConfig(defaultConfig, 'default');
                console.log('Standard-Konfiguration initialisiert');
            } else {
                console.log(`Bestehende Konfiguration geladen.`);
            }
        } catch (error) {
            console.error('Fehler bei der Konfigurationsinitialisierung:', error);
            throw error;
        }
    }

    /**
     * Setzt die Konfiguration auf die Standardwerte zurück
     * @returns {Promise<void>}
     */
    async resetToDefault() {
        try {
            await this.switchToDefaultConfig();
            console.log('Konfiguration auf Standard zurückgesetzt');
        } catch (error) {
            console.error('Fehler beim Zurücksetzen der Konfiguration:', error);
            throw error;
        }
    }
}

// Singleton-Instanz erstellen
const configManager = new ConfigManager();

// Für die Verwendung in anderen Scripts exportieren
if (typeof module !== 'undefined' && module.exports) {
    module.exports = configManager;
}

// Für die Verwendung als globale Variable in Chrome Extension
if (typeof window !== 'undefined') {
    window.configManager = configManager;
}

// Für die Verwendung in Service Workers
if (typeof self !== 'undefined' && typeof importScripts === 'function') {
    self.configManager = configManager;
}
