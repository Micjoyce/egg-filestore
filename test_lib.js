// 'use strict';

// const path = require('path');
// const fs = require('fs');
// const AliOss = require('./lib/alioss');
// const oss = require('ali-oss').Wrapper;

// const config = {
//   type: 'AliOss',
//   options: {
//     accessKeyId: 'access key',
//     accessKeySecret: 'access key secret',
//     bucket: 'you bucket',
//     region: 'oss-cn-hangzhou',
//     timeout: '60s',
//   },
//   category: 'uploads',
//   prefixUrl: '/api/uploads/access/upload',
// };

// const file1 = path.join('/Users/michaelxu/develop/digger/DiggerServer/test/fixtures/uploads', 'img1.png');
// const rs = fs.createReadStream(file1);

// const store = new AliOss(config);
// store.getFile('hello/f1.png')
//   .then(r => console.log(r, '-----'))
//   .catch(r => console.log(r, 'saaaaa'));

// const store = new oss(config.options);

// store.head('hello/hello.png')
//   .then(r => console.log(r, '-----'))
//   .catch(r => console.log(r, 'saaaaa'));
