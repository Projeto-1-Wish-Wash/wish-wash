const Joi = require('joi');

const createUserSchema = Joi.object({
  nome: Joi.string().min(2).required().messages({
    'string.base': 'The name must be a text string',
    'string.min': 'The name must be at least 2 characters long',
    'any.required': 'The name is required'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'The email must have a valid format',
    'any.required': 'The email is required'
  }),
  senha: Joi.string().min(6).required().messages({
    'string.min': 'The password must be at least 6 characters long',
    'any.required': 'The password is required'
  }),
  tipo_usuario: Joi.string().valid('cliente', 'proprietario').required().messages({
    'any.only': 'The user type must be either "cliente" or "proprietario"',
    'any.required': 'The user type is required'
  })
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'The email must be valid',
    'any.required': 'The email is required'
  }),
  password: Joi.string().required().messages({
    'any.required': 'The password is required'
  })
});

const updateUserSchema = Joi.object({
  nome: Joi.string().min(3).messages({
    'string.min': 'The name must be at least 3 characters long'
  }),
  email: Joi.string().email().messages({
    'string.email': 'The email must have a valid format'
  }),
  senha: Joi.string().min(6).messages({
    'string.min': 'The password must be at least 6 characters long'
  })
}).min(1).messages({
  'object.min': 'At least one field must be sent for the update'
});

module.exports = {
  createUserSchema,
  loginSchema,
  updateUserSchema
};