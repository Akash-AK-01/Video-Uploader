import React, { useMemo, useRef, useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { videoAPI } from '../services/api'
import { getSocket } from '../services/socket'

const STAGES = [
  { label: 'Uploading', description: 'Transferring file', progress: 25 },
  { label: 'Processing', description: 'Optimizing formats', progress: 55 },
  { label: 'Analyzing', description: 'Scanning for safety', progress: 85 },
  { label: 'Finalizing', description: 'Publishing to library', progress: 100 }
]

export default function UploadForm({ onUploaded }) {
  const [file, setFile] = useState(null)
  const [title, setTitle] = useState('')
  const [progress, setProgress] = useState(null)
  const [status, setStatus] = useState('')
  const [activeStage, setActiveStage] = useState(-1)
  const { role, user, useBackend } = useAuth()
  const fileInputRef = useRef(null)

  // Listen to Socket.io events for real-time updates
  useEffect(() => {
    if (!useBackend) return

    const socket = getSocket()
    if (!socket) return

    socket.on('upload:complete', (data) => {
      setActiveStage(1)
      setStatus('Upload complete, processing...')
      setProgress(50)
    })

    socket.on('video:processing', (data) => {
      setActiveStage(2)
      setStatus('Analyzing content...')
      setProgress(75)
    })

    socket.on('video:analyzed', (data) => {
      setActiveStage(3)
      setStatus(`Analysis complete! Video marked as: ${data.status}`)
      setProgress(100)
      
      // Reset form after short delay
      setTimeout(() => {
        setFile(null)
        setTitle('')
        setProgress(null)
        setActiveStage(-1)
        setStatus('')
        if (fileInputRef.current) fileInputRef.current.value = ''
        if (onUploaded) onUploaded()
      }, 2000)
    })

    socket.on('video:error', (data) => {
      setStatus(`Error: ${data.message}`)
      setProgress(null)
    })

    return () => {
      socket.off('upload:complete')
      socket.off('video:processing')
      socket.off('video:analyzed')
      socket.off('video:error')
    }
  }, [useBackend, onUploaded])

  const roleBadge = useMemo(() => {
    if (role === 'admin') return 'Admin access'
    if (role === 'editor') return 'Editor access'
    return 'Viewer access'
  }, [role])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) return setStatus('Please select a file')

    setStatus('Uploading...')
    setProgress(0)
    setActiveStage(0)

    try {
      // Create FormData
      const formData = new FormData()
      formData.append('video', file)
      formData.append('title', title || file.name)

      // Setup socket listeners for real-time updates
      const socket = getSocket()
      if (socket) {
        socket.on('video:processing', (data) => {
          setActiveStage(1)
          setProgress(50)
          setStatus('Processing video...')
        })

        socket.on('video:analyzed', (data) => {
          setActiveStage(3)
          setProgress(100)
          setStatus(`Upload complete! Status: ${data.status}`)
          
          // Reset form after 2 seconds
          setTimeout(() => {
            setFile(null)
            setTitle('')
            setProgress(null)
            setActiveStage(-1)
            setStatus('')
            if (fileInputRef.current) fileInputRef.current.value = ''
            if (onUploaded) onUploaded()
          }, 2000)
        })

        socket.on('video:error', (data) => {
          setStatus('Error: ' + data.message)
          setProgress(null)
          setActiveStage(-1)
        })
      }

      // Upload to backend with progress tracking
      const response = await videoAPI.upload(formData, (percent) => {
        setProgress(Math.min(percent, 40))
        if (percent < 30) setActiveStage(0)
        if (percent >= 30) {
          setActiveStage(1)
          setStatus('Processing...')
        }
      })

      console.log('Upload response:', response.data)
      setActiveStage(2)
      setProgress(85)
      setStatus('Analyzing content...')
      
    } catch (err) {
      console.error('Upload error:', err)
      setStatus('Upload failed: ' + (err.response?.data?.message || err.message))
      setProgress(null)
      setActiveStage(-1)
    }
  }

  return (
    <form className="upload-form" onSubmit={handleSubmit}>
      <div className="upload-heading">
        <div>
          <h2>Upload a new video</h2>
          <p>Accepted formats: mp4, mov, webm up to 1 GB</p>
        </div>
        <span className={`role-chip role-${role}`}>{roleBadge}</span>
      </div>

      <div className="field">
        <label>Video title</label>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Give your video a name" />
      </div>

      <div className="field">
        <label>Upload file</label>
        <div className={`dropzone ${file ? 'has-file' : ''}`} onClick={() => fileInputRef.current?.click()}>
          <div className="dropzone-content">
            <div className="drop-icon" aria-hidden>📹</div>
            <div>
              <strong>{file ? file.name : 'Drag & drop your file here'}</strong>
              <p>{file ? `${(file.size/1024/1024).toFixed(2)} MB selected` : 'or click to browse from your device'}</p>
            </div>
          </div>
          <input ref={fileInputRef} type="file" accept="video/*" onChange={e => setFile(e.target.files[0])} hidden />
        </div>
      </div>

      <div className="actions">
        <button className="btn primary" type="submit" disabled={!file || progress !== null}>
          {progress !== null ? 'Uploading...' : 'Start upload'}
        </button>
        <span className="upload-hint">Videos are processed for content safety analysis.</span>
      </div>

      {progress !== null && (
        <div className="progress-card">
          <div className="progress-bar">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
          </div>
          <ul className="progress-steps">
            {STAGES.map((stage, index) => (
              <li key={stage.label} className={index <= activeStage ? 'active' : ''}>
                <span>{stage.label}</span>
                <small>{stage.description}</small>
              </li>
            ))}
          </ul>
        </div>
      )}

      {status && <p className={`status ${status.includes('complete') ? 'success' : ''}`}>{status}</p>}
    </form>
  )
}
