import type { Plot } from '@/types';

interface SavedPlotsProps {
  plots: Plot[];
  loading: boolean;
  onDelete: (id: number) => void;
}

export default function SavedPlots({ plots, loading, onDelete }: SavedPlotsProps) {
  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Chargement des parcelles...</p>
        </div>
      </div>
    );
  }

  if (!plots || plots.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 7m0 13V7m0 0L9 4" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Aucune parcelle trouvée</h2>
          <p className="text-gray-500">Allez sur la carte pour dessiner et sauvegarder votre première parcelle.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto w-full h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Parcelles Sauvegardées</h2>
          <p className="text-gray-500 mt-1">Gérez vos parcelles et calculs sauvegardés</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 text-sm text-gray-600">
          Total Parcelles: <span className="font-semibold text-gray-900">{plots.length}</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-700 text-sm uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 font-semibold text-gray-700 text-sm uppercase tracking-wider">Nom</th>
                <th className="px-6 py-4 font-semibold text-gray-700 text-sm uppercase tracking-wider">Ferme</th>
                <th className="px-6 py-4 font-semibold text-gray-700 text-sm uppercase tracking-wider">Culture</th>
                <th className="px-6 py-4 font-semibold text-gray-700 text-sm uppercase tracking-wider">Surface</th>
                <th className="px-6 py-4 font-semibold text-gray-700 text-sm uppercase tracking-wider">Gestionnaire</th>
                <th className="px-6 py-4 font-semibold text-gray-700 text-sm uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 font-semibold text-gray-700 text-sm uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {plots.map((plot) => (
                <tr key={plot.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-900 font-medium">#{plot.id}</td>
                  <td className="px-6 py-4 text-gray-800 font-medium">{plot.name}</td>
                  <td className="px-6 py-4 text-gray-600">{plot.farm_name || '-'}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {plot.crop_type ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {plot.crop_type}
                      </span>
                    ) : '-'}
                  </td>
                  <td className="px-6 py-4 text-gray-600 font-mono">
                    {plot.surface_area?.toFixed(2) || '0.00'} ha
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {plot.has_manager ? (
                      <span className="text-primary flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        Oui
                      </span>
                    ) : <span className="text-gray-400">Non</span>}
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm">
                    {new Date(plot.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => onDelete(plot.id)}
                      className="text-red-600 hover:text-red-900 font-medium text-sm px-3 py-1 rounded hover:bg-red-50 transition-colors"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}