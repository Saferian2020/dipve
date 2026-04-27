# DIPVE — Distri Norte
## Documento de contexto integral para retomar el desarrollo

**Fecha:** 24 de abril de 2026  
**Proyecto:** DIPVE — Dashboard Interactivo de Performance de Vendedores  
**Empresa:** Distri Norte — distribución de vinos en Gran Buenos Aires  
**Responsable técnico:** Daniel Gallardo  
**URL en producción:** https://dipve.vercel.app/

---

## 1. Qué es DIPVE

DIPVE es un sistema de tres capas para registrar, centralizar y analizar la actividad comercial de campo de una operación de distribución de vinos:

- **Capa 1 — Google Form:** Los vendedores completan un formulario desde el celular después de cada visita.
- **Capa 2 — Google Sheet:** Las respuestas caen automáticamente en un Sheet que actúa como base de datos.
- **Capa 3 — Dashboard React:** Una app web lee el Sheet como CSV público y presenta los datos con filtros y gráficos.

El caso de uso principal es la reunión de gestión semanal (viernes, o lunes si se reprograma).

---

## 2. El equipo comercial

| Vendedor | Zona | Observaciones |
|----------|------|---------------|
| Javier | Zona A1 | Más activo. ~73 Nuevos PDV, 6 ventas |
| Karen | Zona B1 (verificar — apareció en A2 en datos recientes) | 12 Nuevos PDV en abril 2026, 1 venta |
| Daniel | Zona B1 | 1 pedido, 2 relevamientos. También es el administrador del sistema |

**Zonas de cobertura definidas:** A1, A2, A3, A4, A5, B1  
**Pendiente resolver:** Si Karen pasó formalmente de B1 a otra zona, si B1 sigue cubierta, y si los filtros del dashboard reflejan las asignaciones reales.

---

## 3. Catálogo de productos

**Val Sud:**
- Red Blend Magnum 1125ml
- Red Blend Classic 750ml
- Gran Malbec 750ml
- Bonarda Malbec 750ml
- Bonarda Syrah 750ml

**El Halcón del Defe:**
- Tinto Clásico 1125ml
- Tinto Patero 1125ml

**Competidores relevados:** Viñas de Balbo, Hormiga Negra Malbec, Prófugo Malbec

---

## 4. Fuente de datos

### Google Form — "REPORTE VENDEDORES"

- URL edición: https://docs.google.com/forms/d/1CxR9THKaaLu9r0Bx8eQY4LvjSYhSXPSptToaoHMZdlw/edit
- 14 secciones, 3 rutas según tipo de visita
- ~154 respuestas al 12/04/2026

### Google Sheet

- ID: `1W7xhwB_zBF3sxOiCAN_Ub7KYNPPCD6pMzZ3AOmfNf4A`
- URL: https://docs.google.com/spreadsheets/d/1W7xhwB_zBF3sxOiCAN_Ub7KYNPPCD6pMzZ3AOmfNf4A/

| Hoja | GID | Descripción |
|------|-----|-------------|
| Respuestas de formulario 1 | 401974834 | Datos crudos, ~114 columnas (A→DJ). NO TOCAR |
| Nuevos PDV | 1105327068 | FILTER por tipo = "Nuevo PDV" |
| Pedidos Tomados | (verificar GID) | FILTER por resultado = "Se tomó Pedido" |
| Inventario PDV | (verificar GID) | FILTER por resultado = "No se tomó Pedido" |
| KPI | 2092043606 | Indicadores calculados con COUNTIFS |
| Seguimiento de Ciclo | (verificar GID) | Ciclo de vida por PDV con alertas automáticas |

**Acceso CSV sin API Key:**
```
https://docs.google.com/spreadsheets/d/1W7xhwB_zBF3sxOiCAN_Ub7KYNPPCD6pMzZ3AOmfNf4A/export?format=csv&gid={GID}
```

---

## 5. Estructura del formulario (3 rutas)

### Ruta 1 — Nuevo PDV (Secciones 1–4)
Datos: Vendedor, Zona, Tipo PDV, Dirección, Link Maps (obligatorio), Nombre PDV, WhatsApp (obligatorio), ¿Compró?
- Si Compró = Sí → Sección 3: Productos 1–5, Cantidades, Forma de Pago, ¿Se entregó en el momento? (campo agregado 10/04/2026), Fecha de entrega (si no fue en el momento)
- Si Compró = No → Sección 4: Solo Razón de no compra. Sin precios competencia.
- **No hay Remito en Ruta 1. No hay precios de competencia en Ruta 1.**

