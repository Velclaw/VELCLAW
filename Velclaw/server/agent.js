const crypto = require('crypto');

function agentReply(message) {
  const text = String(message || '').trim();

  if (!text) {
    return 'Tell me what you want to build.';
  }

  const lower = text.toLowerCase();

  if (lower.includes('build')) {
    return 'I can prepare the project for a build. The Build layer will execute the build pipeline.';
  }

  if (lower.includes('file')) {
    return 'I can inspect, create and edit project files through the Velclaw workspace.';
  }

  if (lower.includes('server')) {
    return 'The runtime layer will provide isolated servers, logs and preview environments.';
  }

  return `I received: "${text}". I am ready to work on this project.`;
}

function message(id, role, content) {
  return {
    id,
    role,
    content,
    createdAt: new Date().toISOString()
  };
}

module.exports = {
  agentReply,
  message,
  id: () => `msg_${crypto.randomBytes(5).toString('hex')}`
};
