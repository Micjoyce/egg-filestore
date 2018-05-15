'use strict';

const fs = require('fs');
const path = require('path');
const imageDownload = require('image-downloader');
const sendToWormhole = require('stream-wormhole');
// const mime = require('mime-types');
const mkdirp = require('mkdirp');
const oss = require('ali-oss');


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

  async findOne(filename) {
    const ossPath = this._getPath(filename);
    return this.store.head(ossPath);
  }

  async getFile(filename) {
    return await this.store.get(filename);
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
