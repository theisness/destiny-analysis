import React, { useEffect, useState } from 'react';
import api from '../api/api';
import { DEFAULT_AVATAR } from '../config';

/**
 * SecureImage
 * 使用带有 JWT 的 axios 请求加载受保护的图片，并生成 blob URL 供 <img> 显示。
 * - 支持回退到 fallbackSrc（同样通过授权请求获取）。
 * - 自动在卸载或地址变更时 revoke 之前的 blob URL。
 */
const SecureImage = ({ src, alt = '', className = '', style = {}, fallbackSrc = DEFAULT_AVATAR, onClick }) => {
  const [objectUrl, setObjectUrl] = useState('');

  useEffect(() => {
    let revokeUrl = '';
    let cancelled = false;

    const fetchToBlobUrl = async (url) => {
      const res = await api.get(url, { responseType: 'blob' });
      const blobUrl = URL.createObjectURL(res.data);
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
            // 最终失败：不设置图片，保持空，避免未经授权的直接请求
            // 可选：此处可设置一个本地 data-url 作为占位符
          }
        }
      }
    };

    run();

    return () => {
      cancelled = true;
      if (revokeUrl) URL.revokeObjectURL(revokeUrl);
    };
  }, [src, fallbackSrc]);

  return (
    <img src={objectUrl} alt={alt} className={className} style={style} onClick={onClick} />
  );
};

export default SecureImage;