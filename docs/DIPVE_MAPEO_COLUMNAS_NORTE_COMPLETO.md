# DIPVE - Mapeo completo de columnas Norte

**Fecha de auditoria:** 27/04/2026  
**Fuente:** CSV publico `Respuestas de formulario 1` (`gid=401974834`)  
**Alcance:** solo lectura; no se modifico codigo, Form ni Sheet.  
**Nota:** `docs/DIPVE_AUDITORIA_FORM_SHEET_NORTE.md` no existe en esta copia local al momento de esta auditoria.

## Resumen ejecutivo

- El CSV real contiene **114 columnas**, desde **A** hasta **DJ**, y **238 respuestas** luego del encabezado.
- Las columnas de precios documentadas para Pedido/Relevamiento coinciden con headers reales: **BB, BC, BD, BF, BG, BH**.
- Las columnas de cobro de Entrega coinciden con el contexto: **BR = Se cobro?** y **BS = Metodo de Cobro de Entrega Total**.
- Producto 5/Cantidad 5 aparecen en mas de una ruta del Form. **CR/CS** se tratan como candidato ruta-especifico de Nuevo PDV y **CT/CU** como Producto 5/Cantidad 5 de Pedido/Relevamiento. No deben clasificarse como error por repeticion; al no tener valores reales, quedan como **validas sin evidencia real** o **requieren validacion contra Form** segun la ruta.
- El campo **Se entrego Producto en Nuevo PDV?** esta en **CI (86)** y **Fecha Programada Entrega a Nuevo PDV** esta en **DC (106)**. Para Pedido/Relevamiento, **Fecha Posible de Entrega Pedido** esta en **AQ (42)**.
- El dashboard actual no parsea CI, AQ, DC, DB, direcciones ni nombres de PDV; eso no rompe los paneles actuales, pero limita la Sesion 6/8 y el seguimiento pedido-entrega.
- Riesgo principal: inventario parece desalineado con el orden de `PRODUCTS`: CK es Classic y CL es Magnum, pero el codigo mapea CK al producto 0 (Magnum).

## Criterio de columnas repetidas por ruta del Form

En Google Forms, cuando hay secciones con bifurcaciones, el Sheet puede tener columnas con nombres iguales o muy parecidos porque pertenecen a rutas distintas. En esta auditoria, una repeticion de nombre **no se considera automaticamente error**.

Clasificacion aplicada:

- **valida ruta-especifica:** columna repetida que corresponde a una pregunta activa de una ruta distinta del Form.
- **valida sin evidencia real:** columna que corresponde a una pregunta activa, pero todavia no tiene valores en las respuestas reales del CSV.
- **requiere validacion contra Form:** columna cuyo nombre sugiere una pregunta activa, pero el contexto local no alcanza para confirmar ruta/seccion exacta.
- **columna fantasma:** columna vacia que no corresponde a una pregunta activa documentada o que aparece como artefacto historico del Form.

Aplicacion por bloque:

- **Ruta 1 - Nuevo PDV:** Producto/Cantidad 1-4 estan en J/U, V/W, X/Y, Z/AA. Producto/Cantidad 5 probablemente corresponde a CR/CS por continuidad funcional de la ruta, pero requiere validacion contra Form porque el contexto no documenta letras para Producto 5 de Ruta 1.
- **Ruta 2 - Pedido/Relevamiento:** Producto/Cantidad 1-5 estan en AI/AJ, AK/AN, AL/AO, AM/AP, CT/CU segun contexto y codigo. AL/AO, AM/AP y CT/CU son validas sin evidencia real si no tienen valores actuales.
- **Ruta 3 - Entrega:** Producto Faltante/Cantidad Faltante 1-5 estan en BU/BV, BW/BX, BY/BZ, CA/CB, CV/CW. Como el contexto escrito menciona Faltantes 1-2 pero el Sheet contiene 1-5, BU/BV y BW/BX se tratan como validas sin evidencia real; BY/BZ, CA/CB y CV/CW requieren validacion contra Form antes de usarse.
- Las columnas repetidas de precios no siguen este criterio de producto/cantidad: Ruta 1 no deberia relevar precios de competencia segun el contexto, por eso L/AD/AE requieren revision separada y no alimentan el Tab Precios.

## Tabla completa A..DJ

