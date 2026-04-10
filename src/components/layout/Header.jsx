import PeriodFilter from '../filters/PeriodFilter';

const WINE = '#5C1A1A';

export default function Header({
  lastUpdated,
  desdeInput,
  hastaInput,
  activePreset,
  onSetWeek,
  onSetMonth,
  onCustomRange,
}) {
  return (
    <div>
      {/* Title bar */}
      <div className="bg-white border-b-2 px-4 py-3 flex items-center justify-between" style={{ borderColor: WINE }}>
        <div className="flex items-center gap-2">
          <span
            className="text-2xl font-black tracking-widest leading-none"
            style={{ color: WINE }}
          >
            DIPVE
          </span>
          <span className="hidden sm:inline text-xs text-gray-400 font-normal">
            Dashboard de Performance de Vendedores
          </span>
        </div>
        {lastUpdated && (
          <span className="text-xs text-gray-400">
            Datos:{' '}
            {lastUpdated.toLocaleTimeString('es-AR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        )}
      </div>

      {/* Period filter */}
      <PeriodFilter
        desdeInput={desdeInput}
        hastaInput={hastaInput}
        activePreset={activePreset}
        onSetWeek={onSetWeek}
        onSetMonth={onSetMonth}
        onCustomRange={onCustomRange}
      />
    </div>
  );
}
