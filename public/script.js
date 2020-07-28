const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer(undefined, {
    host: '/',
    port: '3001'
})
const myVideo = document.createElement('video')
myVideo.muted = true
const peers = {}

navigator.mediaDevices.getUserMedia({
    video:true,
    audio:true 
}).then(stream => {
    addVideoStream(myVideo, stream)

    myPeer.on('call', call =>{
        call.answer(stream)//answers when someone calls and sends them our stream
        
        const video= document.createElement('video')
        call.on('stream', userVideoStream =>{
            addVideoStream(video, userVideoStream)

        })
    })

    socket.on('user-connected', userId =>{
        connectToNewUser(userId, stream)

    })
})

socket.on('user-disconnected', userId =>{
    if (peers[userId]) peers[userId].close() //takes the users id that disconnected and closes video
})

myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id)
})

function connectToNewUser(userId, stream) {
    const call = myPeer.call(userId, stream) // calls the user and sends stream
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)//adds new user to video stream
    })
    call.on('close', () => {
        video.remove() // removes video when someone closes call
    })
    peers[userId] = call
}

function addVideoStream(video, stream) {
    video.srcObject = stream //makes the video play
    video.addEventListener('loadedmetadata', () => {
        video.play() // once the video is loaded play
    })
    videoGrid.append(video)
}