import 'bootstrap/dist/css/bootstrap.min.css';
import './Landing.css'
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom'

function Landing() {

    const [roomId, setRoomId] = useState("");
    const [displayName, setDisplayName] = useState("");

  return (
    <div className="container-fluid d-flex landing">
        <div className="row p-5">
            <div className="row p-3">
                <h2>
                    Soundscape creates a virtual room connecting users via video and audio chat. Move around in the room using w,a,s,d to alter your chat based on your proximity to other users.
                </h2>
            </div>
            <div className="row p-3 mt-5">
            <table>
                <tbody>
                <tr>
                    <td>
                        <input value={roomId} onChange={(e) => setRoomId(e.target.value)} type="text" placeholder="room id"/>
                    </td>
                    <td>
                        +
                    </td>
                    <td>
                        <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} type="text" placeholder="enter display name" className="ml-5"/>
                    </td>
                    <td>
                        =
                    </td>
                    <td>
                        <Link to={`/room/${roomId}/${displayName}`} className="link">Enter</Link>
                    </td>
                </tr>
                </tbody>
            </table>
            </div>
        </div>

    </div>
  );
}

export default Landing;
