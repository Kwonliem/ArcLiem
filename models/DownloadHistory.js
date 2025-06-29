import mongoose from 'mongoose';

const DownloadHistorySchema = new mongoose.Schema({
  
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  
  articleId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  authors: {
    type: [String],
    default: [],
  },
  yearPublished: {
    type: Number,
  },
}, {
  
  timestamps: true, 
});

export default mongoose.models.DownloadHistory || mongoose.model('DownloadHistory', DownloadHistorySchema);
