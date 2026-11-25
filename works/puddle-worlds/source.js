// SPDX-License-Identifier: MIT
// Copyright (c) 2026 喵老弟 / MarkMFFF

"use strict";
// ================= helpers =================
const fl=Math.floor, rd=Math.round, PI=Math.PI, D2R=PI/180;
const clamp=(v,a,b)=>v<a?a:v>b?b:v;

function L(g,x0,y0,x1,y1,c,th){th=th||1;x0=rd(x0);y0=rd(y0);x1=rd(x1);y1=rd(y1);g.fillStyle=c;
  const dx=Math.abs(x1-x0),sx=x0<x1?1:-1,dy=-Math.abs(y1-y0),sy=y0<y1?1:-1;let e=dx+dy;const o=(th-1)>>1;
  for(let i=0;i<2000;i++){g.fillRect(x0-o,y0-o,th,th);if(x0===x1&&y0===y1)break;const e2=2*e;if(e2>=dy){e+=dy;x0+=sx}if(e2<=dx){e+=dx;y0+=sy}}}

function ring(g,cx,cy,rx,c,ry){ry=ry==null?rx:ry;cx=rd(cx);cy=rd(cy);g.fillStyle=c;const n=Math.max(16,fl((rx+ry)*5));
  for(let i=0;i<n;i++){const a=i/n*2*PI;g.fillRect(cx+rd(Math.cos(a)*rx),cy+rd(Math.sin(a)*ry),1,1)}}

function hash(a,b,c){let h=Math.imul(a|0,374761393)^Math.imul((b|0)+0x9e37,668265263)^Math.imul((c|0)+0x7f4a,1274126177);
  h=Math.imul(h^(h>>>13),1103515245);h^=h>>>16;h=Math.imul(h,0x45d9f3b);h^=h>>>15;return (h>>>0)/4294967296}

const hx=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];

const U=h=>{const a=hx(h);return((255<<24)|(a[2]<<16)|(a[1]<<8)|a[0])>>>0};


const SAMPLES=[];


// ================= creative ideas: shared drawing kit =================
// A frame is painted into a Uint32 framebuffer (exact pixels, no blending), then canvas ops may add strokes on top.
const UC=new Map();function UU(h){let v=UC.get(h);if(v===undefined){v=U(h);UC.set(h,v)}return v}
function FB(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');const im=x.createImageData(w,h);
  return{w,h,c,x,im,d:new Uint32Array(im.data.buffer)}}
function fbPut(F,g){g.putImageData(F.im,0,0)}

// pixel / span / rect in the framebuffer (colours are hex strings or U ints)
const cu=c=>typeof c==='number'?c:UU(c);
function fp(F,x,y,c){x|=0;y|=0;if(x<0||y<0||x>=F.w||y>=F.h)return;F.d[y*F.w+x]=cu(c)}
function fr(F,x,y,w,h,c){c=cu(c);let x0=Math.max(0,fl(x)),y0=Math.max(0,fl(y)),x1=Math.min(F.w,fl(x)+fl(w)),y1=Math.min(F.h,fl(y)+fl(h));for(let j=y0;j<y1;j++)F.d.fill(c,j*F.w+x0,j*F.w+x1)}
function fdisc(F,cx,cy,r,c){c=cu(c);for(let y=-Math.ceil(r);y<=Math.ceil(r);y++){const yy=y;const w=Math.sqrt(Math.max(0,r*r-yy*yy));if(r*r-yy*yy<0)continue;const a=rd(cx-w),b=rd(cx+w);const Y=rd(cy)+y;if(Y<0||Y>=F.h)continue;
  const x0=Math.max(0,a),x1=Math.min(F.w-1,b);if(x1>=x0)F.d.fill(c,Y*F.w+x0,Y*F.w+x1+1)}}
function fell(F,cx,cy,rx,ry,c){c=cu(c);const Y0=Math.ceil(cy-ry),Y1=fl(cy+ry);for(let Y=Y0;Y<=Y1;Y++){if(Y<0||Y>=F.h)continue;const t=(Y+0.5-cy)/ry;if(Math.abs(t)>1)continue;const w=rx*Math.sqrt(1-t*t);const x0=Math.max(0,rd(cx-w)),x1=Math.min(F.w,rd(cx+w));if(x1>x0)F.d.fill(c,Y*F.w+x0,Y*F.w+x1)}}
function fpoly(F,pts,c){c=cu(c);let y0=1e9,y1=-1e9;for(const p of pts){if(p[1]<y0)y0=p[1];if(p[1]>y1)y1=p[1]}
  for(let y=Math.max(0,fl(y0));y<=Math.min(F.h-1,Math.ceil(y1));y++){const yc=y+0.5,xs=[];
    for(let i=0,j=pts.length-1;i<pts.length;j=i++){const a=pts[i],b=pts[j];if((a[1]>yc)!==(b[1]>yc))xs.push(a[0]+(yc-a[1])/(b[1]-a[1])*(b[0]-a[0]))}
    xs.sort((a,b)=>a-b);for(let k=0;k+1<xs.length;k+=2){const xa=Math.max(0,rd(xs[k])),xb=Math.min(F.w,rd(xs[k+1]));if(xb>xa)F.d.fill(c,y*F.w+xa,y*F.w+xb)}}}
function fline(F,x0,y0,x1,y1,c,th){c=cu(c);th=th||1;x0=rd(x0);y0=rd(y0);x1=rd(x1);y1=rd(y1);const dx=Math.abs(x1-x0),sx=x0<x1?1:-1,dy=-Math.abs(y1-y0),sy=y0<y1?1:-1;let e=dx+dy;const o=(th-1)>>1;
  for(let i=0;i<3000;i++){for(let a=0;a<th;a++)for(let b=0;b<th;b++){const X=x0-o+a,Y=y0-o+b;if(X>=0&&Y>=0&&X<F.w&&Y<F.h)F.d[Y*F.w+X]=c}if(x0===x1&&y0===y1)break;const e2=2*e;if(e2>=dy){e+=dy;x0+=sx}if(e2<=dx){e+=dx;y0+=sy}}}
// a thick stroke along a polyline (round-ish: discs at points)
function fstroke(F,pts,c,r){for(let i=0;i+1<pts.length;i++){const a=pts[i],b=pts[i+1],n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])));for(let k=0;k<=n;k++){const t=k/n;fdisc(F,a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,r,c)}}}
// quadratic / cubic point helpers
const qb=(a,b,c,t)=>[(1-t)*(1-t)*a[0]+2*(1-t)*t*b[0]+t*t*c[0],(1-t)*(1-t)*a[1]+2*(1-t)*t*b[1]+t*t*c[1]];
function qpts(a,b,c,n){const o=[];for(let i=0;i<=n;i++)o.push(qb(a,b,c,i/n));return o}
// per-pixel painter over a box: f(x,y) returns colour (string/int) or null to keep
function fpaint(F,x0,y0,x1,y1,f){x0=Math.max(0,fl(x0));y0=Math.max(0,fl(y0));x1=Math.min(F.w,Math.ceil(x1));y1=Math.min(F.h,Math.ceil(y1));
  for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){const c=f(x,y);if(c!=null)F.d[y*F.w+x]=cu(c)}}