| JS | Col | Encabezado real | Tiene datos | Ruta probable del Form | Uso actual en dashboard | Archivo donde se usa | Estado |
|---:|:---:|---|:---:|---|---|---|---|
| 0 | A | Marca temporal | Si (238) | General | parse fecha; filtros y KPIs | sheetConfig.js; sheetParser.js; kpiCalculator.js | confirmado |
| 1 | B | Vendedor | Si (238) | General | parse vendedor; KPIs por vendedor | sheetConfig.js; sheetParser.js; kpiCalculator.js | confirmado |
| 2 | C | Fecha de Identificación y Desarrollo del Nuevo PV | No (0) | Ruta 1 - Nuevo PDV | No usado por dashboard | - | columna fantasma |
| 3 | D | Nombre del Nuevo Punto de Venta (Nombre Comercial) | No (0) | Ruta 1 - Nuevo PDV | No usado por dashboard | - | columna fantasma |
| 4 | E | Punto de Venta (Nuevo PDV) | Si (187) | Ruta 1 - Nuevo PDV | parse tipoPDV; Nuevos PDV | sheetConfig.js; sheetParser.js; kpiCalculator.js; NuevosPDVPanel.jsx | confirmado |
| 5 | F | Zona de Nuevo PDV | Si (187) | Ruta 1 - Nuevo PDV | No usado por dashboard | - | confirmado |
| 6 | G | Dirección PDV (Nuevo PDV) | Si (187) | Ruta 1 - Nuevo PDV | No usado por dashboard | - | confirmado |
| 7 | H | NombreDueño | Si (186) | Ruta 1 - Nuevo PDV | No usado por dashboard | - | confirmado |
| 8 | I | Compró Producto? | Si (187) | Ruta 1 - Nuevo PDV | parse compro; conversion | sheetConfig.js; sheetParser.js; kpiCalculator.js | confirmado |
| 9 | J | Producto 1 (Nuevo PDV) | Si (26) | Ruta 1 - Nuevo PDV | No usado por dashboard | - | confirmado |
| 10 | K | Forma de Pago (Nuevo PDV) | Si (26) | Ruta 1 - Nuevo PDV | No usado por dashboard | - | confirmado |
| 11 | L | Precio Viñas de Balbo | Si (26) | Ruta 1 - Nuevo PDV | No usado por dashboard | - | dudoso |
| 12 | M | Material POP requerido para la apertura [Exhibidor de Piso] | Si (26) | Ruta 1 - Nuevo PDV | No usado por dashboard | - | confirmado |
| 13 | N | Material POP requerido para la apertura [Material para Estantería (Stopper/Góndola)] | Si (26) | Ruta 1 - Nuevo PDV | No usado por dashboard | - | confirmado |
| 14 | O | Material POP requerido para la apertura [Afiches/Pósters Ingreso] | Si (26) | Ruta 1 - Nuevo PDV | No usado por dashboard | - | confirmado |
| 15 | P | Material POP requerido para la apertura [Degustaciones] | Si (26) | Ruta 1 - Nuevo PDV | No usado por dashboard | - | confirmado |
| 16 | Q | FotoFachada | No (0) | Ruta 1 - Nuevo PDV | No usado por dashboard | - | columna fantasma |
| 17 | R | Tipo de Visita | Si (237) | General | parse tipoVisita; todos los paneles | sheetConfig.js; sheetParser.js; kpiCalculator.js | confirmado |
| 18 | S | Nombre PDV (Nuevo PDV) | Si (187) | Ruta 1 - Nuevo PDV | No usado por dashboard | - | confirmado |
| 19 | T | WhatsApp | Si (138) | Ruta 1 - Nuevo PDV | No usado por dashboard | - | confirmado |
| 20 | U | Cantidad 1 (Nuevo PDV) | Si (26) | Ruta 1 - Nuevo PDV | No usado por dashboard | - | confirmado |
| 21 | V | Producto 2 (Nuevo PDV) | Si (10) | Ruta 1 - Nuevo PDV | No usado por dashboard | - | confirmado |
| 22 | W | Cantidad 2 (Nuevo PDV) | Si (8) | Ruta 1 - Nuevo PDV | No usado por dashboard | - | confirmado |
| 23 | X | Producto 3 (Nuevo PDV) | No (0) | Ruta 1 - Nuevo PDV | No usado por dashboard | - | valida sin evidencia real |
| 24 | Y | Cantidad 3 (Nuevo PDV) | No (0) | Ruta 1 - Nuevo PDV | No usado por dashboard | - | valida sin evidencia real |
| 25 | Z | Producto 4 (Nuevo PDV) | No (0) | Ruta 1 - Nuevo PDV | No usado por dashboard | - | valida sin evidencia real |
| 26 | AA | Cantidad 4 (Cajas) | No (0) | Ruta 1 - Nuevo PDV | No usado por dashboard | - | valida sin evidencia real |
| 27 | AB | Razón de No Compra | Si (163) | Ruta 1 - Nuevo PDV | parse razonNoCompra; Nuevos PDV | sheetConfig.js; sheetParser.js; kpiCalculator.js; NuevosPDVPanel.jsx | confirmado |
| 28 | AC | FotoFachada | No (0) | Ruta 1 - Nuevo PDV | No usado por dashboard | - | columna fantasma |
| 29 | AD | Precio Hormiga Negra Malbec | No (0) | Ruta 1 - Nuevo PDV | No usado por dashboard | - | columna fantasma |
| 30 | AE | Precio Profugo Malbec | No (0) | Ruta 1 - Nuevo PDV | No usado por dashboard | - | columna fantasma |
| 31 | AF | Zona de Pedido/Relevamiento | Si (35) | Ruta 2 - Pedido/Relevamiento | parse zona para Pedido/Relevamiento; Precios | sheetConfig.js; sheetParser.js; kpiCalculator.js; PreciosPanel.jsx | confirmado |
| 32 | AG | Resultado Pedido | Si (35) | Ruta 2 - Pedido/Relevamiento | parse resultado; Pedidos | sheetConfig.js; sheetParser.js; kpiCalculator.js; PedidosPanel.jsx | confirmado |
| 33 | AH | Columna 37 | No (0) | Ruta 2 - Pedido/Relevamiento | No usado por dashboard | - | columna fantasma |
| 34 | AI | Producto 1 | Si (25) | Ruta 2 - Pedido/Relevamiento | productoPedido[0]; Pedidos | sheetConfig.js; sheetParser.js; kpiCalculator.js; PedidosPanel.jsx | confirmado |
| 35 | AJ | Cantidad 1 (Cajas) | Si (25) | Ruta 2 - Pedido/Relevamiento | cantidadPedida[0]; Pedidos | sheetConfig.js; sheetParser.js; kpiCalculator.js; PedidosPanel.jsx | confirmado |
| 36 | AK | Producto 2 | Si (7) | Ruta 2 - Pedido/Relevamiento | productoPedido[1]; Pedidos | sheetConfig.js; sheetParser.js; kpiCalculator.js; PedidosPanel.jsx | confirmado |
| 37 | AL | Producto 3 | No (0) | Ruta 2 - Pedido/Relevamiento | productoPedido[2]; Pedidos | sheetConfig.js; sheetParser.js; kpiCalculator.js; PedidosPanel.jsx | valida sin evidencia real |
| 38 | AM | Producto 4 | No (0) | Ruta 2 - Pedido/Relevamiento | productoPedido[3]; Pedidos | sheetConfig.js; sheetParser.js; kpiCalculator.js; PedidosPanel.jsx | valida sin evidencia real |
| 39 | AN | Cantidad 2 (Cajas) | Si (7) | Ruta 2 - Pedido/Relevamiento | cantidadPedida[1]; Pedidos | sheetConfig.js; sheetParser.js; kpiCalculator.js; PedidosPanel.jsx | confirmado |
| 40 | AO | Cantidad 3 (Cajas) | No (0) | Ruta 2 - Pedido/Relevamiento | cantidadPedida[2]; Pedidos | sheetConfig.js; sheetParser.js; kpiCalculator.js; PedidosPanel.jsx | valida sin evidencia real |
| 41 | AP | Cantidad 4 (Cajas) | No (0) | Ruta 2 - Pedido/Relevamiento | cantidadPedida[3]; Pedidos | sheetConfig.js; sheetParser.js; kpiCalculator.js; PedidosPanel.jsx | valida sin evidencia real |
| 42 | AQ | Fecha Posible de Entrega Pedido | Si (23) | Ruta 2 - Pedido/Relevamiento | No usado por dashboard | - | dudoso |
| 43 | AR | Información Adicional (Nuevo PDV) | Si (63) | Ruta 2 - Pedido/Relevamiento | No usado por dashboard | - | confirmado |
| 44 | AS | Estado de Inventario de Producto 3 | No (0) | Ruta 2 - Pedido/Relevamiento | No usado por dashboard | - | columna fantasma |
| 45 | AT | Estado de Inventario Producto 1 | Si (1) | Ruta 2 - Pedido/Relevamiento | No usado por dashboard | - | dudoso |
| 46 | AU | Cantidad 1 (Cajas) | Si (1) | Ruta 2 - Pedido/Relevamiento | No usado por dashboard | - | dudoso |
| 47 | AV | Estado de Inventario Producto 2 | Si (1) | Ruta 2 - Pedido/Relevamiento | No usado por dashboard | - | dudoso |
| 48 | AW | Cantidad 2 (Cajas) | Si (1) | Ruta 2 - Pedido/Relevamiento | No usado por dashboard | - | dudoso |
| 49 | AX | Estado de Inventario Producto 3 | Si (1) | Ruta 2 - Pedido/Relevamiento | No usado por dashboard | - | dudoso |
| 50 | AY | Cantidad 3 (Cajas) | Si (1) | Ruta 2 - Pedido/Relevamiento | No usado por dashboard | - | dudoso |
| 51 | AZ | Cantidad 4 (Cajas) | No (0) | Ruta 2 - Pedido/Relevamiento | No usado por dashboard | - | columna fantasma |
| 52 | BA | Estado de Inventario Producto 4 | No (0) | Ruta 2 - Pedido/Relevamiento | No usado por dashboard | - | columna fantasma |
| 53 | BB | Precio Viñas de Balbo | Si (35) | Ruta 2 - Pedido/Relevamiento | precioCompetidores[0]; Precios | sheetConfig.js; sheetParser.js; kpiCalculator.js; PreciosPanel.jsx | dudoso |
| 54 | BC | Precio Hormiga Negra Malbec | Si (3) | Ruta 2 - Pedido/Relevamiento | precioCompetidores[1]; Precios | sheetConfig.js; sheetParser.js; kpiCalculator.js; PreciosPanel.jsx | dudoso |
| 55 | BD | Precio Profugo Malbec | Si (2) | Ruta 2 - Pedido/Relevamiento | precioCompetidores[2]; Precios | sheetConfig.js; sheetParser.js; kpiCalculator.js; PreciosPanel.jsx | dudoso |
| 56 | BE | Precio | No (0) | Ruta 2 - Pedido/Relevamiento | No usado por dashboard | - | columna fantasma |
| 57 | BF | Precio Val Sud Red Blend Magnum | Si (7) | Ruta 2 - Pedido/Relevamiento | precioValSud[0]; Precios | sheetConfig.js; sheetParser.js; kpiCalculator.js; PreciosPanel.jsx | dudoso |
| 58 | BG | Precio Val Sud Red Blend Classic | Si (3) | Ruta 2 - Pedido/Relevamiento | precioValSud[1]; Precios | sheetConfig.js; sheetParser.js; kpiCalculator.js; PreciosPanel.jsx | dudoso |
| 59 | BH | Precio Val Sud Red Blend Gran Malbec | Si (4) | Ruta 2 - Pedido/Relevamiento | precioValSud[2]; Precios | sheetConfig.js; sheetParser.js; kpiCalculator.js; PreciosPanel.jsx | dudoso |
| 60 | BI | Nombre PDV (Pedido/Relevamiento) | Si (35) | Ruta 2 - Pedido/Relevamiento | No usado por dashboard | - | confirmado |
| 61 | BJ | Punto de Venta Pedidos/Relev | Si (35) | Ruta 2 - Pedido/Relevamiento | No usado por dashboard | - | confirmado |
| 62 | BK | Columna 66 | No (0) | Ruta 2 - Pedido/Relevamiento | No usado por dashboard | - | columna fantasma |
| 63 | BL | Dirección Pedido/Relevamiento | Si (35) | Ruta 2 - Pedido/Relevamiento | No usado por dashboard | - | confirmado |
| 64 | BM | Nombre PDV (Entrega) | Si (16) | Ruta 3 - Entrega | No usado por dashboard | - | confirmado |
| 65 | BN | Zona de Entrega | Si (16) | Ruta 3 - Entrega | No usado por dashboard | - | confirmado |
| 66 | BO | Punto de Venta de Entrega | Si (16) | Ruta 3 - Entrega | No usado por dashboard | - | confirmado |
| 67 | BP | Dirección PDV para Entrega. | Si (16) | Ruta 3 - Entrega | No usado por dashboard | - | confirmado |
| 68 | BQ | Estado de Entrega | Si (16) | Ruta 3 - Entrega | estadoEntrega; Entregas | sheetConfig.js; sheetParser.js; kpiCalculator.js; EntregasPanel.jsx | confirmado |
| 69 | BR | Se cobró? | Si (16) | Ruta 3 - Entrega | seCobro; Entregas | sheetConfig.js; sheetParser.js; kpiCalculator.js; EntregasPanel.jsx | dudoso |
| 70 | BS | Método de Cobro de Entrega Total | Si (16) | Ruta 3 - Entrega | metodoCobro; Entregas | sheetConfig.js; sheetParser.js; kpiCalculator.js; EntregasPanel.jsx | dudoso |
| 71 | BT | Razón No cobro | No (0) | Ruta 3 - Entrega | No usado por dashboard | - | columna fantasma |
| 72 | BU | Producto Faltante 1 | No (0) | Ruta 3 - Entrega | No usado por dashboard | - | valida sin evidencia real |
| 73 | BV | Cantidad de Producto Faltante 1 | No (0) | Ruta 3 - Entrega | No usado por dashboard | - | valida sin evidencia real |
| 74 | BW | Producto Faltante 2 | No (0) | Ruta 3 - Entrega | No usado por dashboard | - | valida sin evidencia real |
| 75 | BX | Cantidad de Producto Faltante 2 | No (0) | Ruta 3 - Entrega | No usado por dashboard | - | valida sin evidencia real |
| 76 | BY | Producto Faltante 3 | No (0) | Ruta 3 - Entrega | No usado por dashboard | - | requiere validacion contra Form |
| 77 | BZ | Cantidad de Producto Faltante 3 | No (0) | Ruta 3 - Entrega | No usado por dashboard | - | requiere validacion contra Form |
| 78 | CA | Producto Faltante 4 | No (0) | Ruta 3 - Entrega | No usado por dashboard | - | requiere validacion contra Form |
| 79 | CB | Cantidad de Producto Faltante 4 | No (0) | Ruta 3 - Entrega | No usado por dashboard | - | requiere validacion contra Form |
| 80 | CC | Motivo de Entrega Parcial | No (0) | Ruta 3 - Entrega | No usado por dashboard | - | columna fantasma |
| 81 | CD | Hubo cobro en EntregaParcial?  | No (0) | Ruta 3 - Entrega | No usado por dashboard | - | columna fantasma |
| 82 | CE | Método Cobro de EntregaParcial | No (0) | Ruta 3 - Entrega | No usado por dashboard | - | columna fantasma |
| 83 | CF | Fecha Nueva de Entrega | No (0) | Ruta 3 - Entrega | No usado por dashboard | - | columna fantasma |
| 84 | CG | Motivo | No (0) | Ruta 3 - Entrega | No usado por dashboard | - | columna fantasma |
| 85 | CH | Entrega Total Reprogramada | No (0) | Ruta 3 - Entrega | No usado por dashboard | - | columna fantasma |
| 86 | CI | Se entregó Producto en Nuevo PDV? | Si (26) | Ruta 1 - Nuevo PDV | No usado por dashboard | - | dudoso |
| 87 | CJ | WhatsApp Dueño/Encargado | Si (26) | Ruta 1 - Nuevo PDV | No usado por dashboard | - | confirmado |
| 88 | CK | Estado de Inventario en PDV [VS Red Blend Classic] | Si (9) | Ruta 2 - Pedido/Relevamiento | inventario[0]; Inventario | sheetConfig.js; sheetParser.js; kpiCalculator.js; InventarioPanel.jsx | confirmado |
| 89 | CL | Estado de Inventario en PDV [VS Red Blend Magnum] | Si (9) | Ruta 2 - Pedido/Relevamiento | inventario[1]; Inventario | sheetConfig.js; sheetParser.js; kpiCalculator.js; InventarioPanel.jsx | confirmado |
| 90 | CM | Estado de Inventario en PDV [VS Gran Malbec] | Si (9) | Ruta 2 - Pedido/Relevamiento | inventario[2]; Inventario | sheetConfig.js; sheetParser.js; kpiCalculator.js; InventarioPanel.jsx | confirmado |
| 91 | CN | Estado de Inventario en PDV [VS Bonarda Malbec] | Si (9) | Ruta 2 - Pedido/Relevamiento | inventario[3]; Inventario | sheetConfig.js; sheetParser.js; kpiCalculator.js; InventarioPanel.jsx | confirmado |
| 92 | CO | Estado de Inventario en PDV [VS Bonarda Syrah] | Si (9) | Ruta 2 - Pedido/Relevamiento | inventario[4]; Inventario | sheetConfig.js; sheetParser.js; kpiCalculator.js; InventarioPanel.jsx | confirmado |
| 93 | CP | Estado de Inventario en PDV [Halcón Tinto Clásico] | Si (9) | Ruta 2 - Pedido/Relevamiento | inventario[5]; Inventario | sheetConfig.js; sheetParser.js; kpiCalculator.js; InventarioPanel.jsx | confirmado |
| 94 | CQ | Estado de Inventario en PDV [Halcón Tinto Patero] | Si (9) | Ruta 2 - Pedido/Relevamiento | inventario[6]; Inventario | sheetConfig.js; sheetParser.js; kpiCalculator.js; InventarioPanel.jsx | confirmado |
| 95 | CR | Producto 5 | No (0) | Ruta 1 - Nuevo PDV probable | No usado por dashboard | - | requiere validacion contra Form |
| 96 | CS | Cantidad 5 (Cajas) | No (0) | Ruta 1 - Nuevo PDV probable | No usado por dashboard | - | requiere validacion contra Form |
| 97 | CT | Producto 5 | No (0) | Ruta 2 - Pedido/Relevamiento | productoPedido[4]; Pedidos | sheetConfig.js; sheetParser.js; kpiCalculator.js; PedidosPanel.jsx | valida sin evidencia real |
| 98 | CU | Cantidad 5 (Cajas) | No (0) | Ruta 2 - Pedido/Relevamiento | cantidadPedida[4]; Pedidos | sheetConfig.js; sheetParser.js; kpiCalculator.js; PedidosPanel.jsx | valida sin evidencia real |
| 99 | CV | Producto Faltante 5 | No (0) | Ruta 3 - Entrega | No usado por dashboard | - | requiere validacion contra Form |
| 100 | CW | Cantidad de Producto Faltante 5 | No (0) | Ruta 3 - Entrega | No usado por dashboard | - | requiere validacion contra Form |
| 101 | CX | LINK GOOGLE MAPS (Nuevo PDV) | Si (181) | Ruta 1 - Nuevo PDV | No usado por dashboard | - | confirmado |
| 102 | CY | LINK GOOGLE MAPS (Pedido/Relevamiento) | Si (31) | Ruta 2 - Pedido/Relevamiento | No usado por dashboard | - | confirmado |
| 103 | CZ | LINK GOOGLE MAPS (Entrega) | Si (16) | Ruta 3 - Entrega | No usado por dashboard | - | confirmado |
| 104 | DA | Usa Teléfono? | Si (185) | Ruta 1 - Nuevo PDV | No usado por dashboard | - | confirmado |
| 105 | DB | Remito Número: | Si (16) | Ruta 3 - Entrega | No usado por dashboard | - | dudoso |
| 106 | DC | Fecha Programada Entrega a Nuevo PDV | Si (26) | Ruta 1 - Nuevo PDV | No usado por dashboard | - | dudoso |
| 107 | DD | Información Adicional | Si (5) | Ruta 2 - Pedido/Relevamiento | No usado por dashboard | - | confirmado |
| 108 | DE | Entrega Parcial Reprogramada | No (0) | Ruta 3 - Entrega | No usado por dashboard | - | columna fantasma |
| 109 | DF | Se cobró  | No (0) | Ruta 3 - Entrega | No usado por dashboard | - | columna fantasma |
| 110 | DG | Se entregó? | No (0) | Ruta 3 - Entrega | No usado por dashboard | - | columna fantasma |
| 111 | DH | Estado de Inventario Producto 1 [Fila 8] | No (0) | Sin ruta clara / artefacto | No usado por dashboard | - | columna fantasma |
| 112 | DI | Columna 46 | No (0) | Sin ruta clara / artefacto | No usado por dashboard | - | columna fantasma |
| 113 | DJ | Compró Producto? [El Halcón] | No (0) | Sin ruta clara / artefacto | No usado por dashboard | - | columna fantasma |

