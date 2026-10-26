const express = require('express');
const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/userRepository');
const sessionStore = require('../session/sessionStore');
const requireSession = require('../middleware/requireSession');
const { cookieName, cookieOptions } = require('../config/cookie');

const router = express.Router();

router.post('/login', async (req, res, next) => {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';

  if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    || !password || password.length > 256) {
    return res.status(400).json({
      error: { code: 'INVALID_REQUEST', message: 'A valid email and password are required' },
    });
  }

  try {
    const user = await userRepository.findForAuthentication(email);
    const passwordMatches = user && await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatches) {
      return res.status(401).json({
        error: { code: 'INVALID_CREDENTIALS', message: 'Email or password is incorrect' },
      });
    }

    const session = sessionStore.create(user.id);
    res.cookie(cookieName, session.id, cookieOptions(true));
    return res.status(200).json({ data: { user: userRepository.toPublicUser(user) } });
  } catch (error) {
    return next(error);
  }
});

router.get('/me', requireSession, (req, res) => {
  return res.status(200).json({ data: { user: req.user } });
});

router.post('/logout', (req, res) => {
  sessionStore.destroy(req.signedCookies[cookieName]);
  res.clearCookie(cookieName, cookieOptions());
  return res.status(204).send();
});

module.exports = router;
