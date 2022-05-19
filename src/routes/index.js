const Router = require('koa-router');
const fs = require('fs');
const path = require('path');
const router = new Router();
const tempHtmlDir = path.resolve(__dirname, '../../public/html/temp');

if(!fs.existsSync(tempHtmlDir)) {
  fs.mkdirSync(tempHtmlDir)
}

router.get('/', async (ctx, next) => {
  ctx.body = 'This is a KOA server.';
})

router.post('/generateHtml', async (ctx, next) => {
  try {
    const { query, files } = ctx.request;
    const { html: {originalFilename, filepath} } = files;
    const { isTemp } = query;
    console.log(isTemp);
    const buffer = fs.readFileSync(filepath);
    fs.writeFileSync(tempHtmlDir, buffer);
    ctx.body = 'user';
  } catch (error) {
    console.log(error);
  }
})

module.exports = router;