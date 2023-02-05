const baseUrl = window.location.origin + '/api';
const url = {
  createRoom: `${baseUrl}/room`
}

const CreateRoomAPI = async () => {
  return await fetch(url.createRoom, {
    method: 'GET',
    mode: 'cors'
  }).then(res => res.json())
}