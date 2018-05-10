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
  // },

  // Single AliOss
  // client: {
  //   type: 'AliOss',
  //   aliCategory: 'uploads',
  //   prefixUrl: '/source/upload',
  // },

  // Multi Redis
  // clients: {
  //   instance1: {
  //     type: 'AliOss',
  //     aliCategory: 'uploads',
  //     prefixUrl: '/source/upload',
  //   },
  //   instance2: {
  //     type: 'FileSystem',
  //     prefixUrl: '/source/upload',
  //   },
  // },
};
