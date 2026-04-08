import './index.css';
import { useState } from 'react';
import { useSheetData } from './hooks/useSheetData';
import { usePeriodFilter } from './hooks/usePeriodFilter';
import Header from './components/layout/Header';
import VendedoresPanel from './components/panels/VendedoresPanel';
import NuevosPDVPanel from './components/panels/NuevosPDVPanel';
import PedidosPanel from './components/panels/PedidosPanel';
import InventarioPanel from './components/panels/InventarioPanel';
import PreciosPanel from './components/panels/PreciosPanel';
import EntregasPanel from './components/panels/EntregasPanel';

const WINE = '#5C1A1A';

const PANELS = [
  { id: 'vendedores', label: 'Vendedores' },
  { id: 'nuevosPDV', label: 'Nuevos PDV' },
  { id: 'pedidos', label: 'Pedidos' },
  { id: 'precios', label: 'Precios' },
  { id: 'entregas', label: 'Entregas' },
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

export default function App() {
  const { data, loading, error, lastUpdated } = useSheetData();
  const [activePanel, setActivePanel] = useState('vendedores');
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
      {/* Sticky header: title bar + period filter */}
      <Header
        lastUpdated={lastUpdated}
        desdeInput={desdeInput}
        hastaInput={hastaInput}
        activePreset={activePreset}
        onSetWeek={setWeek}
        onSetMonth={setMonth}
        onCustomRange={setCustomRange}
      />

      {/* Panel navigation tabs — horizontal scroll on mobile */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-2 overflow-x-auto">
          <div className="flex gap-0 min-w-max">
            {PANELS.map((p) => (
              <button
                key={p.id}
                onClick={() => setActivePanel(p.id)}
                className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  activePanel === p.id
                    ? 'border-red-800 text-red-800'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Panel content */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {activePanel === 'vendedores' && (
          <VendedoresPanel data={data} fechaDesde={fechaDesde} fechaHasta={fechaHasta} />
        )}
        {activePanel === 'nuevosPDV' && (
          <NuevosPDVPanel data={data} fechaDesde={fechaDesde} fechaHasta={fechaHasta} />
        )}
        {activePanel === 'pedidos' && (
          <>
            <PedidosPanel data={data} fechaDesde={fechaDesde} fechaHasta={fechaHasta} />
            <InventarioPanel data={data} fechaDesde={fechaDesde} fechaHasta={fechaHasta} />
          </>
        )}
        {activePanel === 'precios' && (
          <PreciosPanel data={data} fechaDesde={fechaDesde} fechaHasta={fechaHasta} />
        )}
        {activePanel === 'entregas' && (
          <EntregasPanel data={data} fechaDesde={fechaDesde} fechaHasta={fechaHasta} />
        )}
      </main>
    </div>
  );
}
