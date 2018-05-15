'use strict';

const fs = require('fs');
const path = require('path');
const awaitWriteStream = require('await-stream-ready').write;
const sendToWormhole = require('stream-wormhole');
const imageDownload = require('image-downloader');
const mkdirp = require('mkdirp');
const mime = require('mime-types');


// 存储在文件硬盘上
const FileSystem = class {
  constructor(config = {}) {
    let { directory = '~/uploads', prefixUrl } = config;
    if (!prefixUrl) {
      throw new Error('Please set upload download path');
    }
    this.prefixUrl = prefixUrl;
    if (directory.split(path.sep)[0] === '~') {
      const homepath = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
      if (homepath != null) {
        directory = directory.replace('~', homepath);
      } else {
        throw new Error('Unable to resolve "~" in path');
      }
    }
    this.directory = path.resolve(directory);
    mkdirp.sync(this.directory);
  }

  _stat(filename) {
    return new Promise((resolve, reject) => {
      fs.stat(path.join(this.directory, filename), (err, result) => {
        if (err) {
          return reject(err);
        }
        resolve(result);
      });
    });
  }

  async _getFileWithReadStream(filename) {
    try {
      const stat = await this._stat(filename);
      const target = path.join(this.directory, filename);
      const rs = fs.createReadStream(target);
      return {
        readStream: rs,
        contentType: mime.lookup(filename),
        length: stat.size,
      };
    } catch (error1) {
      return null;
    }
  }

  // 读取二进制文件
  _pickChunkData(file) {
    return new Promise((resolve, reject) => {
      if (!file) {
        return reject();
      }
      const data = [];
      file.readStream.on('data', function(chunk) {
        return data.push(chunk);
      });
      file.readStream.on('end', function() {
        const result = {
          buffer: Buffer.concat(data),
          contentType: file.contentType,
          length: file.length,
          uploadDate: file.uploadDate,
        };
        return resolve(result);
      });
    });
  }

  async _readFileToStrean(filename) {
    const file = await this._getFileWithReadStream(filename);
    if (!file) {
      throw new Error('not file');
    }
    const data = await this._pickChunkData(file);
    return data;
  }

  _getSourceUrlByIdAndExtname(filename) {
    const sourceUrl = path.join(this.prefixUrl, filename);
    return sourceUrl;
  }

  // save file to local from stream
  async createFromStream({ stream, filename }) {
    // 组装参数 stream
    const target = path.join(this.directory, filename);
    const writeStream = fs.createWriteStream(target);
    // 文件存储
    try {
      await awaitWriteStream(stream.pipe(writeStream));
      return this._getSourceUrlByIdAndExtname(filename);
    } catch (err) {
      // 必须将上传的文件流消费掉，要不然浏览器响应会卡死
      await sendToWormhole(stream);
      throw err;
    }
  }

  // save file from url
  async createFromUrl({ url, filename }) {
    const target = path.join(this.directory, filename);
    const options = {
      url,
      dest: target,
    };
    try {
      // 写入文件 const { filename, image}
      await imageDownload.image(options);
      return this._getSourceUrlByIdAndExtname(filename);
    } catch (err) {
      throw err;
    }
  }

  // delete file
  async destroy(filename) {
    const target = path.join(this.directory, filename);
    fs.unlinkSync(target);
  }

  async findOne(filename) {
    if (!filename) {
      return null;
    }
    return this._stat(filename);
  }

  async getFile(filename) {
    const fileStat = await this.findOne(filename);
    if (!fileStat) {
      return null;
    }
    return await this._readFileToStrean(filename);
  }

  async download({ filename, ctx }) {
    try {
      // 判定文件是否使用本地缓存
      const reqModifiedHeader = ctx.headers['if-modified-since'];
      const file = await this.findOne(filename);
      if (!file) {
        ctx.status = 404;
        return;
      }
      const uploadedAtUTCString = new Date(file.mtime).toUTCString();
      if (reqModifiedHeader && reqModifiedHeader === uploadedAtUTCString) {
        ctx.set('Last-Modified', reqModifiedHeader);
        ctx.status = 304;
        return;
      }
      // 读取文件数据并返回
      const data = await this._readFileToStrean(filename);
      // 设置response headers
      ctx.status = 200;
      ctx.set('Cache-Control', 'public, max-age=0');
      ctx.set('Expires', '-1');
      ctx.set('Content-Disposition', 'inline');
      ctx.type = data.contentType;
      ctx.length = data.length;
      ctx.lastModified = uploadedAtUTCString;
      ctx.body = data.buffer;
      return;
    } catch (error) {
      ctx.status = 404;
      return;
    }
  }
};

module.exports = FileSystem;
