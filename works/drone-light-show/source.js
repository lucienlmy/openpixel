// SPDX-License-Identifier: MIT
// Copyright (c) 2026 喵老弟 / MarkMFFF

"use strict";
// ================= helpers =================
const fl=Math.floor, rd=Math.round, PI=Math.PI, D2R=PI/180;
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
function R(g,x,y,w,h,c){g.fillStyle=c;g.fillRect(fl(x),fl(y),fl(w),fl(h))}
function P(g,x,y,c){g.fillStyle=c;g.fillRect(fl(x),fl(y),1,1)}
function L(g,x0,y0,x1,y1,c,th){th=th||1;x0=rd(x0);y0=rd(y0);x1=rd(x1);y1=rd(y1);g.fillStyle=c;
  const dx=Math.abs(x1-x0),sx=x0<x1?1:-1,dy=-Math.abs(y1-y0),sy=y0<y1?1:-1;let e=dx+dy;const o=(th-1)>>1;
  for(let i=0;i<2000;i++){g.fillRect(x0-o,y0-o,th,th);if(x0===x1&&y0===y1)break;const e2=2*e;if(e2>=dy){e+=dy;x0+=sx}if(e2<=dx){e+=dx;y0+=sy}}}
function disc(g,cx,cy,r,c){cx=rd(cx);cy=rd(cy);r=rd(r);g.fillStyle=c;if(r<=0){g.fillRect(cx,cy,1,1);return}
  for(let y=-r;y<=r;y++){const w=fl(Math.sqrt(r*r-y*y)+0.35);g.fillRect(cx-w,cy+y,w*2+1,1)}}
function ell(g,cx,cy,rx,ry,c){cx=rd(cx);cy=rd(cy);g.fillStyle=c;if(ry<1){g.fillRect(cx-rx,cy,rx*2+1,1);return}
  for(let y=-ry;y<=ry;y++){const w=fl(rx*Math.sqrt(Math.max(0,1-(y*y)/(ry*ry)))+0.3);g.fillRect(cx-w,cy+y,w*2+1,1)}}

function poly(g,pts,c){let y0=1e9,y1=-1e9;for(const p of pts){if(p[1]<y0)y0=p[1];if(p[1]>y1)y1=p[1]}g.fillStyle=c;
  for(let y=fl(y0);y<=Math.ceil(y1);y++){const yc=y+0.5,xs=[];
    for(let i=0,j=pts.length-1;i<pts.length;j=i++){const a=pts[i],b=pts[j];if((a[1]>yc)!==(b[1]>yc))xs.push(a[0]+(yc-a[1])/(b[1]-a[1])*(b[0]-a[0]))}
    xs.sort((a,b)=>a-b);for(let k=0;k+1<xs.length;k+=2){const xa=rd(xs[k]),xb=rd(xs[k+1]);if(xb>xa)g.fillRect(xa,y,xb-xa,1)}}}
function hash(a,b,c){let h=Math.imul(a|0,374761393)^Math.imul((b|0)+0x9e37,668265263)^Math.imul((c|0)+0x7f4a,1274126177);
  h=Math.imul(h^(h>>>13),1103515245);h^=h>>>16;h=Math.imul(h,0x45d9f3b);h^=h>>>15;return (h>>>0)/4294967296}
