const mongoose = require("mongoose");

// Definir el esquema de Preguntas
const preguntasSchema = new mongoose.Schema({
  pregunta: { type: String, required: true },
  respuesta: { type: String, required: true },
  fechaCreacion: { type: Date, default: Date.now },
});

const Preguntas = mongoose.model("Preguntas", preguntasSchema);

module.exports = Preguntas;
