
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import { config } from './config.js';

import authRoutes from './routes/auth.js';
import marketRoutes from './routes/markets.js';
import foodRoutes from './routes/foodItems.js';
import priceRoutes from './routes/priceReports.js';
import statsRoutes from './routes/stats.js';
import alertsRoutes from './routes/alerts.js';
const app = express();

app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: config.corsOrigin, credentials: true }));

app.get('/', (req,res)=>res.json({ ok:true, service:'Food Price Tracker API' }));

app.use('/api/auth', authRoutes);
app.use('/api/markets', marketRoutes);
app.use('/api/food-items', foodRoutes);
app.use('/api/price-reports', priceRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/alerts', alertsRoutes);

mongoose.connect(config.mongoUri, { dbName: 'food_price_tracker' })
  .then(()=>{
    console.log('MongoDB connected');
    app.listen(config.port, ()=> console.log(`API on :${config.port}`));
  })
  .catch(err=>{
    console.error('DB connection failed', err);
    process.exit(1);
  });