const sm=t=>t<0?0:t>1?1:t*t*(3-2*t);
const lerp=(a,b,t)=>a+(b-a)*t;
const seg=(t,a,b)=>clamp((t-a)/(b-a),0,1);
// a capsule limb/finger with outline, base and a light stripe offset toward the light (lx,ly)
function cap(F,pts,r,o,b,l,lx,ly){fstroke(F,pts,o,r+1);fstroke(F,pts,b,r);if(l){const k=r*0.45;fstroke(F,pts.map(p=>[p[0]+lx*k,p[1]+ly*k]),l,Math.max(0.6,r*0.38))}}


// ================= creative ideas: shared sound (from new-frontiers-2 n0_sound.js) =================
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
// a struck bell: inharmonic partials, the low ones ring longest
function bell(A,t0,f,vol,wet){[[0.5,1,7],[1,0.8,5],[1.19,0.55,3.6],[1.5,0.4,3],[2,0.5,2.4],[2.52,0.25,1.6],[2.66,0.2,1.3],[3.01,0.18,1.1],[4.2,0.12,0.7]].forEach(([r,a,d])=>tone(A,'sine',f*r,t0,d,vol*a,{a:0.004,wet:wet==null?0.5:wet}))}
// a plucked string (Karplus-Strong), rendered once per pitch
function pluck(A,t0,f,vol,wet,out){const c=A.ctx,key=Math.round(f*10);let b=A.ks.get(key);if(!b){const sr=c.sampleRate,N=Math.round(sr/f),len=Math.floor(sr*2.8);b=c.createBuffer(1,len,sr);const d=b.getChannelData(0);
    for(let i=0;i<N;i++)d[i]=Math.random()*2-1;d[N]=d[0];for(let i=N+1;i<len;i++)d[i]=0.4985*(d[i-N]+d[i-N-1]);A.ks.set(key,b)}
  const s=c.createBufferSource();s.buffer=b;const g=c.createGain();g.gain.value=vol;s.connect(g);g.connect(out||A.bus);if(wet){const w=c.createGain();w.gain.value=wet;g.connect(w);w.connect(out?A.master:A.rev)}s.start(t0)}

const mtof=m=>440*Math.pow(2,(m-69)/12);

// ================= 1. 一生如圆 : a life told in match cuts; the same circle survives every cut =================


// ================= 2. 放大镜下的早餐 : an aerial desert that turns out to be toast seen through a magnifier =================


// ================= 3. 格子外 : a girl climbs out of a comic panel after her balloon =================
// Rule of the piece: inside a panel everything is coloured by that panel's light; in the white gutters between panels
// (outside any story) she, the balloon and the cat are only ink lines on paper.


// ================= 4. 手影 : hand shadows on a bedroom wall that run away on their own =================


// ================= 5. 画中画 : a painter painting the room he is in; the camera falls into the canvas forever =================
// Every level is the same room drawn from vector shapes through a transform, so it stays crisp at any zoom.
// Each level inward is one season later; after four levels the picture is back where it began.


// ================= 6. 活拼图 : only the pieces already put in place are alive =================


