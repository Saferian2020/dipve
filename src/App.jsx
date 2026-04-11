import './index.css';
import { useState } from 'react';
import { useSheetData } from './hooks/useSheetData';
import { usePeriodFilter } from './hooks/usePeriodFilter';
import Header from './components/layout/Header';
import ExecutiveSummary from './components/layout/ExecutiveSummary';
import PreciosPanel from './components/panels/PreciosPanel';
import EquipoPanel from './components/panels/EquipoPanel';
import VentasPanel from './components/panels/VentasPanel';

const WINE = '#5C1A1A';

const TABS = [
  { id: 'equipo', label: 'Equipo' },
  { id: 'ventas', label: 'Ventas' },
  { id: 'precios', label: 'Precios' },
  { id: 'pedidos', label: 'Pedidos / Entregas' },
];

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <div
          className="inline-block w-10 h-10 border-4 rounded-full animate-spin mb-3"
          style={{ borderColor: WINE, borderTopColor: 'transparent' }}
        />
        <p className="text-gray-500 text-sm">Cargando datos...</p>
      </div>
    </div>
  );
}

function ErrorMessage({ message }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-sm w-full">
        <p className="text-red-700 font-medium text-sm">{message}</p>
        <button
          className="mt-4 px-4 py-2 rounded text-white text-sm font-semibold"
          style={{ backgroundColor: WINE }}
          onClick={() => window.location.reload()}
        >
          Reintentar
        </button>
      </div>
    </div>
  );
}

function PlaceholderPanel({ sesion }) {
  return (
    <div className="bg-white rounded-lg shadow p-10 text-center">
      <p className="text-gray-400 text-sm">En construcción — se completa en Sesión {sesion}.</p>
    </div>
  );
}

export default function App() {
  const { data, loading, error, lastUpdated } = useSheetData();
  const [activeTab, setActiveTab] = useState('precios');
  const {
    fechaDesde,
    fechaHasta,
    activePreset,
    desdeInput,
    hastaInput,
    setWeek,
    setMonth,
    setCustomRange,
  } = usePeriodFilter();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F5F5' }}>
      {/* Sticky zone: Header (title + period filter) + Executive Summary */}
      <div className="sticky top-0 z-30 shadow-md">
        <Header
          lastUpdated={lastUpdated}
          desdeInput={desdeInput}
          hastaInput={hastaInput}
          activePreset={activePreset}
          onSetWeek={setWeek}
          onSetMonth={setMonth}
          onCustomRange={setCustomRange}
        />
        <ExecutiveSummary data={data} fechaDesde={fechaDesde} fechaHasta={fechaHasta} />
      </div>

      {/* Tab navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-2 overflow-x-auto">
          <div className="flex gap-0 min-w-max">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === t.id
                    ? 'border-red-800 text-red-800'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Panel content */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {activeTab === 'equipo' && (
          <EquipoPanel data={data} fechaDesde={fechaDesde} fechaHasta={fechaHasta} />
        )}
        {activeTab === 'ventas' && (
          <VentasPanel data={data} fechaDesde={fechaDesde} fechaHasta={fechaHasta} />
        )}
        {activeTab === 'precios' && (
          <PreciosPanel data={data} fechaDesde={fechaDesde} fechaHasta={fechaHasta} />
        )}
        {activeTab === 'pedidos' && <PlaceholderPanel sesion={8} />}
      </main>
    </div>
  );
}