### Ruta 2 — Pedido/Relevamiento (Secciones 5–8)
- Sección 5: Zona, Dirección, Link Maps, Nombre PDV, Resultado (bifurca)
- Sección 6 (Pedido Tomado): Productos 1–5, Cantidades, Fecha de entrega (campo nuevo 10/04/2026). Sin precios.
- Sección 7 (No Pedido): Solo inventario por niveles (<5 / >5 / >10 / No Se Vende). Sin precios.
- Sección 8 (ambas ramas): Precios propios + 3 competidores

### Ruta 3 — Entrega (Secciones 9–14)
- Sección 9: Zona, Dirección, Tipo PDV (obligatorio), Estado Entrega (Total / Parcial / No Entregado)
- Sección 10: ¿Se Cobró? + Remito Número (obligatorio — **solo aparece aquí**)
- Sección 11 (Cobró = Sí): Método de Cobro
- Sección 12 (Cobró = No): Razón No Cobro
- Sección 13: Cobro para entrega parcial
- Sección 14 (No Entregado): Motivo, Faltantes 1–2, Cantidades, Fecha Nueva

### Regla operativa — pedidos pull
Cuando un PDV llama o escribe para pedir producto, ese pedido DEBE registrarse en Ruta 2 antes de ir a Ruta 3. El patrón correcto siempre es: **Ruta 1 → Ruta 2 → Ruta 3**. Los casos históricos Ruta 1 → Ruta 3 sin Ruta 2 son pedidos pull no registrados.

---

## 6. Columnas clave del Sheet (índice base 0 para JS)

```
marcaTemporal:       col A  → 0
vendedor:            col B  → 1
tipoVisita:          col R  → 17
zona:                col F  → 5      (Nuevo PDV)
                     col AF → 31     (Pedido/Relev.)
                     col BN → 65     (Entrega)
tipoPDV:             col E  → 4
nombrePDV:           col S  → 18     (Nuevo PDV)
                     col BI → 60     (Pedido)
                     col BM → 64     (Entrega)
direccion:           col G  → 6      (Nuevo PDV)
                     col BL → 63     (Pedido)
                     col BP → 67     (Entrega)
compro:              col I  → 8
razonNoCompra:       col AB → 27
resultado:           col AG → 32
productos pedido:    cols AI(34), AK(36), AL(37), AM(38), CT(97)
cantidades pedido:   cols AJ(35), AN(39), AO(40), AP(41), CU(98)
inventario:          cols CK-CQ (86-92 aprox)
precioCompetidores:  cols BB(53), BC(54), BD(55)
precioValSud:        cols BF(57), BG(58), BH(59)
estadoEntrega:       col BQ → 68
seCobro:             col BR → 69
metodoCobro:         col BS → 70
seEntregoMomento:    col CI → 86
fechaProgramada:     col DC → 106
fechaEntregaPedido:  col AQ → 42
remito:              col DB → 105
formaPago:           col K  → 10
```

**Columnas nuevas del Form (10/04/2026):** Los índices exactos de `¿Se entregó en el momento?` y `Fecha posible de entrega` en Ruta 2 deben verificarse en el Sheet real después de que caigan respuestas con los campos nuevos.

**Columnas fantasma/artefacto (no usar):** AH(37), BK(66), DI(46), Q(16 — FotoFachada duplicada, usar AC=29), L(12 — precio duplicado, usar BB=53), AD(30 — duplicado, usar BC=54), AE(31 — duplicado, usar BD=55)

---

## 7. Hoja "Seguimiento de Ciclo"

Es la hoja analítica central que consolida las 3 rutas en una visión de ciclo de vida por PDV. Cada fila = un PDV único (clave: dirección de texto normalizada).

### Estructura de columnas (A–R)