function rng(s){return function(){s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const hx=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
const toH=a=>'#'+a.map(v=>clamp(rd(v),0,255).toString(16).padStart(2,'0')).join('');
function mix(a,b,t){const A=hx(a),B=hx(b);return toH(A.map((v,i)=>v+(B[i]-v)*t))}
const U=h=>{const a=hx(h);return((255<<24)|(a[2]<<16)|(a[1]<<8)|a[0])>>>0};


const SAMPLES=[];

// ================= cinema helpers =================
// bitmap CJK text: rasterize once with the system font, keep only pixels over an alpha threshold (no anti-aliasing reaches the stage)
const ZC={};
function zglyphs(str,size,bold){const key=str+'|'+size+'|'+(bold?1:0);if(ZC[key])return ZC[key];
  // supersample 4x, then keep a pixel when enough of its cell is covered: cleaner strokes than thresholding a small render
  const K=4,c=document.createElement('canvas'),tg=c.getContext('2d'),f=`${bold?'bold ':''}${size*K}px "PingFang SC","Hiragino Sans GB","Noto Sans SC","Microsoft YaHei","WenQuanYi Zen Hei",sans-serif`;
  tg.font=f;const w=Math.ceil(tg.measureText(str).width/K)+2,h=size+4;c.width=w*K;c.height=h*K;tg.font=f;tg.textBaseline='top';tg.fillStyle='#fff';tg.fillText(str,K,K);
  const d=tg.getImageData(0,0,w*K,h*K).data,px=[];for(let y=0;y<h;y++)for(let x=0;x<w;x++){let s=0;for(let j=0;j<K;j++)for(let i=0;i<K;i++)s+=d[((y*K+j)*w*K+x*K+i)*4+3];if(s/(K*K*255)>(bold?0.42:0.3))px.push(x,y)}
  return ZC[key]={w,h,px}}

// recolor every pixel inside a mask through a cached palette map (used for light beams: a lit pixel becomes a lighter solid colour, never a blend)
function litMap(cache,u,tint,amt){let v=cache.get(u);if(v===undefined){const r=u&255,gg=(u>>8)&255,b=(u>>16)&255,T=hx(tint);
  const q=x=>Math.round(x/8)*8;v=((255<<24)|(clamp(q(b+(T[2]-b)*amt),0,255)<<16)|(clamp(q(gg+(T[1]-gg)*amt),0,255)<<8)|clamp(q(r+(T[0]-r)*amt),0,255))>>>0;cache.set(u,v)}return v}
const ease=t=>t<0?0:t>1?1:t*t*(3-2*t);

// ================= masterwork helpers =================
function mkc(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.imageSmoothingEnabled=false;return[c,x]}


// ================= new frontiers: shared sound (copied from world-styles/modern-genres g0_sound.js) =================
// everything is synthesised in the browser: noise beds through filters, oscillators, a generated reverb; nothing is loaded
let SND=null,SND_WANT=false,SND_LAST=0;
function sndOn(ctx0){if(SND)return SND;let ctx=ctx0;if(!ctx){try{ctx=new (window.AudioContext||window.webkitAudioContext)()}catch(e){return null}}
  const sr=ctx.sampleRate,master=ctx.createGain();master.gain.value=ctx0?0.8:0;master.connect(ctx.destination);
  const lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=18000;lp.Q.value=0.5;lp.connect(master);
  const bus=ctx.createGain();bus.gain.value=1;bus.connect(lp);
  const ir=ctx.createBuffer(2,sr*3,sr);for(let c=0;c<2;c++){const d=ir.getChannelData(c);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,2.6)*(i<sr*0.01?i/(sr*0.01):1)}
  const rev=ctx.createConvolver();rev.buffer=ir;const revG=ctx.createGain();revG.gain.value=0.6;rev.connect(revG);revG.connect(bus);
  const nb=(len,brown)=>{const b=ctx.createBuffer(1,sr*len,sr),d=b.getChannelData(0);let l=0;for(let i=0;i<d.length;i++){const w=Math.random()*2-1;if(brown){l=(l+0.02*w)/1.02;d[i]=l*3.5}else d[i]=w}return b};
  SND={ctx,master,bus,lp,rev,white:nb(2,false),brown:nb(4,true),beds:{},vol:0,clock:null,ks:new Map(),
    at(){return this.clock!=null?this.clock:this.ctx.currentTime+0.03}};
  if(!ctx0){ctx.resume&&ctx.resume();
    // the sound follows the picture: when the animation stops ticking (paused, tab hidden) it fades out
    SND.iv=setInterval(()=>{if(!SND)return;const live=performance.now()-SND_LAST<220,target=live?0.8:0;if(target!==SND.vol){SND.vol=target;const now=SND.ctx.currentTime;SND.master.gain.cancelScheduledValues(now);SND.master.gain.setTargetAtTime(target,now,live?0.12:0.04)}},60)}
  return SND}
function sndOff(){if(!SND)return;clearInterval(SND.iv);try{SND.ctx.close()}catch(e){}SND=null}
const SND_CTL={type:'toggle',key:'sound',label:'声音',get def(){return SND_WANT}};
function sndInit(S){S.pu=null;if(S.opt.sound)sndOn()}
function sndOpt(S,k){if(k!=='sound')return;SND_WANT=!!S.opt.sound;if(SND_WANT)sndOn();else sndOff()}
// called from a piece's tick: works out the previous frame so events fire once when the loop crosses them
function sndTick(S,LOOPT,fn){if(!SND||!S.opt.sound)return;SND_LAST=performance.now();const u=S.t%LOOPT;let pu=S.pu==null?u-1:S.pu;
  if(u<pu)pu=(pu>=LOOPT-3&&u<3)?-1:u-1;else if(u-pu>30)pu=u-1;S.pu=u;fn(SND,S,u,pu,S.t)}
const crossed=(pu,u,x)=>pu<x&&u>=x;
// ---- building blocks ----
function bed(A,name,src,ft,f,q,freq){let b=A.beds[name];if(b)return b;const c=A.ctx;let s;
  if(src==='white'||src==='brown'){s=c.createBufferSource();s.buffer=A[src];s.loop=true;s.loopStart=Math.random()}else{s=c.createOscillator();s.type=src;s.frequency.value=freq||110}
  const fi=c.createBiquadFilter();fi.type=ft;fi.frequency.value=f;fi.Q.value=q||0.7;const g=c.createGain();g.gain.value=0;s.connect(fi);fi.connect(g);g.connect(A.bus);s.start();
  return A.beds[name]={s,f:fi,g}}
function bset(A,name,vol,f,tc,freq){const b=A.beds[name];if(!b)return;const t=A.at();b.g.gain.setTargetAtTime(Math.max(0,vol),t,tc||0.25);if(f)b.f.frequency.setTargetAtTime(f,t,tc||0.25);if(freq&&b.s.frequency)b.s.frequency.setTargetAtTime(freq,t,tc||0.25)}
function env(A,node,t0,a,peak,dur,out,wet){const g=A.ctx.createGain();g.gain.setValueAtTime(0.0001,t0);g.gain.linearRampToValueAtTime(peak,t0+a);g.gain.exponentialRampToValueAtTime(0.0001,t0+a+dur);node.connect(g);g.connect(out||A.bus);
  if(wet){const w=A.ctx.createGain();w.gain.value=wet;g.connect(w);w.connect(A.rev)}return g}
function tone(A,type,f,t0,dur,vol,o){o=o||{};const c=A.ctx,s=c.createOscillator();s.type=type;s.frequency.setValueAtTime(f,t0);if(o.to)s.frequency.exponentialRampToValueAtTime(o.to,t0+(o.glide||dur));if(o.det)s.detune.value=o.det;
  let n=s;if(o.ft){const fi=c.createBiquadFilter();fi.type=o.ft;fi.frequency.value=o.ff;fi.Q.value=o.q||0.7;s.connect(fi);n=fi}env(A,n,t0,o.a||0.005,vol,dur,null,o.wet);s.start(t0);s.stop(t0+(o.a||0.005)+dur+0.05)}
function noise(A,t0,dur,vol,ft,f,o){o=o||{};const c=A.ctx,s=c.createBufferSource();s.buffer=o.brown?A.brown:A.white;s.loop=true;const fi=c.createBiquadFilter();fi.type=ft;fi.frequency.setValueAtTime(f,t0);if(o.to)fi.frequency.exponentialRampToValueAtTime(o.to,t0+(o.glide||dur));fi.Q.value=o.q||0.7;s.connect(fi);
  env(A,fi,t0,o.a||0.003,vol,dur,null,o.wet);s.start(t0,Math.random()*1.5);s.stop(t0+(o.a||0.003)+dur+0.05)}

// a slow analogue-style pad: detuned saws through a lowpass
function pad(A,t0,freqs,dur,vol,o){o=o||{};const c=A.ctx;for(const f of freqs)for(const det of [-7,6]){const s=c.createOscillator();s.type=o.type||'sawtooth';s.frequency.value=f;s.detune.value=det;
    const fi=c.createBiquadFilter();fi.type='lowpass';fi.frequency.setValueAtTime(o.ff||800,t0);fi.Q.value=0.6;const g=c.createGain();const at=o.a||2;
    g.gain.setValueAtTime(0.0001,t0);g.gain.linearRampToValueAtTime(vol,t0+at);g.gain.setValueAtTime(vol,t0+dur-(o.r||2));g.gain.linearRampToValueAtTime(0.0001,t0+dur);
    s.connect(fi);fi.connect(g);g.connect(A.bus);const w=c.createGain();w.gain.value=o.wet==null?0.7:o.wet;g.connect(w);w.connect(A.rev);s.start(t0);s.stop(t0+dur+0.1)}}
const mtof=m=>440*Math.pow(2,(m-69)/12);

// ================= E1. 水写的字 =================
// a digital water curtain: 128 valves on a steel rail release single drops. Every pixel is a drop of water that is
// falling right now; a picture is printed row by row (bottom row first) and stretches as it accelerates towards the
// grate. The whole show is a valve schedule (frame x nozzle -> colour), so any frame can be drawn from time alone.


// ================= E2. 八音盒纸带 =================
// a crank music box reads a punched paper strip. Each hole is one pixel of a picture AND one note: the row is the pitch,
// the column is the time. Melody, a moon, a sleeping cat, 生日快乐 and a cake are all punched into one looped strip.
// The 24 lanes are tuned to a pentatonic scale, so any picture punched into the strip sounds kind.


// ================= E3. 用字画画 =================
// an old Chinese typewriter types a picture of 《枫桥夜泊》 where every pixel is a character, and every character is the word
// for what it depicts: the moon is made of 月, the river of 江, the maples of 枫, the bell's sound drifting to the boat of 声.
// The typing starts slow (you see the lever pick each slug from the tray) and turns into a time-lapse as the camera pulls back.


// ================= E4. 杂物的影子 =================
// a heap of junk on a turntable under a gallery spotlight. The heap is a voxel set built so that its shadow along one axis
// is two people sitting back to back, and along the other axis the same two people turned to face each other, hands joined.
// Every voxel is kept only where both pictures agree, then most of them are carved away while each shadow ray stays blocked,
// so from the front it is a chaotic pile of cans, bottles, toys and wood; only the shadow knows what it is.


// ================= E5. 稻田画 =================
// rice-paddy art: every pixel of the picture is a rice plant, and the varieties (green, purple, yellow, red, pale) are planted
// so that the picture is only right from the viewing tower. The field is rendered by casting a ray per screen pixel onto the
// ground, so the same planting is seen from the tower, from the dike (squashed and wrong), and from straight above (stretched).
// One season: flooding, planting by hand, growing, wind, ripening, harvest, flooding again.


// ================= E6. 千机夜空 =================
// a Mid-Autumn drone show over a lake: 1200 drones, each one a single pixel of light in 3D space. They lift off a barge,
// become a rippling sheet, a turning globe, a humpback whale that swims across the sky and dives into the lake, a splash,
// the moon with its rabbit, 中秋快乐, fireworks, and land again. Each drone keeps its identity: shapes are matched by rank so
// the flights between shapes sweep instead of crossing at random. The lake mirrors whatever is low enough to reflect.
(function(){
const W=480,H=270,LOOP=1728,N=1200;
const FOC=(W/2)/Math.tan(25*D2R),CAMY=2,PITCH=3*D2R,HOR=Math.round(H/2+FOC*Math.tan(PITCH));
const CZ=540,CY=82;// where the shapes hang
// ---------- palette ----------
const PAL=['#7ab4ff','#ffffff','#3a7aff','#4ae07a','#e8f4ff','#5a8ad8','#ffd86a','#c8a040','#ffb0c8','#ff5a4a','#ffc84a','#9a7aff','#5af0ff','#ff8a3a','#a0ff6a','#2a3a7a'];
const PU=PAL.map(U),PD=PAL.map(c=>U(mix(c,'#0a0f2a',0.62)));
// ---------- shapes: each returns positions (x,y,z) and colour indices for N points ----------
const pos=()=>new Float32Array(N*3),cols=()=>new Uint8Array(N);
function grid(t){const P_=pos(),C_=cols();for(let i=0;i<N;i++){const ix=i%40,iz=fl(i/40);P_[i*3]=(ix-19.5)*3.2;P_[i*3+1]=1.2;P_[i*3+2]=CZ-40+(iz-14.5)*3.2;C_[i]=5}return {P:P_,C:C_}}
function sheet(t,amp){const P_=pos(),C_=cols();for(let i=0;i<N;i++){const ix=i%40,iy=fl(i/40);const x=(ix-19.5)*4,y=CY+(14.5-iy)*4;const z=CZ+amp*14*Math.sin(x*0.035+y*0.025-t*0.12)+amp*6*Math.sin(y*0.07+t*0.09);
  P_[i*3]=x;P_[i*3+1]=y;P_[i*3+2]=z;C_[i]=amp>0?[9,13,10,14,12,2,11][((fl((x+y*0.6+t*2.4)/24)%7)+7)%7]:0}return {P:P_,C:C_}}
const FIB=[];{const ga=PI*(3-Math.sqrt(5));for(let i=0;i<N;i++){const y=1-2*(i+0.5)/N,r=Math.sqrt(1-y*y),a=i*ga;FIB.push([Math.cos(a)*r,y,Math.sin(a)*r])}}
const LAND=[[0.3,0.5,0.5,0.5],[-0.6,0.2,0.4,0.45],[1.9,0.4,0.6,0.55],[2.4,-0.3,0.35,0.3],[-1.1,-0.4,0.35,0.35],[3.0,0.9,0.5,0.4],[1.2,-0.1,0.3,0.3]];// lon, lat, size
function landAt(lon,lat){if(lat>1.25)return 2;let s=0;for(const [lo,la,sz] of LAND){let d=Math.abs(lon-lo);d=Math.min(d,2*PI-d);s+=Math.exp(-((d*Math.cos(lat))**2+(lat-la)**2)/(sz*sz))}return s>0.5?1:0}
const GLAND=FIB.map(([x,y,z])=>landAt(Math.atan2(z,x),Math.asin(y)));
function globe(t){const P_=pos(),C_=cols();const a=t*0.018,ca=Math.cos(a),sa=Math.sin(a),tl=23*D2R,ct=Math.cos(tl),st=Math.sin(tl);const R0=72;
  for(let i=0;i<N;i++){let [x,y,z]=FIB[i];const x1=x*ca+z*sa,z1=-x*sa+z*ca;const y2=y*ct-x1*st,x2=x1*ct+y*st;P_[i*3]=x2*R0;P_[i*3+1]=CY+y2*R0;P_[i*3+2]=CZ+z1*R0;C_[i]=GLAND[i]===1?3:GLAND[i]===2?4:2}return {P:P_,C:C_}}
// the whale: points on a tapered body with long pectoral fins and flukes; s=0 at the snout
const WH=[];{const r=rng(5);for(let i=0;i<N;i++){const k=r();let part,s,a;if(k<0.72){part=0;s=Math.pow(r(),0.85);a=r()*2*PI}else if(k<0.86){part=1;s=r();a=r()<0.5?1:-1}else{part=2;s=r();a=r()<0.5?1:-1}WH.push([part,s,a,r()])}}
function whale(t,x0,y0,pitch){const P_=pos(),C_=cols();const Lw=150,ph=t*0.11;
  for(let i=0;i<N;i++){const [part,s,a,q]=WH[i];let x,y,z,c=5;
    if(part===0){const rad=22*Math.sin(PI*Math.min(1,Math.pow(s,0.55)))*(1-0.75*s)+1.5;const yy=Math.sin(a)*rad*0.9,zz=Math.cos(a)*rad;x=s*Lw;y=yy;z=zz;c=yy<-rad*0.25?(((s*40)|0)%2?4:1):(q<0.06?0:5)}
    else if(part===1){const L=0.5;const along=s*L*Lw;x=0.3*Lw+along*0.35;y=-6-along*0.3*Math.cos(ph*0.6);z=a*(16+along*0.95);c=s>0.85?1:4}
    else{const fl_=s;x=Lw+4+fl_*14;y=0;z=a*fl_*30;c=0;if(fl_>0.85)c=1}
    // undulate: the tail end rises and falls
    const wave=Math.sin(ph-x/Lw*2.2)*Math.pow(x/Lw,2)*14;y+=wave;
    // pitch the whole whale (for the dive), then place it; the whale faces -x (swims left)
    const cp=Math.cos(pitch),sp=Math.sin(pitch);const xr=x*cp-y*sp,yr=x*sp+y*cp;
    P_[i*3]=x0+xr-Lw/2;P_[i*3+1]=y0+yr;P_[i*3+2]=CZ-40+z;C_[i]=c}return {P:P_,C:C_}}
function whaleAt(t){// swims in from the right, then noses down into the lake
  const k=clamp((t-700)/200,0,1),x0=180-300*ease(k),dive=clamp((t-880)/80,0,1);const pitch=-0.5*ease(dive)+Math.sin(t*0.03)*0.05;const y0=CY-10-Math.sin(k*PI)*6-ease(dive)*140;return whale(t,x0,y0,pitch)}
const SPL=[];{const r=rng(9);for(let i=0;i<N;i++){const a=r()*2*PI,el=0.9+r()*0.6,sp=1.4+r()*2.6;SPL.push([Math.cos(a)*Math.cos(el)*sp,Math.sin(el)*sp,Math.sin(a)*Math.cos(el)*sp,r()])}}
function splash(t){const P_=pos(),C_=cols();const tau=Math.max(0,t-958);for(let i=0;i<N;i++){const [vx,vy,vz,q]=SPL[i];const d=Math.min(tau,40+q*10);P_[i*3]=-150+vx*d*1.6;P_[i*3+1]=Math.max(-2,vy*d*1.7-0.05*d*d);P_[i*3+2]=CZ-40+vz*d*1.2;C_[i]=q<0.5?1:q<0.8?12:4}return {P:P_,C:C_}}
// the moon (a slowly turning cratered sphere) and the rabbit hopping in front of it
const RAB=[];{const parts=[['e',0,0,9,6.5],['e',8,-6,4.5,4],['e',6,-15,1.3,6],['e',9.5,-14.5,1.3,6],['e',-9,-1,2.6,2.6],['e',4,5,4,1.6],['e',-5,5,3,1.6]];const r=rng(3);
  while(RAB.length<340){const x=r()*28-12,y=r()*28-22;for(const [,cx,cy,rx,ry] of parts)if(((x-cx)/rx)**2+((y-cy)/ry)**2<1){RAB.push([x,y,(y<-9&&x>4)?8:1]);break}}}
const CRA=[[0.4,0.3,0.25],[-0.5,-0.2,0.32],[0.1,-0.6,0.2],[-0.2,0.55,0.15],[0.65,-0.35,0.18],[-0.75,0.4,0.2]];
function moon(t){const P_=pos(),C_=cols();const nm=N-RAB.length,R0=74,a=t*0.006;
  for(let i=0;i<nm;i++){const f=FIB[fl(i*N/nm)];const x1=f[0]*Math.cos(a)+f[2]*Math.sin(a),z1=-f[0]*Math.sin(a)+f[2]*Math.cos(a);let c=6;for(const [cx,cy,cr] of CRA)if((f[0]-cx)**2+(f[1]-cy)**2<cr*cr&&f[2]<0)c=7;
    P_[i*3]=x1*R0;P_[i*3+1]=CY+8+f[1]*R0;P_[i*3+2]=CZ+30+z1*R0;C_[i]=c}
  // hops: the rabbit crosses in front of the moon in arcs
  const hk=((t-1090)/42),hop=hk-fl(hk),hx=-90+clamp(t-1090,0,210)*0.85,hy=CY-60+Math.sin(hop*PI)*26;
  for(let j=0;j<RAB.length;j++){const i=nm+j,[x,y,c]=RAB[j];P_[i*3]=hx+x*3.1;P_[i*3+1]=hy-y*3.1;P_[i*3+2]=CZ-70;C_[i]=c}return {P:P_,C:C_}}
// 中秋快乐: glyph pixels, extruded into two layers, turning gently
let TXT=null;
function text(t){if(!TXT){const G_=zglyphs('中秋快乐',26,true);const px=[];for(let q=0;q<G_.px.length;q+=2)px.push([G_.px[q]-G_.w/2,G_.px[q+1]-G_.h/2]);TXT={px,h:G_.h}}
  const P_=pos(),C_=cols();const a=0.35*Math.sin((t-1300)*0.025),ca=Math.cos(a),sa=Math.sin(a);const n=TXT.px.length;
  for(let i=0;i<N;i++){const [gx,gy]=TXT.px[i%n];const layer=i<n?0:i<2*n?1:2;const x=gx*2.1,y=-gy*2.1,z=(layer-0.5)*6;P_[i*3]=x*ca+z*sa;P_[i*3+1]=CY+y;P_[i*3+2]=CZ-x*sa+z*ca;C_[i]=gy<-2?10:gy<4?13:9}return {P:P_,C:C_}}
// fireworks: every drone bursts out from where it was in the text, and sinks
const FW=[];{const r=rng(17);for(let i=0;i<N;i++){const u=r()*2-1,a=r()*2*PI,s=Math.sqrt(1-u*u),sp=0.6+r()*0.9;FW.push([s*Math.cos(a)*sp,u*sp,s*Math.sin(a)*sp,fl(r()*4)])}}
let FW0=null;
function fireworks(t){if(!FW0)FW0=text(1500);const P_=pos(),C_=cols();const tau=Math.max(0,t-1500);const ctr=[[-60,CY+30],[60,CY+40],[0,CY+10],[-20,CY+60]];
  for(let i=0;i<N;i++){const [vx,vy,vz,k]=FW[i];const c=ctr[k];const gather=clamp(tau/18,0,1),burst=Math.max(0,tau-18);
    const bx=FW0.P[i*3]+(c[0]-FW0.P[i*3])*ease(gather),by=FW0.P[i*3+1]+(c[1]-FW0.P[i*3+1])*ease(gather);
    const d=burst*(1-burst/220)*1.5;P_[i*3]=bx+vx*d*1.6;P_[i*3+1]=by+vy*d*1.6-burst*burst*0.004;P_[i*3+2]=CZ+vz*d*1.6;C_[i]=burst>0?[9,10,12,8][k]:10}return {P:P_,C:C_}}
// ---------- the programme ----------
const SHAPE={grid:t=>grid(t),sheet:t=>sheet(t,0),wave:t=>sheet(t,clamp((t-200)/40,0,1)*clamp((330-t)/30,0,1)),globe,whale:whaleAt,splash,moon,text,fireworks};
const SEGS=[[0,72,'grid'],[72,200,'grid','sheet'],[200,330,'wave'],[330,420,'wave','globe'],[420,620,'globe'],[620,700,'globe','whale'],[700,958,'whale'],[958,1010,'splash'],[1010,1090,'splash','moon'],[1090,1300,'moon'],[1300,1370,'moon','text'],[1370,1500,'text'],[1500,1600,'fireworks'],[1600,1700,'fireworks','grid'],[1700,LOOP,'grid']];
// which point of each shape each drone flies to: matched by rank along a sweep so paths do not tangle
const ORDER=[['grid',0],['sheet',150],['globe',420],['whale',700],['splash',990],['moon',1090],['text',1370],['fireworks',1600],['grid2',1700]];
const ASSIGN={};
function buildAssign(){const key=(P_,i)=>P_[i*3]+0.45*P_[i*3+1]+0.15*P_[i*3+2];
  let prev=null,prevName=null;for(const [nm,ts] of ORDER){const S_=(nm==='grid2'?SHAPE.grid:SHAPE[nm])(ts);
    if(!prev){ASSIGN[nm]=Array.from({length:N},(_,i)=>i)}
    else if(nm==='fireworks'){ASSIGN[nm]=ASSIGN.text.slice()}
    else{// drones sorted by where they are now, points sorted by where they go
      const dr=Array.from({length:N},(_,d)=>d).sort((a,b)=>key(prev,ASSIGN[prevName][a])-key(prev,ASSIGN[prevName][b]));const pt=Array.from({length:N},(_,i)=>i).sort((a,b)=>key(S_.P,a)-key(S_.P,b));
      const as=new Array(N);for(let r=0;r<N;r++)as[dr[r]]=pt[r];ASSIGN[nm]=as}
    prev=S_.P;prevName=nm}
  ASSIGN.wave=ASSIGN.sheet;ASSIGN.grid_end=ASSIGN.grid2}
const asg=(nm,seg)=>nm==='grid'?(seg>=13?ASSIGN.grid2:ASSIGN.grid):ASSIGN[nm];
// ---------- drone positions at frame t ----------
const DP=new Float32Array(N*3),DC=new Uint8Array(N),DON=new Uint8Array(N);
function drones(t){let si=0;while(si<SEGS.length-1&&SEGS[si+1][0]<=t)si++;const sg=SEGS[si];
  if(sg.length===3){const S_=SHAPE[sg[2]](t),as=asg(sg[2],si);for(let d=0;d<N;d++){const i=as[d];DP[d*3]=S_.P[i*3];DP[d*3+1]=S_.P[i*3+1];DP[d*3+2]=S_.P[i*3+2];DC[d]=S_.C[i];DON[d]=1}}
  else{const A_=SHAPE[sg[2]](t),B_=SHAPE[sg[3]](t),aa=asg(sg[2],si-1),ab=asg(sg[3],si+1);const u0=(t-sg[0])/(sg[1]-sg[0]);const lift=sg[2]==='grid'?1:sg[3]==='grid'?-1:0;
    for(let d=0;d<N;d++){const ia=aa[d],ib=ab[d];const st=(d*0.618)%1;// each drone leaves a little earlier or later
      const u=ease(clamp(u0*1.35-st*0.35,0,1));
      for(let k=0;k<3;k++)DP[d*3+k]=A_.P[ia*3+k]+(B_.P[ib*3+k]-A_.P[ia*3+k])*u;
      if(lift===1){const uy=ease(clamp(u0*1.6-st*0.4,0,1));DP[d*3+1]=A_.P[ia*3+1]+(B_.P[ib*3+1]-A_.P[ia*3+1])*uy}
      else if(lift===-1){const uy=ease(clamp(u0*1.35-st*0.35-0.1,0,1));DP[d*3]=A_.P[ia*3]+(B_.P[ib*3]-A_.P[ia*3])*ease(clamp(u0*1.6-st*0.4,0,1))}
      else DP[d*3+2]+=Math.sin(u*PI)*(-30+st*60);// bulge in depth so crossing paths separate
      DC[d]=u<0.5?A_.C[ia]:B_.C[ib];DON[d]=1}}
  // lights come on one by one at the start, go out at the end; drones under the water are dark
  for(let d=0;d<N;d++){if(t<72&&hash(d,1,1)*60>t)DON[d]=0;if(t>LOOP-40&&hash(d,2,1)*36<t-(LOOP-40))DON[d]=0;if(DP[d*3+1]<0.3)DON[d]=0}}
// ---------- scene ----------
function project(x,y,z){const yr=y-CAMY;const dcy=yr*Math.cos(PITCH)-z*Math.sin(PITCH),dcz=yr*Math.sin(PITCH)+z*Math.cos(PITCH);if(dcz<1)return null;return [W/2+FOC*x/dcz,H/2-FOC*dcy/dcz,dcz]}
let BG=null,IMG=null;
function paintBG(){const [c,g]=mkc(W,H);BG=c;const sky=['#05071a','#070a22','#0a0e2a','#0e1332','#13183a','#181e42','#1e2448'];
  for(let y=0;y<HOR;y++){const k=fl(y/HOR*sky.length);g.fillStyle=sky[Math.min(sky.length-1,k)];g.fillRect(0,y,W,1)}
  const r=rng(2);for(let i=0;i<70;i++)P(g,fl(r()*W),fl(r()*(HOR-40)),r()<0.3?'#8a90b8':'#4a5078');
  // far shore: a city skyline with lit windows and two towers
  const rr=rng(11);let x=-4;const sk=new Int16Array(W).fill(HOR);while(x<W){const w=6+fl(rr()*18),h=6+fl(rr()*20)+(Math.abs(x-120)<8?22:0)+(Math.abs(x-360)<6?30:0);for(let i=0;i<w&&x+i<W;i++)if(x+i>=0)sk[x+i]=HOR-h;
    R(g,x,HOR-h,w,h,rr()<0.5?'#0a0c18':'#0c0f1e');for(let yy=HOR-h+2;yy<HOR-1;yy+=3)for(let xx=x+1;xx<x+w-1;xx+=2)if(rr()<0.18)P(g,xx,yy,rr()<0.6?'#c8a85a':'#6a8ac8');x+=w}
  R(g,358,HOR-48,4,18,'#0c0f1e');P(g,359,HOR-49,'#ff4a4a');
  // the lake (reflections are added per frame), the near shore and the crowd come later
  const lake=['#0c1030','#0a0e2a','#080c24','#070a1e','#05081a'];for(let y=HOR;y<H;y++){g.fillStyle=lake[Math.min(4,fl((y-HOR)/14))];g.fillRect(0,y,W,1)}
  BG.sk=sk}
function draw(S,g){if(!ASSIGN.grid)buildAssign();if(!BG)paintBG();if(!IMG)IMG=g.createImageData(W,H);
  const t=((S.t%LOOP)+LOOP)%LOOP;drones(t);
  g.drawImage(BG,0,0);
  // the skyline's reflection, broken by ripples
  const src=g.getImageData(0,HOR-60,W,60),su=new Uint32Array(src.data.buffer);const im=g.getImageData(0,HOR,W,H-HOR),iu=new Uint32Array(im.data.buffer);
  for(let d=0;d<H-HOR;d++){const sy=59-d;if(sy<0)break;const wig=Math.round(Math.sin(d*0.8+t*0.21)*(1+d*0.04));const brk=hash(fl(d/2),fl(t/3),5)<0.15;if(brk)continue;
    for(let x=0;x<W;x++){const xs=clamp(x+wig,0,W-1);if(HOR-1-d<BG.sk[xs])continue;const s_=su[sy*W+xs];const o=RCACHE.get(s_)||(RCACHE.set(s_,litMap(LMC,s_,'#070a1c',0.55)),RCACHE.get(s_));iu[d*W+x]=o}}
  g.putImageData(im,0,HOR);
  // the barge the drones live on
  {const a=project(-70,0,CZ-90),b=project(70,0,CZ+10);if(a&&b){R(g,a[0],b[1]-1,b[0]-a[0],a[1]-b[1]+2,'#0e1018');R(g,a[0],b[1]-1,b[0]-a[0],1,'#2a2e40')}}
  // the drones: halos first, then the light itself; their reflections in the lake
  const u=new Uint32Array(W*H);const scr=g.getImageData(0,0,W,H),su2=new Uint32Array(scr.data.buffer);
  const pts=[];for(let d=0;d<N;d++){if(!DON[d])continue;const q=project(DP[d*3],DP[d*3+1],DP[d*3+2]);if(!q)continue;pts.push([Math.round(q[0]),Math.round(q[1]),DC[d],q[2]]);
    const rq=project(DP[d*3],-DP[d*3+1],DP[d*3+2]);if(rq){const ry=Math.round(rq[1]);if(ry>HOR&&ry<H){const wig=Math.round(Math.sin(ry*0.8+t*0.21)*(1+(ry-HOR)*0.04));if(hash(fl((ry-HOR)/2),fl(t/3),5)>=0.15){const rx=Math.round(rq[0])+wig;if(rx>=0&&rx<W)su2[ry*W+rx]=PD[DC[d]]}}}}
  for(const [x,y,c] of pts){for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const xx=x+dx,yy=y+dy;if(xx>=0&&yy>=0&&xx<W&&yy<HOR)su2[yy*W+xx]=PD[c]}}
  for(const [x,y,c,z] of pts){if(x>=0&&y>=0&&x<W&&y<HOR){su2[y*W+x]=PU[c];if(z<380&&x+1<W)su2[y*W+x+1]=PU[c]}}
  g.putImageData(scr,0,0);
  // the crowd on the near shore: heads, a child on shoulders, phones held up showing the show
  const lead=pts.length?PAL[pts[fl(pts.length/2)][2]]:'#3a4a7a',rim=mix(lead,'#05060c',0.45);
  for(const pr of CROWD)person(g,pr,rim);
  for(const [px,py] of PHONES){R(g,px-1,py-1,8,13,'#05060c');R(g,px,py,6,10,'#10142a');// the screen shows a tiny copy of the show
    for(let k=0;k<pts.length;k+=9){const [x,y,c]=pts[k];const sx=px+fl(x/W*6),sy=py+fl(y/HOR*8);if(sx>=px&&sx<px+6&&sy>=py&&sy<py+10)P(g,sx,sy,PAL[c])}}}
// a person seen from behind: head, neck, shoulders running off the bottom; hair styles; a rim of light from the show on top
function person(g,[x,top,hr,style,arm],rim){const D='#05060c',hy=top+hr;
  if(style===1){ell(g,x,hy+hr*0.5,hr+2,hr*1.3,D)}// long hair
  disc(g,x,hy,hr,D);if(style===2){disc(g,x,top-1,Math.max(2,hr*0.35),D)}// bun
  if(style===3){ell(g,x,hy-2,hr+2,hr-1,D)}// a beanie
  const sw=hr*2.6;R(g,x-1,hy+hr-2,3,6,D);poly(g,[[x-sw,H],[x-sw+4,hy+hr+8],[x-hr,hy+hr+3],[x+hr,hy+hr+3],[x+sw-4,hy+hr+8],[x+sw,H]],D);
  if(arm){L(g,x+arm*hr*1.6,hy+hr+8,x+arm*hr*2.2,hy-hr*1.6,D,4)}
  for(let i=-hr+1;i<hr;i++)P(g,x+i,hy-Math.round(Math.sqrt(Math.max(0,hr*hr-i*i)))-(style===2&&Math.abs(i)<hr*0.35?Math.round(hr*0.35)+1:0)-(style===3?1:0),rim);
  P(g,x-sw+5,hy+hr+8,rim);P(g,x+sw-5,hy+hr+8,rim)}
const CROWD=[[18,226,11,1,0],[70,234,10,0,0],[118,222,12,3,1],[172,236,9,2,0],[214,214,8,0,0],[258,228,12,0,-1],[316,232,10,1,0],[362,220,12,0,1],[420,230,11,2,0],[466,224,12,3,0]];
const PHONES=[[140,190],[332,186],[389,196]];
const RCACHE=new Map(),LMC=new Map();let BGSKY=0;
// ---------- sound ----------
function sound(A,S,u,pu,t){const T=A.at();bed(A,'crowd','brown','bandpass',600,0.6);bed(A,'buzz','sawtooth','bandpass',180,4,120);bed(A,'lake','white','lowpass',900,0.5);
  const moving=SEGS.some(s=>s.length===4&&u>=s[0]&&u<s[1]);bset(A,'crowd',0.035+(u>1500&&u<1600?0.05:0));bset(A,'buzz',moving?0.025:0.01,null,0.3,moving?150:120);bset(A,'lake',0.01);
  const cue=(f0,ch,o)=>{if(crossed(pu,u,f0))pad(A,T,ch.map(mtof),o.d||6,o.v||0.03,{ff:o.ff||1200})};
  cue(72,[57,64,69],{d:5});cue(200,[60,64,67,72],{d:6});cue(420,[55,62,67,71],{d:8,ff:900});cue(700,[52,59,64,67],{d:10,ff:700});
  if(u>=700&&u<900&&(u-700)%96===0){tone(A,'sine',180,T,2.2,0.035,{to:120,glide:1.6,a:0.4,wet:0.8});tone(A,'sine',360,T+0.3,1.6,0.015,{to:260,glide:1.2,a:0.3,wet:0.8})}// whale song
  if(crossed(pu,u,958))noise(A,T,1.6,0.12,'lowpass',1600,{to:300,glide:1.4,a:0.01});
  cue(1090,[60,64,67,69,72],{d:9,ff:1400});if(u>=1090&&u<1300&&(u-1090)%42===0)tone(A,'triangle',mtof(79),T,0.2,0.03,{to:mtof(84),glide:0.12,wet:0.4});
  cue(1370,[57,60,64,69],{d:5});
  for(const f0 of [1518,1530,1542,1556])if(crossed(pu,u,f0)){noise(A,T,0.5,0.14,'lowpass',900,{to:200,glide:0.4});noise(A,T+0.1,1.4,0.03,'highpass',3000,{a:0.2})}
  if(crossed(pu,u,1520))noise(A,T,2,0.06,'bandpass',800,{q:0.5,a:0.3})}// cheering
SAMPLES.push({id:'drones',name:'千机夜空',w:W,h:H,thumb:520,
  tags:['每个像素都是一架无人机','1200 个点在三维空间里','形状之间按排名配对，航线不打结','地球在转，鲸鱼在游','钻进湖里，灯就灭了','只有够低的才在湖里有倒影','中秋快乐'],
  about:'中秋夜的湖边，1200 架无人机，每一架就是一个像素，只不过这个像素在三维空间里。它们从湖上的驳船起飞，先排成一面会起伏的彩色幕布，再变成一个转动的地球；然后是一头座头鲸，从右边游进夜空，尾巴一上一下，最后一头扎进湖里，灯一架一架灭掉，水花又溅出来；水花聚成月亮，玉兔从月亮前面一蹦一蹦地跳过去；再是“中秋快乐”，最后炸成烟花，落回驳船。每一架无人机都有自己的编号，从一个形状飞到下一个形状时，它们按位置排好队一一配对，所以航线是扫过去的，不是乱飞。只有离水面够近的点才会在湖里留下倒影。前排观众举着的手机屏幕里也在放同一场表演。一圈 72 秒。',
  controls:[SND_CTL,{type:'button',label:'起飞',act(s){s.t=60}},{type:'button',label:'地球',act(s){s.t=400}},{type:'button',label:'鲸鱼',act(s){s.t=680}},{type:'button',label:'入水',act(s){s.t=870}},{type:'button',label:'月亮',act(s){s.t=1080}},{type:'button',label:'烟花',act(s){s.t=1490}}],
  init(s){sndInit(s)},onOpt(s,k){sndOpt(s,k)},onLeave:sndOff,tick(s){sndTick(s,LOOP,sound)},draw,
  info(s){const t=((s.t%LOOP)+LOOP)%LOOP;let on=0;for(let d=0;d<N;d++)on+=DON[d];return '第 '+fl(t/24)+' 秒 / 72 · 亮着 '+on+' 架'}});
})();