// ================= 7. 水洼倒影 : the puddles on a rainy street reflect a different street =================
// Two worlds share one street: a cold rainy night and a lantern festival with a whale in the air.
// Each puddle shows the OTHER world (background mirrored about the building line, people about their feet).
// A girl jumps into the big puddle, the camera tilts down into it, the picture turns over, and we are on the other side.
(function(){
const W=480,H=270,F=FB(W,H);
const GL=196,BO=80,BH=GL+BO,GH=276;// ground line; background buffers hold world rows -80..195, ground buffers rows 196..471
const HALF=720,LOOP=HALF*2,DIVE0=560,DIVE1=690,K0=1.67;// reflections are squashed (seen at a grazing angle)
const pack=(r,g,b)=>(0xff000000|(b<<16)|(g<<8)|r)>>>0;
const mixU=(v,w,a)=>pack(rd((v&255)+((w&255)-(v&255))*a),rd(((v>>8)&255)+(((w>>8)&255)-((v>>8)&255))*a),rd(((v>>16)&255)+(((w>>16)&255)-((v>>16)&255))*a));
const mulU=(v,m)=>pack(rd((v&255)*m),rd(((v>>8)&255)*m),rd(((v>>16)&255)*m));
function outl(S,c){c=cu(c);const w=S.w,h=S.h,d=S.d,o=[];for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x;if(d[i])continue;if(x>0&&d[i-1]||x<w-1&&d[i+1]||y>0&&d[i-w]||y<h-1&&d[i+w])o.push(i)}for(const i of o)d[i]=c}
// stepped glow: a few flat rings blended toward a colour (no dither)
function glow(B,cx,cy,r,col,a){col=cu(col);for(let y=fl(cy-r);y<=cy+r;y++)for(let x=fl(cx-r);x<=cx+r;x++){if(x<0||y<0||x>=B.w||y>=B.h)continue;const d=Math.hypot(x+0.5-cx,y+0.5-cy)/r;if(d>=1)continue;const s=d<0.4?1:d<0.7?0.6:0.3;const i=y*B.w+x;B.d[i]=mixU(B.d[i],col,a*s)}}
const yb=y=>y+BO;// world row -> background buffer row
// ------------------------------------------------------------------ the street: five buildings, same outlines in both worlds
const BLD=[[0,96,62],[96,100,92],[196,74,48],[270,118,84],[388,92,66]];
const CAT=x=>[104,113].map((y0,j)=>y0+Math.sin(PI*x/480)*10+j);// two overhead wires (sag)
const PUD=[[70,224,36,6,14,1,18,5],[225,248,70,15,-30,3,36,10],[372,217,30,5,-10,1,14,3],[420,258,42,7,16,-1,22,5],[128,262,26,5,8,1,12,4]];
const PMASK=new Uint8Array(W*GH),WET=new Uint8Array(W*GH);
for(let gy=0;gy<GH;gy++)for(let x=0;x<W;x++){const wy=gy+GL;let m=0,n=0;PUD.forEach((p,i)=>{const e=(a,b,c,d)=>((x+0.5-a)/c)**2+((wy+0.5-b)/d)**2;const v=Math.min(e(p[0],p[1],p[2],p[3]),e(p[0]+p[4],p[1]+p[5],p[6],p[7]));if(v<1)m=i+1;else if(v<1.5)n=1});PMASK[gy*W+x]=m;WET[gy*W+x]=n}
// ------------------------------------------------------------------ static backgrounds
const BG=[FB(W,BH),FB(W,BH)],BGS=[FB(W,BH),FB(W,BH)],GND=[FB(W,GH),FB(W,GH)];
function winGrid(B,b,f){const[x0,w,top]=b;for(let fy=GL-46-34;fy>top+6;fy-=34){const n=w>100?3:2,gap=w/n;for(let k=0;k<n;k++)f(rd(x0+gap*k+gap/2-6),fy-6+BO+0,fy)}}
function paint0(){const B=BGS[0];
  fpaint(B,0,0,W,BH,(x,y)=>{const wy=y-BO;return wy<-30?'#0e1219':wy<10?'#121720':wy<50?'#171d27':'#1c232e'});
  // low cloud and a far skyline in the haze
  for(const[x,y,rx,ry]of [[60,-60,90,10],[300,-50,120,9],[420,-10,70,7],[150,0,80,6]])fell(B,x,yb(y),rx,ry,'#141a23');
  for(let x=0;x<W;x+=14){const h=20+fl(hash(x,2,1)*30);fr(B,x,yb(70-h),14,h+40,'#161c25');if(hash(x,3,1)<0.4)fr(B,x+4,yb(78-h+fl(hash(x,4,1)*10)),2,2,'#3a4a5a')}
  BLD.forEach((b,i)=>{const[x,w,top]=b,wall=['#2b313b','#30363f','#272d37','#323843','#2a303a'][i];fr(B,x,yb(top),w,GL-top,wall);fr(B,x+w-2,yb(top),2,GL-top,'#1f242c');fr(B,x,yb(top),w,3,'#3b424e');fr(B,x,yb(top)+3,w,1,'#1d2229');
    for(let fy=GL-46;fy>top+10;fy-=34)fr(B,x,yb(fy),w,2,'#242a33');
    winGrid(B,b,(wx,_,fy)=>{const lit=hash(wx,fy,5)<0.28;fr(B,wx-1,yb(fy-8),14,16,'#1a1f27');fr(B,wx,yb(fy-7),12,14,lit?'#6f93ab':'#1f262f');
      if(lit){for(let k=0;k<14;k+=3)fr(B,wx,yb(fy-7)+k,12,1,'#58788e')}else{fp(B,wx+8,yb(fy-6),'#2c3540');fp(B,wx+9,yb(fy-6),'#2c3540');fp(B,wx+10,yb(fy-5),'#2c3540')}
      if(hash(wx,fy,9)<0.5){fr(B,wx+1,yb(fy+9),10,5,'#46505c');fr(B,wx+1,yb(fy+9),10,1,'#56616e');for(let k=0;k<4;k++)fp(B,wx+3+k*2,yb(fy+11),'#2e353f')}})
    // ground floors: shutters, a convenience store, a vending machine
    const sy=yb(GL-44);
    if(i===3){fr(B,x+6,sy-8,w-12,8,'#2a9aa4');fr(B,x+6,sy-5,w-12,2,'#bfeef0');fr(B,x+6,sy,w-12,44,'#bcd6dc');for(let k=0;k<4;k++){fr(B,x+12+k*26,sy+8,20,30,'#8fb0b8');for(let r=0;r<5;r++)fr(B,x+13+k*26,sy+10+r*6,18,3,['#c87a6a','#d8c27a','#7aa8c8','#9ac08a','#c89ab8'][(r+k)%5])}fr(B,x+56,sy+4,22,40,'#dff0f2');fr(B,x+66,sy+4,1,40,'#8fb0b8')}
    else{fr(B,x+4,sy,w-8,44,'#3a414b');for(let k=0;k<44;k+=3)fr(B,x+4,sy+k,w-8,1,'#2f353e');fr(B,x+4,sy-3,w-8,3,'#22272f');
      if(i===1){fr(B,x+62,sy+18,14,26,'#9cc0e4');fr(B,x+63,sy+19,12,9,'#d8ecff');for(let r=0;r<3;r++)for(let c=0;c<4;c++)fr(B,x+64+c*3,sy+30+r*4,2,3,['#e85a5a','#5ab0e8','#f0d050','#7ad07a'][(r+c)%4]);fr(B,x+63,sy+42,12,1,'#5a7090')}
      if(i===2){fr(B,x+w-12,yb(GL-120),8,60,'#232930');for(let k=0;k<4;k++)fr(B,x+w-10,yb(GL-114)+k*14,4,8,'#3a424c')}}})
  // utility pole
  fr(B,262,yb(58),4,GL-58,'#1b2027');fr(B,252,yb(70),24,2,'#1b2027');fr(B,266,yb(80),6,10,'#262c34');
  for(let x=0;x<W;x++)for(const y of CAT(x))fp(B,x,yb(y),'#0b0e13')}
function paint1(){const B=BGS[1];
  fpaint(B,0,0,W,BH,(x,y)=>{const wy=y-BO;return wy<-40?'#0d0f33':wy<0?'#141444':wy<36?'#1f1852':wy<70?'#2e1c58':'#43225a'});
  for(let i=0;i<180;i++){const x=fl(hash(i,1,7)*W),y=fl(hash(i,2,7)*170)-80;fp(B,x,yb(y),hash(i,3,7)<0.2?'#fff4d8':'#9a96d8')}
  fdisc(B,70,yb(-44),13,'#f8ecc8');fdisc(B,76,yb(-48),11,'#1a1648');// crescent
  // far roofs in silhouette with a pagoda
  for(let x=0;x<W;x+=16){const h=18+fl(hash(x,2,1)*24);fr(B,x,yb(74-h),16,h+40,'#251a44');fpoly(B,[[x-2,yb(74-h)],[x+8,yb(68-h)],[x+18,yb(74-h)]],'#251a44')}
  {const x=346;for(let k=0;k<4;k++){const y=34+k*10,w=26-k*5;fpoly(B,[[x-w-4,yb(y+2)],[x,yb(y-5)],[x+w+4,yb(y+2)]],'#2a1d4a');fr(B,x-w+4,yb(y+2),2*w-8,7,'#2a1d4a')}fr(B,x,yb(14),1,14,'#2a1d4a')}
  BLD.forEach((b,i)=>{const[x,w,top]=b,wall=['#3d2622','#46291f','#3a2420','#4a2c24','#40261f'][i];fr(B,x,yb(top+6),w,GL-top-6,wall);fr(B,x+w-2,yb(top),2,GL-top,'#2a1814');
    // tiled roof with upturned eaves
    fpoly(B,[[x-4,yb(top+8)],[x+3,yb(top+1)],[x+w-3,yb(top+1)],[x+w+4,yb(top+8)],[x+w+1,yb(top+10)],[x-1,yb(top+10)]],'#2a2030');for(let k=x;k<x+w;k+=4)fr(B,k,yb(top+2),1,7,'#3c3044');fr(B,x-4,yb(top+8),w+8,1,'#5a4a5a');fp(B,x-5,yb(top+6),'#5a4a5a');fp(B,x+w+4,yb(top+6),'#5a4a5a');
    for(let fy=GL-46;fy>top+10;fy-=34){fr(B,x,yb(fy),w,2,'#2a1814');fr(B,x-2,yb(fy)-1,w+4,1,'#5a3a2a')}
    winGrid(B,b,(wx,_,fy)=>{fr(B,wx-1,yb(fy-8),14,16,'#2a1814');fr(B,wx,yb(fy-7),12,14,hash(wx,fy,5)<0.8?'#f2bf72':'#c88848');for(let k=0;k<12;k+=4)fr(B,wx+k,yb(fy-7),1,14,'#8a4c2a');fr(B,wx,yb(fy-1),12,1,'#8a4c2a');
      if(hash(wx,fy,6)<0.3){fr(B,wx+3,yb(fy-5),4,10,'#a8683a');fdisc(B,wx+5,yb(fy-6),2,'#a8683a')}})
    // ground floors open as stalls with curtains
    const sy=yb(GL-44);fr(B,x+4,sy,w-8,44,'#ffc878');fr(B,x+4,sy+30,w-8,14,'#e89a50');fr(B,x+4,sy+30,w-8,1,'#b86a30');
    const nc=['#2a3a7a','#b8342e','#2a3a7a','#4a6a3a','#6a2a5a'][i];for(let k=x+6;k<x+w-6;k+=10){fr(B,k,sy-2,9,16,nc);fr(B,k,sy+13,9,1,'#1a1830')}fdisc(B,x+w/2,sy+5,3,'#f4e8d8');fr(B,x+4,sy-4,w-8,2,'#2a1814');
    for(let k=0;k<fl((w-16)/12);k++){const gx=x+10+k*12;fr(B,gx,sy+24,8,6,['#f4e0c0','#e86a5a','#f0c040','#8ac06a'][(k+i)%4]);fr(B,gx,sy+24,8,1,'#fff4e0')}
    if(i===3){fr(B,x+56,sy+22,30,4,'#b8342e');fr(B,x+58,sy+26,2,18,'#5a2a1a');fr(B,x+82,sy+26,2,18,'#5a2a1a')}
    if(i===1){fr(B,x+64,yb(GL-30),10,30,'#8a8078');fr(B,x+60,yb(GL-34),18,4,'#6a6058');fr(B,x+65,yb(GL-28),8,8,'#ffd890')}
    if(i===2){fr(B,x+w-12,yb(GL-120),8,60,'#f0e4d0');for(let k=0;k<4;k++)fr(B,x+w-10,yb(GL-114)+k*14,4,8,'#b8342e')}})
  fr(B,262,yb(58),4,GL-58,'#2c1a14');fr(B,252,yb(70),24,2,'#2c1a14');
  for(let x=0;x<W;x++)for(const y of CAT(x))fp(B,x,yb(y),'#1a1018')}
function ground(G,wd){const ramp=wd?['#33262a','#382a2c','#22181c']:['#20252c','#23282f','#171b21'];
  let y=0,h=3,r=0;while(y<GH){for(let x=0;x<W;x++){const tw=h*4,off=(r%2)*tw/2;const j=((x+off)%tw)<1;for(let k=0;k<h&&y+k<GH;k++)G.d[(y+k)*W+x]=UU(k===0||j?ramp[2]:ramp[(fl((x+off)/tw)+r)%2])}y+=h;r++;h=Math.min(22,h+1)}
  fr(G,0,0,W,2,wd?'#1c1214':'#11141a');
  // light spilled from shop fronts in flat bands
  const spill=wd?[[0,480,'#ffb060',0.12]]:[[276,382,'#7ad8e0',0.14],[156,174,'#9cc0e4',0.1]];
  for(const[x0,x1,c,a]of spill)for(let gy=0;gy<44;gy++)for(let x=x0-fl(gy/4);x<x1+fl(gy/4);x++){if(x<0||x>=W)continue;const s=gy<10?1:gy<24?0.55:0.25;const i=gy*W+x;G.d[i]=mixU(G.d[i],UU(c),a*s)}
  if(!wd)for(let x=280;x<378;x+=7)for(let gy=4;gy<48;gy++)if((gy+x)%3)G.d[gy*W+x]=mixU(G.d[gy*W+x],UU('#7ad8e0'),0.22*(1-gy/48));
  for(let i=0;i<W*GH;i++)if(WET[i])G.d[i]=mulU(G.d[i],0.8)}
paint0();paint1();ground(GND[0],0);ground(GND[1],1);
// ------------------------------------------------------------------ the whale, hand-shaped, drawn into its own sprite
const WH=FB(150,64);
function whale(fl_){const S=WH;S.d.fill(0);const o=(p)=>p.map(([x,y])=>[x+8,y+24]);const a=fl_;
  fpoly(S,o([[112,0],[124,-9+a],[136,-13+a],[130,-3+a],[137,8+a],[125,6+a],[113,2]]),'#26305e');
  fpoly(S,o([[0,2],[6,-6],[18,-12],[36,-15],[58,-14],[78,-10],[94,-5],[106,-1],[114,1],[106,5],[90,9],[70,13],[48,15],[26,14],[10,10],[2,6]]),'#2a3468');
  fpoly(S,o([[6,-6],[18,-12],[36,-15],[58,-14],[78,-10],[94,-5],[78,-7],[58,-11],[36,-12],[18,-9]]),'#3c4a8c');
  fpoly(S,o([[2,6],[10,10],[26,14],[48,15],[70,13],[90,9],[70,10],[48,11],[26,10],[10,7]]),'#8a9ac8');
  for(let k=0;k<4;k++)fline(S,10+k*2+8,24+7+k,38+k*4+8,24+11+k,'#6a7aac');
  for(const[x,y]of [[4,-2],[8,-5],[12,-1],[22,-11],[30,-12],[60,-12]])fp(S,x+8,y+24,'#6a7aac');
  fpoly(S,o([[30,10],[40,12],[54,28-a],[48,30-a],[34,16]]),'#26305e');fline(S,30+8,10+24,48+8,30-a+24,'#a8b8e0');
  fp(S,14+8,2+24,'#0a0c22');fp(S,15+8,1+24,'#c8d0ff');outl(S,'#120e2a')}
// ------------------------------------------------------------------ people: each world has its own version on the same path
const SA=FB(48,62),SK=FB(32,40),SC=FB(34,22);SA.fx=24;SA.fy=58;SK.fx=16;SK.fy=37;SC.fx=17;SC.fy=19;
function legs(S,x,hy,fy,ph,c,o,shoe,amp){const a=Math.sin(ph*2*PI)*amp;cap(S,[[x,hy],[x-a,fy-1]],1.5,o,c);cap(S,[[x,hy],[x+a,fy-1]],1.5,o,c);fr(S,rd(x-a)-1,fy-1,4,2,shoe);fr(S,rd(x+a)-1,fy-1,4,2,shoe)}
function adult(w,ph){const S=SA;S.d.fill(0);const b=Math.abs(Math.sin(ph*2*PI))>0.7?1:0;
  if(!w){// a tired office worker under a black umbrella, briefcase
    legs(S,24,40,58,ph,'#2a2e38','#2a2e38','#15171c',4.5);
    fpoly(S,[[19,21+b],[29,21+b],[31,45],[17,45]],'#4a5260');fpoly(S,[[19,21+b],[22,21+b],[20,45],[17,45]],'#3c4350');fr(S,18,33,12,1,'#363c47');fr(S,25,22+b,1,10,'#3c4350');
    fdisc(S,25,16+b,4,'#c49a86');fr(S,21,12+b,8,3,'#2a2420');fp(S,28,16+b,'#2a2020');
    cap(S,[[22,24+b],[29,28],[28,22]],1.6,'#3c4350','#4a5260');fr(S,28,4,1,22,'#15171c');fr(S,28,25,2,2,'#15171c');
    fr(S,30,34+b,8,7,'#3a2a22');fr(S,30,34+b,8,1,'#5a4232');fr(S,33,32+b,2,2,'#3a2a22');
    for(let y=0;y<9;y++){const hw=17*Math.sqrt(1-((8-y)/9)**2);fr(S,rd(28-hw),y+1,rd(2*hw),1,y<3?'#353a46':'#23262e')}
    for(const x of [12,20,28,36,44])fr(S,x-1,9+(x===28?1:0),2,1,'#15171c');for(const x of [16,24,32,40])fp(S,x,8,'#3a3f4c');
    outl(S,'#0c0e13');for(const x of [11,45])if((ph*4|0)%2)fp(S,x,12,'#7a8aa0')}
  else{// a girl in a festival kimono and fox mask under a red paper umbrella, carrying a lantern
    fr(S,21,52,3,5,'#f4f0e8');fr(S,25,52,3,5,'#f4f0e8');fr(S,20,57,4,1,'#5a3a2a');fr(S,25,57,4,1,'#5a3a2a');
    fpoly(S,[[19,21+b],[29,21+b],[30,54],[18,54]],'#2a3a7a');for(let k=0;k<9;k++)fp(S,20+fl(hash(k,1,4)*9),25+fl(hash(k,2,4)*27),'#e8e4f0');
    fr(S,18,31+b,12,5,'#d84a3a');fr(S,18,33+b,12,1,'#f0b040');fpoly(S,[[18,24+b],[14,26+b],[14,38],[19,36]],'#22306a');
    fdisc(S,25,16+b,4,'#1a1418');fdisc(S,21,13+b,2.5,'#1a1418');fpoly(S,[[25,13+b],[30,15+b],[31,17+b],[26,19+b]],'#f4f0e8');fp(S,28,15+b,'#d8342e');fp(S,29,17+b,'#d8342e');fp(S,26,12+b,'#f4f0e8');fp(S,27,11+b,'#d8342e');
    cap(S,[[22,24+b],[29,28],[28,22]],1.6,'#22306a','#2a3a7a');fr(S,28,5,1,21,'#5a3a2a');
    for(let y=0;y<7;y++){const hw=18*Math.sqrt(1-((6-y)/7)**2);fr(S,rd(28-hw),y+2,rd(2*hw),1,y<2?'#e8704e':'#c8443a')}
    for(let k=-4;k<=4;k++)fline(S,28,2,28+k*4.2,8,'#f0b060');fr(S,10,8,37,1,'#8a2a22');
    cap(S,[[18,26+b],[16,34+b]],1.4,'#22306a','#2a3a7a');fline(S,15,35+b,15,39+b,'#5a3a2a');fell(S,15,43+b,3,3.5,'#ffb050');fr(S,13,40+b,5,1,'#2a1a10');fr(S,13,46+b,5,1,'#2a1a10');fp(S,15,43+b,'#fff0c0');
    outl(S,'#1a0e14')}}
function kid(w,pose,ph){const S=SK;S.d.fill(0);const cr=pose==='crouch'?3:0;const bd=cr;
  const coat='#f0c030',cs='#c8961c';
  if(pose==='jump'){cap(S,[[14,29],[12,33]],1.6,'#b8342a','#d0402a');cap(S,[[18,29],[20,32]],1.6,'#b8342a','#d0402a')}
  else if(pose==='walk')legs(S,16,30,38,ph,'#d0402a','#b8342a','#8a2a20',2.5);
  else{fr(S,12,31+cr,3,6-cr,'#d0402a');fr(S,17,31+cr,3,6-cr,'#d0402a');fr(S,12,31+cr,3,1,'#e8604a');fr(S,17,31+cr,3,1,'#e8604a')}
  fpoly(S,[[11,15+bd],[21,15+bd],[23,32],[9,32]],coat);fpoly(S,[[11,15+bd],[13,15+bd],[11,32],[9,32]],cs);fr(S,15,18+bd,1,13,cs);fp(S,17,20+bd,'#8a6a18');fp(S,17,24+bd,'#8a6a18');fp(S,17,28+bd,'#8a6a18');
  const hx=pose==='look'?18:pose==='up'?16:17,hy=(pose==='look'?12:pose==='up'?9:10)+bd;
  if(!w){fdisc(S,hx-1,hy,6,coat);fdisc(S,hx-3,hy,4,cs);fdisc(S,hx+1,hy+1,3.2,'#f2d0b0');fp(S,hx+2,hy+(pose==='look'?2:pose==='up'?0:1),'#2a1a1a');fr(S,hx-1,hy-5,6,1,'#f8dc60')}
  else{fdisc(S,hx-1,hy,5,'#1a1418');fdisc(S,hx+1,hy+1,3.4,'#f2d0b0');fr(S,hx-2,hy-4,6,3,'#1a1418');fr(S,hx-6,hy-1,3,6,'#1a1418');fp(S,hx+2,hy+(pose==='look'?2:1),'#2a1a1a');fp(S,hx+3,hy+3,'#e88a7a');fdisc(S,13,16+bd,3,coat)}
  if(pose==='wave'){cap(S,[[19,17],[23,10],[24,4]],1.5,cs,coat);fdisc(S,24,4,1.5,'#f2d0b0')}
  else cap(S,[[19,17+bd],[21,24+bd],[21,27+bd]],1.5,cs,coat);
  if(w){fell(S,24,30+bd,3.5,3,'#f4f0e8');fp(S,22,27+bd,'#e85a5a');fp(S,24,27+bd,'#e85a5a');fp(S,25,29+bd,'#d8342e');fp(S,24,30+bd,'#ffd890')}
  outl(S,w?'#1a0e14':'#0c0e13')}
function cat(w,ph){const S=SC;S.d.fill(0);const a=Math.sin(ph*2*PI)*2;
  if(!w){const c='#3a3e48';for(const[x,s]of [[11,1],[13,-1],[20,-1],[22,1]])fline(S,x,13,rd(x+a*s),18,c);fell(S,16,11,7,3.5,c);fdisc(S,24,9,3.2,c);fpoly(S,[[22,7],[22,4],[24,6]],c);fpoly(S,[[25,6],[27,4],[27,8]],c);fstroke(S,qpts([9,10],[4,8],[5,2],6),c,1);fp(S,25,9,'#c8d040');outl(S,'#0c0e13')}
  else{const c='#f2ece2';for(const[x,s]of [[11,1],[13,-1],[20,-1],[22,1]])fline(S,x,13,rd(x+a*s),18,'#2a1a14');fell(S,16,11,7,3.5,c);fell(S,16,13,6,1.5,'#d8ccc0');fdisc(S,24,9,3.2,c);fpoly(S,[[27,9],[31,10],[27,11]],c);fpoly(S,[[22,7],[22,3],[25,6]],'#e07a3a');fpoly(S,[[25,6],[27,3],[27,8]],'#e07a3a');
    fell(S,6,7,5,3,c);fell(S,3,4,3,2.5,'#ffcc60');fp(S,1,3,'#fff4c0');fp(S,26,9,'#d8342e');outl(S,'#1a0e14')}}
// paths in half-time h (both worlds follow the same timing; only the bodies differ)
function actors(h,w,prim){const L=[];
  if(h>=200&&h<460)L.push({S:'C',x:510-(h-200)*2.07,fy:215,ph:h/9,dir:-1});
  if(h>=110&&h<560)L.push({S:'A',x:-30+(h-110)*1.25,fy:236,ph:h*1.25/24,dir:1});
  let k=null;
  if(h<100)k={x:214,fy:248,pose:h>=40?'up':'stand'};
  else if(h<260){const q=h-100;k={x:214+q*1.8,fy:lerp(248,233,Math.min(1,q/20)),pose:'walk',ph:q/10}}
  else if(h>=300&&h<430)k={x:-20+(h-300)*1.692,fy:233,pose:'walk',ph:h/10};
  else if(h>=430&&h<470)k={x:200,fy:233,pose:'look'};
  else if(h>=470&&h<478)k={x:200,fy:233,pose:'crouch'};
  else if(h>=478&&h<500){const q=(h-478)/22;k={x:lerp(200,214,q),fy:lerp(233,248,q),lift:Math.sin(PI*q)*14,pose:'jump'}}
  else if(h>=500&&h<508)k={x:214,fy:248,pose:'crouch'};
  else if(h>=508)k={x:214,fy:248,pose:'look'};
  if(k){if(!prim&&h>=430&&h<470)k.pose='wave';k.S='K';k.dir=1;L.push(k)}
  return L.sort((a,b)=>a.fy-b.fy)}
function sprite(a,w){if(a.S==='A'){adult(w,a.ph);return SA}if(a.S==='K'){kid(w,a.pose,a.ph||0);return SK}cat(w,a.ph);return SC}
// ------------------------------------------------------------------ per-frame background dynamics
function rain(B,t,y0,y1,c,n,up){c=cu(c);for(let i=0;i<n;i++){const x0=hash(i,1,11)*560;let y=(hash(i,2,11)*400+t*9)%(y1-y0+40)-20;if(up)y=(y1-y0)-y;const x=fl(x0-y*0.12);for(let k=0;k<5;k++){const yy=fl(y0+y+k),xx=fl(x-k*0.12+(up?0:0));if(yy>=0&&yy<B.h&&xx>=0&&xx<W)B.d[yy*W+xx]=c}}}
function dyn(t,showRain0){const B0=BG[0],B1=BG[1];B0.d.set(BGS[0].d);B1.d.set(BGS[1].d);
  // W0: the cold street; a window goes on and off, the pole's lamp buzzes
  {const on=(fl(t/90)%3)!==0;fr(B0,301,yb(GL-75),12,14,on?'#7aa0b8':'#1f262f');if(on)for(let k=0;k<14;k+=3)fr(B0,301,yb(GL-75)+k,12,1,'#5a7a90');
    const fz=hash(fl(t/3),1,9)<0.08;fr(B0,270,yb(80)+10,2,2,fz?'#1f262f':'#d8e8f0');if(!fz)glow(B0,271,yb(91),9,'#a8c8d8',0.25);
    if(showRain0)rain(B0,t,0,BH,'#4a5868',150,false)}
  // W1: lanterns on the wires sway, the whale swims, sky lanterns rise
  {for(let i=0;i<5;i++){const x=(fl(t*0.25)+i*137)%640-80,y=-70+((t*0.35+i*61)%300);const yy=yb(150-((t*0.3+i*73)%240));const xx=((i*97+t*0.05)%W+W)%W;fr(B1,fl(xx),yy,3,4,'#ffb050');fp(B1,fl(xx)+1,yy+1,'#fff0c0');glow(B1,xx+1.5,yy+2,6,'#ff9a50',0.3)}
    for(let n=0,x=10;x<W;x+=22,n++){const sw=Math.sin(t*0.08+x*0.3)*1.2;for(const[j,y]of CAT(x).entries()){if((n+j)%2)continue;const lx=rd(x+sw),ly=yb(rd(y))+2;fr(B1,lx,ly-1,1,2,'#1a1018');glow(B1,lx+0.5,ly+4,8,'#ff7040',0.28);fell(B1,lx+0.5,ly+4,3,3.5,'#e04a30');fr(B1,lx-1,ly+2,3,4,'#ff9a50');fp(B1,lx,ly+3,'#fff0b0');fr(B1,lx-2,ly+1,5,1,'#1a1018');fr(B1,lx-2,ly+8,5,1,'#1a1018')}}
    const h=t%HALF,wx=420-h*0.9,wy=118+Math.sin(t*0.02)*5;whale(rd(Math.sin(t*0.07)*5));
    for(let y=0;y<WH.h;y++)for(let x=0;x<WH.w;x++){const v=WH.d[y*WH.w+x];if(!v)continue;const X=fl(wx)+x,Y=yb(fl(wy))+y-24;if(X>=0&&X<W&&Y>=0&&Y<BH)B1.d[Y*W+X]=v}
}}
// ------------------------------------------------------------------ one view: primary world A, puddles showing world 1-A
const RA=new Uint32Array(W*GH),RIP=new Uint8Array(W*GH),MK=new Uint8Array(W*GH);const touched=[];
function ring(cx,cy,r,a){const n=Math.max(12,fl(r*7));for(let i=0;i<n;i++){const th=i/n*2*PI;for(const[rr,v]of [[r,2],[r-1.2,1]]){if(rr<0.5)continue;const x=rd(cx+Math.cos(th)*rr),wy=rd(cy+Math.sin(th)*rr*0.3);const gy=wy-GL;if(x<0||x>=W||gy<0||gy>=GH)continue;const i2=gy*W+x;if(!MK[i2])continue;if(!RIP[i2])touched.push(i2);RIP[i2]=Math.max(RIP[i2],v===2&&a>0.5?2:1)}}}
function view(O,A,oy,h,t,p){const BA=BG[A],BB=BG[1-A],GA=GND[A],k=lerp(K0,1,p||0);
  // mask: static puddles, plus the big one growing while the camera dives
  MK.set(PMASK);if(p>0){const q=p*p,pd=PUD[1],rx=pd[2]*(1+9*q),ry=pd[3]*(1+40*q);const gy0=0,gy1=Math.min(GH,fl(pd[1]+ry)-GL+1);for(let gy=gy0;gy<gy1;gy++){const wy=gy+GL,t2=((wy+0.5-pd[1])/ry);if(Math.abs(t2)>=1)continue;const hw=rx*Math.sqrt(1-t2*t2);for(let x=Math.max(0,fl(pd[0]-hw));x<Math.min(W,Math.ceil(pd[0]+hw));x++)MK[gy*W+x]=2}}
  // the other world's people, upside down under their own feet
  RA.fill(0);for(const a of actors(h,1-A,false)){const S=sprite(a,1-A),fy=rd(a.fy-(a.lift||0)*0),x0=rd(a.x);if(a.lift)continue;
    for(let gy=fy-GL;gy<GH;gy++){const wy=gy+GL,sy=S.fy-rd((wy-fy)*k);if(sy<0)break;if(gy<0)continue;for(let sx=0;sx<S.w;sx++){const v=S.d[sy*S.w+sx];if(!v)continue;const X=x0+(a.dir<0?S.fx-sx:sx-S.fx);if(X>=0&&X<W)RA[gy*W+X]=v}}}
  // ripples: rain on world 0's puddles, the splash, footsteps
  for(const i of touched)RIP[i]=0;touched.length=0;
  if(A===0)PUD.forEach((pd,i)=>{for(let f=t-16;f<=t;f++){if(hash(i,f,3)>pd[2]/260)continue;const u=hash(i,f,4)*2*PI,rr=Math.sqrt(hash(i,f,5))*0.8;ring(pd[0]+Math.cos(u)*rr*pd[2],pd[1]+Math.sin(u)*rr*pd[3],(t-f)*0.55+0.5,1-(t-f)/16)}});
  for(const s0 of [500,505,511,519])if(h>=s0&&h<s0+60){const age=h-s0;ring(216,250,age*0.9+1,1-age/60)}
  if(h>=110&&h<560)for(let f=h-12;f<=h;f++){if(fl(f*1.25/12)===fl((f-1)*1.25/12))continue;const x=-30+(f-110)*1.25;ring(x+((fl(f*1.25/12)%2)?3:-3),236,(h-f)*0.7+1,1-(h-f)/12)}
  const tint=UU(A===0?'#141c28':'#2a1a2c'),hi=UU(A===0?'#a8bcd0':'#ffd8a0'),rim=UU(A===0?'#56647a':'#c08a68'),sky0=BB.d[0];
  for(let y=0;y<H;y++){const wy=y+oy;
    if(wy<GL){O.d.set(BA.d.subarray(yb(wy)*W,yb(wy)*W+W),y*W);continue}
    const gy=wy-GL;for(let x=0;x<W;x++){const i=gy*W+x;if(!MK[i]){O.d[y*W+x]=GA.d[i];continue}
      const r=RIP[i],sgy=r===1?Math.max(0,gy-2):gy,sw=sgy+GL;let v=RA[sgy*W+x];if(!v){const rb=yb(rd(GL-(sw-GL)*k));v=rb<0?sky0:BB.d[rb*W+x]}
      v=mixU(mulU(v,0.94),tint,0.1);if(r===2)v=mixU(v,hi,0.4);else if(gy>0&&!MK[i-W])v=mixU(v,rim,0.45);O.d[y*W+x]=v}}}
function blitA(O,a,A,oy){const S=sprite(a,A),fy=rd(a.fy-(a.lift||0))-oy,x0=rd(a.x);for(let sy=0;sy<S.h;sy++){const Y=fy+sy-S.fy;if(Y<0||Y>=H)continue;for(let sx=0;sx<S.w;sx++){const v=S.d[sy*S.w+sx];if(!v)continue;const X=x0+(a.dir<0?S.fx-sx:sx-S.fx);if(X>=0&&X<W)O.d[Y*W+X]=v}}}
const FE=FB(W,H),FU=FB(W,H);
function scene(O,A,h,t){const p=h>=DIVE0?sm(Math.min(1,(h-DIVE0)/(DIVE1-DIVE0))):0;const oy=h<60?rd(-73*(1-sm(h/60))):rd(196*p);
  view(O,A,oy,h,t,p);for(const a of actors(h,A,true))blitA(O,a,A,oy);
  // splash droplets
  if(h>=500&&h<524)for(let i=0;i<18;i++){const q=(h-500)/24,vx=(hash(i,1,13)-0.5)*3.2,vy=-2.2-hash(i,2,13)*2.4;const x=216+vx*q*24,y=248+(vy*q*24+0.5*0.32*(q*24)**2)-oy;fp(O,x,y,A===0?'#9ab0c8':'#ffd8a0');if(i%3===0)fp(O,x,y-1,A===0?'#6a7a90':'#e8a070')}
  if(A===0)rain(O,t,0,H,'#56657a',140,false)}
function draw(s,g){const t=((s.t%LOOP)+LOOP)%LOOP,A=fl(t/HALF),h=t%HALF;
  dyn(t,A===1);
  if(h<DIVE1)scene(F,A,h,t);
  else{// the picture turns over: the reflection we fell into becomes the street we stand in
    const q=(h-DIVE1)/(HALF-DIVE1),c=Math.cos(PI*sm(q));let src;if(c>0){scene(FE,A,DIVE1-1,t);src=FE}else{dyn(t,A===0);scene(FU,1-A,0,t);src=FU}
    const ac=Math.max(0.02,Math.abs(c)),bk=UU('#05060a');for(let y=0;y<H;y++){const sy=rd(135+(y-135)/ac);if(sy<0||sy>=H){F.d.fill(bk,y*W,y*W+W);continue}F.d.set(src.d.subarray(sy*W,sy*W+W),y*W)}
    const e0=rd(135-135*ac),e1=rd(135+135*ac)-1;if(e0>=0)F.d.fill(UU('#e8e0d0'),e0*W,e0*W+W);if(e1<H&&e1>e0)F.d.fill(UU('#e8e0d0'),e1*W,e1*W+W)}
  fbPut(F,g)}
SAMPLES.push({id:'puddle',name:'水洼倒影',w:W,h:H,thumb:440,
  tags:['水洼里映出的是另一条街，不是这一条','人在水洼里的倒影是另一个世界的那个人','雨下在这边，倒影里的雨往上落','鲸鱼只在倒影里游，翻过去之后它就在头顶','镜头沉进水洼，画面翻过来，就到了另一边'],
  about:'下雨的夜里，一条关了门的老街。街上的水洼却映出另一条街：同样的房子，挂满灯笼，屋檐下开着夜市，一头鲸鱼慢慢游过电线。走过去的上班族，在水洼里是一个戴狐狸面具、撑红纸伞的姑娘；一只黑猫，在倒影里是一只尾巴发光的白狐。一个穿黄雨衣的小女孩低头看水洼，水洼里的她在朝她招手。她跳进去，水花溅开，镜头跟着沉进水洼，画面翻了过来——我们站在了灯笼街上，抬头就是那头鲸。这边的水洼里，映着那条下雨的街。再跳一次，又回来了。',
  controls:[SND_CTL,{type:'button',label:'雨夜这边',act(s){s.t=0}},{type:'button',label:'灯笼那边',act(s){s.t=HALF}},{type:'button',label:'跳进水洼',act(s){s.t=fl(((s.t%LOOP)+LOOP)%LOOP/HALF)*HALF+420}}],
  init(s){sndInit(s)},onOpt(s,k){sndOpt(s,k)},onLeave:sndOff,tick(s){sndTick(s,LOOP,sound)},draw,
  info(s){const t=((s.t%LOOP)+LOOP)%LOOP;return (t<HALF?'雨夜这边':'灯笼那边')+' · '+fl((t%HALF)/24)+' 秒'}});
function sound(A,S,u,pu){const at=A.at(),X=x=>crossed(pu,u,x),side=fl(u/HALF),h=u%HALF;
  // the side you stand on is loud; the other side is heard faintly, as if from under the water
  bed(A,'rain','white','bandpass',2400,0.5);bed(A,'rainlo','brown','lowpass',500);bed(A,'fest','triangle','lowpass',700,0.7,110);
  const dv=h>=DIVE0?seg(h,DIVE0,DIVE1):0,here0=side===0?1-dv:dv;
  bset(A,'rain',0.05*here0+0.006,side===0?2400:900,0.5);bset(A,'rainlo',0.07*here0+0.01,null,0.5);bset(A,'fest',0.02*(1-here0)+0.004,side===1?1400:500,0.6);
  const PEN=[62,64,67,69,71,74,76,79];
  if(side===1){if(h%9===0&&hash(fl(h/9),2,5)<0.6)pluck(A,at,mtof(PEN[fl(hash(fl(h/9),3,5)*8)]+12),0.06,0.6);if(h%36===0)noise(A,at,0.12,0.05,'lowpass',180,{brown:true});if(X(150)||X(390))[0,0.4].forEach((d,i)=>tone(A,'sine',[150,190][i],at+d*2,2.4,0.035,{to:[100,140][i],glide:2.2}))}
  else{if(h%30===0&&hash(fl(h/30),4,5)<0.5)pluck(A,at,mtof([50,57,62,65,69][fl(hash(fl(h/30),5,5)*5)]),0.06,0.7);if(h%5===0&&hash(h,1,6)<0.4)tone(A,'sine',1800+hash(h,2,6)*1600,at,0.05,0.008,{to:900})}
  if(X(500)){noise(A,at,0.4,0.16,'lowpass',1600,{to:300});for(let i=0;i<5;i++)tone(A,'sine',1200+i*300,at+0.05+i*0.04,0.08,0.02,{to:600})}
  if(X(DIVE0))noise(A,at,5.2,0.05,'lowpass',2000,{to:200,a:0.8,brown:true});
  if(X(DIVE1+8)){bell(A,at,mtof(side===0?79:74),0.035,0.7);bell(A,at+0.12,mtof(side===0?86:81),0.02,0.7)}}
})();


