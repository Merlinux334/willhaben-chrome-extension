chrome.runtime.sendMessage({ type: 'newTabLoaded' },(resp)=>{
  loadMapData(resp);
});

function loadMapData(data)
{  
  let coordinates = data.map((elem)=>elem.coordinates.split(","))
  // Create map
  const map = L.map('map').setView(coordinates[0], 10); // Set initial view to first coordinate
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
  
  // Add markers
  data.forEach(datapoint => {
    const marker = L.marker(datapoint.coordinates.split(",")).addTo(map);
    marker.bindPopup(`
    <div class="tooltip-container">
      <img src="${datapoint.imageUrl}" class="tooltip-img">
      <div class="tooltip-content">
        <div class="tooltip-title">${datapoint.description}</div>
        <div class="tooltip-price">${datapoint.price}</div>
        <a href="${datapoint.detailUrl}" class="tooltip-link" target="_blank">Mehr Information</a>
      </div>
    </div>
  `,{ maxWidth : 300});
  
  });
}