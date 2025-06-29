import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // Menyimpan ID paket yang dibeli
  packageId: {
    type: String,
    required: true,
  },
  
  credits: {
    type: Number,
    required: true,
  },
  
  amount: {
    type: Number,
    required: true,
  },
  
  status: {
    type: String,
    enum: ['pending', 'success', 'failed', 'expired'],
    default: 'pending',
  },
  
  midtransOrderId: {
    type: String,
    required: true,
    unique: true,
  }
}, {
  timestamps: true,
});

export default mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);
