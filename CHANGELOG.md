# 📝 Changelog - WLO Metadata Browser Plugin

## [1.0.8] - 2025-01-19 🎉 **KRITISCHER FIX**

### 🐛 Fixed - Array-Normalisierung
**Das war der entscheidende Fix!**

- **Array-Normalisierung wie Webkomponente** - ALLE Metadaten-Werte werden zu Arrays normalisiert
- **Error 400 behoben** - CreateNode funktioniert jetzt korrekt (Gast & User-Mode)
- **Gast-Mode:** Normalisierung vor createNode hinzugefügt
- **User-Mode:** Normalisierung vor createNode hinzugefügt

### 🔧 Technical Changes

**Vorher (Error 400):**
```javascript
const createNodeData = {};
for (const field of essentialFields) {
    if (metadata[field]) {
        createNodeData[field] = metadata[field];  // ❌ String oder Array
    }
}
```

**Nachher (✅ Funktioniert):**
```javascript
// 1. Filter null/empty
const cleanMetadata = {};
if (value !== null && value !== '' && ...) {
    cleanMetadata[field] = value;
}

// 2. Normalize to arrays
const createNodeData = {};
if (Array.isArray(value)) {
    createNodeData[key] = value;
} else {
    createNodeData[key] = [value];  // ✅ ALLE werden Arrays!
}
```

**Quelle:** `webkomponente-canvas/netlify/functions/repository-proxy.js` (Zeile 162-170)

### 📋 Changed
- versionComment: `Canvas_Upload` → `MAIN_FILE_UPLOAD` (konsistent mit Light-Plugin)
- Logging verbessert: "normalized to arrays" Log hinzugefügt

---

## [1.0.7] - 2025-01-19

### 🐛 Fixed
- LogLevel-Fehler im Workflow behoben
- `logLevel: 'info'` Parameter hinzugefügt

---

## [1.0.6] - 2025-01-19

### 🔧 Improvements
- User-Mode Error-Handling verbessert
- `-userhome-` statt `-inbox-` für User Home URL
- Detailliertes Error-Logging

---

## [1.0.1-1.0.5] - 2025-01-19

### 🔧 Improvements & Fixes
- Content-Script Injection verbessert
- Message-Channel Error behoben
- Canvas-Loading stabilisiert
- postMessage Format korrigiert

---

## [1.0.0] - Initial Version

### ✨ Features
- Gast-Modus & User-Mode
- Generischer Crawler Integration
- Canvas-Webkomponente Integration
- Repository API Integration
- Dubletten-Prüfung
- Collections-Support

---

**Made with 💜 for Wir Lernen Online**
