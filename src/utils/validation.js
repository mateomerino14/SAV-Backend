const { z } = require('zod');

// Common validation schemas
const schemas = {
  email: z.string().email(),
  password: z.string().min(6),
  id: z.number().int().positive(),
  pagination: z.object({
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(10),
  }),
};

// User validation schemas
const userSchemas = {
  register: z
    .object({
      email: schemas.email,
      password: schemas.password,
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords don't match",
      path: ['confirmPassword'],
    }),
  login: z.object({
    email: schemas.email,
    password: schemas.password,
  }),
};

// Validation middleware

const validate = (schema) => {
  return (req, res, next) => {
    try {
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        return res.status(400).json({
          error: 'Validation failed',
          details: errors,
        });
      }

      return res.status(500).json({ error: 'Internal server error' });
    }
  };
};

module.exports = { schemas, userSchemas, validate };
