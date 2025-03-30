// models/TerrarioData.js
const mongoose = require("mongoose");

const terrarioDataSchema = new mongoose.Schema({
  dispositivo_id: {
    type: String,
    required: true,
  },
  temperatura: {
    type: Number,
    required: true,
  },
  humedad: {
    type: Number,
    required: true,
  },
  luz: {
    type: Number,
    required: true,
  },
  ventilador: {
    type: Number,
    required: true,
  },
  pir: {
    type: Number,
    required: true,
  },
  fecha_registro: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("TerrarioData", terrarioDataSchema);