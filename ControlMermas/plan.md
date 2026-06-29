# Plan — ControlMermas

App SPA para registrar mermas (pérdidas de producto) y analizar patrones mediante algoritmos estadísticos/ML en JS vainilla. Sin dependencias externas. Datos en localStorage.

## Estructura

```
ControlMermas/
  index.html
  plan.md
  css/
    reset.css       — Normalización de estilos
    variables.css   — Variables CSS (colores, espaciado, fuentes)
    layout.css      — Layout (header, tabs, vistas, dashboard, tabla, grid)
    components.css  — Componentes (botones, cards, modales, formularios, badges)
    responsive.css  — Media queries + dark mode
  js/
    utils.js        — UUID, fechas, utilidades, formato moneda
    store.js        — Capa localStorage con prefijo ctrlmer_
    models.js       — Fábricas, constantes (categorías, causas, horas, deptos), 20 mermas preset
    charts.js       — Canvas API (dona + barras con leyenda)
    registro.js     — CRUD mermas con filtros
    dashboard.js    — Cards resumen + gráficos (dona categoría, barras tendencia)
    analisis.js     — 6 algoritmos ML/estadísticos
    app.js          — Orquestación IIFE + 3 tabs + data:change
```

## Modelo de Datos

**Merma**: id, producto, categoria, cantidad, unidad, valor, fecha, hora, causa, departamento, notas, fechaCreacion

Categorías: Lácteos, Carnes, Verduras/Frutas, Panadería, Envasados, Bebidas, Limpieza, Otro
Causas: Vencimiento, Sobreproducción, Daño/Falla, Robo, Manejo inadecuado, Otro
Horas: Mañana, Tarde, Noche
Departamentos: Cocina, Bodega, Piso de venta, Recepción

## Algoritmos ML / Análisis

| Algoritmo | Método | Output |
|-----------|--------|--------|
| Días críticos | Agrupación por día semana + promedio valor | Ranking top 3 + detección patrón semanal |
| Correlación causa-categoría | Tabla contingencia + umbral 35% | "En Lácteos, 60% es Vencimiento" |
| Tendencia mensual | Regresión lineal (mínimos cuadrados) | ↗ Aumenta / ↘ Disminuye / → Estable + proyección 3 meses |
| Anomalías | IQR (Q3 + 1.5×IQR) | Lista eventos con valor superior al umbral |
| Pronóstico | Media móvil simple (3 meses) | Valor estimado próximo mes |
| Factor horario | Distribución por turno | Mañana/Tarde/Noche, detección concentración >45% |

## Vistas (3 tabs)

### Dashboard
- 4 cards: total mermas, valor total, producto más crítico, causa principal
- Gráfico dona: pérdidas por categoría
- Gráfico barras: tendencia mensual

### Registro
- Tabla de mermas con filtros (categoría, causa, rango fecha)
- Modal CRUD con todos los campos
- Editar/eliminar por fila

### Análisis
- Grid de 6 cards de insights ML
- Cada card con icono, título y análisis en lenguaje natural

## Presets
20 mermas de ejemplo con patrones intencionales (lácteos→vencimiento los viernes, panadería→sobreproducción findes, carnes→manejo inadecuado) para que los algoritmos muestren resultados desde el primer inicio.
