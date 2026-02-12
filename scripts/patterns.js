/**
 * Ablaufmuster für Unterrichtseinheiten
 * Jedes Muster definiert Phasen mit Namen, Beschreibung und typischer Dauer
 */

const TEACHING_PATTERNS = {
  frontalunterricht: {
    id: 'frontalunterricht',
    name: 'Frontalunterricht',
    description: 'Klassischer lehrerzentrierter Unterricht',
    phases: [
      { id: 'einstieg', name: 'Einstieg', description: 'Motivation, Vorwissen aktivieren', duration: '10 min', icon: '🎯' },
      { id: 'erarbeitung', name: 'Erarbeitung', description: 'Neuer Stoff wird präsentiert', duration: '20 min', icon: '📚' },
      { id: 'sicherung', name: 'Sicherung', description: 'Zusammenfassung, Wiederholung', duration: '10 min', icon: '📝' },
      { id: 'uebung', name: 'Übung', description: 'Anwendung und Vertiefung', duration: '15 min', icon: '✏️' },
      { id: 'abschluss', name: 'Abschluss', description: 'Reflexion, Ausblick', duration: '5 min', icon: '🏁' }
    ]
  },

  problemorientiert: {
    id: 'problemorientiert',
    name: 'Problemorientiertes Lernen',
    description: 'Lernen durch Lösen authentischer Probleme',
    phases: [
      { id: 'problemstellung', name: 'Problemstellung', description: 'Authentisches Problem präsentieren', duration: '10 min', icon: '❓' },
      { id: 'hypothesen', name: 'Hypothesenbildung', description: 'Vermutungen und Lösungsideen sammeln', duration: '10 min', icon: '💡' },
      { id: 'recherche', name: 'Recherche & Erarbeitung', description: 'Informationen sammeln und auswerten', duration: '25 min', icon: '🔍' },
      { id: 'loesung', name: 'Lösungsentwicklung', description: 'Lösungsansätze erarbeiten', duration: '15 min', icon: '🔧' },
      { id: 'praesentation', name: 'Präsentation', description: 'Ergebnisse vorstellen und diskutieren', duration: '15 min', icon: '🎤' },
      { id: 'reflexion', name: 'Reflexion', description: 'Lernprozess reflektieren', duration: '5 min', icon: '🪞' }
    ]
  },

  stationenlernen: {
    id: 'stationenlernen',
    name: 'Stationenlernen',
    description: 'Selbstständiges Arbeiten an verschiedenen Stationen',
    phases: [
      { id: 'einfuehrung', name: 'Einführung', description: 'Stationen und Regeln erklären', duration: '10 min', icon: '📋' },
      { id: 'station1', name: 'Station 1', description: 'Erste Lernstation', duration: '15 min', icon: '1️⃣' },
      { id: 'station2', name: 'Station 2', description: 'Zweite Lernstation', duration: '15 min', icon: '2️⃣' },
      { id: 'station3', name: 'Station 3', description: 'Dritte Lernstation', duration: '15 min', icon: '3️⃣' },
      { id: 'station4', name: 'Station 4', description: 'Vierte Lernstation (optional)', duration: '15 min', icon: '4️⃣' },
      { id: 'auswertung', name: 'Auswertung', description: 'Ergebnisse zusammentragen', duration: '10 min', icon: '📊' }
    ]
  },

  flippedClassroom: {
    id: 'flippedClassroom',
    name: 'Flipped Classroom',
    description: 'Theorie zuhause, Anwendung im Unterricht',
    phases: [
      { id: 'vorbereitung', name: 'Vorbereitung (zuhause)', description: 'Video/Material zur Vorbereitung', duration: 'variabel', icon: '🏠' },
      { id: 'aktivierung', name: 'Aktivierung', description: 'Vorwissen prüfen, Fragen klären', duration: '10 min', icon: '❓' },
      { id: 'vertiefung', name: 'Vertiefung', description: 'Intensive Übungen und Anwendung', duration: '30 min', icon: '🎯' },
      { id: 'projektarbeit', name: 'Projektarbeit', description: 'Komplexe Aufgaben bearbeiten', duration: '20 min', icon: '🛠️' },
      { id: 'feedback', name: 'Feedback', description: 'Individuelle Rückmeldung', duration: '10 min', icon: '💬' }
    ]
  },

  direkteInstruktion: {
    id: 'direkteInstruktion',
    name: 'Direkte Instruktion',
    description: 'Strukturierte, kleinschrittige Vermittlung',
    phases: [
      { id: 'review', name: 'Review', description: 'Wiederholung des Vorwissens', duration: '5 min', icon: '🔄' },
      { id: 'praesentation', name: 'Präsentation', description: 'Neuer Stoff in kleinen Schritten', duration: '15 min', icon: '📖' },
      { id: 'gefuehrteUebung', name: 'Geführte Übung', description: 'Gemeinsames Üben mit Anleitung', duration: '15 min', icon: '👥' },
      { id: 'selbststaendigeUebung', name: 'Selbstständige Übung', description: 'Eigenständiges Üben', duration: '20 min', icon: '✍️' },
      { id: 'woechentlicheReview', name: 'Zusammenfassung', description: 'Wichtigste Punkte wiederholen', duration: '5 min', icon: '📝' }
    ]
  },

  kooperativesLernen: {
    id: 'kooperativesLernen',
    name: 'Kooperatives Lernen',
    description: 'Lernen in strukturierten Gruppen',
    phases: [
      { id: 'think', name: 'Think (Einzelarbeit)', description: 'Individuelles Nachdenken', duration: '5 min', icon: '🤔' },
      { id: 'pair', name: 'Pair (Partnerarbeit)', description: 'Austausch mit Partner', duration: '10 min', icon: '👥' },
      { id: 'share', name: 'Share (Plenum)', description: 'Ergebnisse im Plenum teilen', duration: '10 min', icon: '🗣️' },
      { id: 'gruppenarbeit', name: 'Gruppenarbeit', description: 'Vertiefende Gruppenaufgabe', duration: '20 min', icon: '👨‍👩‍👧‍👦' },
      { id: 'galerie', name: 'Galeriegang', description: 'Ergebnisse präsentieren und bewerten', duration: '15 min', icon: '🖼️' }
    ]
  },

  forschendesLernen: {
    id: 'forschendesLernen',
    name: 'Forschendes Lernen',
    description: 'Wissenschaftliches Arbeiten und Entdecken',
    phases: [
      { id: 'frage', name: 'Forschungsfrage', description: 'Frage oder Phänomen identifizieren', duration: '10 min', icon: '🔬' },
      { id: 'planung', name: 'Planung', description: 'Untersuchung planen', duration: '10 min', icon: '📋' },
      { id: 'durchfuehrung', name: 'Durchführung', description: 'Experiment/Recherche durchführen', duration: '25 min', icon: '⚗️' },
      { id: 'auswertung', name: 'Auswertung', description: 'Daten analysieren', duration: '15 min', icon: '📈' },
      { id: 'dokumentation', name: 'Dokumentation', description: 'Ergebnisse festhalten', duration: '10 min', icon: '📄' }
    ]
  },

  custom: {
    id: 'custom',
    name: 'Eigenes Muster',
    description: 'Eigene Phasen definieren',
    phases: [
      { id: 'phase1', name: 'Phase 1', description: 'Beschreibung hinzufügen', duration: '10 min', icon: '1️⃣' },
      { id: 'phase2', name: 'Phase 2', description: 'Beschreibung hinzufügen', duration: '10 min', icon: '2️⃣' },
      { id: 'phase3', name: 'Phase 3', description: 'Beschreibung hinzufügen', duration: '10 min', icon: '3️⃣' }
    ]
  }
};