// ================= player =================
const cv=document.getElementById('cv'),g=cv.getContext('2d'),stage=document.getElementById('stage');
const $=id=>document.getElementById(id);
let cur=0,S=null,paused=false,speed=1,acc=0,last=performance.now(),visible=true;
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;if(reduce)paused=true;
function newState(def){const s={t:0,opt:{}};for(const c of def.controls||[])if(c.key)s.opt[c.key]=c.def;def.init(s);return s}
function fit(){const d=SAMPLES[cur],aw=stage.clientWidth-2,ah=Math.max(200,innerHeight*0.66);let sc=Math.min(aw/d.w,ah/d.h);if(sc>=2)sc=fl(sc);
  cv.style.width=fl(d.w*sc)+'px';cv.style.height=fl(d.h*sc)+'px';S.scale=sc}
function render(){g.imageSmoothingEnabled=false;SAMPLES[cur].draw(S,g);syncUI()}
function syncUI(){const d=SAMPLES[cur];$('info').textContent=(d.info?d.info(S)+' · ':'')+`${d.w}×${d.h}`+(S.scale>=2?` ×${S.scale}`:'');
  for(const el of $('ctls').querySelectorAll('[data-key]')){const k=el.dataset.key,v=S.opt[k];
    if(el.dataset.type==='seg')for(const b of el.querySelectorAll('button'))b.classList.toggle('on',String(b.dataset.v)===String(v));
    else if(el.dataset.type==='toggle'){el.classList.toggle('on',!!v);el.setAttribute('aria-pressed',!!v)}
    else if(el.dataset.type==='range'&&document.activeElement!==el)el.value=v}}
