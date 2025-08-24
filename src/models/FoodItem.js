
import mongoose from 'mongoose';

const FoodItemSchema = new mongoose.Schema({
  name: { type:String, required:true, index:true },
  unit: { type:String, default:'kg' },
  category: String
}, { timestamps:true });

export default mongoose.model('FoodItem', FoodItemSchema);
