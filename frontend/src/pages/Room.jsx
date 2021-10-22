import 'bootstrap/dist/css/bootstrap.min.css';
import './Room.css'
import { useParams } from "react-router";
import Map from "../components/Map";
import VideoGallery from "../components/VideoGallery";
import io from 'socket.io-client';


function Room() {
  const { id } = useParams();
  const socket = io.connect("http://localhost:8080")
  socket.emit("newUser", id)
  

    return (
      <div id="container" className="container-fluid">
        <div className="row">
          <div className="col-10">
            <Map socket={socket} roomId={id}/>
          </div>
          <div className="col-2">
            <VideoGallery socket={socket} roomId={id} />
          </div>
        </div>
      </div>
    );
  }
  
  export default Room;
  