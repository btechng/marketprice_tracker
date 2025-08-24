
import mongoose from 'mongoose';

const PriceReportSchema = new mongoose.Schema({
  foodItem: { type: mongoose.Schema.Types.ObjectId, ref:'FoodItem', required:true },
  market: { type: mongoose.Schema.Types.ObjectId, ref:'Market', required:true },
  reporter: { type: mongoose.Schema.Types.ObjectId, ref:'User' },
  price: { type:Number, required:true },
  unit: String,
  date: { type: Date, default: Date.now },
  receiptUrl: String,
  status: { type:String, enum:['pending','approved','rejected'], default:'pending' }
}, { timestamps:true });

export default mongoose.model('PriceReport', PriceReportSchema);
