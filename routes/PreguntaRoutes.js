const express = require("express");
const Preguntas = require("../models/Pregunta");
const bcrypt = require("bcryptjs");
const router = express.Router();

// Crear nueva pregunta
router.post("/", async (req, res) => {
  try {
    const { pregunta, respuesta } = req.body;

    if (!pregunta || !respuesta) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    const nuevaPregunta = new Preguntas({ pregunta, respuesta });
    await nuevaPregunta.save();
    res.status(201).json({ mensaje: "Pregunta creada con éxito", pregunta: nuevaPregunta });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear pregunta" });
  }
});

// Leer todas las preguntas
router.get("/", async (req, res) => {
  try {
    const preguntas = await Preguntas.find();
    res.status(200).json(preguntas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener preguntas" });
  }
});

// Leer una pregunta por ID
router.get("/:id", async (req, res) => {
  try {
    const pregunta = await Preguntas.findById(req.params.id);
    if (!pregunta) {
      return res.status(404).json({ error: "Pregunta no encontrada" });
    }
    res.status(200).json(pregunta);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener la pregunta" });
  }
});

// Actualizar una pregunta
router.put("/:id", async (req, res) => {
  try {
    const { pregunta, respuesta } = req.body;
    const preguntaActualizada = await Preguntas.findByIdAndUpdate(
      req.params.id,
      { pregunta, respuesta },
      { new: true }
    );

    if (!preguntaActualizada) {
      return res.status(404).json({ error: "Pregunta no encontrada" });
    }

    res.status(200).json({ mensaje: "Pregunta actualizada", pregunta: preguntaActualizada });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar pregunta" });
  }
});

// Eliminar una pregunta
router.delete("/:id", async (req, res) => {
  try {
    const pregunta = await Preguntas.findByIdAndDelete(req.params.id);
    if (!pregunta) {
      return res.status(404).json({ error: "Pregunta no encontrada" });
    }

    res.status(200).json({ mensaje: "Pregunta eliminada" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar pregunta" });
  }
});

module.exports = router;
