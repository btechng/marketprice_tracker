
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import User from '../models/User.js';

export const auth = async (req,res,next)=>{
  try{
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if(!token) return res.status(401).json({error:'No token'});
    const payload = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(payload.id);
    if(!user) return res.status(401).json({error:'Invalid token user'});
    req.user = user;
    next();
  }catch(e){
    return res.status(401).json({error:'Unauthorized'});
  }
};

export const requireRole = (...roles)=> (req,res,next)=>{
  if(!req.user) return res.status(401).json({error:'Unauthorized'});
  if(!roles.includes(req.user.role)) return res.status(403).json({error:'Forbidden'});
  next();
}
