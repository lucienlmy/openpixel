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

const hx=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];

const U=h=>{const a=hx(h);return((255<<24)|(a[2]<<16)|(a[1]<<8)|a[0])>>>0};
function vn(x,seed){const i=fl(x),f=x-i,a=hash(i,seed),b=hash(i+1,seed),u=f*f*(3-2*f);return a+(b-a)*u}


const SAMPLES=[];

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
(function(){
const W=480,H=270,LOOP=1728,FU=120,FV=110,SP=0.3,NU=Math.ceil(FU/SP),NV=Math.ceil(FV/SP);
const FOC=(W/2)/Math.tan(30*D2R);
const TOWER={u:60,h:18,v:-14,p:-15},GROUND={u:44,h:1.6,v:-3.2,p:-3.5},DRONE={u:60,h:150,v:55,p:-90};
// ---------- the picture, drawn in tower-screen space with index colours ----------
// 0 green, 1 black-purple, 2 yellow, 3 red, 4 pale, 5 dark green
const VARC=['#00ff00','#ff00ff','#ffff00','#ff0000','#ffffff','#008000'];
let VAR=null;
function buildVar(){const [c,g]=mkc(W,H);g.fillStyle=VARC[0];g.fillRect(0,0,W,H);const F=(i)=>VARC[i];{const sx=392/408,sy=170/196;g.setTransform(sx,0,0,sy,44-36*sx,95-70*sy)}
  // a frame and two curling clouds
  g.strokeStyle=F(5);g.lineWidth=5;g.strokeRect(36,70,408,196);
  const curl=(cx,cy,r)=>{g.strokeStyle=F(4);g.lineWidth=3;g.beginPath();g.arc(cx,cy,r,PI*0.9,PI*2.4);g.stroke();g.beginPath();g.arc(cx+r*1.6,cy+r*0.2,r*0.8,PI*0.7,PI*2.2);g.stroke()};
  curl(80,100,9);curl(330,88,7);
  // the sun
  g.fillStyle=F(3);g.beginPath();g.arc(400,104,17,0,PI*2);g.fill();g.fillStyle=F(2);g.beginPath();g.arc(400,104,12,0,PI*2);g.fill();
  // the crane: wings up, neck forward to the left, legs trailing
  g.fillStyle=F(4);g.beginPath();g.moveTo(205,150);g.lineTo(150,96);g.lineTo(118,92);g.lineTo(170,122);g.lineTo(200,160);g.closePath();g.fill();// far wing
  g.beginPath();g.moveTo(240,148);g.lineTo(300,92);g.lineTo(350,82);g.lineTo(316,118);g.lineTo(262,160);g.closePath();g.fill();// near wing
  g.fillStyle=F(1);g.beginPath();g.moveTo(150,96);g.lineTo(118,92);g.lineTo(140,106);g.closePath();g.fill();g.beginPath();g.moveTo(300,92);g.lineTo(350,82);g.lineTo(330,102);g.closePath();g.fill();
  g.fillStyle=F(4);g.beginPath();g.ellipse(232,158,34,13,-0.12,0,PI*2);g.fill();
  g.strokeStyle=F(1);g.lineWidth=5;g.beginPath();g.moveTo(205,154);g.quadraticCurveTo(178,150,158,160);g.stroke();
  g.fillStyle=F(4);g.beginPath();g.ellipse(152,162,9,6,0,0,PI*2);g.fill();g.fillStyle=F(3);g.beginPath();g.arc(150,157,4,0,PI*2);g.fill();
  g.strokeStyle=F(2);g.lineWidth=3;g.beginPath();g.moveTo(144,164);g.lineTo(126,170);g.stroke();
  g.fillStyle=F(1);g.beginPath();g.moveTo(262,152);g.lineTo(286,156);g.lineTo(266,166);g.closePath();g.fill();// black tail
  g.strokeStyle=F(1);g.lineWidth=2;g.beginPath();g.moveTo(262,166);g.lineTo(318,174);g.moveTo(262,170);g.lineTo(316,180);g.stroke();
  // the girl in a straw hat, waving
  g.fillStyle=F(3);g.beginPath();g.moveTo(112,212);g.lineTo(150,212);g.lineTo(160,258);g.lineTo(102,258);g.closePath();g.fill();
  g.fillStyle=F(4);g.beginPath();g.arc(131,200,11,0,PI*2);g.fill();
  g.fillStyle=F(2);g.beginPath();g.ellipse(131,190,24,7,0,0,PI*2);g.fill();g.beginPath();g.ellipse(131,184,12,8,0,PI,PI*2);g.fill();g.fillStyle=F(3);g.fillRect(119,186,24,3);
  g.strokeStyle=F(4);g.lineWidth=4;g.beginPath();g.moveTo(148,218);g.lineTo(168,190);g.lineTo(172,178);g.stroke();
  // 风调雨顺
  g.fillStyle=F(2);g.font='bold 34px "PingFang SC","Noto Sans SC","Microsoft YaHei",sans-serif';g.textBaseline='top';g.fillText('风调雨顺',230,206);
  g.setTransform(1,0,0,1,0,0);const d=g.getImageData(0,0,W,H).data;const scr=new Uint8Array(W*H);for(let i=0;i<W*H;i++){const r=d[i*4],gg=d[i*4+1],b=d[i*4+2];
    scr[i]=r>200&&gg>200&&b>200?4:r>200&&gg>200?2:r>200&&b>200?1:r>200?3:gg>200?0:gg>90?5:0}
  // every plant takes the colour of the picture at the spot where the tower sees it
  VAR=new Uint8Array(NU*NV);for(let iv=0;iv<NV;iv++)for(let iu=0;iu<NU;iu++){const s=proj(TOWER,(iu+0.5)*SP,(iv+0.5)*SP);const x=fl(s[0]),y=fl(s[1]);VAR[iv*NU+iu]=x>=0&&y>=0&&x<W&&y<H?scr[y*W+x]:0}}
function proj(C,u,v){const p=C.p*D2R,ru=u-C.u,ry=-C.h,rv=v-C.v;const dcy=ry*Math.cos(p)-rv*Math.sin(p),dcz=ry*Math.sin(p)+rv*Math.cos(p);return [W/2+FOC*ru/dcz,H/2-FOC*dcy/dcz,dcz]}
// ---------- the season ----------
const T_PLANT0=72,T_PLANT1=380,T_GROW1=640,T_WIND0=900,T_WIND1=1180,T_RIPE0=1250,T_RIPE1=1420,T_HARV0=1440,T_HARV1=1630,T_FLOOD0=1640;
const growth=t=>t<T_PLANT1?0.08:clamp((t-T_PLANT1)/(T_GROW1-T_PLANT1),0,1);
const ripe=t=>clamp((t-T_RIPE0)/(T_RIPE1-T_RIPE0),0,1);
const plantV=t=>FV-(FV+2)*clamp((t-T_PLANT0)/(T_PLANT1-T_PLANT0),0,1);// rows with v > this are planted
// harvest: a combine runs lanes 4 m wide along v, alternating direction
const LANE=4,NLANE=Math.ceil(FU/LANE),HSPD=NLANE*FV/(T_HARV1-T_HARV0);
function harvT(u,v){const l=fl(u/LANE);const along=l%2?FV-v:v;return T_HARV0+(l*FV+along)/HSPD}
function combinePos(t){const d=(t-T_HARV0)*HSPD;const l=fl(d/FV),a=d-l*FV;return {u:l*LANE+LANE/2,v:l%2?FV-a:a,dir:l%2?-1:1}}
const floodV=t=>(t-T_FLOOD0)/(LOOP-T_FLOOD0)*(FV+FU)*1.05;// the flood front spreads from the inlet corner
// ---------- palettes: per variety [young, mature, ripe] x shade [dark, mid, light] ----------
const VP=[
  [['#4a7a2a','#5a9a34','#7aba4a'],['#2e6a24','#3e8a2e','#5aa83e'],['#a8862a','#c8a83a','#e0c45a']],
  [['#4a6a2a','#5a8030','#74983e'],['#3a1a40','#4e2656','#6a3a72'],['#3a2230','#4a2c3a','#5e3a48']],
  [['#6a8a2a','#86a632','#a2c040'],['#c8b42a','#e0d040','#f2e86a'],['#d8c060','#e8d27a','#f6e49a']],
  [['#4a6a2a','#5a8030','#74983e'],['#7a2a20','#9a3a2a','#b84e36'],['#6a3220','#844030','#9a5038']],
  [['#6a9a4a','#86b25e','#a2c878'],['#b8d0a0','#d4e4c0','#eef6e0'],['#d8d0a0','#e8e0b8','#f6f0d0']],
  [['#3a6a24','#4a7e2c','#62963a'],['#163a18','#1e4a1e','#2c5e28'],['#7a6a28','#9a8a34','#b4a442']]];
const lerpI=(a,b,k)=>k<0.34?a:k<0.67?(k<0.5?a:b):b;
// sky by time of the season (stepped)
const SKY=['#9ac4e8','#aed2ee','#c4e0f4','#dcecf8'];
function plantCol(vr,gk,rk,shade){let st=gk<0.55?0:1;if(rk>0.5)st=2;const pal=VP[vr][st];return pal[shade]}
// ---------- camera path ----------
const CAMK=[[0,TOWER],[600,TOWER],[650,GROUND],[730,GROUND],[860,TOWER],[1080,TOWER],[1110,DRONE],[1220,DRONE],[1260,TOWER],[LOOP,TOWER]];
function camAt(t){let k=0;while(k<CAMK.length-2&&CAMK[k+1][0]<=t)k++;const a=CAMK[k],b=CAMK[k+1],A=a[1],B=b[1];let u=ease(clamp((t-a[0])/(b[0]-a[0]),0,1));
  // rising from the dike: climb first, then tilt down, so the picture snaps together near the top
  if(A===GROUND&&B===TOWER){const uh=ease(clamp(u*1.25,0,1)),up=ease(clamp((u-0.35)/0.65,0,1));return {u:A.u+(B.u-A.u)*uh,h:A.h+(B.h-A.h)*uh,v:A.v+(B.v-A.v)*uh,p:A.p+(B.p-A.p)*up}}
  const lp=(x,y)=>x+(y-x)*u;return {u:lp(A.u,B.u),h:Math.exp(lp(Math.log(A.h),Math.log(B.h))),v:lp(A.v,B.v),p:lp(A.p,B.p)}}
// ---------- drawing ----------
let IMG=null,MT=null,MT2=null;const CU={};const cu=h=>CU[h]||(CU[h]=U(h));
function draw(S,g){if(!VAR)buildVar();if(!IMG)IMG=g.createImageData(W,H);const buf=new Uint32Array(IMG.data.buffer);
  const t=((S.t%LOOP)+LOOP)%LOOP;const C=camAt(t);const p=C.p*D2R,cp=Math.cos(p),sp=Math.sin(p);
  const gk=growth(t),rk=ripe(t),pv=plantV(t),fv=t>=T_FLOOD0?floodV(t):-1;
  const rad=0.12+gk*0.42;// plant radius in cell units (canopy closes at ~0.5)
  const windOn=t>=T_WIND0&&t<T_WIND1?Math.min(1,(t-T_WIND0)/60,(T_WIND1-t)/60):(t>=T_GROW1&&t<T_RIPE1?0.35:0);
  const cloudT=t*(t<T_GROW1&&t>T_PLANT1?0.9:0.15);
  const season=t<T_GROW1?0:t<T_RIPE0?1:t<T_HARV1?2:0;
  const skyOff=0;
  for(let y=0;y<H;y++){const dcy=-(y+0.5-H/2)/FOC;const dy=dcy*cp+sp,dv=-dcy*sp+cp;
    if(dy>-1e-4){// sky and the far mountains
      const e=Math.atan2(dy,dv);if(!MT){MT=new Float32Array(W);MT2=new Float32Array(W);for(let x=0;x<W;x++){const az=(x+0.5-W/2)/FOC;MT[x]=0.016+0.012*Math.sin(az*5+1)+0.008*Math.sin(az*13)+0.004*Math.sin(az*31);MT2[x]=0.008+0.006*Math.sin(az*7+3)}}
      for(let x=0;x<W;x++){const az=(x+0.5-W/2)/FOC;const mt=MT[x],mt2=MT2[x];let col;
        if(e<mt2)col=season===2?'#8a9a6a':'#6a8a7a';else if(e<mt)col=season===2?'#9aa88a':'#8aa4a4';else{const k=e<0.05?3:e<0.12?2:e<0.25?1:0;col=SKY[k];
          if(vn(az*6+t*0.004,3)+vn(e*30,5)*0.4>1.05&&e>0.03)col='#f2f6fa'}
        buf[y*W+x]=cu(col)}continue}
    const s=-C.h/dy,v=C.v+s*dv,foot=s/FOC,footV=Math.abs(s*(1/FOC))*Math.abs(dv/dy)+foot;
    for(let x=0;x<W;x++){const u=C.u+s*(x+0.5-W/2)/FOC;let col;
      if(u<-1.2||u>FU+1.2||v<-1.2||v>FV+1.2){// around the field: dikes, a canal, neighbouring paddies
        if(v<-1.2&&v>-6){col=v>-2.6?'#b09a6a':v>-4.2?'#5a7a9a':'#8aa04a'}
        else{const gu=((u%30)+30)%30,gv=((v%30)+30)%30;col=(gu<1.2||gv<1.2)&&footV<2.5?(season===2?'#b8a070':'#a89a6a'):season===2?'#c8b04a':season===1?'#4a8a30':'#7aa4c4'}}
      else if(u<0||u>FU||v<0||v>FV)col='#b8a474';
      else{const iu=fl(u/SP),iv=fl(v/SP),vr=VAR[clamp(iv,0,NV-1)*NU+clamp(iu,0,NU-1)];const fu=u/SP-iu-0.5,fw=v/SP-iv-0.5;
        // state of this spot in the season
        let planted=v>pv,harvested=t>=T_HARV0&&harvT(u,v)<t,flooded=fv>=0&&(u+(FV-v))<fv;
        if(t<T_PLANT0)planted=false;
        if(flooded){planted=false;harvested=false}
        // cloud shadow
        const cs=vn(u*0.025+cloudT*0.02,7)+vn(v*0.03-cloudT*0.012,9)*0.8>1.42;
        if(harvested){col=(fl(u/LANE)%2)?'#b0905e':'#a08252';if(Math.abs(((u%LANE)+LANE)%LANE-LANE/2)<0.35)col='#d8b87a';else if(foot<0.06&&Math.abs(fu)<0.25&&Math.abs(fw)<0.25)col='#c8a46a'}
        else if(!planted){// water mirrors the sky; a little ripple
          col=season===2&&!flooded?'#6a5a3a':(v>FV*0.55?'#9ac4e8':'#aed2ee')}
        else{const r2=fu*fu+fw*fw,cov=PI*rad*rad;const far=foot>0.16||footV>0.3;let inside=far?cov>0.24:r2<rad*rad;
          if(gk>=0.95)inside=true;
          if(!inside)col=gk<0.5?(far?(gk>0.02?'#8ab8a8':'#9ac4e8'):'#aed2ee'):'#3a6430';
          else{let shade=1;if(foot<0.08&&gk<0.95){shade=fu+fw<-0.1?2:fu+fw>0.25?0:1}
            if(windOn>0){const wv=Math.sin(u*0.16+v*0.09-t*0.24+Math.sin(v*0.05+u*0.02)*1.5)+0.35*Math.sin(u*0.05-v*0.21-t*0.13)+vn(u*0.2+v*0.1,2)*0.25;if(wv>1.12-windOn*0.18)shade=2;else if(wv<-1.15)shade=0}
            if(cs)shade=Math.max(0,shade-1);
            const tone=gk<0.4?0:Math.min(1,(gk-0.3)*1.5);col=plantCol(vr,tone,rk,shade);
            if(gk<0.4)col=VP[0][0][shade]}}}
      buf[y*W+x]=cu(col)}}
  g.putImageData(IMG,0,0);
  // people and machines, drawn as tiny sprites where they stand
  const spr=(u,v,hgt,cols)=>{const q=proj(C,u,v);if(q[2]<=0.5)return;const sc=FOC/q[2];const hpx=Math.max(1,Math.round(hgt*sc)),wpx=Math.max(1,Math.round(hpx*0.45));const x=Math.round(q[0]-wpx/2),y=Math.round(q[1]-hpx);if(x>W||x+wpx<0||y>H||y+hpx<0)return;
    R(g,x,y+Math.round(hpx*0.25),wpx,Math.max(1,hpx-Math.round(hpx*0.25)),cols[0]);R(g,x-Math.round(wpx*0.25),y,Math.round(wpx*1.5)||1,Math.max(1,Math.round(hpx*0.18)),cols[1]);if(hpx>8)R(g,x+Math.round(wpx*0.2),y+Math.round(hpx*0.16),Math.round(wpx*0.6),Math.round(hpx*0.12),'#e8c098')};
  if(t>=T_PLANT0-30&&t<T_PLANT1+20){const vp=Math.max(-0.5,pv);for(let i=0;i<12;i++){const bend=Math.sin(t*0.3+i)>0?0.9:1.25;spr(5+i*10+Math.sin(i*1.7)*2,vp+0.6,bend,[i%3?'#3a5a8a':'#c84a4a','#e8d08a'])}}
  if(t>=T_HARV0&&t<T_HARV1){const c=combinePos(t);const q=proj(C,c.u,c.v);if(q[2]>0.5){const sc=FOC/q[2];const w_=Math.max(3,Math.round(3.4*sc)),h_=Math.max(2,Math.round(2.6*sc));const x=Math.round(q[0]-w_/2),y=Math.round(q[1]-h_);
      R(g,x,y,w_,h_,'#c83a2a');R(g,x,y,w_,Math.max(1,Math.round(h_*0.3)),'#e85a3a');R(g,x+Math.round(w_*0.6),y-Math.round(h_*0.5),Math.round(w_*0.3)||1,Math.round(h_*0.5)||1,'#2a2a30');R(g,x-1,y+h_-1,w_+2,1,'#5a4a30')}}
  // the dike view: an old farmer in a straw hat, grass at our feet
  const dGround=Math.max(0,1-C.h/4);
  if(dGround>0.5){for(let x=0;x<W;x+=2){const hh=8+fl(hash(x,1,3)*14)+Math.round(Math.sin(x*0.3+t*0.12)*1.5);L(g,x,H,x+Math.round(Math.sin(x+t*0.1)*2),H-hh,hash(x,2,3)<0.5?'#3a6a24':'#4a7e2c')}
    const fx=402,fy=H;poly(g,[[fx-26,fy],[fx-20,fy-70],[fx+18,fy-72],[fx+26,fy]],'#3a4a5a');disc(g,fx-1,fy-84,12,'#c89a6a');ell(g,fx-1,fy-94,30,7,'#d8c070');ell(g,fx-1,fy-99,14,9,'#e0cc80');R(g,fx-16,fy-96,30,2,'#8a6a3a')}
  // the tower: a railing in front of us and a few heads, a kid pointing
  if(Math.abs(C.h-TOWER.h)<2&&Math.abs(C.p-TOWER.p)<3){R(g,0,H-14,W,3,'#6a4a2a');R(g,0,H-11,W,1,'#3a2a18');for(let x=8;x<W;x+=40)R(g,x,H-14,4,14,'#5a3e22');
    disc(g,38,H-6,13,'#1a1a1e');disc(g,446,H-2,16,'#1a1a1e');disc(g,96,H-10,8,'#2a2026');L(g,100,H-16,126,H-34,'#2a2026',3);P(g,127,H-35,'#e8c098');R(g,438,H-34,10,16,'#1a1a1e');R(g,440,H-32,6,11,'#7ab0e0')}
}
// ---------- sound ----------
function sound(A,S,u,pu,t){const T=A.at();bed(A,'wind','white','bandpass',700,0.6);bed(A,'bed','brown','lowpass',300,0.5);bed(A,'cicada','white','bandpass',5200,8);bed(A,'engine','sawtooth','lowpass',220,1.2,48);
  const wk=u>=T_WIND0&&u<T_WIND1?1:0.3;const gust=0.5+0.5*Math.sin(u*0.05);bset(A,'wind',0.02+wk*0.05*gust,500+gust*600,0.3);bset(A,'bed',0.03);
  bset(A,'cicada',u>T_GROW1&&u<T_RIPE0?0.018*(0.6+0.4*Math.sin(u*0.4)):0);bset(A,'engine',u>=T_HARV0&&u<T_HARV1?0.04:0);
  if(u>=T_PLANT0&&u<T_PLANT1&&u%9===0)noise(A,T,0.04,0.02,'bandpass',900+Math.random()*400,{q:2});// splashes as seedlings go in
  if(u<T_PLANT1&&u%31===0)tone(A,'sine',420+Math.random()*80,T,0.12,0.02,{to:600,glide:0.08});// frogs and birds
  if(u%57===0&&u<T_HARV0)[0,0.12].forEach(d=>tone(A,'sine',2400+Math.random()*300,T+d,0.08,0.018,{to:2900,glide:0.06}));
  if(crossed(pu,u,860)){[69,72,74,76,79].forEach((m,i)=>tone(A,'triangle',mtof(m),T+i*0.22,0.9,0.035,{wet:0.6}));pad(A,T,[mtof(57),mtof(64),mtof(69)],6,0.025,{ff:1200})}
  if(crossed(pu,u,1110))pad(A,T,[mtof(62),mtof(69),mtof(74)],5,0.02,{ff:900});
  if(crossed(pu,u,T_FLOOD0))noise(A,T,3,0.05,'lowpass',700,{a:0.5})}
SAMPLES.push({id:'paddy',name:'稻田画',w:W,h:H,thumb:1000,
  tags:['每个像素都是一株水稻','五个品种：绿、紫、黄、红、白','只有从观景塔上看才是对的','从田埂上看被压扁','从正上方看被拉长','逐像素投射光线到地面','插秧、生长、起风、成熟、收割、放水'],
  about:'稻田画：一块 120 米宽的稻田里，农民按图纸插下几种颜色的水稻：普通的绿稻、发紫的黑稻、叶子发黄的黄稻、红稻和浅色稻。每一株水稻就是一个像素。图纸是从观景塔上的视角反推出来的，所以只有站在塔上看，画才是对的：一只丹顶鹤飞过太阳，戴草帽的小女孩朝它挥手，旁边是“风调雨顺”。这一季：放水，插秧，秧苗长高，颜色一点点显出来；镜头下到田埂上，画被压扁成一片看不懂的色块，再爬回塔顶，画在最后几米“合”上；起风了，稻浪一层层走过；无人机从正上方看，才发现田里真正种的是一幅被拉长的怪画；秋天全田变金黄，画慢慢淡下去，收割机一趟一趟收完，再放水，回到春天。一圈 72 秒。',
  controls:[SND_CTL,{type:'button',label:'插秧',act(s){s.t=T_PLANT0}},{type:'button',label:'长出来',act(s){s.t=T_PLANT1+40}},{type:'button',label:'田埂上',act(s){s.t=650}},{type:'button',label:'爬上塔',act(s){s.t=730}},{type:'button',label:'稻浪',act(s){s.t=T_WIND0}},{type:'button',label:'正上方',act(s){s.t=1110}},{type:'button',label:'收割',act(s){s.t=T_HARV0}}],
  init(s){sndInit(s)},onOpt(s,k){sndOpt(s,k)},onLeave:sndOff,tick(s){sndTick(s,LOOP,sound)},draw,
  info(s){const t=((s.t%LOOP)+LOOP)%LOOP;const lab=t<T_PLANT0?'放水':t<T_PLANT1?'插秧':t<T_GROW1?'生长':t<T_RIPE0?'夏天':t<T_HARV0?'成熟':t<T_HARV1?'收割':'放水';return '第 '+fl(t/24)+' 秒 / 72 · '+lab}});
})();

// ================= E6. 千机夜空 =================
// a Mid-Autumn drone show over a lake: 1200 drones, each one a single pixel of light in 3D space. They lift off a barge,
// become a rippling sheet, a turning globe, a humpback whale that swims across the sky and dives into the lake, a splash,
// the moon with its rabbit, 中秋快乐, fireworks, and land again. Each drone keeps its identity: shapes are matched by rank so
// the flights between shapes sweep instead of crossing at random. The lake mirrors whatever is low enough to reflect.


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
