'use strict';

const assert = require('assert');

const FileSystem = require('./fileSystem');
const AliOss = require('./alioss');


const FileStores = {
  FileSystem,
  AliOss,
};

module.exports = app => {
  app.addSingleton('filestore', createClient);
};


function createClient(config, app) {
  assert(config.type, 'mulit filestore require set store type');

  assert(FileStores[config.type], `${config.type} not support now`);

  const client = new FileStores[config.type](config);
  app.coreLogger.info(`[egg-filestore] instance ${config.type} status OK`);

  return client;
}
