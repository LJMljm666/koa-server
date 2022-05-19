const http = require('http');
const Koa = require('koa');
const Serve = require('koa-static-server');
const koaBody = require('koa-body');
const router = require('./routes');
const path = require('path');

const PORT = 9999;

const app = new Koa();

app.use(Serve({rootDir: path.resolve(__dirname, '../public')}));
app.use(koaBody({multipart: true}));

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