function tick(){SAMPLES[cur].tick(S);S.t++}
function select(i){if(SAMPLES[cur]&&S&&SAMPLES[cur].onLeave)SAMPLES[cur].onLeave(S);cur=i;const d=SAMPLES[i];cv.width=d.w;cv.height=d.h;S=newState(d);
  $('nm').textContent=d.name;$('about').textContent=d.about;
  $('tags').innerHTML='<li class="h">TECHNIQUES</li>'+d.tags.map(t=>`<li>${t}</li>`).join('');
  const box=$('ctls');box.innerHTML='';
  for(const c of d.controls||[]){
    if(c.type==='seg'){const lab=document.createElement('span');lab.className='lab';lab.textContent=c.label;const seg=document.createElement('div');seg.className='seg';seg.dataset.key=c.key;seg.dataset.type='seg';
      for(const[v,l]of c.options){const b=document.createElement('button');b.type='button';b.textContent=l;b.dataset.v=v;b.onclick=()=>{S.opt[c.key]=v;d.onOpt&&d.onOpt(S,c.key);render()};seg.appendChild(b)}
      box.append(lab,seg)}
    else if(c.type==='toggle'){const b=document.createElement('button');b.type='button';b.textContent=c.label;b.dataset.key=c.key;b.dataset.type='toggle';b.onclick=()=>{S.opt[c.key]=!S.opt[c.key];d.onOpt&&d.onOpt(S,c.key);render()};box.append(b)}
    else if(c.type==='range'){const lab=document.createElement('label');lab.className='lab';lab.textContent=c.label;lab.htmlFor='rg-'+c.key;const r=document.createElement('input');r.type='range';r.id='rg-'+c.key;r.min=c.min;r.max=c.max;r.step='0.1';r.dataset.key=c.key;r.dataset.type='range';
      r.oninput=()=>{S.opt[c.key]=+r.value;render()};box.append(lab,r)}
    else if(c.type==='button'){const b=document.createElement('button');b.type='button';b.textContent=c.label;b.onclick=()=>{c.act(S);render()};box.append(b)}}
  for(const[k,el]of [...$('tabs').children].entries())el.classList.toggle('on',k===i);
  cv.style.touchAction=d.onPointer?'none':'auto';fit();render();try{history.replaceState(null,'','#'+d.id)}catch(e){}}
