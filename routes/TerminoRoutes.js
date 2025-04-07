// routes/terminoRoutes.js
const express = require("express");
const Termino = require("../models/Termino");  // Cambiar Mision por Termino
const router = express.Router();

// Crear nuevo término
router.post("/", async (req, res) => {
  try {
    const { titulo, descripcion } = req.body;

    if (!titulo || !descripcion) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    const nuevoTermino = new Termino({ titulo, descripcion });
    await nuevoTermino.save();
    res.status(201).json({ mensaje: "Término creado con éxito", termino: nuevoTermino });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear término" });
  }
});

// Leer todos los términos
router.get("/", async (req, res) => {
  try {
    const terminos = await Termino.find();
    res.status(200).json(terminos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener términos" });
  }
});

// Leer un término por ID
router.get("/:id", async (req, res) => {
  try {
    const termino = await Termino.findById(req.params.id);
    if (!termino) {
      return res.status(404).json({ error: "Término no encontrado" });
    }
    res.status(200).json(termino);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener el término" });
  }
});

// Actualizar un término
router.put("/:id", async (req, res) => {
  try {
    const { titulo, descripcion } = req.body;
    const termino = await Termino.findByIdAndUpdate(
      req.params.id,
      { titulo, descripcion },
      { new: true }
    );

    if (!termino) {
      return res.status(404).json({ error: "Término no encontrado" });
    }

    res.status(200).json({ mensaje: "Término actualizado", termino });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar término" });
  }
});

// Eliminar un término
router.delete("/:id", async (req, res) => {
  try {
    const termino = await Termino.findByIdAndDelete(req.params.id);
    if (!termino) {
      return res.status(404).json({ error: "Término no encontrado" });
    }

    res.status(200).json({ mensaje: "Término eliminado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar término" });
  }
});

// Leer el término más reciente (para la parte pública)
router.get("/publica", async (req, res) => {
  try {
    const termino = await Termino.findOne().sort({ fechaCreacion: -1 });
    if (!termino) {
      return res.status(404).json({ error: "No se encontró ningún término" });
    }
    res.status(200).json(termino);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener el término público" });
  }
});

module.exports = router;
