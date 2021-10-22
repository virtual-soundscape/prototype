import { useParams } from "react-router";
import Map from "../components/Map";
import VideoGallery from "../components/VideoGallery";
import io from 'socket.io-client';


function Room() {
  const { id } = useParams();
  const socket = io.connect("http://localhost:8080")
  socket.emit("newUser", id)
  

    return (
      <div className="container-fluid">
          <div>
            <Map socket={socket} roomId={id}/>
            <VideoGallery socket={socket} roomId={id} />
          </div>
      </div>
    );
  }
  
  export default Room;
  