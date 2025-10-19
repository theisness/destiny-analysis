import React, { useEffect, useState } from 'react';
import { commentsAPI, uploadAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';
import './CommentsSection.css';

const CommentsSection = ({ baziId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [content, setContent] = useState('');
  const [files, setFiles] = useState([]);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [baziId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const res = await commentsAPI.list(baziId);
      setComments(res.data?.data || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || '加载评论失败');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const f = Array.from(e.target.files || []);
    setFiles(f.slice(0, 4)); // 最多4张
  };

  const handlePost = async () => {
    if (!content.trim() && files.length === 0) return;
    try {
      setPosting(true);
      let imageUrls = [];
      if (files.length > 0) {
        const uploadRes = await uploadAPI.uploadFiles(files);
        imageUrls = (uploadRes.data?.files || []).map(f => f.url);
      }
      await commentsAPI.create({ baziId, content: content.trim(), images: imageUrls });
      setContent('');
      setFiles([]);
      await fetchComments();
    } catch (err) {
      setError(err.response?.data?.message || '发布失败');
    } finally {
      setPosting(false);
    }
  };

  const toggleLike = async (id) => {
    try {
      const res = await commentsAPI.like(id);
      setComments(prev => prev.map(c => c.id === id ? { ...c, likeCount: res.data.likeCount, liked: res.data.liked } : c));
    } catch (err) {
      // ignore
    }
  };

  const handleDelete = async (id) => {
    try {
      await commentsAPI.delete(id);
      setComments(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      // ignore
    }
  };

  return (
    <div className="card">
      <h2>评论区</h2>
      <div className="comment-editor">
        <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="发表你的看法" rows={3} />
        <div className="editor-actions">
          <input type="file" accept="image/*" multiple onChange={handleFileChange} />
          <button className="btn btn-primary" onClick={handlePost} disabled={posting}>发布</button>
        </div>
      </div>
      {loading ? (
        <div className="loading">加载中...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <div className="comments-list">
          {comments.length === 0 ? (
            <div className="empty">还没有评论</div>
          ) : (
            comments.map(c => (
              <div key={c.id} className="comment-item">
                <div className="comment-head">
                  <div className="user">
                    <img className="avatar" src={c.user?.avatarUrl ? (process.env.REACT_APP_API_URL ? `${process.env.REACT_APP_API_URL.replace('/api','')}${c.user.avatarUrl}` : `http://localhost:5000${c.user.avatarUrl}`) : ''} alt="" />
                    <span className="name">{c.user?.nickname || c.user?.username}</span>
                  </div>
                  <div className="time">{new Date(c.createdAt).toLocaleString()}</div>
                </div>
                {c.content && <div className="content">{c.content}</div>}
                {Array.isArray(c.images) && c.images.length > 0 && (
                  <div className="images">
                    {c.images.map((img, idx) => (
                      <img key={idx} src={process.env.REACT_APP_API_URL ? `${process.env.REACT_APP_API_URL.replace('/api','')}${img}` : `http://localhost:5000${img}`} alt="" />
                    ))}
                  </div>
                )}
                <div className="comment-actions">
                  <button className={c.liked ? 'btn-like liked' : 'btn-like'} onClick={() => toggleLike(c.id)}>
                    ❤ {c.likeCount || 0}
                  </button>
                  {(user?.admin === 1 || user?.id === c.user?._id) && (
                    <button className="btn btn-secondary btn-sm" onClick={() => handleDelete(c.id)}>删除</button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default CommentsSection;