import express, { Application } from 'express';
import cors from 'cors';
import request from 'supertest';
import { errorHandler } from '../../middleware/errorHandler';
import authRoutes from '../../routes/auth';
import listingRoutes from '../../routes/listings';
import bookingRoutes from '../../routes/bookings';
import reviewRoutes from '../../routes/reviews';

export function createApp(): Application {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use('/api/auth', authRoutes);
  app.use('/api/listings', listingRoutes);
  app.use('/api/bookings', bookingRoutes);
  app.use('/api/reviews', reviewRoutes);

  app.use(errorHandler);

  return app;
}

export async function getAuthToken(
  app: Application,
  email: string,
  password: string
): Promise<string> {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email, password });

  if (!res.body.token) {
    throw new Error(
      `getAuthToken: login failed for ${email} — status ${res.status}, body: ${JSON.stringify(res.body)}`
    );
  }

  return res.body.token as string;
}
