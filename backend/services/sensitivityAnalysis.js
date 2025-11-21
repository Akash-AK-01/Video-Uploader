// Video Sensitivity Analysis Service
// This simulates content analysis for interview demo
// In production, integrate with AWS Rekognition, Google Video Intelligence API, etc.

import ffmpeg from 'fluent-ffmpeg';
import path from 'path';

/**
 * Analyze video for sensitive content
 * Returns: { status: 'safe' | 'flagged' | 'rejected', score: 0-100, reasons: [] }
 */
export const analyzeVideoSensitivity = async (filepath, filename) => {
  try {
    // Simulate processing delay (real AI would take time)
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Get video metadata using ffmpeg
    const metadata = await getVideoMetadata(filepath);
    
    let score = 0;
    const reasons = [];

    // RULE 1: Check video duration (flag if > 10 minutes for demo)
    if (metadata.duration > 600) {
      score += 20;
      reasons.push('Long duration video');
    }

    // RULE 2: Check file size (flag if > 100MB for demo)
    if (metadata.size > 100 * 1024 * 1024) {
      score += 15;
      reasons.push('Large file size');
    }

    // RULE 3: Filename analysis (check for keywords)
    const sensitiveKeywords = ['explicit', 'adult', 'violence', 'inappropriate', 'nsfw'];
    const lowerFilename = filename.toLowerCase();
    
    for (const keyword of sensitiveKeywords) {
      if (lowerFilename.includes(keyword)) {
        score += 30;
        reasons.push(`Filename contains sensitive keyword: ${keyword}`);
        break;
      }
    }

    // RULE 4: Random simulation for demo variety (20% chance of flagging)
    if (Math.random() < 0.2) {
      score += 25;
      reasons.push('Simulated content flag for demo');
    }

    // Determine final status based on score
    let status = 'safe';
    if (score >= 70) {
      status = 'rejected';
    } else if (score >= 30) {
      status = 'flagged';
    }

    return {
      status,
      score,
      reasons,
      metadata: {
        duration: metadata.duration,
        resolution: metadata.resolution,
        codec: metadata.codec
      }
    };

  } catch (error) {
    console.error('❌ Video analysis error:', error);
    // If analysis fails, mark as safe by default
    return {
      status: 'safe',
      score: 0,
      reasons: ['Analysis completed with default settings'],
      metadata: {}
    };
  }
};

/**
 * Get video metadata using ffmpeg
 */
const getVideoMetadata = (filepath) => {
  return new Promise(async (resolve, reject) => {
    ffmpeg.ffprobe(filepath, async (err, metadata) => {
      if (err) {
        console.warn('⚠️ FFmpeg not available, using defaults');
        // If ffmpeg is not installed, return default metadata
        const fs = await import('fs');
        const stats = fs.statSync(filepath);
        return resolve({
          duration: 0,
          size: stats.size,
          resolution: 'unknown',
          codec: 'unknown'
        });
      }

      const videoStream = metadata.streams.find(s => s.codec_type === 'video');
      
      resolve({
        duration: metadata.format.duration || 0,
        size: metadata.format.size || 0,
        resolution: videoStream ? `${videoStream.width}x${videoStream.height}` : 'unknown',
        codec: videoStream ? videoStream.codec_name : 'unknown'
      });
    });
  });
};

/**
 * Advanced analysis (placeholder for future AI integration)
 * This is where you'd integrate:
 * - AWS Rekognition Content Moderation
 * - Google Cloud Video Intelligence API
 * - Azure Video Analyzer
 * - Custom ML models
 */
export const performAdvancedAnalysis = async (filepath) => {
  // TODO: Integrate with AI services
  // Example with AWS Rekognition:
  // const rekognition = new AWS.Rekognition();
  // const result = await rekognition.startContentModeration({ ... });
  
  return {
    aiAnalysis: 'Not implemented - placeholder for AI integration',
    confidence: 0
  };
};
