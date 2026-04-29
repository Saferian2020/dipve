# DIPVE — Pestaña Vendedores

## 1. Decisión de cambio de estructura del dashboard

Se decidió abandonar la estructura de pestañas anteriormente indicada en otros archivos de la carpeta `docs/`.

La nueva estructura del dashboard DIPVE buscará organizar la información comercial en pestañas más claras, orientadas a distintos niveles de análisis y uso operativo.

La nueva estructura general propuesta para el dashboard es:

1. **Vendedores**
2. **Clientes**
3. **Inteligencia Comercial**
4. **Inventarios PDV**
5. **Seguimiento**

La implementación comenzará por la pestaña **Vendedores**, ya que es la sección prioritaria para el informe semanal con el equipo comercial.

Esta pestaña tiene como objetivo medir la actividad, productividad, conversión y resultados comerciales de cada vendedor, permitiendo comparar períodos y vendedores de forma clara.

---

## 2. Objetivo de la pestaña Vendedores

La pestaña **Vendedores** debe permitir responder las siguientes preguntas:

- ¿Cuántas visitas hizo cada vendedor?
- ¿Cumplió el objetivo mínimo de visitas?
- ¿Qué tipo de visitas realizó?
- ¿Qué porcentaje de visitas terminó en compra?
- ¿Cuántas cajas vendió?
- ¿Cuál fue el ticket promedio?
- ¿Qué clientes compraron?
- ¿Cómo se compara la performance entre vendedores?
- ¿Cómo evoluciona la performance por período?

La pestaña debe estar pensada para una lectura rápida en una reunión semanal con vendedores y responsables comerciales.

---

## 3. Filtros generales

La pestaña debe contar con filtros generales ubicados en la parte superior.

### 3.1 Filtro de período

Opciones:

- Día anterior
- Últimos 5 días
- Último mes
- Rango personalizado

Este filtro afecta a todos los bloques de la pestaña, excepto el bloque **Modo Comparativo**.

### 3.2 Filtro de vendedor

Opciones:

- Todos
- Javier
- Karen
- Daniel

Este filtro afecta a los bloques operativos de la pestaña, excepto el bloque **Modo Comparativo**, que tendrá sus propios selectores internos.

En el bloque **Comparativa entre vendedores**, si se selecciona un vendedor específico, no se deben ocultar los demás vendedores. La tabla debe seguir mostrando todos los vendedores, pero debe resaltar visualmente el vendedor seleccionado.

---

## 4. Bloque 1 — Modo Comparativo

### 4.1 Objetivo del bloque

El bloque **Modo Comparativo** tiene como objetivo comparar la performance de los vendedores a través del tiempo.

Este bloque debe permitir ver:

- evolución por vendedor;
- comparación entre vendedores;
- comparación entre períodos fijos;
- comportamiento de indicadores clave.

### 4.2 Regla de filtros

Este bloque **no debe ser afectado por el filtro general de período**.

Debe trabajar siempre con períodos fijos:

- Día anterior
- Últimos 5 días
- Último mes

Tampoco debe depender automáticamente del filtro general de vendedor. En su lugar, tendrá un selector interno propio para la tabla.

---

### 4.3 Tabla comparativa por vendedor

La tabla debe tener un selector interno por vendedor.

Opciones del selector interno:

- Todos
- Javier
- Karen
- Daniel

#### Caso A — Selector en “Todos”

Si el selector está en **Todos**, la tabla debe mostrar todos los vendedores y todos los indicadores.

Columnas:

| Vendedor | Indicador | Día anterior | Últimos 5 días | Último mes |
|---|---:|---:|---:|---:|

Indicadores a mostrar para cada vendedor:

- Visitas totales
- Objetivo
- Diferencia
- Conversión
- Cajas vendidas
- Ticket promedio

Ejemplo visual:

