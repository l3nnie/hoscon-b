import express from 'express';  
import cors from 'cors';  
import helmet from 'helmet';  
import rateLimit from 'express-rate-limit';  
import session from 'express-session';  
import connectPgSimple from 'connect-pg-simple';  
import pg from 'pg';  
import cookieParser from 'cookie-parser';  
import { errorHandler } from './middleware/errorHandler.js';  
import authRoutes from './routes/authRoutes.js';  
import hostelRoutes from './routes/hostelRoutes.js';  
import adminRoutes from './routes/adminRoutes.js';  
import inquiryRoutes from './routes/inquiryRoutes.js';  
  
const app = express();  
  
// Trust Render's reverse proxy — MUST be before rate limiter and session  
app.set('trust proxy', 1);  
  
// Security middleware  
app.use(helmet());  
  
// CORS configuration  
const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || [];  
const corsOptions = {  
  origin: allowedOrigins.length > 0 ? allowedOrigins : false,  
  credentials: allowedOrigins.length > 0,  
  optionsSuccessStatus: 200  
};  
app.use(cors(corsOptions));  
  
// Rate limiting  
const limiter = rateLimit({  
  windowMs: 15 * 60 * 1000,  
  max: 100,  
  message: 'Too many requests from this IP, please try again later.'  
});  
app.use('/api/', limiter);  
  
// Body parsing - MUST be before routes  
app.use(express.json());  
app.use(express.urlencoded({ extended: true }));  
  
// Cookies and sessions with persistent PostgreSQL store  
const PgStore = connectPgSimple(session);  
const pgPool = new pg.Pool({  
  connectionString: process.env.DATABASE_URL,  
  ssl: { rejectUnauthorized: false }  
});  
  
app.use(cookieParser());  
app.use(session({  
  store: new PgStore({  
    pool: pgPool,  
    tableName: 'user_sessions',  
    createTableIfMissing: true  
  }),  
  secret: process.env.SESSION_SECRET || 'fallback-secret-change-in-prod',  
  resave: false,  
  saveUninitialized: false,  
  cookie: {  
    httpOnly: true,  
    secure: process.env.NODE_ENV === 'production',  
    sameSite: 'lax',  
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days  
  }  
}));  
  
// Routes  
app.use('/api/auth', authRoutes);  
app.use('/api/hostels', hostelRoutes);  
app.use('/api/inquiries', inquiryRoutes);  
app.use('/api/admin', adminRoutes);  
  
// Health check  
app.get('/health', (req, res) => {  
  res.json({ status: 'OK', timestamp: new Date().toISOString() });  
});  
  
// 404 handler  
app.use((req, res) => {  
  res.status(404).json({ error: 'Route not found' });  
});  
  
// Global error handler  
app.use(errorHandler);  
  
export default app;