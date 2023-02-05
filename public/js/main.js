// Identify user
let localUserId = sessionStorage.getItem('localUserId');
if ( !localUserId || localUserId === 'undefined' ) {
  localUserId = String(Math.floor(Math.random() * 10000));
  sessionStorage.setItem('localUserId', localUserId);
} else {
  localUserId = String(localUserId);
}
console.log('local user id:', localUserId);

// Socket
const socket = io('/');

socket.on('connect', () => console.log('Connected to socket server!'));
