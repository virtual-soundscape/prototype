import 'bootstrap/dist/css/bootstrap.min.css';
import './Room.css'
import { useParams } from "react-router";
import Map from "../components/Map";
import VideoGallery from "../components/VideoGallery";


function Room() {
  const { id } = useParams();

    return (
      <div className="container-fluid">
          <div>
            <Map roomId={id}/>
            <VideoGallery roomId={id} />
          </div>
      </div>
    );
  }
  
  export default Room;
  