const Union = require('../models/Union');

// Controlador para vincular dispositivo
const vincularDispositivo = async (req, res) => {
  try {
    const { dispositivoId } = req.body;

    if (!dispositivoId) {
      return res.status(400).json({ error: 'Se requiere ID del dispositivo' });
    }

    const nuevoVinculo = new Union({
      usuario: req.user.id,
      dispositivo: dispositivoId,
      activo: false
    });

    await nuevoVinculo.save();
    res.status(201).json({
      mensaje: 'Dispositivo vinculado exitosamente',
      vinculo: nuevoVinculo
    });

  } catch (error) {
    console.error('Error en vincularDispositivo:', error);
    res.status(500).json({ 
      error: 'Error al vincular dispositivo',
      detalle: error.message 
    });
  }
};

// Controlador para activar/desactivar
const activarDispositivo = async (req, res) => {
  try {
    const { activo } = req.body;
    const { id } = req.params;

    const vinculo = await Union.findOneAndUpdate(
      { _id: id, usuario: req.user.id },
      { activo, ultimaActivacion: activo ? Date.now() : null },
      { new: true }
    );

    if (!vinculo) {
      return res.status(404).json({ error: 'Vínculo no encontrado' });
    }

    res.json({
      mensaje: `Dispositivo ${activo ? 'activado' : 'desactivado'}`,
      vinculo
    });

  } catch (error) {
    console.error('Error en activarDispositivo:', error);
    res.status(500).json({ 
      error: 'Error al cambiar estado',
      detalle: error.message 
    });
  }
};

// Controlador para listar dispositivos
const obtenerDispositivosUsuario = async (req, res) => {
  try {
    const dispositivos = await Union.find({ usuario: req.user.id })
      .select('-__v -usuario');

    res.json(dispositivos);
  } catch (error) {
    console.error('Error en obtenerDispositivosUsuario:', error);
    res.status(500).json({ 
      error: 'Error al obtener dispositivos',
      detalle: error.message 
    });
  }
};

module.exports = {
  vincularDispositivo,
  activarDispositivo,
  obtenerDispositivosUsuario
};