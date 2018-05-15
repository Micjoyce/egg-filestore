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
      throw new Error(`init ali oss file store error options ${options}`);
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

  // save file to local from stream
  async createFromStream({ stream, filename }) {
    // 文件存储
    const putPath = `${this.category}/${filename}`;
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
      const ossPath = `${this.category}/${filename}`;
      this.store.delete(ossPath);
    } catch (error) {
      throw error;
    }
  }

  async getFile(filename) {
    if (!filename) {
      return null;
    }
    return this.store.generateObjectUrl(`${this.category}/${filename}`);
  }
};

module.exports = AliOss;
