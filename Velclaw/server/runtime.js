const crypto = require('crypto');

function id() {
  return `rt_${crypto.randomBytes(5).toString('hex')}`;
}

function createRuntime(projectId) {
  return {
    id:id(),
    projectId:projectId || null,
    status:'stopped',
    port:null,
    logs:[],
    createdAt:new Date().toISOString()
  };
}

module.exports={createRuntime};
