export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  // Supabase error handling
  if (err.code) {
    switch (err.code) {
      case '23505':
        return res.status(409).json({ error: 'Duplicate entry', details: err.details });
      case '23503':
        return res.status(400).json({ error: 'Foreign key constraint violation', details: err.details });
      case '42P01':
        return res.status(500).json({ error: 'Database configuration error' });
      default:
        return res.status(500).json({ error: 'Database error' });
    }
  }
  
  // Default error
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};