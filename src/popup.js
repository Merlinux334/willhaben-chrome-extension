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
  document.getElementById('progress-text').innerHTML = '';
}

chrome.runtime.sendMessage({type: "checkJsonData"}, (res)=>{
  if(res)
  {
    createButton();
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'loadingDone') {
    hideProgress();
  }
  if (message.type === 'progress') {
    document.getElementById('progress-text').innerHTML = message.text;
  }
});

function createButton()
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
  document.getElementById('description').style.display = 'none';
}
