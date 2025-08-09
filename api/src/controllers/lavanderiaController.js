const lavanderiaService = require('../services/lavanderiaService');
const { createLavanderiaSchema, updateLavanderiaSchema } = require('../validations/lavanderiaValidation');

class LavanderiaController {
  /**
   * POST /api/lavanderias - Create owner and laundry
   */
  async create(req, res) {
    try {
      const { body } = req;

      // Validate the request body with Joi
      const { error } = createLavanderiaSchema.validate(body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const { dadosUsuario, dadosLavanderia } = body;

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
      const { body } = req;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          error: 'Laundry ID must be a valid number'
        });
      }

      // Validate the request body with Joi
      const { error } = updateLavanderiaSchema.validate(body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const updatedLaundry = await lavanderiaService.updateLavanderia(id, body);

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
