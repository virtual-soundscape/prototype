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

    //Enter
    socket.on("enter", (data) => {
        io.to(data.to).emit("accepted", data.signal)
    })

    //Exit
    socket.on("exit", () => {
        socket.broadcast.emit("disconnected")
    })

})

//Server
server.listen(8080, () => {
    console.log("app listening on port 8080");
  });