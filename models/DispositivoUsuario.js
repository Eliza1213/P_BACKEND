//Este es el nuevo que agregue 
// models/DispositivoUsuario.js
const mongoose = require('mongoose');

const DispositivoUsuarioSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: [true, 'El ID del usuario es requerido']
  },
  producto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Producto',
    required: [true, 'El ID del producto es requerido']
  },
  identificadorIoT: {
    type: String,
    required: [true, 'El identificador IoT es requerido'],
    trim: true
  },
  fechaActivacion: {
    type: Date,
    default: Date.now
  },
  activo: {
    type: Boolean,
    default: true
  },
  // Puedes agregar más campos según necesites para tu aplicación
  // Por ejemplo, datos de configuración, lecturas, etc.
  configuracion: {
    type: Object,
    default: {}
  },
  // Historial de datos (opcional)
  historialDatos: {
    type: Array,
    default: []
  }
});

// Índice compuesto para asegurar que un dispositivo solo pueda estar asignado a un usuario
DispositivoUsuarioSchema.index({ producto: 1 }, { unique: true });

// Índice para búsquedas rápidas por identificador IoT
DispositivoUsuarioSchema.index({ identificadorIoT: 1 });

module.exports = mongoose.model('DispositivoUsuario', DispositivoUsuarioSchema);