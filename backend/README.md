# Video Upload Backend

Complete Node.js + Express + MongoDB backend with video upload, sensitivity analysis, and real-time streaming.

## Features Implemented ✅

- ✅ **RESTful API** with Express.js
- ✅ **MongoDB** with Mongoose ODM
- ✅ **JWT Authentication** with bcrypt password hashing
- ✅ **Role-Based Access Control** (Viewer, Editor, Admin)
- ✅ **File Upload** with Multer (500MB limit)
- ✅ **Video Sensitivity Analysis** (safe/flagged/rejected classification)
- ✅ **Real-Time Updates** via Socket.io
- ✅ **Video Streaming** with HTTP range requests
- ✅ **Multi-Tenant Architecture** (user isolation)

## Tech Stack

- Node.js (Latest LTS)
- Express.js 4.18+
- MongoDB 7.0+ with Mongoose
- Socket.io 4.6+
- JWT (jsonwebtoken)
- Multer (file uploads)
- FFmpeg (video metadata extraction)
- bcryptjs (password hashing)

## Prerequisites

- Node.js v18+ installed
- MongoDB v7.0+ installed and running
- (Optional) FFmpeg for video metadata extraction

## Installation

\`\`\`powershell
cd backend
npm install
\`\`\`

## Configuration

Edit `.env` file:

\`\`\`env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/video-upload-db
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-2025
NODE_ENV=development
FRONTEND_URL=http://localhost:5174
\`\`\`

## Running the Server

\`\`\`powershell
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
\`\`\`

Server will start at: **http://localhost:5000**

## API Endpoints

### Authentication

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login user |
| GET | `/api/auth/me` | Private | Get current user |

### Videos

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/videos/upload` | Editor, Admin | Upload video |
| GET | `/api/videos` | All authenticated | Get all videos (filtered by role) |
| GET | `/api/videos/:id` | All authenticated | Get single video |
| GET | `/api/videos/:id/stream` | All authenticated | Stream video (range requests) |
| DELETE | `/api/videos/:id` | Editor, Admin | Delete video |

### Health Check

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/health` | Public | Check server status |

## Request Examples

### Register User

\`\`\`bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "editor"
}
\`\`\`

### Login

\`\`\`bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
\`\`\`

Returns:
\`\`\`json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "editor",
    "token": "jwt-token-here"
  }
}
\`\`\`

### Upload Video

\`\`\`bash
POST /api/videos/upload
Authorization: Bearer <jwt-token>
Content-Type: multipart/form-data

FormData:
- video: (video file)
- title: "My Video Title"
\`\`\`

### Get Videos

\`\`\`bash
GET /api/videos?status=safe
Authorization: Bearer <jwt-token>
\`\`\`

### Stream Video

\`\`\`bash
GET /api/videos/:id/stream
Authorization: Bearer <jwt-token>
Range: bytes=0-1024
\`\`\`

## Socket.io Events

### Client → Server

- `join` - Join user-specific room for updates
- `upload:progress` - Report upload progress

### Server → Client

- `upload:complete` - Video uploaded successfully
- `video:processing` - Video processing started
- `video:analyzed` - Analysis complete with results
- `video:error` - Error during processing

## Video Sensitivity Analysis

The system analyzes videos based on:

1. **Duration** - Videos > 10 minutes flagged
2. **File Size** - Videos > 100MB flagged
3. **Filename Keywords** - Checks for sensitive terms
4. **Random Simulation** - 20% chance for demo variety

**Classification:**
- **Score 0-29**: ✅ Safe
- **Score 30-69**: ⚠️ Flagged (requires review)
- **Score 70+**: ❌ Rejected

## Role-Based Access

### Viewer
- ✅ View safe videos only
- ❌ Cannot upload
- ❌ Cannot see flagged/rejected content

### Editor
- ✅ Upload videos
- ✅ Manage own videos
- ✅ View all content
- ✅ Delete own videos

### Admin
- ✅ Full access
- ✅ View all users' videos
- ✅ Delete any video
- ✅ Manage system

## Database Schema

### User Model
\`\`\`javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: enum['viewer', 'editor', 'admin'],
  createdAt: Date
}
\`\`\`

### Video Model
\`\`\`javascript
{
  title: String,
  filename: String,
  originalName: String,
  filepath: String,
  filesize: Number,
  mimetype: String,
  duration: Number,
  status: enum['processing', 'safe', 'flagged', 'rejected'],
  sensitivityScore: Number (0-100),
  uploadedBy: ObjectId (ref: User),
  uploadDate: Date,
  processedAt: Date
}
\`\`\`

## File Storage

Videos are stored in: `backend/uploads/`

Filename format: `{timestamp}-{random}-{originalname}`

## Error Handling

All errors return consistent format:
\`\`\`json
{
  "success": false,
  "message": "Error description"
}
\`\`\`

HTTP Status Codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Server Error

## Production Deployment

1. Set `NODE_ENV=production`
2. Use strong `JWT_SECRET`
3. Configure MongoDB Atlas (cloud database)
4. Use cloud storage (AWS S3, Google Cloud Storage)
5. Implement rate limiting
6. Add HTTPS
7. Configure proper CORS
8. Set up logging (Winston, Morgan)

## Future Enhancements

- [ ] Integrate AWS Rekognition for real AI analysis
- [ ] Add video transcoding for multiple qualities
- [ ] Implement CDN integration
- [ ] Add video thumbnails generation
- [ ] Email notifications
- [ ] Admin dashboard for user management
- [ ] Video analytics and metrics

## Troubleshooting

**MongoDB Connection Error:**
\`\`\`powershell
# Check if MongoDB is running
Get-Service -Name MongoDB

# Start MongoDB if not running
Start-Service -Name MongoDB
\`\`\`

**Port already in use:**
Change `PORT` in `.env` file

**FFmpeg warnings:**
FFmpeg is optional. Video metadata will use defaults if not installed.

---

Built with ❤️ for interview demonstration
