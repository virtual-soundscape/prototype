import React from 'react';
import './Map.css'
import io from 'socket.io-client';

export default class Map extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            user_id:"",
            moving: false,
            direction: 'N',
            x: 250,
            y: 250,
            containerWidth: 500,
            containerHeight:500,
            users:{}
            

        }
        this.socket = io.connect("http://localhost:8080")

        this.socket.on("local", (user_id) =>{
            this.setState({
                user_id: user_id
            })
        })
        this.socket.on("moving", (userData) => {
            
            // var image = new Image();
            // image.src = data;
            // var canvas = document.getElementById('map');
            // var ctx = canvas.getContext('2d');
            // ctx.clearRect(0, 0, this.state.containerWidth, this.state.containerHeight);
            // image.onload = function () {
            //     ctx.drawImage(image, 0, 0);
            // };
                console.log("LOL", this.state.user_id)
                if(!(this.state.user_id == userData.user_id)){
                console.log("HELLO", this.state.users)
                this.setState((prevState) => {
                    var placeholder = {
                        ...prevState.users
                    };
                    placeholder[userData.user_id] = [userData.x, userData.y];
                    return {
                        users: { 
                            ...placeholder
                        } 
                    }
                })
                
                var canvas = document.getElementById('map');
                var ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, this.state.containerWidth, this.state.containerHeight)
                console.log(this.state.users)
                for(var key in this.state.users){
                    console.log("key")
                    ctx.beginPath();
                    ctx.rect(this.state.users[key][0], this.state.users[key][1], 10, 10);
                    ctx.stroke();
                }
            }

        })
    }
        
    

    //virtual map and user setup
    componentDidMount(){
        var canvas = document.getElementById("map");
        var ctx = canvas.getContext("2d");
        canvas.width = this.state.containerWidth;
        canvas.height = this.state.containerHeight;
        ctx.beginPath();
        ctx.rect(this.state.x, this.state.y, 10, 10);
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
                
                    return{
                        y: currentStateY
                    }
                })
            } 
            else if (this.state.direction === 'W'){
                this.setState((prevState) => {
                    var currentStateX = prevState.x - 5;
                
                    return{
                        x: currentStateX
                    }
                })
            }
            else if (this.state.direction === 'S'){
                this.setState((prevState) => {
                    var currentStateY = prevState.y + 5;
                
                    return{
                        y: currentStateY
                    }
                })
            }
            else if (this.state.direction === 'E'){
                this.setState((prevState) => {
                    var currentStateX = prevState.x + 5;
                
                    return{
                        x: currentStateX
                    }
                })
            }
            // ctx.beginPath();
            // ctx.rect(this.state.x, this.state.y, 10, 10);
            // ctx.stroke();
            this.setState((prevState) => {
                var placeholder = {
                    ...prevState.users
                };
                placeholder[prevState.user_id] = [prevState.x, prevState.y];
                return {
                    users: { 
                        ...placeholder
                    } 
                }
            })

            for(var key in this.state.users){
                console.log(key)
                ctx.beginPath();
                ctx.rect(this.state.users[key][0], this.state.users[key][1], 10, 10);
                ctx.stroke();
            }


            var userData = {
                user_id: 2,
                x: this.state.x,
                y: this.state.y
            };

            //var base64ImageData = canvas.toDataURL("image/png");
            this.socket.emit("moving", userData);
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