| Col | Contenido | Fuente |
|-----|-----------|--------|
| A | Dirección (clave de cruce, UNIQUE de cols G+BL+BP) | Rutas 1+2+3 |
| B | Nombre PDV | Prioridad: Ruta 1 → 2 → 3 |
| C | Zona | Prioridad: Ruta 1 → 2 → 3 |
| D | Tipo PDV | Prioridad: Ruta 1 → 2 → 3 |
| E | Vendedor apertura | Solo Ruta 1 |
| F | Fecha primera visita | Solo Ruta 1 |
| G | Resultado primera visita | "Compró" o razón de rechazo |
| H | Vendedor pedido | Solo Ruta 2 |
| I | Fecha pedido | Solo Ruta 2 |
| J | Fecha entrega programada | Ruta 1 (col DC) o Ruta 2 (col AQ) |
| K | Vendedor entrega | Solo Ruta 3 |
| L | Fecha entrega real | Ruta 3 o Ruta 1 si entrega inmediata |
| M | Estado entrega | "Total"/"Entrega Total", "Parcial"/"Entrega Parcial", "No entregado"/"No se entregó" |
| N | ¿Se cobró? | Sí/No/Sin registro |
| O | Método de cobro | Contado/Transferencia/Ambos |
| P | **Estado del ciclo** | Output principal — ver matriz abajo |
| Q | Días en estado | Se actualiza diariamente con HOY() |
| R | **Alerta** | Output visual — ver matriz abajo |

### Matriz de estados (col P)

| Estado | Condición |
|--------|-----------|
| CLIENTE ACTIVO | Entrega Total + Cobro |
| ENTREGA SIN COBRO | Entrega Total + No cobró (🔴) |
| ENTREGA PARCIAL REPROGRAMADA | Entrega Parcial + Fecha nueva |
| ENTREGA PARCIAL SIN REPROGRAMAR | Entrega Parcial + Sin fecha nueva |
| ENTREGA FALLIDA | Estado = No entregado / No se entregó |
| ENTREGA INMEDIATA PENDIENTE | Compró en Ruta 1 + Sin Ruta 3 |
| ENTREGA VENCIDA | Fecha programada + >48hs sin entrega |
| ENTREGA PENDIENTE | Tiene pedido + Sin entrega, dentro de plazo |
| RECONFIRMAR | PDV dijo "Reconfirmar" u otra razón no terminal |
| DESCARTADO | "No vende Alcohol" o "No le interesa" |
| SIN ACTIVIDAD | Sin Ruta 1, 2 ni 3 |

### Matriz de alertas (col R)

| Alerta | Condición |
|--------|-----------|
| 🔴 URGENTE | Entrega vencida, fallida, sin cobro, parcial reprogramada vencida, o pendiente sin fecha >2 días |
| 🟡 SEGUIMIENTO | RECONFIRMAR con ≥7 días |
| ⏳ EN ESPERA | RECONFIRMAR con <7 días |
| 🟢 OK | CLIENTE ACTIVO o ENTREGA PENDIENTE en plazo |
| ⚫ DESCARTADO | Razón terminal |
| ⚪ SIN DATOS | Sin información suficiente |

### Distribución actual (post-auditoría 17/04/2026)
- 🟡 SEGUIMIENTO: 102 filas
- ⚪ SIN DATOS: 33 filas
- 🟢 OK: 28 filas
- ⚫ DESCARTADO: 16 filas
- 🔴 URGENTE: 7 filas
- Total: 186 PDV únicos

### Correcciones aplicadas en auditoría (17/04/2026)
1. Col P: `M2="Total"` → `O(M2="Total",M2="Entrega Total")` (y equivalentes para Parcial y No entregado)
2. Col N: SI.ERROR agregado alrededor del primer BUSCARV para evitar cortocircuito
3. Col R: Rama URGENTE agregada para ENTREGA PENDIENTE sin fecha con >2 días
4. Col P: Estado DESCARTADO agregado para razones terminales
5. Col R: Estado ⏳ EN ESPERA agregado para RECONFIRMAR <7 días
6. Col R: Umbral de SEGUIMIENTO corregido de `>7` a `>=7`

---

## 8. Dashboard — Arquitectura técnica

### Stack

| Componente | Tecnología |
|-----------|------------|
| Frontend | React + Vite |
| Estilos | Tailwind CSS |
| Gráficos | Recharts |
| Parsing CSV | papaparse |
| Íconos | Lucide React |
| Deploy | Vercel (plan Hobby, gratuito) |
| Testing | Vitest + React Testing Library |
| Color principal | #5C1A1A (vino oscuro) |