## Columnas confirmadas

A(0) Marca temporal, B(1) Vendedor, E(4) Punto de Venta (Nuevo PDV), F(5) Zona de Nuevo PDV, G(6) Dirección PDV (Nuevo PDV), H(7) NombreDueño, I(8) Compró Producto?, J(9) Producto 1 (Nuevo PDV), K(10) Forma de Pago (Nuevo PDV), M(12) Material POP requerido para la apertura [Exhibidor de Piso], N(13) Material POP requerido para la apertura [Material para Estantería (Stopper/Góndola)], O(14) Material POP requerido para la apertura [Afiches/Pósters Ingreso], P(15) Material POP requerido para la apertura [Degustaciones], R(17) Tipo de Visita, S(18) Nombre PDV (Nuevo PDV), T(19) WhatsApp, U(20) Cantidad 1 (Nuevo PDV), V(21) Producto 2 (Nuevo PDV), W(22) Cantidad 2 (Nuevo PDV), AB(27) Razón de No Compra, AF(31) Zona de Pedido/Relevamiento, AG(32) Resultado Pedido, AI(34) Producto 1, AJ(35) Cantidad 1 (Cajas), AK(36) Producto 2, AN(39) Cantidad 2 (Cajas), AR(43) Información Adicional (Nuevo PDV), BI(60) Nombre PDV (Pedido/Relevamiento), BJ(61) Punto de Venta Pedidos/Relev, BL(63) Dirección Pedido/Relevamiento, BM(64) Nombre PDV (Entrega), BN(65) Zona de Entrega, BO(66) Punto de Venta de Entrega, BP(67) Dirección PDV para Entrega., BQ(68) Estado de Entrega, CJ(87) WhatsApp Dueño/Encargado, CK(88) Estado de Inventario en PDV [VS Red Blend Classic], CL(89) Estado de Inventario en PDV [VS Red Blend Magnum], CM(90) Estado de Inventario en PDV [VS Gran Malbec], CN(91) Estado de Inventario en PDV [VS Bonarda Malbec], CO(92) Estado de Inventario en PDV [VS Bonarda Syrah], CP(93) Estado de Inventario en PDV [Halcón Tinto Clásico], CQ(94) Estado de Inventario en PDV [Halcón Tinto Patero], CX(101) LINK GOOGLE MAPS (Nuevo PDV), CY(102) LINK GOOGLE MAPS (Pedido/Relevamiento), CZ(103) LINK GOOGLE MAPS (Entrega), DA(104) Usa Teléfono?, DD(107) Información Adicional.

