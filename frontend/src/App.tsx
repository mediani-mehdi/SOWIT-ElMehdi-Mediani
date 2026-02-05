import { useState, useEffect, useCallback } from 'react';
import MapBox from '@/components/MapBox';
import PlotDropdown from '@/components/PlotDropdown';
import CreatePlotModal from '@/components/CreatePlotModal';
import { usePlots, usePlotNames, usePlotCenter } from '@/hooks/useApi';
import type { Plot, DrawingMode } from '@/types';

function App() {
  // API hooks
  const { data: plots, loading: plotsLoading, fetchPlots, createPlot, deletePlot } = usePlots();
  const { plotNames, loading: namesLoading, fetchPlotNames } = usePlotNames();
  const { plotCenter, fetchPlotCenter } = usePlotCenter();

  // Local state
  const [drawingMode, setDrawingMode] = useState<DrawingMode>('none');
  const [drawingPoints, setDrawingPoints] = useState<[number, number][]>([]);
  const [selectedPlotId, setSelectedPlotId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [flyToLocation, setFlyToLocation] = useState<{ lat: number; lng: number; zoom?: number } | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Fetch plots on mount
  useEffect(() => {
    fetchPlots();
    fetchPlotNames();
  }, [fetchPlots, fetchPlotNames]);

  // Show notification helper
  const showNotification = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  }, []);

  // Handle map click for drawing
  const handleMapClick = useCallback((lat: number, lng: number) => {
    if (drawingMode === 'drawing') {
      setDrawingPoints((prev) => {
        const newPoints = [...prev, [lat, lng] as [number, number]];
        
        // Auto-close if clicking near first point (and have at least 3 points)
        if (newPoints.length > 3) {
          const firstPoint = newPoints[0];
          const distance = Math.sqrt(
            Math.pow(lat - firstPoint[0], 2) + Math.pow(lng - firstPoint[1], 2)
          );
          
          if (distance < 0.0005) { // Close to first point
            setDrawingMode('closed');
            return newPoints.slice(0, -1); // Remove the closing click
          }
        }
        
        return newPoints;
      });
    }
  }, [drawingMode]);

  // Handle start drawing
  const handleStartDrawing = useCallback(() => {
    setDrawingPoints([]);
    setDrawingMode('drawing');
    setIsModalOpen(false);
  }, []);

  // Handle save plot
  const handleSavePlot = useCallback(async (name: string) => {
    try {
      await createPlot(name, drawingPoints);
      showNotification('Plot created successfully!', 'success');
      setDrawingPoints([]);
      setDrawingMode('none');
      setIsModalOpen(false);
      fetchPlotNames(); // Refresh dropdown
    } catch (err) {
      showNotification('Failed to create plot', 'error');
    }
  }, [createPlot, drawingPoints, fetchPlotNames, showNotification]);

  // Handle plot selection from dropdown
  const handlePlotSelect = useCallback(async (plotId: number) => {
    setSelectedPlotId(plotId);
    
    try {
      const centerData = await fetchPlotCenter(plotId);
      if (centerData?.center) {
        setFlyToLocation({
          lat: centerData.center.lat,
          lng: centerData.center.lng,
          zoom: 16,
        });
      }
    } catch (err) {
      showNotification('Failed to load plot location', 'error');
    }
  }, [fetchPlotCenter, showNotification]);

  // Handle delete plot
  const handleDeletePlot = useCallback(async () => {
    if (!selectedPlotId) return;
    
    if (confirm('Are you sure you want to delete this plot?')) {
      try {
        await deletePlot(selectedPlotId);
        showNotification('Plot deleted successfully!', 'success');
        setSelectedPlotId(null);
        fetchPlotNames();
      } catch (err) {
        showNotification('Failed to delete plot', 'error');
      }
    }
  }, [deletePlot, selectedPlotId, fetchPlotNames, showNotification]);

  // Handle cancel drawing
  const handleCancelDrawing = useCallback(() => {
    setDrawingPoints([]);
    setDrawingMode('none');
    setIsModalOpen(false);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (drawingMode === 'drawing') {
          setDrawingPoints([]);
          setDrawingMode('none');
        }
        if (isModalOpen) {
          setIsModalOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [drawingMode, isModalOpen]);

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-lg">
              PM
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-800">Plot Manager</h1>
              <p className="text-xs text-gray-500">MapBox + Django + PostgreSQL</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="http://localhost:8000/admin/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-600 hover:text-primary transition-colors"
            >
              Django Admin
            </a>
            <a
              href="http://localhost:8000/api/plots/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-600 hover:text-primary transition-colors"
            >
              API
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-80 bg-white shadow-lg flex flex-col z-10">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-1">Controls</h2>
            <p className="text-sm text-gray-500">Manage your plots</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Plot Dropdown */}
            <div>
              <PlotDropdown
                plotNames={plotNames}
                selectedPlotId={selectedPlotId}
                onSelect={handlePlotSelect}
                loading={namesLoading}
              />
              <p className="text-xs text-gray-500 mt-1.5">
                Select a plot to animate the camera view
              </p>
            </div>

            {/* Create Plot Button */}
            <div>
              <button
                onClick={() => setIsModalOpen(true)}
                disabled={drawingMode === 'drawing'}
                className="w-full py-3 px-4 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create New Plot
              </button>
            </div>

            {/* Selected Plot Info */}
            {selectedPlotId && plots && (
              <div className="bg-gray-50 rounded-lg p-4 animate-fade-in">
                <h3 className="font-medium text-gray-800 mb-2">Selected Plot</h3>
                {(() => {
                  const plot = plots.find(p => p.id === selectedPlotId);
                  if (!plot) return null;
                  return (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Name:</span>
                        <span className="font-medium">{plot.name}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Surface:</span>
                        <span className="font-medium">{plot.surface_area?.toFixed(2) || 'N/A'} ha</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Points:</span>
                        <span className="font-medium">{plot.coordinates.length}</span>
                      </div>
                      <button
                        onClick={handleDeletePlot}
                        className="w-full mt-3 py-2 px-3 bg-red-100 text-red-600 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete Plot
                      </button>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Stats */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-800 mb-3">Statistics</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-primary">{plots?.length || 0}</div>
                  <div className="text-xs text-gray-500">Total Plots</div>
                </div>
                <div className="bg-white rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-primary">
                    {plots?.reduce((sum, p) => sum + (p.surface_area || 0), 0).toFixed(1) || '0'}
                  </div>
                  <div className="text-xs text-gray-500">Total Area (ha)</div>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                How to use
              </h3>
              <ul className="text-sm text-blue-700 space-y-1.5 list-disc list-inside">
                <li>Click "Create New Plot" to start</li>
                <li>Click on the map to place points</li>
                <li>Click near first point to close</li>
                <li>Select plot from dropdown to fly to it</li>
              </ul>
            </div>
          </div>
        </aside>

        {/* Map */}
        <main className="flex-1 relative">
          <MapBox
            plots={plots || []}
            drawingMode={drawingMode}
            drawingPoints={drawingPoints}
            selectedPlotId={selectedPlotId}
            onMapClick={handleMapClick}
            flyToLocation={flyToLocation}
          />
        </main>
      </div>

      {/* Create Plot Modal */}
      <CreatePlotModal
        isOpen={isModalOpen}
        onClose={handleCancelDrawing}
        onStartDrawing={handleStartDrawing}
        onSavePlot={handleSavePlot}
        drawingMode={drawingMode}
        drawingPoints={drawingPoints}
      />

      {/* Notification */}
      {notification && (
        <div
          className={`fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg animate-slide-in ${
            notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          } text-white`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
