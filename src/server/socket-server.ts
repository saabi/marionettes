import IO from 'socket.io';
import { Server } from 'http';


interface Sockets {
  [id:string]:SocketIO.Socket;
}

export function startSocketServer(server: Server) {
  let desktops: Sockets = {};
  let phones: Sockets = {};
  let slots: (string|null)[] = [];
  
  let io = IO(server);
  
  io.on('connection', (socket: IO.Socket) => {
    console.log(`Client  connected. ${socket.id}`)
  
    socket.on('device', (msg:any) => {
      switch(msg) {
        case 'phone':
          console.log('Phone connected.');
  
          phones[socket.id] = socket;
  
          let firstEmptySlot = slots.indexOf(null);
          if (firstEmptySlot === -1) {
            firstEmptySlot = slots.length;
            slots.push(socket.id);
          }
          else 
            slots[firstEmptySlot] = socket.id;
  
          let msg = {
            id: socket.id,
            slot: firstEmptySlot
          }
          for(let i in desktops) {
            desktops[i].emit('phoneadded', msg);
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
              let msg = {
                id: i,
                slot: slots.indexOf(i)
              }
              socket.emit('phoneadded', msg);
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
  
        let slot = slots.indexOf(id);
        if (slot > -1)
          slots[slot] = null;
  
        for(let i in desktops) {
          desktops[i].emit('phoneremoved', id);
        }
      }
    });
  });
}
