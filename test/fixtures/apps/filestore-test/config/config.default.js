'use strict';

exports.keys = '123456';

exports.filestore = {
  app: true,
  agent: false,

  // Multi Redis
  clients: {
    instance1: {
      type: 'AliOss',
      aliCategory: 'uploads',
      downloadPath: '/source/upload',
    },
    instance2: {
      type: 'FileSystem',
      downloadPath: '/source/upload',
    },
  },
};
