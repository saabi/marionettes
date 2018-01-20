const PORT = process.env.PORT || 80;

import http = require('http');
import * as Koa from "koa";
import * as bodyParser from 'koa-bodyparser';
import * as Router from 'koa-router';
import * as fileServer from 'koa-static';
import * as mount from 'koa-mount';
const convert = require('koa-convert')
const trailingSlashEnforcer = require('koa-add-trailing-slashes')();

import * as IO from 'socket.io';

import * as util from 'util';

let app = new Koa();
app.on('error', function (err:Error) {
  console.log('Koa Stack Error: %s', err.message);
  console.log(err);
});

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    this.status = err.status || err.cause.status || 500;
    this.body = err.message || err;
    ctx.app.emit('error', err, ctx);
  }
});

let router = new Router();

//app.use(bodyParser());
//app.use(router.routes());
//app.use(router.allowedMethods());
//app.use(trailingSlashEnforcer);
app.use(convert(mount('/src', fileServer('src')))); // TODO: Secure this item.
app.use(convert(fileServer('public')));


let server = http.createServer(app.callback());

let io = IO(server);

interface Sockets {
  [id:string]:SocketIO.Socket;
}

let desktops: Sockets = {};
let phones: Sockets = {};

io.on('connection', socket => {
  console.log(`Client  connected. ${socket.id}`)
  //console.log(util.inspect(socket));

  socket.on('device', (msg:any) => {
    switch(msg) {
      case 'phone':
        console.log('Phone connected.');

        phones[socket.id] = socket;

        for(let i in desktops) {
          desktops[i].emit('phoneadded', socket.id);
        }


        socket.on('message', (msg:any) => {
          msg.id = socket.id;
          for(let i in desktops) {
            desktops[i].emit('motion', msg);
          }
        });

        break;
      case 'desktop':
        console.log('Desktop connected.');
        desktops[socket.id] = socket;
        for (let i in phones) {
          socket.emit('phoneadded', phones[i].id);
        }
        break;
    }
  });
  socket.on('disconnect', () => {
    console.log(`Client disconnected. ${socket.id}`);
    let id = socket.id;
    if (id in desktops) {
      console.log(`Desktop disconnected.`);
      delete desktops[id];
    } else if (id in phones) {
      console.log(`Phone disconnected.`);
      delete phones[id];
      for(let i in desktops) {
        desktops[i].emit('phoneremoved', id);
      }
    }
  });
});


let listener = server.listen(PORT, () => {
    console.log(`Server started listening on port ${PORT}.`);
});
