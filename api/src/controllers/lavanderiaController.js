const lavanderiaService = require('../services/lavanderiaService');

class LavanderiaController {
  /**
   * POST /api/lavanderias - Create owner and laundry
   */
  async create(req, res) {
    try {
      const { dadosUsuario, dadosLavanderia } = req.body;

      // User data validation
      if (!dadosUsuario || !dadosUsuario.nome || !dadosUsuario.email || !dadosUsuario.senha) {
        return res.status(400).json({
          error: 'Owner data is required: name, email and password'
        });
      }

      // Laundry data validation
      if (!dadosLavanderia || !dadosLavanderia.nome) {
        return res.status(400).json({
          error: 'Laundry name is required'
        });
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(dadosUsuario.email)) {
        return res.status(400).json({
          error: 'Email must have a valid format'
        });
      }

      // Password validation
      if (dadosUsuario.senha.length < 6) {
        return res.status(400).json({
          error: 'Password must be at least 6 characters long'
        });
      }

      const result = await lavanderiaService.createProprietarioComLavanderia(
        dadosUsuario,
        dadosLavanderia
      );

      res.status(201).json({
        message: 'Owner and laundry created successfully',
        proprietario: result.proprietario,
        lavanderia: result.lavanderia
      });

    } catch (error) {
      console.error('Error creating laundry:', error);

      // Prisma specific error handling
      if (error.code === 'P2002') {
        return res.status(409).json({
          error: 'Email is already in use'
        });
      }

      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }

  /**
   * GET /api/lavanderias - List all laundries
   */
  async getAllLavanderias(req, res) {
    try {
      const laundries = await lavanderiaService.getAllLavanderias();

      res.status(200).json({
        lavanderias: laundries,
        total: laundries.length
      });

    } catch (error) {
      console.error('Error listing laundries:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }

  /**
   * GET /api/lavanderias/:id - Find laundry by ID
   */
  async getLavanderiaById(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          error: 'Laundry ID must be a valid number'
        });
      }

      const laundry = await lavanderiaService.getLavanderiaById(id);

      if (!laundry) {
        return res.status(404).json({
          error: 'Laundry not found'
        });
      }

      res.status(200).json({
        lavanderia: laundry
      });

    } catch (error) {
      console.error('Error finding laundry:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }

  /**
   * GET /api/lavanderias/proprietario/:proprietarioId - Find laundries by owner
   */
  async getLavanderiasByProprietario(req, res) {
    try {
      const { proprietarioId } = req.params;

      if (!proprietarioId || isNaN(proprietarioId)) {
        return res.status(400).json({
          error: 'Owner ID must be a valid number'
        });
      }

      const laundries = await lavanderiaService.getLavanderiasByProprietario(proprietarioId);

      res.status(200).json({
        lavanderias: laundries,
        total: laundries.length
      });

    } catch (error) {
      console.error('Error finding laundries by owner:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }

  /**
   * PUT /api/lavanderias/:id - Update laundry
   */
  async updateLavanderia(req, res) {
    try {
      const { id } = req.params;
      const { nome, endereco, telefone } = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          error: 'Laundry ID must be a valid number'
        });
      }

      // At least one field must be provided
      if (!nome && endereco === undefined && telefone === undefined) {
        return res.status(400).json({
          error: 'At least one field must be provided for update'
        });
      }

      const updatedLaundry = await lavanderiaService.updateLavanderia(id, {
        nome,
        endereco,
        telefone
      });

      res.status(200).json({
        message: 'Laundry updated successfully',
        lavanderia: updatedLaundry
      });

    } catch (error) {
      console.error('Error updating laundry:', error);

      // Record not found error handling
      if (error.code === 'P2025') {
        return res.status(404).json({
          error: 'Laundry not found'
        });
      }

      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }

  /**
   * DELETE /api/lavanderias/:id - Delete laundry
   */
  async deleteLavanderia(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          error: 'Laundry ID must be a valid number'
        });
      }

      const deletedLaundry = await lavanderiaService.deleteLavanderia(id);

      res.status(200).json({
        message: 'Laundry deleted successfully',
        lavanderia: deletedLaundry
      });

    } catch (error) {
      console.error('Error deleting laundry:', error);

      if (error.message === 'Lavanderia não encontrada') {
        return res.status(404).json({ error: 'Laundry not found' });
      }

      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }
}

module.exports = new LavanderiaController();
