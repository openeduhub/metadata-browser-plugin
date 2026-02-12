/**
 * Pädagogischer Warenkorb - Sidebar Controller für iframe
 * Basiert auf warenkorb/sidebar.js, angepasst für Extension-Kontext
 */

class WarenkorbSidebar {
  constructor() {
    this.currentPattern = null;
    this.phases = [];
    this.selectedDifferentiation = [];
    this.metadata = {
      title: '',
      subject: '',
      grade: '',
      duration: ''
    };
    this.container = null;
  }

  /**
   * Initialisiert die Sidebar
   */
  async init() {
    // Sidebar rendern
    this.render();
    
    // Event Listener hinzufügen
    this.attachEventListeners();
    
    // Gespeicherte Daten laden
    await this.loadState();
    
    // Message Listener für Content Script
    this.setupMessageListener();
    
    console.log('Pädagogischer Warenkorb initialisiert');
  }

  /**
   * Rendert die Sidebar
   */
  render() {
    this.container = document.getElementById('warenkorb-sidebar');
    if (!this.container) {
      console.error('Container #warenkorb-sidebar nicht gefunden');
      return;
    }

    // Pattern-Optionen generieren
    const patternOptions = Object.values(TEACHING_PATTERNS)
      .map(p => `<option value="${p.id}">${p.name}</option>`)
      .join('');

    // Pattern-Select aktualisieren
    const patternSelect = this.container.querySelector('#wk-pattern-select');
    if (patternSelect) {
      patternSelect.innerHTML = patternOptions;
    }

    // Differenzierungs-Tags generieren
    const diffOptions = this.container.querySelector('#wk-diff-options');
    if (diffOptions) {
      diffOptions.innerHTML = this.getDifferentiationTags();
    }
  }

  /**
   * Generiert Differenzierungs-Tags (nicht verwendet - nur für Kompatibilität)
   */
  getDifferentiationTags() {
    return '';
  }

  /**
   * Rendert die Phasen des ausgewählten Musters
   */
  renderPhases() {
    const container = document.getElementById('wk-phases-container');
    if (!container || !this.currentPattern) return;

    container.innerHTML = this.currentPattern.phases.map((phase, index) => `
      <div class="wk-phase expanded" data-phase-id="${phase.id}" data-phase-index="${index}">
        <div class="wk-phase-header">
          <span class="wk-phase-icon">${phase.icon}</span>
          <div class="wk-phase-info">
            <div class="wk-phase-name">${phase.name}</div>
            <div class="wk-phase-meta">${phase.description}</div>
          </div>
          <span class="wk-phase-duration">${phase.duration}</span>
          <button class="wk-phase-toggle">▼</button>
        </div>
        <div class="wk-phase-content">
          <div class="wk-dropzone" data-phase-id="${phase.id}">
            <div class="wk-dropzone-hint">
              <span>📦</span>
              Klicke 🛒 auf WLO-Karten
            </div>
          </div>
        </div>
      </div>
    `).join('');

    // Phasen-Daten initialisieren
    this.phases = this.currentPattern.phases.map(phase => ({
      ...phase,
      items: []
    }));
  }

  /**
   * Wählt ein Ablaufmuster aus
   */
  selectPattern(patternId) {
    this.currentPattern = TEACHING_PATTERNS[patternId];
    if (this.currentPattern) {
      this.renderPhases();
      this.setupDropZones();
    }
  }

  /**
   * Richtet Drag & Drop für die Dropzones ein
   */
  setupDropZones() {
    const dropzones = document.querySelectorAll('.wk-dropzone');
    
    dropzones.forEach(zone => {
      zone.addEventListener('dragover', (e) => {
        e.preventDefault();
        zone.closest('.wk-phase').classList.add('drag-over');
      });

      zone.addEventListener('dragleave', () => {
        zone.closest('.wk-phase').classList.remove('drag-over');
      });

      zone.addEventListener('drop', (e) => {
        e.preventDefault();
        zone.closest('.wk-phase').classList.remove('drag-over');
        
        try {
          const data = JSON.parse(e.dataTransfer.getData('application/json'));
          this.addItemToPhase(zone.dataset.phaseId, data);
        } catch (err) {
          // Fallback: Text-Daten
          const text = e.dataTransfer.getData('text/plain');
          if (text) {
            this.addItemToPhase(zone.dataset.phaseId, {
              id: 'manual-' + Date.now(),
              title: text.substring(0, 100),
              type: '📎 Link',
              url: text.startsWith('http') ? text : ''
            });
          }
        }
      });
    });
  }

  /**
   * Fügt ein Item zu einer Phase hinzu
   */
  addItemToPhase(phaseId, item) {
    const phaseIndex = this.phases.findIndex(p => p.id === phaseId);
    if (phaseIndex === -1) return;

    // Item zur Phase hinzufügen
    this.phases[phaseIndex].items.push(item);

    // UI aktualisieren
    this.renderPhaseItems(phaseId);
    
    // Benachrichtigung zeigen
    this.showNotification(`"${item.title}" hinzugefügt zu "${this.phases[phaseIndex].name}"`);
  }

