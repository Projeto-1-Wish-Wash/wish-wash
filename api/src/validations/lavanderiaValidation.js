const Joi = require('joi');

const createLavanderiaSchema = Joi.object({
  dadosUsuario: Joi.object({
    nome: Joi.string().min(2).required().messages({
      'string.min': 'The name must be at least 2 characters long',
      'any.required': 'The user name is required'
    }),
    email: Joi.string().email().required().messages({
      'string.email': 'The email must have a valid format',
      'any.required': 'The email is required'
    }),
    senha: Joi.string().min(6).required().messages({
      'string.min': 'The password must be at least 6 characters long',
      'any.required': 'The password is required'
    })
  }).required(),

  dadosLavanderia: Joi.object({
    nome: Joi.string().min(2).required().messages({
      'string.min': 'The laundry name must be at least 2 characters long',
      'any.required': 'The laundry name is required'
    }),
    endereco: Joi.string().optional().allow(null, '').messages({
      'string.base': 'The address must be a text string'
    }),
    telefone: Joi.string().optional().allow(null, '').messages({
      'string.base': 'The phone number must be a text string'
    })
  }).required()
});

const updateLavanderiaSchema = Joi.object({
  nome: Joi.string().optional().min(2).messages({
    'string.min': 'The laundry name must be at least 2 characters long'
  }),
  endereco: Joi.string().optional().allow(null, '').messages({
    'string.base': 'The address must be a text string'
  }),
  telefone: Joi.string().optional().allow(null, '').messages({
    'string.base': 'The phone number must be a text string'
  })
}).min(1).messages({
  'object.min': 'At least one field must be sent for the update'
});

module.exports = {
  createLavanderiaSchema,
  updateLavanderiaSchema
};