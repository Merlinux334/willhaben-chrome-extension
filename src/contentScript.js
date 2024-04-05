'use strict';

// Import the function
if (typeof require !== 'undefined') {
  var { extractJSONFromHTML } = require('./common.js');
}


// Content script file will run in the context of web page.
// With content script you can manipulate the web pages using
// Document Object Model (DOM).
// You can also pass information to the parent extension.

// We execute this script by making an entry in manifest.json file
// under `content_scripts` property

// For more information on Content Scripts,
// See https://developer.chrome.com/extensions/content_scripts

// Log `title` of current active web page

//check if we can find the json



const pageTitle = document.head.getElementsByTagName('title')[0].innerHTML;
console.log(
  `Page title is: '${pageTitle}' - evaluated by Chrome extension's 'contentScript.js' file`
);

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'popupOpened') {
    checkJSON();
  }
  if (message.type === 'getJSONDataFromContent') {
    console.log("Will check JSON after getting getJSONDataFromContent");
    sendResponse(true);
    checkJSON();
  }
});

function checkJSON()
{
  
  let html = document.documentElement.outerHTML;
  let jsonData = extractJSONFromHTML(html);

  console.log("checking JSON and sending in content script:",jsonData ? true : false)
  chrome.runtime.sendMessage({
    type: 'jsonDataFound',
    found: jsonData ? true : false,
    jsonData: jsonData,
    url: window.location.href
  });
}
checkJSON();