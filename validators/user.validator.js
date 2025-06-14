const Joi = require('joi');

const createUserSchema = Joi.object({
  firstName: Joi.string().required().messages({
    'string.base': 'First name must be a text',
    'string.empty': 'First name is required',
    'any.required': 'First name is required'
  }),
  lastName: Joi.string().required().messages({
    'string.base': 'Last name must be a text',
    'string.empty': 'Last name is required',
    'any.required': 'Last name is required'
  }),
  phoneNumber: Joi.string().required().messages({
    'string.base': 'Phone number must be a string',
    'string.empty': 'Phone number is required',
    'any.required': 'Phone number is required'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Email must be a valid email address',
    'string.empty': 'Email is required',
    'any.required': 'Email is required'
  }),
  createdAt: Joi.date().required().messages({
    'date.base': 'Created At must be a valid date',
    'any.required': 'Created At is required'
  }),
  updatedAt: Joi.date().required().messages({
    'date.base': 'Updated At must be a valid date',
    'any.required': 'Updated At is required'
  })
});

const updateUserSchema = Joi.object({
  firstName: Joi.string().messages({
    'string.base': 'First name must be a text'
  }),
  lastName: Joi.string().messages({
    'string.base': 'Last name must be a text'
  }),
  phoneNumber: Joi.string().messages({
    'string.base': 'Phone number must be a string'
  }),
  email: Joi.string().email().messages({
    'string.email': 'Email must be a valid email address'
  }),
  createdAt: Joi.date().messages({
    'date.base': 'Created At must be a valid date'
  }),
  updatedAt: Joi.date().messages({
    'date.base': 'Updated At must be a valid date'
  })
});

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    const userFriendlyMessages = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));

    return res.status(400).json({
      success: false,
      message: 'Please correct the following fields:',
      errors: userFriendlyMessages
    });
  }

  next();
};

module.exports = {
  createUserSchema,
  updateUserSchema,
  createUser: validate(createUserSchema),
  updateUser: validate(updateUserSchema)
};