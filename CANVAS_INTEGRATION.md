# Browser-Plugin Canvas Integration

## ✅ Implementierte Änderungen

### 1. Content Script (`scripts/content.js`)
**Erweitert:** Webseitendaten werden an Canvas übergeben

#### Neue Funktionalität:
```javascript
function openCanvas(canvasUrl, pageData) {
  // Öffnet Canvas Iframe
  // Sendet Daten via postMessage:
  {
    type: 'PLUGIN_PAGE_DATA',
    url: pageData.url,
    html: pageData.html,
    text: pageData.text,
    title: pageData.title,
    metadata: pageData.metadata,
    mode: 'browser-extension'
  }
}
```

#### Message Handling:
- Empfängt `CANVAS_METADATA_READY` von Canvas
- Leitet Metadaten an background.js weiter
- Schließt Canvas bei `CANVAS_CLOSE`

---

### 2. Background Script (`scripts/background.js`)
**Aktualisiert:** Repository-Submission mit neuer Logik

#### Änderungen für Guest & User Mode:

##### createNode (Schritt 1)
```javascript
// Nur 5 essentielle Felder:
const essentialFields = [
  'cclom:title',
  'cclom:general_description',
  'cclom:general_keyword',
  'ccm:wwwurl',
  'cclom:general_language'
];
```

##### setMetadata (Schritt 2)
```javascript
// Alle übrigen Felder (ohne essentielle + virtual:)
const metadataToSet = {};
for (const [key, value] of Object.entries(metadata)) {
  if (!essentialFields.includes(key) && !key.startsWith('virtual:')) {
    metadataToSet[key] = value;
  }
}
```

#### Beide Modi unterstützt:
- **Guest Mode:** WLO-Upload credentials → Guest Inbox
- **User Mode:** User credentials → User Home

---

### 3. Canvas Integration - Browser Plugin

## Status: ✅ **GAST-MODUS FUNKTIONIERT** | 🚧 **USER-MODUS IN ARBEIT**

**Version:** 1.0.8 (2025-01-19)

### Aktueller Stand:
- ✅ **Gast-Modus:** Canvas-Integration vollständig funktionsfähig mit Array-Normalisierung Fix
- 🚧 **User-Modus:** Nutzt noch altes embed/mds Formular (Canvas-Integration geplant für v1.1.0)

Dieses Dokument beschreibt die Integration der Canvas-Komponente (Metadata Extractor) in das WLO Browser Plugin.

### 3. Canvas Integration Script (`scripts/canvas-integration.js`)
**Neu:** Orchestriert Canvas-Öffnung mit Datenextraktion

#### Workflow:
```javascript
openCanvasWithPageData()
  ↓
1. Inject content-extractor.js
  ↓
2. Execute extractPageContent()
  ↓
3. Format data for Canvas
  ↓
4. Send to content.js: openCanvas(url, pageData)
  ↓
5. content.js: postMessage → Canvas
```

---

### 4. Canvas Webkomponente
**Erweitert:** Empfängt Plugin-Daten

#### Neuer Handler:
```typescript
if (event.data.type === 'PLUGIN_PAGE_DATA') {
  // Setzt Text/HTML in Textarea
  this.userText = event.data.text || event.data.html;
  
  // Speichert URL für Dublettenprüfung
  sessionStorage.setItem('canvas_page_url', event.data.url);
  
  // Speichert Metadaten für Vorausfüllung
  sessionStorage.setItem('canvas_plugin_metadata', JSON.stringify(event.data.metadata));
  
  // Sendet Bestätigung zurück
  postMessage({ type: 'PLUGIN_DATA_RECEIVED', success: true });
}
```

---

## 🔄 Workflow-Diagramm

### Kompletter Ablauf:

```
User klickt "Mit Canvas öffnen" in Plugin
  ↓
canvas-integration.js: openCanvasWithPageData()
  ↓
content-extractor.js extrahiert:
  - URL, Titel
  - HTML/Text
  - Meta-Tags
  - Structured Data
  ↓
content.js: openCanvas(canvasUrl, pageData)
  ↓
Canvas Iframe öffnet sich (Sidebar, 600px)
  ↓
postMessage: PLUGIN_PAGE_DATA → Canvas
  ↓
Canvas empfängt:
  - Text in Textarea
  - URL in SessionStorage
  - Metadaten in SessionStorage
  ↓
Canvas: postMessage PLUGIN_DATA_RECEIVED → Plugin
  ↓
User: "Generate" klicken
  ↓
Canvas: LLM-Extraktion
  ↓
User: Felder bearbeiten
  ↓
User: "Submit" klicken
  ↓
Canvas: postMessage CANVAS_METADATA_READY → Plugin
  ↓
background.js: handleMetadataSave(metadata)
  ↓
Guest/User Mode Check
  ↓
Repository API (5 Schritte):
  1. checkDuplicate (optional)
  2. createNode (5 Felder)
  3. setMetadata (Rest der Felder)
  4. setCollections (optional)
  5. startWorkflow
  ↓
Erfolgs-Notification
  ↓
Canvas schließt sich
```

---

## 📝 Zu implementierende UI-Änderungen

### Popup/Home HTML
Neuer Button in `html/home.html`:

```html
<button id="openCanvasBtn" class="btn btn-primary">
  🎨 Mit Canvas öffnen
</button>

<script>
document.getElementById('openCanvasBtn').addEventListener('click', async () => {
  // Import canvas-integration.js
  const { openCanvasWithPageData } = await import('../scripts/canvas-integration.js');
  await openCanvasWithPageData();
});
</script>
```

### Context Menu (Optional)
In `background.js` oder `manifest.json`:

```javascript
chrome.contextMenus.create({
  id: 'openCanvas',
  title: '🎨 Mit Canvas öffnen',
  contexts: ['page']
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'openCanvas') {
    openCanvasWithPageData();
  }
});
```

---

## 🔧 Konfiguration

### Canvas URL anpassen
In `scripts/canvas-integration.js`:

```javascript
const CANVAS_CONFIG = {
  // Für lokale Entwicklung:
  url: 'http://localhost:4200',
  
  // Für Production:
  // url: 'https://your-site.netlify.app',
  
  enabled: true
};
```

### Manifest Permissions
`manifest.json` sollte enthalten:

```json
{
  "permissions": [
    "activeTab",
    "scripting",
    "notifications",
    "storage"
  ],
  "host_permissions": [
    "https://*/*",
    "http://localhost/*"
  ]
}
```

---

## 🧪 Testing

### 1. Lokaler Test (Development)
```bash
# Terminal 1: Canvas starten
cd webkomponente-canvas
npm start  # localhost:4200

# Terminal 2: Proxy (für lokale Submit)
npm run proxy  # localhost:3000

# Browser:
1. Lade Plugin (unpacked)
2. Gehe zu beliebiger Webseite
3. Klicke "Mit Canvas öffnen"
4. Canvas öffnet sich mit Seitendaten
5. Generate → Felder bearbeiten → Submit
6. Plugin schreibt ins Repository
```

### 2. Production Test (Netlify)
```bash
# Canvas deployen
cd webkomponente-canvas
npm run build
netlify deploy --prod

# In canvas-integration.js:
CANVAS_CONFIG.url = 'https://your-site.netlify.app'

# Browser:
1. Lade aktualisiertes Plugin
2. Teste wie oben
```

---

## 🔐 Authentifizierung

### Guest Mode (Standard)
```javascript
// Credentials: WLO-Upload
// Collection: Guest Inbox (UUID in config.js)
// Workflow: 200_tocheck (Reviewmanager)
```

### User Mode (nach Login)
```javascript
// Credentials: User aus chrome.storage
// Collection: User Home/Inbox
// Workflow: User-spezifisch
```

**User Login:**
- Plugin-Popup: "Login" Button
- Credentials werden in `chrome.storage.local` gespeichert
- background.js prüft `authToken` für Mode-Switch

---

## 📊 Datenfluss

### Von Plugin zu Canvas:
```javascript
{
  type: 'PLUGIN_PAGE_DATA',
  url: string,              // Aktuelle URL
  title: string,            // Seitentitel
  html: string,             // Haupt-HTML
  text: string,             // Formatierter Text für Textarea
  metadata: {
    meta: {                 // Meta-Tags
      description: string,
      keywords: string,
      author: string,
      ...
    },
    structuredData: [...],  // JSON-LD
    images: [...]           // Bild-URLs
  },
  mode: 'browser-extension'
}
```

