const Joi = require('joi');

const supportSchema = Joi.object({
  nome: Joi.string().min(2).required().messages({
    'string.min': 'O nome deve ter no mínimo 2 caracteres',
    'any.required': 'O campo nome é obrigatório'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'O email deve ter um formato válido',
    'any.required': 'O campo email é obrigatório'
  }),
  mensagem: Joi.string().min(5).required().messages({
    'string.min': 'A mensagem deve ter no mínimo 5 caracteres',
    'any.required': 'O campo mensagem é obrigatório'
  })
});

module.exports = {
  supportSchema
};