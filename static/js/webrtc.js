// static/js/webrtc.js

let localStream;
const socket = io();

async function setupLocalVideo() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStream = stream;
        const localVideo = document.getElementById('local-video');
        localVideo.srcObject = stream;
    } catch (error) {
        console.error('Error accessing media devices:', error);
        showErrorMessage('Could not access camera and microphone.');
    }
}

function createPeerConnection() {
    const peerConnection = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
    });

    return peerConnection;
}

document.addEventListener('DOMContentLoaded', () => {
    setupLocalVideo();
});

socket.on('connect', () => {
    console.log('Connected to server');
});

socket.on('disconnect', () => {
    console.log('Disconnected from server');
});
