import React, { useEffect, useRef, useState } from 'react';

import Peer from "simple-peer"
import io from 'socket.io-client'

function VideoGallery(props) {
  
  const [localId, setLocalId] = useState("")
  const [name, setName] = useState("")
  const [localStream, setLocalStream] = useState()
  const [remoteStream, setRemoteStream] = useState([])
  const [roomId, setRoomId] = useState("")
  const [roomSignal, setroomSignal] = useState()
  const [end, setEnd] = useState(false)

  const connectionRef = useRef()


  useEffect(() => {
    navigator.mediaDevices.getUserMedia({video: true, audio: true})
    .then((stream) => {
      setLocalStream(stream)
      const localVideo = document.getElementById("localVideo")
      localVideo.srcObject = localStream
    })

    props.socket.on("local", (id) => {
      setLocalId(id)
    })

    props.socket.on("call", (data) => {
      setReceiving(true)
      setCallerId(data.caller)
      setName(data.receiver)
      setCallerSignal(data.signal)
    })
  }, [])

  const callUser = (id) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream
    })

    peer.on("signal", (data) => {
      props.socket.emit("call", {
        userToCall: id,
        signalData: data,
        caller: localId,
        name: name
      })
    })

    peer.on("stream", (stream) => {
      console.log("getting")
      const remoteVideo = document.getElementById("remoteVideo")
      remoteVideo.srcObject = stream
    })

    props.socket.on("accepted", (signal) => {
      setAccepted(true)
      peer.signal(signal)
    })

    connectionRef.current = peer
  }

  const answerCall = () => {
    setAccepted(true)
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream
    })

    peer.on("signal", (data) => {
      props.socket.emit("answer", {
        signal: data,
        to: callerId
      })
    })

    peer.on("stream", (stream) => {
      const remoteVideo = document.getElementById("remoteVideo")
      remoteVideo.srcObject = stream
    })

    peer.signal(callerSignal)
    connectionRef.current = peer
  }

  const leaveCall = () => {
    setEnd(true)
    connectionRef.current.destroy()
  }
  
  return (
    <div>
      <h2>remote</h2>
      {accepted && !end ? <video autoPlay id="remoteVideo"></video> : null}
      <h2>local</h2>
      <video autoPlay muted id="localVideo"></video>
      <div>
        <form>
          <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)}/>
        </form>
          <button onClick={() =>  navigator.clipboard.writeText(localId)}>Copy Your ID</button>
        <form>
          <input type="text" placeholder="Who Do You Want To Call" value={receiverId} onChange={(e) => setReceiverId(e.target.value)}/>
        </form>
        <div>
					{accepted && !end ? (
						<button onClick={leaveCall}>
							End Call
						</button>
					) : (
						<button onClick={() => callUser(receiverId)}>
							Call
						</button>
					)}
				</div>
        <div>
				{receiving && !accepted ? (
						<div>
						<h1 >{name} is calling...</h1>
						<button onClick={answerCall}>
							Answer
						</button>
					</div>
				) : null}
			</div>
      </div>
    </div>
  );
}

export default VideoGallery;