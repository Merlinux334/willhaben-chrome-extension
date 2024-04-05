
function sendToScrapeData()
{
  console.log("Will query to send data");
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

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'mapData') {
    hideProgress();
    openMapInNewTab(message.data);
  }
  if (message.type === 'createButton')
  {
    // Create button in the page.html to open map
    const button = document.createElement('button');
    button.textContent = 'Open Map';
    button.className = 'button'; // Adding CSS class 'button'
    button.addEventListener('click', sendToScrapeData);

    // Append the button to the element with ID 'btncontainer'
    const btnContainer = document.getElementById('btncontainer');
    if (btnContainer) {
      btnContainer.appendChild(button);
    } else {
      // If the element with ID 'btncontainer' does not exist, append the button to the document body
      document.body.appendChild(button);
    }
  }
});

// Function to open a new tab with the map
function openMapInNewTab(coordinates) {
  const mapData = encodeURIComponent(JSON.stringify(coordinates));
  const url = chrome.runtime.getURL('map.html') + '?data=' + mapData;
  chrome.tabs.create({ url: url });
}
