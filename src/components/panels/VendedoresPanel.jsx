/* eslint-disable react/prop-types */
import { useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  calcVendedoresByVendor,
  calcVendedoresFixedComparison,
  calcVendedoresPeriodStats,
} from '../../utils/kpiCalculator';
import { VENDORS } from '../../constants/vendors';
import { PRODUCT_PRICES_BY_NAME } from '../../constants/productPrices';

const WINE = '#5C1A1A';
const GREEN = '#15803d';
const RED = '#b91c1c';
const AMBER = '#d97706';
const BLUE = '#2563eb';
const GRAY = '#6b7280';

const ALL_VENDOR = 'Todos';
const VENDOR_OPTIONS = [ALL_VENDOR, ...VENDORS];

const VENDOR_COLORS = {
  Javier: WINE,
  Karen: '#E07B54',
  Daniel: '#4A90D9',
};

const VISIT_COLORS = {
  'Nuevo PDV': WINE,
  'Pedido/Relevamiento': AMBER,
  Entrega: BLUE,
};

const INDICATORS = [
  { key: 'visitasTotales', label: 'Visitas totales', type: 'number' },
  { key: 'objetivo', label: 'Objetivo', type: 'number' },
  { key: 'diferencia', label: 'Diferencia', type: 'signed' },
  { key: 'conversion', label: 'Conversión', type: 'percent' },
  { key: 'cajasVendidas', label: 'Cajas vendidas', type: 'number' },
  { key: 'ticketPromedio', label: 'Ticket promedio', type: 'money' },
];

function formatNumber(value) {
  return new Intl.NumberFormat('es-AR').format(value || 0);
}

function formatMoney(value) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function formatValue(value, type) {
  if (value === null || value === undefined) return '—';
  if (type === 'money') return formatMoney(value);
  if (type === 'percent') return `${value}%`;
  if (type === 'signed') return `${value >= 0 ? '+' : ''}${formatNumber(value)}`;
  return formatNumber(value);
}

function Section({ title, children, action }) {
  return (
    <section className="bg-white rounded-lg shadow p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h3 className="text-sm font-bold uppercase tracking-wide" style={{ color: WINE }}>
          {title}
        </h3>
        {action}
      </div>
      {children}
    </section>
  );
}

function SelectField({ label, value, onChange, children }) {
  return (
    <label className="flex flex-col gap-1 text-xs font-semibold text-gray-500">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-200"
      >
        {children}
      </select>
    </label>
  );
}

function MetricCard({ label, value, tone = 'neutral', sublabel }) {
  const toneClass =
    tone === 'positive' ? 'text-green-700' : tone === 'negative' ? 'text-red-700' : 'text-gray-900';

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</div>
      <div className={`mt-2 text-2xl font-black ${toneClass}`}>{value}</div>
      {sublabel && <div className="mt-1 text-xs text-gray-500">{sublabel}</div>}
    </div>
  );
}

