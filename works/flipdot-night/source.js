// SPDX-License-Identifier: MIT
// Copyright (c) 2026 喵老弟 / MarkMFFF

"use strict";
// ================= helpers =================
const fl=Math.floor, rd=Math.round, PI=Math.PI, D2R=PI/180;
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
function R(g,x,y,w,h,c){g.fillStyle=c;g.fillRect(fl(x),fl(y),fl(w),fl(h))}

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
function ztxt(g,str,x,y,c,size,oc,align,bold){const G=zglyphs(str,size||10,bold);if(align==='c')x-=fl(G.w/2);else if(align==='r')x-=G.w;x=rd(x);y=rd(y);const p=G.px;
  if(oc){g.fillStyle=oc;for(let i=0;i<p.length;i+=2){g.fillRect(x+p[i]-1,y+p[i+1],3,1);g.fillRect(x+p[i],y+p[i+1]-1,1,3)}}
  g.fillStyle=c;for(let i=0;i<p.length;i+=2)g.fillRect(x+p[i],y+p[i+1],1,1);return G.w}

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
// a struck bell: inharmonic partials, the low ones ring longest
function bell(A,t0,f,vol,wet){[[0.5,1,7],[1,0.8,5],[1.19,0.55,3.6],[1.5,0.4,3],[2,0.5,2.4],[2.52,0.25,1.6],[2.66,0.2,1.3],[3.01,0.18,1.1],[4.2,0.12,0.7]].forEach(([r,a,d])=>tone(A,'sine',f*r,t0,d,vol*a,{a:0.004,wet:wet==null?0.5:wet}))}

const mtof=m=>440*Math.pow(2,(m-69)/12);

