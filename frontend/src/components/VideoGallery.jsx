import React, { useEffect, useRef, useState } from 'react';

import Peer from "simple-peer"

function VideoGallery(props) {
  const [remotes, setRemotes] = useState([]);
  const [roomId, setRoomId] = useState(props.roomId);

  const remotesRef = useRef([]);

  const Video = (props) => {
    const ref = useRef();

    useEffect(() => {
        props.peer.on("stream", stream => {
            ref.current.srcObject = stream;
        })
    }, []);

    return (
        <video playsInline autoPlay ref={ref} />
    );
}

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({video: true, audio: true})
    .then((stream) => {
      const localVideo = document.getElementById("localVideo")
      localVideo.srcObject = stream
      props.socket.emit("newUser", roomId)
      props.socket.on("allUsers", (users) => {
        const remotes = [];
        users.forEach((userId) => {
          const remote = createRemote(userId, props.socket.id, stream)
          remotesRef.current.push({
            remoteId: userId,
            remote,
          })
          remotes.push(remote);
          
        })
        setRemotes(remotes)
      })

      props.socket.on("joinUser", (data) => {
        const remote = addRemote(data.signal, data.callerId, stream)
        remotesRef.current.push({
          remoteId: data.callerId,
          remote,
        })
        setRemotes((users) => [...users, remote])
      })

      props.socket.on("received returning signal", (data) => {
        const item = remotesRef.current.find((r) => r.remoteId === data.id)
        item.remote.signal(data.signal)
      })
    })
  }, [])

  const createRemote = (user, callerId, stream) => {
    const peer = new Peer({
      intiator: true,
      trickle:false,
      stream: stream
    })

    peer.on("signal", (signal) => {
      props.socket.emit("sending signal", {user, callerId, signal})
    })

    return peer

  }

  const addRemote = (newSignal, callerId, stream) => {
    const peer = new Peer({
      intiator: false,
      trickle:false,
      stream: stream
    })

    peer.on("signal", (signal) => {
      props.socket.emit("returning signal", { signal, callerId })
    })

    peer.signal(newSignal)

    return peer

  }

  return (
    <div>
      <video autoPlay muted id="localVideo" width="75%"></video>
      {remotes.map((remote, index) => {
        return (
          <Video key={index} remote={remote}></Video>
        )
      })}
      <div>
          
        <div>
        <button onClick={() =>  navigator.clipboard.writeText(roomId)}>Copy Your ID</button>
        		{/* <button onClick={leaveCall}>
							End Call
						</button> */}
			</div>
      </div>
    </div>
  );
}

export default VideoGallery;