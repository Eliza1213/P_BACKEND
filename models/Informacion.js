const mongoose = require("mongoose");

// Función para validar el formato de URLs de imágenes
const validarURL = (url) => {
  const regex = /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp|svg))$/i;
  return regex.test(url);
};

// Esquema para el modelo Informacion
const informacionSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() }, // Genera automáticamente un nuevo ObjectId
  especie: { type: String, required: true },
  alimentacion: { type: String, required: true },
  temperatura_ideal: { type: String, required: true },
  humedad_ideal: { type: String, required: true },
  descripcion: { type: String, required: true },
  imagen: {
    type: String,
    required: true,
    validate: {
      validator: validarURL, // Valida que la URL de la imagen sea válida
      message: "La imagen debe tener una URL válida (png, jpg, jpeg, gif, webp, svg)",
    },
  },
});

// Crear el modelo Informacion
const Informacion = mongoose.model("Informacion", informacionSchema);

module.exports = Informacion;
