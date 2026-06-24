const map = L.map('map').setView([40.4995, -74.4500], 16);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

const categoryColors = {
  ACAD: '#cc0033', ADM: '#2b4570', STLIF: '#f4a261',
  RES: '#2a9d8f', SUPT: '#6c757d'
};

const usageColors = {
  low: '#a8dadc', medium: '#457b9d', high: '#e76f51', very_high: '#9b2226'
};

let colorMode = 'category';
let activeCategory = 'all';
let activeUsage = 'all';
let markers = [];
let allBuildings = [];

function colorFor(b) {
  if (colorMode === 'category') {
    const prefix = (b.use || '').split('-')[0];
    return categoryColors[prefix] || '#999';
  } else {
    return usageColors[b.usage_tier] || '#999';
  }
}

function createPinIcon(color) {
  return L.divIcon({
    className: 'building-marker',
    html: `<svg width="22" height="28" viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20C24 5.4 18.6 0 12 0z" fill="${color}"/>
      <circle cx="12" cy="12" r="5" fill="white"/>
    </svg>`,
    iconSize: [22, 28], iconAnchor: [11, 28], popupAnchor: [0, -26]
  });
}

function buildPopup(b) {
  const color = colorFor(b);
  return `
    <div class="popup-accent" style="background:${color}"></div>
    <div class="popup-card">
      <h3>Meter #${b.meter_number}</h3>
      <p class="popup-label">Meter Type</p>
      <p class="popup-value">${b.meter_type}</p>
      <p class="popup-label">Building Served</p>
      <p class="popup-value">${b.name}</p>
      <p class="popup-value">Bldg #${b.id} &nbsp;·&nbsp; ${b.address}</p>
      <div class="popup-divider"></div>
      <p class="popup-stat">FY25 usage: <b>${b.total_kwh_fy25.toLocaleString()} kWh</b></p>
      <p class="popup-stat">FY25 charges: <b>$${b.total_charges_fy25.toLocaleString()}</b></p>
    </div>`;
}

function refreshMarkers() {
  markers.forEach(m => map.removeLayer(m));
  markers = [];
  allBuildings.forEach(b => {
    const catPrefix = (b.use || '').split('-')[0];
    if (activeCategory !== 'all' && catPrefix !== activeCategory) return;
    if (activeUsage !== 'all' && b.usage_tier !== activeUsage) return;
    const color = colorFor(b);
    const m = L.marker([b.lat, b.lng], { icon: createPinIcon(color) })
      .addTo(map)
      .bindPopup(buildPopup(b), { maxWidth: 260, minWidth: 220 });
    markers.push(m);
  });
}

function updateLegend() {
  const legend = document.getElementById('legend-items');
  if (colorMode === 'category') {
    legend.innerHTML = `
      <div class="legend-item"><span class="dot" style="background:#cc0033"></span>Academic</div>
      <div class="legend-item"><span class="dot" style="background:#2b4570"></span>Administrative</div>
      <div class="legend-item"><span class="dot" style="background:#f4a261"></span>Student Life</div>
      <div class="legend-item"><span class="dot" style="background:#2a9d8f"></span>Residential</div>
      <div class="legend-item"><span class="dot" style="background:#6c757d"></span>Utilities</div>`;
  } else {
    legend.innerHTML = `
      <div class="legend-item"><span class="dot" style="background:#a8dadc"></span>&lt; 5,000 kWh</div>
      <div class="legend-item"><span class="dot" style="background:#457b9d"></span>5,000–20,000 kWh</div>
      <div class="legend-item"><span class="dot" style="background:#e76f51"></span>20,000–100,000 kWh</div>
      <div class="legend-item"><span class="dot" style="background:#9b2226"></span>&gt; 100,000 kWh</div>`;
  }
}

fetch('buildings.json')
  .then(res => res.json())
  .then(buildings => {
    allBuildings = buildings;
    refreshMarkers();

    document.getElementById('toggle-color').addEventListener('click', () => {
      colorMode = colorMode === 'category' ? 'usage' : 'category';
      document.getElementById('toggle-color').textContent =
        colorMode === 'category' ? 'Color by Usage' : 'Color by Category';
      updateLegend();
      refreshMarkers();
    });

    document.getElementById('filter-category').addEventListener('change', e => {
      activeCategory = e.target.value;
      refreshMarkers();
    });

    document.getElementById('filter-usage').addEventListener('change', e => {
      activeUsage = e.target.value;
      refreshMarkers();
    });
  });