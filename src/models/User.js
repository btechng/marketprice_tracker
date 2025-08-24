
import mongoose from 'mongoose';

const AlertSchema = new mongoose.Schema({
  foodItem: { type: mongoose.Schema.Types.ObjectId, ref:'FoodItem', required: true },
  market: { type: mongoose.Schema.Types.ObjectId, ref:'Market' },
  threshold: { type: Number, required: true },
  direction: { type: String, enum:['below','above'], default:'below' }
}, { _id: true });

const NotificationSchema = new mongoose.Schema({
  message: String,
  read: { type:Boolean, default:false },
  createdAt: { type: Date, default: Date.now }
}, { _id: true });

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type:String, unique:true, index:true },
  passwordHash: String,
  role: { type:String, enum:['user','reporter','admin'], default:'user' },
  points: { type:Number, default:0 },
  language: { type:String, default:'en' },
  alerts: [AlertSchema],
  notifications: [NotificationSchema]
}, { timestamps:true });

export default mongoose.model('User', UserSchema);
