import { VENDORS } from '../constants/vendors';
import { PRODUCTS, INVENTORY_PRODUCTS, COMPETITORS } from '../constants/products';
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

  // For each inventory product (index 0-6 = CK..CQ), tally inventory states
  const rows = INVENTORY_PRODUCTS.map((nombre, idx) => {
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

// Val Sud products with price columns (indices 0-2 in precioValSud array)
const VALSUD_PRICE_PRODUCTS = [
  'Val Sud Red Blend Magnum',
  'Val Sud Red Blend Classic',
  'Val Sud Gran Malbec',
];

const ZONE_A1 = 'Zona A1';
const ZONE_B1 = 'Zona B1';

function calcZoneStats(rows, priceKey, productIndex, zoneName) {
  const prices = rows
    .filter((r) => r.zona === zoneName)
    .map((r) => (r[priceKey] || [])[productIndex])
    .filter((p) => p !== null && p > 0);
  if (prices.length === 0) return { prom: null, min: null, max: null };
  return {
    prom: Math.round(prices.reduce((s, p) => s + p, 0) / prices.length),
    min: Math.round(Math.min(...prices)),
    max: Math.round(Math.max(...prices)),
  };
}

export function calcPreciosStats(data, fechaDesde, fechaHasta) {
  const emptyZone = { prom: null, min: null, max: null };
  const emptyProduct = (nombre) => ({ nombre, a1: emptyZone, b1: emptyZone, relevamientos: 0 });
  const empty = {
    totalRelevamientos: 0,
    valSud: VALSUD_PRICE_PRODUCTS.map(emptyProduct),
    competidores: COMPETITORS.map(emptyProduct),
  };

  if (!data || data.length === 0) return empty;

  const rows = data.filter(
    (r) => r.tipoVisita === VISIT_TYPES.pedido && isInRange(r.fecha, fechaDesde, fechaHasta)
  );

  if (rows.length === 0) return empty;

  const valSud = VALSUD_PRICE_PRODUCTS.map((nombre, i) => ({
    nombre,
    a1: calcZoneStats(rows, 'precioValSud', i, ZONE_A1),
    b1: calcZoneStats(rows, 'precioValSud', i, ZONE_B1),
    relevamientos: rows.filter((r) => {
      const p = (r.precioValSud || [])[i];
      return p !== null && p > 0;
    }).length,
  }));

  const competidores = COMPETITORS.map((nombre, i) => ({
    nombre,
    a1: calcZoneStats(rows, 'precioCompetidores', i, ZONE_A1),
    b1: calcZoneStats(rows, 'precioCompetidores', i, ZONE_B1),
    relevamientos: rows.filter((r) => {
      const p = (r.precioCompetidores || [])[i];
      return p !== null && p > 0;
    }).length,
  }));

  const totalRelevamientos = rows.filter(
    (r) =>
      (r.precioValSud || []).some((p) => p !== null && p > 0) ||
      (r.precioCompetidores || []).some((p) => p !== null && p > 0)
  ).length;

  return { totalRelevamientos, valSud, competidores };
}

export function calcExecutiveSummary(data, fechaDesde, fechaHasta) {
  const empty = { visitas: 0, conversion: null, pedidos: 0, deltaVisitas: null, visitasAnterior: 0 };
  if (!data || data.length === 0) return empty;

  const current = data.filter((r) => isInRange(r.fecha, fechaDesde, fechaHasta));
  const visitas = current.length;

  const nuevosPDVRows = current.filter((r) => r.tipoVisita === VISIT_TYPES.nuevoPDV);
  const compraron = nuevosPDVRows.filter((r) => r.compro === COMPRO_SI).length;
  const conversion = safeRate(compraron, nuevosPDVRows.length);

  const pedidos = current.filter(
    (r) => r.tipoVisita === VISIT_TYPES.pedido && r.resultado === RESULTS.pedidoTomado
  ).length;

  // Previous period: same duration, immediately before fechaDesde
  const periodMs = fechaHasta.getTime() - fechaDesde.getTime();
  const prevHasta = new Date(fechaDesde.getTime() - 1);
  const prevDesde = new Date(prevHasta.getTime() - periodMs);
  const visitasAnterior = data.filter((r) => isInRange(r.fecha, prevDesde, prevHasta)).length;
  const deltaVisitas = visitasAnterior === 0 ? null : visitas - visitasAnterior;

  return { visitas, conversion, pedidos, deltaVisitas, visitasAnterior };
}

function safeRate(numerator, denominator) {
  if (!denominator || denominator === 0) return null;
  return Math.round((numerator / denominator) * 100);
}

// Returns the Monday (00:00:00) of the week containing `date`
function getMondayOf(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  d.setDate(d.getDate() - day + (day === 0 ? -6 : 1));
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Returns data aggregated by calendar week for the last `semanas` weeks.
 * Week 0 (oldest label "Sem 1") → current week (newest label "Sem N").
 * Each entry: { semana, label, visitas, conversion, pedidos, porVendedor }
 * porVendedor is an object { Javier: N, Karen: N, Daniel: N }
 */
export function calcWeeklyTrend(data, semanas = 4) {
  if (!data || data.length === 0) {
    return Array.from({ length: semanas }, (_, i) => ({
      semana: null,
      label: `Sem ${i + 1}`,
      visitas: 0,
      conversion: null,
      pedidos: 0,
      porVendedor: Object.fromEntries(VENDORS.map((v) => [v, 0])),
    }));
  }

  const currentMonday = getMondayOf(new Date());
  const result = [];

  for (let i = semanas - 1; i >= 0; i--) {
    const weekStart = new Date(currentMonday);
    weekStart.setDate(currentMonday.getDate() - i * 7);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const weekRows = data.filter((r) => isInRange(r.fecha, weekStart, weekEnd));
    const visitas = weekRows.length;

    const nuevosPDVRows = weekRows.filter((r) => r.tipoVisita === VISIT_TYPES.nuevoPDV);
    const compraron = nuevosPDVRows.filter((r) => r.compro === COMPRO_SI).length;
    const conversion = safeRate(compraron, nuevosPDVRows.length);

    const pedidos = weekRows.filter(
      (r) => r.tipoVisita === VISIT_TYPES.pedido && r.resultado === RESULTS.pedidoTomado
    ).length;

    const porVendedor = Object.fromEntries(
      VENDORS.map((v) => [v, weekRows.filter((r) => r.vendedor === v).length])
    );

    const weekIndex = semanas - 1 - i; // 0 = oldest
    result.push({
      semana: weekStart,
      label: `Sem ${weekIndex + 1}`,
      visitas,
      conversion: conversion ?? 0,
      pedidos: pedidos || 0,
      porVendedor,
    });
  }

  return result;
}

/**
 * Returns per-vendor comparison stats for the given date range,
 * plus a team-wide total row.
 * Each vendor: { nombre, visitas, nuevosPDV, compraron, tasaConversion, pedidos, ticketPromedio }
 * ticketPromedio is null when pedidos === 0 (display as "—").
 */
export function calcVendorComparison(data, desde, hasta) {
  const emptyVendors = VENDORS.map((v) => ({
    nombre: v,
    visitas: 0,
    nuevosPDV: 0,
    compraron: 0,
    tasaConversion: null,
    pedidos: 0,
    ticketPromedio: null,
  }));
  const emptyTotal = { nombre: 'Equipo', visitas: 0, nuevosPDV: 0, compraron: 0, tasaConversion: null, pedidos: 0, ticketPromedio: null };
  if (!data || data.length === 0) return { vendors: emptyVendors, total: emptyTotal };

  const rows = data.filter((r) => isInRange(r.fecha, desde, hasta));
  if (rows.length === 0) return { vendors: emptyVendors, total: emptyTotal };

  const vendors = VENDORS.map((nombre) => {
    const vRows = rows.filter((r) => r.vendedor === nombre);
    const visitas = vRows.length;

    const nuevosPDVRows = vRows.filter((r) => r.tipoVisita === VISIT_TYPES.nuevoPDV);
    const nuevosPDV = nuevosPDVRows.length;
    const compraron = nuevosPDVRows.filter((r) => r.compro === COMPRO_SI).length;
    const tasaConversion = safeRate(compraron, nuevosPDV);

    const pedidoRows = vRows.filter(
      (r) => r.tipoVisita === VISIT_TYPES.pedido && r.resultado === RESULTS.pedidoTomado
    );
    const pedidos = pedidoRows.length;
    const totalCajas = pedidoRows.reduce(
      (s, r) => s + (r.productos || []).reduce((ps, p) => ps + p.cajas, 0),
      0
    );
    const ticketPromedio = pedidos > 0 ? Math.round(totalCajas / pedidos) : null;

    return { nombre, visitas, nuevosPDV, compraron, tasaConversion, pedidos, ticketPromedio };
  });

  // Team totals
  const totalVisitas = vendors.reduce((s, v) => s + v.visitas, 0);
  const totalNuevosPDV = vendors.reduce((s, v) => s + v.nuevosPDV, 0);
  const totalCompraron = vendors.reduce((s, v) => s + v.compraron, 0);
  const totalPedidos = vendors.reduce((s, v) => s + v.pedidos, 0);
  const allPedidoRows = rows.filter(
    (r) => r.tipoVisita === VISIT_TYPES.pedido && r.resultado === RESULTS.pedidoTomado
  );
  const totalCajasAll = allPedidoRows.reduce(
    (s, r) => s + (r.productos || []).reduce((ps, p) => ps + p.cajas, 0),
    0
  );

  const total = {
    nombre: 'Equipo',
    visitas: totalVisitas,
    nuevosPDV: totalNuevosPDV,
    compraron: totalCompraron,
    tasaConversion: safeRate(totalCompraron, totalNuevosPDV),
    pedidos: totalPedidos,
    ticketPromedio: totalPedidos > 0 ? Math.round(totalCajasAll / totalPedidos) : null,
  };

  return { vendors, total };
}

/**
 * Returns sales funnel, rejection reasons, product ranking and avg ticket
 * for the given date range.
 */
export function calcVentasStats(data, desde, hasta) {
  const empty = {
    embudo: { visitados: 0, interesados: 0, compraron: 0 },
    razonesRechazo: [],
    rankingProductos: [],
    ticketPromedio: null,
  };
  if (!data || data.length === 0) return empty;

  const rows = data.filter((r) => isInRange(r.fecha, desde, hasta));
  if (rows.length === 0) return empty;

  // Funnel: based on Nuevo PDV rows only
  const nuevosPDVRows = rows.filter((r) => r.tipoVisita === VISIT_TYPES.nuevoPDV);
  const visitados = nuevosPDVRows.length;
  const compraron = nuevosPDVRows.filter((r) => r.compro === COMPRO_SI).length;
  // "Interesados" = those who responded "Reconfirmar" as rejection reason
  const interesados = nuevosPDVRows.filter(
    (r) => r.compro !== COMPRO_SI && (r.razonNoCompra || '').toLowerCase().includes('reconfirmar')
  ).length;

  // Razones de rechazo (all non-buyers who have a reason, including "Reconfirmar")
  const razonesMap = {};
  nuevosPDVRows
    .filter((r) => r.compro !== COMPRO_SI && r.razonNoCompra)
    .forEach((r) => {
      const razon = r.razonNoCompra;
      razonesMap[razon] = (razonesMap[razon] || 0) + 1;
    });
  const razonesRechazo = Object.entries(razonesMap)
    .map(([razon, cantidad]) => ({ razon, cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad);

  // Product ranking from pedidos taken
  const pedidoRows = rows.filter(
    (r) => r.tipoVisita === VISIT_TYPES.pedido && r.resultado === RESULTS.pedidoTomado
  );
  const productMap = {};
  pedidoRows.forEach((r) => {
    const zonaRow = r.zona || 'Sin zona';
    (r.productos || []).forEach(({ nombre, cajas }) => {
      if (!productMap[nombre]) productMap[nombre] = { cajas: 0, zonas: {} };
      productMap[nombre].cajas += cajas;
      productMap[nombre].zonas[zonaRow] = (productMap[nombre].zonas[zonaRow] || 0) + cajas;
    });
  });
  const rankingProductos = Object.entries(productMap)
    .map(([producto, { cajas, zonas }]) => {
      const zonaPredominante =
        Object.entries(zonas).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';
      return { producto, cajas, zona: zonaPredominante };
    })
    .sort((a, b) => b.cajas - a.cajas);

  // Ticket promedio: total cajas / pedidos
  const totalCajas = pedidoRows.reduce(
    (s, r) => s + (r.productos || []).reduce((ps, p) => ps + p.cajas, 0),
    0
  );
  const ticketPromedio = pedidoRows.length > 0 ? Math.round(totalCajas / pedidoRows.length) : null;

  return {
    embudo: { visitados, interesados, compraron },
    razonesRechazo,
    rankingProductos,
    ticketPromedio,
  };
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
