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

// Inicializar la aplicación Express
const app = express();
const port = process.env.PORT || 4000;

// Importar las rutas
const TerrarioRoutes = require("./routes/TerrarioRoutes");
const productoRoutes = require('./routes/ProductoRoutes');
const dispositivoRoutes = require('./routes/DispositivoRoutes');

// Configurar CORS
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://mi-proyecto-virid.vercel.app',
    'https://web-proyecto-sage.vercel.app'  // ✅ frontend de producción
  ],
  
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

// Ruta raíz básica para evitar errores 404
app.get("/", (req, res) => {
  res.send("Bienvenido a mi servidor!");
});

// Rutas API
app.use("/api/misiones", require("./routes/MisionRoutes"));
app.use("/api/visiones", require("./routes/VisionRoutes"));
app.use("/api/terminos", require("./routes/TerminoRoutes"));
app.use("/api/politicas", require("./routes/PoliticaRoutes"));
app.use("/api/preguntas", require("./routes/PreguntaRoutes"));
app.use("/api/contactos", require("./routes/ContactoRoutes"));
app.use("/api/informaciones", require("./routes/InformacionRoutes"));
app.use("/api/terrario", TerrarioRoutes);

// IMPORTANTE: Solo usar una vez cada ruta
app.use('/api/productos', productoRoutes);
app.use("/api/dispositivos", dispositivoRoutes);

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