// ================= d01 鱼缸里的海 : a goldfish tank on a desk is bigger on the inside =================


// ================= d02 红绿灯小人 : the little green man walks out of the pedestrian light =================
// He stays made of LED dots wherever he goes: every body cell is a lamp on a 4 px pitch.


// ================= d03 时针和分针 : two people ride the hands of a tower clock and meet eleven times in twelve hours =================


// ================= d04 雪人的循环 : follow one snowman's water through a year =================
// snowman -> melt -> puddle -> vapour -> its own cloud -> rain -> snow -> the kids build it again


// ================= d05 地铁线路图 : zoom into a dot on the metro map, it is a real train; the girl getting off is looking at that map =================
// Everything is vector, drawn through one camera transform, so the zoom in and the push into the phone stay crisp.


// ================= d06 天气预报 : the icons on the weather map turn into real weather =================


// ================= d07 心电图 : the heartbeat on a monitor becomes mountains, then a calm sea, then a second, tiny heartbeat =================
// Everything stays in one phosphor green ramp, like the monitor.


// ================= d08 加载中 : a tiny worker pushes the progress bar; at 99% it sticks, so they break through =================


// ================= d09 俄罗斯方块城 : the falling pieces are buildings; full rows don't vanish, people move in =================


// ================= d10 月亮是猫 : the moon is a white cat asleep in the sky; the phases are a blanket pulled over it =================