## Columnas dudosas con evidencia

### L (11) - Precio Viñas de Balbo

- Total no vacio: 26.
- Fila 7, 2/3/2026 16:53:43: `3300`
- Fila 10, 27/3/2026 11:26:11: `3500`
- Fila 31, 27/3/2026 15:45:25: `3500`
- Lectura: tiene datos, pero pertenece a Ruta 1/Nuevo PDV y el contexto dice que Ruta 1 no debe tener precios de competencia. No usar para Precios.

### BB (53) - Precio Viñas de Balbo

- Total no vacio: 35.
- Fila 2, 24/2/2026 13:52:44: `2500`
- Fila 3, 25/2/2026 17:45:53: `2500`
- Fila 4, 25/2/2026 18:03:28: `3000`
- Lectura: coincide con contexto y codigo como competidor 1. Los ejemplos iniciales son de febrero y quedan fuera del filtro actual del parser (`>= 01/03/2026`), pero la columna sigue teniendo datos posteriores.

### BC (54) - Precio Hormiga Negra Malbec

- Total no vacio: 3.
- Fila 53, 31/3/2026 12:55:21: `3100`
- Fila 109, 9/4/2026 10:05:18: `2700`
- Fila 153, 13/4/2026 11:34:17: `1`
- Lectura: coincide con contexto y codigo, pero hay muy pocos datos y un posible outlier `1`.

