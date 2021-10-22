const express = require("express");
const http = require("http")
const app = express();
const server = http.createServer(app)

const io = require("socket.io")(server, {
    cors: {
        origin:"http://localhost:3000",
        methods: [ "GET", "POST" ]
    }
})

io.on("connection", (socket) => {
    
    socket.emit("local", socket.id)
    socket.on("newUser", (room_id) => {
        socket.join(room_id)
    })

    //Moving
    socket.on('moving', (room_id, userData)=> {
        socket.to(room_id).emit('moving', userData);
    })

    //Call
    socket.on("call", (room_id, data) => {
        socket.to(room_id).emit("call", {
            signal: data.signalData, caller: data.caller, receiver: data.name
        })
    })

    //Answer
    socket.on("answer", (room_id, data) => {
        socket.to(room_id).emit("accepted", data.signal)
    })

    //End
    socket.on("end", (room_id) => {
        socket.to(room_id).emit("disconnected")
    })

})

//Server
server.listen(8080, () => {
    console.log("app listening on port 8080");
  });