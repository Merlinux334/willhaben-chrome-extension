'use strict';

if (typeof require !== 'undefined') {
  var { extractJSONFromHTML } = require('./common.js');
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'getJSONDataFromContent') {
    let html = document.documentElement.outerHTML;
    let jsonData = extractJSONFromHTML(html);
    sendResponse({
      found: jsonData ? true : false,
      jsonData: jsonData,
      url: window.location.href
    });
  }
});