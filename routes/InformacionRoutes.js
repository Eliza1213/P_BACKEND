const express = require("express");
const Informacion = require("../models/Informacion"); // Asegúrate de que la ruta del modelo sea correcta
const router = express.Router();

// Crear una nueva información
router.post("/", async (req, res) => {
  try {
    console.log("Datos recibidos:", req.body); // Verifica los datos enviados
    const { especie, alimentacion, temperatura_ideal, humedad_ideal, descripcion, imagen } = req.body;

    if (!especie || !alimentacion || !temperatura_ideal || !humedad_ideal || !descripcion || !imagen) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    const nuevaInformacion = new Informacion({ especie, alimentacion, temperatura_ideal, humedad_ideal, descripcion, imagen });
    await nuevaInformacion.save();
    res.status(201).json({ mensaje: "Información creada con éxito", informacion: nuevaInformacion });
  } catch (error) {
    console.error("Error al crear información:", error);
    res.status(500).json({ error: "Error al crear información en el servidor" });
  }
});

// Obtener toda la información
router.get("/", async (req, res) => {
  try {
    const informaciones = await Informacion.find();
    res.status(200).json(informaciones);
  } catch (error) {
    console.error("Error al obtener la información:", error);
    res.status(500).json({ error: "Error al obtener la información" });
  }
});

// Obtener información por ID
router.get("/:id", async (req, res) => {
  try {
    const informacion = await Informacion.findById(req.params.id);
    if (!informacion) {
      return res.status(404).json({ error: "Información no encontrada" });
    }
    res.status(200).json(informacion);
  } catch (error) {
    console.error("Error al obtener la información:", error);
    res.status(500).json({ error: "Error al obtener la información" });
  }
});

// Actualizar información
router.put("/:id", async (req, res) => {
  try {
    const { especie, alimentacion, temperatura_ideal, humedad_ideal, descripcion, imagen } = req.body;
    const informacion = await Informacion.findByIdAndUpdate(
      req.params.id,
      { especie, alimentacion, temperatura_ideal, humedad_ideal, descripcion, imagen },
      { new: true }
    );

    if (!informacion) {
      return res.status(404).json({ error: "Información no encontrada" });
    }

    res.status(200).json({ mensaje: "Información actualizada", informacion });
  } catch (error) {
    console.error("Error al actualizar la información:", error);
    res.status(500).json({ error: "Error al actualizar la información" });
  }
});

// Eliminar información
router.delete("/:id", async (req, res) => {
  try {
    const informacion = await Informacion.findByIdAndDelete(req.params.id);
    if (!informacion) {
      return res.status(404).json({ error: "Información no encontrada" });
    }

    res.status(200).json({ mensaje: "Información eliminada" });
  } catch (error) {
    console.error("Error al eliminar la información:", error);
    res.status(500).json({ error: "Error al eliminar la información" });
  }
});

module.exports = router;
