const mongoose = require("mongoose");

// Definir el esquema de Politicas
const PoliticaSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  contenido: { type: String, required: true },
  ultimaActualizacion: { type: Date, default: Date.now },
});

const Politica = mongoose.model("Politica", PoliticaSchema);

module.exports = Politica;
