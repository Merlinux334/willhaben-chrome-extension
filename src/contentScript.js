'use strict';

if (typeof require !== 'undefined') {
  var { extractJSONFromHTML } = require('./common.js');
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'getJSONDataFromContent') {
    console.log("Sending response from content script");
    let html = document.documentElement.outerHTML;
    let jsonData = extractJSONFromHTML(html);
    sendResponse({
      found: jsonData ? true : false,
      jsonData: jsonData,
      url: window.location.href
    });
    //checkJSON();
  }
});

function checkJSON()
{
  let html = document.documentElement.outerHTML;
  let jsonData = extractJSONFromHTML(html);

  chrome.runtime.sendMessage({
    type: 'jsonDataFound',
    found: jsonData ? true : false,
    jsonData: jsonData,
    url: window.location.href
  });
}