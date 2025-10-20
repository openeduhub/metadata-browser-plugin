/**
 * Canvas Integration for Browser Plugin
 * Opens Canvas Webkomponente with extracted page data
 */

// Canvas URL Configuration
const CANVAS_CONFIG = {
  // Production Vercel: 'https://metadata-agent-canvas.vercel.app/'
  // Development: 'http://localhost:4200'
  url: 'https://metadata-agent-canvas.vercel.app/', // Production Vercel URL
  enabled: true
};

/**
 * Open Canvas with current page data
 * Called from popup or context menu
 */
async function openCanvasWithPageData() {
  console.log('🎨 Opening Canvas with page data...');
  
  try {
    // Get active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab || !tab.id) {
      throw new Error('No active tab found');
    }
    
    // Inject content-extractor if not already injected
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['scripts/content-extractor.js']
    });
    
    // Extract page data
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: extractPageContent
    });
    
    if (!results || results.length === 0) {
      throw new Error('Page extraction failed');
    }
    
    const pageData = results[0].result;
    
    console.log('✅ Page extracted:', {
      url: pageData.url,
      title: pageData.title,
      contentLength: pageData.content.main.length
    });
    
    // Open Canvas with page data
    await chrome.tabs.sendMessage(tab.id, {
      action: 'openCanvas',
      canvasUrl: CANVAS_CONFIG.url,
      pageData: {
        url: pageData.url,
        title: pageData.title,
        html: pageData.content.main || document.documentElement.outerHTML,
        text: formatPageDataForCanvas(pageData),
        metadata: {
          meta: pageData.meta,
          structuredData: pageData.structuredData,
          images: pageData.images
        }
      }
    });
    
    console.log('✅ Canvas opened with page data');
    
    // Show success notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: chrome.runtime.getURL('icons/128.png'),
      title: 'WLO Metadata Agent',
      message: '🎨 Canvas geöffnet. Starte Metadaten-Extraktion...',
      priority: 1
    });
    
  } catch (error) {
    console.error('❌ Canvas integration error:', error);
    
    chrome.notifications.create({
      type: 'basic',
      iconUrl: chrome.runtime.getURL('icons/128.png'),
      title: 'WLO Metadata Agent',
      message: '❌ Fehler beim Öffnen: ' + error.message,
      priority: 2
    });
  }
}

/**
 * Format extracted page data for Canvas textarea
 * Creates a readable text representation
 */
function formatPageDataForCanvas(pageData) {
  let text = '';
  
  // Title
  if (pageData.title) {
    text += `Titel: ${pageData.title}\n\n`;
  }
  
  // URL
  text += `URL: ${pageData.url}\n\n`;
  
  // Meta Description
  if (pageData.meta.description) {
    text += `Beschreibung: ${pageData.meta.description}\n\n`;
  }
  
  // Meta Keywords
  if (pageData.meta.keywords) {
    text += `Keywords: ${pageData.meta.keywords}\n\n`;
  }
  
  // Author
  if (pageData.meta.author) {
    text += `Autor: ${pageData.meta.author}\n\n`;
  }
  
  // Main Content (first 3000 chars)
  text += `Inhalt:\n${pageData.content.main.substring(0, 3000)}`;
  
  return text;
}

/**
 * Check if Canvas is available
 */
async function checkCanvasAvailability() {
  try {
    const response = await fetch(CANVAS_CONFIG.url, {
      method: 'HEAD',
      mode: 'no-cors'
    });
    return true;
  } catch (error) {
    console.warn('⚠️ Canvas not available at:', CANVAS_CONFIG.url);
    return false;
  }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    openCanvasWithPageData,
    checkCanvasAvailability,
    CANVAS_CONFIG
  };
}
