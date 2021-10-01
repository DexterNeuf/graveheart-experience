import React from "react";
import queryString from 'query-string'
import axios from "axios"
import { Lrc, Runner} from 'lrc-kit';
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
            currentBar: "",
            lrc: "",
            lyricsRunning: false,
        }
    }
    
    componentDidMount(){
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
            })); 
        this.myInterval = setInterval(() => {
            this.timer()
            },1500)
        
        
    }
    componentWillUnmount(){
        clearInterval(this.myInterval)
    }

    timer(){
        const lyricsTimerCaller = this.lyricsTimer.bind(this)
        function awaitParse (){
            return new Promise( resolve => {
                axios.get(backend + "lrc").then((res) => {
                    resolve(res)
                })
            })
        }
        async function ayncCall(){
            const test = await awaitParse();
            lyricsTimerCaller(test)
        }
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
                    ayncCall();
                    if (data.is_playing === true && data.item.album.artists[0].name === 'Graveheart'){
                    // if(!this.state.lyricsRunning){
                    //  this.lyricsTimer();
                    //  this.setState({
                    //      lyricsRunning: true
                    //  })   
                    // }else{
                    //     console.log("lyrics running")
                    // }
                    }
                    
                }
            })         
        }
        if (!this.state.intialRun){
            this.getCurrentlyPlaying()
        }   
        
    }
    lyricsTimer(resData){
        // const newData = resData.data.replace(/(\r\n|\n|\r)/gm," ");
        // console.log(newData)
        let runner = new Runner(Lrc.parse(resData.data))
        runner.timeUpdate(22)
        console.log(runner.getLyric(runner.curIndex()))
        
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
            <div className="container"> 
                {this.state.isPlaying ? 
                <h1>isPlaying</h1>:
                <h1>isNotPlaying</h1>
                }
                <h1>{this.state.trackName}</h1>
                <h1>{this.state.trackArtist}</h1>
                <h1>{this.state.albumName}</h1>
            </div>
        )
    }
}
export default Playback