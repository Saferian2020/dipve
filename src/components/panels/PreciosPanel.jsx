import { useMemo } from 'react';
import { calcPreciosStats } from '../../utils/kpiCalculator';

const WINE = '#5C1A1A';

function PriceRow({ nombre, promedio, count, accent }) {
  return (
    <tr className="border-b border-gray-100 last:border-0">
      <td className="px-4 py-3 text-sm font-medium text-gray-800 leading-tight">{nombre}</td>
      <td className="px-4 py-3 text-center">
        {promedio !== null ? (
          <span className="font-bold text-base" style={{ color: accent || WINE }}>
            ${promedio.toLocaleString('es-AR')}
          </span>
        ) : (
          <span className="text-gray-300 text-sm">—</span>
        )}
      </td>
      <td className="px-4 py-3 text-center text-xs text-gray-400">
        {count > 0 ? `${count} reg.` : '—'}
      </td>
    </tr>
  );
}

export default function PreciosPanel({ data, fechaDesde, fechaHasta }) {
  const stats = useMemo(
    () => calcPreciosStats(data, fechaDesde, fechaHasta),
    [data, fechaDesde, fechaHasta]
  );

  const noData = stats.totalRelevamientos === 0;

  const allPricesNull =
    stats.valSud.every((p) => p.promedio === null) &&
    stats.competidores.every((p) => p.promedio === null);

  return (
    <div className="w-full space-y-4">
      {/* Panel header */}
      <div className="rounded-lg px-4 py-3" style={{ backgroundColor: WINE }}>
        <h2 className="text-white font-bold text-lg tracking-wide">
          Relevamiento de Precios
        </h2>
      </div>

      {noData || allPricesNull ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-400 text-sm">
            Sin relevamientos de precios en el período seleccionado.
          </p>
        </div>
      ) : (
        <>
          <p className="text-xs text-gray-500 px-1">
            Basado en {stats.totalRelevamientos} relevamiento
            {stats.totalRelevamientos !== 1 ? 's' : ''} del período. Precios en pesos argentinos.
          </p>

          {/* Val Sud prices */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div
              className="px-4 py-2 flex items-center gap-2"
              style={{ backgroundColor: WINE }}
            >
              <span className="text-white text-xs font-bold uppercase tracking-wide">
                Val Sud — Precios relevados
              </span>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 uppercase border-b border-gray-100 bg-gray-50">
                  <th className="px-4 py-2 text-left font-semibold">Producto</th>
                  <th className="px-4 py-2 text-center font-semibold">Precio promedio</th>
                  <th className="px-4 py-2 text-center font-semibold">Relevamientos</th>
                </tr>
              </thead>
              <tbody>
                {stats.valSud.map((item) => (
                  <PriceRow
                    key={item.nombre}
                    nombre={item.nombre}
                    promedio={item.promedio}
                    count={item.count}
                    accent={WINE}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Competitor prices */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-4 py-2 bg-gray-700">
              <span className="text-white text-xs font-bold uppercase tracking-wide">
                Competencia — Precios relevados
              </span>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 uppercase border-b border-gray-100 bg-gray-50">
                  <th className="px-4 py-2 text-left font-semibold">Competidor</th>
                  <th className="px-4 py-2 text-center font-semibold">Precio promedio</th>
                  <th className="px-4 py-2 text-center font-semibold">Relevamientos</th>
                </tr>
              </thead>
              <tbody>
                {stats.competidores.map((item) => (
                  <PriceRow
                    key={item.nombre}
                    nombre={item.nombre}
                    promedio={item.promedio}
                    count={item.count}
                    accent="#374151"
                  />
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
