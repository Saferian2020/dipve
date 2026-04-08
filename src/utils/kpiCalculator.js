import { VENDORS } from '../constants/vendors';
import { PRODUCTS, COMPETITORS } from '../constants/products';
import { VISIT_TYPES, RESULTS, COMPRO_SI, INVENTORY_STATES } from '../constants/sheetConfig';
import { isInRange } from './dateUtils';

export function calcNuevosPDVStats(data, fechaDesde, fechaHasta) {
  const empty = {
    total: 0,
    compraron: 0,
    noCompraron: 0,
    tasaConversion: null,
    razonesNoCompra: [],
    porTipoPDV: [],
    porVendedor: VENDORS.map((v) => ({
      vendedor: v,
      total: 0,
      compraron: 0,
      tasaConversion: null,
    })),
  };

  if (!data || data.length === 0) return empty;

  const rows = data.filter(
    (r) => r.tipoVisita === VISIT_TYPES.nuevoPDV && isInRange(r.fecha, fechaDesde, fechaHasta)
  );

  if (rows.length === 0) return empty;

  const total = rows.length;
  const compraron = rows.filter((r) => r.compro === COMPRO_SI).length;
  const noCompraron = total - compraron;
  const tasaConversion = safeRate(compraron, total);

  // Razones de no compra
  const razonesMap = {};
  rows
    .filter((r) => r.compro !== COMPRO_SI && r.razonNoCompra)
    .forEach((r) => {
      const razon = r.razonNoCompra || 'Sin especificar';
      razonesMap[razon] = (razonesMap[razon] || 0) + 1;
    });
  const razonesNoCompra = Object.entries(razonesMap)
    .map(([razon, count]) => ({ razon, count }))
    .sort((a, b) => b.count - a.count);

  // Distribución por tipo de PDV
  const tipoPDVMap = {};
  rows.forEach((r) => {
    const tipo = r.tipoPDV || 'Sin datos';
    tipoPDVMap[tipo] = (tipoPDVMap[tipo] || 0) + 1;
  });
  const porTipoPDV = Object.entries(tipoPDVMap)
    .map(([tipo, count]) => ({ tipo, count }))
    .sort((a, b) => b.count - a.count);

  // Por vendedor
  const porVendedor = VENDORS.map((vendedor) => {
    const vRows = rows.filter((r) => r.vendedor === vendedor);
    const vTotal = vRows.length;
    const vCompraron = vRows.filter((r) => r.compro === COMPRO_SI).length;
    return {
      vendedor,
      total: vTotal,
      compraron: vCompraron,
      tasaConversion: safeRate(vCompraron, vTotal),
    };
  });

  return { total, compraron, noCompraron, tasaConversion, razonesNoCompra, porTipoPDV, porVendedor };
}

export function calcPedidosStats(data, fechaDesde, fechaHasta) {
  const emptyVendedor = VENDORS.map((v) => ({ vendedor: v, pedidos: 0, cajas: 0 }));
  const empty = { total: 0, cajasTotales: 0, rankingProductos: [], porVendedor: emptyVendedor };

  if (!data || data.length === 0) return empty;

  const rows = data.filter(
    (r) =>
      r.tipoVisita === VISIT_TYPES.pedido &&
      r.resultado === RESULTS.pedidoTomado &&
      isInRange(r.fecha, fechaDesde, fechaHasta)
  );

  if (rows.length === 0) return empty;

  const total = rows.length;

  // Sum cajas by producto name
  const productMap = {};
  let cajasTotales = 0;
  rows.forEach((r) => {
    (r.productos || []).forEach(({ nombre, cajas }) => {
      productMap[nombre] = (productMap[nombre] || 0) + cajas;
      cajasTotales += cajas;
    });
  });
  const rankingProductos = Object.entries(productMap)
    .map(([nombre, cajas]) => ({ nombre, cajas }))
    .sort((a, b) => b.cajas - a.cajas);

  // Per vendor
  const porVendedor = VENDORS.map((vendedor) => {
    const vRows = rows.filter((r) => r.vendedor === vendedor);
    const cajas = vRows.reduce(
      (sum, r) => sum + (r.productos || []).reduce((s, p) => s + p.cajas, 0),
      0
    );
    return { vendedor, pedidos: vRows.length, cajas };
  });

  return { total, cajasTotales, rankingProductos, porVendedor };
}

export function calcInventarioStats(data, fechaDesde, fechaHasta) {
  const empty = { rows: [], totalRelevamientos: 0 };

  if (!data || data.length === 0) return empty;

  const relevamientos = data.filter(
    (r) =>
      r.tipoVisita === VISIT_TYPES.pedido &&
      isInRange(r.fecha, fechaDesde, fechaHasta) &&
      (r.inventario || []).some((v) => v !== null)
  );

  if (relevamientos.length === 0) return empty;

  // For each product (index 0-6 = PRODUCTS[0..6]), tally inventory states
  const rows = PRODUCTS.map((nombre, idx) => {
    const counts = {
      [INVENTORY_STATES.critico]: 0,
      [INVENTORY_STATES.medio]: 0,
      [INVENTORY_STATES.alto]: 0,
      [INVENTORY_STATES.noVende]: 0,
    };
    let total = 0;
    relevamientos.forEach((r) => {
      const estado = (r.inventario || [])[idx];
      if (estado && counts[estado] !== undefined) {
        counts[estado]++;
        total++;
      }
    });
    return { nombre, ...counts, total };
  });

  return { rows, totalRelevamientos: relevamientos.length };
}

