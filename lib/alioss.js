'use strict';

const fs = require('fs');
const path = require('path');
const imageDownload = require('image-downloader');
// const mime = require('mime-types');
const mkdirp = require('mkdirp');


// 存储在文件硬盘上
const AliOss = class {
  constructor(config = {}) {
    const { aliCategory } = config;
    if (!aliCategory) {
      throw new Error('Please set upload download path');
    }
    this.aliCategory = aliCategory;

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
  async createFromStream({ ctx, stream, _id, extname }) {
    // 文件存储
    const putPath = `${this.aliCategory}/${_id + extname}`;
    try {
      const res = await ctx.oss.put(putPath, stream);
      return res.url;
    } catch (err) {
      // 必须将上传的文件流消费掉，要不然浏览器响应会卡死
      throw err;
    }
  }

  // save file from url
  async createFromUrl({ ctx, url, _id, extname }) {
    const target = path.join(this.tempUrl, `${_id.toString()}${extname}`);
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
        ctx,
        stream,
        _id,
        extname,
      });
      // 删除临时文件
      fs.unlinkSync(target);
      return ossUrl;
    } catch (err) {
      throw err;
    }
  }

  // delete file
  async destroy({ ctx, _id, extname }) {
    try {
      const ossPath = `${this.aliCategory}/${_id + extname}`;
      ctx.oss.delete(ossPath);
    } catch (error) {
      throw error;
    }
  }

  async getFile({ ctx, attachment }) {
    if (!attachment || !attachment.url) {
      ctx.throw(404, 'Not found file');
    }
    return ctx.redirect(attachment.url);
  }
};

module.exports = AliOss;
