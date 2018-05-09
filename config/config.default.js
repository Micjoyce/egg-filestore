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
  //   downloadPath: '/source/upload',
  // },

  // Single AliOss
  // client: {
  //   type: 'AliOss',
  //   aliCategory: 'uploads',
  // },

  // Multi Redis
  // clients: {
  //   instance1: {
  //     type: 'AliOss',
  //     aliCategory: 'uploads',
  //   },
  //   instance2: {
  //     type: 'FileSystem',
  //     downloadPath: '/source/upload',
  //   },
  // },
};