### Von Canvas zu Plugin:
```javascript
{
  type: 'CANVAS_METADATA_READY',
  metadata: {
    'cclom:title': [...],
    'cclom:general_description': [...],
    'cclom:general_keyword': [...],
    'ccm:wwwurl': [...],
    'ccm:taxonid': [...],
    'ccm:educationalcontext': [...],
    'ccm:commonlicense_key': [...],
    // ... alle extrahierten Felder
  },
  mode: 'browser-extension'
}
```

---

## ⚠️ Wichtige Hinweise

### Canvas macht KEINE Repository-Submission
- Canvas extrahiert nur Metadaten
- Canvas sendet JSON zurück an Plugin
- **Plugin schreibt ins Repository**
- Plugin nutzt eigene Credentials (nicht WLO-Upload Guest aus Canvas)

### Transformation im Plugin NICHT nötig
- Canvas sendet bereits korrekt formatierte Daten
- Arrays sind bereits Arrays
- URIs sind bereits extrahiert (bei Fach, Bildungsstufe)
- Lizenz ist bereits transformiert (CC_BY_SA)

### Security
- postMessage nur von trusted origins
- Canvas prüft origin (HTTPS oder localhost)
- Plugin prüft Canvas-URL in Config

---

## 🐛 Troubleshooting

### Canvas öffnet sich nicht
```javascript
// Prüfe Console:
// 1. CANVAS_CONFIG.url korrekt?
// 2. Canvas läuft auf dieser URL?
// 3. CORS korrekt konfiguriert?
```

### Daten kommen nicht an
```javascript
// Prüfe postMessage:
// 1. Canvas Console: "Received page data from Browser Plugin"
// 2. Plugin Console: "Sending page data to Canvas"
// 3. Origin-Check in Canvas (localhost/HTTPS)
```

### Repository-Submission schlägt fehl
```javascript
// Prüfe background.js Console:
// 1. Sind 5 Felder in createNode?
// 2. Sind alle Werte Arrays?
// 3. Guest credentials korrekt?
// 4. URL in metadata['ccm:wwwurl']?
```

---

## ✅ Checkliste

- [x] content.js erweitert (openCanvas mit pageData)
- [x] background.js aktualisiert (5 Felder + setMetadata)
- [x] canvas-integration.js erstellt (Orchestrierung)
- [x] Canvas postMessage Handler (PLUGIN_PAGE_DATA)
- [x] Guest & User Mode Support
- [x] Dokumentation

**Noch zu tun:**
- [ ] UI Button in html/home.html
- [ ] Context Menu (optional)
- [ ] Canvas URL Config für Production
- [ ] Plugin testen (lokal)
- [ ] Plugin testen (Netlify)
- [ ] Plugin veröffentlichen

---

## 📚 Dateien

### Geändert:
- `scripts/content.js` - openCanvas mit pageData
- `scripts/background.js` - Repository-Logik angepasst

### Neu:
- `scripts/canvas-integration.js` - Hauptintegration
- `CANVAS_INTEGRATION.md` - Diese Dokumentation

### Canvas (webkomponente-canvas):
- `src/app/components/canvas-view/canvas-view.component.ts` - PLUGIN_PAGE_DATA Handler
- `src/assets/canvas-integration.js` - Bookmarklet (unverändert)

---

## 🚀 Deployment

### 1. Canvas deployen
```bash
cd webkomponente-canvas
npm run build
netlify deploy --prod
```

### 2. Plugin aktualisieren
```bash
cd metadata-browser-plugin

# In canvas-integration.js:
CANVAS_CONFIG.url = 'https://your-site.netlify.app'
```

### 3. Plugin packen
```bash
# Manifest V3 Chrome Extension
zip -r wlo-metadata-agent.zip . -x "node_modules/*" ".*"
```

### 4. Chrome Web Store
- Lade ZIP hoch
- Update Version in manifest.json
- Veröffentliche Update
