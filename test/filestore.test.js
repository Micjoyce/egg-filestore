'use strict';

const mock = require('egg-mock');

describe('test/filestore.test.js', () => {
  let app;
  before(() => {
    app = mock.app({
      baseDir: 'apps/filestore-test',
    });
    return app.ready();
  });

  after(() => app.close());
  afterEach(mock.restore);

  it('should GET /', () => {
    return app.httpRequest()
      .get('/')
      .expect('hi, filestore')
      .expect(200);
  });
});
