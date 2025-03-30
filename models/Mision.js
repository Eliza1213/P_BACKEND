const mongoose = require("mongoose");

const misionSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  descripcion: { type: String, required: true },
  fechaCreacion: { type: Date, default: Date.now },
});

const Mision = mongoose.model("Mision", misionSchema);

module.exports = Mision;
