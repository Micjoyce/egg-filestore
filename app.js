'use strict';

const fileStore = require('./lib');

module.exports = app => {
  if (app.config.filestore.app) fileStore(app);
};
