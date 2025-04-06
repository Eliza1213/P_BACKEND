const jwt = require("jsonwebtoken");
const Usuario = require("../models/Usuario");

const authMiddleware = (rolesPermitidos = []) => {
  return async (req, res, next) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ error: "Acceso denegado. No hay token proporcionado." });
    }

    try {
      const decoded = jwt.verify(token, "secreto");

      // Buscar el usuario en la base de datos
      const usuario = await Usuario.findById(decoded.id);
      if (!usuario) {
        throw new Error("Usuario no encontrado");
      }

      // Verificar roles
      if (rolesPermitidos.length && !rolesPermitidos.includes(usuario.rol)) {
        return res.status(403).json({ error: "Acceso denegado. No tienes permisos suficientes." });
      }

      // Asignar el usuario al objeto de solicitud
      req.user = usuario;
      
      // AÑADIR ESTO: También asignar como req.usuario para compatibilidad
      req.usuario = {
        id: usuario._id.toString(),  // Importante convertir a string
        nombre: usuario.nombre,
        email: usuario.email,
        role: usuario.rol
      };
      
      next();
    } catch (error) {
      console.error("Error de autenticación:", error);
      res.status(400).json({ error: "Token inválido o usuario no encontrado." });
    }
  };
};

module.exports = authMiddleware;