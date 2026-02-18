import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth';
const app = express();

app.use('/api/auth', authRoutes);
app.use(express.json());
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));
app.use(cookieParser());

// Example route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

export default app;