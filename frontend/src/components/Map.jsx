import React from 'react';
import './Map.css'
import io from 'socket.io-client';

export default class Map extends React.Component {
    constructor(props){

        super(props)
        this.state = {
            user_id:"",
            room_id: this.props.roomId,
            moving: false,
            direction: 'N',
            x: 250,
            y: 250,
            containerWidth: 1500,
            containerHeight:900,
            avatarColor: '#' + Math.floor(Math.random()*16777215).toString(16),
            avatarWidth: 10,
            avatarHeight: 10,
            users:{}
        }
        
    }
        
    

    //virtual map and user setup
    componentDidMount(){
        this.props.socket.on("local", (user_id) =>{
            console.log(user_id)
            this.setState({
                user_id: user_id
            })
        })
        this.props.socket.on("moving", (userData) => {
                
                this.setState((prevState) => {
                    var placeholder = {
                        ...prevState.users
                    };
                    var distance = Math.sqrt((prevState.x - userData.x)**2 + (prevState.y - userData.y)**2);
                    placeholder[userData.user_id] = [userData.x, userData.y, userData.avatarColor, distance];
                    return {
                        users: placeholder
                    }
                })
                var canvas = document.getElementById('map');
                var ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, this.state.containerWidth, this.state.containerHeight)
                
                for(var key in this.state.users){
                    ctx.beginPath();
                    ctx.fillStyle = this.state.users[key][2]
                    ctx.fillRect(this.state.users[key][0], this.state.users[key][1], this.state.avatarWidth, this.state.avatarHeight);
                    ctx.stroke();
                }   
                console.log(this.state.users)

        })
        this.props.socket.on("userDisconnect", (discUserId) => {
            this.setState((prevState) => {
                var newUsers = prevState.users;
                delete newUsers[discUserId]
                return{
                    users: newUsers
                }
            })
            var canvas = document.getElementById('map');
            var ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, this.state.containerWidth, this.state.containerHeight)
                
            for(var key in this.state.users){
                ctx.beginPath();
                ctx.fillStyle = this.state.users[key][2]
                ctx.fillRect(this.state.users[key][0], this.state.users[key][1], this.state.avatarWidth, this.state.avatarHeight);
                ctx.stroke();
            }   
        })
        var canvas = document.getElementById("map");
        var ctx = canvas.getContext("2d");
        canvas.width = this.state.containerWidth;
        canvas.height = this.state.containerHeight;
        ctx.beginPath();
        ctx.fillStyle = this.state.avatarColor;
        ctx.fillRect(this.state.x, this.state.y, this.state.avatarWidth, this.state.avatarHeight);
        ctx.stroke();
        this.init()
    }

    //initialize moving function
    init(){
        
        document.addEventListener('keydown', this.keydownHandler.bind(this))
        document.addEventListener('keyup', this.keyupHandler.bind(this))
        
        setInterval(this.moving.bind(this), 33)

    }

    //what happens when user is moving
    moving(){
        var canvas = document.getElementById("map");
        var ctx = canvas.getContext("2d");
        
        if(this.state.moving){
            
            ctx.clearRect(0, 0, this.state.containerWidth, this.state.containerHeight);
            

            if(this.state.direction === 'N'){
                this.setState((prevState) => {
                    var currentStateY = prevState.y - 5;
                    if(currentStateY < 0){
                        currentStateY = 0;
                    }
                    return{
                        y: currentStateY
                    }
                })
            } 
            else if (this.state.direction === 'W'){
                this.setState((prevState) => {
                    var currentStateX = prevState.x - 5;
                    if(currentStateX < 0){
                        currentStateX = 0;
                    }
                    return{
                        x: currentStateX
                    }
                })
            }
            else if (this.state.direction === 'S'){
                this.setState((prevState) => {
                    var currentStateY = prevState.y + 5;
                    if(currentStateY > prevState.containerHeight - prevState.avatarHeight){
                        currentStateY = prevState.containerHeight - prevState.avatarHeight;
                    }
                    return{
                        y: currentStateY
                    }
                })
            }
            else if (this.state.direction === 'E'){
                this.setState((prevState) => {
                    var currentStateX = prevState.x + 5;
                    if(currentStateX > prevState.containerWidth - prevState.avatarWidth){
                        currentStateX = prevState.containerWidth - prevState.avatarWidth;
                    }
                    return{
                        x: currentStateX
                    }
                })
            }
            
            this.setState((prevState) => {
                var placeholder = {
                    ...prevState.users
                };
                placeholder[prevState.user_id] = [prevState.x, prevState.y, prevState.avatarColor];
                return {
                    users: placeholder
                }
            })

            this.setState((prevState) => {
                var placeholder = {
                    ...prevState.users
                };
                for (var key in placeholder){
                    var distance = Math.sqrt((prevState.x - placeholder[key][0])**2 + (prevState.y - placeholder[key][1])**2)
                    placeholder[key] = [placeholder[key][0], placeholder[key][1], placeholder[key][2], distance];
                }
                return {
                    users: placeholder
                }
            })

            for(var key in this.state.users){
                ctx.beginPath();
                ctx.fillStyle = this.state.users[key][2];
                ctx.fillRect(this.state.users[key][0], this.state.users[key][1], this.state.avatarWidth, this.state.avatarHeight);
                ctx.stroke();
            }
            console.log(this.state.users)

            var userData = {
                user_id: this.state.user_id,
                x: this.state.x,
                y: this.state.y,
                avatarColor: this.state.avatarColor
            };

            //var base64ImageData = canvas.toDataURL("image/png");
            this.props.socket.emit("moving", this.state.room_id, userData);
        }    
    }

    //handle keydown event
    keydownHandler(event){
        var key = String.fromCharCode(event.keyCode);
        if(key === 'W'){
            this.setState({
                moving: true,
                direction: 'N'
            })
            console.log("MOVING", this.state.direction)
        }
        else if (key === 'A'){
            this.setState({
                moving: true,
                direction: 'W'
            })
            console.log("MOVING", this.state.direction)
        }
        else if(key === 'S'){
            this.setState({
                moving: true,
                direction: 'S'
            })
            console.log("MOVING", this.state.direction)
        }
        else if(key === 'D'){
            this.setState({
                moving: true,
                direction: 'E'
            })
            console.log("MOVING", this.state.direction)
        }
        
        

    }
    
    //handle keyup event
    keyupHandler(event){
        var key = String.fromCharCode(event.keyCode);
        if(key === 'W' || key === 'A' || key === 'S' || key === 'D' ){
            this.setState({
                moving: false
            })
            console.log("STOP MOVING")
        }
    }
    render(){
        return (
            <div id="frame">
                <div id="container">
                    <canvas id="map" />
                </div>
            </div>
        )
    }

}