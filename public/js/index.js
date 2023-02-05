// Rooms list
let roomsList = [];
const roomContainer = document.getElementById('rooms-container');

// Socket
socket.on('available-rooms', avalaibleRooms => handleUpdateRooms(avalaibleRooms));

const joinRoom = (roomId) => {
  const url = window.location.href + 'room?id=' + roomId;
  this.window.location.assign(url);
}

const createRoom = async () => {
  const createRoomId = await CreateRoomAPI().then(res => res.roomId);
  joinRoom(createRoomId);
}

const handleUpdateRooms = (avalaibleRooms) => {
  console.log('get available rooms', avalaibleRooms)
  roomsList = avalaibleRooms;
  roomContainer.innerHTML = null;
  const noRoomEl = document.getElementById('no-room');
  if ( roomsList.length === 0 ) {
    noRoomEl.classList.remove('hide');
  } else {
    noRoomEl.classList.add('hide');
    roomsList.forEach(room => {
      const findRoomEl = document.querySelector(`[name='${room.id}']`);
      if ( !findRoomEl ) {
        const createRoomEl = document.createElement('div');
        createRoomEl.classList.add('room');
        createRoomEl.setAttribute('name', room.id);
        createRoomEl.addEventListener('click', () => joinRoom(room.id));
        createRoomEl.innerHTML = `
          <h3>Room</h3>
          <p>${room.id}</p>
          <p>Users: ${room.userIds.length}</p>
        `
        roomContainer.append(createRoomEl);
      }
    })
  }
}
