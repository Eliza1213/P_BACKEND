const mongoose = require("mongoose");

// Definir el esquema de Visión
const visionSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  descripcion: { type: String, required: true },
  fechaCreacion: { type: Date, default: Date.now },
});

// Crear el modelo de Visión
const Vision = mongoose.model("Vision", visionSchema);

// Exportar el modelo de Visión
module.exports = Vision;
