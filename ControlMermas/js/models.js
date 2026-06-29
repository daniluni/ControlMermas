const Models = {
  CATEGORIAS: [
    { id: 'lacteos', nombre: 'Lácteos', badge: 'badge--lacteos', color: '#27ae60' },
    { id: 'carnes', nombre: 'Carnes', badge: 'badge--carnes', color: '#e74c3c' },
    { id: 'verduras', nombre: 'Verduras/Frutas', badge: 'badge--verduras', color: '#2ecc71' },
    { id: 'panaderia', nombre: 'Panadería', badge: 'badge--panaderia', color: '#d35400' },
    { id: 'envasados', nombre: 'Envasados', badge: 'badge--envasados', color: '#2980b9' },
    { id: 'bebidas', nombre: 'Bebidas', badge: 'badge--bebidas', color: '#3498db' },
    { id: 'limpieza', nombre: 'Limpieza', badge: 'badge--limpieza', color: '#8e44ad' },
    { id: 'otro', nombre: 'Otro', badge: 'badge--otro', color: '#636e72' },
  ],

  CAUSAS: [
    { id: 'vencimiento', nombre: 'Vencimiento', badge: 'badge--vencimiento' },
    { id: 'sobreproduccion', nombre: 'Sobreproducción', badge: 'badge--sobreproduccion' },
    { id: 'dano', nombre: 'Daño / Falla', badge: 'badge--dano' },
    { id: 'robo', nombre: 'Robo', badge: 'badge--robo' },
    { id: 'manejo', nombre: 'Manejo inadecuado', badge: 'badge--manejo' },
    { id: 'otro', nombre: 'Otro', badge: 'badge--otro' },
  ],

  HORAS: [
    { id: 'manana', nombre: 'Mañana' },
    { id: 'tarde', nombre: 'Tarde' },
    { id: 'noche', nombre: 'Noche' },
  ],

  DEPARTAMENTOS: [
    { id: 'cocina', nombre: 'Cocina' },
    { id: 'bodega', nombre: 'Bodega' },
    { id: 'piso_venta', nombre: 'Piso de venta' },
    { id: 'recepcion', nombre: 'Recepción' },
  ],

  CATEGORIA_MAP: null,
  CAUSA_MAP: null,

  _ensureMaps() {
    if (!this.CATEGORIA_MAP) {
      this.CATEGORIA_MAP = Object.fromEntries(this.CATEGORIAS.map((c) => [c.id, c]));
    }
    if (!this.CAUSA_MAP) {
      this.CAUSA_MAP = Object.fromEntries(this.CAUSAS.map((c) => [c.id, c]));
    }
  },

  PRESET_MERMAS: [
    { producto: 'Leche entera 1L', categoria: 'lacteos', cantidad: 12, unidad: 'unidades', valor: 14400, fecha: '2026-06-05', hora: 'manana', causa: 'vencimiento', departamento: 'bodega', notas: 'Control de inventario semanal' },
    { producto: 'Yogur natural 500ml', categoria: 'lacteos', cantidad: 8, unidad: 'unidades', valor: 9600, fecha: '2026-06-12', hora: 'manana', causa: 'vencimiento', departamento: 'bodega', notas: '' },
    { producto: 'Queso mantecoso', categoria: 'lacteos', cantidad: 3, unidad: 'kg', valor: 15000, fecha: '2026-06-19', hora: 'tarde', causa: 'manejo', departamento: 'cocina', notas: 'Mala refrigeración' },
    { producto: 'Crema de leche', categoria: 'lacteos', cantidad: 5, unidad: 'unidades', valor: 7500, fecha: '2026-06-26', hora: 'manana', causa: 'vencimiento', departamento: 'bodega', notas: '' },
    { producto: 'Posta rosada', categoria: 'carnes', cantidad: 8, unidad: 'kg', valor: 48000, fecha: '2026-06-07', hora: 'tarde', causa: 'manejo', departamento: 'cocina', notas: 'Cadena de frío interrumpida' },
    { producto: 'Pollo entero', categoria: 'carnes', cantidad: 10, unidad: 'kg', valor: 35000, fecha: '2026-06-14', hora: 'tarde', causa: 'manejo', departamento: 'cocina', notas: '' },
    { producto: 'Carne molida', categoria: 'carnes', cantidad: 5, unidad: 'kg', valor: 22500, fecha: '2026-06-21', hora: 'noche', causa: 'dano', departamento: 'recepcion', notas: 'Problema con cámara frigorífica' },
    { producto: 'Lomo liso', categoria: 'carnes', cantidad: 3, unidad: 'kg', valor: 21000, fecha: '2026-06-28', hora: 'tarde', causa: 'manejo', departamento: 'cocina', notas: '' },
    { producto: 'Lechuga escarola', categoria: 'verduras', cantidad: 5, unidad: 'unidades', valor: 2500, fecha: '2026-06-02', hora: 'manana', causa: 'dano', departamento: 'recepcion', notas: '' },
    { producto: 'Tomates cherry', categoria: 'verduras', cantidad: 3, unidad: 'kg', valor: 4500, fecha: '2026-06-09', hora: 'manana', causa: 'dano', departamento: 'recepcion', notas: 'Golpe de calor' },
    { producto: 'Palta hass', categoria: 'verduras', cantidad: 6, unidad: 'unidades', valor: 7200, fecha: '2026-06-16', hora: 'tarde', causa: 'sobreproduccion', departamento: 'cocina', notas: 'Se preparó demasiado guacamole' },
    { producto: 'Marraqueta', categoria: 'panaderia', cantidad: 30, unidad: 'unidades', valor: 4500, fecha: '2026-06-06', hora: 'noche', causa: 'sobreproduccion', departamento: 'cocina', notas: 'Fin de semana, menos venta' },
    { producto: 'Pan amasado', categoria: 'panaderia', cantidad: 25, unidad: 'unidades', valor: 5000, fecha: '2026-06-13', hora: 'noche', causa: 'sobreproduccion', departamento: 'cocina', notas: '' },
    { producto: 'Coca-Cola 2L', categoria: 'bebidas', cantidad: 6, unidad: 'unidades', valor: 7200, fecha: '2026-06-08', hora: 'tarde', causa: 'dano', departamento: 'piso_venta', notas: 'Botellas golpeadas durante reposición' },
    { producto: 'Jugo natural', categoria: 'bebidas', cantidad: 4, unidad: 'unidades', valor: 6000, fecha: '2026-06-22', hora: 'noche', causa: 'vencimiento', departamento: 'bodega', notas: '' },
    { producto: 'Lavaloza líquido', categoria: 'limpieza', cantidad: 3, unidad: 'unidades', valor: 8400, fecha: '2026-06-15', hora: 'tarde', causa: 'dano', departamento: 'bodega', notas: 'Envase roto' },
    { producto: 'Detergente en polvo', categoria: 'limpieza', cantidad: 2, unidad: 'unidades', valor: 7000, fecha: '2026-06-29', hora: 'manana', causa: 'robo', departamento: 'bodega', notas: 'Se detectó faltante en inventario' },
    { producto: 'Papas congeladas', categoria: 'envasados', cantidad: 8, unidad: 'kg', valor: 16000, fecha: '2026-06-04', hora: 'noche', causa: 'dano', departamento: 'recepcion', notas: 'Congelador dañado' },
    { producto: 'Arroz grado 1', categoria: 'envasados', cantidad: 10, unidad: 'kg', valor: 12000, fecha: '2026-06-18', hora: 'tarde', causa: 'manejo', departamento: 'bodega', notas: 'Derrame accidental' },
    { producto: 'Porotos negros', categoria: 'envasados', cantidad: 5, unidad: 'kg', valor: 4500, fecha: '2026-06-25', hora: 'manana', causa: 'otro', departamento: 'bodega', notas: 'Cambio de proveedor' },
  ],

  initDefaults() {
    if (!Store.get('mermas')) {
      Store.set('mermas', this.PRESET_MERMAS.map((m) => this.crearMerma(m)));
    }
  },

  crearMerma(data) {
    return {
      id: Utils.uuid(),
      producto: data.producto.trim(),
      categoria: data.categoria,
      cantidad: Number(data.cantidad) || 0,
      unidad: (data.unidad || 'unidades').trim(),
      valor: Number(data.valor) || 0,
      fecha: data.fecha,
      hora: data.hora || 'manana',
      causa: data.causa || 'otro',
      departamento: data.departamento || 'bodega',
      notas: (data.notas || '').trim(),
      fechaCreacion: Utils.getNowISO(),
    };
  },

  getCategoriaName(id) {
    this._ensureMaps();
    const c = this.CATEGORIA_MAP[id];
    return c ? c.nombre : id;
  },

  getCausaName(id) {
    this._ensureMaps();
    const c = this.CAUSA_MAP[id];
    return c ? c.nombre : id;
  },

  getCategoriaColor(id) {
    this._ensureMaps();
    const c = this.CATEGORIA_MAP[id];
    return c ? c.color : '#636e72';
  },
};