### BD (55) - Precio Profugo Malbec

- Total no vacio: 2.
- Fila 109, 9/4/2026 10:05:18: `2999`
- Fila 153, 13/4/2026 11:34:17: `1`
- Lectura: coincide con contexto y codigo, pero hay muy pocos datos y un posible outlier `1`.

### BF (57) - Precio Val Sud Red Blend Magnum

- Total no vacio: 7.
- Fila 2, 24/2/2026 13:52:44: `2200`
- Fila 3, 25/2/2026 17:45:53: `2600`
- Fila 5, 25/2/2026 19:48:06: `2500`
- Lectura: coincide con contexto y codigo como Val Sud 1. Parte de la evidencia temprana queda fuera del corte de marzo.

### BG (58) - Precio Val Sud Red Blend Classic

- Total no vacio: 3.
- Fila 53, 31/3/2026 12:55:21: `1800`
- Fila 109, 9/4/2026 10:05:18: `1850`
- Fila 136, 10/4/2026 10:58:55: `1850`
- Lectura: coincide con contexto y codigo.

### BH (59) - Precio Val Sud Red Blend Gran Malbec

- Total no vacio: 4.
- Fila 2, 24/2/2026 13:52:44: `3000`
- Fila 53, 31/3/2026 12:55:21: `2700`
- Fila 109, 9/4/2026 10:05:18: `1`
- Lectura: coincide con contexto y codigo, pero hay un posible outlier `1`.

