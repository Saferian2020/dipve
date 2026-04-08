# DIPVE — Progreso de Desarrollo

## Sesión 1 — 08/04/2026

### Estado: COMPLETADO

---

### Archivos creados

```
dipve/
├── src/
│   ├── constants/
│   │   ├── sheetConfig.js   — SHEET_ID, GIDs, índices de columnas, strings exactos del Sheet
│   │   ├── vendors.js       — ['Javier', 'Karen', 'Daniel']
│   │   ├── products.js      — Catálogo Val Sud + El Halcón + competidores
│   │   └── zones.js         — Zonas A1–A4, B1–B4
│   ├── utils/
│   │   ├── sheetParser.js   — Parsea CSV crudo → array de objetos tipados
│   │   ├── dateUtils.js     — getStartOfCurrentWeek, getStartOfCurrentMonth, isInRange
│   │   └── kpiCalculator.js — calcVendorStats() con protección contra división por cero
│   ├── hooks/
│   │   └── useSheetData.js  — Fetch + caché 5 min en memoria
│   ├── components/panels/
│   │   └── VendedoresPanel.jsx — Panel 5 completo
│   ├── App.jsx              — Componente raíz con loading/error/data
│   └── index.css            — Tailwind base
├── tailwind.config.js       — Configurado con color wine #5C1A1A
└── PROGRESO.md              — Este archivo
```

---

### Qué funciona

- Proyecto Vite 4 + React corriendo en `http://localhost:5173`
- Fetch del Google Sheet vía CSV público sin API Key
- Parseo correcto de fechas en formato argentino `DD/MM/YYYY HH:MM:SS`
- Filtro por semana actual (lunes a hoy)
- Caché en memoria de 5 minutos
- Panel 5 — Performance por Vendedor con datos reales:
  - Tabla: Vendedor / Visitas / Nuevos PDV / Compraron / Conversión / Pedidos / Entregas
  - Diseño corporativo color vino #5C1A1A
  - Colores de conversión: verde ≥50%, amarillo ≥25%, rojo <25%
  - Responsive (funciona en mobile)
- Ignora registros anteriores al 01/03/2026

### Bug resuelto en Sesión 1

`new Date("DD/MM/YYYY")` de JavaScript interpreta el formato argentino como MM/DD (mes/día
anglosajón), desplazando las fechas 4 meses. Solución: usar regex explícito antes del
fallback nativo en `sheetParser.js:parseDate()`.

---

### Objetivo de la Sesión 2

1. **Filtro de período** — selector semana / mes con botones "Semana actual" y "Mes actual"
2. **Panel 1 — Nuevos PDV** — total visitados, compraron vs no compraron, razones de no compra
3. **Navegación entre paneles** — header o tabs para cambiar de panel
4. Decidir si agregar KPICards visuales arriba del panel de vendedores

### Notas técnicas para Sesión 2

- El GID de las hojas "Pedidos Tomados" e "Inventario PDV" está sin verificar — revisar en la URL del Sheet
- Node.js v16.9.1 instalado — usar dependencias compatibles (Vite 4, Tailwind 3)
- Stack: Vite 4 / React / Tailwind 3.4.1 / Recharts / Lucide React / Papaparse
