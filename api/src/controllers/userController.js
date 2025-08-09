const userService = require('../services/userService');
const { createUserSchema, loginSchema, updateUserSchema } = require('../validations/userValidation');

class UserController {
  /**
   * POST /api/usuarios - Create new user
   */
  async create(req, res) {
    try {
      const { body } = req;

      // Validate the request body with Joi
      const { error } = createUserSchema.validate(body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const newUser = await userService.createUser(body);

      res.status(201).json({
        message: 'User created successfully',
        user: newUser
      });

    } catch (error) {
      console.error('Error creating user:', error);
      
      if (error.message === 'Email is already in use') {
        return res.status(409).json({ error: error.message });
      }

      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }

  /**
   * POST /api/usuarios/login - User login
   */
  async login(req, res) {
    try {
      const { body } = req;
      
      // Validate the request body with Joi
      const { error } = loginSchema.validate(body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const { email, password } = body;
      const result = await userService.loginUser(email, password);

      res.status(200).json({
        message: 'Login successful',
        token: result.token,
        user: result.user
      });

    } catch (error) {
      console.error('Login error:', error);

      if (error.message === 'Invalid credentials') {
        return res.status(401).json({ error: error.message });
      }

      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }

  /**
   * GET /api/usuarios/:id - Find user by ID
   */
  async getUserById(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          error: 'User ID must be a valid number'
        });
      }

      const user = await userService.getUserById(id);

      res.status(200).json({
        user: user
      });

    } catch (error) {
      console.error('Error finding user:', error);

      if (error.message === 'User not found') {
        return res.status(404).json({ error: error.message });
      }

      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }

  /**
   * GET /api/usuarios - List all users
   */
  async getAllUsers(req, res) {
    try {
      const users = await userService.getAllUsers();

      res.status(200).json({
        users: users,
        total: users.length
      });

    } catch (error) {
      console.error('Error listing users:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }

  /**
   * PUT /api/usuarios/:id - Update user
   */
  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { body } = req;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          error: 'User ID must be a valid number'
        });
      }

      // Validate the request body with Joi
      const { error } = updateUserSchema.validate(body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const updatedUser = await userService.updateUser(id, body);

      res.status(200).json({
        message: 'User updated successfully',
        user: updatedUser
      });

    } catch (error) {
      console.error('Error updating user:', error);

      if (error.message === 'User not found') {
        return res.status(404).json({ error: error.message });
      }

      if (error.message === 'Email is already in use by another user') {
        return res.status(409).json({ error: error.message });
      }

      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }

  /**
   * DELETE /api/usuarios/:id - Delete user
   */
  async deleteUser(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          error: 'User ID must be a valid number'
        });
      }

      const deletedUser = await userService.deleteUser(id);

      res.status(200).json({
        message: 'User deleted successfully',
        user: deletedUser
      });

    } catch (error) {
      console.error('Error deleting user:', error);

      if (error.message === 'User not found') {
        return res.status(404).json({ error: error.message });
      }

      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }
}

module.exports = new UserController();