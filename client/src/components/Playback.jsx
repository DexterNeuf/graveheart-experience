import React from "react";
import  queryString from 'query-string'
import axios from "axios"
import {IconContext} from "react-icons";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { IoMdSkipBackward, IoMdSkipForward } from "react-icons/io";
import { IoPauseCircleOutline, IoPlayCircleOutline} from "react-icons/io5";
import { ImCancelCircle} from "react-icons/im";
import styled from "styled-components";

const backend = "http://localhost:8888/user/"



class Playback extends React.Component{
    constructor(){
        super();
    
        this.state = {
            id: "",
            name: "",
            accessToken: "",
            isPlaying: false,
            trackName: "",
            trackNumber: "",
            albumName: "",
            count: 0,
            intialRun: true,
            progress: "",
            duration: "",
            currentBar: ""
        }
    }
    
    componentDidMount(){
        let config ={
            headers:{
                "Access-Control-Allow-Origin": "*"
                }
        }

        axios.get(backend + "array", config).then((res) => {
            console.log( res.data )
        })

        let parsed = queryString.parse(window.location.search);
        let accessToken = parsed.access_token;
        this.setState({accessToken: accessToken,});
        fetch('https://api.spotify.com/v1/me',{
                headers: {'Authorization': 'Bearer ' + accessToken}
            }).then(response => response.json())
            .then(data => this.setState({
                name:data.display_name,
                id: data.id,
                
            },() => {
                this.getCurrentlyPlaying()
                // this.lyricsTimer()
            })); 
        this.myInterval = setInterval(() => {
            this.timer()
            },10000)
        
        
    }
    componentWillUnmount(){
        clearInterval(this.myInterval)
    }

    timer(){
        // Waits till spotify is playing to run app
        if (this.state.intialRun){
            fetch('https://api.spotify.com/v1/me/player/currently-playing',{
                headers: {'Authorization': 'Bearer ' + this.state.accessToken}
            }).then(response => response.json())
            .then( data =>{
                if (data.is_playing === true){
                    this.setState({
                        intialRun: false,
                    })
                    this.lyricsTimer();
                }
            })         
        }
        if (!this.state.intialRun){
            this.getCurrentlyPlaying()
        }   
    }
    lyricsTimer(){
        let config ={
            headers:{
                "Access-Control-Allow-Origin": "*"
                }
        }

        axios.get(backend + "array", config).then((res) => {
            main.call(this , res.data )
        })

        function sleep(ms){
            return new Promise ((accept) => {
                setTimeout(() => {
                    accept();
                }, ms);
            });
        }
        async function main(arr){
            for (let i = 0; i < arr.length; i++){
                this.setState({
                    currentBar: arr[i].bar
                })
            
                await sleep(arr[i].timelength * 1000)
            }
        }
        
    }
    getCurrentlyPlaying(){
        fetch('https://api.spotify.com/v1/me/player/currently-playing',{
            headers: {'Authorization': 'Bearer ' + this.state.accessToken}
        }).then(response => response.json())
        .then( data =>{
            this.setState({ 
                isPlaying : data.is_playing,
                trackName: data.item.name,
                trackNumber: data.item.track_number,
                trackArtist: data.item.album.artists[0].name,
                albumName: data.item.album.name,
                progress : data.progress_ms,
                duration : data.item.duration_ms
             })
        })  
    }
    render(){
        // ADD CHECK IF ARTIST IS NOT GRAVEHEART
        return(
            <div> 
                {this.state.isPlaying ? 
                <h1>isPlaying</h1>:
                <h1>isNotPlaying</h1>
                }
                <h1>{this.state.trackName}</h1>
                <h1>{this.state.trackArtist}</h1>
                <h1>{this.state.albumName}</h1>
                <h1>{this.state.currentBar}</h1>
            </div>
        )
    }
}
export default Playback