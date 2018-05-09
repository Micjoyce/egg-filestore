'use strict';

const fileStore = require('./lib');

module.exports = agent => {
  if (agent.config.filestore.agent) fileStore(agent);
};
