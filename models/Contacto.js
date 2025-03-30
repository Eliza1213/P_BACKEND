const mongoose = require("mongoose");

const contactoSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
  email: { type: String, required: true, match: /.+\@.+\..+/ },
  telefono: { type: String, required: true, match: /^[0-9]{10}$/ },
  ubicacion: {
    lat: { type: Number, required: true }, // Latitud (requerida)
    lng: { type: Number, required: true }, // Longitud (requerida)
    direccion: { type: String, required: true },
  },
  redes_sociales: {
    type: [
      {
        nombre: { type: String, required: true },
        enlace: { type: String, required: true, match: /^(https?:\/\/).+/ },
      },
    ],
    default: [],
  },
});

const Contacto = mongoose.model("Contacto", contactoSchema);

module.exports = Contacto;
