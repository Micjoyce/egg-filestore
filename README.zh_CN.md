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

## 依赖说明

### 依赖的 egg 版本

egg-filestore 版本 | egg 1.x
--- | ---
1.x | 😁
0.x | ❌

### 依赖的插件
<!--

如果有依赖其它插件，请在这里特别说明。如

- security
- multipart

-->

## 开启插件

```js
// config/plugin.js
exports.filestore = {
  enable: true,
  package: 'egg-filestore',
};
```

## 使用场景

- Why and What: 描述为什么会有这个插件，它主要在完成一件什么事情。
尽可能描述详细。
- How: 描述这个插件是怎样使用的，具体的示例代码，甚至提供一个完整的示例，并给出链接。

## 详细配置

请到 [config/config.default.js](config/config.default.js) 查看详细配置项说明。


### 单实例配置

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
  bucketCategory: 'uploads',
  prefixUrl: '/source/upload',
}
```

### 多实例配置

```js
exports.filestore = {
  clients: {
    instance1: {
      type: 'AliOss',
      bucketCategory: 'uploads',
      prefixUrl: '/source/upload',
    },
    instance2: {
      type: 'FileSystem',
      prefixUrl: '/source/upload',
      directory: '~/uploads'  // default '~/uploads'
    },
  },
}

```

## 使用示例

### 单实例

```js
// app/controller/home.js
module.exports = app => {
  return class HomeController extends app.Controller {
    async create() {
      const { ctx, app } = this;

      const stream = await ctx.getFileStream();

      const filename = path.basename(stream.filename); // 文件名称
      const extname = path.extname(stream.filename).toLowerCase(); // 文件扩展名称

      await app.filestore.createFromStream({ ctx, stream, _id: filename, extname });
    }
  };
};
```

#### 多实例

```js
// app/controller/home.js
module.exports = app => {
  return class HomeController extends app.Controller {
    async create() {
      const { ctx, app } = this;

      const stream = await ctx.getFileStream();

      const filename = path.basename(stream.filename); // 文件名称
      const extname = path.extname(stream.filename).toLowerCase(); // 文件扩展名称
      // get instance
      await app.filestore.get('instance1').createFromStream({ ctx, stream, _id: filename, extname });
    }
  };
};
```

## 方法

### createFromStream

```js
// app/controller/home.js
module.exports = app => {
  return class HomeController extends app.Controller {
    async create() {
      const { ctx, app } = this;

      const stream = await ctx.getFileStream();

      const filename = path.basename(stream.filename); // 文件名称
      const extname = path.extname(stream.filename).toLowerCase(); // 文件扩展名称

      await app.filestore.createFromStream({ ctx, stream, _id: filename, extname });
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
      const { ctx, app } = this;

      const { url } = ctx.request.body;
      const filename = path.basename(url); // 文件名称
      const extname = path.extname(url).toLowerCase(); // 文件扩展名称
      const sourceUrl = await app.filestore.createFromUrl({
        ctx,
        url,
        _id: filename,
        extname,
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
      const filename = path.basename(url); // 文件名称
      const extname = path.extname(url).toLowerCase(); // 文件扩展名称

      await app.filestore.destroy({
        ctx,
        _id: filename,
        extname: extname,
      });
    }
  };
};
```

### getFile

```js
// app/controller/home.js
const getFileNameAndExtentions = function(filename) {
  if (!filename) {
    return {};
  }
  const nameArr = decodeURIComponent(filename).split('.');
  const extname = nameArr.pop(); // 文件扩展名称
  const name = nameArr.join('.'); // 文件名称
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
      return app.filestore.get('uploads').getFile({
        filename,
        ctx,
        attachment,
      });
    }
  };
};
```

## 单元测试

<!-- 描述如何在单元测试中使用此插件，例如 schedule 如何触发。无则省略。-->

## 提问交流

请到 [egg issues](https://github.com/eggjs/egg/issues) 异步交流。

## License

[MIT](LICENSE)
