const Analisis = {
  init() {
    this.render();
    document.addEventListener('data:change', () => this.render());
  },

  render() {
    const mermas = Store.getCollection('mermas');
    if (mermas.length === 0) {
      document.getElementById('analisis-container').innerHTML = `<div class="empty-state">
        <div class="empty-state__icon">🤖</div>
        <div class="empty-state__text">Registra mermas para ver el análisis predictivo y de patrones</div>
      </div>`;
      return;
    }

    document.getElementById('analisis-container').innerHTML = `
      <div class="analisis-grid">
        ${this._cardDiasCriticos(mermas)}
        ${this._cardCorrelacion(mermas)}
        ${this._cardTendencia(mermas)}
        ${this._cardAnomalias(mermas)}
        ${this._cardPronostico(mermas)}
        ${this._cardFactorHorario(mermas)}
      </div>
    `;
  },

  _cardDiasCriticos(mermas) {
    const dayNames = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const dayGroups = {};
    mermas.forEach((m) => {
      const d = new Date(m.fecha + 'T00:00:00');
      const day = d.getDay();
      dayGroups[day] = dayGroups[day] || { count: 0, total: 0 };
      dayGroups[day].count++;
      dayGroups[day].total += m.valor;
    });

    const ranked = Object.entries(dayGroups)
      .map(([day, info]) => ({ day: Number(day), ...info, prom: info.total / info.count }))
      .sort((a, b) => b.prom - a.prom);

    const top = ranked.slice(0, 3);

    return `<div class="insight-card">
      <div class="insight-card__header">
        <span class="insight-card__icon">📅</span>
        <span class="insight-card__title">Días Críticos</span>
      </div>
      <div class="insight-card__body">
        <p>Los días con mayor pérdida promedio son:</p>
        ${top.map((r, i) => `<p><strong>${i + 1}. ${dayNames[r.day]}</strong> — ${Utils.currency(Math.round(r.prom))} promedio por merma (${r.count} eventos)</p>`).join('')}
        ${ranked.length > 0 ? `<p style="margin-top:var(--space-sm);color:var(--color-text-secondary)">
          ${ranked[0].count > ranked[ranked.length - 1].count * 2
            ? '⚠️ El día más crítico duplica en eventos al día más bajo. Hay un <strong>patrón semanal</strong> claro.'
            : '📊 La distribución entre días es relativamente uniforme. No se detecta un patrón semanal fuerte.'}
        </p>` : ''}
      </div>
    </div>`;
  },

  _cardCorrelacion(mermas) {
    const cross = {};
    const catTotal = {};

    mermas.forEach((m) => {
      const key = m.categoria + '|' + m.causa;
      cross[key] = (cross[key] || 0) + 1;
      catTotal[m.categoria] = (catTotal[m.categoria] || 0) + 1;
    });

    const insights = [];
    Object.entries(catTotal).forEach(([cat, total]) => {
      const causas = {};
      Object.entries(cross).forEach(([key, count]) => {
        const [c, causa] = key.split('|');
        if (c === cat) causas[causa] = count;
      });
      const topCausa = Object.entries(causas).sort((a, b) => b[1] - a[1])[0];
      if (topCausa && (topCausa[1] / total) >= 0.35) {
        insights.push({ cat, causa: topCausa[0], pct: Math.round((topCausa[1] / total) * 100), total });
      }
    });

    const html = insights.length > 0
      ? insights.map((i) =>
        `<p>📌 <strong>${Models.getCategoriaName(i.cat)}</strong>: ${i.pct}% de las mermas son por <strong>${Models.getCausaName(i.causa)}</strong> (${i.total} eventos)</p>`
      ).join('')
      : '<p>📊 No se detectan correlaciones fuertes entre categoría y causa (umbral 35%).</p>';

    return `<div class="insight-card">
      <div class="insight-card__header">
        <span class="insight-card__icon">🔗</span>
        <span class="insight-card__title">Correlación Causa-Categoría</span>
      </div>
      <div class="insight-card__body">
        <p style="margin-bottom:var(--space-sm);color:var(--color-text-secondary)">Asociaciones fuertes encontradas:</p>
        ${html}
      </div>
    </div>`;
  },

  _cardTendencia(mermas) {
    const monthGroups = {};
    mermas
      .sort((a, b) => a.fecha.localeCompare(b.fecha))
      .forEach((m) => {
        const mes = m.fecha.substring(0, 7);
        monthGroups[mes] = (monthGroups[mes] || 0) + m.valor;
      });

    const months = Object.keys(monthGroups).sort();
    const values = months.map((m) => monthGroups[m]);

    if (values.length < 2) {
      return `<div class="insight-card">
        <div class="insight-card__header">
          <span class="insight-card__icon">📈</span>
          <span class="insight-card__title">Tendencia Mensual</span>
        </div>
        <div class="insight-card__body"><p>Se necesitan al menos 2 meses de datos para calcular la tendencia.</p></div>
      </div>`;
    }

    const n = values.length;
    const xMean = (n - 1) / 2;
    const yMean = values.reduce((s, v) => s + v, 0) / n;

    let num = 0, den = 0;
    values.forEach((y, i) => {
      num += (i - xMean) * (y - yMean);
      den += (i - xMean) ** 2;
    });

    const pendiente = den !== 0 ? num / den : 0;
    const prom = yMean;

    let trendIcon, trendCls, trendText;
    if (Math.abs(pendiente) < prom * 0.05) {
      trendIcon = '➡️';
      trendCls = 'trend-indicator--stable';
      trendText = 'Estable';
    } else if (pendiente > 0) {
      trendIcon = '🔴';
      trendCls = 'trend-indicator--up';
      trendText = '↑ En aumento';
    } else {
      trendIcon = '🟢';
      trendCls = 'trend-indicator--down';
      trendText = '↓ En disminución';
    }

    const cambioInterp = pendiente * 3;
    const direction = pendiente > 0 ? 'aumentando' : 'disminuyendo';
    const absPend = Math.abs(pendiente);

    return `<div class="insight-card">
      <div class="insight-card__header">
        <span class="insight-card__icon">📈</span>
        <span class="insight-card__title">Tendencia Mensual</span>
      </div>
      <div class="insight-card__body">
        <p><span class="trend-indicator ${trendCls}">${trendIcon} ${trendText}</span></p>
        <p>Las pérdidas están <strong>${direction}</strong> en ${Math.round(absPend)}/mes en promedio.
        ${cambioInterp > 0
          ? `En 3 meses podrían <strong class="danger">${direction} ~${Utils.currency(Math.round(cambioInterp))}</strong>.`
          : `En 3 meses podrían <strong class="success">${direction} ~${Utils.currency(Math.round(Math.abs(cambioInterp)))}</strong>.`
        }</p>
      </div>
    </div>`;
  },

  _cardAnomalias(mermas) {
    const valores = mermas.map((m) => m.valor).sort((a, b) => a - b);
    const n = valores.length;
    if (n < 4) {
      return `<div class="insight-card">
        <div class="insight-card__header">
          <span class="insight-card__icon">⚠️</span>
          <span class="insight-card__title">Detección de Anomalías</span>
        </div>
        <div class="insight-card__body"><p>Se necesitan al menos 4 registros para detectar anomalías.</p></div>
      </div>`;
    }

    const q1Idx = Math.floor(n * 0.25);
    const q3Idx = Math.floor(n * 0.75);
    const q1 = valores[q1Idx];
    const q3 = valores[q3Idx];
    const iqr = q3 - q1;
    const upperBound = q3 + 1.5 * iqr;

    const anomalias = mermas
      .filter((m) => m.valor > upperBound)
      .sort((a, b) => b.valor - a.valor);

    if (anomalias.length === 0) {
      return `<div class="insight-card">
        <div class="insight-card__header">
          <span class="insight-card__icon">✅</span>
          <span class="insight-card__title">Detección de Anomalías</span>
        </div>
        <div class="insight-card__body">
          <p>No se detectaron eventos anómalos. Todas las mermas están dentro del rango esperado.</p>
          <p style="color:var(--color-text-secondary);margin-top:var(--space-sm)">Umbral superior IQR: ${Utils.currency(Math.round(upperBound))}</p>
        </div>
      </div>`;
    }

    return `<div class="insight-card">
      <div class="insight-card__header">
        <span class="insight-card__icon">⚠️</span>
        <span class="insight-card__title">Detección de Anomalías</span>
      </div>
      <div class="insight-card__body">
        <p>Se detectaron <strong class="danger">${anomalias.length}</strong> eventos anómalos (valor > ${Utils.currency(Math.round(upperBound))}):</p>
        ${anomalias.slice(0, 5).map((a) => `
          <div class="anomaly-item">
            <span class="anomaly-item__product">${Utils.escapeHtml(a.producto)}</span>
            <span class="anomaly-item__value">${Utils.currency(a.valor)}</span>
          </div>
        `).join('')}
        ${anomalias.length > 5 ? `<p style="color:var(--color-text-secondary);margin-top:var(--space-xs)">... y ${anomalias.length - 5} más</p>` : ''}
      </div>
    </div>`;
  },

  _cardPronostico(mermas) {
    const monthGroups = {};
    mermas.forEach((m) => {
      const mes = m.fecha.substring(0, 7);
      monthGroups[mes] = (monthGroups[mes] || 0) + m.valor;
    });

    const months = Object.keys(monthGroups).sort();
    const values = months.map((m) => monthGroups[m]);

    if (values.length === 0) {
      return `<div class="insight-card">
        <div class="insight-card__header">
          <span class="insight-card__icon">🔮</span>
          <span class="insight-card__title">Pronóstico</span>
        </div>
        <div class="insight-card__body"><p>Sin datos para pronosticar.</p></div>
      </div>`;
    }

    const ventana = Math.min(3, values.length);
    const ultimos = values.slice(-ventana);
    const mediaMovil = Math.round(ultimos.reduce((s, v) => s + v, 0) / ventana);

    const totalMermas = mermas.length;
    const costoPromedio = mermas.reduce((s, m) => s + m.valor, 0) / totalMermas;
    const mermasEstimadas = Math.round(totalMermas / values.length);
    const estimadoAlterno = Math.round(mermasEstimadas * costoPromedio);

    return `<div class="insight-card">
      <div class="insight-card__header">
        <span class="insight-card__icon">🔮</span>
        <span class="insight-card__title">Pronóstico Mensual</span>
      </div>
      <div class="insight-card__body">
        <p>Para el próximo mes se estima:</p>
        <div class="forecast-value">${Utils.currency(mediaMovil)}</div>
        <p style="color:var(--color-text-secondary);margin-top:var(--space-xs)">
          Media móvil (${ventana} meses) · 
          ${mermasEstimadas} mermas estimadas · 
          ~${Utils.currency(Math.round(costoPromedio))} c/u
        </p>
      </div>
    </div>`;
  },

  _cardFactorHorario(mermas) {
    const hourGroups = { manana: 0, tarde: 0, noche: 0 };
    const hourValor = { manana: 0, tarde: 0, noche: 0 };

    mermas.forEach((m) => {
      if (hourGroups[m.hora] !== undefined) {
        hourGroups[m.hora]++;
        hourValor[m.hora] += m.valor;
      }
    });

    const total = Object.values(hourGroups).reduce((s, v) => s + v, 0);
    const horaNames = { manana: 'Mañana', tarde: 'Tarde', noche: 'Noche' };
    const ordered = ['manana', 'tarde', 'noche'];

    const topHora = ordered
      .map((h) => ({ id: h, count: hourGroups[h], total: hourValor[h], prom: total > 0 ? hourValor[h] / hourGroups[h] : 0 }))
      .sort((a, b) => b.count - a.count);

    return `<div class="insight-card">
      <div class="insight-card__header">
        <span class="insight-card__icon">🕐</span>
        <span class="insight-card__title">Factor Horario</span>
      </div>
      <div class="insight-card__body">
        <p>Distribución de mermas por turno:</p>
        ${ordered.map((h) => {
          const cnt = hourGroups[h];
          const val = hourValor[h];
          const pct = total > 0 ? Math.round((cnt / total) * 100) : 0;
          const isTop = topHora[0] && topHora[0].id === h;
          return `<p>${isTop ? '📌' : ''} <strong>${horaNames[h]}</strong>: ${cnt} eventos (${pct}%) — ${Utils.currency(Math.round(val))} acumulado</p>`;
        }).join('')}
        ${topHora.length > 0 && topHora[0].count > 0 && (topHora[0].count / total) > 0.45
          ? `<p style="margin-top:var(--space-sm);color:var(--color-text-secondary)">⚠️ El turno de <strong>${horaNames[topHora[0].id]}</strong> concentra más del 45% de las mermas. Revisar procesos en ese horario.</p>`
          : '<p style="margin-top:var(--space-sm);color:var(--color-text-secondary)">📊 La distribución entre turnos es balanceada.</p>'}
      </div>
    </div>`;
  },
};
