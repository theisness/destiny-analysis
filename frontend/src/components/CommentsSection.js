import React, { useEffect, useState } from 'react';
import { commentsAPI, uploadAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import './CommentsSection.css';
import { BASE_URL, DEFAULT_AVATAR } from '../config';
import SecureImage from './SecureImage';

const CommentsSection = ({ baziId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [content, setContent] = useState('');
  const [files, setFiles] = useState([]);
  const [posting, setPosting] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState('');
  const [previewUrls, setPreviewUrls] = useState([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  useEffect(() => {
    fetchComments();
  }, [baziId]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setLightboxSrc(''); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const EMOJIS = ['😀','😄','😁','😊','😍','🤔','😎','👍','🎉','🙏','❤️','🔥','🌟','📌'];

  const getAvatarSrc = (u) => (u?.avatarUrl ? `${BASE_URL}${u.avatarUrl}` : DEFAULT_AVATAR);
  const getFileSrc = (p) => `${BASE_URL}${p}`;
  const formatTime = (t) => new Date(t).toLocaleString();

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

  useEffect(() => {
    const urls = files.map(f => URL.createObjectURL(f));
    setPreviewUrls(urls);
    return () => { urls.forEach(u => URL.revokeObjectURL(u)); };
  }, [files]);

  const handleFileChange = (e) => {
    const f = Array.from(e.target.files || []);
    setFiles(f.slice(0, 4)); // 最多4张
  };

  const removeFile = (idx) => {
    setFiles(prev => prev.filter((_, i) => i !== idx));
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
      setShowEmoji(false);
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
        <textarea className="comment-input" value={content} onChange={(e) => setContent(e.target.value)} placeholder="发表你的看法，例如：这一局势很有意思…" rows={3} />
        <div className="editor-toolbar">
          <button type="button" className="icon-btn" title="表情" onClick={() => setShowEmoji(v => !v)}>
            {/* emoji icon */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="#764ba2" strokeWidth="2"/><circle cx="9" cy="10" r="1.5" fill="#764ba2"/><circle cx="15" cy="10" r="1.5" fill="#764ba2"/><path d="M7 14c1.5 2 3.5 3 5 3s3.5-1 5-3" stroke="#764ba2" strokeWidth="2" fill="none" strokeLinecap="round"/></svg>
          </button>
          <input id="comment-images" type="file" accept="image/*" multiple onChange={handleFileChange} style={{ display: 'none' }} />
          <label htmlFor="comment-images" className="icon-btn" title="添加图片">
            {/* image icon */}
            <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="5" width="18" height="14" rx="2" ry="2" fill="none" stroke="#667eea" strokeWidth="2"/><circle cx="8" cy="10" r="2" fill="#667eea"/><path d="M21 16l-6-6-5 5-3-3-4 4" fill="none" stroke="#667eea" strokeWidth="2" strokeLinecap="round"/></svg>
          </label>
          <div className="toolbar-spacer" />
          <button className="btn btn-primary" onClick={handlePost} disabled={posting}>发布</button>
        </div>
        {files.length > 0 && (
          <div className="selected-images">
            {previewUrls.map((src, idx) => (
              <div key={idx} className="selected-image">
                <img src={src} alt="预览" onClick={() => setLightboxSrc(src)} />
                <button type="button" className="remove-img" onClick={() => removeFile(idx)}>×</button>
              </div>
            ))}
          </div>
        )}
        {showEmoji && (
          <div className="emoji-picker">
            {EMOJIS.map(e => (
              <button key={e} type="button" className="emoji-btn" onClick={() => setContent(prev => prev + e)}>{e}</button>
            ))}
          </div>
        )}
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
                    <Link to={`/users/${c.user?._id}`} className="user-link">
                      <SecureImage className="avatar" src={getAvatarSrc(c.user)} alt="" />
                    </Link>
                    <Link to={`/users/${c.user?._id}`} className="name user-link">{c.user?.nickname || c.user?.username}</Link>
                    <span className="dot">·</span>
                    <span className="time">{formatTime(c.createdAt)}</span>
                  </div>
                </div>
                {c.content && <div className="content">{c.content}</div>}
                {Array.isArray(c.images) && c.images.length > 0 && (
                  <div className="images">
                    {c.images.map((img, idx) => (
                      <SecureImage key={idx} src={getFileSrc(img)} alt="" onClick={(e) => setLightboxSrc(e.currentTarget.src)} />
                    ))}
                  </div>
                )}
                <div className="comment-actions">
                  <button className={c.liked ? 'btn-like liked' : 'btn-like'} onClick={() => toggleLike(c.id)}>
                    ❤ {c.likeCount || 0}
                  </button>
                  {(user?.admin === 1 || user?.id === c.user?._id) && (
                    <button className="btn btn-secondary btn-sm" onClick={() => setConfirmDeleteId(c.id)}>删除</button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
      {lightboxSrc && (
        <div className="lightbox" onClick={() => { if (lightboxSrc.startsWith('blob:')) URL.revokeObjectURL(lightboxSrc); setLightboxSrc(''); }}>
          <img className="lightbox-img" src={lightboxSrc} alt="preview" />
        </div>
      )}
      {confirmDeleteId && (
        <div className="modal-mask" onClick={() => setConfirmDeleteId(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">确认删除</div>
            <div className="modal-body">确定要删除这条评论吗？此操作不可恢复。</div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setConfirmDeleteId(null)}>取消</button>
              <button className="btn btn-primary" onClick={async () => { await handleDelete(confirmDeleteId); setConfirmDeleteId(null); }}>删除</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentsSection;