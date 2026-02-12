/**
 * PDF Export für den Pädagogischen Warenkorb
 * Generiert einen druckbaren Unterrichtsentwurf
 */

const PDFExport = {
  /**
   * Generiert HTML für den Unterrichtsentwurf
   * @param {Object} lessonPlan - Der Unterrichtsplan
   * @returns {string} - HTML String
   */
  generateHTML(lessonPlan) {
    const { pattern, phases, differentiation, metadata } = lessonPlan;
    
    const today = new Date().toLocaleDateString('de-DE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <title>Unterrichtsentwurf - ${metadata?.title || pattern.name}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 12pt;
      line-height: 1.5;
      color: #1e293b;
      padding: 40px;
      max-width: 210mm;
      margin: 0 auto;
    }
    
    h1 { font-size: 24pt; margin-bottom: 8px; color: #1d4ed8; }
    h2 { font-size: 16pt; margin: 24px 0 12px; color: #334155; border-bottom: 2px solid #e2e8f0; padding-bottom: 4px; }
    h3 { font-size: 14pt; margin: 16px 0 8px; color: #475569; }
    
    .header {
      border-bottom: 3px solid #2563eb;
      padding-bottom: 20px;
      margin-bottom: 24px;
    }
    
    .meta {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      font-size: 11pt;
      color: #64748b;
      margin-top: 12px;
    }
    
    .meta-item { display: flex; gap: 8px; }
    .meta-label { font-weight: 600; }
    
    .pattern-info {
      background: #f8fafc;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 24px;
    }
    
    .pattern-name { font-weight: 600; font-size: 14pt; }
    .pattern-desc { color: #64748b; margin-top: 4px; }
    
    .phase {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      margin-bottom: 16px;
      page-break-inside: avoid;
    }
    
    .phase-header {
      background: #f1f5f9;
      padding: 12px 16px;
      border-radius: 8px 8px 0 0;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .phase-icon { font-size: 20pt; }
    .phase-title { font-weight: 600; font-size: 13pt; }
    .phase-duration {
      margin-left: auto;
      background: white;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 11pt;
      color: #64748b;
    }
    
    .phase-content { padding: 16px; }
    .phase-description { color: #64748b; font-style: italic; margin-bottom: 12px; }
    
    .materials { margin-top: 12px; }
    .materials-title { font-weight: 600; font-size: 11pt; color: #475569; margin-bottom: 8px; }
    
    .material {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 10px;
      background: #f8fafc;
      border-radius: 6px;
      margin-bottom: 8px;
    }
    
    .material-type {
      background: #e2e8f0;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 10pt;
      white-space: nowrap;
    }
    
    .material-info { flex: 1; }
    .material-title { font-weight: 500; }
    .material-desc { font-size: 10pt; color: #64748b; margin-top: 2px; }
    .material-url { font-size: 9pt; color: #2563eb; word-break: break-all; }
    
    .empty-phase {
      color: #94a3b8;
      font-style: italic;
      text-align: center;
      padding: 20px;
    }
    
    .differentiation {
      background: #fef3c7;
      border: 1px solid #fcd34d;
      border-radius: 8px;
      padding: 16px;
      margin-top: 24px;
    }
    
    .differentiation h3 { color: #92400e; margin-top: 0; }
    
    .diff-item {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      margin-top: 8px;
    }
    
    .diff-tag {
      background: #fef9c3;
      padding: 2px 10px;
      border-radius: 12px;
      font-size: 10pt;
      font-weight: 500;
    }
    
    .footer {
      margin-top: 40px;
      padding-top: 16px;
      border-top: 1px solid #e2e8f0;
      font-size: 10pt;
      color: #94a3b8;
      text-align: center;
    }
    
    .footer a { color: #2563eb; }
    
    @media print {
      body { padding: 20px; }
      .phase { break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>📋 Unterrichtsentwurf</h1>
    ${metadata?.title ? `<h2 style="border:none;margin:8px 0;">${metadata.title}</h2>` : ''}
    <div class="meta">
      <div class="meta-item">
        <span class="meta-label">Datum:</span>
        <span>${metadata?.date || today}</span>
      </div>
      ${metadata?.subject ? `
      <div class="meta-item">
        <span class="meta-label">Fach:</span>
        <span>${metadata.subject}</span>
      </div>` : ''}
      ${metadata?.grade ? `
      <div class="meta-item">
        <span class="meta-label">Klasse:</span>
        <span>${metadata.grade}</span>
      </div>` : ''}
      ${metadata?.duration ? `
      <div class="meta-item">
        <span class="meta-label">Dauer:</span>
        <span>${metadata.duration}</span>
      </div>` : ''}
    </div>
  </div>

  <div class="pattern-info">
    <div class="pattern-name">${pattern.name}</div>
    <div class="pattern-desc">${pattern.description}</div>
  </div>

  <h2>Unterrichtsverlauf</h2>
  
  ${phases.map(phase => `
  <div class="phase">
    <div class="phase-header">
      <span class="phase-icon">${phase.icon}</span>
      <span class="phase-title">${phase.name}</span>
      <span class="phase-duration">${phase.duration}</span>
    </div>
    <div class="phase-content">
      <div class="phase-description">${phase.description}</div>
      
      ${phase.items && phase.items.length > 0 ? `
      <div class="materials">
        <div class="materials-title">Materialien & Inhalte:</div>
        ${phase.items.map(item => `
        <div class="material">
          <span class="material-type">${item.type}</span>
          <div class="material-info">
            <div class="material-title">${item.title}</div>
            ${item.description ? `<div class="material-desc">${item.description}</div>` : ''}
            ${item.url ? `<div class="material-url">${item.url}</div>` : ''}
          </div>
        </div>
        `).join('')}
      </div>
      ` : `
      <div class="empty-phase">Noch keine Materialien zugeordnet</div>
      `}
    </div>
  </div>
  `).join('')}

  ${differentiation && differentiation.length > 0 ? `
  <div class="differentiation">
    <h3>🎯 Binnendifferenzierung</h3>
    ${differentiation.map(diff => `
    <div class="diff-item">
      <span class="diff-tag">${diff.name}</span>
      <span>${diff.hint || diff.description}</span>
    </div>
    `).join('')}
  </div>
  ` : ''}

  <div class="footer">
    <p>Erstellt mit dem <a href="https://www.wirlernenonline.de">Pädagogischen Warenkorb</a></p>
    <p>Materialien von WirLernenOnline.de</p>
  </div>
</body>
</html>
    `;
  },

  /**
   * Öffnet den Export in einem neuen Fenster zum Drucken
   */
  openPrintView(lessonPlan) {
    const html = this.generateHTML(lessonPlan);
    const printWindow = window.open('', '_blank');
    printWindow.document.write(html);
    printWindow.document.close();
    
    // Auto-Print Dialog öffnen
    setTimeout(() => {
      printWindow.print();
    }, 500);
  },

  /**
   * Speichert als HTML-Datei
   */
  downloadHTML(lessonPlan) {
    const html = this.generateHTML(lessonPlan);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `unterrichtsentwurf-${Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  /**
   * Exportiert als JSON für späteren Import
   */
  downloadJSON(lessonPlan) {
    const json = JSON.stringify(lessonPlan, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `unterrichtsentwurf-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PDFExport };
}
