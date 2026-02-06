import { useState, useEffect, useRef } from 'react';
import type { DrawingMode } from '@/types';

interface CreatePlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartDrawing: () => void;
  onSavePlot: (data: { name: string; farm_name?: string; crop_type?: string; has_manager?: boolean }) => void;
  drawingMode: DrawingMode;
  drawingPoints: [number, number][];
}

export default function CreatePlotModal({
  isOpen,
  onClose,
  onStartDrawing,
  onSavePlot,
  drawingMode,
  drawingPoints,
}: CreatePlotModalProps) {
  const [name, setName] = useState('');
  const [farmName, setFarmName] = useState('Bouskoura');
  const [cropType, setCropType] = useState('');
  const [hasManager, setHasManager] = useState(false);
  const [step, setStep] = useState<'menu' | 'drawing' | 'form'>('menu');
  const modalRef = useRef<HTMLDivElement>(null);

  // Calculate surface area
  const calculateArea = (points: [number, number][]) => {
    if (points.length < 3) return 0;
    let area = 0;
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length;
      area += points[i][1] * points[j][0];
      area -= points[j][1] * points[i][0];
    }
    return Math.abs(area) * 0.5 * 12390; // Rough conversion to hectares
  };

  const surfaceArea = calculateArea(drawingPoints);

  useEffect(() => {
    if (isOpen) {
      if (drawingMode === 'closed') {
        setStep('form');
      } else {
        setStep('menu');
        setName('');
        setFarmName('Bouskoura');
        setCropType('');
        setHasManager(false);
      }
    }
  }, [isOpen, drawingMode]);

  const handleStartDrawing = () => {
    setStep('drawing');
    onStartDrawing();
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSavePlot({
        name: name.trim(),
        farm_name: farmName,
        crop_type: cropType,
        has_manager: hasManager,
      });
      setName('');
      setStep('menu');
    }
  };

  const handleClose = () => {
    setName('');
    setStep('menu');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === modalRef) handleClose();
      }}
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-fade-in">
        {step === 'menu' && (
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Create New Plot</h2>
            <p className="text-gray-500 text-sm mb-6">
              Choose how you want to create your plot
            </p>

            <div className="space-y-3">
              <button
                onClick={handleStartDrawing}
                className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-all flex items-center gap-4 group"
              >
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-800">Draw on Map</div>
                  <div className="text-sm text-gray-500">Manually draw the polygon on the map</div>
                </div>
              </button>

              <button
                onClick={() => alert('KML import coming soon!')}
                className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-all flex items-center gap-4 group opacity-60 cursor-not-allowed"
                disabled
              >
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-800">Import KML File</div>
                  <div className="text-sm text-gray-500">Import from existing KML file</div>
                </div>
              </button>
            </div>

            <button
              onClick={handleClose}
              className="w-full mt-6 py-2.5 text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        )}

        {step === 'drawing' && (
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Drawing Mode</h2>
            <p className="text-gray-500 text-sm mb-4">
              Click on the map to place points. Click near the first point to close the polygon.
            </p>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Points placed:</span>
                <span className="font-semibold text-primary">{drawingPoints.length}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 py-2.5 px-4 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-900 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {step === 'form' && (
          <form onSubmit={handleSave} className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Save Plot</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nom
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter plot name"
                  className="input-field"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Surface
                </label>
                <div className="w-full px-3 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-gray-600">
                  {surfaceArea.toFixed(2)} ha
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nom de l'Exploitation
                </label>
                <select
                  value={farmName}
                  onChange={(e) => setFarmName(e.target.value)}
                  className="input-field"
                >
                  <option value="Bouskoura">Bouskoura</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Type de culture
                </label>
                <select
                  value={cropType}
                  onChange={(e) => setCropType(e.target.value)}
                  className="input-field"
                >
                  <option value="">Sélectionner</option>
                  <option value="Wheat">Wheat</option>
                  <option value="Corn">Corn</option>
                  <option value="Olives">Olives</option>
                  <option value="Vegetables">Vegetables</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="hasManager"
                  checked={hasManager}
                  onChange={(e) => setHasManager(e.target.checked)}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <label htmlFor="hasManager" className="text-sm font-medium text-gray-700 select-none">
                  Ajouter un Chef de Parcelle
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-2.5 px-4 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-900 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={!name.trim()}
                className="flex-1 py-2.5 px-4 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Ajouter
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
