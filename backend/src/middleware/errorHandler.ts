import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  console.error('Unhandled error:', err.message);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    res.status(400).json({ error: 'Validation failed', details: err.message });
    return;
  }

  // Append-only violation
  if (err.message.includes('immutable') || err.message.includes('append-only')) {
    res.status(403).json({ error: err.message });
    return;
  }

  // MongoDB duplicate key
  if ((err as any).code === 11000) {
    res.status(409).json({ error: 'Duplicate key conflict' });
    return;
  }

  res.status(500).json({ error: 'Internal server error' });
}
