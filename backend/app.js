const express = require("express");
const http = require("http")
const app = express();
const server = http.createServer(app)
const path = require('path');

// Use Heroku port or 8080 if not defined.

const PORT = process.env.PORT || 8080;

// Default route should render client React app.

app.use(express.static(path.join(__dirname, 'client')));

const io = require("socket.io")(server, {
    cors: {
        origin:"http://localhost:3000",
        methods: [ "GET", "POST" ]
    }
})

const socketIdToRoomId = new Map();
const users = {};

io.on("connection", (socket) => {
    socket.emit("local", socket.id)
    
    socket.on("getAllUsers", (roomId) => {
        // Precondition: `roomId` exists.

        const existingUsersExceptSelf = Array.from(users[roomId]).filter(
            id => id !== socket.id
        );

        socket.emit("allUsers", existingUsersExceptSelf);
    });

    socket.on("newUser", (room_id) => {
        socketIdToRoomId.set(socket.id, room_id);
        socket.join(room_id)
        if(users[room_id]) {
            const length = users[room_id].length;
            if (length >= 8 ) {
                socket.emit("room full")
                return
            }

            users[room_id].add(socket.id);
        } else {
            users[room_id] = new Set([socket.id]);
        }

        // const existingUsers = users[room_id].filter((id) => id !== socket.id)
        // console.log("existinUsers", existingUsers)
        // socket.emit("allUsers", existingUsers)
    });

    //when user goes online
    socket.on("online", (room_id) => {
        socket.to(room_id).emit('online', socket.id)
    })
    socket.on("user", (socket_id, userData) => {
        socket.to(socket_id).emit("moving", userData)
    })

    //Moving
    socket.on('moving', (room_id, userData)=> {
        console.log("MOVING")
        socket.to(room_id).emit('moving', userData);
    })
    
    //Sending Signal
    socket.on("sending signal", data => {
        io.to(data.user).emit('joinUser', { signal: data.signal, callerId: data.callerId, userId: data.user });
    });

    //Returning Signal
    socket.on("returning signal", (data) => {
        io.to(data.callerId).emit('received returned signal', { signal: data.signal, id: socket.id });
    });

    //End
    socket.on("exit", (room_id) => {
        socketIdToRoomId.delete(socket.id);
        socket.io(room_id).emit("userDisconnect", socket.id)
        socket.to(room_id).emit("disconnected")
    })
    
    //disconnect
    socket.on("disconnect", () => {
        console.log("User Force Disconnected")
        const roomId = socketIdToRoomId.get(socket.id);
        io.to(roomId).emit("userDisconnect", socket.id);
        socketIdToRoomId.delete(socket.id);

        if (users[roomId])
            users[roomId].delete(socket.id);
    })

})

//Server
server.listen(PORT, () => {
    console.log("app listening on port 8080");
  });