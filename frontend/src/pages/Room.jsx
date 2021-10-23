import 'bootstrap/dist/css/bootstrap.min.css';
import './Room.css'
import { useParams } from "react-router";
import { useEffect, useRef, useState } from "react";
import Map from "../components/Map";
import VideoGallery from "../components/VideoGallery";
import io from 'socket.io-client';


function Room() {
  const { id } = useParams();
  const [userId, setUserId] = useState();
  const [users, setUsers] = useState();

  // Use a ref here, because we don't need the socket to be part of component
  // state.

  const socketRef = useRef();

  // Only try connect when component mounts.

  useEffect(() => {
    const socket = io.connect("http://localhost:8080");

    // Attach receive handler before sending the 'newUser' message, so we know
    // how to handle the response.
    // TBH, this should be done via HTTP request, since it's request/response.

    socket.on("local", payload => {
      setUserId(payload);
    });
    socket.emit("newUser", id);

    socketRef.current = socket;
  }, []);

  const webSocketIsReady = userId !== undefined && socketRef.current;

  const collectUsers = (users) => {
    setUsers(users);
  }

  // TODO: maybe show a loading screen if the WebSocket connection isn't ready.

    return (
      <div id="container" className="container-fluid">
        <div className="row">
          <div className="col-10">
            {webSocketIsReady &&
              <Map socket={socketRef.current} roomId={id} userId={userId} collectUsers={(users) => collectUsers(users)} />}
          </div>
          <div className="col-2">
            {webSocketIsReady &&
              <VideoGallery socket={socketRef.current} roomId={id} users={users} />
            }
          </div>
        </div>
      </div>
    );
  }
  
  export default Room;
  
