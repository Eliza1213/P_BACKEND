const mongoose = require('mongoose');

const UnionSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  dispositivo: {
    type: String,  // ID o MAC de la ESP32
    required: true,
    unique: true
  },
  activo: {
    type: Boolean,
    default: false
  },
  fechaCreacion: {
    type: Date,
    default: Date.now
  },
  ultimaActivacion: Date
});

module.exports = mongoose.model('Union', UnionSchema);