// speed control
for(const[v,l]of [[0.25,'¼'],[0.5,'½'],[1,'1×'],[2,'2×'],[4,'4×']]){const b=document.createElement('button');b.type='button';b.textContent=l;b.dataset.v=v;b.onclick=()=>{speed=v;for(const x of $('spd').children)x.classList.toggle('on',+x.dataset.v===speed)};$('spd').appendChild(b)}
for(const x of $('spd').children)x.classList.toggle('on',+x.dataset.v===speed);
function setPaused(p){paused=p;$('play').textContent=p?'播放':'暂停'}
$('play').onclick=()=>setPaused(!paused);
$('stepb').onclick=()=>{setPaused(true);tick();render()};
function cpos(e){const r=cv.getBoundingClientRect(),d=SAMPLES[cur];return[(e.clientX-r.left)/r.width*d.w,(e.clientY-r.top)/r.height*d.h]}
cv.addEventListener('pointerdown',e=>{const d=SAMPLES[cur],p=cpos(e);if(d.onPointer){try{cv.setPointerCapture(e.pointerId)}catch(_){}d.onPointer(S,p[0],p[1],'down',1);e.preventDefault()}if(d.onClick)d.onClick(S,p[0],p[1]);render()});
cv.addEventListener('pointermove',e=>{const d=SAMPLES[cur];if(d.onPointer){const p=cpos(e);d.onPointer(S,p[0],p[1],'move',e.buttons)}});
cv.addEventListener('pointerup',e=>{const d=SAMPLES[cur];if(d.onPointer){const p=cpos(e);d.onPointer(S,p[0],p[1],'up',0)}});
addEventListener('keydown',e=>{if(e.target.tagName==='INPUT')return;const d=SAMPLES[cur];
  if(d.onKey&&d.onKey(S,e.key,true)){e.preventDefault();return}
  if(e.key===' '){e.preventDefault();setPaused(!paused)}else if(e.key==='ArrowRight'){e.preventDefault();setPaused(true);tick();render()}
  else{const k='1234567890-='.indexOf(e.key);if(k>=0&&k<SAMPLES.length)select(k);else if(e.key==='['||e.key===']')select((cur+(e.key===']'?1:SAMPLES.length-1))%SAMPLES.length)}});
