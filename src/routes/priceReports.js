
import express from 'express';
import multer from 'multer';
import PriceReport from '../models/PriceReport.js';
import FoodItem from '../models/FoodItem.js';
import Market from '../models/Market.js';
import User from '../models/User.js';
import { auth, requireRole } from '../middleware/auth.js';
import { Types } from 'mongoose';
import { maybeSendEmail } from '../utils/notify.js';
import { uploadReceipt } from '../utils/storage.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.post('/', auth, upload.single('receipt'), async (req,res)=>{
  const { foodItem, market, price, unit, date } = req.body;
  if(!foodItem || !market || !price) return res.status(400).json({error:'Missing fields'});
  let receiptUrl;
  if(req.file){
    const b64 = req.file.buffer.toString('base64');
    receiptUrl = `data:${req.file.mimetype};base64,${b64}`;
  }
  const report = await PriceReport.create({
    foodItem, market, price, unit, date: date ? new Date(date) : new Date(),
    reporter: req.user._id, receiptUrl
  });
  await User.findByIdAndUpdate(req.user._id, { $inc: { points: 5 } });
  res.json(report);
});

router.patch('/:id/status', auth, requireRole('admin'), async (req,res)=>{
  const { status } = req.body;
  if(!['approved','rejected','pending'].includes(status)) return res.status(400).json({error:'Bad status'});
  const report = await PriceReport.findByIdAndUpdate(req.params.id, { status }, { new:true });
  if(!report) return res.status(404).json({error:'Not found'});

  if(status === 'approved'){
    const item = await FoodItem.findById(report.foodItem);
    const users = await User.find({ 'alerts.foodItem': report.foodItem });
    for(const u of users){
      for(const alert of u.alerts){
        if(String(alert.foodItem) !== String(report.foodItem)) continue;
        if(alert.market && String(alert.market) !== String(report.market)) continue;
        const hit = alert.direction === 'below' ? (report.price <= alert.threshold) : (report.price >= alert.threshold);
        if(hit){
          u.notifications.push({ message: `Price alert: ${item.name} is ${report.price} at your watched market.` });
          await u.save();
          await maybeSendEmail({
            to: u.email,
            subject: 'Food Price Alert',
            text: `Good news! ${item.name} is now ${report.price}.`
          }).catch(()=>{});
        }
      }
    }
  }
  res.json(report);
});

router.get('/', async (req,res)=>{
  const { foodItem, market, status='approved', page=1, limit=20 } = req.query;
  const filter = {};
  if(foodItem) filter.foodItem = new Types.ObjectId(foodItem);
  if(market) filter.market = new Types.ObjectId(market);
  if(status) filter.status = status;
  const skip = (Number(page)-1)*Number(limit);
  const [items, total] = await Promise.all([
    PriceReport.find(filter).populate('foodItem market reporter','name email')
      .sort({ createdAt:-1 }).skip(skip).limit(Number(limit)),
    PriceReport.countDocuments(filter)
  ]);
  res.json({ items, total, page:Number(page), pages: Math.ceil(total/Number(limit)) });
});

export default router;
