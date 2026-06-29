const Dashboard = {
  init() {
    this.render();
    document.addEventListener('data:change', () => this.render());
  },

  render() {
    const mermas = Store.getCollection('mermas');

    if (mermas.length === 0) {
      document.getElementById('dashboard-summary').innerHTML = `
        <div class="card"><div class="card__label">Total Mermas</div><div class="card__value">0</div></div>
        <div class="card"><div class="card__label">Valor Total</div><div class="card__value">$0</div></div>
        <div class="card"><div class="card__label">Producto Crítico</div><div class="card__value">—</div></div>
        <div class="card"><div class="card__label">Causa Principal</div><div class="card__value">—</div></div>`;
      document.getElementById('chart-categoria').parentElement.innerHTML = '<canvas id="chart-categoria"></canvas><div class="empty-state"><div class="empty-state__text">Sin datos</div></div>';
      document.getElementById('chart-tendencia').parentElement.innerHTML = '<canvas id="chart-tendencia"></canvas><div class="empty-state"><div class="empty-state__text">Sin datos</div></div>';
      return;
    }

    const totalMermas = mermas.length;
    const valorTotal = mermas.reduce((s, m) => s + m.valor, 0);

    const prodCount = {};
    mermas.forEach((m) => {
      prodCount[m.producto] = (prodCount[m.producto] || 0) + m.valor;
    });
    const prodCritico = Object.entries(prodCount).sort((a, b) => b[1] - a[1])[0];

    const causaCount = {};
    mermas.forEach((m) => {
      causaCount[m.causa] = (causaCount[m.causa] || 0) + 1;
    });
    const causaTop = Object.entries(causaCount).sort((a, b) => b[1] - a[1])[0];

    document.getElementById('dashboard-summary').innerHTML = `
      <div class="card">
        <div class="card__label">Total Mermas</div>
        <div class="card__value card__value--danger">${totalMermas}</div>
      </div>
      <div class="card">
        <div class="card__label">Valor Total</div>
        <div class="card__value card__value--primary">${Utils.currency(valorTotal)}</div>
        <div class="card__sub">Promedio ${Utils.currency(Math.round(valorTotal / totalMermas))} por merma</div>
      </div>
      <div class="card">
        <div class="card__label">Producto + Crítico</div>
        <div class="card__value card__value--danger" style="font-size:var(--font-size-lg)">${Utils.escapeHtml(prodCritico ? prodCritico[0] : '—')}</div>
        <div class="card__sub">${prodCritico ? Utils.currency(prodCritico[1]) + ' en pérdidas' : ''}</div>
      </div>
      <div class="card">
        <div class="card__label">Causa Principal</div>
        <div class="card__value card__value--warning" style="font-size:var(--font-size-lg)">${causaTop ? Models.getCausaName(causaTop[0]) : '—'}</div>
        <div class="card__sub">${causaTop ? causaTop[1] + ' eventos (' + Math.round((causaTop[1] / totalMermas) * 100) + '%)' : ''}</div>
      </div>
    `;

    this._renderCategoriaChart(mermas);
    this._renderTendenciaChart(mermas);
  },

  _renderCategoriaChart(mermas) {
    const groups = {};
    mermas.forEach((m) => {
      groups[m.categoria] = (groups[m.categoria] || 0) + m.valor;
    });

    const labels = [];
    const data = [];
    const colors = [];
    Models.CATEGORIAS.forEach((c) => {
      if (groups[c.id]) {
        labels.push(c.nombre);
        data.push(groups[c.id]);
        colors.push(c.color);
      }
    });

    Charts.renderDona('chart-categoria', labels, data, colors);
  },

  _renderTendenciaChart(mermas) {
    const monthGroups = {};
    mermas.forEach((m) => {
      const mes = m.fecha.substring(0, 7);
      monthGroups[mes] = (monthGroups[mes] || 0) + m.valor;
    });

    const sortedMonths = Object.keys(monthGroups).sort();
    const labels = sortedMonths.map((m) => {
      const [y, mo] = m.split('-').map(Number);
      const names = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      return names[mo - 1] + (y !== new Date().getFullYear() ? " '" + String(y).slice(2) : '');
    });
    const data = sortedMonths.map((m) => monthGroups[m]);
    const colors = data.map(() => '#e74c3c');

    Charts.renderBarras('chart-tendencia', labels, data, colors);
  },
};
