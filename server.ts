import express, { Express, Request, Response } from 'express';
import http from 'http';
import path from 'path';
import { v4 } from 'uuid';
import { Server, Socket } from 'socket.io';
import cors from 'cors';

const app: Express = express();
const server = new http.Server(app);
const PORT = process.env.PORT || 3030;
const ioServer = new Server(server);

// Classes
class Room {
  id: string;
  userIds: string[];
  constructor(id: string, userIds: string[]) {
    this.id = id;
    this.userIds = userIds;
  }
}

// Chat rooms list
const roomsList: Room[] = [];

// Views
app.use('/', express.static('public'));
app.get('/', (req: any, res: any) => res.sendFile(path.join(__dirname, '/public', 'index.html')));
app.get('/room', (req: any, res: any) => res.sendFile(path.join(__dirname, '/public', 'room.html')));

// Socket functions
const socketFunctions = (socket: Socket) => {
  // Emit available rooms on connection
  socket.emit('available-rooms', roomsList);

  // User join room
  socket.on('join-room', (roomId: string, uId: string) => {
    const findRoom = roomsList.filter(room => room.id === roomId);
    if ( findRoom.length === 0 ) {
      socket.emit('room-unavailable');
    } else {
      console.log('user:', uId, 'join room:', roomId);
      findRoom[0].userIds.push(uId);
      socket.broadcast.emit('available-rooms', roomsList);
    }
  
    socket.on('disconnect', () => {
      console.log('user:', uId, 'leave room:', roomId);
      // Remove user from room
      if ( findRoom.length > 0 ) {
        findRoom[0].userIds.forEach((userId, i) => {
          if ( userId === uId ) {
            findRoom[0].userIds.splice(i, 1);
          }
        })
      }
      // Check every room & remove empty user room
      roomsList.forEach((room, i) => {
        if ( room.userIds.length === 0 ) {
          roomsList.splice(i, 1);
        }
      })
      // Update avlaible rooms
      socket.broadcast.emit('available-rooms', roomsList);
    })
  })
}

// API
const createRoomControl = async (req: Request, res: Response) => {
  const newRoom = new Room(v4(), []);
  const findRoom = roomsList.filter(room => room.id === newRoom.id);

  if ( findRoom.length > 0 ) {
    return res.status(400).send({
      message: 'Room already created!'
    })
  }
  roomsList.push(newRoom);
  ioServer.emit('available-rooms', roomsList);

  return res.send({
    message: 'Room created!',
    roomId: newRoom.id
  })
}

server.listen(PORT, () => {
    app.use(express.json({ limit: '50mb' }));
    app.use(cors());
    
    // Socket
    ioServer.on('connection', (socket: Socket) => socketFunctions(socket));
    
    // API
    const router = express.Router();
    router.get('/api/room', createRoomControl);
    app.use(router);

    console.log(`Server running on http://localhost:${PORT}`)
});