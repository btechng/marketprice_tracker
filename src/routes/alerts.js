
import express from 'express';
import { auth } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

router.get('/', auth, async (req,res)=>{
  const u = await User.findById(req.user._id).populate('alerts.foodItem alerts.market','name');
  res.json(u.alerts || []);
});

router.post('/', auth, async (req,res)=>{
  const { foodItem, market, threshold, direction } = req.body;
  if(!foodItem || !threshold) return res.status(400).json({error:'Missing fields'});
  const u = await User.findById(req.user._id);
  u.alerts.push({ foodItem, market, threshold, direction: direction || 'below' });
  await u.save();
  res.json(u.alerts);
});

router.delete('/:alertId', auth, async (req,res)=>{
  const u = await User.findById(req.user._id);
  u.alerts = u.alerts.filter(a => String(a._id) !== req.params.alertId);
  await u.save();
  res.json(u.alerts);
});

router.get('/notifications', auth, async (req,res)=>{
  const u = await User.findById(req.user._id);
  res.json(u.notifications || []);
});

export default router;
