const { randomBytes } = require('node:crypto');

const sessions = new Map();
const configuredTtl = Number(process.env.SESSION_TTL_MS || 60 * 60 * 1000);
const ttlMs = Number.isSafeInteger(configuredTtl) && configuredTtl > 0
	? configuredTtl
	: 60 * 60 * 1000;

function create(userId) {
	const id = randomBytes(32).toString('base64url');
	const expiresAt = new Date(Date.now() + ttlMs);
	sessions.set(id, { userId, expiresAt });
	return { id, expiresAt };
}

function get(id) {
	if (typeof id !== 'string') return null;

	const session = sessions.get(id);
	if (!session) return null;

	if (session.expiresAt.getTime() <= Date.now()) {
		sessions.delete(id);
		return null;
	}

	return { ...session };
}

function destroy(id) {
	if (typeof id === 'string') sessions.delete(id);
}

module.exports = { create, get, destroy, ttlMs };
