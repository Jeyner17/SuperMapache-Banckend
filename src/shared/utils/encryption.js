const bcrypt = require('bcryptjs');

/**
 * Utilidades para encriptación
 */

class Encryption {
  /**
   * Hash de contraseña
   */
  static async hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }

  /**
   * Comparar contraseña con hash
   */
  static async comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }
}

module.exports = Encryption;