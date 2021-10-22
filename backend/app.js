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

    //Moving
    socket.on('moving', (userData)=> {
        
        console.log(userData)
        socket.broadcast.emit('moving', userData);
    })

    //Call
    socket.on("call", (data) => {
        io.to(data.userToCall).emit("call", {
            signal: data.signalData, caller: data.caller, receiver: data.name
        })
    })

    //Answer
    socket.on("answer", (data) => {
        io.to(data.to).emit("accepted", data.signal)
    })

    //End
    socket.on("end", () => {
        socket.broadcast.emit("disconnected")
    })

})

//Server
server.listen(8080, () => {
    console.log("app listening on port 8080");
  });