const http = require('http');
const Koa = require('koa');
const Serve = require('koa-static-server');
const KoaBody = require('koa-body');
const Cors = require('@koa/cors');
const path = require('path');
const fs = require('fs');
const { Server } = require("socket.io");
const { nanoid } = require('nanoid');
const jobs = require('./timedTask');

const router = require('./routes');

const htmlDir = path.resolve(__dirname, '../public/html');
if(!fs.existsSync(htmlDir)) {
  fs.mkdir(htmlDir, err => {
    if(err) console.error('html文件夹创建失败！！！')
  });
}

jobs();

// 每天一点钟删除temp目录 node-schedule
// const job = schedule.scheduleJob('1 * * *', function(){
//   fs.existsSync(tempDir) && fs.rmSync(tempDir, { recursive: true });
//   console.log('删除时间:', new Date().toLocaleString());
// });

const PORT = 9999;

const app = new Koa();

app.use(Cors());
app.use(Serve({rootDir: path.resolve(__dirname, '../public'), rootPath: '/public', maxage: 1000 * 60 * 60 * 24}));
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

const httpServer = http.createServer(app.callback());

const rooms = new Map();

const io = new Server(httpServer);

io.on('connection', (socket) => {
  socket.on('createRoom', (username) => {
    const roomId = nanoid(10);
    const thisRoom = { roomId, users: [username] };
    rooms.set(roomId, thisRoom);
    // https://socket.io/docs/v4/rooms/
    socket.join(roomId);
    socket.emit('createRoom', roomId);
    io.to(roomId).emit(
      'aUserJoined',
      JSON.stringify({ username, room: thisRoom }),
    );
  });

  socket.on('joinRoom', ({ username, roomId }) => {
    const thisRoom = rooms.get(roomId);
    console.log(thisRoom);
    if (!thisRoom) {
      return socket.emit('joinRoom');
    }
    const hasThisUser = thisRoom.users.includes(username);
    if (!hasThisUser) {
      thisRoom.users.push(username);
      socket.join(roomId);
      socket.emit('joinRoom', thisRoom);
      io.to(roomId).emit(
        'aUserJoined',
        JSON.stringify({ username, room: thisRoom }),
      );
    } else {
      socket.emit('joinRoom');
    }
  });

  socket.on('exitRoom', ({ username, roomId }) => {
    console.log(rooms);
    const thisRoom = rooms.get(roomId);
    if (!thisRoom) return;
    const thisUserIndex = thisRoom.users.indexOf(username);
    if (thisUserIndex >= 0) {
      if (thisRoom.users.length === 1) {
        rooms.delete(roomId);
      } else {
        thisRoom.users.splice(thisUserIndex, 1);
      }
      io.to(roomId).emit('aUserExited', username);
      socket.leave(roomId);
      socket.emit('exitRoom', 'success');
    }
    console.log(rooms);
  });

  socket.on('textChat', ({ roomId, chatText, username }) => {
    io.to(roomId).emit('textChat', { username, chatText });
  });

  socket.on('ice_candidate', (data) => {
    // console.log('ice_candidate', data);
    io.to(data.roomId).emit('ice_candidate', data);
  });

  socket.on('video_offer', (data) => {
    // console.log('video_offer', data);
    io.to(data.roomId).emit('video_offer', data);
  });

  socket.on('video_answer', (data) => {
    // console.log('video_answer', data);
    io.to(data.roomId).emit('video_answer', data);
  });

  socket.on('disconnect', (reason) => {
    console.log(reason);
    // socket.broadcast()
    socket.disconnect();
  });
});

httpServer.listen(PORT, () => {
  console.log('http://localhost:' + PORT);
});