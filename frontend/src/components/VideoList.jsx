import React, { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { videoAPI } from '../services/api'
import { getSocket } from '../services/socket'

export default function VideoList({ refreshKey }) {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all') // all, safe, flagged, processing
  const { role, user, useBackend } = useAuth()

  useEffect(() => {
    if (!selected) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [selected])

  const sortedVideos = useMemo(() => {
    return [...videos].sort((a, b) => {
      const dateA = new Date(a.uploadDate || 0).getTime()
      const dateB = new Date(b.uploadDate || 0).getTime()
      return dateB - dateA
    })
  }, [videos])

  // Listen to socket events for real-time video updates
  useEffect(() => {
    if (!useBackend) return

    const socket = getSocket()
    if (!socket) return

    socket.on('video:analyzed', () => {
      // Refresh video list when new video is analyzed
      fetchVideos()
    })

    return () => {
      socket.off('video:analyzed')
    }
  }, [useBackend])

  // Fetch videos from backend
  const fetchVideos = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = filter !== 'all' ? { status: filter } : {}
      console.log('Fetching videos with params:', params, 'Role:', role)
      const response = await videoAPI.getAll(params)
      console.log('Videos received:', response.data)
      
      setVideos(response.data.data || [])
    } catch (err) {
      console.error('Fetch videos error:', err)
      setError(err.response?.data?.message || 'Failed to load videos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVideos()
  }, [refreshKey, filter])

  const handleDelete = async (videoId) => {
    if (!window.confirm('Delete this video?')) return
    
    try {
      await videoAPI.delete(videoId)
      setVideos(videos.filter(v => v._id !== videoId && v.id !== videoId))
      if (selected?._id === videoId || selected?.id === videoId) setSelected(null)
    } catch (e) {
      console.error('Delete failed:', e)
      alert('Failed to delete video: ' + (e.response?.data?.message || e.message))
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      safe: { label: 'Safe', color: '#0f5132', bg: '#d1e7dd' },
      flagged: { label: 'Flagged', color: '#664d03', bg: '#fff3cd' },
      processing: { label: 'Processing', color: '#055160', bg: '#cff4fc' },
      rejected: { label: 'Rejected', color: '#58151c', bg: '#f5c2c7' }
    }
    const badge = badges[status] || badges.safe
    return (
      <span className="status-pill" style={{ color: badge.color, background: badge.bg }}>
        {badge.label}
      </span>
    )
  }

  // Backend already filters, no need to filter again on frontend
  const filteredVideos = sortedVideos

  return (
    <div className="video-list">
      <div className="list-heading">
        <div>
          <h2>Video library</h2>
          <p>Browse uploaded content, review statuses, and manage visibility.</p>
        </div>

        {(role === 'editor' || role === 'admin') && (
          <div className="filters">
            <label htmlFor="video-filter">Filter</label>
            <select id="video-filter" value={filter} onChange={e => setFilter(e.target.value)}>
              <option value="all">All videos</option>
              <option value="safe">Safe</option>
              <option value="flagged">Flagged</option>
              <option value="processing">Processing</option>
            </select>
          </div>
        )}
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="error">Error: {error}</p>}

      {!loading && filteredVideos.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🎞️</div>
          <h3>No videos yet</h3>
          <p>Uploads will appear here once they finish processing.</p>
        </div>
      )}

      <div className="grid">
        {filteredVideos.map(v => {
          const videoId = v._id || v.id
          const streamUrl = videoAPI.getStreamUrl(videoId)
          const uploaderName = v.uploadedBy?.name || v.uploadedBy?.email || v.uploadedBy || 'Unknown'
          
          return (
            <article className="card" key={videoId}>
              <button className="thumb-button" type="button" onClick={() => setSelected(v)}>
                <video className="thumb" src={streamUrl} />
                <span className="thumb-overlay">▶ Play</span>
              </button>
              <div className="card-body">
                <div className="card-header">
                  <div>
                    <h3>{v.title || v.originalName || v.filename || 'Untitled'}</h3>
                    <p>{v.originalName || v.filename || videoId}</p>
                  </div>
                  {getStatusBadge(v.status || 'safe')}
                </div>
                <div className="card-meta-line">
                  <span>By {uploaderName}</span>
                  {v.uploadDate && <span>{new Date(v.uploadDate).toLocaleDateString()}</span>}
                </div>
                <div className="card-actions">
                  <button className="btn tertiary" type="button" onClick={() => setSelected(v)}>Watch</button>
                  {(role === 'editor' || role === 'admin') && (
                    <button 
                      className="btn danger" 
                      type="button"
                      onClick={() => handleDelete(videoId)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </article>
          )
        })}
      </div>

      {selected && (
        <div className="modal" role="dialog" aria-modal="true">
          <div className="modal-backdrop" onClick={() => setSelected(null)} />
          <div className="modal-content">
            <header>
              <div>
                <h3>{selected.title || selected.originalName || selected.filename}</h3>
                <p>{selected.originalName || selected.filename || selected._id || selected.id}</p>
              </div>
              <button className="modal-close" type="button" onClick={() => setSelected(null)} aria-label="Close">×</button>
            </header>
            <video controls src={videoAPI.getStreamUrl(selected._id || selected.id)} />
            <footer>
              {getStatusBadge(selected.status || 'safe')}
              <span>Uploaded by {selected.uploadedBy?.name || selected.uploadedBy?.email || selected.uploadedBy || 'Unknown'}</span>
            </footer>
          </div>
        </div>
      )}
    </div>
  )
}
