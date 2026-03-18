import cors from 'cors';
import express from 'express';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth';
import userRoutes from './routes/user.js';
import caseRoutes from './routes/case.js';
import taskRoutes from './routes/task.js';
import eventRoutes from './routes/event.js';
import documentRoutes from './routes/document.js';
import path from 'path';
import invoiceRoutes from './routes/invoice.js';
import auditRoutes from './routes/audit';
import calendarRoutes from './routes/calendar';
import billingRoutes from './routes/billing';
import auditFeedRoutes from './routes/auditFeed';


const app = express();

// 1. CORS middleware FIRST!
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// 2. Then JSON/body parser
app.use(express.json());

// 3. Then cookie parser
app.use(cookieParser());

// 4. Then your routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api', taskRoutes);
app.use('/api', eventRoutes);
app.use('/api', documentRoutes);
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.use('/api', invoiceRoutes);
app.use('/api', auditRoutes);
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});
app.use('/api', auditFeedRoutes);
app.use('/api', calendarRoutes);
app.use('/api', billingRoutes);

export default app;