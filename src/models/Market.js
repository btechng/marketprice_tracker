
import mongoose from 'mongoose';

const MarketSchema = new mongoose.Schema({
  location: { type: { type: String, enum: ['Point'], default: 'Point' }, coordinates: { type: [Number], default: [0,0] } },
  name: { type:String, required:true },
  city: String,
  state: String,
  country: { type:String, default:'Nigeria' },
  description: String
}, { timestamps:true });

export default mongoose.model('Market', MarketSchema);

MarketSchema.index({ location: '2dsphere' });
