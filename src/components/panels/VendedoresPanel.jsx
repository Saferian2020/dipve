import { useMemo } from 'react';
import { calcVendorStats } from '../../utils/kpiCalculator';

function ConversionBadge({ value }) {
  if (value === null) return <span className="text-gray-400">—</span>;
  const color =
    value >= 50 ? 'text-green-600' : value >= 25 ? 'text-yellow-600' : 'text-red-600';
  return <span className={`font-semibold ${color}`}>{value}%</span>;
}

export default function VendedoresPanel({ data, fechaDesde, fechaHasta }) {
  const stats = useMemo(
    () => calcVendorStats(data, fechaDesde, fechaHasta),
    [data, fechaDesde, fechaHasta]
  );

  return (
    <div className="w-full">
      {/* Header */}
      <div
        className="rounded-t-lg px-4 py-3"
        style={{ backgroundColor: '#5C1A1A' }}
      >
        <h2 className="text-white font-bold text-lg tracking-wide">
          Performance por Vendedor
        </h2>
      </div>

      {/* Table wrapper */}
      <div className="overflow-x-auto rounded-b-lg shadow">
        <table className="w-full text-sm border-collapse bg-white">
          <thead>
            <tr style={{ backgroundColor: '#5C1A1A' }}>
              {['Vendedor', 'Visitas', 'Nuevos PDV', 'Compraron', 'Conversión', 'Pedidos', 'Entregas'].map(
                (col) => (
                  <th
                    key={col}
                    className="px-4 py-3 text-white font-semibold text-left whitespace-nowrap"
                  >
                    {col}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {stats.map((row, idx) => (
              <tr
                key={row.vendedor}
                className={idx % 2 === 0 ? 'bg-white' : 'bg-red-50'}
              >
                <td className="px-4 py-3 font-semibold text-gray-800">{row.vendedor}</td>
                <td className="px-4 py-3 text-center text-gray-700">{row.totalVisitas}</td>
                <td className="px-4 py-3 text-center text-gray-700">{row.nuevosPDV}</td>
                <td className="px-4 py-3 text-center text-gray-700">{row.compraron}</td>
                <td className="px-4 py-3 text-center">
                  <ConversionBadge value={row.tasaConversion} />
                </td>
                <td className="px-4 py-3 text-center text-gray-700">{row.pedidos}</td>
                <td className="px-4 py-3 text-center text-gray-700">{row.entregas}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
