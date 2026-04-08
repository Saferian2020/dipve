import { useMemo } from 'react';
import { calcInventarioStats } from '../../utils/kpiCalculator';
import { INVENTORY_STATES } from '../../constants/sheetConfig';

const WINE = '#5C1A1A';

const { critico, medio, alto, noVende } = INVENTORY_STATES;

function StateCell({ count, isCritical }) {
  if (count === 0) return <span className="text-gray-300">—</span>;
  return (
    <span
      className={`font-semibold ${isCritical && count > 0 ? 'text-red-600' : 'text-gray-700'}`}
    >
      {count}
    </span>
  );
}

export default function InventarioPanel({ data, fechaDesde, fechaHasta }) {
  const stats = useMemo(
    () => calcInventarioStats(data, fechaDesde, fechaHasta),
    [data, fechaDesde, fechaHasta]
  );

  const noData = stats.totalRelevamientos === 0;

  return (
    <div className="w-full space-y-4">
      {/* Panel header */}
      <div className="rounded-lg px-4 py-3" style={{ backgroundColor: WINE }}>
        <h2 className="text-white font-bold text-lg tracking-wide">Inventario PDV</h2>
      </div>

      {noData ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-400 text-sm">Sin relevamientos en el período seleccionado.</p>
        </div>
      ) : (
        <>
          <p className="text-xs text-gray-500 px-1">
            Basado en {stats.totalRelevamientos} relevamiento
            {stats.totalRelevamientos !== 1 ? 's' : ''} del período.
            <span className="ml-2 text-red-600 font-medium">Rojo = stock crítico (&lt;5 cajas).</span>
          </p>

          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="w-full text-sm min-w-[480px]">
              <thead>
                <tr className="text-xs text-gray-500 uppercase border-b border-gray-100 bg-gray-50">
                  <th className="px-4 py-2 text-left font-semibold">Producto</th>
                  <th className="px-3 py-2 text-center font-semibold text-red-600">&lt;5 cajas</th>
                  <th className="px-3 py-2 text-center font-semibold text-yellow-600">&gt;5 cajas</th>
                  <th className="px-3 py-2 text-center font-semibold text-green-600">&gt;10 cajas</th>
                  <th className="px-3 py-2 text-center font-semibold text-gray-400">No vende</th>
                </tr>
              </thead>
              <tbody>
                {stats.rows.map((row, idx) => {
                  const hasCritical = row[critico] > 0;
                  return (
                    <tr
                      key={row.nombre}
                      className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} ${
                        hasCritical ? 'border-l-4 border-red-400' : ''
                      }`}
                    >
                      <td className="px-4 py-2 font-medium text-gray-800 leading-tight">
                        {row.nombre}
                        {hasCritical && (
                          <span className="ml-1 text-red-500 text-xs">(crítico)</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <StateCell count={row[critico]} isCritical />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <StateCell count={row[medio]} />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <StateCell count={row[alto]} />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <StateCell count={row[noVende]} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
