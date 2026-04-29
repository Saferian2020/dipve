/* eslint-disable react/prop-types */
import './index.css';
import { useMemo, useState } from 'react';
import { useSheetData } from './hooks/useSheetData';
import { usePeriodFilter } from './hooks/usePeriodFilter';
import Header from './components/layout/Header';
import ExecutiveSummary from './components/layout/ExecutiveSummary';
import VendedoresPanel from './components/panels/VendedoresPanel';
import PreciosPanel from './components/panels/PreciosPanel';
import EquipoPanel from './components/panels/EquipoPanel';
import VentasPanel from './components/panels/VentasPanel';

const WINE = '#5C1A1A';

const TABS = [
  { id: 'vendedores', label: 'Vendedores' },
  { id: 'equipo', label: 'Equipo' },
  { id: 'ventas', label: 'Ventas' },
  { id: 'precios', label: 'Precios' },
  { id: 'pedidos', label: 'Pedidos / Entregas' },
];

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function toDateInputValue(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function fromDateInputValue(value, end = false) {
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return end ? endOfDay(date) : startOfDay(date);
}

function buildVendorPeriods() {
  const yesterday = addDays(new Date(), -1);
  const hasta = endOfDay(yesterday);

  return [
    { key: 'day', label: 'Día anterior', desde: startOfDay(yesterday), hasta, days: 1 },
    {
      key: 'last5',
      label: 'Últimos 5 días',
      desde: startOfDay(addDays(yesterday, -4)),
      hasta,
      days: 5,
    },
    {
      key: 'month',
      label: 'Último mes',
      desde: startOfDay(addDays(yesterday, -29)),
      hasta,
      days: 30,
    },
  ];
}

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
  const [activeTab, setActiveTab] = useState('vendedores');
  const vendorFixedPeriods = useMemo(() => buildVendorPeriods(), []);
  const [vendorPeriodPreset, setVendorPeriodPreset] = useState('last5');
  const [vendorSelected, setVendorSelected] = useState('Todos');
  const [vendorCustomDesde, setVendorCustomDesde] = useState(
    () => toDateInputValue(vendorFixedPeriods[1].desde)
  );
  const [vendorCustomHasta, setVendorCustomHasta] = useState(
    () => toDateInputValue(vendorFixedPeriods[1].hasta)
  );
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

  const selectedVendorPeriod = useMemo(() => {
    if (vendorPeriodPreset === 'custom') {
      const desde = fromDateInputValue(vendorCustomDesde);
      const hasta = fromDateInputValue(vendorCustomHasta, true);
      const days = Math.max(
        1,
        Math.round((startOfDay(hasta).getTime() - startOfDay(desde).getTime()) / 86400000) + 1
      );
      return { key: 'custom', label: 'Rango personalizado', desde, hasta, days };
    }
    return vendorFixedPeriods.find((period) => period.key === vendorPeriodPreset) || vendorFixedPeriods[1];
  }, [vendorCustomDesde, vendorCustomHasta, vendorFixedPeriods, vendorPeriodPreset]);

  function setVendorCustomRange(desdeStr, hastaStr) {
    setVendorCustomDesde(desdeStr);
    setVendorCustomHasta(hastaStr);
    setVendorPeriodPreset('custom');
  }

  const headerDesdeInput =
    activeTab === 'vendedores'
      ? toDateInputValue(selectedVendorPeriod.desde)
      : desdeInput;
  const headerHastaInput =
    activeTab === 'vendedores'
      ? toDateInputValue(selectedVendorPeriod.hasta)
      : hastaInput;

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F5F5' }}>
      {/* Sticky zone: Header (title + period filter) + Executive Summary */}
      <div className="sticky top-0 z-30 shadow-md">
        <Header
          lastUpdated={lastUpdated}
          desdeInput={headerDesdeInput}
          hastaInput={headerHastaInput}
          activePreset={activePreset}
          onSetWeek={setWeek}
          onSetMonth={setMonth}
          onCustomRange={activeTab === 'vendedores' ? setVendorCustomRange : setCustomRange}
          vendorMode={activeTab === 'vendedores'}
          vendorPeriodPreset={vendorPeriodPreset}
          onVendorPeriodChange={setVendorPeriodPreset}
          vendorSelected={vendorSelected}
          onVendorSelectedChange={setVendorSelected}
        />
        {activeTab !== 'vendedores' && (
          <ExecutiveSummary data={data} fechaDesde={fechaDesde} fechaHasta={fechaHasta} />
        )}
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
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-4">
        {activeTab === 'vendedores' && (
          <VendedoresPanel
            data={data}
            selectedPeriod={selectedVendorPeriod}
            selectedVendor={vendorSelected}
            fixedPeriods={vendorFixedPeriods}
          />
        )}
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
