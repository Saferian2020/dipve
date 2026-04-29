/* eslint-disable react/prop-types */
const WINE = '#5C1A1A';
const WINE_DARK = '#4a1515';

export default function PeriodFilter({
  desdeInput,
  hastaInput,
  activePreset,
  onSetWeek,
  onSetMonth,
  onCustomRange,
  vendorMode = false,
  vendorPeriodPreset,
  onVendorPeriodChange,
  vendorSelected,
  onVendorSelectedChange,
}) {
  function handleDesdeChange(e) {
    onCustomRange(e.target.value, hastaInput);
  }

  function handleHastaChange(e) {
    onCustomRange(desdeInput, e.target.value);
  }

  const btnBase =
    'px-3 py-1.5 rounded text-sm font-semibold transition-colors whitespace-nowrap';
  const btnActive = 'text-white';
  const btnInactive = 'text-white opacity-60 hover:opacity-90';

  if (vendorMode) {
    return (
      <div className="sticky top-0 z-10 shadow-md px-3 py-3" style={{ backgroundColor: WINE }}>
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-white">
          <div className="flex items-end pb-2 text-sm font-black uppercase tracking-wide">
            Filtros generales
          </div>

          <label className="flex flex-col gap-1 text-xs font-semibold">
            Período
            <select
              value={vendorPeriodPreset}
              onChange={(event) => onVendorPeriodChange(event.target.value)}
              className="rounded px-2 py-2 text-gray-900 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-300"
            >
              <option value="day">Día anterior</option>
              <option value="last5">Últimos 5 días</option>
              <option value="month">Último mes</option>
              <option value="custom">Rango personalizado</option>
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs font-semibold">
            Vendedor
            <select
              value={vendorSelected}
              onChange={(event) => onVendorSelectedChange(event.target.value)}
              className="rounded px-2 py-2 text-gray-900 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-300"
            >
              <option value="Todos">Todos</option>
              <option value="Javier">Javier</option>
              <option value="Karen">Karen</option>
              <option value="Daniel">Daniel</option>
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs font-semibold lg:col-span-1">
            Desde
            <input
              type="date"
              value={desdeInput}
              disabled={vendorPeriodPreset !== 'custom'}
              onChange={handleDesdeChange}
              className="rounded px-2 py-2 text-gray-900 text-sm bg-white disabled:bg-gray-100 disabled:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-300"
            />
          </label>

          <label className="flex flex-col gap-1 text-xs font-semibold lg:col-span-1">
            Hasta
            <input
              type="date"
              value={hastaInput}
              disabled={vendorPeriodPreset !== 'custom'}
              onChange={handleHastaChange}
              className="rounded px-2 py-2 text-gray-900 text-sm bg-white disabled:bg-gray-100 disabled:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-300"
            />
          </label>
        </div>
      </div>
    );
  }

  return (
    <div
      className="sticky top-0 z-10 shadow-md px-3 py-2"
      style={{ backgroundColor: WINE }}
    >
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
        {/* Preset buttons */}
        <div className="flex gap-2 flex-shrink-0">
          <button
            className={`${btnBase} ${activePreset === 'week' ? btnActive : btnInactive}`}
            style={activePreset === 'week' ? { backgroundColor: WINE_DARK, outline: '2px solid rgba(255,255,255,0.5)' } : {}}
            onClick={onSetWeek}
          >
            Semana actual
          </button>
          <button
            className={`${btnBase} ${activePreset === 'month' ? btnActive : btnInactive}`}
            style={activePreset === 'month' ? { backgroundColor: WINE_DARK, outline: '2px solid rgba(255,255,255,0.5)' } : {}}
            onClick={onSetMonth}
          >
            Mes actual
          </button>
        </div>

        {/* Date inputs */}
        <div className="flex items-center gap-2 text-sm text-white flex-wrap">
          <span className="opacity-70 flex-shrink-0">Desde</span>
          <input
            type="date"
            value={desdeInput}
            onChange={handleDesdeChange}
            className="rounded px-2 py-1 text-gray-900 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-300"
          />
          <span className="opacity-70 flex-shrink-0">Hasta</span>
          <input
            type="date"
            value={hastaInput}
            onChange={handleHastaChange}
            className="rounded px-2 py-1 text-gray-900 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-300"
          />
        </div>
      </div>
    </div>
  );
}
