const express = require("express");
const Politica = require("../models/Politica");
const router = express.Router();

// Crear nueva política
router.post("/", async (req, res) => {
  try {
    console.log("Solicitud POST recibida:", req.body); // Depuración
    const { titulo, contenido } = req.body;

    if (!titulo || !contenido) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    const nuevaPolitica = new Politica({ titulo, contenido });
    await nuevaPolitica.save();
    res.status(201).json({ mensaje: "Política creada con éxito", politica: nuevaPolitica });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear política" });
  }
});

// Leer todas las políticas
router.get("/", async (req, res) => {
  try {
    console.log("Solicitud GET recibida"); // Depuración
    const politicas = await Politica.find();
    res.status(200).json(politicas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener políticas" });
  }
});

// Leer una política por ID
router.get("/:id", async (req, res) => {
  try {
    const politica = await Politica.findById(req.params.id);
    if (!politica) {
      return res.status(404).json({ error: "Política no encontrada" });
    }
    res.status(200).json(politica);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener la política" });
  }
});

// Actualizar una política
router.put("/:id", async (req, res) => {
  try {
    console.log("Solicitud PUT recibida:", req.body); // Depuración
    const { titulo, contenido } = req.body;
    const politica = await Politica.findByIdAndUpdate(
      req.params.id,
      { titulo, contenido },
      { new: true }
    );

    if (!politica) {
      return res.status(404).json({ error: "Política no encontrada" });
    }

    res.status(200).json({ mensaje: "Política actualizada", politica });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar política" });
  }
});

// Eliminar una política
router.delete("/:id", async (req, res) => {
  try {
    const politica = await Politica.findByIdAndDelete(req.params.id);
    if (!politica) {
      return res.status(404).json({ error: "Política no encontrada" });
    }

    res.status(200).json({ mensaje: "Política eliminada" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar política" });
  }
});

module.exports = router;
