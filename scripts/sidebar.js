/**
 * Unified Sidebar Controller
 * Verwaltet die Tab-Navigation zwischen Warenkorb und Publishing
 */

class UnifiedSidebar {
  constructor() {
    this.currentTab = 'warenkorb';
    this.warenkorbInstance = null;
  }

  /**
   * Initialisiert die Sidebar
   */
  init() {
    console.log('📋 Unified Sidebar initialisiert');
    this.setupTabNavigation();
    this.initializeWarenkorb();
  }

  /**
   * Richtet Tab-Navigation ein
   */
  setupTabNavigation() {
    const tabButtons = document.querySelectorAll('.sidebar-tab-btn');
    
    tabButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tabName = btn.dataset.tab;
        console.log('🔄 Tab gewechselt zu:', tabName);
        this.switchTab(tabName);
      });
    });
  }

  /**
   * Wechselt zwischen Tabs
   */
  switchTab(tabName) {
    // Alle Tab-Buttons deaktivieren
    document.querySelectorAll('.sidebar-tab-btn').forEach(btn => {
      btn.classList.remove('active');
    });

    // Alle Tab-Inhalte verstecken
    document.querySelectorAll('.sidebar-tab-content').forEach(content => {
      content.classList.remove('active');
    });

    // Aktiven Button und Inhalt aktivieren
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');

    this.currentTab = tabName;
    console.log('✅ Tab aktiv:', tabName);
  }

  /**
   * Initialisiert den Warenkorb
   */
  initializeWarenkorb() {
    // Warenkorb-Instanz erstellen
    if (typeof WarenkorbSidebar !== 'undefined') {
      this.warenkorbInstance = new WarenkorbSidebar();
      this.warenkorbInstance.init();
      console.log('✅ Warenkorb initialisiert');
    } else {
      console.warn('⚠️ WarenkorbSidebar nicht verfügbar');
    }
  }
}

// Globale Instanz
let unifiedSidebar = null;

// Initialisierung beim Laden
document.addEventListener('DOMContentLoaded', () => {
  unifiedSidebar = new UnifiedSidebar();
  unifiedSidebar.init();
});

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { UnifiedSidebar };
}