export function calcEntregasStats(data, fechaDesde, fechaHasta) {
  const empty = {
    total: 0,
    entregaTotal: 0,
    parcial: 0,
    noEntregado: 0,
    cobros: [],
    totalCobros: 0,
  };

  if (!data || data.length === 0) return empty;

  const rows = data.filter(
    (r) => r.tipoVisita === VISIT_TYPES.entrega && isInRange(r.fecha, fechaDesde, fechaHasta)
  );

  if (rows.length === 0) return empty;

  const total = rows.length;
  const entregaTotal = rows.filter((r) => r.estadoEntrega === 'Entrega Total').length;
  const parcial = rows.filter((r) => r.estadoEntrega === 'Entrega Parcial').length;
  const noEntregado = rows.filter((r) => r.estadoEntrega === 'No Entregado').length;

  // Tally cobros by payment method
  const cobrosMap = {};
  let totalCobros = 0;
  rows.forEach((r) => {
    const cobrado = (r.seCobro || '').toLowerCase();
    if (cobrado === 'sí' || cobrado === 'si' || cobrado === 'yes') {
      const metodo = r.metodoCobro || 'Sin especificar';
      cobrosMap[metodo] = (cobrosMap[metodo] || 0) + 1;
      totalCobros++;
    }
  });
  const cobros = Object.entries(cobrosMap)
    .map(([metodo, count]) => ({ metodo, count }))
    .sort((a, b) => b.count - a.count);

  return { total, entregaTotal, parcial, noEntregado, cobros, totalCobros };
}

// Val Sud products with price columns (first 3 products in catalog)
const VALSUD_PRICE_PRODUCTS = [
  'Val Sud Red Blend Magnum',
  'Val Sud Red Blend Classic',
  'Val Sud Gran Malbec',
];

export function calcPreciosStats(data, fechaDesde, fechaHasta) {
  const emptyValSud = VALSUD_PRICE_PRODUCTS.map((nombre) => ({ nombre, promedio: null, count: 0 }));
  const emptyComp = COMPETITORS.map((nombre) => ({ nombre, promedio: null, count: 0 }));
  const empty = { totalRelevamientos: 0, valSud: emptyValSud, competidores: emptyComp };

  if (!data || data.length === 0) return empty;

  const rows = data.filter(
    (r) => r.tipoVisita === VISIT_TYPES.pedido && isInRange(r.fecha, fechaDesde, fechaHasta)
  );

  if (rows.length === 0) return empty;

  // Average Val Sud prices (index 0-2 in precioValSud array)
  const valSud = VALSUD_PRICE_PRODUCTS.map((nombre, i) => {
    const prices = rows
      .map((r) => (r.precioValSud || [])[i])
      .filter((p) => p !== null && p > 0);
    return {
      nombre,
      promedio: prices.length > 0 ? Math.round(prices.reduce((s, p) => s + p, 0) / prices.length) : null,
      count: prices.length,
    };
  });

  // Average competitor prices (index 0-2 in precioCompetidores array)
  const competidores = COMPETITORS.map((nombre, i) => {
    const prices = rows
      .map((r) => (r.precioCompetidores || [])[i])
      .filter((p) => p !== null && p > 0);
    return {
      nombre,
      promedio: prices.length > 0 ? Math.round(prices.reduce((s, p) => s + p, 0) / prices.length) : null,
      count: prices.length,
    };
  });

  const totalRelevamientos = rows.filter(
    (r) =>
      (r.precioValSud || []).some((p) => p !== null) ||
      (r.precioCompetidores || []).some((p) => p !== null)
  ).length;

  return { totalRelevamientos, valSud, competidores };
}

function safeRate(numerator, denominator) {
  if (!denominator || denominator === 0) return null;
  return Math.round((numerator / denominator) * 100);
}

export function calcVendorStats(data, fechaDesde, fechaHasta) {
  if (!data || data.length === 0) {
    return VENDORS.map((v) => ({
      vendedor: v,
      totalVisitas: 0,
      nuevosPDV: 0,
      compraron: 0,
      tasaConversion: null,
      pedidos: 0,
      entregas: 0,
    }));
  }

  const filtered = data.filter((row) => isInRange(row.fecha, fechaDesde, fechaHasta));

  return VENDORS.map((vendedor) => {
    const rows = filtered.filter((r) => r.vendedor === vendedor);

    const totalVisitas = rows.length;

    const nuevosPDVRows = rows.filter((r) => r.tipoVisita === VISIT_TYPES.nuevoPDV);
    const nuevosPDV = nuevosPDVRows.length;

    const compraron = nuevosPDVRows.filter((r) => r.compro === COMPRO_SI).length;
    const tasaConversion = safeRate(compraron, nuevosPDV);

    const pedidos = rows.filter(
      (r) =>
        r.tipoVisita === VISIT_TYPES.pedido && r.resultado === RESULTS.pedidoTomado
    ).length;

    const entregas = rows.filter((r) => r.tipoVisita === VISIT_TYPES.entrega).length;

    return {
      vendedor,
      totalVisitas,
      nuevosPDV,
      compraron,
      tasaConversion,
      pedidos,
      entregas,
    };
  });
}
