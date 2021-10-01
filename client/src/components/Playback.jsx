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
            currentIndex: 0,
            time: 0
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
        async function asyncCall(){
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
                    
                    // if (data.is_playing === true && data.item.album.artists[0].name === 'Graveheart'){
                    if(!this.state.lyricsRunning){
                     asyncCall();
                     this.setState({
                         lyricsRunning: true
                     })   
                    }else{
                        console.log("lyrics running")
                    }
                    // }
                    
                }
            })         
        }
        if (!this.state.intialRun){
            this.getCurrentlyPlaying()
        }   
        
    }
    lyricsTimer(resData){
        const repeatArgumentCaller = repeatArgument.bind(this)
        function repeatArgument() {
                let adjTime = this.state.time + 0.1
                this.state.lrc.timeUpdate(adjTime)
                let runnerIndex = this.state.lrc.curIndex()
                this.setState({
                    time: adjTime,
                    currentIndex: runnerIndex
                },() =>{
                    console.timeEnd()
                })
        }
        function callbackArgument() {
            console.log("count done")
        }
        function lrcRunner(timer, max){
            var counter = 1;
        
            var init = (t) => {
            let timeStart = new Date().getTime();
            setTimeout(function () {
                if (counter < max + 1) {
                let fix = (new Date().getTime() - timeStart) - timer;
                init(t - fix);
                counter++;
                
                // event to be repeated max times
                repeatArgumentCaller();
                
                } else {
                // event to be executed at animation end
                callbackArgument();
                }
            }, t);
            }
        init(timer);
        }

        let runner = new Runner(Lrc.parse(resData.data))
        this.setState({
            lrc: runner
        },() => {
            lrcRunner(100,999)
        })
        
        
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
             },() => {
                console.time()
             })
        })  
    }
    render(){
        // ADD CHECK IF ARTIST IS NOT GRAVEHEART
        if(typeof this.state.lrc === 'object'){
            return(
                <div className="container"> 
                    {this.state.isPlaying ? 
                    <h1>isPlaying</h1>:
                    <h1>isNotPlaying</h1>
                    }
                    <h1>{this.state.trackName}</h1>
                    <h1>{this.state.trackArtist}</h1>
                    <h1>{this.state.albumName}</h1>
                    <h1>{this.state.lrc.lrc.lyrics[this.state.currentIndex].content}</h1>
                </div>
            )
        }else{
            return(
                <div className="container"> 
                    {this.state.isPlaying ? 
                    <h1>isPlaying</h1>:
                    <h1>isNotPlaying</h1>
                    }
                    <h1>{this.state.trackName}</h1>
                    <h1>{this.state.trackArtist}</h1>
                    <h1>{this.state.albumName}</h1>
                    {/* <h1>{this.state.lrc.lrc.lyrics[this.state.lrc.curIndex()].content}</h1> */}
                </div>
            )
        }
        
    }
}
export default Playback