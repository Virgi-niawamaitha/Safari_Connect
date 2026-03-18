import { useEffect, useRef } from 'react';

// Leaflet map component - works without API key using OpenStreetMap
export default function MapView({
  height = 400,
  center = [-1.2921, 36.8219], // Nairobi
  zoom = 13,
  markers = [],        // [{lat, lng, color, label, popup}]
  route = null,        // [[lat,lng], [lat,lng]] array of points
  style = {},
}) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (mapInstanceRef.current) return; // already init

    // Dynamically load leaflet CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    import('leaflet').then(L => {
      if (!mapRef.current || mapInstanceRef.current) return;

      const map = L.default.map(mapRef.current, {
        center,
        zoom,
        zoomControl: true,
        scrollWheelZoom: false,
      });

      L.default.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // Add markers
      markers.forEach(m => {
        const color = m.color || '#0ea371';
        const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="24" height="36">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 9 12 24 12 24S24 21 24 12C24 5.37 18.63 0 12 0z" fill="${color}" stroke="white" stroke-width="1.5"/>
          <circle cx="12" cy="12" r="5" fill="white"/>
        </svg>`;
        const icon = L.default.divIcon({
          html: svgIcon,
          className: '',
          iconSize: [24, 36],
          iconAnchor: [12, 36],
          popupAnchor: [0, -36],
        });
        const marker = L.default.marker([m.lat, m.lng], { icon });
        if (m.popup) marker.bindPopup(`<div style="font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600">${m.popup}</div>`);
        if (m.label) {
          const labelIcon = L.default.divIcon({
            html: `<div style="background:${color};color:white;padding:3px 8px;border-radius:6px;font-size:11px;font-weight:700;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,.2)">${m.label}</div>`,
            className: '',
            iconAnchor: [0, 48],
          });
          L.default.marker([m.lat, m.lng], { icon: labelIcon }).addTo(map);
        }
        marker.addTo(map);
      });

      // Draw route
      if (route && route.length > 1) {
        L.default.polyline(route, {
          color: '#0ea371',
          weight: 4,
          opacity: 0.8,
          dashArray: null,
        }).addTo(map);
      }

      mapInstanceRef.current = map;

      // Fit bounds to markers
      if (markers.length > 1) {
        const bounds = L.default.latLngBounds(markers.map(m => [m.lat, m.lng]));
        map.fitBounds(bounds, { padding: [40, 40] });
      }
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={mapRef}
      style={{
        height,
        borderRadius: 12,
        border: '1px solid var(--gray-200)',
        overflow: 'hidden',
        ...style,
      }}
    />
  );
}
