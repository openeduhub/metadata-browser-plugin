# WLO Browser Extension - Metadata Agent

**Version 1.0.8** ✅ **FUNKTIONIERT** | **Manifest V3** Chrome Extension für [Wir lernen online](https://wirlernenonline.de/)

Ermöglicht Nutzenden das einfache Vorschlagen, Veröffentlichen und Auffinden von OER-Materialien direkt aus dem Browser mit **KI-gestützter Metadaten-Extraktion**.

---

## 🎉 Neueste Updates (v1.0.8 - 2025-01-19)

### ✅ KRITISCHER FIX: Array-Normalisierung
- **Error 400 behoben** - CreateNode funktioniert jetzt korrekt!
- ALLE Metadaten-Werte werden zu Arrays normalisiert (wie Webkomponente)
- Funktioniert in **Gast-Mode** & **User-Mode**

### ⚠️ Canvas-Integration Status
- ✅ **Gast-Mode:** Webkomponente-Integration funktioniert komplett
- 🚧 **User-Mode:** Canvas-Integration noch in Arbeit (nutzt altes Formular)

## ✨ Features

### Core Features
- 🚀 **Ein-Klick-Workflow**: "Werk vorschlagen" Button → Metadaten automatisch erstellt
- 🧠 **KI-Integration**: Canvas-Komponente mit LLM-basierter Extraktion
- 🔍 **Automatische Seiten-Analyse**: HTML, Text, Meta-Tags, Structured Data
- 🤖 **Generischer Crawler**: Optional integriert für Basis-Metadaten
- 📦 **Sidebar-UI**: Canvas öffnet als 600px iframe rechts
- 👤 **Guest & User Mode**: Als Gast oder eingeloggt veröffentlichen
- ✅ **Repository-Integration**: Direkter Upload zu WLO Staging/Production
- 🔄 **Workflow-Support**: Automatischer Start des Review-Prozesses

### Integration Features
- 🧩 **Canvas Integration**: Vollständige Integration der Metadata Canvas-Komponente
- 📨 **postMessage API**: Bidirektionale Kommunikation Plugin ↔ Canvas
- 🔐 **Smart Credentials**: Guest-Mode oder User-Credentials aus Chrome Storage
- 📊 **Status-Tracking**: Live-Feedback während Extraktion und Upload
- ⚡ **Parallele Verarbeitung**: Seiten-Extraktion + Optional Crawler
- 🎯 **Mode-Detection**: Canvas erkennt automatisch Browser-Extension Mode

---

## 🚀 Installation & Setup

### Voraussetzungen

- **Chrome Browser** (Version 88+) oder **Edge** (Chromium-basiert)
- **Node.js** >= 18.x (nur für Entwicklung)
- Zugang zu **WLO Repository** (Staging oder Production)

### Option A: Installation aus Chrome Web Store

1. Öffne den [Chrome Web Store](https://chrome.google.com/webstore) (Link folgt nach Veröffentlichung)
2. Suche nach "WLO Metadata Agent"
3. Klicke auf "Hinzufügen"
4. Extension erscheint in der Toolbar

### Option B: Lokale Installation (Entwicklung)

#### 1. Repository klonen
```bash
git clone https://github.com/janschachtschabel/metadata-agent-canvas.git
cd metadata-agent-canvas/metadata-browser-plugin
```

#### 2. Konfiguration anpassen

**Datei:** `settings/config.js`

```javascript
const defaultConfig = {
  // Canvas Component URL (deployed oder lokal)
  canvas: {
    url: "http://localhost:4200",  // Oder: "https://your-canvas.netlify.app"
    mode: "browser-extension"
  },
  
  // Generischer Crawler (optional)
  crawler: {
    url: "https://generic-crawler-ui-metadataapi.staging.openeduhub.net/metadata",
    apiKey: "your-api-key-here"  // Optional
  },
  
  // Repository Configuration
  repository: {
    staging: {
      enabled: true,
      name: "WLO Staging",
      baseUrl: "https://repository.staging.openeduhub.net/edu-sharing/"
    }
  },
  
  // Guest Upload Credentials (für Guest Mode)
  publishPublic: {
    username: "WLO-Upload",
    password: "your-guest-password"
  }
};
```

#### 3. Extension in Chrome laden

1. Öffne Chrome → Menü → **Erweiterungen** → **Erweiterungen verwalten**
2. Aktiviere **Entwicklermodus** (oben rechts)
3. Klicke **Entpackte Erweiterung laden**
4. Wähle den `metadata-browser-plugin` Ordner
5. Extension erscheint in der Liste ✅

#### 4. Canvas-Komponente starten (lokal)

**Wenn Canvas lokal läuft:**
```bash
# In separatem Terminal
cd ../webkomponente-canvas
npm install
npm start  # Läuft auf http://localhost:4200
```

**Wenn Canvas auf Netlify deployed:**
- Passe `canvas.url` in `config.js` an
- Fertig!

---

## 📖 Nutzung

### Workflow: Werk vorschlagen

```
1. Webseite mit OER-Material öffnen
   ↓
2. Plugin-Icon klicken
   ↓
3. "📤 Werk vorschlagen" Button
   ↓
4. Plugin extrahiert automatisch:
   • URL
   • Titel
   • Seiteninhalt (HTML/Text)
   • Meta-Tags (description, keywords, author)
   • Structured Data (JSON-LD, Microdata)
   • Optional: Generischer Crawler-Daten
   ↓
5. Canvas öffnet sich als Sidebar (600px rechts)
   ↓
6. Daten werden in Textarea angezeigt
   ↓
7. "Generate" klicken → LLM extrahiert Felder (6-10s)
   ↓
8. Felder bearbeiten (optional)
   ↓
9. "💾 An Plugin senden" klicken
   ↓
10. Plugin uploaded zu Repository:
    • createNode (5 Pflichtfelder)
    • setMetadata (alle übrigen Felder)
    • setCollections (Guest Inbox oder User Home)
    • startWorkflow (Status: "Zur Prüfung")
   ↓
11. ✅ Success Notification
    • Canvas schließt sich automatisch
```

### Guest Mode vs User Mode

#### Guest Mode (Default) ✅ **MIT CANVAS-WEBKOMPONENTE**
```
Kein Login nötig
  ↓
Plugin nutzt Guest-Credentials (WLO-Upload)
  ↓
Canvas-Sidebar öffnet sich (600px)
  ↓
KI-gestützte Metadaten-Extraktion
  ↓
Upload zu: Guest Inbox Collection
  ↓
Workflow: 200_tocheck (Review-Manager prüft)
  ↓
User erhält Notification: "✅ Vorschlag wurde eingereicht!"
```

#### User Mode (nach Login) 🚧 **ALTES FORMULAR (Canvas in Arbeit)**
```
Plugin-Popup → Login
  ↓
Credentials in Chrome Storage gespeichert
  ↓
Nutzt noch altes embed/mds Formular
  ↓
Upload zu: User Home (eigene Collection)
  ↓
Workflow: User-spezifisch
  ↓
User erhält Notification: "✅ Werk wurde veröffentlicht!"

⚠️ Canvas-Integration für User-Mode geplant in v1.1.0
```

---

## 🔧 Technische Details

### Architektur

```
┌─────────────────────────────────────────────────────┐
│ BROWSER-PLUGIN (Manifest V3)                        │
├─────────────────────────────────────────────────────┤
│                                                     │
│  popup.js              background.js               │
│  • UI Logic             • Repository API Calls     │
│  • Canvas öffnen        • handleMetadataSave()     │
│  • Crawler Call         • saveAsGuest/User()       │
│                                                     │
│  content.js            content-extractor.js        │
│  • Iframe Management   • HTML/Text Extraktion      │
│  • postMessage Handler • Meta-Tags Parsing         │
│  • PLUGIN_PAGE_DATA    • Structured Data           │
│  • CANVAS_METADATA...  •                           │
│                                                     │
└──────────────┬──────────────────────────────────────┘
               │ postMessage API
               ↓
┌─────────────────────────────────────────────────────┐
│ CANVAS COMPONENT (Angular 18)                       │
├─────────────────────────────────────────────────────┤
│                                                     │
│  integration-mode.service.ts                       │
│  • Mode Detection                                  │
│  • postMessage Handling                            │
│  • sendMetadataToParent()                          │
│                                                     │
│  canvas-view.component.ts                          │
│  • PLUGIN_PAGE_DATA Handler                        │
│  • Mode-dependent Submit                           │
│  • UI Anpassungen (Close Button, Badges)          │
│                                                     │
└──────────────┬──────────────────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────────────────┐
│ WLO REPOSITORY API                                  │
├─────────────────────────────────────────────────────┤
│  POST /nodes/-home-/{parent}/children              │
│  POST /nodes/-home-/{nodeId}/metadata              │
│  PUT  /collections/-home-/{collId}/references/{id} │
│  PUT  /nodes/-home-/{nodeId}/workflow              │
└─────────────────────────────────────────────────────┘
```

### Datenfluss

#### 1. Plugin → Canvas (PLUGIN_PAGE_DATA)

```javascript
// popup.js → content.js → Canvas
const pageData = {
  url: "https://example.com/resource",
  title: "Example Course",
  html: "<main>...</main>",
  text: "Formatted readable text...",
  metadata: {
    meta: {
      description: "Course description",
      keywords: "math, education",
      author: "Jane Doe"
    },
    structuredData: [...],  // JSON-LD, Microdata
    crawlerData: {          // Optional
      title: "...",
      description: "...",
      discipline: "Mathematics"
    }
  },
  mode: "browser-extension"
};

iframe.contentWindow.postMessage({
  type: 'PLUGIN_PAGE_DATA',
  ...pageData
}, '*');
```

#### 2. Canvas → Plugin (CANVAS_METADATA_READY)

```javascript
// Canvas → content.js → background.js
window.parent.postMessage({
  type: 'CANVAS_METADATA_READY',
  metadata: {
    'cclom:title': ['Example Course'],
    'cclom:general_description': ['Course about...'],
    'ccm:wwwurl': ['https://example.com/resource'],
    'ccm:taxonid': ['http://w3id.org/openeduhub/vocabs/discipline/100'],
    // ... alle extrahierten Felder
  },
  mode: 'browser-extension'
}, '*');
```

#### 3. Plugin → Repository API

```javascript
// background.js: handleMetadataSave()

// Step 1: Create Node (5 Pflichtfelder)
POST /nodes/-home-/{parent}/children
Body: {
  'cclom:title': [...],
  'cclom:general_description': [...],
  'cclom:general_keyword': [...],
  'ccm:wwwurl': [...],
  'cclom:general_language': [...]
}

// Step 2: Set Metadata (Rest)
POST /nodes/-home-/{nodeId}/metadata
Body: {
  'ccm:taxonid': [...],
  'ccm:educationalcontext': [...],
  // ... alle übrigen Felder
}

// Step 3: Add to Collection
PUT /collections/-home-/{collectionId}/references/{nodeId}

// Step 4: Start Workflow
PUT /nodes/-home-/{nodeId}/workflow
Body: {
  status: "200_tocheck",
  comment: "Canvas Upload via Browser Plugin"
}
```

### Generischer Crawler Integration

**Optional & nicht-blockierend:**

```javascript
// popup.js: openCanvasWithExtraction()

try {
  const crawlerResponse = await fetch(
    `${config.crawler.url}?url=${encodeURIComponent(url)}`,
    { headers: { 'X-API-Key': config.crawler.apiKey } }
  );
  
  if (crawlerResponse.ok) {
    crawlerData = await crawlerResponse.json();
    console.log('✅ Crawler data loaded');
  }
} catch (e) {
  console.log('⚠️ Crawler not available, continuing without');
  // Canvas funktioniert trotzdem!
}

// Crawler-Daten werden in pageData.metadata.crawlerData mitgesendet
// Canvas zeigt sie transparent im Textarea:
// "--- Generischer Crawler Daten ---
//  Crawler Titel: ...
//  Crawler Beschreibung: ..."
```

**Vorteile:**
- ✅ Kombination: LLM-Extraktion + Crawler-Daten = Beste Ergebnisse
- ✅ Fallback: Crawler-Ausfall blockiert nicht
- ✅ Transparent: User sieht Crawler-Daten im Text
- ✅ Ein Button: Kein separater Workflow

---

## ⚙️ Konfiguration

### Canvas URL anpassen

**Lokal (Development):**
```javascript
// settings/config.js
canvas: {
  url: "http://localhost:4200",
  mode: "browser-extension"
}
```

**Deployed (Production):**
```javascript
canvas: {
  url: "https://metadata-canvas.staging.openeduhub.net",
  mode: "browser-extension"
}
```

### Repository wechseln

```javascript
// settings/config.js
repository: {
  staging: {
    enabled: true,  // ← Aktiviert
    name: "WLO Staging",
    baseUrl: "https://repository.staging.openeduhub.net/edu-sharing/"
  },
  production: {
    enabled: false,  // ← Deaktiviert
    name: "WLO Production",
    baseUrl: "https://redaktion.openeduhub.net/edu-sharing/"
  }
}
```

### Generischen Crawler deaktivieren

```javascript
// settings/config.js
crawler: {
  url: "",  // ← Leer lassen
  apiKey: ""
}

// Oder in popup.js den API Call auskommentieren
```

---

## 🧪 Testing

### Lokaler Test

```bash
# Terminal 1: Canvas starten
cd webkomponente-canvas
npm start  # http://localhost:4200

# Browser:
1. Lade Plugin (unpacked)
2. Öffne Test-Webseite (z.B. https://example.com)
3. Klicke Plugin-Icon → "Werk vorschlagen"
4. Canvas öffnet sich
5. URL + Inhalt sind vorausgefüllt ✅
6. "Generate" → Felder werden gefüllt ✅
7. "An Plugin senden" → Repository Upload ✅
8. Success Notification ✅
```

### Production Test

```bash
# Canvas deployen
cd webkomponente-canvas
npm run build
netlify deploy --prod

# Plugin Config anpassen
# canvas.url = "https://your-site.netlify.app"

# Plugin neu laden in Chrome
# Test wie oben
```

---

## 🐛 Troubleshooting

### Canvas öffnet sich nicht

**Prüfungen:**
```javascript
// 1. Canvas-URL korrekt?
console.log(defaultConfig.canvas.url);

// 2. Canvas läuft?
// Öffne URL im Browser → sollte Canvas anzeigen

// 3. CORS-Fehler?
// Canvas Console sollte zeigen: "Received page data from Browser Plugin"
```

### Daten kommen nicht an

**Console Logs prüfen:**
```
// Plugin Console (background.js):
📤 Sending page data to Canvas: https://example.com

// Canvas Console:
📨 Received page data from Browser Plugin:
  - URL: https://example.com
  - Mode: browser-extension
🔄 Mode updated to: browser-extension
```

### Repository-Upload schlägt fehl

**Häufige Fehler:**
```javascript
// 1. Credentials falsch?
// Prüfe publishPublic.username/password in config.js

// 2. Repository nicht erreichbar?
// Öffne baseUrl im Browser

// 3. Fehlende Felder?
// background.js Console zeigt welche Felder fehlen

// 4. URL nicht in Metadaten?
// Canvas muss ccm:wwwurl zurücksenden
```

---

## 📚 Weitere Dokumentation

**In diesem Repository:**
- `CANVAS_INTEGRATION.md` - Vollständige Integration-Dokumentation
- `../FINAL_INTEGRATION_AUDIT.md` - Abschlussprüfung aller Komponenten
- `../INTEGRATION_STATUS.md` - Status & Deployment-Guide
- `../MODE_DETECTION.md` - Mode-Erkennung im Detail

**Canvas Webkomponente:**
- `../webkomponente-canvas/README.md` - Canvas Dokumentation
- `../webkomponente-canvas/MODE_DETECTION.md` - Integration Modes

---

## 🔐 Sicherheit

### Credentials

**Guest Mode:**
- Username/Password in `config.js` (nur für Entwicklung)
- Für Production: Environment Variables oder Chrome Storage

**User Mode:**
- Login-Credentials werden in `chrome.storage.local` gespeichert
- Verschlüsselt durch Chrome
- Nur für angemeldeten User zugänglich

### API-Keys

**Generischer Crawler:**
- API-Key in `config.js` (Development)
- Für Production: Secrets-Controller nutzen

**Canvas LLM:**
- API-Keys sind NICHT im Plugin
- Canvas nutzt Netlify Functions (server-side)
- Keys bleiben in Netlify Environment Variables

---

## 🚀 Deployment

### Chrome Web Store

```bash
# 1. Version erhöhen
# manifest.json: "version": "2.0.0"

# 2. ZIP erstellen
zip -r wlo-metadata-agent-v2.0.0.zip . -x "node_modules/*" ".*" "*.md"

# 3. Chrome Developer Dashboard
# → Upload ZIP
# → Submit for Review
```

### Enterprise Deployment

**Group Policy (Windows):**
```json
{
  "ExtensionInstallForcelist": [
    "<extension-id>;https://clients2.google.com/service/update2/crx"
  ]
}
```

---

## 📊 Status

**Version 1.0.8 (2025-01-19):**
- ✅ **KRITISCHER FIX:** Array-Normalisierung implementiert (Error 400 behoben!)
- ✅ Canvas-Integration im **Gast-Modus** vollständig funktionsfähig
- ✅ User-Mode funktioniert (mit altem Formular)
- ✅ Generischer Crawler optional integriert
- ✅ Repository-Upload funktioniert (Gast & User)
- ✅ Workflow-Start funktioniert
- 🚧 Canvas-Integration für User-Mode in Arbeit (v1.1.0)
- 🚧 Chrome Web Store Submission ausstehend

**Tested & Working:**
- ✅ Gast-Mode mit Canvas (localhost:4200 & Netlify)
- ✅ User-Mode mit altem Formular
- ✅ Datenextraktion & Normalisierung
- ✅ CreateNode, SetMetadata, Workflow
- ✅ Crawler verfügbar/nicht verfügbar

**Known Issues:**
- ⚠️ Canvas-Integration nur im Gast-Modus (User-Mode nutzt legacy embed/mds)
- ℹ️ Fix übernommen von funktionierender Webkomponente (repository-proxy.js)

---

## 📞 Support

Bei Fragen oder Problemen:
- GitHub Issues: [Repository Issues](https://github.com/janschachtschabel/metadata-agent-canvas/issues)
- Email: support@wirlernenonline.de
- Dokumentation: Siehe oben verlinkte Docs

---

## Lizenz

Dieses Projekt steht unter der GNU General Public License v3 (GPLv3).  
Siehe die Datei [`LICENSE`](./LICENSE) oder [gnu.org/licenses/gpl-3.0](https://www.gnu.org/licenses/gpl-3.0.txt).

## Autor:innen

- Harald Holzmann – [harald@various.at](mailto:harald@various.at)
- Various Interactive GmbH – https://various.at
- Jan Schachtschabel – WLO Metadata Agent Canvas Integration
