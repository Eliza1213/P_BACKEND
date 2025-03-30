const express = require("express");
const cors = require("cors");
const conectarDB = require("./Config/db");
require("dotenv").config();

//oscar nodemailer
const nodemailer = require('nodemailer');

// Configuración del transportador de Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Importar las rutas
const TerrarioRoutes = require("./Routes/TerrarioRoutes");

// Inicializar la aplicación Express
const app = express();
const port = process.env.PORT || 4000;

// Configurar CORS
const corsOptions = {
  origin: 'http://localhost:3000', // Cambia esto al origen de tu frontend
  optionsSuccessStatus: 200,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
};

// Middleware para parsear JSON y habilitar CORS
app.use(express.json());
app.use(cors(corsOptions));

// Pasar transporter a userRoutes
app.use("/api/usuarios", (req, res, next) => {
    req.transporter = transporter;
    next();
}, require("./routes/userRoutes"));

// Conectar a la base de datos
conectarDB();

// Rutas API existentes
app.use("/api/misiones", require("./routes/MisionRoutes"));
app.use("/api/visiones", require("./Routes/VisionRoutes"));
app.use("/api/terminos", require("./Routes/TerminoRoutes"));
app.use("/api/politicas", require("./Routes/PoliticaRoutes"));
app.use("/api/preguntas", require("./Routes/PreguntaRoutes"));
app.use("/api/contactos", require("./Routes/ContactoRoutes"));
app.use("/api/informaciones", require("./Routes/InformacionRoutes"));
app.use("/api/terrario", TerrarioRoutes); // Ahora está correctamente importado
app.use("/api/productos", require("./routes/ProductoRoutes"));

// Nueva ruta para el control de actuadores
app.post("/api/control", (req, res) => {
  const { actuador, accion } = req.body;

  // Verificar datos recibidos
  if (!actuador || !accion) {
    return res.status(400).json({ message: "Datos incompletos: faltan actuador o acción." });
  }

  console.log(`Recibido: Actuador - ${actuador}, Acción - ${accion}`);

  // Lógica de control de actuadores
  switch (actuador) {
    case "fan":
      if (accion === "on") {
        console.log("Encendiendo el ventilador...");
      } else if (accion === "off") {
        console.log("Apagando el ventilador...");
      } else {
        return res.status(400).json({ message: "Acción no válida para el ventilador." });
      }
      break;

    case "lamp":
      if (accion === "on") {
        console.log("Encendiendo la lámpara...");
      } else if (accion === "off") {
        console.log("Apagando la lámpara...");
      } else {
        return res.status(400).json({ message: "Acción no válida para la lámpara." });
      }
      break;

    default:
      return res.status(400).json({ message: "Actuador no reconocido." });
  }

  // Responder con éxito
  res.status(200).json({ message: "Acción realizada con éxito." });
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
});