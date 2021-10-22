import React, { useEffect, useRef, useState } from 'react';

import Peer from "simple-peer"
import styled from 'styled-components'

function VideoGallery(props) {
  const [remotes, setRemotes] = useState([]);
  const [roomId, setRoomId] = useState(props.roomId);

  const remotesRef = useRef([]);

  const StyledVideo = styled.video`
  height: 40%;
  width: 50%;
`;

const Video = (props) => {
  const ref = useRef();

  useEffect(() => {
      props.remote.on("stream", stream => {
          ref.current.srcObject = stream;
      })
  }, []);

  return (
      <StyledVideo playsInline autoPlay ref={ref} />
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
    console.log("creating")
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
    console.log("adding")
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
      <StyledVideo autoPlay muted id="localVideo" width="75%"></StyledVideo>
      {remotes.length > 0 ? remotes.map((remote, index) => {
        return (
          <Video key={index} id={index} remote={remote}></Video>
        )
      }) : null}
      <div>
          
        <div>
        <button onClick={() =>  navigator.clipboard.writeText(roomId)}>Copy Room ID</button>
			</div>
      </div>
    </div>
  );
}

export default VideoGallery;