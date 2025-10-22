import React, { useEffect, useState } from 'react';
import api from '../api/api';
import { DEFAULT_AVATAR } from '../config';

// 简易 IndexedDB 工具：用于持久缓存图片 Blob
const openImageDB = () => new Promise((resolve, reject) => {
  const req = indexedDB.open('secure-image-cache', 1);
  req.onupgradeneeded = (e) => {
    const db = e.target.result;
    if (!db.objectStoreNames.contains('images')) {
      const store = db.createObjectStore('images', { keyPath: 'key' });
      store.createIndex('createdAt', 'createdAt');
    }
  };
  req.onsuccess = (e) => resolve(e.target.result);
  req.onerror = (e) => reject(e.target.error);
});

const getImageFromCache = async (key, maxAgeMs) => {
  try {
    const db = await openImageDB();
    const tx = db.transaction('images', 'readonly');
    const store = tx.objectStore('images');
    const req = store.get(key);
    const record = await new Promise((resolve, reject) => {
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    await tx.done?.catch?.(() => {});
    if (!record) return null;
    if (typeof record.createdAt === 'number' && Date.now() - record.createdAt > maxAgeMs) {
      return null;
    }
    return record.blob || null;
  } catch {
    return null;
  }
};

const setImageToCache = async (key, blob) => {
  try {
    const db = await openImageDB();
    const tx = db.transaction('images', 'readwrite');
    const store = tx.objectStore('images');
    const req = store.put({ key, blob, createdAt: Date.now() });
    await new Promise((resolve, reject) => {
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
    await tx.done?.catch?.(() => {});
  } catch {
    // 缓存失败时忽略
  }
};

/**
 * SecureImage
 * 使用带有 JWT 的 axios 请求加载受保护的图片，并生成 blob URL 供 <img> 显示。
 * - 支持回退到 fallbackSrc（同样通过授权请求获取）。
 * - 自动在卸载或地址变更时 revoke 之前的 blob URL。
 * - 使用 IndexedDB 持久缓存 Blob，减少重复加载。
 */
const SecureImage = ({ src, alt = '', className = '', style = {}, fallbackSrc = DEFAULT_AVATAR, onClick, cacheMaxAgeMs = 7 * 24 * 60 * 60 * 1000 }) => {
  const [objectUrl, setObjectUrl] = useState('');

  useEffect(() => {
    let revokeUrl = '';
    let cancelled = false;

    const fetchToBlobUrl = async (url) => {
      if (!url) return '';
      const cacheKey = url;
      // 1) 先尝试从缓存读取
      try {
        const cachedBlob = await getImageFromCache(cacheKey, cacheMaxAgeMs);
        if (cachedBlob) {
          const blobUrl = URL.createObjectURL(cachedBlob);
          return blobUrl;
        }
      } catch {}
      // 2) 未命中缓存则网络请求
      const res = await api.get(url, { responseType: 'blob' });
      const blob = res.data;
      const blobUrl = URL.createObjectURL(blob);
      // 3) 异步写入缓存
      setImageToCache(cacheKey, blob).catch(() => {});
      return blobUrl;
    };

    const run = async () => {
      setObjectUrl('');
      try {
        if (src) {
          const mainUrl = await fetchToBlobUrl(src);
          if (!cancelled) setObjectUrl(mainUrl);
          revokeUrl = mainUrl;
        } else if (fallbackSrc) {
          const fbUrl = await fetchToBlobUrl(fallbackSrc);
          if (!cancelled) setObjectUrl(fbUrl);
          revokeUrl = fbUrl;
        }
      } catch (err) {
        if (fallbackSrc) {
          try {
            const fbUrl = await fetchToBlobUrl(fallbackSrc);
            if (!cancelled) setObjectUrl(fbUrl);
            revokeUrl = fbUrl;
          } catch (e) {
            // 最终失败：不设置图片，保持空
          }
        }
      }
    };

    run();

    return () => {
      cancelled = true;
      if (revokeUrl) URL.revokeObjectURL(revokeUrl);
    };
  }, [src, fallbackSrc, cacheMaxAgeMs]);

  return (
    <img src={objectUrl} alt={alt} className={className} style={style} onClick={onClick} />
  );
};

export default SecureImage;