const mongoose = require("mongoose");

// Función para validar el formato de URLs de imágenes
const validarURL = (url) => {
  const regex = /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp|svg))$/i;
  return regex.test(url);
};

// Función para validar que las URLs pertenezcan a dominios específicos
const validarURLDominio = (url) => {
  const dominiosPermitidos = ["amazon.com", "mercadolibre.com", "mlstatic.com"];
  try {
    const dominio = new URL(url).hostname;
    console.log("Dominio procesado:", dominio); // Verifica qué dominio se está procesando
    return dominiosPermitidos.some((permitido) => dominio.includes(permitido));
  } catch (error) {
    console.error("Error al validar el dominio:", error, "URL:", url);
    return false;
  }
};


// Función completa que valida tanto el formato como el dominio
const validarURLCompleta = (url) => {
  return validarURL(url) && validarURLDominio(url);
};

// Esquema para el modelo Producto
const productoSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() }, // Cambiado para usar `new`
  nombre: { type: String, required: true },
  descripcion: { type: String, required: true },
  precio: { type: Number, required: true },
  stock: { type: Number, required: true },
  imagenes: {
    type: [String],
    required: true,
    validate: {
      validator: function (array) {
        return array.every(validarURLCompleta); // Verifica que todas las URLs sean válidas
      },
      message: "Una o más imágenes no tienen una URL válida o no son de un dominio permitido",
    },
  },
  ultima_actualizacion: { type: Date, default: Date.now },
});


// Crear el modelo Producto
const Producto = mongoose.model("Producto", productoSchema);

module.exports = Producto;