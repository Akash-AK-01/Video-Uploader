import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a video title'],
    trim: true
  },
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  filepath: {
    type: String,
    required: true
  },
  filesize: {
    type: Number,
    required: true
  },
  mimetype: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['processing', 'safe', 'flagged', 'rejected'],
    default: 'processing'
  },
  sensitivityScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  processedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for faster queries
videoSchema.index({ uploadedBy: 1, status: 1 });
videoSchema.index({ uploadDate: -1 });

const Video = mongoose.model('Video', videoSchema);

export default Video;
