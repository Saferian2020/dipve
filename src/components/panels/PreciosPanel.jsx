import { useMemo } from 'react';
import React from 'react';
import { calcPreciosStats } from '../../utils/kpiCalculator';

const WINE = '#5C1A1A';

function fmt(val) {
  return val !== null ? `$${val.toLocaleString('es-AR')}` : '—';
}

function ZoneCells({ stats, accent }) {
  if (!stats || stats.prom === null) {
    return (
      <React.Fragment>
        <td className="px-2 py-3 text-center text-gray-300 text-xs">—</td>
        <td className="px-2 py-3 text-center text-gray-300 text-xs">—</td>
        <td className="px-2 py-3 text-center text-gray-300 text-xs">—</td>
      </React.Fragment>
    );
  }
  return (
    <React.Fragment>
      <td className="px-2 py-3 text-center text-sm font-bold" style={{ color: accent }}>
        {fmt(stats.prom)}
      </td>
      <td className="px-2 py-3 text-center text-xs text-gray-500">{fmt(stats.min)}</td>
      <td className="px-2 py-3 text-center text-xs text-gray-500">{fmt(stats.max)}</td>
    </React.Fragment>
  );
}

function PreciosTable({ title, items, accent }) {
  const hasAnyData = items.some((item) => item.relevamientos > 0);

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-4 py-2" style={{ backgroundColor: accent }}>
        <span className="text-white text-xs font-bold uppercase tracking-wide">{title}</span>
      </div>

      {!hasAnyData ? (
        <div className="p-6 text-center text-gray-400 text-sm">
          Sin relevamientos de precios en el período seleccionado
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr className="text-xs text-gray-500 bg-gray-50">
                <th
                  className="px-3 py-2 text-left font-semibold border-b border-gray-200"
                  rowSpan={2}
                >
                  Producto
                </th>
                <th
                  className="px-2 py-1.5 text-center font-semibold border-b border-gray-200 border-l border-gray-200"
                  colSpan={3}
                >
                  Zona A1
                </th>
                <th
                  className="px-2 py-1.5 text-center font-semibold border-b border-gray-200 border-l border-gray-200"
                  colSpan={3}
                >
                  Zona B1
                </th>
                <th
                  className="px-2 py-2 text-center font-semibold border-b border-gray-200 border-l border-gray-200 text-xs"
                  rowSpan={2}
                >
                  Relev.
                </th>
              </tr>
              <tr className="text-xs text-gray-400 bg-gray-50">
                <th className="px-2 py-1 text-center border-b border-gray-200 border-l border-gray-200">Prom</th>
                <th className="px-2 py-1 text-center border-b border-gray-200">Mín</th>
                <th className="px-2 py-1 text-center border-b border-gray-200">Máx</th>
                <th className="px-2 py-1 text-center border-b border-gray-200 border-l border-gray-200">Prom</th>
                <th className="px-2 py-1 text-center border-b border-gray-200">Mín</th>
                <th className="px-2 py-1 text-center border-b border-gray-200">Máx</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr
                  key={item.nombre}
                  className={`border-b border-gray-100 last:border-0 ${idx % 2 === 1 ? 'bg-red-50' : ''}`}
                >
                  <td className="px-3 py-3 text-sm text-gray-800 font-medium leading-tight">
                    {item.nombre}
                  </td>
                  <ZoneCells stats={item.a1} accent={accent} />
                  <ZoneCells stats={item.b1} accent={accent} />
                  <td className="px-2 py-3 text-center text-xs text-gray-400 border-l border-gray-100">
                    {item.relevamientos > 0 ? item.relevamientos : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function PreciosPanel({ data, fechaDesde, fechaHasta }) {
  const stats = useMemo(
    () => calcPreciosStats(data, fechaDesde, fechaHasta),
    [data, fechaDesde, fechaHasta]
  );

  return (
    <div className="w-full space-y-4">
      <div className="rounded-lg px-4 py-3" style={{ backgroundColor: WINE }}>
        <h2 className="text-white font-bold text-lg tracking-wide">Relevamiento de Precios</h2>
        {stats.totalRelevamientos > 0 && (
          <p className="text-red-200 text-xs mt-0.5">
            {stats.totalRelevamientos} relevamiento{stats.totalRelevamientos !== 1 ? 's' : ''} en el período
          </p>
        )}
      </div>

      <PreciosTable
        title="Nuestros Vinos — Val Sud"
        items={stats.valSud}
        accent={WINE}
      />

      <PreciosTable
        title="Competencia"
        items={stats.competidores}
        accent="#374151"
      />

      <p className="text-xs text-gray-400 px-1">
        Datos relevados en campo por los vendedores. Precios en pesos argentinos sin decimales.
      </p>
    </div>
  );
}
