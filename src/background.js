var { extractJSONFromHTML } = require('./common.js');

let jsonDataFound = false;
let jsonData;
let url;
let maxRowRequest = 200;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'checkJsonData') {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, 
          {
              type: "getJSONDataFromContent"
          }, (msg)=>{
            var lastError = chrome.runtime.lastError;
            if (lastError || !msg.found) {
                clearNotification();
                sendResponse(false);
            }else if(msg.found){
                sendResponse(true);
            }
          });
    })
    return true;
  }
});

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.type === 'sendDataToBack') {
    scrapeDataAndOpenMap()
  }
});

async function scrapeDataAndOpenMap()
{
  try{
    let initMaxRowFirstPageURL = replacePageParameter(replaceRowParameter(url,maxRowRequest),1);
    let initialJSON = extractJSONFromHTML(await fetchPage(initMaxRowFirstPageURL));
    const totalPages = Math.ceil(initialJSON.rowsFound / initialJSON.rowsRequested);
    const pageUrls = Array.from({ length: totalPages }, (_, i) => replacePageParameter(initMaxRowFirstPageURL, i + 1));
    
    chrome.runtime.sendMessage({ type: 'progress', text: '1 / '+totalPages});

    let fetchedData = [];
    fetchedData.push(initialJSON);
    for (let i = 1; i < pageUrls.length; i++) {
      const html = await fetchPage(pageUrls[i]);
      const extractedData = extractJSONFromHTML(html);
      if (extractedData) {
        fetchedData.push(extractedData);
      }
      chrome.runtime.sendMessage({ type: 'progress', text: i+' / '+totalPages});
    }

    let mergedData = mergeData(fetchedData);

    mergedData = mergedData.filter(item => item.attributes.attribute.filter(e => e.name == "COORDINATES")[0])
    mergedData = mergedData.filter(item => item.attributes.attribute.filter(e => e.name == "PRICE_FOR_DISPLAY")[0])
    mergedData = mergedData.filter(item => item.contextLinkList.contextLink.filter((e) => e.id == "iadShareLink")[0])
    const dataToSend = mergedData.map(item => ({
      coordinates: item.attributes.attribute.filter((e) => e.name == "COORDINATES")[0].values[0],
      imageUrl: item.advertImageList.advertImage.length > 0 ? item.advertImageList.advertImage[0].mainImageUrl : '',
      detailUrl: item.contextLinkList.contextLink.filter((e) => e.id == "iadShareLink")[0].uri,
      price: item.attributes.attribute.filter((e) => e.name == "PRICE_FOR_DISPLAY")[0].values[0],
      description: item.description
    }));
    openMap(dataToSend);
  }catch{
    console.log("Error fetching Data");
  }
  chrome.runtime.sendMessage( { type: 'loadingDone'});
}

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

function replaceRowParameter(url, rows) {
  const urlObject = new URL(url);
  urlObject.searchParams.set('rows', rows);
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
        }, (msg)=>{
          var lastError = chrome.runtime.lastError;
          if (lastError) {
              clearNotification();
          }else{
              if(msg.found)
              {
                showNotification();
                jsonData = msg.jsonData;
                url = msg.url;
              }
          }
        });
  })
}

let latestScrapedData;

async function openMap(data)
{
  latestScrapedData = data;
  const url = chrome.runtime.getURL('map.html');
  chrome.tabs.create({ url: url });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'newTabLoaded') {
    sendResponse(latestScrapedData);
  }
});