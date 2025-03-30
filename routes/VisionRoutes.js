const express = require("express");
const Vision = require("../models/Vision");  // Importar el modelo de Vision
const router = express.Router();

// Crear nueva visión
router.post("/", async (req, res) => {
  try {
    console.log("Solicitud POST recibida:", req.body); // Depuración
    const { titulo, descripcion } = req.body;

    if (!titulo || !descripcion) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    const nuevaVision = new Vision({ titulo, descripcion });
    await nuevaVision.save();
    res.status(201).json({ mensaje: "Visión creada con éxito", vision: nuevaVision });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear visión" });
  }
});

// Leer todas las visiones
router.get("/", async (req, res) => {
  try {
    const visiones = await Vision.find();
    res.status(200).json(visiones);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener visiones" });
  }
});

// Leer una visión por ID
router.get("/:id", async (req, res) => {
  try {
    const vision = await Vision.findById(req.params.id);
    if (!vision) {
      return res.status(404).json({ error: "Visión no encontrada" });
    }
    res.status(200).json(vision);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener la visión" });
  }
});

// Actualizar una visión
router.put("/:id", async (req, res) => {
  try {
    console.log("Solicitud PUT recibida:", req.body); // Depuración
    const { titulo, descripcion } = req.body;
    const vision = await Vision.findByIdAndUpdate(
      req.params.id,
      { titulo, descripcion },
      { new: true }
    );

    if (!vision) {
      return res.status(404).json({ error: "Visión no encontrada" });
    }

    res.status(200).json({ mensaje: "Visión actualizada", vision });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar visión" });
  }
});

// Eliminar una visión
router.delete("/:id", async (req, res) => {
  try {
    const vision = await Vision.findByIdAndDelete(req.params.id);
    if (!vision) {
      return res.status(404).json({ error: "Visión no encontrada" });
    }

    res.status(200).json({ mensaje: "Visión eliminada" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar visión" });
  }
});

module.exports = router;
