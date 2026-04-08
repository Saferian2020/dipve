const WINE = '#5C1A1A';
const WINE_DARK = '#4a1515';

export default function PeriodFilter({
  desdeInput,
  hastaInput,
  activePreset,
  onSetWeek,
  onSetMonth,
  onCustomRange,
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
