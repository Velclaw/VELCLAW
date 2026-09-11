const crypto = require('crypto');

function id() {
  return `build_${crypto.randomBytes(5).toString('hex')}`;
}

function createBuild(projectId) {
  return {
    id:id(),
    projectId:projectId || null,
    status:'queued',
    progress:0,
    logs:[],
    artifact:null,
    createdAt:new Date().toISOString(),
    finishedAt:null
  };
}

module.exports={createBuild};
