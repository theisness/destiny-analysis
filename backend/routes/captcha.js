const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { redis, setWithTTL, get, incr, exists, del } = require('../utils/redisClient');
const { sendMail } = require('../utils/mailer');

// 发送验证码：每个邮箱60秒一次；验证码有效期10分钟
router.post(
  '/send',
  [body('email').isEmail().normalizeEmail().withMessage('请输入有效的邮箱地址')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const email = req.body.email;
    const cooldownKey = `captcha:cooldown:${email}`;
    const countKey = `captcha:count:${email}`;
    const codeKey = `captcha:code:${email}`;

    try {
      // 频率限制：60秒
      const cooling = await exists(cooldownKey);
      if (cooling) {
        return res.status(429).json({ success: false, message: '每60秒只能发送一次验证码' });
      }

      // 生成6位随机验证码
      const code = String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
      await setWithTTL(codeKey, code, 10 * 60); // 10分钟有效
      await setWithTTL(cooldownKey, '1', 60); // 60秒冷却
      await incr(countKey);

      // 发送邮件
      const subject = '命理排盘系统-重置密码';
      const text = `您的验证码是 ${code}，10分钟内有效。`;
      const html = `<p>您的验证码是 <b>${code}</b>，10分钟内有效。</p>`;
      await sendMail({ to: email, subject, text, html });

      return res.json({ success: true, message: '验证码已发送' });
    } catch (err) {
      console.error('发送验证码错误:', err);
      return res.status(500).json({ success: false, message: '服务器错误，发送失败' });
    }
  }
);

// 验证验证码
router.post(
  '/verify',
  [
    body('email').isEmail().normalizeEmail().withMessage('请输入有效的邮箱地址'),
    body('code').isLength({ min: 6, max: 6 }).withMessage('验证码格式错误')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const { email, code } = req.body;
    const codeKey = `captcha:code:${email}`;

    try {
      const saved = await get(codeKey);
      if (!saved) {
        return res.status(400).json({ success: false, message: '验证码不存在或已过期' });
      }
      if (String(saved) !== String(code)) {
        return res.status(400).json({ success: false, message: '验证码错误' });
      }
      // 验证成功后可删除验证码
      await del(codeKey);
      return res.json({ success: true, message: '验证码验证通过' });
    } catch (err) {
      console.error('验证验证码错误:', err);
      return res.status(500).json({ success: false, message: '服务器错误，验证失败' });
    }
  }
);

module.exports = router;