| Vendedor | Indicador | Día anterior | Últimos 5 días | Último mes |
|---|---:|---:|---:|---:|
| Javier | Visitas totales | 25 | 135 | 520 |
| Javier | Objetivo | 25 | 125 | 500 |
| Javier | Diferencia | 0 | +10 | +20 |
| Javier | Conversión | 31% | 29% | 27% |
| Javier | Cajas vendidas | 14 | 80 | 310 |
| Javier | Ticket promedio | $28.500 | $29.700 | $27.900 |
| Karen | Visitas totales | 18 | 110 | 430 |
| Karen | Objetivo | 25 | 125 | 500 |
| Karen | Diferencia | -7 | -15 | -70 |
| Karen | Conversión | 25% | 24% | 26% |
| Karen | Cajas vendidas | 9 | 60 | 250 |
| Karen | Ticket promedio | $27.000 | $28.000 | $28.400 |
| Daniel | Visitas totales | 30 | 145 | 560 |
| Daniel | Objetivo | 25 | 125 | 500 |
| Daniel | Diferencia | +5 | +20 | +60 |
| Daniel | Conversión | 35% | 34% | 32% |
| Daniel | Cajas vendidas | 18 | 95 | 360 |
| Daniel | Ticket promedio | $30.000 | $31.000 | $30.500 |

#### Caso B — Selector en un vendedor específico

Si el selector interno está en un vendedor específico, por ejemplo **Javier**, la tabla debe mostrar todos los indicadores de ese vendedor por período.

Ejemplo:

| Vendedor | Indicador | Día anterior | Últimos 5 días | Último mes |
|---|---:|---:|---:|---:|
| Javier | Visitas totales | 25 | 135 | 520 |
| Javier | Objetivo | 25 | 125 | 500 |
| Javier | Diferencia | 0 | +10 | +20 |
| Javier | Conversión | 31% | 29% | 27% |
| Javier | Cajas vendidas | 14 | 80 | 310 |
| Javier | Ticket promedio | $28.500 | $29.700 | $27.900 |

---

### 4.4 Gráfico comparativo

El gráfico del bloque **Modo Comparativo** debe tener un selector interno por indicador.

Opciones del selector:

- Visitas totales
- Objetivo
- Diferencia
- Conversión
- Cajas vendidas
- Ticket promedio

El gráfico debe mostrar una sola métrica por vez para evitar mezclar escalas distintas.

Estructura del gráfico:

- Eje X: períodos fijos.
  - Día anterior
  - Últimos 5 días
  - Último mes
- Eje Y: valor del indicador seleccionado.
- Líneas: una línea por vendedor.
  - Javier
  - Karen
  - Daniel

Ejemplo: si se selecciona **Conversión**, el gráfico debe mostrar la evolución de la conversión de cada vendedor en los tres períodos fijos.

No se deben mostrar todos los indicadores como curvas simultáneas porque mezclan unidades distintas, como visitas, porcentajes, cajas y pesos.

---

## 5. Bloque 2 — Resumen visual de visitas

### 5.1 Objetivo del bloque

Este bloque debe mostrar rápidamente la cantidad total de visitas del período seleccionado y su distribución por tipo de visita.

### 5.2 Regla de filtros

Este bloque se afecta por:

- filtro general de período;
- filtro general de vendedor.

### 5.3 Cálculo de visitas totales

La visita total debe incluir todo registro presencial del vendedor.

La fórmula es:

```text
Visitas totales = Nuevo PDV + Pedido/Relevamiento + Entrega
```

No se debe incluir una categoría “Otros”.

### 5.4 Estructura visual

Usar una grilla de 4 columnas.

- El total de visitas ocupa 3 columnas.
- El gráfico de torta ocupa la columna derecha.
- La torta puede ocupar visualmente dos filas.

Estructura conceptual:

