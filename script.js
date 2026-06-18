const map = L.map('map').setView([40.4995, -74.4500], 16);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

fetch('buildings.json')
  .then(res => res.json())
  .then(buildings => {
    buildings.forEach(b => {
      L.marker([b.lat, b.lng]).addTo(map)
        .bindPopup(`<b>${b.name}</b><br>${b.address}<br>
                    FY25 usage: ${b.total_kwh_fy25.toLocaleString()} kWh<br>
                    FY25 charges: $${b.total_charges_fy25.toLocaleString()}`);
    });
  });
  