'use strict';

/**
 * egg-filestore default config
 * @member Config#filestore
 * @property {String} SOME_KEY - some description
 */
exports.filestore = {
  app: true,
  agent: false,

  // Single FileSystem
  // client: {
  //   type: 'FileSystem',
  //   prefixUrl: '/source/upload',
  //   directory: '~/uploads'  // default '~/uploads'
  // },

  // Single AliOss
  // client: {
  //   type: 'AliOss',
  //   options: {
  //     accessKeyId: 'access key',
  //     accessKeySecret: 'access key secret',
  //     bucket: 'you bucket',
  //     region: 'oss-cn-hangzhou',
  //     timeout: '60s',
  //   },
  //   category: 'uploads',
  // },

  // Multi Redis
  // clients: {
  //   instance1: {
  //     type: 'AliOss',
  //     options: {
  //       accessKeyId: 'access key',
  //       accessKeySecret: 'access key secret',
  //       bucket: 'you bucket',
  //       region: 'oss-cn-hangzhou',
  //       timeout: '60s',
  //     },
  //     category: 'uploads',
  //   },
  //   instance2: {
  //     type: 'FileSystem',
  //     prefixUrl: '/source/upload',
  //     directory: '~/uploads'  // default '~/uploads'
  //   },
  // },
};
