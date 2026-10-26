const sessionStore = require('../session/sessionStore');

const cookieName = 'sid';
const baseOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production' || process.env.COOKIE_SECURE === 'true',
  sameSite: 'lax',
  signed: true,
  path: '/',
};

function cookieOptions(includeLifetime = false) {
  return includeLifetime
    ? { ...baseOptions, maxAge: sessionStore.ttlMs }
    : { ...baseOptions };
}

module.exports = { cookieName, cookieOptions };