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

function ring(g,cx,cy,rx,c,ry){ry=ry==null?rx:ry;cx=rd(cx);cy=rd(cy);g.fillStyle=c;const n=Math.max(16,fl((rx+ry)*5));
  for(let i=0;i<n;i++){const a=i/n*2*PI;g.fillRect(cx+rd(Math.cos(a)*rx),cy+rd(Math.sin(a)*ry),1,1)}}
function poly(g,pts,c){let y0=1e9,y1=-1e9;for(const p of pts){if(p[1]<y0)y0=p[1];if(p[1]>y1)y1=p[1]}g.fillStyle=c;
  for(let y=fl(y0);y<=Math.ceil(y1);y++){const yc=y+0.5,xs=[];
    for(let i=0,j=pts.length-1;i<pts.length;j=i++){const a=pts[i],b=pts[j];if((a[1]>yc)!==(b[1]>yc))xs.push(a[0]+(yc-a[1])/(b[1]-a[1])*(b[0]-a[0]))}
    xs.sort((a,b)=>a-b);for(let k=0;k+1<xs.length;k+=2){const xa=rd(xs[k]),xb=rd(xs[k+1]);if(xb>xa)g.fillRect(xa,y,xb-xa,1)}}}
function hash(a,b,c){let h=Math.imul(a|0,374761393)^Math.imul((b|0)+0x9e37,668265263)^Math.imul((c|0)+0x7f4a,1274126177);
  h=Math.imul(h^(h>>>13),1103515245);h^=h>>>16;h=Math.imul(h,0x45d9f3b);h^=h>>>15;return (h>>>0)/4294967296}
