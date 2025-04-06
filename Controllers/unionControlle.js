const Union = require('../models/Union');
const DispositivoUsuario = require('../models/DispositivoUsuario');
const Producto = require('../models/Producto');
const mongoose = require('mongoose');

// Controlador para vincular dispositivo
const vincularDispositivo = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { dispositivoId } = req.body;

    if (!dispositivoId) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ error: 'Se requiere ID del dispositivo' });
    }

    // Verificar si el dispositivo ya está vinculado
    const existeVinculo = await Union.findOne({ 
      dispositivo: dispositivoId, 
      usuario: req.user.id 
    });

    if (existeVinculo) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ error: 'El dispositivo ya está vinculado' });
    }

    // Verificar si el dispositivo existe y no está asignado
    const dispositivo = await DispositivoUsuario.findById(dispositivoId);

    if (!dispositivo) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: 'Dispositivo no encontrado' });
    }

    const nuevoVinculo = new Union({
      usuario: req.user.id,
      dispositivo: dispositivoId,
      activo: false
    });

    await nuevoVinculo.save({ session });

    // Actualizar estado del dispositivo si es necesario
    dispositivo.activo = true;
    await dispositivo.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      mensaje: 'Dispositivo vinculado exitosamente',
      vinculo: nuevoVinculo
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error en vincularDispositivo:', error);
    res.status(500).json({ 
      error: 'Error al vincular dispositivo',
      detalle: error.message 
    });
  }
};

// Controlador para activar/desactivar
const activarDispositivo = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { activo } = req.body;
    const { id } = req.params;

    const vinculo = await Union.findOneAndUpdate(
      { _id: id, usuario: req.user.id },
      { 
        activo, 
        ultimaActivacion: activo ? Date.now() : null 
      },
      { 
        new: true,
        session 
      }
    );

    if (!vinculo) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: 'Vínculo no encontrado' });
    }

    // Actualizar estado del dispositivo asociado
    await DispositivoUsuario.findByIdAndUpdate(
      vinculo.dispositivo, 
      { activo },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.json({
      mensaje: `Dispositivo ${activo ? 'activado' : 'desactivado'}`,
      vinculo
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
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
      .populate({
        path: 'dispositivo',
        populate: {
          path: 'producto',
          select: 'nombre descripcion imagenes esIoT'
        }
      })
      .select('-__v -usuario');

    // Transformar los dispositivos para incluir información del producto
    const dispositivosConInfo = dispositivos.map(vinculo => {
      const dispositivo = vinculo.dispositivo;
      const producto = dispositivo.producto;

      return {
        _id: vinculo._id,
        activo: vinculo.activo,
        ultimaActivacion: vinculo.ultimaActivacion,
        identificadorIoT: dispositivo.identificadorIoT,
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        imagenes: producto.imagenes,
        esIoT: producto.esIoT
      };
    });

    res.json(dispositivosConInfo);
  } catch (error) {
    console.error('Error en obtenerDispositivosUsuario:', error);
    res.status(500).json({ 
      error: 'Error al obtener dispositivos',
      detalle: error.message 
    });
  }
};

// Controlador para desenlazar dispositivo
const desenlazarDispositivo = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;

    // Encontrar y eliminar el vínculo
    const vinculo = await Union.findOneAndDelete({ 
      _id: id, 
      usuario: req.user.id 
    }, { session });

    if (!vinculo) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: 'Vínculo no encontrado' });
    }

    // Marcar dispositivo como no activo
    await DispositivoUsuario.findByIdAndUpdate(
      vinculo.dispositivo, 
      { activo: false },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.json({
      mensaje: 'Dispositivo desenlazado exitosamente',
      vinculoEliminado: vinculo
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error en desenlazarDispositivo:', error);
    res.status(500).json({ 
      error: 'Error al desenlazar dispositivo',
      detalle: error.message 
    });
  }
};

module.exports = {
  vincularDispositivo,
  activarDispositivo,
  obtenerDispositivosUsuario,
  desenlazarDispositivo
};