### BR (69) - Se cobró?

- Total no vacio: 16.
- Fila 135, 10/4/2026 10:39:11: `Sí`
- Fila 146, 11/4/2026 11:44:57: `Sí`
- Fila 147, 11/4/2026 14:07:53: `Sí`
- Lectura: coincide con contexto y codigo para Entrega Total.

### BS (70) - Método de Cobro de Entrega Total

- Total no vacio: 16.
- Fila 135, 10/4/2026 10:39:11: `Contado`
- Fila 146, 11/4/2026 11:44:57: `Contado`
- Fila 147, 11/4/2026 14:07:53: `Transferencia`
- Lectura: coincide con contexto y codigo para Entrega Total.

### BT (71), CD (81), CE (82), DF (109) - Cobros alternativos/parciales

- BT `Razón No cobro`: 0 valores.
- CD `Hubo cobro en EntregaParcial?`: 0 valores.
- CE `Método Cobro de EntregaParcial`: 0 valores.
- DF `Se cobró`: 0 valores.
- Lectura: no hay evidencia real para validar cobros parciales/no cobro; no deben agregarse al dashboard sin una regla especifica.

### CR/CS y CT/CU - Producto 5 y Cantidad 5 por ruta

- CR (95) `Producto 5`: 0 valores.
- CS (96) `Cantidad 5 (Cajas)`: 0 valores.
- CT (97) `Producto 5`: 0 valores.
- CU (98) `Cantidad 5 (Cajas)`: 0 valores.
- Lectura: no se deben tratar como duplicado problematico solo por repetir nombre. El contexto y el codigo confirman **CT/CU** para Producto 5/Cantidad 5 de Ruta 2. **CR/CS** queda como candidato de Producto 5/Cantidad 5 de Ruta 1 y requiere validacion contra Form porque el contexto no documenta sus letras exactas.

