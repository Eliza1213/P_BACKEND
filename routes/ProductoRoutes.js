const express = require("express");
const Producto = require("../models/Producto"); // Asegúrate de que la ruta del modelo sea correcta
const router = express.Router();

// Crear un nuevo producto
router.post("/", async (req, res) => {
  try {
    console.log("Datos recibidos:", req.body); // Verifica los datos enviados
    const { nombre, descripcion, precio, stock, imagenes } = req.body;

    if (!nombre || !descripcion || !precio || !stock || !imagenes || !imagenes.length) {
      return res.status(400).json({ error: "Todos los campos son obligatorios y debe haber al menos una imagen válida" });
    }

    const nuevoProducto = new Producto({ nombre, descripcion, precio, stock, imagenes });
    await nuevoProducto.save();
    res.status(201).json({ mensaje: "Producto creado con éxito", producto: nuevoProducto });
  } catch (error) {
    console.error("Error al crear producto:", error);
    res.status(500).json({ error: "Error al crear producto en el servidor" });
  }
});


// Obtener todos los productos
router.get("/", async (req, res) => {
  try {
    const productos = await Producto.find();
    res.status(200).json(productos);
  } catch (error) {
    console.error(error);
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
    const { nombre, descripcion, precio, stock, imagenes } = req.body;
    const producto = await Producto.findByIdAndUpdate(
      req.params.id,
      { nombre, descripcion, precio, stock, imagenes },
      { new: true }
    );

    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.status(200).json({ mensaje: "Producto actualizado", producto });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar el producto" });
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

module.exports = router;