const { Joi, celebrate } = require("celebrate");
const validator = require("validator");

// Validation for Url and Item Images
const validateURL = (value, helpers) => {
  if (validator.isURL(value)) {
    return value;
  }
  return helpers.error("string.uri");
};

// Field Validation
const nameField = Joi.string().required().min(2).max(30).messages({
  "string.min": 'The minimum length of the "name" field is 2',
  "string.max": 'The maximum length of the "name" field is 30',
  "string.empty": 'The "name" field must be filled in',
});

const avatarField = Joi.string().required().custom(validateURL).messages({
  "string.empty": 'The "avatar" field must be filled in',
  "string.uri": 'The "avatar" field must be a valid URL',
});

const imageUrlField = Joi.string().required().custom(validateURL).messages({
  "string.empty": 'The "imageUrl" field must be filled in',
  "string.uri": 'The "imageUrl" field must be a valid url',
});

const itemIdField = Joi.string().hex().length(24).required().messages({
  "string.hex": "Invalid item ID format",
  "string.length": "Invalid item ID length",
  "any.required": "Item ID is required",
});

const emailField = Joi.string().required().email().messages({
  "string.empty": 'The "email" field must be filled in',
});

const passwordField = Joi.string().required().messages({
  "string.empty": 'The "password" field must be filled in',
});

// Validation for Clothing Item (create item)
const validateCardBody = celebrate({
  body: Joi.object()
    .keys({
      name: nameField,
      imageUrl: imageUrlField,
    })
    .unknown(true),
});

// Validation for User Registration
const validateRegisterBody = celebrate({
  body: Joi.object().keys({
    name: nameField,
    avatar: avatarField,
    email: emailField,
    password: passwordField,
  }),
});

// Validation for User Login
const validateLoginBody = celebrate({
  body: Joi.object().keys({
    email: emailField,
    password: passwordField,
  }),
});

// ID validation for params (User and clothing item IDs)
const validateId = celebrate({
  params: Joi.object().keys({
    itemId: itemIdField,
  }),
});

const validateUpdateUser = celebrate({
  body: Joi.object().keys({
    name: nameField,
    avatar: avatarField,
  }),
});

module.exports = {
  validateCardBody,
  validateId,
  validateRegisterBody,
  validateLoginBody,
  validateUpdateUser,
};
