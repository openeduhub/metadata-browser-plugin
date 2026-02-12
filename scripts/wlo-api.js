/**
 * WLO (WirLernenOnline) API Integration
 * Für die Suche und Abruf von Bildungsinhalten
 */

const WLO_API = {
  // API Basis-URLs
  BASE_URL: 'https://redaktion.openeduhub.net/edu-sharing/rest',
  SEARCH_URL: 'https://suche.wirlernenonline.de',
  
  // Repository ID für WLO
  REPOSITORY: '-home-',

  /**
   * Suche nach Bildungsinhalten
   * @param {string} query - Suchbegriff
   * @param {object} options - Suchoptionen
   * @returns {Promise<Array>} - Suchergebnisse
   */
  async search(query, options = {}) {
    const {
      maxItems = 10,
      skipCount = 0,
      contentType = null,
      educationalContext = null,
      discipline = null
    } = options;

    const searchParams = {
      query: query,
      maxItems: maxItems,
      skipCount: skipCount,
      propertyFilter: ['-all-']
    };

    // Filter hinzufügen
    const criteria = [];
    
    if (contentType) {
      criteria.push({
        property: 'ccm:oeh_lrt',
        values: [contentType]
      });
    }

    if (educationalContext) {
      criteria.push({
        property: 'ccm:educationalcontext',
        values: [educationalContext]
      });
    }

    if (discipline) {
      criteria.push({
        property: 'ccm:taxonid',
        values: [discipline]
      });
    }

    try {
      const response = await fetch(`${this.BASE_URL}/search/v1/queries/${this.REPOSITORY}/mds/ngsearch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          criteria: criteria,
          query: query,
          maxItems: maxItems,
          skipCount: skipCount
        })
      });

      if (!response.ok) {
        throw new Error(`WLO API Fehler: ${response.status}`);
      }

      const data = await response.json();
      return this.transformResults(data.nodes || []);
    } catch (error) {
      console.error('WLO Suche fehlgeschlagen:', error);
      // Fallback: Simulierte Ergebnisse für Entwicklung
      return this.getMockResults(query);
    }
  },

  /**
   * Transformiert API-Ergebnisse in einheitliches Format
   */
  transformResults(nodes) {
    return nodes.map(node => ({
      id: node.ref?.id || node.id,
      title: node.title || node.name || 'Unbenannt',
      description: node.description || '',
      url: node.content?.url || node.properties?.['ccm:wwwurl']?.[0] || '',
      thumbnail: node.preview?.url || node.iconURL || '',
      type: this.getResourceType(node),
      license: node.properties?.['ccm:commonlicense_key']?.[0] || '',
      author: node.properties?.['ccm:author']?.[0] || '',
      keywords: node.properties?.['cclom:general_keyword'] || [],
      educationalContext: node.properties?.['ccm:educationalcontext'] || [],
      discipline: node.properties?.['ccm:taxonid'] || [],
      duration: node.properties?.['cclom:duration']?.[0] || null
    }));
  },

  /**
   * Ermittelt den Ressourcentyp
   */
  getResourceType(node) {
    const lrt = node.properties?.['ccm:oeh_lrt']?.[0] || '';
    const typeMap = {
      'video': '🎬 Video',
      'audio': '🎧 Audio',
      'image': '🖼️ Bild',
      'text': '📄 Text',
      'application': '💻 Anwendung',
      'worksheet': '📝 Arbeitsblatt',
      'lesson_plan': '📋 Unterrichtsentwurf',
      'simulation': '🔬 Simulation',
      'game': '🎮 Spiel',
      'tool': '🔧 Werkzeug'
    };
    
    for (const [key, value] of Object.entries(typeMap)) {
      if (lrt.toLowerCase().includes(key)) return value;
    }
    return '📦 Material';
  },

  /**
   * Mock-Ergebnisse für Entwicklung/Demo
   */
  getMockResults(query) {
    const mockData = [
      {
        id: 'mock-1',
        title: `Einführung: ${query}`,
        description: 'Ein einführendes Video zum Thema',
        url: 'https://example.com/video1',
        thumbnail: 'https://via.placeholder.com/200x150?text=Video',
        type: '🎬 Video',
        license: 'CC BY-SA 4.0',
        duration: '5:30'
      },
      {
        id: 'mock-2',
        title: `Arbeitsblatt: ${query}`,
        description: 'Übungsaufgaben mit Lösungen',
        url: 'https://example.com/worksheet1',
        thumbnail: 'https://via.placeholder.com/200x150?text=AB',
        type: '📝 Arbeitsblatt',
        license: 'CC BY 4.0'
      },
      {
        id: 'mock-3',
        title: `Interaktive Übung: ${query}`,
        description: 'H5P-Übung zur Selbstkontrolle',
        url: 'https://example.com/h5p1',
        thumbnail: 'https://via.placeholder.com/200x150?text=H5P',
        type: '💻 Anwendung',
        license: 'CC0'
      },
      {
        id: 'mock-4',
        title: `Erklärvideo: ${query} verstehen`,
        description: 'Ausführliche Erklärung mit Beispielen',
        url: 'https://example.com/video2',
        thumbnail: 'https://via.placeholder.com/200x150?text=Erkl%C3%A4r',
        type: '🎬 Video',
        license: 'CC BY-SA 4.0',
        duration: '12:45'
      },
      {
        id: 'mock-5',
        title: `Quiz: ${query}`,
        description: 'Teste dein Wissen',
        url: 'https://example.com/quiz1',
        thumbnail: 'https://via.placeholder.com/200x150?text=Quiz',
        type: '🎮 Spiel',
        license: 'CC BY 4.0'
      }
    ];
    return mockData;
  },

  /**
   * Öffnet die WLO-Suche in einem neuen Tab
   */
  openSearch(query = '') {
    const url = query 
      ? `${this.SEARCH_URL}/search/de/search?q=${encodeURIComponent(query)}`
      : `${this.SEARCH_URL}/search/de/search`;
    window.open(url, '_blank');
  },

  /**
   * Generiert die Such-URL
   */
  getSearchUrl(query = '') {
    return query 
      ? `${this.SEARCH_URL}/search/de/search?q=${encodeURIComponent(query)}`
      : `${this.SEARCH_URL}/search/de/search`;
  }
};

// Inhaltstypen für Filter
const WLO_CONTENT_TYPES = [
  { id: 'video', name: 'Video', icon: '🎬' },
  { id: 'audio', name: 'Audio', icon: '🎧' },
  { id: 'image', name: 'Bild', icon: '🖼️' },
  { id: 'text', name: 'Text', icon: '📄' },
  { id: 'worksheet', name: 'Arbeitsblatt', icon: '📝' },
  { id: 'tool', name: 'Werkzeug', icon: '🔧' },
  { id: 'simulation', name: 'Simulation', icon: '🔬' },
  { id: 'game', name: 'Spiel/Quiz', icon: '🎮' }
];

// Bildungsstufen
const WLO_EDUCATIONAL_CONTEXTS = [
  { id: 'grundschule', name: 'Grundschule' },
  { id: 'sekundarstufe_1', name: 'Sekundarstufe I' },
  { id: 'sekundarstufe_2', name: 'Sekundarstufe II' },
  { id: 'berufliche_bildung', name: 'Berufliche Bildung' },
  { id: 'hochschule', name: 'Hochschule' },
  { id: 'erwachsenenbildung', name: 'Erwachsenenbildung' }
];

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { WLO_API, WLO_CONTENT_TYPES, WLO_EDUCATIONAL_CONTEXTS };
}
