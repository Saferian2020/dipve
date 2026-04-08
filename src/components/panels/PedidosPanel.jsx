import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { calcPedidosStats } from '../../utils/kpiCalculator';

const WINE = '#5C1A1A';
const BAR_COLORS = ['#7f1d1d', '#991b1b', '#b91c1c', '#dc2626', '#ef4444', '#f87171', '#fca5a5'];

function KPICard({ label, value, sub }) {
  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center text-center min-w-0">
      <span className="text-xs text-gray-500 uppercase tracking-wide mb-1 leading-tight">{label}</span>
      <span className="text-3xl font-bold leading-none" style={{ color: WINE }}>
        {value}
      </span>
      {sub && <span className="text-xs text-gray-400 mt-1">{sub}</span>}
    </div>
  );
}

export default function PedidosPanel({ data, fechaDesde, fechaHasta }) {
  const stats = useMemo(
    () => calcPedidosStats(data, fechaDesde, fechaHasta),
    [data, fechaDesde, fechaHasta]
  );

  const noData = stats.total === 0;

  return (
    <div className="w-full space-y-4">
      {/* Panel header */}
      <div className="rounded-lg px-4 py-3" style={{ backgroundColor: WINE }}>
        <h2 className="text-white font-bold text-lg tracking-wide">Pedidos</h2>
      </div>

      {noData ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-400 text-sm">Sin pedidos en el período seleccionado.</p>
        </div>
      ) : (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-2 gap-3">
            <KPICard label="Pedidos tomados" value={stats.total} />
            <KPICard
              label="Cajas pedidas"
              value={stats.cajasTotales}
              sub="total del período"
            />
          </div>

          {/* Ranking de productos */}
          {stats.rankingProductos.length > 0 && (
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Ranking de productos (cajas pedidas)
              </h3>
              <ResponsiveContainer
                width="100%"
                height={Math.max(120, stats.rankingProductos.length * 44)}
              >
                <BarChart
                  data={stats.rankingProductos}
                  layout="vertical"
                  margin={{ top: 0, right: 24, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                  <YAxis
                    type="category"
                    dataKey="nombre"
                    width={175}
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                  />
                  <Tooltip formatter={(v) => [v, 'cajas']} labelFormatter={(l) => l} />
                  <Bar dataKey="cajas" radius={[0, 4, 4, 0]}>
                    {stats.rankingProductos.map((_, i) => (
                      <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Pedidos por vendedor */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700">Pedidos por vendedor</h3>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 uppercase border-b border-gray-100">
                  <th className="px-4 py-2 text-left font-semibold">Vendedor</th>
                  <th className="px-4 py-2 text-center font-semibold">Pedidos</th>
                  <th className="px-4 py-2 text-center font-semibold">Cajas</th>
                </tr>
              </thead>
              <tbody>
                {stats.porVendedor.map((row, idx) => (
                  <tr key={row.vendedor} className={idx % 2 === 0 ? 'bg-white' : 'bg-red-50'}>
                    <td className="px-4 py-2 font-medium text-gray-800">{row.vendedor}</td>
                    <td className="px-4 py-2 text-center text-gray-700">{row.pedidos}</td>
                    <td className="px-4 py-2 text-center text-gray-700">{row.cajas}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
