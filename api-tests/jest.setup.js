const pactum = require('pactum');
const config = require(`./configs/${process.env.PROFILE || 'stag'}`);

beforeAll(async () => {
  pactum.request.setDefaultTimeout(30000);
  pactum.request.setBaseUrl(config.HOST_URL);
  global.config = config;
});

beforeEach(() => {
  console.log(`Test started: ${expect.getState().currentTestName}`);
});

afterEach(() => {
  console.log(`Test ended: ${expect.getState().currentTestName}`);
});