  /**
   * Entfernt ein Item aus einer Phase
   */
  removeItemFromPhase(phaseId, itemId) {
    const phaseIndex = this.phases.findIndex(p => p.id === phaseId);
    if (phaseIndex === -1) return;

    this.phases[phaseIndex].items = this.phases[phaseIndex].items.filter(
      item => item.id !== itemId
    );

    this.renderPhaseItems(phaseId);
    this.saveState();
  }

  /**
   * Rendert die Items einer Phase
   */
  renderPhaseItems(phaseId) {
    const phase = this.phases.find(p => p.id === phaseId);
    const dropzone = document.querySelector(`.wk-dropzone[data-phase-id="${phaseId}"]`);
    
    if (!phase || !dropzone) return;

    if (phase.items.length === 0) {
      dropzone.innerHTML = `
        <div class="wk-dropzone-hint">
          <span>📦</span>
          Klicke 🛒 auf WLO-Karten
        </div>
      `;
      dropzone.classList.remove('has-items');
    } else {
      dropzone.innerHTML = phase.items.map(item => `
        <div class="wk-content-item" draggable="true" data-item-id="${item.id}">
          ${item.thumbnail ? `<img src="${item.thumbnail}" alt="">` : ''}
          <div class="wk-content-item-info">
            <div class="wk-content-item-title">${item.title}</div>
            <div class="wk-content-item-type">${item.type}</div>
          </div>
          <button class="wk-content-item-remove" data-phase-id="${phaseId}" data-item-id="${item.id}">✕</button>
        </div>
      `).join('');
      dropzone.classList.add('has-items');

      // Remove-Button Events
      dropzone.querySelectorAll('.wk-content-item-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.removeItemFromPhase(btn.dataset.phaseId, btn.dataset.itemId);
        });
      });
    }
  }

  /**
   * Automatische Suche für eine Phase über Content Script
   */
  async autoSearchForPhase(phaseId, query) {
    if (!query.trim()) return;

    console.log('🔍 Starte WLO-Suche für Phase:', phaseId, 'Query:', query);

    // Sende Suche-Request an Content Script
    window.parent.postMessage({
      action: 'searchWLO',
      phaseId: phaseId,
      query: query,
      maxItems: 3
    }, '*');
  }

  /**
   * Zeigt eine Benachrichtigung
   */
  showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #10b981;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-family: system-ui, sans-serif;
      font-size: 14px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 1000000;
      animation: wk-fade-in 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  /**
   * Registriert alle Event Listener
   */
  attachEventListeners() {
    // Pattern Auswahl
    const patternSelect = document.getElementById('wk-pattern-select');
    if (patternSelect) {
      patternSelect.addEventListener('change', (e) => {
        console.log('Pattern geändert zu:', e.target.value);
        this.selectPattern(e.target.value);
      });
    }

    // WLO Suche
    const searchBtn = document.getElementById('wk-search-btn');
    if (searchBtn) {
      searchBtn.addEventListener('click', () => {
        const query = document.getElementById('wk-search-input').value;
        console.log('WLO-Suche für:', query);
        WLO_API.openSearch(query);
      });
    }

    const searchInput = document.getElementById('wk-search-input');
    if (searchInput) {
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          console.log('WLO-Suche (Enter) für:', e.target.value);
          WLO_API.openSearch(e.target.value);
        }
      });
    }

    // Phase Toggle und Aktivierung
    this.container.addEventListener('click', (e) => {
      if (e.target.closest('.wk-phase-header')) {
        const phase = e.target.closest('.wk-phase');
        const phaseId = phase.dataset.phaseId;
        const phaseName = phase.querySelector('.wk-phase-name')?.textContent;
        
        console.log('Phase geklickt:', phaseId, phaseName);
        
        // Phase expandieren/kollabieren
        phase.classList.toggle('expanded');
        
        // Phase aktivieren (alle anderen deaktivieren)
        this.container.querySelectorAll('.wk-phase').forEach(p => {
          p.classList.remove('active');
        });
        phase.classList.add('active');
        
        console.log('Phase aktiviert:', phaseId);
      }
    });

    // Clear Button
    const clearBtn = document.getElementById('wk-clear-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (confirm('Alle Inhalte aus den Phasen entfernen?')) {
          this.phases.forEach(phase => {
            phase.items = [];
            this.renderPhaseItems(phase.id);
          });
          this.saveState();
        }
      });
    }

    // Export Button
    const exportBtn = document.getElementById('wk-export-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        this.exportToPDF();
      });
    }
  }

  /**
   * Aktualisiert die ausgewählte Differenzierung
   */
  updateDifferentiation() {
    this.selectedDifferentiation = [];
    
    this.container.querySelectorAll('.wk-diff-tag.active').forEach(tag => {
      this.selectedDifferentiation.push({
        id: tag.dataset.diffId,
        name: tag.textContent.trim(),
        hint: tag.dataset.diffHint
      });
    });
  }

  /**
   * Exportiert den Unterrichtsentwurf als PDF
   */
  exportToPDF() {
    const lessonPlan = {
      pattern: {
        id: this.currentPattern.id,
        name: this.currentPattern.name,
        description: this.currentPattern.description
      },
      phases: this.phases,
      differentiation: this.selectedDifferentiation,
      metadata: this.metadata
    };

    PDFExport.openPrintView(lessonPlan);
  }

  /**
   * Speichert den aktuellen Zustand in chrome.storage
   */
  async saveState() {
    try {
      const state = {
        currentPattern: this.currentPattern?.id,
        phases: this.phases,
        selectedDifferentiation: this.selectedDifferentiation,
        metadata: this.metadata
      };
      await chrome.storage.local.set({ warenkorbState: state });
      console.log('Warenkorb-Zustand gespeichert');
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
    }
  }

  /**
   * Lädt den gespeicherten Zustand aus chrome.storage
   */
  async loadState() {
    try {
      const data = await chrome.storage.local.get(['warenkorbState']);
      
      if (data.warenkorbState) {
        console.log('Warenkorb-Zustand geladen');
        const state = data.warenkorbState;
        
        // Pattern und Phasen wiederherstellen
        if (state.currentPattern) {
          this.selectPattern(state.currentPattern);
        } else {
          this.selectPattern('frontalunterricht');
        }
        
        // Items in Phasen wiederherstellen
        if (state.phases && state.phases.length > 0) {
          this.phases.forEach((phase, index) => {
            if (state.phases[index] && state.phases[index].items) {
              phase.items = state.phases[index].items;
              this.renderPhaseItems(phase.id);
            }
          });
        }
        
        // Differenzierung wiederherstellen
        if (state.selectedDifferentiation) {
          this.selectedDifferentiation = state.selectedDifferentiation;
          // UI aktualisieren
          this.container.querySelectorAll('.wk-diff-tag').forEach(tag => {
            const isActive = state.selectedDifferentiation.some(d => d.id === tag.dataset.diffId);
            tag.classList.toggle('active', isActive);
          });
        }
        
        // Metadata wiederherstellen
        if (state.metadata) {
          this.metadata = state.metadata;
        }
      } else {
        console.log('Keine gespeicherten Daten, verwende Standard-Muster');
        this.selectPattern('frontalunterricht');
      }
    } catch (error) {
      console.error('Fehler beim Laden:', error);
      this.selectPattern('frontalunterricht');
    }
  }

  /**
   * Setzt up Message Listener für Content Script
   */
  setupMessageListener() {
    const self = this;
    
    window.addEventListener('message', (event) => {
      console.log('Message in Warenkorb-iframe empfangen:', event.data);

      if (event.data.action === 'addItemToPhase') {
        console.log('Item empfangen:', event.data.item);
        console.log('Verfügbare Phasen:', self.phases.length);
        
        // Aktive Phase finden, sonst erste Phase mit weniger als 3 Items
        let targetPhase = self.container.querySelector('.wk-phase.active');
        console.log('Aktive Phase gefunden:', !!targetPhase);
        
        if (targetPhase) {
          const phaseId = targetPhase.dataset.phaseId;
          const phase = self.phases.find(p => p.id === phaseId);
          console.log('Verwende aktive Phase:', phaseId);
          if (phase) {
            self.addItemToPhase(phaseId, event.data.item);
            self.saveState();
          }
        } else {
          // Fallback: Erste Phase mit weniger als 3 Items
          const fallbackPhase = self.phases.find(p => p.items.length < 3) || self.phases[0];
          console.log('Keine aktive Phase, verwende Fallback:', fallbackPhase?.id);
          if (fallbackPhase) {
            self.addItemToPhase(fallbackPhase.id, event.data.item);
            self.saveState();
          }
        }
      }
      
      if (event.data.action === 'searchResults') {
        console.log('Suchergebnisse empfangen für Phase:', event.data.phaseId);
        console.log('Anzahl Ergebnisse:', event.data.results.length);
        
        const phaseId = event.data.phaseId;
        const results = event.data.results;
        
        // Füge alle Ergebnisse zur Phase hinzu
        results.forEach(item => {
          self.addItemToPhase(phaseId, item);
        });
        
        self.saveState();
      }
      
      if (event.data.action === 'searchError') {
        console.error('Fehler bei WLO-Suche:', event.data.error);
        self.showNotification('Suche fehlgeschlagen: ' + event.data.error);
      }
    });
  }
}

// Globale Instanz
let warenkorbInstance = null;

/**
 * Initialisiert den Pädagogischen Warenkorb
 */
function initWarenkorb() {
  if (warenkorbInstance) {
    warenkorbInstance.destroy();
  }
  warenkorbInstance = new WarenkorbSidebar();
  warenkorbInstance.init();
  return warenkorbInstance;
}

// Initialisierung beim Laden
document.addEventListener('DOMContentLoaded', () => {
  initWarenkorb();
});

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { WarenkorbSidebar, initWarenkorb };
}
