const Registro = {
  _tableBody: null,
  _filtroCategoria: null,
  _filtroCausa: null,
  _filtroFechaDesde: null,
  _filtroFechaHasta: null,
  _modalOverlay: null,
  _modalTitle: null,
  _form: null,
  _editId: null,

  init() {
    this._tableBody = document.getElementById('registro-body');
    this._filtroCategoria = document.getElementById('filtro-categoria');
    this._filtroCausa = document.getElementById('filtro-causa');
    this._filtroFechaDesde = document.getElementById('filtro-fecha-desde');
    this._filtroFechaHasta = document.getElementById('filtro-fecha-hasta');
    this._modalOverlay = document.getElementById('merma-modal');
    this._modalTitle = document.getElementById('merma-modal-title');
    this._form = document.getElementById('merma-form');

    document.getElementById('btn-nueva-merma').addEventListener('click', () => this._openForm());
    document.getElementById('btn-cancelar-merma').addEventListener('click', () => this._closeForm());
    document.getElementById('btn-cancelar-merma2').addEventListener('click', () => this._closeForm());
    this._form.addEventListener('submit', (e) => this._handleSubmit(e));
    this._modalOverlay.addEventListener('click', (e) => {
      if (e.target === this._modalOverlay) this._closeForm();
    });

    document.getElementById('btn-limpiar-filtros').addEventListener('click', () => this._clearFilters());

    [this._filtroCategoria, this._filtroCausa, this._filtroFechaDesde, this._filtroFechaHasta].forEach((el) => {
      el.addEventListener('change', () => this.render());
    });

    this._populateSelects();
    this.render();
  },

  _populateSelects() {
    const catSelect = document.getElementById('merma-categoria');
    catSelect.innerHTML = Models.CATEGORIAS.map((c) => `<option value="${c.id}">${c.nombre}</option>`).join('');

    const causaSelect = document.getElementById('merma-causa');
    causaSelect.innerHTML = Models.CAUSAS.map((c) => `<option value="${c.id}">${c.nombre}</option>`).join('');

    const horaSelect = document.getElementById('merma-hora');
    horaSelect.innerHTML = Models.HORAS.map((h) => `<option value="${h.id}">${h.nombre}</option>`).join('');

    const deptoSelect = document.getElementById('merma-departamento');
    deptoSelect.innerHTML = Models.DEPARTAMENTOS.map((d) => `<option value="${d.id}">${d.nombre}</option>`).join('');

    this._filtroCategoria.innerHTML = '<option value="">Todas</option>' +
      Models.CATEGORIAS.map((c) => `<option value="${c.id}">${c.nombre}</option>`).join('');
    this._filtroCausa.innerHTML = '<option value="">Todas</option>' +
      Models.CAUSAS.map((c) => `<option value="${c.id}">${c.nombre}</option>`).join('');
  },

  _clearFilters() {
    this._filtroCategoria.value = '';
    this._filtroCausa.value = '';
    this._filtroFechaDesde.value = '';
    this._filtroFechaHasta.value = '';
    this.render();
  },

  render() {
    let mermas = Store.getCollection('mermas');

    const cat = this._filtroCategoria.value;
    const causa = this._filtroCausa.value;
    const desde = this._filtroFechaDesde.value;
    const hasta = this._filtroFechaHasta.value;

    if (cat) mermas = mermas.filter((m) => m.categoria === cat);
    if (causa) mermas = mermas.filter((m) => m.causa === causa);
    if (desde) mermas = mermas.filter((m) => m.fecha >= desde);
    if (hasta) mermas = mermas.filter((m) => m.fecha <= hasta);

    mermas.sort((a, b) => b.fecha.localeCompare(a.fecha) || b.fechaCreacion.localeCompare(a.fechaCreacion));

    if (mermas.length === 0) {
      this._tableBody.innerHTML = `<tr><td colspan="7"><div class="empty-state">
        <div class="empty-state__icon">📦</div>
        <div class="empty-state__text">No hay mermas registradas</div>
      </div></td></tr>`;
      return;
    }

    this._tableBody.innerHTML = mermas.map((m) => {
      const catData = Models.CATEGORIAS.find((c) => c.id === m.categoria) || { badge: 'badge--otro', nombre: m.categoria };
      const causaData = Models.CAUSAS.find((c) => c.id === m.causa) || { badge: 'badge--otro', nombre: m.causa };
      return `<tr>
        <td><strong>${Utils.escapeHtml(m.producto)}</strong></td>
        <td><span class="badge ${catData.badge}">${catData.nombre}</span></td>
        <td>${m.cantidad} ${Utils.escapeHtml(m.unidad)}</td>
        <td style="font-weight:700;color:var(--color-danger)">${Utils.currency(m.valor)}</td>
        <td>${Utils.formatDateShort(m.fecha)}</td>
        <td><span class="badge ${causaData.badge}">${causaData.nombre}</span></td>
        <td>
          <button class="btn btn--secondary btn--sm" data-merma-edit="${m.id}">✏️</button>
          <button class="btn btn--danger btn--sm" data-merma-delete="${m.id}">🗑️</button>
        </td>
      </tr>`;
    }).join('');

    this._tableBody.querySelectorAll('[data-merma-edit]').forEach((btn) => {
      btn.addEventListener('click', () => this._openForm(btn.dataset.mermaEdit));
    });
    this._tableBody.querySelectorAll('[data-merma-delete]').forEach((btn) => {
      btn.addEventListener('click', () => this._deleteMerma(btn.dataset.mermaDelete));
    });
  },

  _openForm(id) {
    this._editId = id || null;
    this._modalTitle.textContent = id ? 'Editar Merma' : 'Nueva Merma';
    this._form.reset();
    document.getElementById('merma-id').value = '';

    if (id) {
      const m = Store.getById('mermas', id);
      if (m) {
        document.getElementById('merma-id').value = m.id;
        document.getElementById('merma-producto').value = m.producto;
        document.getElementById('merma-categoria').value = m.categoria;
        document.getElementById('merma-cantidad').value = m.cantidad;
        document.getElementById('merma-unidad').value = m.unidad;
        document.getElementById('merma-valor').value = m.valor;
        document.getElementById('merma-fecha').value = m.fecha;
        document.getElementById('merma-hora').value = m.hora;
        document.getElementById('merma-causa').value = m.causa;
        document.getElementById('merma-departamento').value = m.departamento;
        document.getElementById('merma-notas').value = m.notas;
      }
    } else {
      document.getElementById('merma-fecha').value = Utils.getTodayISO();
    }

    this._modalOverlay.classList.add('modal-overlay--open');
    document.getElementById('merma-producto').focus();
  },

  _closeForm() {
    this._modalOverlay.classList.remove('modal-overlay--open');
    this._editId = null;
  },

  _handleSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('merma-id').value;
    const data = {
      producto: document.getElementById('merma-producto').value.trim(),
      categoria: document.getElementById('merma-categoria').value,
      cantidad: document.getElementById('merma-cantidad').value,
      unidad: document.getElementById('merma-unidad').value.trim(),
      valor: document.getElementById('merma-valor').value,
      fecha: document.getElementById('merma-fecha').value,
      hora: document.getElementById('merma-hora').value,
      causa: document.getElementById('merma-causa').value,
      departamento: document.getElementById('merma-departamento').value,
      notas: document.getElementById('merma-notas').value.trim(),
    };

    if (!data.producto) { alert('El nombre del producto es obligatorio'); return; }
    if (!data.fecha) { alert('La fecha es obligatoria'); return; }

    if (id) {
      Store.updateInCollection('mermas', id, data);
    } else {
      Store.addToCollection('mermas', Models.crearMerma(data));
    }

    this._closeForm();
    this.render();
    document.dispatchEvent(new CustomEvent('data:change'));
  },

  _deleteMerma(id) {
    if (!confirm('¿Eliminar este registro de merma?')) return;
    Store.removeFromCollection('mermas', id);
    this.render();
    document.dispatchEvent(new CustomEvent('data:change'));
  },
};
