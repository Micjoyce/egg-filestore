'use strict';

const fs = require('fs');
const path = require('path');
const imageDownload = require('image-downloader');
const sendToWormhole = require('stream-wormhole');
// const mime = require('mime-types');
const mkdirp = require('mkdirp');
const oss = require('ali-oss').Wrapper;


// 存储在文件硬盘上
const AliOss = class {
  constructor(config = {}) {
    const options = config.options || {};
    if (
      !options.accessKeyId ||
      !options.accessKeySecret ||
      !options.bucket
    ) {
      throw new Error(`init ali oss file store error options ${JSON.stringify(options, 2)}`);
    }

    if (!config.category) {
      throw new Error(`should set category ${config}`);
    }
    this.options = options;
    this.category = config.category;
    this.store = new oss(options);

    // set temp url for download image
    let tempUrl = config.tempUrl || '~/temp/egg/uploads';
    if (tempUrl.split(path.sep)[0] === '~') {
      const homepath = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
      if (homepath != null) {
        tempUrl = tempUrl.replace('~', homepath);
      } else {
        throw new Error('Unable to resolve "~" in path');
      }
    }

    this.tempUrl = path.resolve(tempUrl);
    mkdirp.sync(this.tempUrl);
  }

  _getPath(filename) {
    return `${this.category}/${filename}`;
  }

  // save file to local from stream
  async createFromStream({ stream, filename }) {
    // 文件存储
    const putPath = this._getPath(filename);
    try {
      const res = await this.store.put(putPath, stream);
      return res.url;
    } catch (err) {
      await sendToWormhole(stream);
      // 必须将上传的文件流消费掉，要不然浏览器响应会卡死
      throw err;
    }
  }

  // save file from url
  async createFromUrl({ url, filename }) {
    const target = path.join(this.tempUrl, filename);
    const options = {
      url,
      dest: target,
    };
    try {
      // 写入文件 const { filename, image}
      await imageDownload.image(options);
      // 上传到阿里云
      const stream = fs.createReadStream(target);
      const ossUrl = await this.createFromStream({
        stream,
        filename,
      });
      // 删除临时文件
      fs.unlinkSync(target);
      return ossUrl;
    } catch (err) {
      throw err;
    }
  }

  // delete file
  async destroy(filename) {
    try {
      const ossPath = this._getPath(filename);
      this.store.delete(ossPath);
    } catch (error) {
      throw error;
    }
  }
  // error

  // { NoSuchKeyError: Object not exists
  //   at Client.requestError (/Users/michaelxu/develop/digger/egg-filestore/node_modules/ali-oss/lib/client.js:457:15)
  //   at requestError.next (<anonymous>)
  //   at onFulfilled (/Users/michaelxu/develop/digger/egg-filestore/node_modules/co/index.js:65:19)
  //   at /Users/michaelxu/develop/digger/egg-filestore/node_modules/co/index.js:54:5
  //   at new Promise (<anonymous>)
  //   at Client.co (/Users/michaelxu/develop/digger/egg-filestore/node_modules/co/index.js:50:10)
  //   at Client.toPromise (/Users/michaelxu/develop/digger/egg-filestore/node_modules/co/index.js:118:63)
  //   at next (/Users/michaelxu/develop/digger/egg-filestore/node_modules/co/index.js:99:29)
  //   at onFulfilled (/Users/michaelxu/develop/digger/egg-filestore/node_modules/co/index.js:69:7)
  //   at <anonymous>
  // name: 'NoSuchKeyError',
  // status: 404,
  // code: 'NoSuchKey',
  // requestId: '5AFA8BD8E4B2563381FDCB5C',
  // host: '',
  // params:
  //  { object: 'hello/heddllo.png',
  //    bucket: 'michaelxu',
  //    method: 'HEAD',
  //    subres: undefined,
  //    timeout: undefined,
  //    ctx: undefined,
  //    successStatuses: [ 200, 304 ] } } 'saaaaa'

  // success
  // {
  //   meta: null,
  //   res:
  //    { status: 200,
  //      statusCode: 200,
  //      headers:
  //       { server: 'AliyunOSS',
  //         date: 'Tue, 15 May 2018 07:25:12 GMT',
  //         'content-type': 'image/png',
  //         'content-length': '783707',
  //         connection: 'keep-alive',
  //         'x-oss-request-id': '5AFA8B58355BE8B536AEFECB',
  //         'accept-ranges': 'bytes',
  //         etag: '"13795916E6628B89EE5A7E912F4E0164"',
  //         'last-modified': 'Tue, 15 May 2018 07:13:31 GMT',
  //         'x-oss-object-type': 'Normal',
  //         'x-oss-hash-crc64ecma': '8325123069757951675',
  //         'x-oss-storage-class': 'Standard',
  //         'content-md5': 'E3lZFuZii4nuWn6RL04BZA==',
  //         'x-oss-server-time': '4' },
  //      size: 0,
  //      aborted: false,
  //      rt: 290,
  //      keepAliveSocket: false,
  //      data: <Buffer >,
  //      requestUrls:
  //       [ 'http://michaelxu.oss-cn-hangzhou.aliyuncs.com/hello/hello.png' ],
  //      timing: null,
  //      remoteAddress: '116.62.99.183',
  //      remotePort: 80 },
  //   status: 200
  // }

  async findOne(filename) {
    const ossPath = this._getPath(filename);
    return this.store.head(ossPath);
  }

  // { res:
  //   { status: 200,
  //     statusCode: 200,
  //     headers:
  //      { server: 'AliyunOSS',
  //        date: 'Tue, 15 May 2018 07:20:53 GMT',
  //        'content-type': 'image/png',
  //        'content-length': '783707',
  //        connection: 'keep-alive',
  //        'x-oss-request-id': '5AFA8A55D0EBAB69E12EC928',
  //        'accept-ranges': 'bytes',
  //        etag: '"13795916E6628B89EE5A7E912F4E0164"',
  //        'last-modified': 'Tue, 15 May 2018 07:14:36 GMT',
  //        'x-oss-object-type': 'Normal',
  //        'x-oss-hash-crc64ecma': '8325123069757951675',
  //        'x-oss-storage-class': 'Standard',
  //        'content-md5': 'E3lZFuZii4nuWn6RL04BZA==',
  //        'x-oss-server-time': '3' },
  //     size: 783707,
  //     aborted: false,
  //     rt: 35697,
  //     keepAliveSocket: false,
  //     data: <Buffer ... >,
  //     requestUrls:
  //      [ 'http://michaelxu.oss-cn-hangzhou.aliyuncs.com/uploads/hello/f1.png' ],
  //     timing: null,
  //     remoteAddress: '116.62.99.172',
  //     remotePort: 80 },
  //     content: <Buffer  ... >
  //   }
  async getFile(filename) {
    const ossPath = this._getPath(filename);
    return this.store.get(ossPath);
  }


  async download({ filename, ctx }) {
    if (!ctx) {
      throw new Error('not ctx');
    }
    if (!filename) {
      ctx.status = 404;
      return;
    }
    const url = this.store.generateObjectUrl(`${this.category}/${filename}`);
    ctx.redirect(url);
  }
};

module.exports = AliOss;
