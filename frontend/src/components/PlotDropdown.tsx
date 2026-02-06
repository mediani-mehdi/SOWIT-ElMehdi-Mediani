import { useEffect, useState } from 'react';
import type { PlotName } from '@/types';

interface PlotDropdownProps {
  plotNames: PlotName[];
  selectedPlotId: number | null;
  onSelect: (plotId: number) => void;
  loading?: boolean;
}

export default function PlotDropdown({
  plotNames,
  selectedPlotId,
  onSelect,
  loading = false,
}: PlotDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedPlot = plotNames.find(p => p.id === selectedPlotId);

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        Sélectionner une Parcelle
      </label>
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading || plotNames.length === 0}
        className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-left flex items-center justify-between hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className={selectedPlot ? 'text-gray-900' : 'text-gray-500'}>
          {loading 
            ? 'Chargement...' 
            : selectedPlot 
              ? selectedPlot.name 
              : plotNames.length === 0 
                ? 'Aucune parcelle disponible' 
                : 'Choisir une parcelle...'}
        </span>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && plotNames.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto animate-fade-in">
          {plotNames.map((plot) => (
            <button
              key={plot.id}
              type="button"
              onClick={() => {
                onSelect(plot.id);
                setIsOpen(false);
              }}
              className={`w-full px-3 py-2.5 text-left hover:bg-gray-50 transition-colors flex items-center gap-2 ${
                selectedPlotId === plot.id ? 'bg-primary/10 text-primary' : 'text-gray-700'
              }`}
            >
              <svg
                className={`w-4 h-4 ${selectedPlotId === plot.id ? 'text-primary' : 'text-gray-400'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              {plot.name}
              {selectedPlotId === plot.id && (
                <svg className="w-4 h-4 ml-auto text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
