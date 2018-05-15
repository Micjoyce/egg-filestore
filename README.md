# egg-filestore

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/egg-filestore.svg?style=flat-square
[npm-url]: https://npmjs.org/package/egg-filestore
[travis-image]: https://img.shields.io/travis/eggjs/egg-filestore.svg?style=flat-square
[travis-url]: https://travis-ci.org/eggjs/egg-filestore
[codecov-image]: https://img.shields.io/codecov/c/github/eggjs/egg-filestore.svg?style=flat-square
[codecov-url]: https://codecov.io/github/eggjs/egg-filestore?branch=master
[david-image]: https://img.shields.io/david/eggjs/egg-filestore.svg?style=flat-square
[david-url]: https://david-dm.org/eggjs/egg-filestore
[snyk-image]: https://snyk.io/test/npm/egg-filestore/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/egg-filestore
[download-image]: https://img.shields.io/npm/dm/egg-filestore.svg?style=flat-square
[download-url]: https://npmjs.org/package/egg-filestore

<!--
Description here.
-->

## Install

```bash
$ npm i egg-filestore --save
```

## Usage

```js
// {app_root}/config/plugin.js
exports.filestore = {
  enable: true,
  package: 'egg-filestore',
};
```

## Configuration

```js
// {app_root}/config/config.default.js
exports.filestore = {
};
```

see [config/config.default.js](config/config.default.js) for more detail.

### Single Clients Config

#### FileSystem

```js
exports.filestore = {
  type: 'FileSystem',
  prefixUrl: '/source/upload',
  directory: '~/uploads'  // default '~/uploads'
}
```

#### AliOss

```js
exports.filestore = {
  type: 'AliOss',
  options: { // ali-oss config
    accessKeyId: 'access key',
    accessKeySecret: 'access key secret',
    bucket: 'you bucket',
    region: 'oss-cn-hangzhou',
    timeout: '60s',
  },
  category: 'uploads',
}
```

### Multi Clients Config

```js
exports.filestore = {
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
      directory: '~/uploads'  // default '~/uploads'
    },
  },
}

```

## Example

### Single Clients

```js
// app/controller/home.js
module.exports = app => {
  return class HomeController extends app.Controller {
    async create() {
      const { ctx, app } = this;

      const stream = await ctx.getFileStream();

      await app.filestore.createFromStream({ stream, filename: stream.filename });
    }
  };
};
```

#### Multi Clients

```js
// app/controller/home.js
module.exports = app => {
  return class HomeController extends app.Controller {
    async create() {
      const { ctx, app } = this;

      const stream = await ctx.getFileStream();

      // get instanc
      await app.filestore.get('instance1').createFromStream({ stream, filename: stream.filename  });
    }
  };
};
```

## Methods

### createFromStream

```js
// app/controller/home.js
module.exports = app => {
  return class HomeController extends app.Controller {
    async create() {
      const { ctx, app } = this;

      const stream = await ctx.getFileStream();

      await app.filestore.createFromStream({ stream, filename: stream.filename });
    }
  };
};
```

### createFromUrl

```js
// app/controller/home.js
module.exports = app => {
  return class HomeController extends app.Controller {
    async createByUrl() {
      const { app } = this;

      const { url } = ctx.request.body;
      const filename = path.basename(url);
      const extname = path.extname(url).toLowerCase();
      const sourceUrl = await app.filestore.createFromUrl({
        url,
        filename: filename + extname ,
      });
    }
  };
};
```

### destroy

```js
// app/controller/home.js
module.exports = app => {
  return class HomeController extends app.Controller {
    async destory() {
      const { ctx, app } = this;

      const { url } = ctx.request.body;
      const filename = path.basename(url);
      const extname = path.extname(url).toLowerCase();

      await app.filestore.destroy(filename + extname);
    }
  };
};
```

### download

```js
// app/controller/home.js
const getFileNameAndExtentions = function(filename) {
  if (!filename) {
    return {};
  }
  const nameArr = decodeURIComponent(filename).split('.');
  const extname = nameArr.pop();
  const name = nameArr.join('.');
  return {
    extname,
    name,
  };
}
module.exports = app => {
  return class HomeController extends app.Controller {
    async download() {
      const { ctx, app } = this;
      const filename = ctx.params.filename;
      if (!filename) {
        ctx.status = 404;
        return;
      }
      const id = getFileNameAndExtentions(decodeURIComponent(filename)).name || filename;
      const attachment = await ctx.service.upload.show(id);
      if (!attachment) {
        ctx.status = 404;
        return;
      }
      return app.filestore.get('uploads').download({
        filename,
        ctx
      });
    }
  };
};
```

## Questions & Suggestions

Please open an issue [here](https://github.com/eggjs/egg/issues).

## License

[MIT](LICENSE)