// ================= d11 墨迹测试 : one symmetric ink blot keeps flowing from one answer into the next =================
// The ink is a field of soft blobs on the right half, mirrored; morphing a shape means moving its blobs.


// ================= d12 万花筒 : a mandala that turns out to be the street outside, seen through a girl's toy kaleidoscope =================


// ================= d13 抽屉里的世界 : every drawer of an old dresser holds a little world; the cat travels through them =================


// ================= d14 换台 : every channel spills out of the TV into the living room =================


// ================= d15 时间切片 : one street cut into 24 vertical strips, each strip a different hour of the same day =================


// ================= d16 车窗 : in every tunnel the train window turns into a mirror, and the mirror shows a girl in the empty seat opposite =================


// ================= d17 沙漏城 : the sand that runs down builds a desert city; turn the glass over and the city runs back down into dunes =================


// ================= d18 一张纸 : a sheet's whole life: letter, paper plane, paper boat, pulp, a new sheet, a new letter =================


// ================= d19 掌纹 : a tiny traveller walks the lines of a palm; the life line is a whole life =================


// ================= d20 跷跷板 : the sun and the moon sit on the two ends of a seesaw; whoever goes to sleep weighs their end down =================


// ================= d21 雨伞下 : seen from above, every umbrella hides its own weather =================