function ComparisonMode({ comparison }) {
  const [tableVendor, setTableVendor] = useState(ALL_VENDOR);
  const [indicator, setIndicator] = useState('visitasTotales');

  const tableRows = useMemo(() => {
    const vendors = tableVendor === ALL_VENDOR
      ? comparison.byVendor
      : comparison.byVendor.filter((row) => row.vendedor === tableVendor);

    return vendors.flatMap((vendorRow) =>
      INDICATORS.map((item) => ({
        vendedor: vendorRow.vendedor,
        indicador: item,
        day: vendorRow.periods.day[item.key],
        last5: vendorRow.periods.last5[item.key],
        month: vendorRow.periods.month[item.key],
      }))
    );
  }, [comparison.byVendor, tableVendor]);

  const chartData = comparison.periods.map((period) => {
    const row = { periodo: period.label };
    comparison.byVendor.forEach((vendorRow) => {
      row[vendorRow.vendedor] = vendorRow.periods[period.key][indicator] || 0;
    });
    return row;
  });

  const selectedIndicator = INDICATORS.find((item) => item.key === indicator);

  return (
    <Section
      title="Modo Comparativo"
      action={
        <div className="flex flex-col sm:flex-row gap-2">
          <SelectField label="Tabla" value={tableVendor} onChange={setTableVendor}>
            {VENDOR_OPTIONS.map((vendor) => (
              <option key={vendor} value={vendor}>
                {vendor}
              </option>
            ))}
          </SelectField>
          <SelectField label="Gráfico" value={indicator} onChange={setIndicator}>
            {INDICATORS.map((item) => (
              <option key={item.key} value={item.key}>
                {item.label}
              </option>
            ))}
          </SelectField>
        </div>
      }
    >
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {['Vendedor', 'Indicador', 'Día anterior', 'Últimos 5 días', 'Último mes'].map(
                  (col) => (
                    <th key={col} className="px-3 py-2 text-left font-semibold text-gray-600">
                      {col}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row, index) => (
                <tr key={`${row.vendedor}-${row.indicador.key}`} className={index % 2 ? 'bg-red-50' : 'bg-white'}>
                  <td className="px-3 py-2 font-semibold" style={{ color: VENDOR_COLORS[row.vendedor] }}>
                    {row.vendedor}
                  </td>
                  <td className="px-3 py-2 text-gray-700">{row.indicador.label}</td>
                  {['day', 'last5', 'month'].map((periodKey) => (
                    <td
                      key={periodKey}
                      className={`px-3 py-2 text-right font-medium ${
                        row.indicador.type === 'signed'
                          ? row[periodKey] >= 0
                            ? 'text-green-700'
                            : 'text-red-700'
                          : 'text-gray-800'
                      }`}
                    >
                      {formatValue(row[periodKey], row.indicador.type)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-lg border border-gray-200 p-3">
          <div className="mb-2 text-xs font-semibold text-gray-500">
            Indicador seleccionado: {selectedIndicator.label}
          </div>
          <p className="mb-2 text-xs text-gray-400">
            La tabla puede filtrarse por vendedor. El gráfico compara todos los vendedores.
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 10, right: 18, left: -8, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="periodo" tick={{ fontSize: 12, fill: GRAY }} />
              <YAxis tick={{ fontSize: 11, fill: GRAY }} />
              <Tooltip
                formatter={(value, name) => [formatValue(value, selectedIndicator.type), name]}
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
              {VENDORS.map((vendor) => (
                <Line
                  key={vendor}
                  type="monotone"
                  dataKey={vendor}
                  stroke={VENDOR_COLORS[vendor]}
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: VENDOR_COLORS[vendor] }}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Section>
  );
}

function VisitSummary({ stats }) {
  const pieData = [
    { name: 'Nuevo PDV', value: stats.nuevoPDV },
    { name: 'Pedido/Relevamiento', value: stats.pedidoRelevamiento },
    { name: 'Entrega', value: stats.entrega },
  ];
  const total = Math.max(stats.visitasTotales, 1);

  return (
    <Section title="Resumen visual de visitas">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 rounded-lg border border-gray-200 bg-gray-50 p-5">
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Visitas totales
          </div>
          <div className="mt-2 text-5xl font-black" style={{ color: WINE }}>
            {formatNumber(stats.visitasTotales)}
          </div>
          <div className="mt-2 text-sm text-gray-500">
            Nuevo PDV + Pedido/Relevamiento + Entrega
          </div>
        </div>

        <div className="lg:row-span-2 rounded-lg border border-gray-200 p-3">
          <ResponsiveContainer width="100%" height={190}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={42} outerRadius={72}>
                {pieData.map((item) => (
                  <Cell key={item.name} fill={VISIT_COLORS[item.name]} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [formatNumber(value), name]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 space-y-2">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center justify-between gap-3 text-xs">
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                    style={{ backgroundColor: VISIT_COLORS[item.name] }}
                  />
                  <span className="truncate font-semibold text-gray-600">{item.name}</span>
                </div>
                <span className="flex-shrink-0 font-bold text-gray-800">
                  {formatNumber(item.value)} ({Math.round((item.value / total) * 100)}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        <MetricCard label="Nuevo PDV" value={formatNumber(stats.nuevoPDV)} />
        <MetricCard label="Pedido/Relevamiento" value={formatNumber(stats.pedidoRelevamiento)} />
        <MetricCard label="Entrega" value={formatNumber(stats.entrega)} />
      </div>
    </Section>
  );
}

function ObjectiveBlock({ stats }) {
  const progress = Math.min(stats.cumplimiento || 0, 140);

  return (
    <Section title="Objetivo mínimo de visitas">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard label="Objetivo" value={formatNumber(stats.objetivo)} />
        <MetricCard label="Visitas reales" value={formatNumber(stats.visitasTotales)} />
        <MetricCard
          label="Diferencia"
          value={formatValue(stats.diferencia, 'signed')}
          tone={stats.diferencia >= 0 ? 'positive' : 'negative'}
        />
        <MetricCard
          label="Cumplimiento"
          value={stats.cumplimiento !== null ? `${stats.cumplimiento}%` : '—'}
          tone={stats.diferencia >= 0 ? 'positive' : 'negative'}
        />
      </div>
      <div className="mt-4 h-3 rounded-full bg-gray-200 overflow-hidden">
        <div
          className="h-3 rounded-full"
          style={{
            width: `${Math.min(progress, 100)}%`,
            backgroundColor: stats.diferencia >= 0 ? GREEN : RED,
          }}
        />
      </div>
    </Section>
  );
}

function ConversionBlock({ stats, vendorRows, selectedVendor }) {
  const chartData = vendorRows.map((row) => ({
    vendedor: row.vendedor,
    conversion: row.conversion || 0,
  }));

  return (
    <Section title="Conversión de visitas">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <MetricCard label="Visitas totales" value={formatNumber(stats.visitasTotales)} />
        <MetricCard label="Visitas con compra" value={formatNumber(stats.visitasConCompra)} />
        <MetricCard
          label="Conversión"
          value={stats.conversion !== null ? `${stats.conversion}%` : '—'}
        />
      </div>

      <div className="rounded-lg border border-gray-200 p-3">
        <div className="mb-2 text-xs font-semibold text-gray-500">Conversión por vendedor</div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData} margin={{ top: 8, right: 10, left: -12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis dataKey="vendedor" tick={{ fontSize: 12, fill: GRAY }} />
            <YAxis tick={{ fontSize: 11, fill: GRAY }} tickFormatter={(value) => `${value}%`} />
            <Tooltip formatter={(value) => [`${value}%`, 'Conversión']} />
            <Bar dataKey="conversion" radius={[4, 4, 0, 0]}>
              {chartData.map((row) => {
                const selected = selectedVendor === ALL_VENDOR || selectedVendor === row.vendedor;
                return (
                  <Cell
                    key={row.vendedor}
                    fill={VENDOR_COLORS[row.vendedor]}
                    opacity={selected ? 1 : 0.35}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Section>
  );
}

function TicketBlock({ stats }) {
  return (
    <Section title="Ticket promedio">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <MetricCard label="Venta total" value={formatMoney(stats.ventaTotal)} />
        <MetricCard label="Pedidos con compra" value={formatNumber(stats.pedidosConCompra)} />
        <MetricCard label="Ticket promedio" value={formatMoney(stats.ticketPromedio)} />
      </div>
      {Object.keys(PRODUCT_PRICES_BY_NAME).length === 0 && (
        <p className="mt-3 text-xs text-gray-400">
          Precios por producto pendientes de conectar desde hoja auxiliar; los valores monetarios usan fallback seguro en 0.
        </p>
      )}
    </Section>
  );
}

function BuyersTable({ rows }) {
  return (
    <Section title="Clientes que compraron">
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {['Vendedor', 'Cliente / PDV', 'Cajas', 'Dirección'].map((col) => (
                <th key={col} className="px-3 py-2 text-left font-semibold text-gray-600">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="px-3 py-6 text-center text-gray-400" colSpan={4}>
                  Sin clientes con compra en el período seleccionado
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr key={`${row.vendedor}-${row.cliente}-${index}`} className={index % 2 ? 'bg-red-50' : 'bg-white'}>
                  <td className="px-3 py-2 font-semibold" style={{ color: VENDOR_COLORS[row.vendedor] || WINE }}>
                    {row.vendedor}
                  </td>
                  <td className="px-3 py-2 text-gray-800">{row.cliente}</td>
                  <td className="px-3 py-2 text-right font-semibold">{formatNumber(row.cajas)}</td>
                  <td className="px-3 py-2 text-gray-600">{row.direccion}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Section>
  );
}

function VendorComparisonTable({ rows, selectedVendor }) {
  return (
    <Section title="Comparativa entre vendedores">
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {[
                'Vendedor',
                'Visitas',
                'Objetivo',
                'Diferencia',
                'Conversión',
                'Cajas vendidas',
                'Venta total',
                'Ticket promedio',
              ].map((col) => (
                <th key={col} className="px-3 py-2 text-left font-semibold text-gray-600">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const highlighted = selectedVendor !== ALL_VENDOR && selectedVendor === row.vendedor;
              return (
                <tr
                  key={row.vendedor}
                  className={
                    highlighted
                      ? 'bg-red-100 ring-1 ring-red-200'
                      : index % 2
                      ? 'bg-red-50'
                      : 'bg-white'
                  }
                >
                  <td className="px-3 py-2 font-semibold" style={{ color: VENDOR_COLORS[row.vendedor] }}>
                    {row.vendedor}
                  </td>
                  <td className="px-3 py-2 text-right">{formatNumber(row.visitasTotales)}</td>
                  <td className="px-3 py-2 text-right">{formatNumber(row.objetivo)}</td>
                  <td className={`px-3 py-2 text-right font-bold ${row.diferencia >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {formatValue(row.diferencia, 'signed')}
                  </td>
                  <td className="px-3 py-2 text-right">{formatValue(row.conversion, 'percent')}</td>
                  <td className="px-3 py-2 text-right">{formatNumber(row.cajasVendidas)}</td>
                  <td className="px-3 py-2 text-right">{formatMoney(row.ventaTotal)}</td>
                  <td className="px-3 py-2 text-right">{formatMoney(row.ticketPromedio)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Section>
  );
}

export default function VendedoresPanel({ data, selectedPeriod, selectedVendor, fixedPeriods }) {
  const stats = useMemo(
    () =>
      calcVendedoresPeriodStats(
        data,
        selectedPeriod.desde,
        selectedPeriod.hasta,
        selectedVendor,
        PRODUCT_PRICES_BY_NAME
      ),
    [data, selectedPeriod, selectedVendor]
  );

  const vendorRows = useMemo(
    () =>
      calcVendedoresByVendor(
        data,
        selectedPeriod.desde,
        selectedPeriod.hasta,
        PRODUCT_PRICES_BY_NAME
      ),
    [data, selectedPeriod]
  );

  const comparison = useMemo(
    () => ({
      periods: fixedPeriods,
      byVendor: calcVendedoresFixedComparison(data, fixedPeriods, PRODUCT_PRICES_BY_NAME),
    }),
    [data, fixedPeriods]
  );

  return (
    <div className="space-y-4">
      <ComparisonMode comparison={comparison} />
      <VisitSummary stats={stats} />
      <ObjectiveBlock stats={stats} />
      <ConversionBlock stats={stats} vendorRows={vendorRows} selectedVendor={selectedVendor} />
      <TicketBlock stats={stats} />
      <BuyersTable rows={stats.clientesCompraron} />
      <VendorComparisonTable rows={vendorRows} selectedVendor={selectedVendor} />
    </div>
  );
}
