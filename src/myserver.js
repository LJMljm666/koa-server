const http = require('http');
const Koa = require('koa');
const Serve = require('koa-static-server');
const KoaBody = require('koa-body');
const Cors = require('@koa/cors');
const path = require('path');
const fs = require('fs');

const router = require('./routes');

const htmlDir = path.resolve(__dirname, '../public/html');
if(!fs.existsSync(htmlDir)) {
  fs.mkdir(htmlDir, err => {
    if(err) console.error('html文件夹创建失败！！！')
  });
}

// 每天一点钟删除temp目录 node-schedule
// const job = schedule.scheduleJob('1 * * *', function(){
//   fs.existsSync(tempDir) && fs.rmSync(tempDir, { recursive: true });
//   console.log('删除时间:', new Date().toLocaleString());
// });

const PORT = 9999;

const app = new Koa();

app.use(Cors());
app.use(Serve({rootDir: path.resolve(__dirname, '../public'), rootPath: '/public'}));
app.use(KoaBody({multipart: true}));

// app.use(async (ctx, next) => {
//     console.log(ctx);
//     // console.log(ctx.body);
//     // console.log(ctx.cookies);
//     // console.log(ctx.ip);
//     ctx.status = 200;
//     ctx.body = 'hello word';
//     // ctx.throw(400, 'name required', { user: 'luo' }); // 抛出异常
//     // ctx.redirect('/a');
//     await next();
// })

// x-response-time
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.set('X-Response-Time', `${ms}ms`);
});

// logger
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
});

app.use(router.routes());
app.use(router.allowedMethods());

app.on('error', (err, ctx) => {
  console.error('[server error]', err) // 异常监控
});

http.createServer(app.callback()).listen(PORT, () => {
  console.log('http://localhost:' + PORT);
});