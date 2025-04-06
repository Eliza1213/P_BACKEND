// routes/ProductoRoutes.js
const express = require("express");
const mongoose = require("mongoose");
const Producto = require("../models/Producto");
const router = express.Router();

// Crear un nuevo producto
router.post("/", async (req, res) => {
  try {
    console.log("Datos recibidos:", req.body);

    let { nombre, descripcion, precio, stock, imagenes, esIoT, identificadorIoT } = req.body;

    // Asegurarse de que imagenes sea un array
    if (!imagenes) {
      imagenes = [];
    } else if (typeof imagenes === "string") {
      imagenes = [imagenes];
    }

    if (!Array.isArray(imagenes)) {
      return res.status(400).json({ error: "Las imágenes deben ser enviadas en un array" });
    }

    if (imagenes.length === 0) {
      return res.status(400).json({ error: "Debe proporcionar al menos una imagen válida" });
    }

    // Validación específica para dispositivos IoT
    if (esIoT && !identificadorIoT) {
      return res.status(400).json({ 
        error: "El identificador IoT es requerido para dispositivos IoT" 
      });
    }

    // Verificar si ya existe un producto con el mismo identificador IoT
    if (esIoT && identificadorIoT) {
      const dispositivoExistente = await Producto.findOne({ identificadorIoT });
      if (dispositivoExistente) {
        return res.status(400).json({ 
          error: "Ya existe un dispositivo con este identificador IoT" 
        });
      }
    }

    const nuevoProducto = new Producto({
      nombre,
      descripcion,
      precio,
      stock,
      imagenes,
      esIoT: esIoT || false,
      identificadorIoT: esIoT ? identificadorIoT : null,
    });

    await nuevoProducto.save();
    res.status(201).json({ mensaje: "Producto creado con éxito", producto: nuevoProducto });
  } catch (error) {
    console.error("Error al crear producto:", error);
    res.status(500).json({ error: "Error al crear producto en el servidor", detalle: error.message });
  }
});

// Obtener todos los productos
router.get("/", async (req, res) => {
  try {
    const productos = await Producto.find();
    console.log("Productos encontrados:", productos.length);
    
    // Imprimir información básica de cada producto
    productos.forEach(p => {
      console.log(`ID: ${p._id}, Nombre: ${p.nombre}, esIoT: ${p.esIoT}`);
    });
    
    res.status(200).json(productos);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).json({ error: "Error al obtener los productos" });
  }
});

// Obtener un producto por ID
router.get("/:id", async (req, res) => {
  try {
    const producto = await Producto.findById(req.params.id);
    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.status(200).json(producto);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener el producto" });
  }
});

// Actualizar un producto
router.put("/:id", async (req, res) => {
  try {
    const { nombre, descripcion, precio, stock, imagenes, esIoT, identificadorIoT } = req.body;
    const producto = await Producto.findByIdAndUpdate(
      req.params.id,
      { 
        nombre, 
        descripcion, 
        precio, 
        stock, 
        imagenes,
        esIoT,
        identificadorIoT: esIoT ? identificadorIoT : null
      },
      { new: true, runValidators: true }
    );

    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.status(200).json({ mensaje: "Producto actualizado", producto });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar el producto", detalle: error.message });
  }
});

// Eliminar un producto
router.delete("/:id", async (req, res) => {
  try {
    const producto = await Producto.findByIdAndDelete(req.params.id);
    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.status(200).json({ mensaje: "Producto eliminado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar el producto" });
  }
});

// Verificar disponibilidad de dispositivo IoT
router.get("/verificar-iot/:id", async (req, res) => {
  try {
    const producto = await Producto.findById(req.params.id);
    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    if (!producto.esIoT) {
      return res.status(400).json({ error: "Este producto no es un dispositivo IoT" });
    }

    res.status(200).json({ 
      esIoT: true,
      asignado: producto.asignado,
      disponible: !producto.asignado,
      identificadorIoT: producto.identificadorIoT
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al verificar el dispositivo IoT" });
  }
});

// Crear un producto IoT de prueba
router.get("/crear-iot-prueba", async (req, res) => {
  try {
    // Crear un nuevo producto IoT
    const nuevoProducto = new Producto({
      nombre: "Terrario IoT de Prueba",
      descripcion: "Terrario inteligente para pruebas",
      precio: 1999,
      stock: 5,
      imagenes: ["https://m.media-amazon.com/images/I/81MpKcPpURL.__AC_SX300_SY300_QL70_ML2_.jpg"],
      esIoT: true,
      identificadorIoT: "AA:BB:CC:DD:EE:FF",
      asignado: false
    });
    
    // Guardar el producto
    const resultado = await nuevoProducto.save();
    
    res.json({
      message: "Producto IoT de prueba creado exitosamente",
      producto: resultado
    });
  } catch (error) {
    console.error("Error al crear producto de prueba:", error);
    res.status(500).json({
      error: "Error al crear producto de prueba",
      detalle: error.message
    });
  }
});

// Actualizar un producto existente para convertirlo en IoT
router.get("/actualizar-a-iot/:id", async (req, res) => {
  try {
    const productoId = req.params.id;
    
    // Buscar el producto por ID
    const producto = await Producto.findById(productoId);
    
    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    
    // Actualizar a IoT
    producto.esIoT = true;
    producto.identificadorIoT = "BB:CC:DD:EE:FF:AA";
    producto.asignado = false;
    
    // Guardar los cambios
    await producto.save();
    
    res.json({
      message: "Producto actualizado a IoT con éxito",
      producto: producto
    });
  } catch (error) {
    console.error("Error al actualizar producto a IoT:", error);
    res.status(500).json({
      error: "Error al actualizar producto a IoT",
      detalle: error.message
    });
  }
});

module.exports = router;