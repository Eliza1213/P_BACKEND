const Usuario = require("../models/Usuario");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//oscar
const obtenerPerfil = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.user.id).select('-password');
    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el usuario" });
  }
};
//oscar

// Registrar un nuevo usuario
const registerUser = async (req, res) => {
  try {
    const { nombre, ap, am, username, email, password, telefono, preguntaSecreta, respuestaSecreta } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const nuevoUsuario = new Usuario({
      nombre,
      ap,
      am,
      username,
      email,
      password: hashedPassword,
      telefono,
      preguntaSecreta,
      respuestaSecreta,
    });

    await nuevoUsuario.save();
    res.status(201).json({ mensaje: "Usuario registrado con éxito", usuario: nuevoUsuario });
  } catch (error) {
    res.status(500).json({ error: "Error al registrar usuario" });
  }
};

// Iniciar sesión
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const usuario = await Usuario.findOne({ email });
    if (!usuario) return res.status(400).json({ error: "Usuario no encontrado" });

    const esValida = await bcrypt.compare(password, usuario.password);
    if (!esValida) return res.status(400).json({ error: "Contraseña incorrecta" });

    const token = jwt.sign({ id: usuario._id, rol: usuario.rol }, "secreto", { expiresIn: "1h" });
    res.json({ token, rol: usuario.rol, nombre: usuario.nombre });
  } catch (error) {
    res.status(500).json({ error: "Error en el servidor" });
  }
};

// Obtener todos los usuarios (solo para administradores)
const getUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.find({}, { password: 0 }); // Excluir la contraseña
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los usuarios" });
  }
};

// Actualizar el rol de un usuario (solo para administradores)
const updateRol = async (req, res) => {
  try {
    const { id } = req.params;
    const { rol } = req.body;

    const usuarioActualizado = await Usuario.findByIdAndUpdate(
      id,
      { rol },
      { new: true }
    );

    if (!usuarioActualizado) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json(usuarioActualizado);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el rol" });
  }
};

// Eliminar un usuario (solo para administradores)
const deleteUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    await Usuario.findByIdAndDelete(id);
    res.json({ mensaje: "Usuario eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar el usuario" });
  }
};


// userController.js
const verificarCorreo = async (req, res) => {
  const { email } = req.body;

  try {
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(404).json({ error: "Correo no encontrado" });
    }
    res.status(200).json({ mensaje: "Correo verificado" });
  } catch (error) {
    res.status(500).json({ error: "Error al verificar el correo" });
  }
};

const preguntas = {
  "personaje-favorito": "¿Cuál es tu personaje favorito?",
  "pelicula-favorita": "¿Cuál es tu película favorita?",
  "mejor-amigo": "¿Quién es tu mejor amigo?",
  "nombre-mascota": "¿Cuál es el nombre de tu mascota?",
  "deporte-favorito": "¿Cuál es tu deporte favorito?"
};

const obtenerPregunta = async (req, res) => {
  const { email } = req.body;

  try {
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(404).json({ error: "Correo no encontrado" });
    }

    const preguntaCompleta = preguntas[usuario.preguntaSecreta];
    if (!preguntaCompleta) {
      return res.status(400).json({ error: "Pregunta secreta no válida" });
    }

    res.status(200).json({ preguntaSecreta: preguntaCompleta });
  } catch (error) {
    res.status(500).json({ error: "Error al obtener la pregunta secreta" });
  }
};

const verificarRespuesta = async (req, res) => {
  const { email, respuesta } = req.body;

  try {
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(404).json({ error: "Correo no encontrado" });
    }
    if (usuario.respuestaSecreta !== respuesta) {
      return res.status(400).json({ error: "Respuesta incorrecta" });
    }
    res.status(200).json({ mensaje: "Respuesta correcta" });
  } catch (error) {
    res.status(500).json({ error: "Error al verificar la respuesta" });
  }
};

const cambiarContrasena = async (req, res) => {
  const { email, nuevaPassword } = req.body;

  try {
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(404).json({ error: "Correo no encontrado" });
    }
    const hashedPassword = await bcrypt.hash(nuevaPassword, 10);
    usuario.password = hashedPassword;
    await usuario.save();
    res.status(200).json({ mensaje: "Contraseña cambiada con éxito" });
  } catch (error) {
    res.status(500).json({ error: "Error al cambiar la contraseña" });
  }
};

// userController.js de oscar
const actualizarPerfil = async (req, res) => {
  try {
    const { nombre, ap, am, email, telefono, username } = req.body;
    const usuario = await Usuario.findByIdAndUpdate(
      req.user.id,
      { nombre, ap, am, email, telefono, username },
      { new: true }
    ).select('-password');

    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json(usuario);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el usuario" });
  }
};
// oscar nodemailer
const crypto = require('crypto');

const enviarCorreoRestablecimiento = async (email, token, transporter) => {
  const mailOptions = {
      from: 'delacruzhernandezoscardavid@gmail.com',
      to: email,
      subject: 'Restablecimiento de Contraseña',
      text: `Haz clic en el siguiente enlace para restablecer tu contraseña: http://localhost:3000/restablecer-contrasena/${token}`
  };

  try {
      await transporter.sendMail(mailOptions);
  } catch (error) {
      console.error("Error al enviar el correo de restablecimiento:", error);
      throw new Error("Error al enviar el correo de restablecimiento");
  }
};

const solicitarRestablecimiento = async (req, res) => {
  const { email } = req.body;
  const transporter = req.transporter;

  try {
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(404).json({ error: "Correo no encontrado" });
    }

    const token = crypto.randomBytes(20).toString('hex');
    console.log("Token generado:", token); // Verificar el token generado

    usuario.resetToken = token;
    usuario.resetTokenExpiracion = Date.now() + 3600000; // 1 hora de expiración
    await usuario.save();

    await enviarCorreoRestablecimiento(email, token, transporter);

    res.status(200).json({ mensaje: "Correo de restablecimiento enviado" });
  } catch (error) {
    res.status(500).json({ error: "Error al solicitar el restablecimiento" });
  }
};

const restablecerContrasena = async (req, res) => {
  const { token, nuevaPassword } = req.body;

  try {
    const usuario = await Usuario.findOne({
      resetToken: token,
      resetTokenExpiracion: { $gt: Date.now() }
    });

    if (!usuario) {
      return res.status(400).json({ error: "Token inválido o expirado" });
    }

    console.log("Token recuperado:", usuario.resetToken); // Verificar el token recuperado

    const hashedPassword = await bcrypt.hash(nuevaPassword, 10);
    usuario.password = hashedPassword;
    usuario.resetToken = undefined;
    usuario.resetTokenExpiracion = undefined;
    await usuario.save();

    res.status(200).json({ mensaje: "Contraseña restablecida con éxito" });
  } catch (error) {
    console.error("Error al restablecer la contraseña:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};


// oscar nodemailer

//oscar
module.exports = { 
  registerUser, 
  loginUser, 
  getUsuarios, 
  updateRol, 
  deleteUsuario, 
  verificarCorreo, 
  obtenerPregunta, 
  verificarRespuesta, 
  cambiarContrasena, 
  obtenerPerfil, 
  actualizarPerfil,  
  solicitarRestablecimiento, 
  restablecerContrasena };