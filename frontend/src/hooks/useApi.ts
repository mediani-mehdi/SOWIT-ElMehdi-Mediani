import { useState, useCallback } from 'react';
import type { Plot, PlotName, PlotCenter } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function usePlots() {
  const [state, setState] = useState<ApiState<Plot[]>>({
    data: null,
    loading: false,
    error: null,
  });

  const fetchPlots = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await fetch(`${API_URL}/plots/`);
      if (!response.ok) throw new Error('Failed to fetch plots');
      const data = await response.json();
      setState({ data, loading: false, error: null });
      return data;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Unknown error';
      setState({ data: null, loading: false, error });
      throw err;
    }
  }, []);

  const createPlot = useCallback(async (data: { 
    name: string; 
    coordinates: [number, number][];
    farm_name?: string;
    crop_type?: string;
    has_manager?: boolean;
  }) => {
    try {
      const response = await fetch(`${API_URL}/plots/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create plot');
      const responseData = await response.json();
      await fetchPlots(); // Refresh the list
      return responseData;
    } catch (err) {
      throw err;
    }
  }, [fetchPlots]);

  const deletePlot = useCallback(async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/plots/${id}/`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete plot');
      await fetchPlots(); // Refresh the list
      return true;
    } catch (err) {
      throw err;
    }
  }, [fetchPlots]);

  return { ...state, fetchPlots, createPlot, deletePlot };
}

export function usePlotNames() {
  const [plotNames, setPlotNames] = useState<PlotName[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPlotNames = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/plots/list_names/`);
      if (!response.ok) throw new Error('Failed to fetch plot names');
      const data = await response.json();
      setPlotNames(data);
    } catch (err) {
      console.error('Error fetching plot names:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { plotNames, loading, fetchPlotNames };
}

export function usePlotCenter() {
  const [plotCenter, setPlotCenter] = useState<PlotCenter | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchPlotCenter = useCallback(async (id: number) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/plots/${id}/center/`);
      if (!response.ok) throw new Error('Failed to fetch plot center');
      const data = await response.json();
      setPlotCenter(data);
      return data;
    } catch (err) {
      console.error('Error fetching plot center:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { plotCenter, loading, fetchPlotCenter };
}