addEventListener('keyup',e=>{const d=SAMPLES[cur];if(d.onKey)d.onKey(S,e.key,false)});
// thumbnails
SAMPLES.forEach((d,i)=>{const b=document.createElement('button');b.type='button';b.className='tab';const c=document.createElement('canvas');c.width=d.w;c.height=d.h;
  const st=newState(d);for(let k=0;k<(d.thumb||40);k++){d.tick(st);st.t++}const tg=c.getContext('2d');tg.imageSmoothingEnabled=false;d.draw(st,tg);
  const tl=document.createElement('span');tl.className='tl';tl.innerHTML=`<span class="k">${i+1}</span>${d.name}`;b.append(c,tl);b.onclick=()=>select(i);$('tabs').appendChild(b)});
new ResizeObserver(()=>{if(S){fit();render()}}).observe(stage);
new IntersectionObserver(es=>{visible=es[0].isIntersecting}).observe(stage);
const start=Math.max(0,SAMPLES.findIndex(d=>'#'+d.id===location.hash));select(start);setPaused(paused);
function loop(now){const dt=Math.min(0.25,(now-last)/1000);last=now;
  if(!paused&&visible){acc+=dt*24*speed;let n=0;while(acc>=1&&n<8){tick();acc-=1;n++}if(n)render()}
  requestAnimationFrame(loop)}
requestAnimationFrame(loop);
