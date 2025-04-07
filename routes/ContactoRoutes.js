const express = require("express");
const Contacto = require("../models/Contacto"); // Asegúrate de que la ruta del modelo sea correcta
const router = express.Router();

// Crear un nuevo contacto
router.post("/", async (req, res) => {
  try {
    const { email, telefono, ubicacion, redes_sociales } = req.body;

    if (!email || !telefono || !ubicacion) {
      return res.status(400).json({ error: "Todos los campos obligatorios deben ser completados" });
    }

    const nuevoContacto = new Contacto({ email, telefono, ubicacion, redes_sociales });
    await nuevoContacto.save();
    res.status(201).json({ mensaje: "Contacto creado con éxito", contacto: nuevoContacto });
  } catch (error) {
    console.error("Error al crear contacto:", error);
    res.status(500).json({ error: "Error al crear contacto" });
  }
});

// Leer todos los contactos
router.get("/", async (req, res) => {
  try {
    const contactos = await Contacto.find();
    res.status(200).json(contactos);
  } catch (error) {
    console.error("Error al obtener contactos:", error);
    res.status(500).json({ error: "Error al obtener contactos" });
  }
});

// Leer un contacto por ID
router.get("/:id", async (req, res) => {
  try {
    const contacto = await Contacto.findById(req.params.id);
    if (!contacto) {
      return res.status(404).json({ error: "Contacto no encontrado" });
    }
    res.status(200).json(contacto);
  } catch (error) {
    console.error("Error al obtener contacto:", error);
    res.status(500).json({ error: "Error al obtener contacto" });
  }
});

// Actualizar un contacto
router.put("/:id", async (req, res) => {
  try {
    const { email, telefono, ubicacion, redes_sociales } = req.body;
    const contacto = await Contacto.findByIdAndUpdate(
      req.params.id,
      { email, telefono, ubicacion, redes_sociales },
      { new: true }
    );

    if (!contacto) {
      return res.status(404).json({ error: "Contacto no encontrado" });
    }

    res.status(200).json({ mensaje: "Contacto actualizado con éxito", contacto });
  } catch (error) {
    console.error("Error al actualizar contacto:", error);
    res.status(500).json({ error: "Error al actualizar contacto" });
  }
});

// Eliminar un contacto
router.delete("/:id", async (req, res) => {
  try {
    const contacto = await Contacto.findByIdAndDelete(req.params.id);
    if (!contacto) {
      return res.status(404).json({ error: "Contacto no encontrado" });
    }

    res.status(200).json({ mensaje: "Contacto eliminado con éxito" });
  } catch (error) {
    console.error("Error al eliminar contacto:", error);
    res.status(500).json({ error: "Error al eliminar contacto" });
  }
});

module.exports = router;
