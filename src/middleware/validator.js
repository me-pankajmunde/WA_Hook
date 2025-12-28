const Joi = require('joi');
const logger = require('../utils/logger');

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      logger.warn('Validation error', { errors });

      return res.status(400).json({
        error: 'Validation failed',
        details: errors
      });
    }

    next();
  };
};

// Common validation schemas
const schemas = {
  register: Joi.object({
    phoneNumber: Joi.string().required().pattern(/^\+?[1-9]\d{1,14}$/),
    name: Joi.string().optional(),
    email: Joi.string().email().optional(),
    password: Joi.string().min(8).optional()
  }),

  login: Joi.object({
    phoneNumber: Joi.string().required(),
    password: Joi.string().required()
  }),

  createSession: Joi.object({
    title: Joi.string().optional(),
    description: Joi.string().optional(),
    type: Joi.string().valid('daily', 'task', 'project', 'custom').default('daily')
  }),

  sendMessage: Joi.object({
    to: Joi.string().required(),
    message: Joi.string().required().max(4096)
  }),

  buildProject: Joi.object({
    name: Joi.string().required(),
    description: Joi.string().optional(),
    isPrivate: Joi.boolean().default(false),
    files: Joi.array().items(
      Joi.object({
        path: Joi.string().required(),
        content: Joi.string().required()
      })
    ).optional()
  })
};

module.exports = {
  validate,
  schemas
};