function rng(s){return function(){s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const hx=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];


const SAMPLES=[];

const ease=t=>t<0?0:t>1?1:t*t*(3-2*t);

// ================= masterwork helpers =================
function mkc(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.imageSmoothingEnabled=false;return[c,x]}


// ================= 1. 细胞里的搬运工 =================


// ================= 2. 一滴露水 =================
(function(){
const W=320,H=180,LOOPT=24*22,DX0=196,DR=31;
let LAY=null;
const top=(x,t)=>136-x*0.13+Math.sin(x/90+0.6)*5+Math.sin(t*0.04)*0.8*(x/W); // the blade's upper edge
function build(){
  const [bg,bx]=mkc(W,H),[env,ex]=mkc(W,H);
  // ---- dawn sky out of focus: wide flat bands, warm low on the right where the sun sits
  const SK=['#2a3a6a','#34467a','#465486','#5c6290','#7a6e94','#9c7a92','#be8a8e','#da9a86','#eeb084','#f8c888'];
  const HS=[20,18,16,15,14,13,12,12,12,48];let y0=0;for(let i=0;i<SK.length;i++){R(bx,0,y0,W,HS[i]+1,SK[i]);if(i){const r=rng(i+3);for(let x=0;x<W;){const w=4+fl(r()*24);if(r()<0.5)R(bx,x,y0-1,w,1,SK[i]);else R(bx,x,y0,w,1,SK[i-1]);x+=w+8+fl(r()*22)}}y0+=HS[i]}
  // sun: a hot disc low on the right with two flat halo rings
  disc(bx,268,64,30,'#f8d090');disc(bx,268,64,21,'#ffe0a0');disc(bx,268,64,13,'#fff2c8');disc(bx,268,64,9,'#ffffff');
  // distant meadow: out-of-focus grass as big soft-edged flat shapes
  const rg=rng(9);
  for(let i=0;i<16;i++){const far=i<8;const x=rg()*W*1.2-30,w=(far?8:14)+rg()*(far?10:18),h=(far?60:90)+rg()*90,lean=(rg()-0.35)*70;
    const c=far?['#a08690','#9a8c90','#8e8a8a'][fl(rg()*3)]:['#5a7a5c','#4e7056','#647e5c'][fl(rg()*3)];const lit=far?'#c8a29a':'#86a070';
    const tx=x+lean,ty=H-h;poly(bx,[[x,H+2],[x+w,H+2],[tx+w*0.12,ty]],c);
    // the sun-side edge of each blade glows one step lighter
    for(let y=ty+4;y<H;y++){const u=(y-ty)/(H-ty);const ex_=tx+w*0.12+(x+w-tx-w*0.12)*u;R(bx,ex_-2,y,2,1,lit)}}
  // bokeh: flat discs with a one-step-lighter rim, warm near the sun, cool elsewhere
  for(let i=0;i<26;i++){const x=rg()*W,y=rg()*120,r=3+rg()*9;const near=Math.hypot(x-268,y-64)<90;const c=near?['#f8d898','#fff0c0']:['#8e88b0','#aca4c8'];if(rg()<0.4&&!near)continue;disc(bx,x,y,r,c[0]);ring(bx,x,y,r,c[1])}
  // a red poppy out of focus, upper left: the drop will show it upside down
  {const fx=92,fy=46;for(let k=0;k<5;k++){const a=k/5*6.28+0.3;disc(bx,fx+Math.cos(a)*11,fy+Math.sin(a)*8,11,'#a0283a')}for(let k=0;k<5;k++){const a=k/5*6.28+0.3;disc(bx,fx+Math.cos(a)*9-1,fy+Math.sin(a)*7-2,8,'#d03a40')}
   disc(bx,fx,fy,5,'#2a1424');for(let k=0;k<10;k++){const a=k/10*6.28;P(bx,fx+Math.cos(a)*6,fy+Math.sin(a)*6,'#f0d050')}
   poly(bx,[[fx-2,fy+8],[fx+2,fy+8],[fx+8,H],[fx+3,H]],'#4a6a40')}
  // ---- env: what the drop sees, the background plus a dim copy of the blade above it (it appears inverted at the bottom of the drop)
  ex.drawImage(bg,0,0);blade(ex,0);
  LAY={bg,env};
}
// blade: a wide grass blade crossing the frame, top face lit, with veins and fine hairs
function blade(g,t){
  for(let x=0;x<W;x++){const y=rd(top(x,t));const th=17;
    R(g,x,y,1,th,'#3e8a3a');R(g,x,y,1,1,'#e8f8a0');R(g,x,y+1,1,1,'#a8d860');R(g,x,y+2,1,3,'#7ab84a');R(g,x,y+5,1,4,'#62a242');R(g,x,y+13,1,3,'#2e6a32');R(g,x,y+16,1,2,'#1c4a28');
    // parallel veins along the blade
    for(const v of[4,8,11])if(((x+v*7)%23)>2)P(g,x,y+v,v===8?'#4e9038':'#56983c');
    // a few cells catch the light
    if(hash(x,3)<0.12)P(g,x,y+3,'#9ad058');if(hash(x,5)<0.08)P(g,x,y+6,'#86c050');
    // fine hairs on the upper edge, lit by the sun
    if(hash(x,9)<0.14){P(g,x,y-1,'#d8f0a0');if(hash(x,10)<0.5)P(g,x+1,y-2,'#fff8c8')}}}
// the drop: a sessile sphere that refracts the world upside down
function drop(g,cx,cy,r,t,dent,wob){
  const env=LAY.envData,ew=W;
  const lt=rd(top(cx,t)); // contact plane
  for(let y=-r-1;y<=r+1;y++)for(let x=-r-1;x<=r+1;x++){const yy=cy+y,xx=cx+x;if(yy>lt+4)continue;
    const a=Math.atan2(y,x);let rr=r+wob*Math.sin(a*4+t*0.5)+(y>r*0.55?-(y-r*0.55)*0.25:0);
    // the ant's mouth presses a dimple into the left side
    if(dent>0){const da=Math.atan2(y+4,x+r);const dd=Math.hypot(x+r,y+4);if(dd<9)rr-=dent*(1-dd/9)*2.4}
    const d=Math.hypot(x,y);if(d>rr)continue;const q=d/rr;let c;
    if(q>0.93)c=(a<-0.5&&a>-2.6)?'#c8e0e8':'#20303e';            // outer rim: lit top, dark bottom
    else if(q>0.86&&(a>0.2&&a<2.9))c='#2a3c48';                     // total internal reflection band
    else{// inverted, magnified view of the world behind
      const k=2.6+q*q*2.2;const sx=rd(cx-x*k),sy=rd(cy-y*k-10);const i=(clamp(sy,0,H-1)*ew+clamp(sx,0,W-1))*4;
      c='#'+((1<<24)|(env[i]<<16)|(env[i+1]<<8)|env[i+2]).toString(16).slice(1)}
    P(g,xx,yy,c)}
  // highlights: a window-shaped specular up-left, a small one opposite
  const hx_=cx-r*0.45,hy=cy-r*0.52;R(g,hx_-3,hy-2,6,3,'#ffffff');R(g,hx_-2,hy-3,4,1,'#ffffff');R(g,hx_-4,hy-1,1,2,'#ffffff');R(g,hx_+3,hy-1,2,1,'#e8f8ff');
  P(g,cx+r*0.5,cy+r*0.42,'#ffffff');P(g,cx+r*0.5+1,cy+r*0.42,'#ffffff');P(g,cx+r*0.5,cy+r*0.42+1,'#d8ecf0');
  // caustic: the drop focuses the low sun into a bright spot on the blade, on the side away from the light
  const kx=rd(cx-r*0.5);const ky=rd(top(kx,t))+2;R(g,kx-6,ky+1,10,2,'#fff8b0');R(g,kx-4,ky+3,6,1,'#f0f8a0');P(g,kx-2,ky+1,'#ffffff');P(g,kx-1,ky+1,'#ffffff');
  // shadow under the drop's contact line, toward the viewer
  for(let x=-r+6;x<r-2;x++){const yy=rd(top(cx+x,t))+5;if(Math.abs(x)<r-8)P(g,cx+x,yy,'#4e9038')}}
// ---- the ant, side view facing right, walking on the blade
const AK=['#120a08','#2a1610','#4a2416','#7a3a1c','#c8642a','#ffb060'];
function seg(g,x,y,rx,ry,ang){// body segment: dark chitin, a clean two-step crescent where the sun (upper right) grazes it, one gloss pixel
  const ca=Math.cos(ang),sa=Math.sin(ang),ins=(px,py)=>{const dx=px-x,dy=py-y,i=dx*ca+dy*sa,j=-dx*sa+dy*ca;return(i*i)/(rx*rx)+(j*j)/(ry*ry)<=1};
  const R0=Math.ceil(Math.max(rx,ry))+1;
  for(let py=fl(y-R0);py<=y+R0;py++)for(let px=fl(x-R0);px<=x+R0;px++){const cx=px+0.5,cy=py+0.5;if(!ins(cx,cy))continue;let c=AK[1];
    if(!ins(cx+1.5,cy-1.5))c=AK[4];else if(!ins(cx+2.6,cy-2.6))c=AK[3];else if(!ins(cx-1.2,cy+1.6))c=AK[0];P(g,px,py,c)}
  P(g,fl(x+rx*0.25),fl(y-ry*0.45),AK[2]);P(g,fl(x+rx*0.25)+1,fl(y-ry*0.45),AK[2])}
function leg2(g,hx,hy,fx,fy,len1,len2,col,up){// two-bone leg with the knee raised
  const dx=fx-hx,dy=fy-hy,d=Math.min(Math.hypot(dx,dy),len1+len2-0.5);const a=Math.atan2(dy,dx);const c=clamp((len1*len1+d*d-len2*len2)/(2*len1*d),-1,1);const k=a-up*Math.acos(c);
  const kx=hx+Math.cos(k)*len1,ky=hy+Math.sin(k)*len1;L(g,hx,hy,kx,ky,col,2);L(g,kx,ky,fx,fy,col);P(g,kx,ky-1,AK[3]);P(g,fx,fy,AK[2])}
function ant(g,t,ax,mode,ph,f0){// ax = x of the petiole; f0 = facing, 1 right, -1 left, in between while turning (the body foreshortens)
  const f=Math.sign(f0||1)*Math.max(0.3,Math.abs(f0)),sg=Math.sign(f),af=Math.abs(f);const ang=Math.atan2(top(ax+6,t)-top(ax-6,t),12);const gy=x=>top(x,t);const by=gy(ax)-9;
  const head=mode==='drink'?Math.sin(t*0.25)*0.7+2.5:0;
  const ca=Math.cos(ang),sa=Math.sin(ang),Z=1.5,at=(u,v)=>[ax+Z*(f*u*ca-v*sa),by+Z*(f*u*sa+v*ca)];
  const A=o=>sg>0?ang+o:PI+ang-o; // body-relative angle in world
  const legs=[-1,3,7];
  const drawL=(side)=>{for(let i=0;i<3;i++){let fxw,fy,lift=0;const hip=at(8,side?1:2);
      if(mode==='walk'){const p=((ph+(i===1?0.5:0)+(side?0.5:0))%1);const stance=p<0.55;const sw=stance?(0.5-p/0.55):(-0.5+(p-0.55)/0.45);
        fxw=hip[0]+f*((i-1)*11+sw*10)+(side?-1:1);lift=stance?0:Math.sin((p-0.55)/0.45*PI)*4}
      else fxw=hip[0]+f*((i-1)*12+(side?-1:1));
      fy=gy(fxw)-1-lift-(side?1:0);leg2(g,hip[0],hip[1],fxw,fy,10,12,side?AK[1]:AK[0],sg)}};
  drawL(1);
  const G=at(-6,-1);seg(g,G[0],G[1],10.5*Math.max(0.6,af),7.5,A(-0.25));const pt=at(1,0);disc(g,pt[0],pt[1]-1,2.2,AK[1]);P(g,pt[0]+1,pt[1]-3,AK[4]);
  const M=at(7,-1);seg(g,M[0],M[1],7.5*Math.max(0.5,af),3.8,A(-0.12));const M2=at(9,-3);seg(g,M2[0],M2[1],3,3,A(0));
  const Hc=at(15,-2+head);seg(g,Hc[0],Hc[1],6*Math.max(0.7,af),4.5,A(0.35+head*0.12));
  const ey=at(16,-3+head);R(g,ey[0]-1,ey[1],3,2,'#3a3436');P(g,ey[0]+sg,ey[1],'#ffffff');
  const mj=at(19,1+head);L(g,mj[0]-2*sg,mj[1]-1,mj[0]+2*sg,mj[1]+1,AK[3]);L(g,mj[0]-2*sg,mj[1],mj[0]+sg,mj[1]+2,AK[2]);if(mode==='drink'&&Math.sin(t*0.5)>0)P(g,mj[0]+2*sg,mj[1]+1,'#c8e8f0');
  for(const sd of[1,0]){const tap=mode==='drink'?Math.sin(t*0.3+sd*2)*0.5:Math.sin(t*0.2+sd)*0.3;const b=at(16,-4+head);
    const e=[b[0]+Math.cos(A(-1.9+sd*0.2))*9,b[1]+Math.sin(A(-1.9+sd*0.2))*9];const fq=[e[0]+Math.cos(A(-0.2+tap))*12,e[1]+Math.sin(A(-0.2+tap))*12];
    L(g,b[0],b[1],e[0],e[1],sd?AK[1]:AK[2]);L(g,e[0],e[1],fq[0],fq[1],sd?AK[1]:AK[2]);P(g,fq[0],fq[1],AK[3]);if(!sd)P(g,e[0],e[1]-1,AK[4])}
  drawL(0);
  for(let i=-15;i<28;i++)P(g,ax+f*i,rd(gy(ax+f*i))+1,'#2e7a30')}
function draw(s,g){if(!LAY){build();LAY.envData=LAY.env.getContext('2d').getImageData(0,0,W,H).data}
  const t=s.t,lt=t%LOOPT;
  g.drawImage(LAY.bg,0,0);
  // pollen and dust drifting through the low sunlight, glinting when they turn
  for(let i=0;i<26;i++){const x=((hash(i,1)*W+t*(0.15+hash(i,2)*0.25))%(W+20))-10,y=hash(i,3)*150+Math.sin(t*0.03+i)*8;const gl=Math.sin(t*0.13+i*2)>0.85;P(g,x,y,gl?'#ffffff':'#f8e0a0');if(gl){P(g,x-1,y,'#ffe8b0');P(g,x+1,y,'#ffe8b0')}}
  blade(g,t);
  // timeline: the ant walks in (0-7 s), drinks (7-15 s), turns round (15-16.6 s) and leaves (to 22 s)
  const sec=lt/24;let ax,mode,ph;const stop=DX0-DR-31;
  if(sec<7){ax=-30+(stop+30)*ease(sec/7*1.15>1?1:sec/7*1.15);mode='walk';ph=(lt*0.06)%1}
  else if(sec<15){ax=stop;mode='drink';ph=0}
  else if(sec<16.6){ax=stop;mode='walk';ph=(lt*0.05)%1}
  else{ax=stop-(sec-16.6)*16;mode='walk';ph=(lt*0.06)%1}
  // the turn: the body swings round through a foreshortened view instead of flipping
  const fc=sec<15?1:sec<16.6?Math.cos(PI*ease((sec-15)/1.6)):-1;
  const cx=DX0,cy=rd(top(DX0,t))+4-DR;
  const wob=sec>7&&sec<15?0.5+0.4*Math.sin(t*0.21):Math.max(0,0.8-(sec<7?0:(sec-15))*0.3)*Math.sin(t*0.4)*0.6;
  if(fc>0)ant(g,t,ax+16*(1-fc)/2,mode,ph,fc);
  drop(g,cx,cy,DR,t,mode==='drink'?1+Math.sin(t*0.25)*0.6:0,wob);
  if(fc<=0)ant(g,t,ax+16*(1-fc)/2,'walk',ph,fc);
  drop(g,286,rd(top(286,t))+3-9,9,t,0,0.2);
  for(const hx_ of[40,62,118,238,262,304]){const yy=rd(top(hx_,t))-2;P(g,hx_,yy,'#e8f8ff');P(g,hx_+1,yy,'#6a8aa0');P(g,hx_,yy+1,'#8ab0c0')}
}
SAMPLES.push({id:'dew',name:'一滴露水',w:W,h:H,thumb:24*10,
  tags:['昆虫尺度','球形水滴的倒像折射','焦散光斑','三足交替步态','触角敲击与水面颤动','逆光绒毛'],
  about:'清晨，一只蚂蚁沿着一片草叶走到一滴露水前。在它的尺度上，这滴水比它的身体还高，像一颗透明的星球：里面倒映着整个世界，天空在下、草叶在上，左上角那朵红色的虞美人在水滴里倒过来开放。低斜的太阳被水滴聚焦，在叶面上烧出一个亮斑。蚂蚁用触角试探、低头喝水，嘴碰到水面时水滴会凹进去并轻轻颤动。水滴里的倒像是逐像素按折射方向从背景里取色得到的，没有缩放混色。',
  controls:[],init(s){},tick(s){},draw,
  info(s){return fl((s.t%LOOPT)/24)+' 秒 / 22'}});
})();

// ================= 3. 黑烟囱 =================


// ================= 4. 星系相撞 =================


// ================= 5. 十的二十六次方 =================


// ================= 6. 黑洞 =================


// ================= 7. 太阳边缘 =================


// ================= 8. 雪花 =================


// ================= 9. 坠入指尖 =================


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
for(const[v,l]of [[0.25,'¼'],[0.5,'½'],[1,'1×'],[2,'2×']]){const b=document.createElement('button');b.type='button';b.textContent=l;b.dataset.v=v;b.onclick=()=>{speed=v;for(const x of $('spd').children)x.classList.toggle('on',+x.dataset.v===speed)};$('spd').appendChild(b)}
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
