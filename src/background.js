
var { extractJSONFromHTML } = require('./common.js');

let jsonDataFound = false;
let jsonData;
let url;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'jsonDataFound') {
    jsonDataFound = message.found;
    if(jsonDataFound)
    {
      showNotification();
      jsonData = message.jsonData;
      url = message.url;
    }else{
      clearNotification();
    }
    chrome.runtime.sendMessage({ type: 'createButton'});
  }
  if (message.type === 'checkJsonData') {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, 
          {
              type: "getJSONDataFromContent"
          });
    })
  }
});

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.type === 'sendDataToBack') {

    const totalPages = Math.ceil(jsonData.rowsFound / jsonData.rowsRequested);
    const pageUrls = Array.from({ length: totalPages }, (_, i) => replacePageParameter(url, i + 1));
    
    let fetchedData = [];
    fetchedData.push(jsonData);
    for (let i = 1; i < pageUrls.length; i++) {
      const html = await fetchPage(pageUrls[i]);
      const extractedData = extractJSONFromHTML(html);
      if (extractedData) {
        fetchedData.push(extractedData);
      }
    }

    let mergedData = mergeData(fetchedData);

    mergedData = mergedData.filter(item => item.attributes.attribute.filter(e => e.name == "COORDINATES")[0])
    const dataToSend = mergedData.map(item => ({
      coordinates: item.attributes.attribute.filter((e) => e.name == "COORDINATES")[0].values[0],
      imageUrl: item.advertImageList.advertImage.length > 0 ? item.advertImageList.advertImage[0].mainImageUrl : '',
      detailUrl: item.contextLinkList.contextLink.filter((e) => e.id == "iadShareLink")[0].uri,
      price: item.attributes.attribute.filter((e) => e.name == "PRICE_FOR_DISPLAY")[0].values[0],
      description: item.description
    }));
    
    chrome.runtime.sendMessage( { type: 'mapData', data: dataToSend });
  }
});

async function fetchPage(url) {
  try {
    const response = await fetch(url);
    const html = await response.text();
    return html;
  } catch (error) {
    console.error('Error fetching page:', error);
    return null;
  }
}

function replacePageParameter(url, page) {
  const urlObject = new URL(url);
  urlObject.searchParams.set('page', page);
  return urlObject.toString();
}

function mergeData(dataArray) {
  return dataArray.flatMap((x) => x.advertSummaryList.advertSummary);
}

function showNotification() {
  chrome.action.setBadgeText({ text: '!' });
  chrome.action.setBadgeBackgroundColor({ color: 'red' });
}

function clearNotification() {
  chrome.action.setBadgeText({ text: '' });
}

let activeTabId, lastUrl, lastTitle;

async function getTabInfo(tabId) {
  await chrome.tabs.get(tabId,(tab)=>{
    if(lastUrl != tab.url || lastTitle != tab.title)
    {
      console.log(lastUrl = tab.url, lastTitle = tab.title);
      checkIfContentHasJSON();
    }
  });
}

chrome.tabs.onActivated.addListener(function(activeInfo) {
  getTabInfo(activeTabId = activeInfo.tabId);
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if(activeTabId == tabId) {
    getTabInfo(tabId);
  }
});

function checkIfContentHasJSON()
{
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, 
        {
            type: "getJSONDataFromContent"
        }, ()=>{
          var lastError = chrome.runtime.lastError;
          if (lastError) {
              clearNotification();
          }
        });
  })
}