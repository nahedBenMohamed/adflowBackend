import { Request, Response, NextFunction } from 'express';

export const extractSubdomain = (request: Request, _response: Response, next: NextFunction) => {
  const parts = request.hostname.split('.');
  request.subdomain = parts.length === 3 ? parts[0] : null;

  next();
};