// ================= d22 电梯 : every floor the elevator doors open onto another world =================


// ================= d23 日晷 : the gnomon's shadow is a little person who spends the day going round the dial =================


// ================= d24 洗衣机 : behind the porthole of a washing machine is a sea; the lost red sock sails away on it =================


// ================= d25 翻页小人 : the stick man in a textbook's corner flipbook runs off the last page and onto the desk =================


// ================= d26 雾镜 : a smiley drawn on a steamed-up mirror lives as long as the fog does =================


// ================= d27 天花板 : lying in bed, the cracks in the ceiling turn into rivers and the damp stain into a sea =================


// ================= d28 雪地脚印 : nobody is visible; the whole story is told by footprints appearing in fresh snow =================


// ================= d29 窗帘缝 : a strip of sun through the curtains crosses a dark room; whatever it touches comes alive =================


// ================= d30 键盘城 : a keyboard is a little city; what gets typed on it happens to the city =================


// ================= d31 霓虹猫 : a cat made of neon tube can only live inside the signs; between them it runs along the wires =================


// ================= d32 一杯茶 : from above, a cup of tea is a lake with a fisherman; stirring, sugar and drinking are weather =================


// ================= d33 楼窗 : an apartment block at night; the residents switch their lights so the windows draw pictures =================


