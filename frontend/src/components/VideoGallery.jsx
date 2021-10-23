import React, { useEffect, useRef, useState } from 'react';

import Peer from "simple-peer"
import styled from 'styled-components'

const StyledVideo = styled.video`
  height: 40%;
  width: 50%;
`;

function Video({ remote, id }) {
  const videoDOMElementId = `remote-${id}`;
  useEffect(() => {
    remote.on("stream", stream => {
      console.log("Got remote stream", stream);
      document.getElementById(videoDOMElementId).srcObject = stream;
    });
  }, []);

  return (
      <video id={videoDOMElementId} playsInline autoPlay className="w-100"/>
  );
}

function VideoGallery({ socket, roomId }) {

  const [remotes, setRemotes] = useState([]);
  const localStream = useRef();

  const createRemote = (remoteId, localId, stream) => {
    console.log(`[Local=${localId}] creating peer for remote user ${remoteId}`);
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream,
    });

    peer.on("signal", (signal) => {
      console.log("Signaling data");
      socket.emit("sending signal", {
        user: remoteId, callerId: localId, signal
      });
    })

    peer.on('error', err => {
      console.error(`Initiator error: ${err}`)
    }) // <--- 

    return {
      remoteId,
      remote: peer
    };
  }

  const addRemote = (newSignal, callerId, stream) => {
    console.log(`[Local] adding peer = ${callerId}`);
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream,
    });

    peer.on("signal", (signal) => {
      socket.emit("returning signal", { signal, callerId })
    })

    peer.on('error', err => console.error(`Answer-er error: ${err}`)) // <--- 

    peer.signal(newSignal)

    return {
      remoteId: callerId,
      remote: peer
    };
  }

  // Register listeners onto WebSocket.
  useEffect(() => {
    socket.on("allUsers", users => {
      console.log(`Received all users: ${users}`);

      const remoteUsers = users.map(remoteSocketID => {
        return createRemote(remoteSocketID, socket.id, localStream.current);
      });

      setRemotes(remoteUsers);
    });

    socket.on("joinUser", (data) => {
      console.log("Received joinUser message", data);

      const remote = addRemote(data.signal, data.callerId, localStream.current);
      setRemotes([...remotes, remote])
    })

    socket.on("received returned signal", (data) => {
      console.log("Receiving returned signal", remotes, data);
      const item = remotes.find((r) => r.remoteId === data.id)
      item?.remote.signal(data.signal)
    });

    return () => {
      socket.off("received returned signal");
      socket.off("joinUser");
      socket.off("allUsers");
    }
  }, [remotes]);

  // Ask user for camera permission.

  const onLocalStreamReady = stream => {
    // Attach to local DOM element.
    const localVideo = document.getElementById("localVideo");
    localVideo.srcObject = stream;

    // Update ref.
    localStream.current = stream;

    socket.emit("getAllUsers", roomId);
  };

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({
      video: true, audio: true
    })
      .then(onLocalStreamReady)
      .catch(error => {
        console.error(`Cannot get local stream: ${error}`);
      })
  }, []);

  return (
    <div>
      {/* <StyledVideo autoPlay muted id="localVideo" width="75%"></StyledVideo> */}
      <video
        autoPlay
        muted 
        id="localVideo"
        className="w-100"
      />

      {remotes.map(({ remote }, index) => {
        return (
          <Video key={index} id={index} remote={remote}></Video>
        )
      })}
      <div>    
        <button className="w-100 border-0" onClick={() =>  navigator.clipboard.writeText("https://virtual-soundscape.herokuapp.com/room/" + roomId)}>Share Room</button>
      </div>
      <div>    
      <button className="mt-2 w-100 border-0" onClick={() => {window.location.href = "https://virtual-soundscape.herokuapp.com/"}}>Leave</button>
      </div>
    </div>
  );
}

export default VideoGallery;