```text
┌──────────────────────────────────────────────┬──────────────┐
│ VISITAS TOTALES                              │              │
│ 135                                          │              │
│ Nuevo PDV + Pedido/Relevamiento + Entrega    │  Gráfico     │
├──────────────┬──────────────┬──────────────┤  de torta    │
│ Nuevo PDV    │ Pedido/Rel.  │ Entrega      │              │
│ 45           │ 70           │ 20           │              │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

### 5.5 Gráfico de torta

El gráfico de torta debe mostrar únicamente:

- Nuevo PDV
- Pedido/Relevamiento
- Entrega

El gráfico de torta no debe incluir visitas totales, ya que las visitas totales son la suma de esas categorías.

---

## 6. Bloque 3 — Objetivo mínimo de visitas

### 6.1 Objetivo del bloque

Este bloque debe mostrar si el vendedor o el equipo cumplieron el objetivo mínimo de visitas.

### 6.2 Regla de filtros

Este bloque se afecta por:

- filtro general de período;
- filtro general de vendedor.

### 6.3 Objetivo mínimo

Cada vendedor tiene como obligación visitar como mínimo 25 PDV por día.

La fórmula del objetivo es:

```text
Objetivo = 25 × cantidad de días del período seleccionado
```

Ejemplos:

- Día anterior: objetivo 25.
- Últimos 5 días: objetivo 125.
- Último mes: objetivo igual a 25 × días considerados del período.
- Rango personalizado: objetivo igual a 25 × cantidad de días del rango.

### 6.4 Diferencia contra objetivo

La fórmula es:

```text
Diferencia = visitas reales - objetivo
```

Ejemplos:

- Si visitó 15 PDV en un día: diferencia = -10.
- Si visitó 30 PDV en un día: diferencia = +5.

### 6.5 Cumplimiento

La fórmula es:

```text
Cumplimiento = visitas reales / objetivo
```

Debe mostrarse como porcentaje.

### 6.6 Colores

- Diferencia positiva o igual a cero: verde.
- Diferencia negativa: rojo.

### 6.7 Estructura visual

```text
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ Objetivo     │ Visitas      │ Diferencia   │ Cumplimiento │
│ 125          │ 135          │ +10          │ 108%         │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

Debajo puede incluirse una barra de progreso horizontal de cumplimiento.

---

## 7. Bloque 4 — Conversión de visitas

### 7.1 Objetivo del bloque

Este bloque debe mostrar qué proporción de visitas terminó en compra.

### 7.2 Regla de filtros

Este bloque se afecta por:

- filtro general de período;
- filtro general de vendedor.

### 7.3 Fórmula de conversión

Se utilizará la conversión por visita.

La fórmula es:

```text
Conversión = visitas con compra / visitas totales
```

No se utilizará la conversión por PDV único en esta primera versión.

### 7.4 Estructura visual

```text
┌────────────────────┬────────────────────┬────────────────────┐
│ Visitas totales    │ Visitas con compra │ Conversión          │
│ 135                │ 42                 │ 31,1%               │
└────────────────────┴────────────────────┴────────────────────┘
```

### 7.5 Gráfico de barras por vendedor

Agregar un gráfico de barras titulado:

```text
Conversión por vendedor
```

Regla recomendada:

- Si el filtro general de vendedor está en “Todos”, mostrar todos los vendedores.
- Si el filtro general de vendedor está en un vendedor específico, mantener todos los vendedores visibles y resaltar el vendedor seleccionado.

Esto permite no perder la comparación entre vendedores.

---

## 8. Bloque 5 — Ticket promedio

### 8.1 Objetivo del bloque

Este bloque debe mostrar el ticket promedio de venta en valor monetario.

### 8.2 Regla de filtros

Este bloque se afecta por:

- filtro general de período;
- filtro general de vendedor.

### 8.3 Fuente de precios

Para calcular el ticket promedio se utilizará una hoja auxiliar en Google Sheets con los precios por producto.

No se deben agregar campos nuevos al Google Form para cargar precios.

La hoja auxiliar sugerida debe contener, como mínimo:

| SKU_ID | SKU_Nombre | Precio_caja |
|---|---|---:|

Esta decisión permite actualizar precios sin tocar el formulario ni modificar el código del dashboard cada vez que cambie un precio.

### 8.4 Fórmulas

```text
Venta total = cantidad de cajas × precio por caja
Ticket promedio = venta total / pedidos con compra
```

El dashboard necesita calcular internamente la venta total para obtener el ticket promedio.

### 8.5 Estructura visual

```text
┌────────────────────┬────────────────────┬────────────────────┐
│ Venta total        │ Pedidos con compra │ Ticket promedio    │
│ $ 1.250.000        │ 42                 │ $ 29.761           │
└────────────────────┴────────────────────┴────────────────────┘
```

