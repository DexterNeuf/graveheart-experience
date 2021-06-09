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
            intialRun: true,
            isPlaying: false,
            pausedCounter: 0 ,
            trackName: "",
            trackNumber: "",
            trackArtist: "",
            albumName: "",
            albumId: "",
            albumLength: 0,
            albumLink:"",
            album: {},
            albumWithLyrics: {},
            albumImg: "",
            currentSongIndex: 0,
            albumHasChanged: true,
            Lyricswrapper : "",
            progress_ms : 0,
            duration_ms : 0,
            progressBar : ""
        }
    }
    
    cancel(){
        fetch('https://api.spotify.com/v1/me/player/pause', {
            method:'PUT',
            headers: {'Authorization': 'Bearer ' + this.state.accessToken}
        }).then(
            this.setState({
                isPlaying: false,
                pausedCounter: 5
            })
        )
    }
    resume(){

        fetch('https://api.spotify.com/v1/me/player/play', {
            method:'PUT',
            headers: {'Authorization': 'Bearer ' + this.state.accessToken}
        }).then(
            this.setState({
                isPlaying: true
            })
        )
        
    }
    pause(){

        fetch('https://api.spotify.com/v1/me/player/pause', {
            method:'PUT',
            headers: {'Authorization': 'Bearer ' + this.state.accessToken}
        }).then(
            this.setState({
                isPlaying: false
            })
        )

    }
    nextTrack(){
        fetch('https://api.spotify.com/v1/me/player/next', {
            method:'POST',
            headers: {'Authorization': 'Bearer ' + this.state.accessToken}
        })
    }
    previousTrack(){
        fetch('https://api.spotify.com/v1/me/player/previous', {
            method:'POST',
            headers: {'Authorization': 'Bearer ' + this.state.accessToken}
        })
    }
    updatePlaybackBar(){
        this.setState({
        progressBar: styled.div`
        width: ${this.state.percentDone}%;
        background-color: #eee;
          border: 0.1em solid transparent;
          height: 0.45em;
        ` })
    }

    // sets the array with the grabbed lyrics to state
    setStateTracks(newArray){
        this.setState({
            albumWithLyrics : newArray,
            albumHasChanged : true,
            Lyricswrapper: styled.div`
            display: flex;
            justify-content: center;
            overflow-wrap: break-word;
            min-height: 100vh;
            z-index: 999;
            p{
                overflow-wrap: break-word;
                word-break: break-word;
                max-width: 720px
            }
            p * {
                max-width: 720px !important 
            }
            ::before {
                content: "";
                position: fixed;
                left: 0;
                right: 0;
                z-index: 1;
                display: block;
                background-image: url('${this.state.albumImg}');
                height: 100vh;
                 background-size: cover;
                background-position: center center;
                filter: blur(5.5em) opacity(0.6);
            }
            }
            
          `,
          progressBar: styled.div`
          width: ${this.state.percentDone}%;
          background-color: #eee;
          border: 0.1em solid transparent;
          height: 0.45em;
        `} , () =>{
                this.findSongIndex()
            });
        
    }
    //finds the index of the object with the same track number of whats store in state 
    findSongIndex(){
        if( this.state.albumWithLyrics.length > 1){
        let currentSongIndex = this.state.albumWithLyrics.findIndex((element) => element.trackNumber === this.state.trackNumber )
        this.setState({currentSongIndex: currentSongIndex},
        )
        }else{
            console.log("does not exist")
        }
        
    }
    sendTracks(){
        const data = {
            album : this.state.album,
            artist : this.state.trackArtist
        }


        let newArray = [];
        let config ={
          headers:{
              "Access-Control-Allow-Origin": "*"
              }
        }
        axios.post("http://localhost:8080/playback " ,data ,config )
              .then((response) => {
                  newArray = response.data;
                  this.setStateTracks(newArray) 
              })
    }

    getAlbumTrackList(){
        axios.get(`https://api.spotify.com/v1/albums/${this.state.albumId}/tracks`,{
            headers: {'Authorization': 'Bearer ' + this.state.accessToken}
        }).then(
           ((response)=>  {
            let newArray = []
            response.data.items.forEach(element => newArray.push(element.name))
            this.setState({album: newArray
                },() => {
                    this.sendTracks();
                    })
           })
           
        ).catch((error) => console.log(error));

    }

    getCurrentlyPlaying(){

    fetch('https://api.spotify.com/v1/me/player/currently-playing',{
            headers: {'Authorization': 'Bearer ' + this.state.accessToken}
        }).then(response => response.json())
        .then( data => {
            this.setState({ 
            isPlaying : data.is_playing,
            trackName:data.item.name,
            trackArtist: data.item.album.artists[0].name,
            trackNumber: data.item.track_number,
            albumName: data.item.album.name,
            albumLength: data.item.album.total_tracks,
            albumId: data.item.album.id,
            albumImg: data.item.album.images[0].url,
            albumLink: data.item.album.external_urls.spotify,
            progress : data.progress_ms,
            duration : data.item.duration_ms
         }, () =>{
                this.getAlbumTrackList();
            })
        }).catch((error) => console.log(error))

    }

    timer = () => {

        //keep lyrics paused if app is started with playback state of paused
        if (this.state.intialRun && this.state.albumWithLyrics){
                fetch('https://api.spotify.com/v1/me/player/currently-playing',{
                    headers: {'Authorization': 'Bearer ' + this.state.accessToken}
                }).then(response => response.json())
                .then( data =>{
                    if (data.is_playing === true){
                        this.setState({
                            intialRun: false
                        })
                    }
                })   
        }
        //check if song has change then updates the lyrics
        if (this.state.accessToken && this.state.albumWithLyrics){
        fetch('https://api.spotify.com/v1/me/player/currently-playing',{
            headers: {'Authorization': 'Bearer ' + this.state.accessToken}
        }).then(response => response.json())
        .then( data => {
            this.setState({
                progress : data.progress_ms,
                duration : data.item.duration_ms,
                percentDone: data.progress_ms * 100 / data.item.duration_ms
            },() =>{
                this.updatePlaybackBar()
            })
            if(data.item.track_number !== this.state.trackNumber){
                this.setState({
                    trackNumber: data.item.track_number
                },()=>{
                    this.findSongIndex()
                })
            } 
            if (this.state.intialRun === false && data.is_playing === false && this.state.pausedCounter < 5){
                this.setState({
                        pausedCounter: (this.state.pausedCounter + 1)
                    })
        
            }
            if ((data.progress_ms * 100 / data.item.duration_ms) >= 50 && data.is_playing ){
                window.scrollTo({
                    top: document.documentElement.clientHeight,
                    behavior: 'smooth'
                  });
            }
            // when the playback is paused resets paused counter so render can contine
            if (data.is_playing === true && this.state.pausedCounter >= 5){
                this.setState({
                    pausedCounter : 0
                })
            }
            if ( data.item.name !== this.state.trackName){
                this.setState({
                    trackName : data.item.name 
                })
            }
            // check if album is different then grab new album info 
        }).catch((error) => console.log(error))
        }

    }

    componentDidMount(){
        let parsed = queryString.parse(window.location.search);
        let accessToken = parsed.access_token;
        this.setState({accessToken: accessToken,},  () =>{
            this.getCurrentlyPlaying();
            setInterval(this.timer, 3500);
        } )

        fetch('https://api.spotify.com/v1/me',{
            headers: {'Authorization': 'Bearer ' + accessToken}
        }).then(response => response.json())
        .then(data => this.setState({
            name:data.display_name,
            id: data.id
        })); 

    }


     
    render(){
    
  
    if(this.state.albumWithLyrics.length === undefined || (this.state.isPlaying === false && this.state.intialRun === true) || this.state.pausedCounter === 5){
    return(
    <main className="main-playback">
        <h1> {this.state.name}</h1>
    </main>
    )
    }
    else if (this.state.albumWithLyrics[this.state.currentSongIndex] && this.state.albumHasChanged){
        return(
            <div>
                <this.state.Lyricswrapper>
                    <div className="lyrics">
                    <p><span className="lyrics__title">#{this.state.trackNumber} - {this.state.trackName}</span> <p></p>{this.state.albumWithLyrics[this.state.currentSongIndex].lyrics} 
                    </p>
                        </div>
                </this.state.Lyricswrapper>
                <div className="playback-bar">
                    <div className="progress">
                        <this.state.progressBar>
                        </this.state.progressBar>
                    </div>
                    <div className="playback-bar__wrapper">
                        <div className="playback-bar__first">
                        <span onClick={() =>{this.cancel()}}>
                            <ImCancelCircle/>
                        </span>
                        </div>
                        <div className="playback-bar__controls">
                        
                            <span onClick={() =>{this.previousTrack()}}>
                            <IoMdSkipBackward/>
                            </span> 
                            <IconContext.Provider value={{ size: "3em"}}>
                            {this.state.isPlaying ?
                            <span onClick={() =>{this.pause()}}>
                            <IoPauseCircleOutline/>
                            </span>
                            : <span onClick={() =>{this.resume()}}>
                            <IoPlayCircleOutline />
                            </span>
                            }</IconContext.Provider>
                            <span onClick={() =>{this.nextTrack()}}>
                            <IoMdSkipForward/>
                            </span>
                        </div>
                        <div className="playback-bar__last">
                        <IconContext.Provider value={{ size: "1.75em" , className: 'react-icons' }}>
                        </IconContext.Provider>
                    </div>
                </div>
         </div>
        </div>
        )
    }
     else{
     return(
         <div>
             <div className="loading">
             {this.state.albumHasChanged === false && <div className="lds-roller"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>}
                 {this.state.albumHasChanged === true && <div className="lds-roller"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
                 {this.setState({
                     albumHasChanged : false
                 }, () => {
                    setTimeout(() => { this.getCurrentlyPlaying(); }, 550);
                 })}
                 </div>}
                </div>
         </div>
     )
    }
        }           
    }

export default Playback