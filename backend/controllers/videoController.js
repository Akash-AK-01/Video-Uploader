import Video from '../models/Video.js';
import { analyzeVideoSensitivity } from '../services/sensitivityAnalysis.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// @desc    Upload video
// @route   POST /api/videos/upload
// @access  Private (Editor, Admin)
export const uploadVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a video file'
      });
    }

    const { title } = req.body;
    const { filename, originalname, path: filepath, size, mimetype } = req.file;

    // Create video document
    const video = await Video.create({
      title: title || originalname,
      filename,
      originalName: originalname,
      filepath,
      filesize: size,
      mimetype,
      uploadedBy: req.user._id,
      status: 'processing'
    });

    // Emit socket event - upload complete
    if (req.io) {
      req.io.to(req.user._id.toString()).emit('upload:complete', {
        videoId: video._id,
        message: 'Video uploaded successfully, starting analysis...'
      });
    }

    // Start sensitivity analysis asynchronously
    analyzeAndUpdateVideo(video._id, filepath, originalname, req.io, req.user._id.toString());

    res.status(201).json({
      success: true,
      data: video
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Async function to analyze video and update status
const analyzeAndUpdateVideo = async (videoId, filepath, filename, io, userId) => {
  try {
    // Emit processing started
    if (io) {
      io.to(userId).emit('video:processing', {
        videoId,
        stage: 'analyzing',
        progress: 50
      });
    }

    // Perform sensitivity analysis
    const analysis = await analyzeVideoSensitivity(filepath, filename);

    // Update video with analysis results
    const video = await Video.findByIdAndUpdate(
      videoId,
      {
        status: analysis.status,
        sensitivityScore: analysis.score,
        duration: analysis.metadata?.duration || 0,
        processedAt: Date.now()
      },
      { new: true }
    );

    // Emit analysis complete
    if (io) {
      io.to(userId).emit('video:analyzed', {
        videoId,
        status: analysis.status,
        score: analysis.score,
        reasons: analysis.reasons,
        progress: 100
      });
    }

  } catch (error) {
    console.error('Analysis error:', error);
    
    // Mark as safe if analysis fails
    await Video.findByIdAndUpdate(videoId, {
      status: 'safe',
      processedAt: Date.now()
    });

    if (io) {
      io.to(userId).emit('video:error', {
        videoId,
        message: 'Analysis failed, marked as safe by default'
      });
    }
  }
};

// @desc    Get all videos
// @route   GET /api/videos
// @access  Private
export const getVideos = async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};

    // Role-based filtering
    if (req.user.role === 'viewer') {
      // Viewers can see ALL safe videos from any user
      query.status = 'safe';
    } else if (req.user.role === 'editor') {
      // Editors see only their own videos
      query.uploadedBy = req.user._id;
      // Apply status filter if provided
      if (status && status !== 'all') {
        query.status = status;
      }
    } else if (req.user.role === 'admin') {
      // Admins can see all videos from all users
      // Apply status filter if provided
      if (status && status !== 'all') {
        query.status = status;
      }
    }

    console.log('📹 Get Videos - User:', req.user.email, 'Role:', req.user.role, 'Query:', query);

    const videos = await Video.find(query)
      .populate('uploadedBy', 'name email')
      .sort({ uploadDate: -1 });

    console.log('📹 Videos found:', videos.length);

    res.status(200).json({
      success: true,
      count: videos.length,
      data: videos
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single video
// @route   GET /api/videos/:id
// @access  Private
export const getVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id)
      .populate('uploadedBy', 'name email');

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    // Check access permissions
    if (req.user.role === 'viewer' && video.status !== 'safe') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this video'
      });
    }

    if (req.user.role !== 'admin' && video.uploadedBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this video'
      });
    }

    res.status(200).json({
      success: true,
      data: video
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Stream video
// @route   GET /api/videos/:id/stream
// @access  Private (token via query param for video tag)
export const streamVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).send('Video not found');
    }

    // Check access permissions
    // Viewers can only see safe videos
    if (req.user.role === 'viewer' && video.status !== 'safe') {
      return res.status(403).send('Access denied - content not available for viewers');
    }

    // Non-admin users can only view their own videos (unless they're viewers viewing safe content)
    const isOwner = video.uploadedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    const isViewerWatchingSafe = req.user.role === 'viewer' && video.status === 'safe';
    
    if (!isOwner && !isAdmin && !isViewerWatchingSafe) {
      return res.status(403).send('Access denied - you can only view your own videos');
    }

    const videoPath = video.filepath;
    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      // Parse range header
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(videoPath, { start, end });
      
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': video.mimetype || 'video/mp4',
      };

      res.writeHead(206, head);
      file.pipe(res);
    } else {
      // No range, send entire file
      const head = {
        'Content-Length': fileSize,
        'Content-Type': video.mimetype || 'video/mp4',
      };
      
      res.writeHead(200, head);
      fs.createReadStream(videoPath).pipe(res);
    }

  } catch (error) {
    console.error('Streaming error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete video
// @route   DELETE /api/videos/:id
// @access  Private (Editor, Admin)
export const deleteVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    // Check permissions: Only owner or admin can delete
    if (req.user.role !== 'admin' && video.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this video'
      });
    }

    // Delete file from filesystem
    if (fs.existsSync(video.filepath)) {
      fs.unlinkSync(video.filepath);
    }

    // Delete from database
    await video.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Video deleted successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
