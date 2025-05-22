import React, { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';

const AlarmsHeatMap = ({ alarms }) => {
  const [showMarkers, setShowMarkers] = useState(true);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [heatLayer, setHeatLayer] = useState(null);
  const mapContainerRef = useRef(null);

  // Calculate max intensity for normalization
  const calculateMaxIntensity = useRef(() => {
    const locationCounts = {};
    alarms?.forEach(alarm => {
      const location = alarm.location;
      if (location?.latitude && location?.longitude) {
        const key = `${location.latitude},${location.longitude}`;
        locationCounts[key] = (locationCounts[key] || 0) + 1;
      }
    });
    return Math.max(...Object.values(locationCounts), 1);
  });

  useEffect(() => {
    // Initialize map only once
    if (!map && mapContainerRef.current && !mapContainerRef.current._leaflet_id) {
      const newMap = L.map(mapContainerRef.current, {
        zoomControl: false,
        preferCanvas: true,
        fadeAnimation: true,
        zoomAnimation: true,
      }).setView([36.8065, 10.1815], 12);

      L.tileLayer('http://192.168.100.3:8080/data/v3/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(newMap);

      setMap(newMap);
    }

    return () => {
      if (map) {
        map.remove();
        setMap(null);
      }
    };
  }, [map]);

  useEffect(() => {
    if (!map) return;

    // Clear existing layers
    markers.forEach(marker => map.removeLayer(marker));
    if (heatLayer) {
      map.removeLayer(heatLayer);
    }

    const newMarkers = [];
    const locationCounts = {};
    const maxIntensity = calculateMaxIntensity.current();

    // First pass to count alarms per location
    alarms?.forEach(alarm => {
      const location = alarm.location;
      if (location?.latitude && location?.longitude) {
        const key = `${location.latitude},${location.longitude}`;
        locationCounts[key] = (locationCounts[key] || 0) + 1;
      }
    });

    // Second pass to create heatmap data and markers
    const heatmapData = [];
    alarms.forEach(alarm => {
      const location = alarm.location;
      if (location?.latitude && location?.longitude) {
        const lat = parseFloat(location.latitude);
        const lng = parseFloat(location.longitude);
        const key = `${lat},${lng}`;
        
        if (!isNaN(lat) && !isNaN(lng)) {
          // Normalize intensity based on count at this location
          const intensity = locationCounts[key] / maxIntensity;
          heatmapData.push([lat, lng, intensity]);

          if (showMarkers) {
            const alarmIcon = L.divIcon({
              className: 'alarm-marker',
              html: `
                <div class="pulse-marker" 
                     style="background-color: ${getColorBySeverity(alarm.severity)}">
                </div>
              `,
              iconSize: [20, 20],
              iconAnchor: [10, 10],
            });

            const marker = L.marker([lat, lng], { icon: alarmIcon });
            marker.bindPopup(createPopupContent(alarm));
            marker.addTo(map);
            newMarkers.push(marker);
          }
        }
      }
    });

    setMarkers(newMarkers);

    if (heatmapData.length > 0) {
      const newHeatLayer = L.heatLayer(heatmapData, {
        radius: 25,
        blur: 25,
        maxZoom: 17,
        minOpacity: 0.5,
        gradient: {
          0.1: '#FFD700',  // Yellow (low intensity)
          0.3: '#FFA500',  // Orange (medium intensity)
          0.6: '#FF6347',  // Tomato (medium-high intensity)
          1.0: '#FF0000'   // Red (high intensity)
        },
      }).addTo(map);
      setHeatLayer(newHeatLayer);
    }
  }, [alarms, showMarkers, map]);

  const createPopupContent = (alarm) => {
    return `
      <div class="alarm-popup">
        <h4>Alarm Details</h4>
        <div class="alarm-detail"><span>ID:</span> ${alarm.id}</div>
        <div class="alarm-detail"><span>Category:</span> ${alarm.category}</div>
        <div class="alarm-detail">
          <span>Certainty:</span> 
          <span class="certainty-${alarm.certainty.toLowerCase()}">
            ${alarm.certainty}
          </span>
        </div>
        <div class="alarm-detail">
          <span>Severity:</span> 
          <span class="severity-${alarm.severity.toLowerCase()}">
            ${alarm.severity}
          </span>
        </div>
        <div class="alarm-detail">
          <span>Date:</span> ${new Date(alarm.creationDate).toLocaleString()}
        </div>
      </div>
    `;
  };

  const toggleMarkers = () => {
    setShowMarkers(!showMarkers);
  };

  const getColorBySeverity = (severity) => {
    switch (severity.toLowerCase()) {
      case 'extreme': return '#ff0000';
      case 'severe': return '#ff4500';
      case 'moderate': return '#ffa500';
      case 'minor': return '#ffff00';
      default: return '#00bfff';
    }
  };

  return (
    <div className="heatmap-container">
      <div ref={mapContainerRef} style={{ width: '100%', height: '760px', borderRadius: '8px' }}></div>
      
      <div className="heatmap-controls">
        <button 
          onClick={toggleMarkers}
          className={`toggle-markers-btn ${showMarkers ? 'active' : ''}`}
        >
          {showMarkers ? 'إخفاء العلامات' : 'عرض العلامات'}
        </button>
      </div>

      {/* Rest of your component remains the same */}
      <style jsx>{`
        .heatmap-container {
          position: relative;
          box-shadow: 0 10px 20px rgba(0,0,0,0.3);
          border-radius: 8px;
          overflow: hidden;
        }
        
        .heatmap-controls {
          position: absolute;
          top: 20px;
          right: 20px;
          z-index: 1000;
        }
        
        .toggle-markers-btn {
          background: rgba(0, 0, 0, 0.7);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
          transition: all 0.3s ease;
          box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }
        
        .toggle-markers-btn:hover {
          background: rgba(0, 0, 0, 0.9);
          transform: translateY(-2px);
        }
        
        .toggle-markers-btn.active {
          background: rgba(43, 108, 176, 0.9);
        }
        
        .alarm-marker {
          display: flex;
          justify-content: center;
          align-items: center;
        }
        
        .pulse-marker {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          box-shadow: 0 0 0 rgba(255, 0, 0, 0.7);
          animation: pulse 1.5s infinite;
        }
      `}</style>

      <style jsx global>{`
        .alarm-popup {
          font-family: Arial, sans-serif;
          min-width: 200px;
        }
        
        .alarm-popup h4 {
          margin: 0 0 10px 0;
          padding: 0;
          color: #333;
          font-size: 16px;
          border-bottom: 1px solid #eee;
          padding-bottom: 5px;
        }
        
        .alarm-detail {
          margin: 5px 0;
          font-size: 14px;
        }
          
        .alarm-detail span:first-child {
          font-weight: bold;
          color: #555;
        }
        
        .severity-extreme { color: #ff0000; font-weight: bold; }
        .severity-severe { color: #ff4500; font-weight: bold; }
        .severity-moderate { color: #ffa500; font-weight: bold; }
        .severity-minor { color: #ffff00; font-weight: bold; }
        
        .certainty-observed { color: #ff0000; font-weight: bold; }
        .certainty-likely { color: #ff8c00; font-weight: bold; }
        .certainty-possible { color: #ffd700; font-weight: bold; }
      `}</style>
    </div>
  );
};

export default AlarmsHeatMap;