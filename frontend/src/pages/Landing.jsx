import 'bootstrap/dist/css/bootstrap.min.css';
import './Landing.css'

import { Link } from 'react-router-dom'

function Landing() {
  return (
    <div className="container-fluid d-flex">
        <div className="row p-5">
            <div className="row p-3">
                <h2>
                    Soundscape creates a virtual room connecting users via video and audio chat. Move about in the room using w,a,s,d to alter your chat based on your proximity to other users.
                </h2>
            </div>
            <div className="row p-3 mt-5">
            <table>
                <tr>
                    <td>
                        <input type="text" placeholder="room id"/>
                    </td>
                    <td>
                        +
                    </td>
                    <td>
                        <input type="text" placeholder="display name" className="ml-5"/>
                    </td>
                    <td>
                        =
                    </td>
                    <td>
                        <Link className="link">Join Room</Link>
                    </td>
                </tr>
                <tr>
                    <td>
                        
                    </td>
                    <td>
                        
                    </td>
                    <td>
                        <input type="text" placeholder="display name" className="ml-5"/>
                    </td>
                    <td>
                        =
                    </td>
                    <td>
                        <Link className="link">Create Room</Link>
                    </td>
                </tr>
            </table>
            </div>
        </div>

    </div>
  );
}

export default Landing;
