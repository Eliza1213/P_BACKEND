const mongoose = require("mongoose");

const terminoSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  descripcion: { type: String, required: true },
  fechaCreacion: { type: Date, default: Date.now },
});

const Termino = mongoose.model("Termino", terminoSchema);
// Exportamos el modelo Termino para su uso en otros archivos.
module.exports = Termino;