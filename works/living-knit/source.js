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

function hash(a,b,c){let h=Math.imul(a|0,374761393)^Math.imul((b|0)+0x9e37,668265263)^Math.imul((c|0)+0x7f4a,1274126177);
  h=Math.imul(h^(h>>>13),1103515245);h^=h>>>16;h=Math.imul(h,0x45d9f3b);h^=h>>>15;return (h>>>0)/4294967296}
function rng(s){return function(){s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const hx=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];

const U=h=>{const a=hx(h);return((255<<24)|(a[2]<<16)|(a[1]<<8)|a[0])>>>0};


const SAMPLES=[];

const ease=t=>t<0?0:t>1?1:t*t*(3-2*t);


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

// a plucked string (Karplus-Strong), rendered once per pitch
function pluck(A,t0,f,vol,wet,out){const c=A.ctx,key=Math.round(f*10);let b=A.ks.get(key);if(!b){const sr=c.sampleRate,N=Math.round(sr/f),len=Math.floor(sr*2.8);b=c.createBuffer(1,len,sr);const d=b.getChannelData(0);
    for(let i=0;i<N;i++)d[i]=Math.random()*2-1;d[N]=d[0];for(let i=N+1;i<len;i++)d[i]=0.4985*(d[i-N]+d[i-N-1]);A.ks.set(key,b)}
  const s=c.createBufferSource();s.buffer=b;const g=c.createGain();g.gain.value=vol;s.connect(g);g.connect(out||A.bus);if(wet){const w=c.createGain();w.gain.value=wet;g.connect(w);w.connect(out?A.master:A.rev)}s.start(t0)}

const mtof=m=>440*Math.pow(2,(m-69)/12);

// ================= N1. 翻片屏的一夜 =================
// a 72x34 flip-disc departure board in a night station hall. Every frame of the board's 1-bit content is precomputed
// (it contains small simulations), each disc then flips between its old and new face over ~2.5 frames, swept column
// by column the way the driver boards scan. The camera is a pitch (pixels per disc) plus a centre in disc units,
// so the same renderer draws the wide hall shot (2 px per disc) and the macro shots (16+ px per disc).


// ================= N2. 毛衣 =================
// every "pixel" is a knitted stitch, 8x7 screen pixels drawn from a hand-tuned V template with yarn ply, shading and fuzz.
// The panel is knitted row by row from the ribbing up (alternating direction, as in flat knitting), then the Fair Isle
// motifs come alive, then a cat hooks the yarn end and the whole thing unravels from the top. 60 s loop.
(function(){
const W=480,H=270,SW=8,SH=7,COLS=60,ROWS=39,Y0=-3,LOOP=1440;
const ID={red:0,cream:1,navy:2,green:3,gold:4,mint:5,rust:6};
const RAMP=[
  ['#2e0a10','#5e161c','#962428','#c03a34','#de6450','#f0947a'],
  ['#4a3c30','#8a765c','#c8b690','#e6d8b4','#f8eed4','#fffaf0'],
  ['#080a1a','#10162e','#1a2448','#26365e','#344a7a','#4a64a0'],
  ['#0a1e14','#133222','#1e4c32','#2c6a44','#428a56','#6aae74'],
  ['#3a240c','#664414','#9c6c22','#c89434','#e8bc5a','#f8dc90'],
  ['#0e2e28','#16503e','#22785a','#3aa678','#6cd29a','#a8f0c4'],
  ['#2e1006','#5a220c','#924016','#c05e22','#e08844','#f0b47a']].map(r=>r.map(U));
// ---------- stitch template: one 8x7 cell, hand drawn. Digits are this stitch's ramp levels (0 = the gap between loops);
// lowercase letters are the arm tops of the stitch below, which come up behind this one (a=0 ... f=5).
const TPL=["22100211","43200321","15423211","14323211","b142310b","cc3231bb","ccb31cbb"];
const KV=new Int8Array(SW*SH),KO=new Int8Array(SW*SH);
for(let y=0;y<SH;y++)for(let x=0;x<SW;x++){const ch=TPL[y][x];if(ch>='0'&&ch<='9'){KV[y*SW+x]=+ch;KO[y*SW+x]=0}else{KV[y*SW+x]='abcdef'.indexOf(ch);KO[y*SW+x]=1}}
// ---------- motifs ----------
const SPR=a=>a.map(r=>[...r]);
const RD_TOP=SPR(["...........#.#..","..........#.#.#.","..........##.##.","...........###..","...........###..","...........#####","..........###...",".#........##....","..##########....","..##########....","..##########...."]);
const RD_LEG={A:SPR(["..##.......##...",".##.........##..","##...........##."]),B:SPR(["...##....##.....","....##..##......",".....#..#......."]),C:SPR(["..#.#....#.#....","..#.#....#.#....","..#.#....#.#...."])};
const FOX=[SPR(["............#.","...........###","##.........####",".###########...","..########....","..#..#..#.#..."]),SPR(["............#.","...........###","#..........####","############...","..########....",".#.#....#..#.."])];
const TREE=SPR(["....#....","...###...","..#####..","...###...","..#####..",".#######.","..#####..",".#######.","#########","....#...."]);
const SF1=SPR(["#..#..#",".#.#.#.","..###..","#######","..###..",".#.#.#.","#..#..#"]),SF2=SPR(["...#...",".#.#.#.","..###..","###.###","..###..",".#.#.#.","...#..."]);
const STARS=[];{const r=rng(5);for(let i=0;i<26;i++)STARS.push([fl(r()*COLS),11+fl(r()*9),r()*100])}
const FLAKES=[];{const r=rng(8);for(let i=0;i<34;i++)FLAKES.push([r()*COLS,r()*17,0.6+r()*0.6,r()*6])}
// ---------- the design, as a function of "alive" time tau (tau=0 is how it was knitted) ----------
const CG=new Uint8Array(COLS*ROWS);
function design(tau){
  const put=(c,r,id)=>{c=((c%COLS)+COLS)%COLS;if(r>=0&&r<ROWS)CG[r*COLS+c]=id};
  for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){let id=ID.red;
    if(r===1||r===9)id=ID.cream;else if(r===10)id=c%2?ID.gold:ID.red;else if(r>=11&&r<=26)id=ID.navy;else if(r>=27&&r<=29)id=ID.cream;
    else if(r>=31&&r<=34){const k=r-31;if(Math.abs((c%8)-4)<=k)id=ID.cream}else if(r===35)id=ID.green;
    CG[r*COLS+c]=id}
  // snowflake band: the flakes alternate between two drawings, so the band glitters
  const sfk=tau>0&&(fl(tau/18)&1);for(let i=0;i<5;i++){const s=(sfk^(i&1))?SF2:SF1;for(let y=0;y<7;y++)for(let x=0;x<7;x++)if(s[y][x]==='#')put(i*12+3+x,2+y,ID.cream)}
  // aurora: two curtains that drift and ripple once alive
  for(let c=0;c<COLS;c++){const a1=13.2+1.6*Math.sin(c*0.21+tau*0.045)+0.8*Math.sin(c*0.07-tau*0.02),w1=0.55+0.45*Math.sin(c*0.15-tau*0.06);
    const a2=15.6+1.2*Math.sin(c*0.17-tau*0.035+2),w2=0.35+0.35*Math.sin(c*0.11+tau*0.05+1);
    for(let r=11;r<=19;r++){if(Math.abs(r-a1)<w1+0.15||Math.abs(r-a2)<w2*0.9)put(c,r,ID.mint)}}
  for(const [sx,sy,ph] of STARS){const off=tau>0&&hash(sx,sy,fl((tau+ph)/16))<0.2;if(CG[sy*COLS+sx]===ID.navy&&!off)put(sx,sy,ID.cream)}
  // moon with a bite out of it
  for(let y=-3;y<=3;y++)for(let x=-3;x<=3;x++){if(x*x+y*y<=10&&!((x+2)*(x+2)+(y+1)*(y+1)<=6))put(52+x,14+y,ID.cream)}
  // shooting star
  if(tau>420&&tau<440){const k=tau-420;for(let i=0;i<4;i++)put(40-k*1.6+i,11+k*0.5-i*0.3|0,ID.cream)}
  // pine forest with snow on the left of each tier
  for(const tx of [1,13,29,44,55]){for(let y=0;y<10;y++)for(let x=0;x<9;x++)if(TREE[y][x]==='#'){const left=x===0||TREE[y][x-1]!=='#';put(tx+x,17+y,left&&y>1&&y<9?ID.cream:ID.green)}}
  // falling snow (stitch by stitch)
  if(tau>40)for(const [x0,ph,sp,sw] of FLAKES){const yy=11+((tau*sp/6+ph)%16),xx=x0+Math.sin(tau*0.03+sw)*1.5;const c=Math.round(xx),r=fl(yy);if(CG[r*COLS+(((c%COLS)+COLS)%COLS)]===ID.navy)put(c,r,ID.cream)}
  // reindeer: stand while knitted, then gallop across and wrap round, in a loose line
  for(let i=0;i<3;i++){const run=tau>30+i*8;const step=run?fl((tau-30-i*8)/3):0;const x=[4,23,40][i]+step;const ph=run?(fl((tau+i*3)/3)%4):-1;
    const legs=ph<0?RD_LEG.C:[RD_LEG.A,RD_LEG.C,RD_LEG.B,RD_LEG.C][ph];const bob=ph===0?-1:0;const y0=13+bob;
    for(let y=0;y<11;y++)for(let x_=0;x_<16;x_++)if(RD_TOP[y][x_]==='#')put(x+x_,y0+y,ID.cream);
    for(let y=0;y<3;y++)for(let x_=0;x_<16;x_++)if(legs[y][x_]==='#')put(x+x_,y0+11+y,ID.cream)}
  // fox: arrives later, chasing, with little leaps
  if(tau>230){const k=tau-230,x=-16+fl(k/2),ph=fl(k/3)&1,jump=Math.max(0,Math.sin(k*0.09))*2|0;const s=FOX[ph];
    for(let y=0;y<6;y++)for(let x_=0;x_<15;x_++){const ch=s[y][x_];if(ch==='#'){const tail=x_<3;put(x+x_,21+y-jump,tail&&y<2?ID.cream:ID.rust)}}}
}
// ---------- knitting schedule: rows from the bottom (r=38) up, each row faster than the last ----------
const RT=[];{let t=26;for(let k=0;k<ROWS;k++){const d=Math.max(5,Math.round(64*Math.pow(0.8,k)));RT.push([t,d]);t+=d}}
const KNIT_END=RT[ROWS-1][0]+RT[ROWS-1][1],ALIVE=KNIT_END+40,UNR=1150;
// rows knitted / stitches in the current row
function knitState(f){if(f<RT[0][0])return {rows:0,part:0,cur:-1};let k=0;while(k<ROWS-1&&RT[k+1][0]<=f)k++;const [t0,d]=RT[k];const part=Math.min(COLS,Math.floor((f-t0)/d*COLS));
  if(part>=COLS)return {rows:k+1,part:0,cur:-1};return {rows:k,part,cur:k}}
// unravel: rows taken off from the top in jerks, then a zip
const UJ=[[1222,1240,0,2],[1262,1282,2,5],[1302,1320,5,10],[1336,1404,10,ROWS]];
function unravel(f){if(f<UJ[0][0])return 0;let v=0;for(const [a,b,r0,r1] of UJ){if(f>=a)v=f>=b?r1:r0+(r1-r0)*ease((f-a)/(b-a))}return v}
// is stitch (r,c) on the fabric now? (knitted already and not yet pulled out)
function isKnit(r,c,ks,urow_i,upart){
  const done=r>=ROWS-ks.rows||(r===ROWS-1-ks.rows&&ks.cur>=0&&((ks.cur&1)?c<ks.part:(COLS-1-c)<ks.part));
  if(!done)return false;
  if(r<urow_i)return false;
  if(r===urow_i&&upart>0&&((r&1)?(COLS-1-c)<upart*COLS:c<upart*COLS))return false;
  return true}
// ---------- drawing ----------
let IMG=null;
const WOOD=['#1c120c','#24170f','#2c1c12','#352216','#3f291a'].map(U);
const NEED=['#4a2e16','#7a5228','#a87a44','#d0a468','#ecd09a'];
const TABBY=['#24242a','#3c3c44','#5a5a64','#80808a','#acacb6','#d4d4dc'];
function draw(S,g){
  const f=((S.t%LOOP)+LOOP)%LOOP;
  const tau=Math.max(0,f-ALIVE);design(tau);
  const ks=knitState(f),urows=unravel(f),urow_i=fl(urows),upart=urows-urow_i;
  // fabric motion: still while on the needles, breathing gently once it is off them
  const amp=f<ALIVE?0:Math.min(1,(f-ALIVE)/60)*(f>UNR?Math.max(0.35,1-(f-UNR)/200):1);
  if(!IMG)IMG=g.createImageData(W,H);const u=new Uint32Array(IMG.data.buffer);
  const tt=f*0.035;
  const lampX=-60,lampY=-80;
  for(let y=0;y<H;y++){for(let x=0;x<W;x++){
    // fold field z(x,y): two broad diagonal folds and a slow swell
    let zx=0,zy=0,dx=0,dy=0;
    if(amp>0){const a1=x*0.012+y*0.02+tt,a2=x*-0.018+y*0.009+tt*0.7,a3=x*0.006-tt*0.4;
      zx=amp*(5*0.012*Math.cos(a1)+3*-0.018*Math.cos(a2)+4*0.006*Math.cos(a3));zy=amp*(5*0.02*Math.cos(a1)+3*0.009*Math.cos(a2));
      dx=amp*(1.6*Math.sin(a1)+1.0*Math.sin(a2));dy=amp*(2.2*Math.sin(a2+0.5)+1.2*Math.sin(a3))}
    const fx=x+dx,fy=y+dy-Y0;
    const r=fl(fy/SH),c=fl(fx/SW);
    // lamp light from top left, stepped
    const ld=Math.hypot(x-lampX,y-lampY);let lamp=ld<300?1:ld<560?0:-1;
    let col;
    const lx=fl(fx-c*SW),ly=fl(fy-r*SH),ti=ly*SW+lx;const rr=r+KO[ti],cc=((c%COLS)+COLS)%COLS;
    if(rr>=0&&rr<ROWS&&isKnit(rr,cc,ks,urow_i,upart)){const id=CG[rr*COLS+cc];
      const purl=rr>=36&&(cc%4>=2);let v=KV[ti];
      const fold=Math.round(clamp((-zx*1.3-zy*1.6)*4.2,-2,1));
      if(v===0)col=RAMP[id][0];
      else{v+=fold+lamp+(purl?-2:0);
        // fuzz: stray fibre pixels on the loops, fixed per stitch so they do not crawl
        if(v>=2&&hash(cc*8+lx,rr*7+ly,3)<0.03)v+=1;
        col=RAMP[id][clamp(v,1,5)]}}
    else{// wooden table under the lamp
      const plank=fl((y+Math.sin(x*0.004)*6)/46),grain=Math.sin(x*0.05+plank*9+Math.sin(y*0.11+plank)*2.2);let k=2+lamp+(grain>0.86?1:grain<-0.9?-1:0);
      if(((y+Math.round(Math.sin(x*0.004)*6))%46+46)%46===0)k=0;
      col=WOOD[clamp(k,0,4)];
      // shadow of the fabric on the table just above its top edge
      const topRow=ROWS-ks.rows-(ks.cur>=0?1:0);if(f<UNR&&r===topRow-1&&fy-r*SH>SH-3)col=WOOD[0]}
    u[y*W+x]=col}}
  g.putImageData(IMG,0,0);
  // ---- needles, live loops and the yarn while knitting ----
  const ball={x:446,y:-4,r:44};
  let yarnFrom=null;
  if(f<KNIT_END+34){
    const lift=f<KNIT_END?0:ease((f-KNIT_END)/34);
    const topR=ROWS-ks.rows-(ks.cur>=0?1:0);const ny=Math.round(Y0+topR*SH-1-lift*60);
    // left needle lies along the top edge, holding the loops; working needle tip moves with the row
    const curC=ks.cur>=0?((ks.cur&1)?ks.part:COLS-1-ks.part):0;const tipX=ks.cur>=0?curC*SW+((ks.cur&1)?0:SW):(f<RT[0][0]?470:-20);
    needle(g,-10,ny,500,ny,NEED);
    if(f<KNIT_END){const tr=clamp(topR,0,ROWS-1);for(let c=0;c<COLS;c++){const lx=c*SW+4,rp=RAMP[CG[tr*COLS+c]];R(g,lx-3,ny-3,2,6,toHexU(rp[4]));R(g,lx-1,ny-3,1,6,toHexU(rp[2]));R(g,lx+1,ny-3,2,6,toHexU(rp[3]));R(g,lx+3,ny-3,1,6,toHexU(rp[1]))}}
    if(f>=RT[0][0]-10&&f<KNIT_END){const wob=Math.sin(f*0.9)*3;needle(g,tipX+60,ny-46+wob,tipX,ny+3,NEED);yarnFrom=[tipX,ny+2]}}
  // ---- the cat ----
  let paw=null;
  if(f>=UNR){const k=f-UNR;
    // reach in from the top left, bat twice, hook, then pull back in jerks matching the unravel
    let px,py;const pulls=urows/ROWS;
    if(k<40){px=-60+ease(k/40)*180;py=-40+ease(k/40)*112}
    else if(k<70){px=120+Math.sin((k-40)*0.35)*14;py=72-Math.abs(Math.sin((k-40)*0.35))*26}
    else{const jerk=f<1404?Math.sin((f-1222)*0.16)*6:0;px=120-pulls*175+jerk;py=72-pulls*112+jerk*0.6}
    if(f>1404)px-=(f-1404)*4;
    paw={x:px,y:py,claw:k>=60&&k<90}}
  // unravelled yarn: crimped (it remembers the loops) from the unravel point to the paw
  if(paw&&f>=1210&&urows<ROWS+0.01){const r=Math.min(ROWS-1,urow_i);const cpos=upart*COLS;const sx=(r&1)?(COLS-cpos)*SW:cpos*SW,sy=Y0+r*SH+3;
    const rp=RAMP[CG[r*COLS+clamp(fl(cpos),0,COLS-1)]],col=toHexU(rp[4]),col2=toHexU(rp[2]);
    crimp(g,sx,sy,paw.x+30,paw.y+6,col,col2,f)}
  else if(paw&&f<1210){crimp(g,4,Y0+1,paw.x+30,paw.y+6,'#e6d8b4','#8a765c',f,true)}
  // yarn from the working needle to the ball at top right
  if(yarnFrom){const ax=yarnFrom[0],ay=yarnFrom[1];const n=40;let px_=ax,py_=ay;for(let i=1;i<=n;i++){const t=i/n;const x=ax+(ball.x-20-ax)*t,y=ay+(ball.y+30-ay)*t+Math.sin(t*PI)*18;L(g,px_,py_,x,y,'#c03a34');px_=x;py_=y}}
  // the ball of yarn, turning while yarn is drawn off it
  if(f<KNIT_END+60){const spin=f<KNIT_END?f*0.08:KNIT_END*0.08;yball(g,ball.x,ball.y,ball.r,spin)}
  if(paw)drawPaw(g,paw.x,paw.y,paw.claw,f);
}
const toHexU=v=>'#'+[v&255,(v>>8)&255,(v>>16)&255].map(x=>x.toString(16).padStart(2,'0')).join('');
function needle(g,x0,y0,x1,y1,ramp){const n=Math.ceil(Math.hypot(x1-x0,y1-y0));const ux=(x1-x0)/n,uy=(y1-y0)/n,nx=-uy,ny=ux;
  for(let i=0;i<=n;i++){const t=i/n;const tip=Math.min(1,(n-i)/14);const w=Math.max(0,Math.round(2.6*tip));const cx=x0+ux*i,cy=y0+uy*i;
    for(let k=-w;k<=w;k++){const kk=w?k/w:0;const shade=kk<-0.5?4:kk<0?3:kk<0.6?2:1;P(g,cx+nx*k,cy+ny*k,ramp[shade])}}}
function yball(g,cx,cy,r,spin){disc(g,cx,cy,r,'#5e161c');disc(g,cx-2,cy-2,r-3,'#962428');
  // wound strands: families of arcs, the front family slides as the ball turns
  for(let fam=0;fam<3;fam++)for(let i=-6;i<=6;i++){const off=i*7+((spin*(fam?6:-9))%7);for(let a=0;a<64;a++){const t=a/64*PI*2;const x=Math.cos(t)*r*0.98,y=Math.sin(t)*r*0.98*0.35+off*0.9;
    const ang=fam*1.05+0.4;const X=cx+x*Math.cos(ang)-y*Math.sin(ang),Y=cy+x*Math.sin(ang)+y*Math.cos(ang);if((X-cx)*(X-cx)+(Y-cy)*(Y-cy)<(r-1)*(r-1)){const lit=(X-cx)+(Y-cy)<-r*0.3;if((a+i)%3)P(g,X,Y,lit?'#de6450':'#c03a34');else P(g,X,Y,'#5e161c')}}}}
function crimp(g,x0,y0,x1,y1,c1,c2,f,slack){const n=Math.max(8,Math.ceil(Math.hypot(x1-x0,y1-y0)/2));let px_=x0,py_=y0;const dx=(x1-x0)/n,dy=(y1-y0)/n,len=Math.hypot(dx,dy)||1;const nx=-dy/len,ny=dx/len;
  for(let i=1;i<=n;i++){const t=i/n;const w=Math.sin(i*1.3+f*0.4)*2.4*(slack?1.6:1);const sag=slack?Math.sin(t*PI)*16:Math.sin(t*PI)*6;const x=x0+dx*i+nx*w,y=y0+dy*i+ny*w+sag;L(g,px_,py_+1,x,y+1,'#1a0c08',2);L(g,px_,py_,x,y,c2,2);L(g,px_,py_-1,x,y-1,c1);px_=x;py_=y}}
// a grey tabby forearm with a white sock, reaching in from off-screen top left; drawn per pixel in the arm's own frame
const FUR=['#26262e','#3c3c46','#585864','#767682','#9a9aa6','#c0c0ca'].map(U),SOCK=['#6a6a76','#9a9aa8','#c4c4ce','#e2e2ea','#f6f6fa','#ffffff'].map(U);
const CLAW=U('#f8f2e2'),CLAWS=U('#b8ac96'),PAWDK=U('#2c2c34');
function drawPaw(g,x,y,claw,f){
  const sx=-150,sy=-170,ang=Math.atan2(y-sy,x-sx),ca=Math.cos(ang),sa=Math.sin(ang);
  const x0=Math.max(0,fl(Math.min(sx,x)-60)),x1=Math.min(W,Math.ceil(Math.max(sx,x)+60)),y0=Math.max(0,fl(Math.min(sy,y)-60)),y1=Math.min(H,Math.ceil(Math.max(sy,y)+60));
  if(x1<=x0||y1<=y0)return;const im=g.getImageData(x0,y0,x1-x0,y1-y0),u=new Uint32Array(im.data.buffer);const IW=x1-x0;
  const toes=[[19,-15.5,7.5],[25,-5.5,8],[25,5.5,8],[19,15.5,7.5]],armLen=Math.hypot(x-sx,y-sy);
  for(let py=y0;py<y1;py++)for(let px=x0;px<x1;px++){const dx=px+0.5-x,dy=py+0.5-y;const uu=dx*ca+dy*sa,vv=-dx*sa+dy*ca;
    let best=null;
    // toes (claws first: they sit in front)
    if(claw){for(const [tu,tv] of toes){const cu=uu-(tu+9),cv=vv-tv;if(cu>-1&&cu<5&&Math.abs(cv-cu*cu*0.18)<1.1){best=cu<2.5?CLAW:CLAWS}}}
    if(best===null){let d1=9,d2=9,ti=-1;for(let i=0;i<4;i++){const [tu,tv,tr]=toes[i];const d=Math.hypot(uu-tu,vv-tv)/tr;if(d<d1){d2=d1;d1=d;ti=i}else if(d<d2)d2=d}
      if(d1<=1){const [tu,tv,tr]=toes[ti];if(d2<=1.08&&(d2-d1)*tr<1.1)best=PAWDK;else{const nx=(dx-(tu*ca-tv*sa))/tr,ny=(dy-(tu*sa+tv*ca))/tr;const l=0.5-0.45*(nx*0.6+ny*0.8)-(d1>0.82?0.25:0);best=SOCK[clamp(fl(l*6),1,5)]}}}
    if(best===null){const pd=Math.hypot(uu/26,vv/24);if(pd<=1){const l=0.58-0.42*((dx)/26*0.6+(dy)/24*0.8)-(pd>0.86?0.22:0);let k=clamp(fl(l*6),1,5);
      if(uu>10+Math.abs(vv)*0.3)best=SOCK[k];else{if(Math.sin(uu*0.24+Math.sin(vv*0.14)*1.4)>0.5)k=Math.max(0,k-2);best=FUR[k]}}}
    if(best===null&&uu<0&&uu>-armLen-40){const hw=23+Math.min(8,-uu*0.04);if(Math.abs(vv)<=hw){const s=vv/hw;const l=0.55-0.4*s*(-sa*0.6+ca*0.8)*-1-(Math.abs(s)>0.86?0.22:0);
      {let k=clamp(fl(l*6),1,5);if(Math.sin(uu*0.2+Math.sin(vv*0.12)*1.4)>0.45)k=Math.max(0,k-2);best=FUR[k]}}}
    if(best!==null)u[(py-y0)*IW+(px-x0)]=best}
  g.putImageData(im,x0,y0)}
// ---------- sound ----------
function sound(A,S,u,pu,t){const T=A.at();
  bed(A,'fire','brown','lowpass',600,0.6);bset(A,'fire',0.07);
  if(Math.random()<0.18)noise(A,T+Math.random()*0.04,0.006,0.05+Math.random()*0.06,'highpass',2500);
  // needle clicks: one per stitch while slow, then a steady patter
  const ks=knitState(u);if(ks.cur>=0){const [t0,d]=RT[ks.cur];const per=d/COLS;const clicks=Math.min(3,Math.max(0,Math.floor(1/per)));
    if(per>=1){if(Math.floor((u-t0)/per)!==Math.floor((u-1-t0)/per))tone(A,'triangle',1800+Math.random()*300,T,0.02,0.05,{ft:'bandpass',ff:2200,q:3})}
    else if(u%2===0)for(let i=0;i<clicks;i++)tone(A,'triangle',1700+Math.random()*400,T+i*0.012,0.015,0.035,{ft:'bandpass',ff:2200,q:3})}
  // harp lullaby while the sweater is alive
  const MEL=[67,71,74,79,78,74,71,74,76,72,69,72,74,71,67,71];
  if(u>=ALIVE&&u<UNR&&(u-ALIVE)%16===0){const i=((u-ALIVE)/16)|0;pluck(A,T,mtof(MEL[i%16]-12),0.16,0.4);if(i%4===0)pluck(A,T,mtof([43,47,45,50][(i/4|0)%4]),0.12,0.3)}
  // sleigh bells as the reindeer gallop
  if(u>ALIVE+30&&u<UNR&&u%3===0)noise(A,T,0.04,0.025,'bandpass',6200+Math.random()*1500,{q:6});
  if(u>ALIVE+30&&u<UNR&&u%6===0)noise(A,T,0.03,0.04,'lowpass',260);
  // the cat: a little trill, bats, then each jerk of the yarn is a pull plus a run of stitch pops
  if(crossed(pu,u,UNR+10)){tone(A,'sine',420,T,0.18,0.06,{to:620,glide:0.12});tone(A,'sine',520,T+0.2,0.25,0.05,{to:380,glide:0.2})}
  for(const [a] of UJ)if(crossed(pu,u,a))noise(A,T,0.25,0.07,'bandpass',900,{q:0.6,to:300});
  const ur=unravel(u),ur0=unravel(u-1);const pops=Math.min(10,Math.round((ur-ur0)*COLS));for(let i=0;i<pops;i++)tone(A,'square',300+Math.random()*120,T+Math.random()*0.04,0.006,0.03,{ft:'lowpass',ff:1200});
}
SAMPLES.push({id:'knit',name:'会动的毛衣',w:W,h:H,thumb:800,
  tags:['每个像素是一针','2340 针逐针织出','平针 V 字和罗纹两种针法','毛线股纹与绒毛','面料呼吸时的褶皱光影','费尔岛图案里的驯鹿奔跑','猫拽线头，整片拆掉','编织声、竖琴和雪橇铃'],
  about:'这一幅的每个“像素”都是一针毛线：8×7 个屏幕像素画出一个 V 字线圈，带毛线的股纹、绒毛、左上方台灯的光。开头是一张空木桌，两根木针一行一行地织，平针来回换方向，第一行慢，后面越来越快，2340 针织完是一片费尔岛花样：雪花、极光、月亮、松林、三头驯鹿。木针抽走以后，毛衣开始轻轻起伏，褶皱在灯下有明有暗；然后图案活了：极光飘动，雪一针一针地落，雪花带闪烁，驯鹿撒开腿跑，后来一只狐狸追了上来。最后一只虎斑猫伸进爪子，勾住线头往回拽，毛衣从上往下一行行拆掉，拆出来的线还是弯弯曲曲的。拆完又从头织起。一圈 60 秒。',
  controls:[SND_CTL,{type:'button',label:'起针',act(s){s.t=0}},{type:'button',label:'织到一半',act(s){s.t=RT[20][0]}},{type:'button',label:'活过来',act(s){s.t=ALIVE}},{type:'button',label:'狐狸',act(s){s.t=ALIVE+230}},{type:'button',label:'猫',act(s){s.t=UNR}}],
  init(s){sndInit(s)},onOpt:sndOpt,onLeave:sndOff,tick(s){sndTick(s,LOOP,sound)},draw,
  info(s){const f=((s.t%LOOP)+LOOP)%LOOP;return '第 '+fl(f/24)+' 秒 / 60'}});
})();

