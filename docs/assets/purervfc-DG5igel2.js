var w=Object.defineProperty;var E=(a,e,t)=>e in a?w(a,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):a[e]=t;var s=(a,e,t)=>E(a,typeof e!="symbol"?e+"":e,t);import"./modulepreload-polyfill-B5Qt9EMX.js";import{V}from"./video-tree-C_pDbh0c.js";class c{constructor(e,t,i=[]){s(this,"id");s(this,"src");s(this,"nodes");s(this,"video");this.id=e,this.src=t,this.nodes=i}static fromJSON(e,t=0){var i;return new c(t,e.src,(i=e.nodes)==null?void 0:i.map((d,n)=>c.fromJSON(d,n)))}async load(){this.video=document.createElement("video"),this.video.playsInline=!0,this.video.preload="auto",this.video.controls=!1,this.video.muted=!0,this.video.autoplay=!0,this.video.src=this.src;const e=new Promise(d=>{const n=()=>{this.video.removeEventListener("canplay",n);const o=()=>{this.video.removeEventListener("canplaythrough",o),d(this.video)};this.video.addEventListener("canplaythrough",o)};this.video.addEventListener("canplay",n)}),[t,i=[]]=await Promise.all([e,...this.nodes.map(d=>d.load())]);return[t,...i]}getNextVideoTree(){const e=this.nodes.length;if(e)return this.nodes[Math.floor(Math.random()*e)]}play(){this.video.play()}}class f{constructor(e,t,i,d=!1){s(this,"tree");s(this,"canvas");s(this,"hiddenPlayersElem");s(this,"currentVideoTree");this.tree=e,this.canvas=t,this.hiddenPlayersElem=i,d&&this.hiddenPlayersElem.classList.add("debug")}async play(){const e=await this.tree.load(),t=document.getElementById("hidden-players");e.forEach(i=>{t==null||t.appendChild(i)}),this.playNextVideo()}playNextVideo(){var n;const e=((n=this.currentVideoTree)==null?void 0:n.getNextVideoTree())??this.tree;e.play();const t=this.canvas.getContext("2d"),i=()=>{t&&(t.canvas.width=Math.min(screen.width,window.innerWidth),t.canvas.height=Math.min(screen.height,window.innerHeight));const o=e.video,{width:u,height:g}=this.canvas.getBoundingClientRect();let h=100,l=100;if(o.videoWidth&&o.videoHeight){const v=Math.min(u/o.videoWidth,g/o.videoHeight);h=o.videoWidth*v,l=o.videoHeight*v}t==null||t.drawImage(e.video,0,0,h,l),e.video.requestVideoFrameCallback(i)};e.video.requestVideoFrameCallback(i);const d=()=>{e.video.removeEventListener("ended",d),this.playNextVideo()};e.video.addEventListener("ended",d),this.currentVideoTree=e}}let p=V;const y=new URLSearchParams(window.location.search),m=y.get("tree");m&&(p=JSON.parse(m));const L=y.has("debug"),P=c.fromJSON(p),T=new f(P,document.getElementById("canvas"),document.getElementById("hidden-players"),L),r=document.getElementById("play");r==null||r.addEventListener("click",async()=>{r.innerHTML="Loading...",r.disabled=!0,await T.play(),r.style.display="none"});
