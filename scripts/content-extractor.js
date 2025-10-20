/**
 * Content Extractor for WLO Browser Extension
 * Extracts page content, metadata, and structured data
 */

/**
 * Main extraction function
 * Returns comprehensive page data for Canvas component
 */
function extractPageContent() {
  console.log('🔍 Starting page content extraction...');
  
  const result = {
    // Basic data
    url: window.location.href,
    title: document.title,
    timestamp: new Date().toISOString(),
    
    // Content (multiple strategies)
    content: {
      full: extractFullText(),
      main: extractMainContent(),
      cleaned: extractCleanedContent()
    },
    
    // Metadata
    meta: extractMetaTags(),
    
    // Structured data (JSON-LD, Microdata)
    structuredData: extractStructuredData(),
    
    // Images
    images: extractImages(),
    
    // Links
    links: extractLinks()
  };
  
  console.log('✅ Extraction complete:', {
    contentLength: result.content.main.length,
    metaTagCount: Object.keys(result.meta).length,
    structuredDataCount: result.structuredData.length
  });
  
  return result;
}

/**
 * Strategy 1: Full body text
 */
function extractFullText() {
  return document.body.innerText
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Strategy 2: Main content (intelligent detection)
 */
function extractMainContent() {
  // Try semantic HTML elements first
  const semanticSelectors = [
    'main',
    'article',
    '[role="main"]',
    '.main-content',
    '#main-content',
    '.article-content',
    '.post-content',
    '.entry-content',
    '.content'
  ];
  
  for (const selector of semanticSelectors) {
    const element = document.querySelector(selector);
    if (element && element.innerText.length > 200) {
      console.log(`📄 Main content found via: ${selector}`);
      return element.innerText.trim();
    }
  }
  
  // Fallback: Find largest text container
  return findLargestTextContainer();
}

/**
 * Strategy 3: Cleaned content (remove nav, footer, ads)
 */
function extractCleanedContent() {
  // Elements to exclude
  const excludeSelectors = [
    'nav', 'header', 'footer', 'aside',
    '.navigation', '.menu', '.sidebar',
    '.advertisement', '.ad', '.ads',
    '.cookie-banner', '.cookie-notice',
    '.popup', '.modal', '.overlay',
    '[role="navigation"]',
    '[role="banner"]',
    '[role="complementary"]'
  ];
  
  // Clone body to avoid modifying original
  const clone = document.body.cloneNode(true);
  
  // Remove unwanted elements
  excludeSelectors.forEach(selector => {
    clone.querySelectorAll(selector).forEach(el => el.remove());
  });
  
  // Remove scripts, styles, noscript
  clone.querySelectorAll('script, style, noscript, iframe').forEach(el => el.remove());
  
  return clone.innerText
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Find container with most text content
 */
function findLargestTextContainer() {
  const containers = Array.from(document.querySelectorAll('div, section, article, main'));
  
  let maxLength = 0;
  let largestElement = null;
  
  containers.forEach(element => {
    const text = element.innerText || '';
    const length = text.length;
    
    // Must have substantial content and multiple paragraphs
    if (length > maxLength && length > 500) {
      const paragraphs = element.querySelectorAll('p').length;
      if (paragraphs > 2) {
        maxLength = length;
        largestElement = element;
      }
    }
  });
  
  if (largestElement) {
    console.log(`📄 Largest container found: ${maxLength} characters`);
    return largestElement.innerText.trim();
  }
  
  return document.body.innerText;
}

/**
 * Extract meta tags
 */
function extractMetaTags() {
  const meta = {};
  
  const metaSelectors = {
    // Standard
    description: 'meta[name="description"]',
    keywords: 'meta[name="keywords"]',
    author: 'meta[name="author"]',
    language: 'meta[name="language"]',
    
    // Open Graph
    ogTitle: 'meta[property="og:title"]',
    ogDescription: 'meta[property="og:description"]',
    ogImage: 'meta[property="og:image"]',
    ogType: 'meta[property="og:type"]',
    ogUrl: 'meta[property="og:url"]',
    
    // Twitter
    twitterCard: 'meta[name="twitter:card"]',
    twitterTitle: 'meta[name="twitter:title"]',
    twitterDescription: 'meta[name="twitter:description"]',
    twitterImage: 'meta[name="twitter:image"]',
    
    // Dublin Core
    dcTitle: 'meta[name="DC.title"]',
    dcCreator: 'meta[name="DC.creator"]',
    dcSubject: 'meta[name="DC.subject"]',
    dcDescription: 'meta[name="DC.description"]',
    dcPublisher: 'meta[name="DC.publisher"]',
    dcDate: 'meta[name="DC.date"]',
    dcType: 'meta[name="DC.type"]',
    dcLanguage: 'meta[name="DC.language"]'
  };
  
  Object.entries(metaSelectors).forEach(([key, selector]) => {
    const element = document.querySelector(selector);
    if (element) {
      const content = element.getAttribute('content') || element.getAttribute('value') || '';
      if (content) {
        meta[key] = content;
      }
    }
  });
  
  return meta;
}

/**
 * Extract structured data (JSON-LD, Microdata)
 */
function extractStructuredData() {
  const data = [];
  
  // JSON-LD
  document.querySelectorAll('script[type="application/ld+json"]').forEach(script => {
    try {
      const json = JSON.parse(script.textContent);
      data.push({
        type: 'json-ld',
        data: json
      });
    } catch (e) {
      console.warn('Invalid JSON-LD:', e);
    }
  });
  
  // Microdata (simplified)
  document.querySelectorAll('[itemscope]').forEach(element => {
    const item = {
      type: 'microdata',
      itemtype: element.getAttribute('itemtype'),
      properties: {}
    };
    
    element.querySelectorAll('[itemprop]').forEach(prop => {
      const name = prop.getAttribute('itemprop');
      const value = prop.getAttribute('content') || prop.textContent.trim();
      if (value) {
        item.properties[name] = value;
      }
    });
    
    if (Object.keys(item.properties).length > 0) {
      data.push(item);
    }
  });
  
  return data;
}

/**
 * Extract significant images
 */
function extractImages() {
  const images = [];
  
  document.querySelectorAll('img').forEach(img => {
    // Skip tiny images, data URLs, tracking pixels
    if (img.src && 
        !img.src.startsWith('data:') &&
        img.naturalWidth > 100 && 
        img.naturalHeight > 100) {
      images.push({
        src: img.src,
        alt: img.alt || '',
        title: img.title || '',
        width: img.naturalWidth,
        height: img.naturalHeight
      });
    }
  });
  
  // Sort by size, take top 5
  return images
    .sort((a, b) => (b.width * b.height) - (a.width * a.height))
    .slice(0, 5);
}

/**
 * Extract relevant links
 */
function extractLinks() {
  const links = new Set();
  
  document.querySelectorAll('a[href]').forEach(link => {
    try {
      const url = new URL(link.href, window.location.href);
      if (url.protocol === 'http:' || url.protocol === 'https:') {
        links.add(url.href);
      }
    } catch (e) {
      // Invalid URL
    }
  });
  
  return Array.from(links).slice(0, 20);
}

// Message listener for extension
if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'extractContent') {
      try {
        const content = extractPageContent();
        sendResponse({ success: true, data: content });
      } catch (error) {
        console.error('❌ Extraction failed:', error);
        sendResponse({ success: false, error: error.message });
      }
    }
    return true; // Async response
  });
  
  console.log('✅ Content extractor loaded');
}
