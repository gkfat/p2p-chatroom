// Agora config
const APP_ID = '69ba663d3afa4463a7d58a4131f9d576';
const token = null;
const audioConfig = {};
const videoConfig = {
  encoderConfig: {
    width: { min: 640, ideal: 640, max: 640 },
    height: { min: 480, ideal: 480, max: 480 }
  }
};
let client;

// Identify room
const ROOM_ID = new URLSearchParams(window.location.search).get('id');

// Stream variables
let localTracks = [];
let remoteUsers = {};

// Socket
socket.on('room-unavailable', () => {
  alert('Room not available!');
  const url = window.location.origin;
  this.window.location.assign(url);
})
socket.emit('join-room', ROOM_ID, localUserId);

const joinRoomInit = async () => {
  client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
  await client.join(APP_ID, ROOM_ID, token, localUserId);

  // Listen to Agora event
  client.on('user-published', handleUserPublished);
  client.on('user-unpublished', handleUserUnPublished);
  client.on('user-left', handleUserLeft);

  joinStream();
}

const joinStream = async () => {
  localTracks = await AgoraRTC.createMicrophoneAndCameraTracks(audioConfig, videoConfig);
  const streamDomId = `user-${localUserId}`;
  addStreamToDom(localUserId);
  localTracks[1].play(streamDomId);
  await client.publish([localTracks[0], localTracks[1]]);
}

const handleUserPublished = async (user, mediaType) => {
  remoteUsers[user.uid] = user;
  await client.subscribe(user, mediaType);
  const streamDomId = `user-${user.uid}`;
  let player = document.getElementById(streamDomId);

  if ( !player ) {
    addStreamToDom(user.uid);
  }

  if ( mediaType === 'video' ) {
    user.videoTrack.play(streamDomId);
  } else if ( mediaType === 'audio' ) {
    user.audioTrack.play(streamDomId);
    setMuteStatus(user.uid, false);
  }
}

const handleUserUnPublished = async (user, mediaType) => {
  if ( mediaType === 'audio' ) {
    setMuteStatus(user.uid, true);
  }
}

const handleUserLeft = async (user) => {
  delete remoteUsers[user.uid];
  const streamDomId = `user-${user.uid}-stream-wrapper`;
  document.getElementById(streamDomId).remove();
}

const addStreamToDom = (uid) => {
  const isLocal = uid === localUserId ? 'is-local' : '';
  player = `<div class="stream-wrapper ${isLocal}" id="user-${uid}-stream-wrapper">
              <div class="stream" id="user-${uid}"></div>
              <div class="member-info-wrapper">
                <i class="icon icon-member"></i>
                <span class="user-id">${uid}</span>
              </div>
              <i class="icon icon-mute hide"></i>
              <i class="icon icon-unmute"></i>
            </div>`
  if ( isLocal === 'is-local' ) {
    document.getElementById('streams-container').insertAdjacentHTML('afterbegin', player);
  } else {
    document.getElementById('streams-container').insertAdjacentHTML('beforeend', player);
  }
}


/*
** Controllers
*/
const toggleControl = async (type) => {
  const button = document.getElementById(`button-${type}`);
  const track = type === 'audio' ? localTracks[0] : localTracks[1];
  await track.setMuted(!track.muted);

  if ( !track.muted ) {
    button.classList.remove('disabled');
    button.classList.add('active');
    setMuteStatus(localUserId, false);
  } else {
    button.classList.add('disabled');
    button.classList.remove('active');
    setMuteStatus(localUserId, true);
  }
}

const setMuteStatus = (uid, mute) => {
  const userStreamWrapper = document.getElementById(`user-${uid}-stream-wrapper`);
  const muteBtn = userStreamWrapper.getElementsByClassName('icon-mute')[0];
  const unmuteBtn = userStreamWrapper.getElementsByClassName('icon-unmute')[0];
  if ( mute ) {
    unmuteBtn.classList.add('hide');
    muteBtn.classList.remove('hide');
  } else {
    muteBtn.classList.add('hide');
    unmuteBtn.classList.remove('hide');
  }
}

const copyToClipboard = () => {
  const copyText = document.getElementById('room-link-input');
  copyText.focus();
  copyText.select();
  document.execCommand('copy');
  alert('Link copied to the clipboard!');
}

const leaveRoom = () => {
  const url = window.location.origin;
  this.window.location.assign(url);
}

// Init
document.getElementById('room-link-input').value = window.location.href;
if ( !ROOM_ID ) {
  this.window.location.assign(window.location.origin);
} else {
  document.getElementById('room-id').innerText = `Room ID ${ROOM_ID}`;
  joinRoomInit();
}