/**
 * Binnendifferenzierung - Optionen für verschiedene Lernbedarfe
 */
const DIFFERENTIATION_OPTIONS = {
  none: { id: 'none', name: 'Keine Differenzierung', description: '' },
  
  leistung: {
    id: 'leistung',
    name: 'Leistungsdifferenzierung',
    description: 'Anpassung nach Leistungsniveau',
    levels: [
      { id: 'basis', name: 'Basisniveau', hint: 'Grundlegende Aufgaben, mehr Hilfestellung' },
      { id: 'standard', name: 'Standardniveau', hint: 'Regelanforderungen' },
      { id: 'erweitert', name: 'Erweitertes Niveau', hint: 'Vertiefende, komplexere Aufgaben' }
    ]
  },

  lerntyp: {
    id: 'lerntyp',
    name: 'Lerntypendifferenzierung',
    description: 'Anpassung nach Lernpräferenzen',
    types: [
      { id: 'visuell', name: 'Visuell', hint: 'Bilder, Videos, Grafiken' },
      { id: 'auditiv', name: 'Auditiv', hint: 'Podcasts, Erklärungen, Diskussionen' },
      { id: 'kinesthetisch', name: 'Kinästhetisch', hint: 'Handlungsorientiert, Experimente' },
      { id: 'lesend', name: 'Lesen/Schreiben', hint: 'Texte, Notizen, schriftliche Aufgaben' }
    ]
  },

  foerderbedarf: {
    id: 'foerderbedarf',
    name: 'Förderbedarf',
    description: 'Spezielle Unterstützung',
    needs: [
      { id: 'lrs', name: 'LRS', hint: 'Lese-Rechtschreib-Schwäche: Vorlesefunktion, visuelle Unterstützung' },
      { id: 'dyskalkulie', name: 'Dyskalkulie', hint: 'Rechenschwäche: Visualisierungen, Handlungsmaterial' },
      { id: 'adhs', name: 'ADHS', hint: 'Klare Struktur, kürzere Einheiten, Bewegungspausen' },
      { id: 'hochbegabung', name: 'Hochbegabung', hint: 'Enrichment, komplexere Aufgaben' },
      { id: 'daz', name: 'DaZ', hint: 'Deutsch als Zweitsprache: Sprachentlastung, Wortschatzarbeit' }
    ]
  },

  interesse: {
    id: 'interesse',
    name: 'Interessendifferenzierung',
    description: 'Wahlmöglichkeiten nach Interesse',
    hint: 'Verschiedene Themen/Kontexte für gleiche Kompetenzen anbieten'
  },

  tempo: {
    id: 'tempo',
    name: 'Tempodifferenzierung',
    description: 'Unterschiedliche Bearbeitungszeiten',
    hint: 'Pflicht- und Zusatzaufgaben, individuelle Zeiteinteilung'
  }
};

// Export für Module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TEACHING_PATTERNS, DIFFERENTIATION_OPTIONS };
}
