
import express from 'express';
import PriceReport from '../models/PriceReport.js';
import mongoose from 'mongoose';

const router = express.Router();

router.get('/average', async (req,res)=>{
  const { foodItem, market } = req.query;
  if(!foodItem) return res.status(400).json({error:'foodItem required'});
  const filter = { status:'approved', foodItem: new mongoose.Types.ObjectId(foodItem) };
  if(market) filter.market = new mongoose.Types.ObjectId(market);

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday); startOfYesterday.setDate(startOfYesterday.getDate()-1);
  const startOfLastWeek = new Date(startOfToday); startOfLastWeek.setDate(startOfLastWeek.getDate()-7);

  const [current, yday, week] = await Promise.all([
    PriceReport.aggregate([ { $match: filter }, { $group: { _id: null, avg: { $avg:'$price' } } } ]),
    PriceReport.aggregate([ { $match: { ...filter, date: { $gte: startOfYesterday, $lt: startOfToday } } }, { $group: { _id: null, avg: { $avg:'$price' } } } ]),
    PriceReport.aggregate([ { $match: { ...filter, date: { $gte: startOfLastWeek } } }, { $group: { _id: null, avg: { $avg:'$price' } } } ]),
  ]);
  const avg = current[0]?.avg ?? null;
  const yavg = yday[0]?.avg ?? null;
  const wavg = week[0]?.avg ?? null;
  res.json({ average: avg, vsYesterday: yavg ? (avg - yavg) : null, vsLastWeek: wavg ? (avg - wavg) : null });
});

router.get('/trend', async (req,res)=>{
  const { foodItem, market, days=30 } = req.query;
  if(!foodItem) return res.status(400).json({error:'foodItem required'});
  const filter = { status:'approved', foodItem: new mongoose.Types.ObjectId(foodItem) };
  if(market) filter.market = new mongoose.Types.ObjectId(market);
  const since = new Date(); since.setDate(since.getDate()-Number(days));
  const agg = await PriceReport.aggregate([
    { $match: { ...filter, date: { $gte: since } } },
    { $group: { _id: { d: { $dateToString: { format: '%Y-%m-%d', date:'$date' } } }, avg: { $avg:'$price' } } },
    { $project: { _id:0, date:'$_id.d', avg:1 } },
    { $sort: { date:1 } }
  ]);
  res.json(agg);
});

router.get('/extremes', async (req,res)=>{
  const { foodItem, limit=5 } = req.query;
  if(!foodItem) return res.status(400).json({error:'foodItem required'});
  const agg = await PriceReport.aggregate([
    { $match: { status:'approved', foodItem: new mongoose.Types.ObjectId(foodItem) } },
    { $group: { _id:'$market', avg: { $avg:'$price' } } },
    { $lookup: { from: 'markets', localField: '_id', foreignField: '_id', as: 'market' } },
    { $unwind: '$market' },
    { $project: { market:'$market', avg:1 } },
    { $sort: { avg:1 } }
  ]);
  res.json({
    cheapest: agg.slice(0, Number(limit)),
    mostExpensive: agg.slice(-Number(limit)).reverse()
  });
});

export default router;