// ================= N3. 万人翻花 =================
// a card stunt: 200 x 60 = 12,000 people in a stand, each holding a booklet of coloured cards. Each card is one pixel of a
// stadium-sized picture that changes on cue. The camera runs from a close-up of one girl (about 90 screen px per seat)
// to the whole stand (2.25 px per seat) and back, so the renderer has three levels: people with faces, cards with gaps,
// and plain per-pixel cards. Every card has its own flip delay; a few people are always late. 72 s loop.


// ================= N4. 多米诺 =================
// a child's domino run on a gym floor at night: a chain of ~400 dominoes (fork, S-bends, a staircase bridge), then a
// field of 96 x 64 = 6144 dominoes whose hidden north faces are a child's drawing. Each domino is a real box (8 corners,
// rotated about its front bottom edge, culled faces, shaded by a light), projected with an oblique orthographic camera.


// ================= N5. 看不见的猫 =================
// every frame is nothing but random two-colour noise. The sky's noise is re-rolled every frame; every object carries its
// own noise texture with it (offset by its own motion), so it only exists in time: while it plays you see a cat on the
// rooftops, the moment you pause there is nothing but static. A "显形" toggle tints each layer to show what was there.


// ================= N6. 借你的眼睛 =================
// three pictures that finish themselves inside the viewer's eye:
// 1. stare at a colour-negative lighthouse for 20 s, then it turns grey and the eye paints the colours back in;
// 2. stare at a waterfall for 20 s, then it stops and the rocks seem to drift upward (motion aftereffect);
// 3. a ring of fuzzy pink dots with one missing at a time: stare and a green dot runs round while the pink fades.


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
