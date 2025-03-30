const express = require("express");
const Mision = require("../models/Mision");
const router = express.Router();

// Crear nueva misión
router.post("/", async (req, res) => {
  try {
    console.log("Solicitud POST recibida:", req.body); // Depuración
    const { titulo, descripcion } = req.body;

    if (!titulo || !descripcion) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    const nuevaMision = new Mision({ titulo, descripcion });
    await nuevaMision.save();
    res.status(201).json({ mensaje: "Misión creada con éxito", mision: nuevaMision });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear misión" });
  }
});

// Leer todas las misiones
router.get("/", async (req, res) => {
  try {
    const misiones = await Mision.find();
    res.status(200).json(misiones);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener misiones" });
  }
});

// Leer una misión por ID
router.get("/:id", async (req, res) => {
  try {
    const mision = await Mision.findById(req.params.id);
    if (!mision) {
      return res.status(404).json({ error: "Misión no encontrada" });
    }
    res.status(200).json(mision);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener la misión" });
  }
});

// Actualizar una misión
router.put("/:id", async (req, res) => {
  try {
    console.log("Solicitud PUT recibida:", req.body); // Depuración
    const { titulo, descripcion } = req.body;
    const mision = await Mision.findByIdAndUpdate(
      req.params.id,
      { titulo, descripcion },
      { new: true }
    );

    if (!mision) {
      return res.status(404).json({ error: "Misión no encontrada" });
    }

    res.status(200).json({ mensaje: "Misión actualizada", mision });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar misión" });
  }
});

// Eliminar una misión
router.delete("/:id", async (req, res) => {
  try {
    const mision = await Mision.findByIdAndDelete(req.params.id);
    if (!mision) {
      return res.status(404).json({ error: "Misión no encontrada" });
    }

    res.status(200).json({ mensaje: "Misión eliminada" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar misión" });
  }
});

module.exports = router;