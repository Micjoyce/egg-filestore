'use strict';

exports.keys = '123456';

exports.filestore = {
  app: true,
  agent: false,

  // Multi Redis
  clients: {
    instance1: {
      type: 'AliOss',
      options: {
        accessKeyId: 'access key',
        accessKeySecret: 'access key secret',
        bucket: 'you bucket',
        region: 'oss-cn-hangzhou',
        timeout: '60s',
      },
      category: 'uploads',
    },
    instance2: {
      type: 'FileSystem',
      prefixUrl: '/source/upload',
      directory: '~/uploads', // default '~/uploads'
    },
  },
};