Aunque el foco principal del bloque sea el ticket promedio, se recomienda mostrar también venta total y pedidos con compra porque explican de dónde surge el indicador.

---

## 9. Bloque 6 — Clientes que compraron

### 9.1 Objetivo del bloque

Este bloque debe mostrar los clientes que compraron dentro del período y vendedor seleccionados.

### 9.2 Regla de filtros

Este bloque se afecta por:

- filtro general de período;
- filtro general de vendedor.

### 9.3 Tabla

Columnas aprobadas:

- Vendedor
- Cliente / PDV
- Cajas
- Dirección

No incluir:

- Monto
- Fecha

La fecha no se incluye porque el período ya está determinado por el filtro general.

Ejemplo:

| Vendedor | Cliente / PDV | Cajas | Dirección |
|---|---|---:|---|
| Javier | Autoservicio X | 5 | Av. ... |
| Karen | Supermercado Y | 8 | Calle ... |

---

## 10. Bloque 7 — Comparativa entre vendedores

### 10.1 Objetivo del bloque

Este bloque debe comparar la performance de los vendedores dentro del período seleccionado.

### 10.2 Regla de filtros

Este bloque se afecta por el filtro general de período.

Respecto al filtro general de vendedor:

- Si el filtro está en “Todos”, se muestran todos los vendedores.
- Si el filtro está en un vendedor específico, se mantienen todos los vendedores visibles y se resalta visualmente el vendedor seleccionado.

Esto evita perder la comparación entre vendedores.

### 10.3 Tabla

Columnas aprobadas:

- Vendedor
- Visitas
- Objetivo
- Diferencia
- Conversión
- Cajas vendidas
- Venta total
- Ticket promedio

Ejemplo:

| Vendedor | Visitas | Objetivo | Diferencia | Conversión | Cajas vendidas | Venta total | Ticket promedio |
|---|---:|---:|---:|---:|---:|---:|---:|
| Javier | 135 | 125 | +10 | 31,1% | 80 | $ ... | $ ... |
| Karen | 110 | 125 | -15 | 25,4% | 60 | $ ... | $ ... |
| Daniel | 145 | 125 | +20 | 34,5% | 95 | $ ... | $ ... |

### 10.4 Colores

- Diferencia positiva o igual a cero: verde.
- Diferencia negativa: rojo.
- Vendedor seleccionado: resaltar la fila visualmente sin ocultar las demás.

---

## 11. Orden final de la página

La pestaña **Vendedores** debe quedar ordenada de la siguiente manera:

1. Filtros generales
2. Modo Comparativo
3. Resumen visual de visitas
4. Objetivo mínimo de visitas
5. Conversión de visitas
6. Ticket promedio
7. Clientes que compraron
8. Comparativa entre vendedores

---

## 12. Consideraciones importantes para implementación

### 12.1 No agregar campos al Google Form para precios

Los precios deben manejarse desde una hoja auxiliar de Google Sheets.

### 12.2 No incluir categoría “Otros” en tipo de visita

La distribución de tipo de visita debe limitarse a:

- Nuevo PDV
- Pedido/Relevamiento
- Entrega

### 12.3 No mezclar indicadores en un mismo gráfico de escala real

En el bloque **Modo Comparativo**, el gráfico debe mostrar un solo indicador por vez.

Motivo: los indicadores tienen unidades distintas, por ejemplo:

- visitas;
- porcentajes;
- cajas;
- pesos.

### 12.4 Mantener comparación entre vendedores

Cuando se seleccione un vendedor específico en filtros generales, los gráficos o tablas comparativas no deben perder la comparación general. En esos casos, se debe mantener a todos los vendedores visibles y resaltar el vendedor seleccionado.

### 12.5 Enfoque visual

El dashboard debe ser:

- claro;
- liviano;
- apto para reunión semanal;
- visualmente ordenado;
- fácil de leer por usuarios no técnicos;
- orientado a decisiones comerciales.

---

## 13. Estado de definición

La estructura funcional de la pestaña **Vendedores** queda aprobada para ser implementada en el dashboard DIPVE.

El próximo paso será preparar un prompt específico para CODEX con instrucciones de implementación técnica.
