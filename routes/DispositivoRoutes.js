// routes/DispositivoRoutes.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const DispositivoUsuario = require('../models/DispositivoUsuario');
const Producto = require('../models/Producto');
const authMiddleware = require('../middlewares/authMiddleware');

// Añadir middleware de depuración para todas las rutas
router.use((req, res, next) => {
  console.log('-----------------------------------');
  console.log(`[${new Date().toISOString()}] Acceso a ruta: ${req.method} ${req.originalUrl}`);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Usuario autenticado:', req.user ? `ID: ${req.user._id}, Rol: ${req.user.rol}` : 'No autenticado');
  console.log('-----------------------------------');
  next();
});

// Aplicar middleware de autenticación
router.use(authMiddleware());

// Ruta simple para probar si el middleware funciona
router.get('/test', (req, res) => {
  console.log("[TEST] Ruta de prueba básica accedida");
  res.json({ 
    mensaje: 'La ruta de prueba funciona correctamente',
    usuario: req.user ? {
      id: req.user._id,
      nombre: req.user.nombre,
      rol: req.user.rol
    } : 'No autenticado'
  });
});

// Ruta simple para probar acceso de admin
router.get('/admin/test', (req, res) => {
  console.log("[ADMIN TEST] Ruta de prueba admin accedida");
  console.log("Usuario en req.user:", req.user ? `ID: ${req.user._id}, Rol: ${req.user.rol}` : "No disponible");
  
  try {
    // Verificar que el usuario sea administrador
    if (!req.user) {
      console.log("[ADMIN TEST] Error: Usuario no autenticado");
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }
    
    if (req.user.rol !== 'admin') {
      console.log(`[ADMIN TEST] Error: Usuario no es admin, rol actual: ${req.user.rol}`);
      return res.status(403).json({ error: 'Se requieren permisos de administrador' });
    }
    
    // Si llega aquí, todo está bien
    console.log("[ADMIN TEST] Acceso correcto para admin");
    res.json({ 
      mensaje: 'Acceso de administrador correcto',
      usuario: {
        id: req.user._id,
        nombre: req.user.nombre,
        rol: req.user.rol
      }
    });
  } catch (error) {
    console.error("[ADMIN TEST] Error en ruta test:", error);
    res.status(500).json({ error: 'Error interno del servidor', detalle: error.message });
  }
});

