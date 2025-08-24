
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { config } from '../config.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.post('/register',
  body('email').isEmail(),
  body('password').isLength({min:6}),
  async (req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()) return res.status(400).json({errors: errors.array()});
    const { name, email, password, role } = req.body;
    const exists = await User.findOne({ email });
    if(exists) return res.status(400).json({error:'Email already used'});
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash, role: role || 'user' });
    const token = jwt.sign({ id: user._id }, config.jwtSecret, { expiresIn: '7d' });
    res.json({ token, user });
  }
);

router.post('/login', async (req,res)=>{
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if(!user) return res.status(400).json({error:'Invalid credentials'});
  const ok = await bcrypt.compare(password, user.passwordHash);
  if(!ok) return res.status(400).json({error:'Invalid credentials'});
  const token = jwt.sign({ id: user._id }, config.jwtSecret, { expiresIn: '7d' });
  res.json({ token, user });
});

router.get('/me', auth, async (req,res)=>{
  res.json(req.user);
});

export default router;
