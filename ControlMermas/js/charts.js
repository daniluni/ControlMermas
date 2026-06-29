const Charts = {
  _destroyed: false,

  destroy() {
    this._destroyed = true;
  },

  renderDona(canvasId, labels, data, colors) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const w = rect.width || 300;
    const h = 250;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.scale(dpr, dpr);

    const total = data.reduce((s, v) => s + v, 0);
    if (total === 0) {
      ctx.fillStyle = '#dfe6e9';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Sin datos', w / 2, h / 2);
      return;
    }

    const cx = w * 0.35;
    const cy = h / 2;
    const radius = Math.min(cx, cy) - 20;
    let startAngle = -Math.PI / 2;

    data.forEach((val, i) => {
      if (val === 0) return;
      const sliceAngle = (val / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, startAngle, startAngle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();
      startAngle += sliceAngle;
    });

    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.55, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.fillStyle = '#2d3436';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(total, cx, cy - 6);
    ctx.font = '11px sans-serif';
    ctx.fillStyle = '#636e72';
    ctx.fillText('total', cx, cy + 12);

    this._renderLegend(canvas, labels, data, colors, w * 0.68);
  },

  _renderLegend(canvas, labels, data, colors, x) {
    const parent = canvas.parentElement;
    let legendEl = parent.querySelector('.chart-legend');
    if (!legendEl) {
      legendEl = document.createElement('div');
      legendEl.className = 'chart-legend';
      legendEl.style.cssText = 'position:absolute;top:0;right:0;padding:12px 16px;font-size:12px;line-height:1.8;pointer-events:none';
      parent.style.position = 'relative';
      parent.appendChild(legendEl);
    }

    const total = data.reduce((s, v) => s + v, 0);
    legendEl.innerHTML = labels.map((label, i) => {
      const pct = total > 0 ? Math.round((data[i] / total) * 100) : 0;
      if (data[i] === 0) return '';
      return `<div style="display:flex;align-items:center;gap:6px;white-space:nowrap">
        <span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:${colors[i % colors.length]}"></span>
        <span>${Utils.escapeHtml(label)}</span>
        <span style="color:#636e72">${data[i]} (${pct}%)</span>
      </div>`;
    }).filter(Boolean).join('');
  },

  renderBarras(canvasId, labels, datasets, colors) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const w = rect.width || 300;
    const h = 250;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.scale(dpr, dpr);

    const pad = { top: 20, bottom: 40, left: 50, right: 20 };
    const chartW = w - pad.left - pad.right;
    const chartH = h - pad.top - pad.bottom;

    const maxVal = Math.max(...datasets, 1);
    const barW = Math.min(chartW / labels.length - 4, 40);
    const gap = (chartW - barW * labels.length) / (labels.length + 1);

    ctx.clearRect(0, 0, w, h);

    ctx.strokeStyle = '#dfe6e9';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad.left, pad.top);
    ctx.lineTo(pad.left, pad.top + chartH);
    ctx.lineTo(pad.left + chartW, pad.top + chartH);
    ctx.stroke();

    ctx.fillStyle = '#636e72';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    const steps = 4;
    for (let i = 0; i <= steps; i++) {
      const v = Math.round((maxVal / steps) * i);
      const y = pad.top + chartH - (chartH / steps) * i;
      ctx.fillText(v, pad.left - 6, y);
    }

    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.font = '10px sans-serif';
    labels.forEach((label, i) => {
      const x = pad.left + gap + i * (barW + gap) + barW / 2;
      ctx.fillStyle = '#636e72';
      ctx.fillText(label, x, pad.top + chartH + 6);
    });

    datasets.forEach((val, i) => {
      const barH = (val / maxVal) * chartH;
      const x = pad.left + gap + i * (barW + gap);
      const y = pad.top + chartH - barH;
      ctx.fillStyle = colors[i % colors.length];
      ctx.beginPath();
      ctx.roundRect(x, y, barW, barH, [4, 4, 0, 0]);
      ctx.fill();
    });
  },
};
