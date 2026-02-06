import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import type { Plot, DrawingMode } from '@/types';

// Use environment variable or fallback to the demo token (which likely won't work)
const accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || 'pk.eyJ1IjoiZGVtb3VzZXIiLCJhIjoiY2xwNXZ5Z3JhMDJmeTJpcGZ1d3Q4ZnpzZCJ9.demo_token';
mapboxgl.accessToken = accessToken;

interface MapBoxProps {
  plots: Plot[];
  drawingMode: DrawingMode;
  drawingPoints: [number, number][];
  selectedPlotId: number | null;
  onMapClick: (lat: number, lng: number) => void;
  flyToLocation?: { lat: number; lng: number; zoom?: number } | null;
}

export default function MapBox({
  plots,
  drawingMode,
  drawingPoints,
  selectedPlotId,
  onMapClick,
  flyToLocation,
}: MapBoxProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const mapLoaded = useRef(false);
  const [mapReady, setMapReady] = useState(false);
  const drawingMarkers = useRef<mapboxgl.Marker[]>([]);
  const plotLayers = useRef<string[]>([]);
  
  // Track added layers and sources to clean up properly
  const addedFeatures = useRef<{ layers: string[]; sources: string[] }>({ layers: [], sources: [] });

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-v9',
      center: [-7.6706, 33.4478], // Bouskoura, Morocco
      zoom: 14,
    });

    map.current.on('load', () => {
      mapLoaded.current = true;
      setMapReady(true);
      // Change cursor when drawing
      map.current?.getCanvas().style.setProperty('cursor', 'default');
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    return () => {
      map.current?.remove();
      map.current = null;
      mapLoaded.current = false;
      setMapReady(false);
    };
  }, []);

  // Handle map click for drawing
  useEffect(() => {
    if (!map.current || !mapReady) return;

    if (drawingMode === 'drawing') {
      map.current.getCanvas().style.cursor = 'crosshair';
    } else {
      map.current.getCanvas().style.cursor = '';
    }

    const handleClick = (e: mapboxgl.MapMouseEvent) => {
      if (drawingMode === 'drawing') {
        onMapClick(e.lngLat.lat, e.lngLat.lng);
      }
    };

    map.current.on('click', handleClick);

    return () => {
      map.current?.off('click', handleClick);
      map.current?.getCanvas().style.removeProperty('cursor');
    };
  }, [drawingMode, mapReady, onMapClick]);

  // Update drawing markers and line
  useEffect(() => {
    if (!map.current || !mapReady) return;

    // Clear existing drawing markers
    drawingMarkers.current.forEach(marker => marker.remove());
    drawingMarkers.current = [];

    // Remove existing drawing source and layer
    if (map.current.getSource('drawing-line')) {
      map.current.removeLayer('drawing-line-layer');
      map.current.removeSource('drawing-line');
    }
    if (map.current.getSource('drawing-fill')) {
      map.current.removeLayer('drawing-fill-layer');
      map.current.removeSource('drawing-fill');
    }

    if (drawingPoints.length === 0) return;

    // Add markers for each point
    drawingPoints.forEach((point, index) => {
      const el = document.createElement('div');
      el.className = 'w-4 h-4 bg-primary rounded-full border-2 border-white shadow-lg';
      if (index === 0) {
        el.classList.add('animate-pulse');
      }

      const marker = new mapboxgl.Marker({
        element: el,
        anchor: 'center',
      })
        .setLngLat([point[1], point[0]])
        .addTo(map.current!);

      drawingMarkers.current.push(marker);
    });

    // Add line connecting points
    if (drawingPoints.length > 1) {
      const coordinates = drawingPoints.map(p => [p[1], p[0]]);
      
      // Close the polygon if we have 3+ points
      const lineCoordinates = [...coordinates];
      if (drawingMode === 'closed' && coordinates.length >= 3) {
        lineCoordinates.push(coordinates[0]);
      }

      map.current.addSource('drawing-line', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: lineCoordinates,
          },
        },
      });

      map.current.addLayer({
        id: 'drawing-line-layer',
        type: 'line',
        source: 'drawing-line',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#7CB342',
          'line-width': 3,
          'line-dasharray': [2, 2],
        },
      });

      // Add fill if closed
      if (drawingMode === 'closed' && coordinates.length >= 3) {
        map.current.addSource('drawing-fill', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'Polygon',
              coordinates: [[...coordinates, coordinates[0]]],
            },
          },
        });

        map.current.addLayer({
          id: 'drawing-fill-layer',
          type: 'fill',
          source: 'drawing-fill',
          paint: {
            'fill-color': '#7CB342',
            'fill-opacity': 0.3,
          },
        });
      }
    }
  }, [drawingPoints, drawingMode, mapReady]);

  // Render saved plots
  useEffect(() => {
    if (!map.current || !mapReady) return;

    // Remove existing plot layers and sources
    addedFeatures.current.layers.forEach(layerId => {
      if (map.current?.getLayer(layerId)) {
        map.current.removeLayer(layerId);
      }
    });
    addedFeatures.current.sources.forEach(sourceId => {
      if (map.current?.getSource(sourceId)) {
        map.current.removeSource(sourceId);
      }
    });

    // Handle legacy cleanup if transitioning from old version
    if (plotLayers.current.length > 0) {
      plotLayers.current.forEach(layerId => {
        if (map.current?.getLayer(layerId)) map.current.removeLayer(layerId);
      });
      plotLayers.current = [];
    }

    addedFeatures.current = { layers: [], sources: [] };

    plots.forEach(plot => {
      if (!plot.coordinates || plot.coordinates.length < 3) return;

      const coordinates = plot.coordinates.map(p => [p[1], p[0]]);
      const sourceId = `plot-source-${plot.id}`;
      const layerId = `plot-layer-${plot.id}`;
      const outlineLayerId = `plot-outline-${plot.id}`;

      const isSelected = selectedPlotId === plot.id;

      // Add source if not exists
      if (!map.current?.getSource(sourceId)) {
        map.current?.addSource(sourceId, {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: { name: plot.name },
            geometry: {
              type: 'Polygon',
              coordinates: [[...coordinates, coordinates[0]]],
            },
          },
        });
        addedFeatures.current.sources.push(sourceId);
      }

      // Add fill layer
      if (!map.current?.getLayer(layerId)) {
        map.current?.addLayer({
          id: layerId,
          type: 'fill',
          source: sourceId,
          paint: {
            'fill-color': isSelected ? '#7CB342' : '#673AB7',
            'fill-opacity': isSelected ? 0.5 : 0.3,
          },
        });
        addedFeatures.current.layers.push(layerId);
      }

      // Add outline layer
      if (!map.current?.getLayer(outlineLayerId)) {
        map.current?.addLayer({
          id: outlineLayerId,
          type: 'line',
          source: sourceId,
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': isSelected ? '#558B2F' : '#4CAF50',
            'line-width': isSelected ? 3 : 2,
          },
        });
        addedFeatures.current.layers.push(outlineLayerId);
      }

      // Add popup on click
      map.current?.on('click', layerId, (e) => {
        new mapboxgl.Popup()
          .setLngLat(e.lngLat)
          .setHTML(`
            <div class="p-2">
              <h3 class="font-semibold">${plot.name}</h3>
              <p class="text-sm text-gray-600">${plot.surface_area?.toFixed(2) || 'N/A'} ha</p>
            </div>
          `)
          .addTo(map.current!);
      });

      // Change cursor on hover
      map.current?.on('mouseenter', layerId, () => {
        map.current!.getCanvas().style.cursor = 'pointer';
      });
      map.current?.on('mouseleave', layerId, () => {
        map.current!.getCanvas().style.cursor = '';
      });
    });
  }, [plots, selectedPlotId, mapReady]);

  // Fly to location
  useEffect(() => {
    if (!map.current || !flyToLocation) return;

    map.current.flyTo({
      center: [flyToLocation.lng, flyToLocation.lat],
      zoom: flyToLocation.zoom || 16,
      duration: 1500,
      essential: true,
    });
  }, [flyToLocation]);

  return (
    <div className="relative w-full h-full">
      <div
        ref={mapContainer}
        className={`w-full h-full ${drawingMode === 'drawing' ? 'drawing-mode' : ''}`}
      />
      
      {/* Drawing indicator */}
      {drawingMode === 'drawing' && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-primary text-white px-4 py-2 rounded-lg shadow-lg animate-slide-in">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span className="text-sm font-medium">Click on map to draw polygon</span>
          </div>
          <div className="text-xs mt-1 opacity-90">
            {drawingPoints.length} points placed
          </div>
        </div>
      )}

      {/* Map attribution */}
      <div className="absolute bottom-2 right-2 z-10 text-xs text-white/70 bg-black/30 px-2 py-1 rounded">
        © Mapbox © OpenStreetMap
      </div>
    </div>
  );
}
