import Papa from 'papaparse';
import { COLS, INVENTORY_STATES } from '../constants/sheetConfig';

const CUTOFF_DATE = new Date('2026-03-01T00:00:00');

function parseDate(raw) {
  if (!raw) return null;

  // Google Forms Argentina locale: "DD/MM/YYYY HH:MM:SS"
  // Must try regex FIRST — native new Date() misreads DD/MM as MM/DD
  const parts = raw.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})/);
  if (parts) {
    return new Date(
      parseInt(parts[3]),
      parseInt(parts[2]) - 1, // month is 0-indexed
      parseInt(parts[1]),
      parseInt(parts[4]),
      parseInt(parts[5]),
      parseInt(parts[6])
    );
  }

  // Fallback for ISO or unambiguous formats
  const date = new Date(raw);
  return isNaN(date.getTime()) ? null : date;
}

function parseProducts(row, productCols, quantityCols) {
  return productCols
    .map((colIdx, i) => {
      const nombre = (row[colIdx] || '').trim();
      const cajas = parseInt(row[quantityCols[i]] || '0', 10) || 0;
      return nombre ? { nombre, cajas } : null;
    })
    .filter(Boolean);
}

export function parseSheetCSV(csvRaw) {
  const result = Papa.parse(csvRaw, {
    header: false,
    skipEmptyLines: true,
  });

  const rows = result.data;
  if (rows.length <= 1) return [];

  // Skip header row
  return rows.slice(1).reduce((acc, row) => {
    const fecha = parseDate(row[COLS.fecha]);
    if (!fecha || fecha < CUTOFF_DATE) return acc;

    const productosNuevoPDV = parseProducts(
      row,
      COLS.productoNuevoPDV,
      COLS.cantidadNuevoPDV
    );
    const productos = parseProducts(row, COLS.productoPedido, COLS.cantidadPedida);

    const tipoVisita = (row[COLS.tipoVisita] || '').trim();
    const nombrePDV =
      tipoVisita === 'Nuevo PDV'
        ? (row[COLS.nombreNuevoPDV] || '').trim()
        : tipoVisita === 'Toma de Pedido / Relevamiento'
        ? (row[COLS.nombrePedido] || '').trim()
        : tipoVisita === 'Entrega'
        ? (row[COLS.nombreEntrega] || '').trim()
        : '';
    const direccion =
      tipoVisita === 'Nuevo PDV'
        ? (row[COLS.direccionNuevoPDV] || '').trim()
        : tipoVisita === 'Toma de Pedido / Relevamiento'
        ? (row[COLS.direccionPedido] || '').trim()
        : tipoVisita === 'Entrega'
        ? (row[COLS.direccionEntrega] || '').trim()
        : '';

    // Parse inventario PDV (7 slots, one per product in catalog order)
    const VALID_INV = Object.values(INVENTORY_STATES);
    const inventario = COLS.inventarioPDV.map((colIdx) => {
      const val = (row[colIdx] || '').trim();
      return VALID_INV.includes(val) ? val : null;
    });

    // Parse precios competidores y Val Sud (null si celda vacía o no numérica)
    const precioCompetidores = COLS.precioCompetidores.map((idx) => {
      const val = parseFloat((row[idx] || '').replace(',', '.'));
      return isNaN(val) || val <= 0 ? null : val;
    });

    const precioValSud = COLS.precioValSud.map((idx) => {
      const val = parseFloat((row[idx] || '').replace(',', '.'));
      return isNaN(val) || val <= 0 ? null : val;
    });

    acc.push({
      fecha,
      vendedor: (row[COLS.vendedor] || '').trim(),
      tipoVisita,
      zona: (row[COLS.zona] || '').trim(),
      compro: (row[COLS.compro] || '').trim(),
      tipoPDV: (row[COLS.tipoPDV] || '').trim(),
      nombrePDV,
      direccion,
      razonNoCompra: (row[COLS.razonNoCompra] || '').trim(),
      resultado: (row[COLS.resultado] || '').trim(),
      estadoEntrega: (row[COLS.estadoEntrega] || '').trim(),
      seCobro: (row[COLS.seCobro] || '').trim(),
      metodoCobro: (row[COLS.metodoCobro] || '').trim(),
      productosNuevoPDV,
      productos,
      inventario,
      precioCompetidores,
      precioValSud,
    });

    return acc;
  }, []);
}