// ================= N1. 翻片屏的一夜 =================
// a 72x34 flip-disc departure board in a night station hall. Every frame of the board's 1-bit content is precomputed
// (it contains small simulations), each disc then flips between its old and new face over ~2.5 frames, swept column
// by column the way the driver boards scan. The camera is a pitch (pixels per disc) plus a centre in disc units,
// so the same renderer draws the wide hall shot (2 px per disc) and the macro shots (16+ px per disc).
(function(){
const W=480,H=270,BC=72,BR=34,N=BC*BR,LOOP=1920,DUR=2.5;
let CT=null;
const fm=f=>((f%LOOP)+LOOP)%LOOP;
// before frame 0 the board holds frame 0 (the loop restart is a cut, not a flip)
const bit=(f,k)=>CT[(f<0?0:fm(f))*N+k];
// discs with character: one stuck showing yellow, a few lazy ones that flip a frame or two late, one that flutters
const STUCK=9*BC+41,LAG=new Uint8Array(N),FLUT=20*BC+12;
for(let k=0;k<N;k++){const h=hash(k,77,3);LAG[k]=h<0.025?2:h<0.07?1:0}
// ---------- 1-bit sprites ----------
const SP=s=>{const o=[];s.forEach((r,y)=>{for(let x=0;x<r.length;x++)if(r[x]==='#')o.push(x,y)});return o};
const MANA=SP(["....#####....",".###########.","#############","#.....#.....#","......#......","....##.......","....##.......","...####......","...###.......","...###.......","...###.......","...#.#.......","..#...#......"]);
const MANB=SP(["....#####....",".###########.","#############","#.....#.....#","......#......","....##.......","....##.......","...####......","...###.......","...###.......","...###.......","...#.#.......","...#.#......."]);
const CATA=SP(["#......#.#",".#.....###","..#######.","..######..","..#.#.#.#."]);
const CATB=SP(["#......#.#","#......###",".########.","..######..","...#.#.#.."]);
const HEART=SP([".##...##.","####.####","#########","#########",".#######.","..#####..","...###...","....#...."]);
const HEART2=SP(["..##...##..",".####.####.","###########","###########","###########",".#########.","..#######..","...#####...","....###....",".....#....."]);
const Z4=SP(["####","..#.",".#..","####"]),Z5=SP(["#####","...#.","..#..",".#...","#####"]),Z3=SP(["###",".#.","###"]);
// ---------- content: precomputed for the whole loop ----------
function build(){
  CT=new Uint8Array(LOOP*N);const cur=new Uint8Array(N);
  const put=(x,y,v)=>{x=Math.round(x);y=Math.round(y);if(x>=0&&x<BC&&y>=0&&y<BR)cur[y*BC+x]=v==null?1:v};
  const spr=(s,x,y,flip,w)=>{for(let i=0;i<s.length;i+=2)put(flip?x+w-1-s[i]:x+s[i],y+s[i+1])};
  const glyph=(str,size)=>{const G=zglyphs(str,size,false);return G};
  const textAt=(str,x,y,size,cx)=>{const G=glyph(str,size);const ox=cx?Math.round(x-G.w/2):x;for(let i=0;i<G.px.length;i+=2)put(ox+G.px[i]-1,y+G.px[i+1]-1);return G};
  const textPix=(str,x,y,size,cx)=>{const G=glyph(str,size);const ox=cx?Math.round(x-G.w/2):x,o=[];for(let i=0;i<G.px.length;i+=2)o.push(ox+G.px[i]-1,y+G.px[i+1]-1);return o};
  // the six glyphs of 今日运营结束, each its own pixel list so they can fall one by one
  const END='今日运营结束',GL=[];for(let c=0;c<6;c++){const G=glyph(END[c],12);const ox=c*12,o=[];for(let i=0;i<G.px.length;i+=2)o.push(ox+G.px[i]-1,10+G.px[i+1]-1);GL.push(o)}
  const ORDER=[2,0,4,1,5,3];
  // sand simulation state
  const sand=new Uint8Array(N);let grains=[];
  const solid=(x,y)=>x<0||x>=BC||y>=BR||(y>=0&&sand[y*BC+x]);
  // hills, stars, moon
  const hill=x=>Math.round(19+Math.sin(x*0.09+0.7)*4+Math.sin(x*0.23+2)*1.6-Math.exp(-((x-50)*(x-50))/60)*5);
  const STARS=[];{const r=rng(9);for(let i=0;i<22;i++)STARS.push([fl(r()*BC),fl(r()*12),fl(r()*40)])}
  let colH=null;
  // rain
  let drops=[],splash=[];const rr=rng(31);
  // bubbles for the good-night words
  let flyers=null;
  for(let f=0;f<LOOP;f++){cur.fill(0);
    if(f<288){// ---- A: departures, then end of service
      if(f<96){textAt('末班',1,1,12);textAt('23:40',30,2,11);textAt('K128',1,18,11);textAt('已开出',34,17,12)}
      else{for(const g_ of GL)for(let i=0;i<g_.length;i+=2)put(g_[i],g_[i+1])}
      if(f>=240&&f<252)put(0,0);if(f>=262&&f<268){put(70,2);put(3,30)}if(f>=272&&f<276)put(35,31)}
    else if(f<480){// ---- B: the glyphs come loose and fall into a heap
      for(let c=0;c<6;c++){const k=ORDER.indexOf(c),rf=300+k*16;
        if(f<rf-6){for(let i=0;i<GL[c].length;i+=2)put(GL[c][i],GL[c][i+1])}
        else if(f<rf){for(let i=0;i<GL[c].length;i+=2)put(GL[c][i],GL[c][i+1]+1)}
        else if(f===rf){for(let i=0;i<GL[c].length;i+=2){const q={x:GL[c][i],y:GL[c][i+1]+1,vy:0,acc:0,h:hash(i,c,5)};grains.push(q);if(q.y>=0)sand[q.y*BC+q.x]=1}}}
      grains.sort((a,b)=>b.y-a.y);
      const mv=(q,nx,ny)=>{if(q.y>=0)sand[q.y*BC+q.x]=0;q.x=nx;q.y=ny;if(ny>=0)sand[ny*BC+nx]=1};
      for(const q of grains){q.vy=Math.min(2.2,q.vy+0.16);q.acc+=q.vy;
        while(q.acc>=1){q.acc-=1;const ny=q.y+1;
          if(!solid(q.x,ny)){mv(q,q.x,ny);continue}
          const d=q.h<0.5?-1:1;
          if(!solid(q.x+d,ny)&&!solid(q.x+d,q.y)){mv(q,q.x+d,ny);continue}
          if(!solid(q.x-d,ny)&&!solid(q.x-d,q.y)){mv(q,q.x-d,ny);continue}
          q.vy=0;q.acc=0;break}
        q.h=hash(q.x,q.y,f)}
      // glyphs still hanging
      for(let k=0;k<N;k++)if(sand[k])cur[k]=1;
      if(f===479){colH=new Float32Array(BC);for(let x=0;x<BC;x++){let h_=0;for(let y=0;y<BR;y++)if(sand[y*BC+x])h_++;colH[x]=h_}}}
    else if(f<720){// ---- C: the heap becomes hills under the moon, the last train runs
      const k=ease((f-480)/60),drain=clamp((f-545)/22,0,1);
      for(let x=0;x<BC;x++){const top=Math.round(BR-(colH[x]+((BR-hill(x))-colH[x])*k));
        for(let y=top;y<BR;y++){const depth=y-top;if(depth===0||BR-1-y>=fl(drain*(BR-top)))put(x,y)}}
      if(f>=500){const my=BR+6-ease((f-500)/110)*(BR+6-6);for(let y=-5;y<=5;y++)for(let x=-5;x<=5;x++){const a=x*x+y*y<=20,b=(x-2)*(x-2)+(y+1)*(y+1)<=16;if(a&&!b)put(60+x,my+y)}}
      if(f>=520){for(const [sx,sy,ph] of STARS){const on=hash(sx,sy,fl((f+ph)/20))>0.22&&f>520+ph;if(on&&sy<hill(sx)-3)put(sx,sy)}}
      if(f>=568){// track
        for(let x=0;x<BC;x++){put(x,31,1);if(x%3===0)put(x,32,1)}
        for(let x=0;x<BC;x++)for(let y=hill(x)+1;y<31;y++)cur[y*BC+x]=0}
      if(f>=580){const tx=BC+4-(f-580)*1.0;drawTrain(put,tx,f)}}
    else if(f<960){// ---- D: rain; a man with an umbrella and a cat that follows him
      const diss=(f-720)/36;
      if(f<760){for(let x=0;x<BC;x++){if(hash(x,1,9)>diss)put(x,hill(x));for(const [sx,sy] of STARS)if(hash(sx,sy,2)>diss&&sy<hill(sx)-3)put(sx,sy)}}
      for(let x=0;x<BC;x++){put(x,31,1);if(x%3===0)put(x,32,1)}
      const mx=-14+(f-770)*0.52,step=fl(f/6)&1;let um=null;
      if(f>=770){spr(step?MANA:MANB,mx,18,false,13);um=[mx,mx+12,18]}
      const cg=f<845?16:f<880?16-ease((f-845)/35)*13:3,cx_=mx-cg-8;
      if(f>=770){const cs=fl(f/(f>=845&&f<880?3:5))&1;spr(cs?CATA:CATB,cx_,26,false,10)}
      // rain physics
      if(f>=726&&f<948){const n=f<760?(f-726)/34*1.6:1.6;let s=n;while(s>0){if(rr()<s)drops.push({x:fl(rr()*BC),y:-2-rr()*3});s-=1}}
      for(const d of drops){d.y+=1.6;const xi=d.x,yi=fl(d.y);
        if(um&&xi>=fl(um[0])&&xi<=fl(um[1])&&yi>=um[2]-1&&yi<=um[2]+2){d.dead=true;if(rr()<0.4)splash.push({x:xi,y:um[2]-1,a:0});continue}
        if(yi>=30){d.dead=true;splash.push({x:xi,y:30,a:0})}}
      drops=drops.filter(d=>!d.dead);
      for(const d of drops){put(d.x,d.y);put(d.x,d.y-1)}
      for(const s_ of splash){s_.a++;if(s_.a<=2){put(s_.x-s_.a,s_.y-1);put(s_.x+s_.a,s_.y-1)}}
      splash=splash.filter(s_=>s_.a<3);
      // drips off the umbrella tips
      if(um){for(const ex of [um[0],um[1]]){const ph=(f*3+fl(ex))%14;if(ph<8)put(ex,um[2]+3+ph)}}}
    else if(f<1200){// ---- E: the hall floods; a whale swims across the board
      const sy=f<1002?33-(f-960)*0.9:-4;
      for(let x=0;x<BC;x++){const yy=Math.round(sy+Math.sin(x*0.35+f*0.25)*1.2);if(yy>=0)put(x,yy);
        if(f<1000){for(const d of drops){if(d.y<yy-1){put(d.x,d.y);put(d.x,d.y-1)}}}}
      if(f<1000){for(const d of drops)d.y+=1.6;drops=drops.filter(d=>d.y<34);if(rr()<1.2)drops.push({x:fl(rr()*BC),y:-2})}
      // sea bed and kelp
      const grow=clamp((f-985)/50,0,1);
      for(let x=0;x<BC;x++)if(Math.round(sy)<31)put(x,33);
      for(const [kx,kh] of [[4,13],[9,9],[22,15],[27,8],[45,12],[58,16],[63,10],[69,7]]){const hh=fl(kh*grow);
        for(let y=0;y<hh;y++){const yy=32-y;if(yy>sy+1)put(kx+Math.sin(y*0.45-f*0.09)*1.6*(y/kh),yy)}}
      // little fish
      for(let i=0;i<7;i++){const px_=((f-990)*0.9+i*9+(i%2)*4)%110-20,py_=6+(i*5)%14+Math.sin(f*0.1+i)*1.2;if(f>990&&py_>sy+2){put(px_,py_);put(px_-1,py_-1);put(px_-1,py_+1);put(px_-2,py_)}}
      if(f>=1000&&f<1196)drawWhale(put,BC+4-(f-1000)*0.62,15,f);
      // bubbles
      for(let i=0;i<16;i++){const bx=(hash(i,3,1)*BC)|0,per=70+fl(hash(i,4,1)*60),a=(f+fl(hash(i,5,1)*per))%per,by=33-a*0.45+0,wb=Math.sin(a*0.2+i)*0.8;
        if(f>995&&by>sy+1&&by<33){if(i%3===0){put(bx+wb,by-1);put(bx+wb-1,by);put(bx+wb+1,by);put(bx+wb,by+1)}else put(bx+wb,by)}}}
    else if(f<1440){// ---- F: the water drains, bubbles left in the air gather into 晚安 and a heart
      const sy=f<1236?-4+(f-1196)*0.95:40;
      if(!flyers){const T=textPix('晚安',15,11,12);const hp=[];for(let i=0;i<HEART.length;i+=2)hp.push(45+HEART[i],13+HEART[i+1]);const tg=T.concat(hp);
        const r2=rng(4);flyers=[];for(let i=0;i<tg.length;i+=2)flyers.push({x0:fl(r2()*BC),y0:fl(4+r2()*28),x1:tg[i],y1:tg[i+1],d:r2()*30+(tg[i]-10)*0.6})}
      for(let x=0;x<BC;x++){const yy=Math.round(sy+Math.sin(x*0.35+f*0.25)*1.2);if(yy<BR)put(x,yy)}
      for(const q of flyers){let x,y;
        if(f<1244){if(q.y0>=sy-1)continue;x=q.x0+Math.sin(f*0.07+q.d)*0.8;y=q.y0}
        else{const k=ease(clamp((f-1244-q.d)/40,0,1));x=q.x0+(q.x1-q.x0)*k;y=q.y0+(q.y1-q.y0)*k+Math.sin(k*PI)*-4}
        put(x,y)}
      if(f>=1330){const beat=((f-1330)%22)<5;for(let i=0;i<HEART.length;i+=2)cur[(13+HEART[i+1])*BC+45+HEART[i]]=0;spr(beat?HEART2:HEART,beat?44:45,beat?12:13,false,0)}}
    else if(f<1680){// ---- G: Zzz, a spiral that fills the board and empties it, one dot left breathing
      if(f<1500){textAt('晚安',15,11,12);spr(HEART,45,13,false,0);
        for(let i=0;i<3;i++){const a=(f-1440-i*18);if(a>=0&&a<54){const zx=40+a*0.35+i*2,zy=10-a*0.25;spr(i===0?Z3:i===1?Z4:Z5,zx,zy,false,0)}}}
      const fillK=clamp((f-1500)/50,0,1),clrK=clamp((f-1562)/50,0,1);
      for(let k=0;k<N;k++){const o=SPI[k];if(f>=1500&&o<fillK*N)cur[k]=1;if(f>=1562&&o<clrK*N&&k!==CENTER)cur[k]=0}
      if(f>=1500&&f<1562){textAt('晚安',15,11,12)}
      if(f>=1612){cur[CENTER]=((f-1612)%36)<18?1:0}}
    else{// ---- H: dawn, the first train of the day
      const wipe=(f-1700)*1.6;
      if(f<1700){cur[CENTER]=((f-1612)%36)<18?1:0}
      else{const tmp=new Uint8Array(N);const keep=cur.slice();cur.fill(0);textAt('首班',1,1,12);textAt('06:10',30,2,11);textAt('K127',1,18,11);textAt('正点',46,17,12);
        for(let k=0;k<N;k++){const x=k%BC,y=(k/BC)|0;if(x+y*0.6>wipe)cur[k]=0}}}
    cur[STUCK]=1;
    CT.set(cur,f*N)}
}
function drawTrain(put,tx,f){
  // locomotive facing left: cow-catcher, boiler, chimney, cab; then two carriages with lit windows (black holes in yellow)
  const fill=(x0,y0,w,h)=>{for(let y=y0;y<y0+h;y++)for(let x=x0;x<x0+w;x++)put(x,y)};
  const hole=(x0,y0,w,h)=>{for(let y=y0;y<y0+h;y++)for(let x=x0;x<x0+w;x++)put(x,y,0)};
  const x=Math.round(tx);
  fill(x+2,25,10,4);fill(x+4,22,2,3);fill(x+3,21,4,1);fill(x+11,21,5,8);hole(x+12,22,3,2);fill(x+10,20,7,1);
  put(x+1,28);put(x,28);put(x+1,27);fill(x+2,29,14,1);
  const wph=fl(f/3)%4;
  for(const wx of [x+4,x+8,x+13]){put(wx,30,1);put(wx+1,30,1);put(wx,29,0)}
  put(x+4+(wph>1?1:0),29,0);
  for(let c=0;c<2;c++){const cx=x+18+c*17;fill(cx,22,15,7);hole(cx+2,24,2,2);hole(cx+6,24,2,2);hole(cx+10,24,2,2);fill(cx+1,21,13,1);
    put(cx+2,30);put(cx+3,30);put(cx+11,30);put(cx+12,30);put(cx-2,26);put(cx-1,26)}
  // steam: puffs leave the chimney and drift back (right) as rings that thin out
  for(let i=0;i<5;i++){const a=(f+i*9)%45;if(a>f-580)continue;const px_=x+5+a*0.75,py_=19-a*0.22,r=a<10?0:a<24?1:2;
    if(r===0)put(px_,py_);else for(let k=0;k<10;k++){const an=k/10*2*PI;if(a>34&&hash(i,k,fl(f/45))<0.5)continue;put(px_+Math.cos(an)*r,py_+Math.sin(an)*r*0.8)}}
}
function drawWhale(put,wx,wy,f){
  // a humpback seen from the side, head left: a clean solid silhouette (moving detail inside the body only makes discs churn)
  const len=44,ph=f*0.1;
  const yo=u=>Math.sin(ph-u*2.2)*2.2*u*u;
  for(let d=0;d<len;d++){const u=d/len;
    const top=u<0.12?2.5+3*Math.sqrt(u/0.12):u<0.34?5.5+(u-0.12)/0.22*1.2:6.7-Math.pow((u-0.34)/0.66,1.15)*5.9;
    const bot=u<0.1?1+3.6*Math.sqrt(u/0.1):u<0.3?4.6+(u-0.1)/0.2*1.0:5.6-Math.pow((u-0.3)/0.7,0.85)*4.9;
    const yc=wy+yo(u),yt=Math.round(yc-top),yb=Math.round(yc+bot);for(let y=yt;y<=yb;y++)put(wx+d,y,1);
    if(u>0.06&&u<0.32)put(wx+d,yb-1,0);
    if(Math.abs(u-0.68)<0.03)put(wx+d,yt-1,1)}
  put(wx+8,Math.round(wy+yo(8/len))-1,0);
  for(let d=0;d<13;d++)put(wx+d,Math.round(wy+yo(d/len))+1+(d>9?1:0),0);
  // long pectoral fin, flapping slowly
  const fa=Math.sin(f*0.07);for(let i=0;i<13;i++){const fx=wx+13+i*0.8,fy=wy+yo(0.3)+4+i*(0.5+fa*0.32);put(fx,fy,1);if(i<10)put(fx+1,fy,1)}
  // flukes: two lobes that beat with the tail
  const tx=wx+len-1,ty=wy+yo(1),tilt=Math.cos(ph-2.2)*0.6;
  for(let i=0;i<7;i++){const sp=i*0.85;put(tx+i,ty-sp+tilt*i);put(tx+i,ty-sp+1+tilt*i);put(tx+i,ty+sp+tilt*i);put(tx+i,ty+sp-1+tilt*i)}
  // blow: a column of dots from the blowhole once
  const ba=f-1070;if(ba>0&&ba<44){for(let i=0;i<7;i++){const yy=wy-8-ba*0.3-i*1.3;if(i*6<ba)put(wx+11+Math.sin(i*1.7+ba*0.1)*(i*0.4),yy)}}
}
// spiral order from the edges inward (for the fill and clear sweeps)
const SPI=new Float32Array(N),CENTER=17*BC+36;
{let k=0,x0=0,y0=0,x1=BC-1,y1=BR-1;while(x0<=x1&&y0<=y1){for(let x=x0;x<=x1;x++)SPI[y0*BC+x]=k++;for(let y=y0+1;y<=y1;y++)SPI[y*BC+x1]=k++;if(y1>y0)for(let x=x1-1;x>=x0;x--)SPI[y1*BC+x]=k++;if(x1>x0)for(let y=y1-1;y>y0;y--)SPI[y*BC+x0]=k++;x0++;y0++;x1--;y1--}
 SPI[CENTER]=N+1}
// ---------- disc state for one frame ----------
const PH=new Float32Array(N),FA=new Uint8Array(N),FB=new Uint8Array(N);
function discs(t){
  for(let k=0;k<N;k++){const i=k%BC,lag=LAG[k],cd=i/BC*0.85,te=t-lag;let c=-1;
    for(let q=te;q>te-4;q--){if(bit(q,k)!==bit(q-1,k)){c=q;break}}
    if(c<0){PH[k]=1;FA[k]=FB[k]=bit(te,k);continue}
    const e=(te-c+1-cd)/DUR;
    if(e>=1){PH[k]=1;FA[k]=FB[k]=bit(c,k)}else if(e<=0){PH[k]=1;FA[k]=FB[k]=bit(c-1,k)}else{PH[k]=e;FA[k]=bit(c-1,k);FB[k]=bit(c,k)}}
  // the flutter disc half-flips whenever its neighbours move
  {const k=FLUT;let busy=0;for(const d of [1,-1,BC,-BC])if(PH[k+d]<1)busy=1;if(busy&&PH[k]>=1){const w=(t%4)/4;PH[k]=0.12+0.2*Math.sin(w*PI);FA[k]=FB[k]=FA[k]}}
  PH[STUCK]=1;FA[STUCK]=FB[STUCK]=1}
// ---------- palettes ----------
const YEL=['#5a5c12','#969a1c','#cdd42c','#e9ef4a','#fbffa8'].map(U),BLK=['#0f1012','#16171a','#1d1e22','#27282d','#383a40'].map(U);
const BOARD=U('#0b0b0d'),PIN=U('#2e2f34'),SHAD=U('#050506'),EDGE=U('#45463e');
const HALL={wall:['#1a2032','#6b5a48','#5e4a56'],wallDk:['#141927','#54463a','#4a3a46'],wains:['#161b2a','#4a3c30','#433442'],rail:['#232a3e','#7d6a52','#76606c'],
  winF:['#0d1019','#2c241e','#2a1e26'],glass:['#22305a','#1c2238','#e88a6a'],glassHi:['#3a4f86','#2a3352','#f8c48e'],glassTop:['#1a2448','#161c30','#b0688a'],
  floor:['#10141f','#4a3e34','#382a34'],seam:['#0c0f18','#3a3028','#2e2129'],shaft:['#1c2640','#4a3e34','#7a5048'],bench:['#0b0e16','#2e241c','#251a20'],benchHi:['#1e2538','#6a5440','#6a4a4c'],
  hous:['#1c2622','#33433c','#323c38'],housHi:['#2a3832','#4c6056','#4a5652'],housLo:['#111815','#222d28','#20282a'],door:['#121624','#3a2e26','#33262c'],doorIn:['#06070b','#14100c','#140e10'],
  cord:['#0a0c12','#2a221c','#22181c'],shade:['#1a1e2a','#3a3026','#30262a'],pool:['#10141f','#5c4c3e','#382a34'],clock:['#7a7c80','#d8d0b8','#c8b8b0'],clockRim:['#2a3030','#4c5450','#4a4c4c'],hand:['#101216','#201a14','#201a1c'],
  plate:['#0e1512','#18241e','#18201e'],paint:['#8a8c3a','#d8dc5a','#c8c060']};
const HC={};function hc(name,lit,dawn){const key=name+'|'+lit+'|'+dawn;let c=HC[key];if(c)return c;const a=HALL[name];c=mix(mix(a[0],a[1],lit),a[2],dawn);HC[key]=c;return c}
const JAN=["....ccc....","...ccccc...","..cccccc...","...ssh.....","..sssh.....","...ss......","..jjjj.....",".jjjjjj....",".jjjjjj..m.",".jjjjjj..m.",".sjjjjj..m.","..jjjj...m.","..jjjj...m.","..pppp...m.","..pp.pp..m.","..pp.pp..m.","..pp..pp.m.",".bb...bb.m.","........mmm","........mmm"];
const JAN2=JAN.slice(0,13).concat(["..pppp...m.","..pppp...m.","..pppp...m.","...pp....m.","..bbb....m.","........mmm","........mmm"]);
const JCOL={c:['#141a2a','#3a4a6a','#3a4460'],s:['#3a3438','#c89878','#d0a088'],h:['#0e0c10','#2a2018','#2a2018'],j:['#182032','#4a5a7a','#4a5070'],p:['#0e1220','#2a3048','#2a2c40'],b:['#06080c','#141820','#141418'],m:['#2a2c30','#8a7a5a','#8a7060']};
// ---------- camera ----------
const CAM=[[0,2,36,37],[168,2,36,37],[288,6,36,17],[612,6,36,17],[632,16,'T',25],[690,16,'T',25],[714,6,36,17],[1250,6,36,17],[1272,13,30,16],[1328,13,30,16],[1350,6,36,17],[1690,6,36,17],[1800,2,36,37],[1920,2,36,37]];
function cam(f){let i=0;while(i<CAM.length-2&&CAM[i+1][0]<=f)i++;const a=CAM[i],b=CAM[i+1],k=ease((f-a[0])/Math.max(1,b[0]-a[0]));
  const tr=BC+4-(f-580)*1.0+22,cu=v=>v==='T'?tr:v;const lp=Math.exp(Math.log(a[1])+(Math.log(b[1])-Math.log(a[1]))*k);
  return {p:lp,cu:cu(a[2])+(cu(b[2])-cu(a[2]))*k,cv:a[3]+(b[3]-a[3])*k}}
// ---------- drawing ----------
let IM=null;
function draw(S,g){
  if(!CT)build();
  const f=fm(S.t),C=cam(f),p=C.p;
  const wx=x=>(x-C.cu)*p+W/2,wy=y=>(y-C.cv)*p+H/2;
  const WR=(x,y,w,h,c)=>{const x0=Math.round(wx(x)),y0=Math.round(wy(y)),x1=Math.round(wx(x+w)),y1=Math.round(wy(y+h));if(x1<=0||y1<=0||x0>=W||y0>=H)return;g.fillStyle=c;g.fillRect(x0,y0,Math.max(1,x1-x0),Math.max(1,y1-y0))};
  const WP=(pts,c)=>poly(g,pts.map(q=>[wx(q[0]),wy(q[1])]),c);
  // hall light state: four pendant lamps go out one by one after the board says the service is over; dawn later
  const lampsOn=f<110?4:f<120?3:f<130?2:f<140?1:0,lit=lampsOn/4;
  const dawn=f<1690?0:Math.round(clamp((f-1690)/110,0,1)*4)/4;
  const C_=n=>hc(n,lit,dawn);
  const wide=p<5.5;
  R(g,0,0,W,H,C_('wall'));
  if(wide){
    // pilasters and wainscot
    for(const px_ of [-44,108])WR(px_,-40,7,102,C_('wallDk'));
    WR(-100,47,300,15,C_('wains'));WR(-100,46,300,1.2,C_('rail'));
    // windows: arched, mullioned; the moon in the right-hand one at night
    for(const [x0,y0,x1,y1] of [[-78,-26,-50,26],[120,-26,148,40]]){const cx=(x0+x1)/2,rx=(x1-x0)/2;
      WR(x0-1.5,y0+rx-1,x1-x0+3,y1-y0-rx+2.5,C_('winF'));
      WP(Array.from({length:17},(_,i)=>{const a=PI+i/16*PI;return[cx+Math.cos(a)*(rx+1.5),y0+rx+Math.sin(a)*(rx+1.5)]}),C_('winF'));
      const gl=(yy)=>yy<y0+rx?C_('glassTop'):C_('glass');
      for(let yy=y0;yy<y1;yy+=1){const dy=yy+0.5-(y0+rx);let hw=rx;if(dy<0)hw=Math.sqrt(Math.max(0,rx*rx-dy*dy));WR(cx-hw,yy,hw*2,1,gl(yy))}
      if(dawn>0){for(let yy=y0;yy<y1;yy+=1){const dy=yy+0.5-(y0+rx);let hw=rx;if(dy<0)hw=Math.sqrt(Math.max(0,rx*rx-dy*dy));if(yy>y1-14)WR(cx-hw,yy,hw*2,1,C_('glassHi'))}}
      if(x0>0&&dawn<1){const mc=mix('#c8d4f0','#f0c0a0',dawn);for(let yy=-5;yy<=5;yy++){const hw=Math.sqrt(25-yy*yy);WR(cx+4-hw,-6+yy,hw*2,1,mc)}}
      for(let mx=x0+7;mx<x1;mx+=7)WR(mx-0.4,y0,0.8,y1-y0,C_('winF'));for(let my=y0+rx;my<y1;my+=9)WR(x0,my-0.4,x1-x0,0.8,C_('winF'))}
    // door under the left window, exit sign above it
    const doorOpen=(f>=128&&f<150)||(f>=1808&&f<1832);
    WR(-72,36,16,26,C_('housLo'));WR(-71,37,14,25,doorOpen?C_('doorIn'):C_('door'));if(!doorOpen){WR(-64.4,37,0.8,25,C_('housLo'));WR(-61,50,1,1.5,C_('rail'))}
    WR(-68,31,8,3.5,'#2fbf62');WR(-67,32,2,1.5,'#d8ffe0');WR(-64,32.4,3,0.8,'#d8ffe0');
    // clock: hands at 23:4x at night, 06:0x at dawn
    {const cx=-20,cy=-12,rr_=7;for(let yy=-rr_-1;yy<=rr_+1;yy++){const hw=Math.sqrt(Math.max(0,(rr_+1)*(rr_+1)-yy*yy));WR(cx-hw,cy+yy,hw*2,1,C_('clockRim'))}
      for(let yy=-rr_;yy<=rr_;yy++){const hw=Math.sqrt(Math.max(0,rr_*rr_-yy*yy));WR(cx-hw,cy+yy,hw*2,1,C_('clock'))}
      const mins=f<1690?(40+f/1690*25)%60:(4+(f-1690)/230*6),hrs=f<1690?23+mins/60:6+mins/60;
      const hand=(a,l,th)=>{for(let i=0;i<=l*4;i++){const r_=i/4;WR(cx+Math.sin(a)*r_-th/2,cy-Math.cos(a)*r_-th/2,th,th,C_('hand'))}};
      hand(mins/60*2*PI,5.5,0.9);hand((hrs%12)/12*2*PI,3.6,1.2)}
    // pendant lamps
    for(const lx of [-26,14,58,98]){WR(lx-0.3,-60,0.6,34,C_('cord'));const on=[-26,14,58,98].indexOf(lx)<lampsOn;
      WP([[lx-4,-22],[lx+4,-22],[lx+2.5,-26],[lx-2.5,-26]],on?'#c8a060':C_('shade'));if(on)WR(lx-3.5,-22,7,1,'#fff0c0')}
    // floor: terrazzo seams converging on the vanishing point, lamp pools, moon or dawn light through the windows
    WR(-100,62,300,60,C_('floor'));
    if(lampsOn)for(let i=0;i<lampsOn;i++){const lx=[-26,14,58,98][i];for(let yy=-4;yy<=4;yy++){const hw=Math.sqrt(16-yy*yy)*3.6;WR(lx-hw,72+yy,hw*2,1,C_('pool'))}}
    if(lit<1&&dawn<1)WP([[100,62.5],[126,62.5],[96,104],[62,104]],C_('shaft'));
    if(dawn>0)WP([[-76,62.5],[-50,62.5],[-4,104],[-46,104]],C_('shaft'));
    for(const yy of [64,67,71,76,82,89,97])WR(-100,yy,300,0.6,C_('seam'));
    for(let i=-8;i<=10;i++){const x0=36+i*12;for(let yy=62;yy<106;yy+=1.5){const xx=36+(x0-36)*(1+(yy-62)/24);WR(xx,yy,0.6,1.5,C_('seam'))}}
    // benches (backs toward us), with a dozing traveller's bag on one
    for(const [b0,b1] of [[-40,-6],[80,112]]){WR(b0,54,b1-b0,1.4,C_('benchHi'));WR(b0,55.4,b1-b0,3.2,C_('bench'));WR(b0+1,58.6,1.2,4,C_('bench'));WR(b1-2.2,58.6,1.2,4,C_('bench'));WR(b0,57,b1-b0,0.6,C_('benchHi'))}
    WR(86,51,6,3.5,C_('benchHi'));WR(87,50,4,1,C_('bench'))}
  // board housing, header plate with a painted train pictogram, lamp hood with its tube
  WR(-3.5,-4.5,79,42,C_('housLo'));WR(-3,-4,78,41,C_('hous'));WR(-3,-4,78,0.6,C_('housHi'));WR(-3,-4,0.6,41,C_('housHi'));
  WR(-1,-1,74,37,'#0b0b0d');
  for(const [rx_,ry_] of [[-2,-3],[73,-3],[-2,35.5],[73,35.5]])WR(rx_,ry_,0.8,0.8,C_('housHi'));
  WR(20,-12,32,7,C_('plate'));WR(20,-12,32,0.5,C_('housHi'));
  {const pc=C_('paint');WR(24,-10,6,2.5,pc);WR(25,-11,1,1,pc);WR(29,-11,1.5,1,pc);WR(24.5,-7.5,1,1,pc);WR(28,-7.5,1,1,pc);WR(32,-9,5,0.8,pc);WR(36,-10,0.8,3,pc);
    if(p<4)ztxt(g,'出发',wx(44),wy(-11.5),pc,Math.max(6,rd(p*5)),null,'c')}
  WR(-2,-2.6,76,1.4,'#0e1311');WR(-1,-1.4,74,0.5,'#fff2b8');
  // ---- the discs ----
  discs(f);
  if(!IM||IM.width!==W)IM=g.createImageData(W,H);
  const cur=g.getImageData(0,0,W,H);const u=new Uint32Array(cur.data.buffer);
  const x0=clamp(fl(wx(0)),0,W),x1=clamp(Math.ceil(wx(BC)),0,W),y0=clamp(fl(wy(0)),0,H),y1=clamp(Math.ceil(wy(BR)),0,H);
  const r=0.43,inv=1/p;
  for(let y=y0;y<y1;y++){const v=C.cv+(y+0.5-H/2)*inv;const j=fl(v);if(j<0||j>=BR)continue;const fv=v-j-0.5;const rowL=0.1-j/BR*0.22;
    for(let x=x0;x<x1;x++){const uu=C.cu+(x+0.5-W/2)*inv;const i=fl(uu);if(i<0||i>=BC)continue;const k=j*BC+i,fu=uu-i-0.5;
      if(p<2.6){const face=PH[k]<0.5?FA[k]:FB[k];u[y*W+x]=face?YEL[PH[k]<1?1:2]:BOARD;continue}
      const e=PH[k],th=e*PI,cy=Math.cos(th),ry=r*Math.abs(cy),face=e<0.5?FA[k]:FB[k],tilt=e>=1?0:(e<0.5?Math.sin(th):-Math.sin(th));
      let col=BOARD;
      if(ry*p<0.7){if(Math.abs(fv)*p<0.55&&Math.abs(fu)<r)col=EDGE}
      else{const vv=fv/ry,uq=fu/r,d2=uq*uq+vv*vv;
        if(d2<=1){const rho=Math.sqrt(d2);let l=tilt*0.95+rowL+(rho>0.7?(-vv*0.55-uq*0.3):0);
          if(p>=10&&(uq+0.35)*(uq+0.35)+(vv+0.42)*(vv+0.42)<0.035&&e>=1)l+=0.9;
          const idx=l>0.62?4:l>0.2?3:l>-0.32?2:l>-0.72?1:0;col=(face?YEL:BLK)[idx]}
        else if(p>=8){// pivot pins at the axis ends, and a little cast shadow lower right
          if(Math.abs(fv)*p<0.6&&(0.5-Math.abs(fu))*p<1.1)col=PIN;
          else{const s1=(fu-0.06)/r,s2=(fv-0.07)/ry;if(s1*s1+s2*s2<=1)col=SHAD}}}
      u[y*W+x]=col}}
  // polished floor: mirror the bright parts of the board and windows (wide shot only)
  if(wide){const fy=Math.round(wy(62));const cache=new Map();const flr=hx(C_('floor'));
    for(let y=fy+1;y<H;y++){const sy=fy-(y-fy)*1.25-1;if(sy<0)break;const syi=fl(sy);for(let x=0;x<W;x++){const xo=x+((Math.sin(y*0.9+f*0.13)>0.85)?1:0);if(xo>=W)continue;const s=u[syi*W+xo];const R_=s&255,G_=(s>>8)&255,B_=(s>>16)&255;
      if(R_+G_+B_>200){let c=cache.get(s);if(c===undefined){const q=v_=>Math.round(v_/8)*8;c=((255<<24)|(clamp(q(flr[2]+(B_-flr[2])*0.32),0,255)<<16)|(clamp(q(flr[1]+(G_-flr[1])*0.32),0,255)<<8)|clamp(q(flr[0]+(R_-flr[0])*0.32),0,255))>>>0;cache.set(s,c)}u[y*W+x]=c}}}}
  g.putImageData(cur,0,0);
  // janitor: leaves at night through the door, comes back at dawn and stops to look at the board
  if(wide){let jx=null,face=-1,walk=true;
    if(f<150){jx=-10-(f/140)*53;if(f>=140){jx=-63}}
    else if(f>=1812){jx=-63+Math.min(1,(f-1812)/96)*73;face=1;walk=f<1908}
    if(jx!=null&&!(f>=142&&f<1812)){const k=p/2,sx=wx(jx),sy=wy(62)-20*k,fr=walk&&(fl(f/6)&1),spr_=fr?JAN2:JAN;
      for(let yy=0;yy<20;yy++)for(let xx=0;xx<11;xx++){const ch=spr_[yy][xx];if(ch==='.')continue;const c=JCOL[ch];const col=mix(mix(c[0],c[1],lit),c[2],dawn);g.fillStyle=col;
        const X=face<0?xx:10-xx;g.fillRect(fl(sx+X*k),fl(sy+yy*k),Math.ceil(k),Math.ceil(k))}}}
}
// ---------- sound ----------
const PENT=[60,62,64,67,69,72,74,76,79,81,84];
function box(A,t0,m,vol){const f=mtof(m);tone(A,'sine',f,t0,1.4,vol,{a:0.003,wet:0.55});tone(A,'sine',f*2.01,t0,0.35,vol*0.25,{a:0.002,wet:0.4});tone(A,'triangle',f*4.02,t0,0.08,vol*0.12,{a:0.001})}
function click(A,t0,vol){noise(A,t0,0.004,vol,'bandpass',2800+Math.random()*2200,{q:1.6});tone(A,'square',150+Math.random()*80,t0,0.008,vol*0.25,{ft:'lowpass',ff:700})}
function sound(A,S,u,pu,t){const T=A.at();
  bed(A,'hum','brown','lowpass',180,0.7);bed(A,'night','brown','bandpass',420,0.6);bed(A,'rain','white','bandpass',2600,0.5);bed(A,'deep','brown','lowpass',260,0.8);
  const lampsOn=u<110?4:u<120?3:u<130?2:u<140?1:0;
  bset(A,'hum',0.04+lampsOn*0.03);bset(A,'night',u>140&&u<1690?0.05:0.02);
  bset(A,'rain',u>=730&&u<1000?(u<770?(u-730)/40:1)*0.12:0,null,0.6);bset(A,'deep',u>=975&&u<1215?0.22:0,null,0.8);
  // every disc that changes face this frame is a click; hundreds at once become a clatter
  if(CT){let n=0;const a=fm(u)*N,b=fm(u-1)*N;for(let k=0;k<N;k++)if(CT[a+k]!==CT[b+k])n++;
    if(n>0&&n<=12){for(let i=0;i<n;i++)click(A,T+Math.random()*0.035,0.09)}
    else if(n>12){const k=Math.log(n)/Math.log(N);noise(A,T,0.05+k*0.09,0.05+k*0.22,'bandpass',3200,{q:0.9,a:0.004});for(let i=0;i<12;i++)click(A,T+Math.random()*0.07,0.08)}}
  if(crossed(pu,u,20)){for(const [m,d] of [[63,0],[66,0]])tone(A,'sawtooth',mtof(m-12),T+d,1.4,0.04,{ft:'lowpass',ff:700,a:0.15,wet:0.9})}
  for(const lf of [110,120,130,140])if(crossed(pu,u,lf)){tone(A,'sine',90,T,0.22,0.3,{to:40,glide:0.2});noise(A,T,0.01,0.2,'highpass',2000)}
  if(crossed(pu,u,150)){tone(A,'sine',70,T,0.35,0.35,{to:45});noise(A,T,0.06,0.15,'lowpass',500,{wet:0.8})}
  if(crossed(pu,u,1810)){noise(A,T,0.05,0.08,'lowpass',600,{wet:0.6})}
  if((u<140||(u>1812&&u<1908))&&u%12===0)noise(A,T,0.03,0.05,'lowpass',380);
  // the board's dream has a music box
  const ORDER=[2,0,4,1,5,3];for(let k=0;k<6;k++){if(crossed(pu,u,300+k*16))box(A,T,[79,76,74,72,69,67][k],0.08)}
  if(u>=520&&u<580&&u%9===0&&hash(u,1,1)<0.6)box(A,T,PENT[6+fl(hash(u,2,1)*5)],0.05);
  if(u>=580&&u<716&&u%8===0){noise(A,T,0.07,0.06,'bandpass',900,{q:0.8})}
  if(crossed(pu,u,600)){tone(A,'square',mtof(74),T,0.5,0.025,{ft:'lowpass',ff:1600,wet:0.7});tone(A,'square',mtof(78),T,0.5,0.02,{ft:'lowpass',ff:1600,wet:0.7})}
  const RAIN=[64,67,69,67,64,62,60,62,64,67,64,62];if(u>=780&&u<1068&&(u-780)%24===0)box(A,T,RAIN[((u-780)/24)|0],0.06);
  for(const wc of [1060,1135])if(crossed(pu,u,wc)){tone(A,'sine',330,T,2.4,0.08,{to:190,glide:1.8,a:0.4,wet:0.9});tone(A,'sine',495,T+0.3,1.6,0.03,{to:280,glide:1.4,a:0.3,wet:0.9})}
  if(u>=995&&u<1200&&u%7===0&&hash(u,3,3)<0.45)tone(A,'sine',500+hash(u,4,4)*500,T,0.06,0.03,{to:1400,glide:0.06});
  const LUL=[67,64,67,69,67,64,62,64,60,62,64,67,64,62,60];if(u>=1250&&u<1610&&(u-1250)%24===0)box(A,T,LUL[((u-1250)/24)|0],0.07);
  if(u>=1612&&u<1700&&(u-1612)%36===0)box(A,T,84,0.04);
  if(crossed(pu,u,1700)){[[76,0],[72,0.45],[79,0.9]].forEach(([m,d])=>bell(A,T+d,mtof(m),0.05,0.6))}
  if(u>1730&&u%11===0&&hash(u,5,5)<0.5){const f0=2400+hash(u,6,6)*1600;tone(A,'sine',f0,T,0.05,0.025,{to:f0*1.3,glide:0.05});tone(A,'sine',f0*1.1,T+0.07,0.05,0.02,{to:f0*0.9,glide:0.05})}
}
SAMPLES.push({id:'flipdot',name:'翻片屏的一夜',w:W,h:H,thumb:700,
  tags:['72×34 块真实翻转的磁翻片','每片翻面约 2.5 帧，逐列扫描','卡住的、迟到的、发抖的翻片','同一渲染器从 2 像素到 16 像素一片','翻片上的沙子物理','雨伞挡雨','每片翻转都是一下咔哒声','八音盒与鲸歌'],
  about:'车站大厅墙上有一块老式磁翻片显示屏，一共 2448 片圆片，一面荧光黄、一面黑。末班车开走，屏上翻出“今日运营结束”，清洁工拖着拖把出门，四盏吊灯一盏盏熄灭。接下来这块屏开始做梦：字一个个松脱掉下来堆成沙丘，沙丘变成月下的山，最后一班火车冒着蒸汽开过；下起雨，一个打伞的人走过，猫追上来躲到伞下；大厅被水淹没，一头座头鲸游过；水退了，留在空中的气泡聚成“晚安”。天亮，首班车的信息翻出来，清洁工回来了，抬头看了一眼。镜头两次推到很近，能看清每一片翻片怎样绕着轴转过去、在转动中反光。屏上有一片卡住了，永远是黄的；有几片总比别的慢一两拍；还有一片会跟着邻居发抖。打开声音能听到每一片翻转的咔哒声，几百片同时翻就成了一阵哗啦声。一圈 80 秒。',
  controls:[SND_CTL,{type:'button',label:'开头',act(s){s.t=0}},{type:'button',label:'字掉下来',act(s){s.t=288}},{type:'button',label:'火车',act(s){s.t=560}},{type:'button',label:'雨',act(s){s.t=740}},{type:'button',label:'鲸',act(s){s.t=990}},{type:'button',label:'晚安',act(s){s.t=1210}},{type:'button',label:'天亮',act(s){s.t=1680}}],
  init(s){sndInit(s)},onOpt:sndOpt,onLeave:sndOff,tick(s){sndTick(s,LOOP,sound)},draw,
  info(s){return '第 '+fl(fm(s.t)/24)+' 秒 / 80'}});
})();

// ================= N2. 毛衣 =================
// every "pixel" is a knitted stitch, 8x7 screen pixels drawn from a hand-tuned V template with yarn ply, shading and fuzz.
// The panel is knitted row by row from the ribbing up (alternating direction, as in flat knitting), then the Fair Isle
// motifs come alive, then a cat hooks the yarn end and the whole thing unravels from the top. 60 s loop.


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
