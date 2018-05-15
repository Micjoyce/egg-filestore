'use strict';

exports.keys = '123456';

exports.filestore = {
  app: true,
  agent: false,

  // Multi Redis
  clients: {
    instance1: {
      type: 'AliOss',
      bucketCategory: 'uploads',
      prefixUrl: '/source/upload',
    },
    instance2: {
      type: 'FileSystem',
      prefixUrl: '/source/upload',
      directory: '~/uploads', // default '~/uploads'
    },
  },
};
