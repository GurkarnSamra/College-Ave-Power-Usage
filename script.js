const map = L.map('map').setView([40.4995, -74.4500], 16);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

const categoryColors = {
  ACAD: '#cc0033',
  ADM: '#2b4570',
  STLIF: '#f4a261',
  RES: '#2a9d8f',
  SUPT: '#6c757d'
};

function colorFor(use) {
  const prefix = (use || '').split('-')[0];
  return categoryColors[prefix] || '#999999';
}

function createPinIcon(color) {
  return L.divIcon({
    className: 'building-marker',
    html: `
      <svg width="22" height="28" viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20C24 5.4 18.6 0 12 0z" fill="${color}"/>
        <circle cx="12" cy="12" r="5" fill="white"/>
      </svg>
    `,
    iconSize: [22, 28],
    iconAnchor: [11, 28],
    popupAnchor: [0, -26]
  });
}

fetch('buildings.json')
  .then(res => res.json())
  .then(buildings => {
    buildings.forEach(b => {
      const color = colorFor(b.use);
      const markerIcon = createPinIcon(color);

      L.marker([b.lat, b.lng], { icon: markerIcon }).addTo(map)
        .bindPopup(`
          <div class="popup-accent" style="background:${color}"></div>
          <div class="popup-card">
            <h3>${b.name}</h3>
            <p class="address">${b.address}</p>
            <p class="popup-stat">FY25 usage: <b>${b.total_kwh_fy25.toLocaleString()} kWh</b></p>
            <p class="popup-stat">FY25 charges: <b>$${b.total_charges_fy25.toLocaleString()}</b></p>
          </div>
        `, { maxWidth: 240, minWidth: 200 });
    });
  });
  