// ================= d34 山谷回声 : a girl shouts across a canyon; the words fly, bounce back, and the last echo answers =================


// ================= d35 电线五线谱 : five power lines are a staff, the sparrows on them are notes; a girl walking underneath plays them =================


// ================= d36 雨刷 : on a long rainy drive, every sweep of the wiper wipes in a different place, until it wipes in home =================


// ================= d37 气泡 : every big bubble in a glass of soda carries something; when it pops at the top, the thing gets out =================


// ================= d38 冰箱 : the moment the fridge door shuts and the light goes out, the food throws a party =================


// ================= d39 晾衣绳 : washing on a line, and the wind turns it into a puppet show =================


// ================= d40 星座 : the constellations join their dots, come alive and chase each other across the sky =================


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
  const st=newState(d);st.t=d.thumb||40;const tg=c.getContext('2d');tg.imageSmoothingEnabled=false;d.draw(st,tg);
  const tl=document.createElement('span');tl.className='tl';tl.innerHTML=`<span class="k">${i+1}</span>${d.name}`;b.append(c,tl);b.onclick=()=>select(i);$('tabs').appendChild(b)});
new ResizeObserver(()=>{if(S){fit();render()}}).observe(stage);
new IntersectionObserver(es=>{visible=es[0].isIntersecting}).observe(stage);
const start=Math.max(0,SAMPLES.findIndex(d=>'#'+d.id===location.hash));select(start);setPaused(paused);
function loop(now){const dt=Math.min(0.25,(now-last)/1000);last=now;
  if(!paused&&visible){acc+=dt*24*speed;let n=0;while(acc>=1&&n<8){tick();acc-=1;n++}if(n)render()}
  requestAnimationFrame(loop)}
requestAnimationFrame(loop);