// Verificación simplificada pero funcional
router.get('/verificar-disponibilidad/:productoId', async (req, res) => {
  console.log("[VERIFICAR] RUTA DE VERIFICACIÓN RECIBIDA");
  console.log("[VERIFICAR] ID del producto:", req.params.productoId);
  console.log("[VERIFICAR] Usuario en req.user:", req.user ? req.user._id : "No disponible");
  
  try {
    const producto = await Producto.findById(req.params.productoId);
    if (!producto) {
      console.log("[VERIFICAR] Producto no encontrado");
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    console.log("[VERIFICAR] Producto encontrado:", producto.nombre, "Es IoT:", producto.esIoT);
    
    // Verificar si ya existe un dispositivo asignado
    const dispositivoExistente = await DispositivoUsuario.findOne({ producto: req.params.productoId });
    console.log("[VERIFICAR] Dispositivo existente:", dispositivoExistente ? "Sí" : "No");
    
    if (dispositivoExistente) {
      return res.json({
        disponible: false,
        mensaje: 'Este dispositivo ya está asignado a un usuario'
      });
    }
    
    res.json({
      disponible: true,
      mensaje: 'Este dispositivo está disponible para activación'
    });
  } catch (error) {
    console.error("[VERIFICAR] Error en verificación:", error);
    res.status(500).json({ error: 'Error al verificar disponibilidad', detalle: error.message });
  }
});

// Activación con creación en la colección
router.post('/activar', async (req, res) => {
  console.log("[ACTIVAR] RUTA DE ACTIVACIÓN RECIBIDA");
  console.log("[ACTIVAR] Datos recibidos:", req.body);
  console.log("[ACTIVAR] Usuario en req.user:", req.user ? req.user._id : "No disponible");
  
  try {
    const { productoId, identificadorIoT } = req.body;
    const usuarioId = req.user._id;
    
    console.log("[ACTIVAR] Verificando producto:", productoId);
    const producto = await Producto.findById(productoId);
    if (!producto) {
      console.log("[ACTIVAR] Producto no encontrado");
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    console.log("[ACTIVAR] Verificando si ya existe dispositivo asignado");
    const dispositivoExistente = await DispositivoUsuario.findOne({ producto: productoId });
    if (dispositivoExistente) {
      console.log("[ACTIVAR] Dispositivo ya asignado");
      return res.status(400).json({
        error: 'Este dispositivo ya está asignado a un usuario'
      });
    }
    
    console.log("[ACTIVAR] Creando nuevo dispositivo usuario");
    // Crear explícitamente un nuevo documento en la colección
    const nuevoDispositivo = new DispositivoUsuario({
      usuario: usuarioId,
      producto: productoId,
      identificadorIoT: identificadorIoT,
      fechaActivacion: new Date(),
      activo: true
    });
    
    console.log("[ACTIVAR] Dispositivo a guardar:", nuevoDispositivo);
    
    // Guardar de forma explícita
    const dispositivoGuardado = await nuevoDispositivo.save();
    console.log("[ACTIVAR] Dispositivo guardado:", dispositivoGuardado._id);
    
    // Actualizar el producto
    console.log("[ACTIVAR] Actualizando producto");
    producto.asignado = true;
    producto.usuarioAsignado = usuarioId;
    await producto.save();
    console.log("[ACTIVAR] Producto actualizado");
    
    res.status(201).json({
      mensaje: 'Dispositivo activado exitosamente',
      dispositivo: dispositivoGuardado
    });
  } catch (error) {
    console.error("[ACTIVAR] Error completo en activación:", error);
    
    // Información más detallada del error
    let mensajeError = "Error al activar el dispositivo";
    if (error.name === 'ValidationError') {
      console.log("[ACTIVAR] Error de validación:", error.errors);
      mensajeError = Object.values(error.errors).map(e => e.message).join(', ');
    } else if (error.code === 11000) {
      console.log("[ACTIVAR] Error de duplicado:", error);
      mensajeError = "Este dispositivo ya está registrado";
    }
    
    res.status(500).json({
      error: mensajeError,
      detalle: error.message
    });
  }
});

// Obtener dispositivos del usuario
router.get('/mis-dispositivos', async (req, res) => {
  console.log("[MIS-DISPOSITIVOS] RUTA MIS DISPOSITIVOS RECIBIDA");
  console.log("[MIS-DISPOSITIVOS] Usuario en req.user:", req.user ? req.user._id : "No disponible");
  
  try {
    const dispositivosUsuario = await DispositivoUsuario.find({ usuario: req.user._id })
      .populate('producto')
      .sort({ fechaActivacion: -1 });
    
    console.log("[MIS-DISPOSITIVOS] Dispositivos encontrados:", dispositivosUsuario.length);
    res.json(dispositivosUsuario);
  } catch (error) {
    console.error("[MIS-DISPOSITIVOS] Error al obtener dispositivos:", error);
    res.status(500).json({ error: 'Error al obtener dispositivos', detalle: error.message });
  }
});

// Obtener todos los dispositivos (para administradores)
router.get('/admin/listar', async (req, res) => {
  console.log("[ADMIN-LISTAR] RUTA ADMIN LISTAR DISPOSITIVOS RECIBIDA");
  console.log("[ADMIN-LISTAR] Usuario en req.user:", req.user ? `ID: ${req.user._id}, Rol: ${req.user.rol}` : "No disponible");
  
  try {
    // Verificar que el usuario sea administrador
    if (!req.user) {
      console.log("[ADMIN-LISTAR] Error: Usuario no autenticado");
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }
    
    if (req.user.rol !== 'admin') {
      console.log(`[ADMIN-LISTAR] Error: Usuario no es admin, rol actual: ${req.user.rol}`);
      return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de administrador' });
    }
    
    console.log("[ADMIN-LISTAR] Acceso correcto, obteniendo dispositivos");
    
    // Obtener todos los dispositivos
    const dispositivos = await DispositivoUsuario.find()
      .sort({ fechaActivacion: -1 });
    
    console.log("[ADMIN-LISTAR] Dispositivos encontrados:", dispositivos.length);
    console.log("[ADMIN-LISTAR] Enviando respuesta con dispositivos");
    res.json(dispositivos);
  } catch (error) {
    console.error("[ADMIN-LISTAR] Error al obtener dispositivos:", error);
    res.status(500).json({ error: 'Error al obtener dispositivos', detalle: error.message });
  }
});

module.exports = router;