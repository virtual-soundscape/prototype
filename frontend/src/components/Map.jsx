import React from 'react';
import './Map.css'
import io from 'socket.io-client';

export default class Map extends React.Component {
    constructor(props){

        super(props);

        const initialCoordinates = {
            x: 250,
            y: 250,
        };
        const avatarColor = `#${Math.floor(Math.random()*16777215).toString(16)}`;
        const displayName = this.props.displayName;

        this.state = {
            user_id: this.props.userId,
            displayName,
            room_id: this.props.roomId,
            moving: false,
            direction: 'N',
            ...initialCoordinates,
            containerWidth: 1500,
            containerHeight:900,
            avatarColor,
            avatarWidth: 10,
            avatarHeight: 10,
            font: "12px Arial",
            users:{
                [this.props.userId]: [
                    initialCoordinates.x,
                    initialCoordinates.y,
                    avatarColor,
                    displayName
                ]
            },

            // Handler returned by `requestAnimationFrame`
            rafHandler: undefined,
        }
    }

    getSnapshotBeforeUpdate() {
        this.props.collectUsers(this.state.users)
    }

    //virtual map and user setup
    componentDidMount(){
        //when user goes online emit online and moving 
        this.props.socket.emit("online", this.state.room_id)
        this.props.socket.emit("moving", this.state.room_id, {
            user_id: this.state.user_id,
            x: this.state.x,
            y: this.state.y,
            avatarColor: this.state.avatarColor,
            displayName: this.state.displayName
        })
        
        this.props.socket.on("online", (socket_id) => {
            var userData = {
                user_id: this.state.user_id,
                x: this.state.x,
                y: this.state.y,
                avatarColor: this.state.avatarColor,
                displayName: this.state.displayName
            }
            this.props.socket.emit("user", socket_id, userData)
        })
        this.props.socket.on("moving", (userData) => {
            console.log(`moving: ${userData}`);
                
                this.setState((prevState) => {
                    var placeholder = {
                        ...prevState.users
                    };
                    var distance = Math.sqrt((prevState.x - userData.x)**2 + (prevState.y - userData.y)**2);
                    placeholder[userData.user_id] = [userData.x, userData.y, userData.avatarColor, userData.displayName, distance];
                    return {
                        users: placeholder
                    }
                })

                //Pass the users  object up to Room component
                this.props.collectUsers(this.state.users);

                //Repaint avatars on map
                var canvas = document.getElementById('map');
                var ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, this.state.containerWidth, this.state.containerHeight)
                
                for(var key in this.state.users){
                    ctx.beginPath();
                    ctx.fillStyle = this.state.users[key][2]
                    ctx.fillRect(this.state.users[key][0], this.state.users[key][1], this.state.avatarWidth, this.state.avatarHeight);
                    ctx.stroke();

                    ctx.font = this.state.font;
                    ctx.textAlign = "center";
                    ctx.fillText(this.state.users[key][3], this.state.users[key][0] + this.state.avatarWidth/2, this.state.users[key][1] - 5)
                }   
                console.log(this.state.users)

        })
        this.props.socket.on("userExit", (discUserId) => {
            console.log("user is disconnecting", discUserId)
            const updatedUsers = Object.fromEntries(
                Object.entries(this.state.users).filter(
                    ([userId, ]) =>  userId !== discUserId
                )
            );

            // Repaint avatars on map with `updatedUsers`, which exclude the
            // user who just disconnected.
            // TODO: code smell, DRY - this logic can be in its own function,
            // e.g. `updateMap()`.

            var canvas = document.getElementById('map');
            var ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, this.state.containerWidth, this.state.containerHeight)

            for (const [x, y, color, displayName] of Object.values(updatedUsers)) {
                ctx.beginPath();
                ctx.fillStyle = color
                ctx.fillRect(x, y, this.state.avatarWidth, this.state.avatarHeight);
                ctx.stroke();

                ctx.font = this.state.font;
                ctx.textAlign = "center";
                ctx.fillText(displayName, x + this.state.avatarWidth/2, y - 5)
            }
            
            this.setState({ users: updatedUsers });
            //Pass the users object up to Room component
            this.props.collectUsers(this.state.users);
        })
        var canvas = document.getElementById("map");
        var ctx = canvas.getContext("2d");
        canvas.width = this.state.containerWidth;
        canvas.height = this.state.containerHeight;
        ctx.beginPath();
        ctx.fillStyle = this.state.avatarColor;
        ctx.fillRect(this.state.x, this.state.y, this.state.avatarWidth, this.state.avatarHeight);
        ctx.stroke();

        ctx.font = this.state.font;
        ctx.textAlign = "center";
        ctx.fillText(this.state.displayName, this.state.x + this.state.avatarWidth/2, this.state.y - 5)
        this.init()
    }

    //initialize moving function
    init(){
        
        document.addEventListener('keydown', this.keydownHandler.bind(this))
        document.addEventListener('keyup', this.keyupHandler.bind(this))
        
        // setInterval(this.moving.bind(this), 33)
        this.setState({
            rafHandler: requestAnimationFrame(this.moving.bind(this))
        });

    }

    componentWillUnmount() {
        if (this.state.rafHandler !== undefined) {
            cancelAnimationFrame(this.state.rafHandler);
        }
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
                placeholder[prevState.user_id] = [prevState.x, prevState.y, prevState.avatarColor, prevState.displayName];
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
                    placeholder[key] = [placeholder[key][0], placeholder[key][1], placeholder[key][2], placeholder[key][3], distance];
                }
                return {
                    users: placeholder
                }
            })

            //Pass the users  object up to Room component
            this.props.collectUsers(this.state.users);

            for(var key in this.state.users){
                ctx.beginPath();
                ctx.fillStyle = this.state.users[key][2];
                ctx.fillRect(this.state.users[key][0], this.state.users[key][1], this.state.avatarWidth, this.state.avatarHeight);
                ctx.stroke();
                
                ctx.font = this.state.font;
                ctx.textAlign = "center";
                ctx.fillText(this.state.users[key][3], this.state.users[key][0] + this.state.avatarWidth/2, this.state.users[key][1] - 5)
            }
            console.log(this.state.users)

            var userData = {
                user_id: this.state.user_id,
                x: this.state.x,
                y: this.state.y,
                avatarColor: this.state.avatarColor,
                displayName: this.state.displayName
            };

            this.props.socket.emit("moving", this.state.room_id, userData);
        }

        this.setState({
            rafHandler: requestAnimationFrame(this.moving.bind(this))
        });
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