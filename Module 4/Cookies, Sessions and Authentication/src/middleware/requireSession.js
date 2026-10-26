const userRepository = require('../repositories/userRepository');
const sessionStore = require('../session/sessionStore');
const { cookieName } = require('../config/cookie');

function authRequired(res) {
  return res.status(401).json({
    error: { code: 'AUTH_REQUIRED', message: 'Authentication is required' },
  });
}

module.exports = async function requireSession(req, res, next) {
  const sessionId = req.signedCookies[cookieName];
  const session = sessionStore.get(sessionId);
  if (!session) return authRequired(res);

  try {
    const user = await userRepository.findPublicById(session.userId);
    if (!user) {
      sessionStore.destroy(sessionId);
      return authRequired(res);
    }

    req.user = user;
    return next();
  } catch (error) {
    return next(error);
  }
};
