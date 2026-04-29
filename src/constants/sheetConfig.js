export const SHEET_ID = '1W7xhwB_zBF3sxOiCAN_Ub7KYNPPCD6pMzZ3AOmfNf4A';

export const SHEET_GIDS = {
  respuestas: '401974834',
  nuevosPDV: '1105327068',
  kpi: '2092043606',
};

export const SHEET_URLS = {
  respuestas: `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${SHEET_GIDS.respuestas}`,
};

// Column indices (0-based) in the CSV — verified against live sheet headers 08/04/2026
export const COLS = {
  fecha: 0,          // Marca temporal
  vendedor: 1,       // Vendedor
  tipoVisita: 17,    // Tipo de Visita
  compro: 8,         // Compró Producto?
  tipoPDV: 4,        // Punto de Venta (Kiosco/Ventanita, Almacén, Supermercado chino, etc.)
  razonNoCompra: 27, // Razón (razón de no compra en Nuevo PDV)
  zona: 31,          // Zona
  resultado: 32,     // Resultado

  // Nombres y direcciones por ruta
  nombreNuevoPDV: 18,     // Nombre PDV (Nuevo PDV)
  direccionNuevoPDV: 6,   // Dirección PDV (Nuevo PDV)
  nombrePedido: 60,       // Nombre PDV (Pedido/Relevamiento)
  direccionPedido: 63,    // Dirección Pedido/Relevamiento
  nombreEntrega: 64,      // Nombre PDV (Entrega)
  direccionEntrega: 67,   // Dirección PDV para Entrega.

  // Nuevo PDV: productos y cantidades vendidas (cols J, V, X, Z, CR / U, W, Y, AA, CS)
  productoNuevoPDV: [9, 21, 23, 25, 95],
  cantidadNuevoPDV: [20, 22, 24, 26, 96],

  // Pedidos: productos pedidos (cols AI, AK, AL, AM, CT)
  productoPedido: [34, 36, 37, 38, 97],
  // Pedidos: cantidades pedidas en cajas (cols AJ, AN, AO, AP, CU)
  cantidadPedida: [35, 39, 40, 41, 98],

  // Inventario PDV: estado por producto (cols CK–CQ, 7 productos en orden catálogo)
  inventarioPDV: [88, 89, 90, 91, 92, 93, 94],

  // Entregas: verificados contra headers reales 10/04/2026
  estadoEntrega: 68,  // Estado de Entrega (Entrega Total / Entrega Parcial / No Entregado)
  seCobro: 69,        // Se cobró?
  metodoCobro: 70,    // Método de Cobro

  // Precios: relevados en visitas de Toma de Pedido / Relevamiento
  // Competidores (verificar contra headers reales si retorna vacío)
  precioCompetidores: [53, 54, 55], // [Viñas de Balbo, Hormiga Negra Malbec, Prófugo Malbec]
  // Val Sud (3 productos con precio relevado)
  precioValSud: [57, 58, 59],       // [Red Blend Magnum, Red Blend Classic, Gran Malbec]
};

// Inventory state values (exact strings from Sheet)
export const INVENTORY_STATES = {
  critico: '< 5 cajas',
  medio: '> 5 cajas',
  alto: '> 10 cajas',
  noVende: 'No se vende',
};

// Exact strings used in the Sheet (case/accent sensitive)
export const VISIT_TYPES = {
  nuevoPDV: 'Nuevo PDV',
  pedido: 'Toma de Pedido / Relevamiento',
  entrega: 'Entrega',
};

export const RESULTS = {
  pedidoTomado: 'Se tomó Pedido',
  pedidoNoTomado: 'No se tomó Pedido',
};

export const COMPRO_SI = 'Sí';
