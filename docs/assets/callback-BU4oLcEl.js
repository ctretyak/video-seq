import"./modulepreload-polyfill-B5Qt9EMX.js";const[e,t,n,c,d]=[document.getElementById("player"),document.getElementById("canvas"),document.getElementById("play"),document.getElementById("pause"),document.getElementById("seek-0")];n.onclick=()=>{e.play()};c.onclick=()=>{e.pause()};d.onclick=()=>{e.currentTime=0};const o=t.getContext("2d"),a=l=>{o.drawImage(e,0,0,t.width,t.height),e.requestVideoFrameCallback(a)};e.requestVideoFrameCallback(a);