### DB (105), DC (106), AQ (42), CI (86) - Ciclo de entrega

- DB `Remito Número:` tiene 16 valores; ejemplos: fila 135 `181`, fila 146 `186`, fila 147 `187`.
- DC `Fecha Programada Entrega a Nuevo PDV` tiene 26 valores; ejemplos: fila 7 `2/3/2026`, fila 10 `27/3/2026`, fila 31 `27/3/2026`.
- AQ `Fecha Posible de Entrega Pedido` tiene 23 valores; ejemplos: fila 136 `11/4/2026`, fila 144 `10/4/2026`, fila 145 `10/4/2026`.
- CI `Se entregó Producto en Nuevo PDV?` tiene 26 valores; ejemplos: fila 7 `Sí`, fila 10 `Sí`, fila 31 `Sí`.
- Lectura: las ubicaciones coinciden con el contexto, pero estos campos no estan parseados actualmente.

## Columnas fantasma

- C(2) `Fecha de Identificación y Desarrollo del Nuevo PV`: 0 valores. No usar salvo validacion manual del Form.
- D(3) `Nombre del Nuevo Punto de Venta (Nombre Comercial)`: 0 valores. No usar salvo validacion manual del Form.
- Q(16) `FotoFachada`: 0 valores. No usar salvo validacion manual del Form.
- AC(28) `FotoFachada`: 0 valores. No usar salvo validacion manual del Form.
- AD(29) `Precio Hormiga Negra Malbec`: 0 valores. No usar salvo validacion manual del Form.
- AE(30) `Precio Profugo Malbec`: 0 valores. No usar salvo validacion manual del Form.
- AH(33) `Columna 37`: 0 valores. No usar.
- AS(44) `Estado de Inventario de Producto 3`: 0 valores. No usar.
- AZ(51) `Cantidad 4 (Cajas)`: 0 valores. No usar.
- BA(52) `Estado de Inventario Producto 4`: 0 valores. No usar.
- BE(56) `Precio`: 0 valores. No usar.
- BK(62) `Columna 66`: 0 valores. No usar.
- BT(71) `Razón No cobro`: 0 valores. No usar hasta que existan casos reales de no cobro.
- BU(72) a BX(75) `Producto/Cantidad Faltante 1-2`: 0 valores, pero corresponden a preguntas activas documentadas de Ruta 3; validas sin evidencia real.
- BY(76) a CB(79) `Producto/Cantidad Faltante 3-4`: 0 valores; requieren validacion contra Form porque el contexto escrito menciona faltantes 1-2.
- CC(80) a CH(85): campos de parcial/no entrega/reprogramacion con 0 valores. No usar hasta que existan casos reales.
- CR(95) y CS(96): posible Producto 5/Cantidad 5 de Ruta 1. No clasificar como fantasma por repeticion; requiere validacion contra Form.
- CV(99) y CW(100): Producto/Cantidad Faltante 5 con 0 valores; requiere validacion contra Form antes de usarse.
- DE(108), DF(109), DG(110): campos finales vacios de entrega/cobro. No usar.
- DH(111), DI(112), DJ(113): artefactos finales vacios. No usar.

