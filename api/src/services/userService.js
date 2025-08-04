const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../../prisma/client');

class UserService {
  /**
   * Creates a new user (client or owner)
   * @param {Object} userData - User data {nome, email, senha, tipo_usuario}
   * @returns {Promise<Object>} - Created user (without password)
   */
  async createUser(userData) {
    const { nome, email, senha, tipo_usuario = 'cliente' } = userData;

    // Check if email already exists
    const existingUser = await prisma.usuario.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new Error('Email is already in use');
    }

    // Encrypt password
    const salt = await bcrypt.genSalt(10);
    const senha_hash = await bcrypt.hash(senha, salt);

    // Create user
    const newUser = await prisma.usuario.create({
      data: {
        nome,
        email,
        senha_hash,
        tipo_usuario
      },
      select: {
        id: true,
        nome: true,
        email: true,
        tipo_usuario: true,
        createdAt: true
      }
    });

    return newUser;
  }

  /**
   * Authenticates a user and returns a JWT token
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} - Token and user data
   */
  async loginUser(email, password) {
    // Find user by email
    const user = await prisma.usuario.findUnique({
      where: { email }
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.senha_hash);
    if (!validPassword) {
      throw new Error('Invalid credentials');
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        tipo_usuario: user.tipo_usuario 
      },
      process.env.JWT_SECRET || 'wishwash_secret_key',
      { expiresIn: '24h' }
    );

    // Return data without password
    const { senha_hash, ...userWithoutPassword } = user;

    return {
      token,
      user: userWithoutPassword
    };
  }

  /**
   * Find user by ID
   * @param {number} id - User ID
   * @returns {Promise<Object>} - User data
   */
  async getUserById(id) {
    const user = await prisma.usuario.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        nome: true,
        email: true,
        tipo_usuario: true,
        createdAt: true
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  /**
   * List all users (for administration)
   * @returns {Promise<Array>} - List of users
   */
  async getAllUsers() {
    const users = await prisma.usuario.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        tipo_usuario: true,
        createdAt: true
      }
    });

    return users;
  }

  /**
   * Updates user data
   * @param {number} id - User ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} - Updated user
   */
  async updateUser(id, updateData) {
    const { nome, email, senha } = updateData;
    const dataToUpdate = {};

    if (nome) dataToUpdate.nome = nome;
    if (email) {
      // Check if email is already in use by another user
      const existingEmail = await prisma.usuario.findFirst({
        where: { 
          email,
          NOT: { id: parseInt(id) }
        }
      });

      if (existingEmail) {
        throw new Error('Email is already in use by another user');
      }

      dataToUpdate.email = email;
    }

    // If new password provided, encrypt it
    if (senha) {
      const salt = await bcrypt.genSalt(10);
      dataToUpdate.senha_hash = await bcrypt.hash(senha, salt);
    }

    const updatedUser = await prisma.usuario.update({
      where: { id: parseInt(id) },
      data: dataToUpdate,
      select: {
        id: true,
        nome: true,
        email: true,
        tipo_usuario: true,
        createdAt: true
      }
    });

    return updatedUser;
  }

  /**
   * Deletes a user
   * @param {number} id - User ID
   * @returns {Promise<Object>} - Deleted user
   */
  async deleteUser(id) {
    const user = await prisma.usuario.findUnique({
      where: { id: parseInt(id) }
    });

    if (!user) {
      throw new Error('User not found');
    }

    const deletedUser = await prisma.usuario.delete({
      where: { id: parseInt(id) },
      select: {
        id: true,
        nome: true,
        email: true,
        tipo_usuario: true
      }
    });

    return deletedUser;
  }
}

module.exports = new UserService();
