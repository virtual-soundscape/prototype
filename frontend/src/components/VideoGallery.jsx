import React, { useEffect, useRef, useState } from 'react';

import Peer from "simple-peer"
import styled from 'styled-components'

const StyledVideo = styled.video`
  height: 40%;
  width: 50%;
`;

function opacityForDistance(distance) {
  const maxOpacity = 100;
  const furthestDistance = 500;

  return Math.sqrt(
    Math.max(
      maxOpacity ** 2
      *
      (1 - (distance / furthestDistance) ** 2)
      ,
      0
    )
  );
}

function volumeForDistance(distance) {
  return opacityForDistance(distance) / 100;
}

function Video({ remote, remoteId, user }) {
  const videoRef = useRef();

  const videoDOMElementId = `${remoteId}`;
  useEffect(() => {
    remote.on("stream", stream => {
      console.log("Got remote stream", stream);
      document.getElementById(videoDOMElementId).srcObject = stream;
    });
  }, []);

  useEffect(() => {
    let opacity = 100;
    if (user) {
      const [x, y, color, displayName, distance] = user;
      opacity = opacityForDistance(distance);
    }
  
    let volume = 1;
    if (user) {
      const [x, y, color, displayName, distance] = user;
      volume = volumeForDistance(distance);
    }
  
    if (videoRef.current) {
      videoRef.current.volume = volume;
    }
  }, [user]);


  return (
    <div class="">
      <video
        id={videoDOMElementId}
        playsInline
        autoPlay
        width="100%"
        ref={videoRef}
        controls
      />
    </div>
  );
}

function VideoGallery({ socket, roomId, users }) {

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
    })

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

    peer.on('error', err => console.error(`Answer-er error: ${err}`))

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

    socket.on("userDisconnect", (discUserId) => {
      console.log("this is the disconnected user id", discUserId)
      let feed = document.getElementById(discUserId)
      feed.remove();
    })

    return () => {
      socket.off("received returned signal");
      socket.off("joinUser");
      socket.off("allUsers");
      socket.off("userDisconnect");
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
      <video
        autoPlay
        muted 
        id="localVideo"
        className="w-100"
      />

      {remotes.map(({ remoteId, remote }, index) => {
        const user = users[remoteId];
        return (
          <Video key={index} id={index} remote={remote} remoteId={remoteId} user={user}/>
        )
      })}
      <div>    
        <button className="w-100 border-0" onClick={() =>  navigator.clipboard.writeText("https://virtual-soundscape.herokuapp.com/room/" + roomId)}>Share Room</button>
      </div>
      <div>    
      <button className="mt-2 w-100 border-0" onClick={() => {window.location.href = "https://virtual-soundscape.herokuapp.com/"}}>Disconnect</button>
      </div>
    </div>
  );
}

export default VideoGallery;