### Principios

- Sin backend: lee el Sheet directamente como CSV público
- Solo lectura: nunca escribe en el Sheet
- Móvil-first: diseñado para celular
- Sin login: accesible por URL
- Caché en memoria: 5 minutos, NUNCA en localStorage
- La semana empieza el lunes

### Estructura de carpetas

```
dipve/
├── src/
│   ├── components/
│   │   ├── layout/Header.jsx
│   │   ├── filters/PeriodFilter.jsx
│   │   ├── panels/
│   │   │   ├── VendedoresPanel.jsx
│   │   │   ├── NuevosPDVPanel.jsx
│   │   │   ├── PedidosPanel.jsx
│   │   │   ├── InventarioPanel.jsx
│   │   │   ├── PreciosPanel.jsx
│   │   │   └── EntregasPanel.jsx
│   │   └── ui/KPICard.jsx, DataTable.jsx, LoadingSpinner.jsx
│   ├── hooks/useSheetData.js, usePeriodFilter.js
│   ├── utils/
│   │   ├── sheetParser.js
│   │   ├── dateUtils.js
│   │   ├── kpiCalculator.js
│   │   ├── filterUtils.js
│   │   ├── trendCalculator.js    (pendiente crear)
│   │   └── deliveryMatcher.js    (pendiente crear)
│   ├── constants/vendors.js, products.js, zones.js, sheetConfig.js
│   ├── App.jsx
│   └── main.jsx
├── DIPVE.md
├── PROGRESO.md
└── package.json
```

### Constantes del negocio

```javascript
// vendors.js
export const VENDORS = ['Javier', 'Karen', 'Daniel'];

// products.js
export const PRODUCTS = [
  'Val Sud Red Blend Magnum',
  'Val Sud Red Blend Classic',
  'Val Sud Gran Malbec',
  'Val Sud Bonarda Malbec',
  'Val Sud Bonarda Syrah',
  'El Halcón Tinto Clásico',
  'El Halcón Tinto Patero',
];

export const COMPETITORS = [
  'Viñas de Balbo',
  'Hormiga Negra Malbec',
  'Prófugo Malbec',
];

// zones.js
export const ZONES = ['Zona A1', 'Zona A2', 'Zona A3', 'Zona A4', 'Zona A5', 'Zona B1'];
```

### Textos exactos del Sheet (sensibles a mayúsculas)

```
Tipo de Visita: "Nuevo PDV", "Toma de Pedido / Relevamiento", "Entrega"
Resultado: "Se tomó Pedido", "No se tomó Pedido"
¿Compró?: "Sí" (con tilde), "No"
```

---

## 9. Estado de avance

### Completado ✅

- Google Form completo (14 secciones, 3 rutas)
- Conexión Form → Sheet operativa
- Hojas auxiliares con fórmulas FILTER (Nuevos PDV, Pedidos Tomados, Inventario PDV)
- Hoja KPI con indicadores básicos (COUNTIFS)
- Hoja Seguimiento de Ciclo completa y auditada
- Correcciones al KPI (Daniel faltante, Karen formato %, conteo)
- Campo "Remito Número" en sección Entrega del Form
- Campos nuevos: "¿Se entregó en el momento?" (Ruta 1) y "Fecha posible de entrega" (Ruta 2)
- Documento DIPVE.md para Claude Code
- **Sesión 1:** Setup + datos + Panel Vendedores
- **Sesión 2:** Filtro período + Panel Nuevos PDV
- **Sesión 3:** Panel Pedidos + Panel Inventario
- **Sesión 4:** Panel Precios + Panel Entregas + diseño visual
- **Sesión 5:** Deploy en Vercel → https://dipve.vercel.app/

### Pendiente ⏳

**Sesión 6 — Tab Precios completo:**
- Verificar índices reales de columnas nuevas en el Sheet (post-10/04)
- `calcPreciosStats()` con promedio, mínimo y máximo por zona
- Reemplazar `PreciosPanel.jsx` con dos tablas (productos propios + competencia) desglosadas por zona
- Tabla 1: Producto | Zona A1 Prom/Mín/Máx | Zona B1 Prom/Mín/Máx | Relevamientos
- Tabla 2: Competidor con misma estructura
- Estado vacío: "Sin relevamientos de precios en el período seleccionado"

