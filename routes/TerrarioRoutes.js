// routes/terrarioRoutes.js
const express = require("express");
const router = express.Router();
const TerrarioData = require("../models/TerrarioData");

// Ruta para guardar datos del terrario
router.post("/terrario-data", async (req, res) => {
  const { dispositivo_id, temperatura, humedad, luz, ventilador, pir } = req.body;

  try {
    const nuevoDato = new TerrarioData({
      dispositivo_id,
      temperatura,
      humedad,
      luz,
      ventilador,
      pir,
    });

    await nuevoDato.save();
    res.status(201).json({ message: "Datos guardados correctamente" });
  } catch (error) {
    console.error("Error al guardar los datos:", error);
    res.status(500).json({ message: "Error al guardar los datos" });
  }
});

module.exports = router;