## Diferencias contra el contexto

- El contexto dice `inventario: CK-CQ (86-92 aprox)`, pero el CSV real ubica inventario en **CK-CQ = 88-94** porque CI/CJ quedaron antes. El codigo usa 88-94, correcto en indice, pero revisar orden de productos.
- El contexto marca **Q(16) FotoFachada duplicada, usar AC=29**; el CSV real tiene Q(16) y AC(28) como FotoFachada, ambos vacios. Ninguno esta en uso.
- El contexto menciona columnas fantasma **AD(30)** y **AE(31)**, pero con indices JS reales son **AD(29)** y **AE(30)**. Ambas estan vacias.
- El contexto documenta **precioCompetidores BB/BC/BD** y **precioValSud BF/BG/BH**. Coincide con headers reales y codigo.
- El contexto documenta **seCobro BR(69)** y **metodoCobro BS(70)**. Coincide con headers reales y codigo.
- El contexto documenta **remito DB(105)**, **fechaProgramada DC(106)** y **seEntregoMomento CI(86)**. Coincide con headers reales, pero no estan parseados por el dashboard.
- El contexto indica **Producto 5/Cantidad 5 CT/CU** para pedidos. El codigo coincide. El CSV tambien contiene **CR/CS** con los mismos encabezados; ahora se clasifica como posible campo ruta-especifico de Nuevo PDV, no como error por duplicacion.
- El codigo usa `COLS.zona = 31` como zona unica. Es correcto para Precios/Pedidos porque estos salen de Ruta 2, pero no representa zona de Nuevo PDV (F) ni Entrega (BN).
- `AR` se llama `Información Adicional (Nuevo PDV)` pero cae dentro del bloque fisico de Ruta 2. No se usa actualmente; conviene no depender de su ruta por posicion.

## Impacto sobre la Sesion 6

- Precios: la base de columnas para Sesion 6 es usable; BB/BC/BD y BF/BG/BH tienen headers correctos. La baja cantidad de datos en BC/BD/BG/BH y valores `1` obliga a mostrar estados vacios o limpiar outliers si se decide hacerlo.
- Cobros: BR/BS estan bien para Entrega Total. Si en el futuro hay entrega parcial, CD/CE y DF estan vacios/no usados y hay que definir regla de agregacion.
- Pedido producto 5: mantener CT/CU como config actual. Documentar CR/CS como posible Producto 5/Cantidad 5 de Ruta 1 pendiente de validacion contra Form, no como duplicado fantasma.
- Inventario: antes de ampliar vistas, corregir o confirmar el orden CK-CQ contra `PRODUCTS`, porque hoy CK=Classic y CL=Magnum parecen invertidos respecto del catalogo del codigo.
- Seguimiento pedido-entrega: para Sesion 8 se deberian parsear direcciones G/BL/BP, nombres S/BI/BM, links CX/CY/CZ, DB, AQ, CI y DC.

## Recomendacion concreta

1. Primero corregir/confirmar el orden de inventario CK-CQ frente a `PRODUCTS`, porque puede cambiar el significado de los KPIs actuales de Inventario.
2. Despues extender `sheetConfig.js`/`sheetParser.js` para exponer campos de ciclo: direcciones, nombres PDV, remito, fechas programadas y entrega inmediata.
3. Mantener precios en BB/BC/BD/BF/BG/BH para Sesion 6, pero agregar validacion de outliers si valores como `1` no son pruebas deliberadas.
4. Mantener Producto 5/Cantidad 5 de Pedido/Relevamiento en CT/CU. Validar CR/CS contra el Form antes de decidir si debe mapearse como Producto 5/Cantidad 5 de Nuevo PDV.