**Sesión 7 — Rediseño estructura:**
- Crear `trendCalculator.js`: `calcWeekDelta(data, metrica)` comparando semana actual vs anterior, `getLastNWeeks(data, n)` para gráficos de tendencia
- Barra de resumen ejecutivo (sticky): 4 tarjetas con Visitas | Conversión | Pedidos | Entregas + delta vs período anterior (↑↓ con color semafórico)
- Reorganizar de 5 tabs a 4 tabs: **EQUIPO | VENTAS | PRECIOS | PEDIDOS Y ENTREGAS**
- Tab EQUIPO: Tabla comparativa con mini-barras de progreso + gráfico de línea tendencia últimas 4 semanas + eficiencia por zona
- Tab VENTAS: Embudo visual (Visitados → Interesados → Compraron) + razones de rechazo + ticket promedio + ranking productos + distribución tipo PDV (torta)

**Sesión 8 — Seguimiento pedidos → entregas:**
- Crear `deliveryMatcher.js`: cruce pedidos-entregas por dirección normalizada (lowercase, sin tildes, sin espacios dobles). Tres niveles de confianza: exact | partial | none
- `PedidosEntregasPanel.jsx`: KPIs de ciclo (Total pedidos | Entregados | Pendientes | Vencidos) + tabla de pedidos ordenada por fecha + panel inventario integrado
- Tests unitarios con Vitest
- `git push` → redeploy automático

---

## 10. Decisiones de diseño importantes

- **Dirección de texto como clave de cruce, no link de Maps:** Los links cortos de Google Maps (`maps.app.goo.gl/XXXX`) generan códigos distintos cada vez que se copian. La dirección de texto es estable y se usa como clave primaria para cruzar pedidos con entregas.
- **El dashboard nunca oculta ambigüedad:** Los casos sin match no son errores, son PDV que necesitan verificación manual. Siempre se indica el nivel de confianza del cruce.
- **Fórmulas bugs vs data bugs:** Cuando Seguimiento de Ciclo muestra estados inesperados, la primera hipótesis es error de fórmula, no error de carga del vendedor.
- **Columnas artefacto son normales:** Google Forms genera columnas extra al editar preguntas. Se documentan y se ignoran, no son errores.
- **Registros de prueba (filas 2–6, feb 2026):** Se excluyen automáticamente al filtrar por fecha >= 01/03/2026.

---

## 11. Entorno de desarrollo

| Ítem | Detalle |
|------|---------|
| Computadora | MacBook Pro M1 Pro, macOS |
| Node.js | v16.9.1 |
| GitHub | Repositorio `dipve` |
| Vercel | Conectado a GitHub, plan Hobby gratuito |
| Google API Key | No se usa. Fuente: CSV público |

### Comandos

```bash
npm install          # Instalar dependencias
npm run dev          # Servidor local (http://localhost:5173)
npm run build        # Build producción
npm run test         # Tests
```

### Variables de entorno (.env, NO commitear)

```
VITE_SHEET_ID=1W7xhwB_zBF3sxOiCAN_Ub7KYNPPCD6pMzZ3AOmfNf4A
```

---

## 12. Relación con Distri Halcón

Distri Halcón es una empresa separada e independiente operando en Zona Sur (Florencio Varela). Daniel administra ambos sistemas pero los datos están completamente separados. Daniel puede ver los datos de Halcón; el socio de Halcón no puede ver los datos de Norte.

El dashboard de Halcón se desarrolla DESPUÉS de completar las sesiones 6–8 de Norte. Ver documento aparte `DIPVE_DISTRI_HALCON_CONTEXTO.md`.

---

## 13. Prompt de retomada

```
Lee este archivo de contexto completo antes de escribir cualquier código.

ENTORNO DE TRABAJO:
- MacBook Pro M1 Pro, macOS
- Node.js v16.9.1
- Sin API Key de Google. Usar EXCLUSIVAMENTE exportación CSV pública
- Color principal: #5C1A1A
- Proyecto existente en producción: https://dipve.vercel.app/

Basándote en este documento:
1. ¿Qué está completado y funcionando?
2. ¿Cuál es el próximo paso concreto (Sesión 6, 7 u 8)?
3. Proponé el plan de trabajo para esta sesión.

Esperá mi confirmación antes de arrancar.
```
