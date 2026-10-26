const prisma = require('../db/prisma');

async function findForAuthentication(email) {
  return prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true, passwordHash: true },
  });
}

async function findPublicById(id) {
  return prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true },
  });
}

function toPublicUser(user) {
  return { id: user.id, name: user.name, email: user.email };
}

module.exports = { findForAuthentication, findPublicById, toPublicUser };