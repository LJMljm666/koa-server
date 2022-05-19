const Router = require('koa-router');
const fs = require('fs');
const path = require('path');
const router = new Router();

const htmlDir = path.resolve(__dirname, '../../public/html');
const tempHtmlDir = path.resolve(htmlDir, './temp');

router.get('/', async (ctx, next) => {
  ctx.set('Content-Type', 'text/html');
  ctx.body = '<h1>This is a KOA server.<h1>';
})

router.post('/generateHtml', async (ctx, next) => {
  try {
    const { query, files } = ctx.request;
    const { html: {originalFilename, filepath} } = files;
    const { isTemp } = query;
    const buffer = fs.readFileSync(filepath);
    if(isTemp) {
      !fs.existsSync(tempHtmlDir) && fs.mkdirSync(tempHtmlDir);
      fs.writeFileSync(path.resolve(tempHtmlDir, originalFilename), buffer);
      ctx.body = 'http://useless.plus:9999/public/html/temp/' + originalFilename;
    } else {
      fs.writeFileSync(path.resolve(htmlDir, originalFilename), buffer);
      ctx.body = 'http://useless.plus:9999/public/html/' + originalFilename;
    }
  } catch (error) {
    console.log(error);
    ctx.throw(500);
  }
})

module.exports = router;