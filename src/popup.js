function sendToScrapeData()
{
  chrome.runtime.sendMessage({ type: 'sendDataToBack' });
  showProgress();
}

function showProgress()
{
  document.getElementById('btncontainer').style.display = 'none';
  document.querySelector('.progress-container').style.display = 'block';
}

function hideProgress()
{
  document.getElementById('btncontainer').style.display = '';
  document.querySelector('.progress-container').style.display = 'none';
}

chrome.runtime.sendMessage({type: "checkJsonData"});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'mapData') {
    hideProgress();
    openMapInNewTab(message.data);
  }
  if (message.type === 'createButton')
  {
    const button = document.createElement('button');
    button.textContent = 'Open Map';
    button.className = 'button';
    button.addEventListener('click', sendToScrapeData);

    const btnContainer = document.getElementById('btncontainer');
    if (btnContainer) {
      btnContainer.appendChild(button);
    } else {
      document.body.appendChild(button);
    }
  }
});

function openMapInNewTab(coordinates) {
  const mapData = encodeURIComponent(JSON.stringify(coordinates));
  const url = chrome.runtime.getURL('map.html') + '?data=' + mapData;
  chrome.tabs.create({ url: url });
}
