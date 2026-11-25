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

const U=h=>{const a=hx(h);return((255<<24)|(a[2]<<16)|(a[1]<<8)|a[0])>>>0};
function vn(x,seed){const i=fl(x),f=x-i,a=hash(i,seed),b=hash(i+1,seed),u=f*f*(3-2*f);return a+(b-a)*u}


const SAMPLES=[];


// ================= masterwork helpers =================
function mkc(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.imageSmoothingEnabled=false;return[c,x]}

// rising puffs (steam, smoke, breath): stateless, a puff's age comes from time so any frame can be drawn
const BLOB=[['#'],['##','##'],['.##.','####','.##.'],['.###.','#####','#####','.###.']];
function blob(g,x,y,s,col){const b=BLOB[s];g.fillStyle=col;const ox=fl(x)-fl(b[0].length/2),oy=fl(y)-fl(b.length/2);for(let j=0;j<b.length;j++)for(let i=0;i<b[j].length;i++)if(b[j][i]==='#')g.fillRect(ox+i,oy+j,1,1)}


// ================= 1. 雪夜公寓 =================


// ================= 2. 色彩循环瀑布 =================


// ================= 3. 雨夜窗边 =================


// ================= 4. 巨像 =================
(function(){
const W=320,H=180,GROUND=150,LOOPT=1440,V=540/LOOPT,TG=160;
const SUN=[236,104,25];
let LAY=null;
const SKYC=['#1c1238','#26164a','#341a56','#4a1f60','#642664','#823062','#a23c5e','#c24e58','#de6650','#f0844a','#f8a64c','#ffc45a'];
function build(){
  const [bg,bx]=mkc(W,H),[fg,fx]=mkc(W,H),[cl,cx]=mkc(W*2,60),[m1,mx1]=mkc(W*2,30),[m2,mx2]=mkc(W*2,24);
  // sky bands, wide at the zenith and compressed toward the horizon, each edge broken by a few 1px steps
  {const HS=[15,13,12,11,10,9,8,8,7,6,5,4];let y0=0;for(let i=0;i<SKYC.length;i++){R(bx,0,y0,W,HS[i]+2,SKYC[i]);if(i>0){const rs=rng(40+i);let x=0;while(x<W){const w=6+fl(rs()*30);if(rs()<0.5)R(bx,x,y0-1,w,1,SKYC[i]);else R(bx,x,y0,w,1,SKYC[i-1]);x+=w+4+fl(rs()*26)}}y0+=HS[i]}R(bx,0,y0,W,H-y0,SKYC[11])}
  // the setting sun, sliced by thin bands of haze
  disc(bx,SUN[0],SUN[1],SUN[2]+12,'#f8b058');disc(bx,SUN[0],SUN[1],SUN[2]+6,'#ffc868');
  for(let y=-SUN[2];y<=SUN[2];y++){const w=fl(Math.sqrt(SUN[2]*SUN[2]-y*y));const yy=SUN[1]+y;if(y>6&&(yy%5)<Math.min(3,(y-6)/5))continue;R(bx,SUN[0]-w,yy,w*2+1,1,y<-10?'#fff6d0':y<4?'#ffe8a0':'#ffd480')}
  // far mesas on the horizon
  const rm=rng(3);let x=-10;while(x<W){const w=24+fl(rm()*44),h=4+fl(rm()*10)+(rm()<0.35?10:0);const top=108-h,sl=3+fl(rm()*5);poly(bx,[[x,110],[x+sl,top],[x+w-sl,top],[x+w,110]],'#a24a62');L(bx,x+sl,top,x+w-sl,top,'#e07a6a');L(bx,x+w-sl,top,x+w,110,'#c86068');x+=w+fl(rm()*26)}
  // the plain, banded toward the viewer
  const PL=[[110,'#b85a62'],[116,'#a24c5e'],[124,'#8c4058'],[134,'#763650'],[146,'#622c48'],[160,'#4e2440']];for(let i=0;i<PL.length;i++){const y0=PL[i][0],y1=i+1<PL.length?PL[i+1][0]:H;R(bx,0,y0,W,y1-y0,PL[i][1])}
  for(let i=0;i<60;i++){const xx=fl(rm()*W),yy=112+fl(rm()*40);R(bx,xx,yy,2+fl(rm()*4),1,'#d07a6a')}
  // clouds: flat-bottomed strata built as a mask, then shaded by column: warm lit underside, body, dark crown
  {const CW=W*2,CH=60,mk=new Uint8Array(CW*CH),rc=rng(8);
   for(let i=0;i<9;i++){const x0=rc()*CW,base=10+rc()*42,w=40+rc()*110,hh=4+rc()*8*(base<26?0.6:1);
     for(let k=0;k<7;k++){const ex=x0+(k/6)*w,rx=8+rc()*w*0.18,ry=hh*(0.5+0.7*Math.sin((k+0.5)/7*Math.PI))*(0.7+rc()*0.5);
       for(let yy=fl(base-ry);yy<=base;yy++)for(let xx=fl(ex-rx);xx<=ex+rx;xx++){const dx=(xx-ex)/rx,dy=(yy-base)/ry;if(dx*dx+dy*dy<=1&&yy>=0&&yy<CH)mk[yy*CW+((xx%CW)+CW)%CW]=1}}
     // a thin trailing streak under some clouds
     if(rc()<0.6){const sy=fl(base)+2,sx=x0+w*0.1,sw=w*(0.5+rc()*0.6);for(let xx=fl(sx);xx<sx+sw;xx++)if(sy<CH)mk[sy*CW+((xx%CW)+CW)%CW]=1}}
   for(let x=0;x<CW;x++)for(let y=0;y<CH;y++){if(!mk[y*CW+x])continue;let dn=0;while(y+dn+1<CH&&mk[(y+dn+1)*CW+x])dn++;let up=0;while(y-up-1>=0&&mk[(y-up-1)*CW+x])up++;
     const hi=y>=30;const col=dn===0?(hi?'#ffb070':'#e07870'):dn===1?(hi?'#e88068':'#b2526c'):up===0?(hi?'#7a3266':'#3e1a52'):(hi?'#a2466a':'#62286a');P(cx,x,y,col)}}
  // mist strips (drawn moving)
  for(let xx=0;xx<W*2;xx++){const h=6+fl(vn(xx*0.05,3)*10);R(mx1,xx,30-h,1,h,'#d8806a');if(h>8)R(mx1,xx,30-h,1,2,'#e8987a');const h2=4+fl(vn(xx*0.07,5)*9);R(mx2,xx,24-h2,1,h2,'#b0606a');P(mx2,xx,24-h2,'#c8746e')}
  // foreground: rock outcrop, dead tree, grass
  poly(fx,[[0,118],[22,112],[48,114],[74,118],[96,124],[118,138],[132,150],[150,166],[164,180],[0,180]],'#1e1028');
  poly(fx,[[0,132],[30,128],[60,132],[90,140],[120,158],[132,180],[0,180]],'#170c20');
  for(const [a,b] of [[[0,118],[22,112]],[[22,112],[48,114]],[[48,114],[74,118]],[[74,118],[96,124]],[[96,124],[118,138]],[[118,138],[132,150]],[[132,150],[150,166]],[[150,166],[164,180]]]){L(fx,a[0],a[1],b[0],b[1],'#f08a50');L(fx,a[0],a[1]+1,b[0],b[1]+1,'#7a3a3a')}
  for(let i=0;i<5;i++){const yy=128+i*9;L(fx,10+i*14,yy,40+i*16,yy+4,'#2c1836')}
  poly(fx,[[244,180],[262,170],[300,166],[320,168],[320,180]],'#1a0e22');L(fx,262,170,300,166,'#c86a48');L(fx,300,166,320,168,'#c86a48');
  // dead tree on the right
  R(fx,292,118,4,50,'#1a0e22');R(fx,295,118,1,50,'#b0604a');L(fx,294,128,280,110,'#1a0e22',2);L(fx,294,124,310,104,'#1a0e22',2);L(fx,282,112,276,102,'#1a0e22');L(fx,306,106,314,96,'#1a0e22');L(fx,300,112,304,100,'#1a0e22');L(fx,295,104,310,104,'#b0604a');
  LAY={bg,fg,cl,m1,m2};
}
// ---------- the colossus ----------
function legPos(t,ph,hipX,hipY,len){const u=((t/TG+ph)%1+1)%1,s=0.75*V*TG;let rel,lift=0;
  if(u<0.75)rel=-s/2+s*(u/0.75);else{const w=(u-0.75)/0.25,e=w*w*(3-2*w);rel=s/2-s*e;lift=Math.sin(w*Math.PI)*9}
  return{x:hipX+rel,y:GROUND-lift,u,plant:u<0.02}}
function ik(h,f,l1,l2,bend){const dx=f[0]-h[0],dy=f[1]-h[1],d=Math.min(Math.hypot(dx,dy),l1+l2-0.01),a=Math.atan2(dy,dx),c=Math.acos(clamp((l1*l1+d*d-l2*l2)/(2*l1*d),-1,1));const k=a+bend*c;return[h[0]+Math.cos(k)*l1,h[1]+Math.sin(k)*l1]}
function seg(g,a,b,r0,r1,col){const dx=b[0]-a[0],dy=b[1]-a[1],n=Math.hypot(dx,dy)||1,px=-dy/n,py=dx/n;poly(g,[[a[0]+px*r0,a[1]+py*r0],[b[0]+px*r1,b[1]+py*r1],[b[0]-px*r1,b[1]-py*r1],[a[0]-px*r0,a[1]-py*r0]],col);disc(g,b[0],b[1],r1,col)}
function colossus(o,t,cx){const C0='#4a2242',C1='#5c2c4c',C2='#6e365a',C3='#844466',MOSS='#3e2a46';
  const bob=Math.cos(t/TG*Math.PI*4)*1,by=GROUND-37+bob;
  const legs=[{dx:-27,ph:0.25,far:true},{dx:23,ph:0.75,far:true},{dx:-31,ph:0.5,far:false},{dx:27,ph:0,far:false}];
  const feet=[];
  for(const L_ of legs){const hip=[cx+L_.dx+(L_.far?5:0),by+2];const f=legPos(t,L_.ph,hip[0],hip[1]);feet.push(f);if(!L_.far)continue;
    const knee=ik(hip,[f.x,f.y-5],19,18,L_.dx<0?-1:1);seg(o,hip,knee,8,6,C0);seg(o,knee,[f.x,f.y-5],6,6,C0);R(o,f.x-7,f.y-6,14,6,C0)}
  // stubby tail
  for(let i=0;i<5;i++)disc(o,cx+48+i*4,by-8+i*1.6+Math.sin(t*0.04+i*0.6)*0.8,4-i*0.6,C1);
  // shell: an uneven dome, plates, a dark skirt with hanging moss
  const top=[];for(let i=0;i<=40;i++){const a=Math.PI*i/40;top.push([cx+Math.cos(a)*52,by-8-Math.sin(a)*27-vn(i*0.6,5)*3])}
  poly(o,top.concat([[cx-50,by-4],[cx-30,by+2],[cx,by+4],[cx+30,by+2],[cx+50,by-4]]),C1);
  const top2=[];for(let i=0;i<=40;i++){const a=Math.PI*i/40;top2.push([cx+Math.cos(a)*44,by-12-Math.sin(a)*21-vn(i*0.6,5)*3])}poly(o,top2.concat([[cx-44,by-10],[cx+44,by-10]]),C2);
  for(const [x0,y0,x1,y1] of [[-30,-28,-36,-12],[-12,-34,-14,-12],[8,-34,10,-12],[26,-29,32,-12],[-40,-18,40,-18],[-24,-28,22,-28]])L(o,cx+x0,by+y0,cx+x1,by+y1,C1);
  R(o,cx-50,by-8,100,4,C0);for(let i=0;i<20;i++){const mx=cx-48+i*5,ml=2+fl(hash(i,4)*6)+fl(Math.sin(t*0.03+i)*0.6);R(o,mx,by-5,1,ml,MOSS)}
  // ruins on its back: wall, two towers, trees
  R(o,cx-20,by-42,38,6,C1);for(let i=0;i<7;i++)R(o,cx-20+i*6,by-44,3,2,C1);
  R(o,cx-14,by-60,7,18,C1);poly(o,[[cx-15,by-60],[cx-10.5,by-68],[cx-6,by-60]],C1);
  R(o,cx+2,by-66,10,24,C1);ell(o,cx+7,by-66,5,4,C1);R(o,cx+6,by-74,1,5,C1);
  for(let i=0;i<3;i++){R(o,cx-4+i*0,by-52,1,0,C1)}
  for(const [tx,ty,tr] of [[cx-30,by-38,5],[cx-25,by-42,4],[cx+24,by-39,4],[cx+29,by-36,3]])disc(o,tx,ty,tr,C0);
  // head, crest and jaw; it nods with each step
  const nod=Math.sin(t/TG*Math.PI*2)*1.5,hx=cx-64,hy=by-16+nod;
  seg(o,[cx-40,by-16],[hx+8,hy],12,9,C1);
  poly(o,[[hx-11,hy-6],[hx+6,hy-9],[hx+11,hy-1],[hx+8,hy+8],[hx-8,hy+9],[hx-14,hy+3]],C2);
  poly(o,[[hx+1,hy-8],[hx+8,hy-18],[hx+19,hy-22],[hx+11,hy-15],[hx+6,hy-6]],C1);
  poly(o,[[hx-11,hy+5],[hx-4,hy+9],[hx-9,hy+13],[hx-14,hy+9]],C3);L(o,hx-12,hy+2,hx+2,hy+4,C1);
  // near legs
  for(let i=0;i<4;i++){const L_=legs[i];if(L_.far)continue;const hip=[cx+L_.dx,by-1];const f=feet[i];const knee=ik(hip,[f.x,f.y-5],19,18,L_.dx<0?-1:1);
    seg(o,hip,knee,9,7,C1);seg(o,knee,[f.x,f.y-5],7,7,C1);R(o,f.x-8,f.y-6,16,6,C1);R(o,f.x-8,f.y-6,16,1,C2);for(let k=0;k<3;k++)P(o,f.x-6+k*5,f.y-1,C0);
    for(let k=1;k<3;k++){const a=[hip[0]+(knee[0]-hip[0])*k/3,hip[1]+(knee[1]-hip[1])*k/3];R(o,a[0]-6,a[1],12,1,C0)}}
  return{feet,hx,hy,by}}
function draw(S,g){if(!LAY)build();const t=S.t,lt=t%LOOPT;
  const cx=W+100-lt*V;
  // footfalls shake the ground a little
  let shake=0;{const u0=((t/TG)%1+1)%1;for(const ph of [0,0.5]){const u=((t/TG+ph)%1+1)%1;if(u<0.02&&cx>-60&&cx<W+60)shake=1}}
  const O=S.o||(S.o=mkc(W,H)),o=O[1];o.clearRect(0,0,W,H);
  o.drawImage(LAY.bg,0,0);
  const cs=fl(t*0.05)%(W*2);o.drawImage(LAY.cl,-cs,0);o.drawImage(LAY.cl,W*2-cs,0);
  // the colossus on its own layer so its outline can catch the sunset
  const C=S.c||(S.c=mkc(W,H)),c=C[1];c.clearRect(0,0,W,H);c.imageSmoothingEnabled=false;
  const info=colossus(c,t,cx);
  rimLight(C,t);
  // glowing windows and eyes
  const by=info.by;for(const [wx,wy] of [[-11,-56],[-11,-51],[5,-62],[8,-56],[5,-50],[-16,-40],[-8,-40],[0,-40],[10,-40]]){if(hash(wx,fl(t/50),3)<0.85)P(c,cx+wx,by+wy,'#ffd890')}
  const eg=(t%90)<60?'#c8f8ff':'#80d8f0';P(c,info.hx-6,info.hy-3,eg);P(c,info.hx-5,info.hy-3,eg);P(c,info.hx-6,info.hy-2,'#60b8d0');
  // sand pouring from the shell's rim
  for(const sx of [-12,14]){const top=fl(by+4);for(let y=top;y<GROUND-4;y++){if(((y+fl(t*1.1)+sx)%9)<5)P(c,cx+sx+fl(Math.sin(y*0.3)*0.6),y,'#9a5266')}}
  o.drawImage(C[0],0,0);
  // dust where feet come down, rising out of the mist
  for(let i=0;i<info.feet.length;i++){const f=info.feet[i];const u=f.u;if(u>0.5)continue;const k=u/0.5,r=4+k*16,yy=GROUND-2-k*10;const col=k<0.3?'#e8a888':k<0.6?'#d08878':'#b87070';
    for(let j=0;j<5;j++){const ax=f.x+(j-2)*r*0.45,ay=yy+Math.abs(j-2)*2;blob(o,ax,ay,k<0.25?3:k<0.6?3:2,col)}}
  // birds circling the towers
  for(let i=0;i<9;i++){const a=t*0.02+i*0.7,rr=20+(i%3)*7,bx=cx+Math.cos(a)*rr*1.4,by2=info.by-66+Math.sin(a)*rr*0.35,f=(fl(t/5)+i)%2;const bc='#3a1a3a';P(o,bx,by2,bc);P(o,bx-1,by2-f,bc);P(o,bx+1,by2-f,bc);P(o,bx-2,by2-1+f,bc);P(o,bx+2,by2-1+f,bc)}
  // mist in front of its legs
  const ms=fl(t*0.12)%(W*2);o.drawImage(LAY.m1,-ms,GROUND-26);o.drawImage(LAY.m1,W*2-ms,GROUND-26);
  const ms2=fl(t*0.2)%(W*2);o.drawImage(LAY.m2,-ms2,GROUND-6);o.drawImage(LAY.m2,W*2-ms2,GROUND-6);
  o.drawImage(LAY.fg,0,0);
  // the traveller on the rock, scarf streaming in the wind
  traveler(o,t);
  // grass on the outcrop
  for(let i=0;i<10;i++){const gx=6+i*9,gy=fl(118-i*0.3)+(i>5?(i-5)*1.2:0),sw=rd(Math.sin(t*0.08+i)*1.2);L(o,gx,gy,gx-2+sw,gy-5,'#1e1028');L(o,gx+2,gy,gx+3+sw,gy-4,'#1e1028');P(o,gx-2+sw,gy-5,'#c86a48')}
  g.imageSmoothingEnabled=false;g.fillStyle='#1c1238';g.fillRect(0,0,W,H);g.drawImage(O[0],0,shake)}
function rimLight(C,t){const ctx=C[1],im=ctx.getImageData(0,0,W,H),u=new Uint32Array(im.data.buffer);
  const RIM=U('#ffb070'),RIM2=U('#d27860'),HOT=U('#fff0c0');const out=new Uint32Array(u);
  for(let y=1;y<H-1;y++)for(let x=1;x<W-2;x++){const i=y*W+x;if(!(u[i]>>>24))continue;const er=!(u[i+1]>>>24),eu=!(u[i-W]>>>24),er2=!(u[i+2]>>>24);
    if(er||eu){const d=Math.hypot(x-SUN[0],y-SUN[1]);out[i]=d<SUN[2]+16?HOT:RIM}else if(er2){out[i]=RIM2}}
  u.set(out);ctx.putImageData(im,0,0)}
function traveler(o,t){const x=66,y=113;const K='#140a18',RIM='#ffa060';
  // cloak, body, hood
  poly(o,[[x-3,y-12],[x+2,y-12],[x+4,y],[x-5,y]],K);disc(o,x,y-14,3,K);R(o,x-2,y,2,1,K);R(o,x+1,y,2,1,K);
  L(o,x+3,y-15,x+3,y-12,RIM);P(o,x+2,y-17,RIM);L(o,x+3,y-11,x+4,y-1,RIM);
  L(o,x+6,y-18,x+6,y,'#3a2030');P(o,x+6,y-19,RIM);
  // cloak hem flutters
  const fl_=Math.sin(t*0.2)>0?1:0;P(o,x-6,y-1-fl_,K);P(o,x-5,y-2,K);
  // scarf
  for(let i=0;i<12;i++){const sx=x-2-i,sy=y-12+Math.sin(t*0.25-i*0.6)*(i*0.25)+i*0.15;P(o,sx,sy,i<2?'#ff6a4a':'#e0403a');if(i>2&&i<10)P(o,sx,sy+1,'#a02a30')}}
SAMPLES.push({id:'colossus',name:'巨像',w:W,h:H,thumb:600,
  tags:['尺度对比','四足步态反向运动学','逆光轮廓光','迈步扬尘与地面震动','背上的遗迹与鸟群','雾中脚步'],
  about:'一头背着整座古城的石头巨兽，在黄昏的荒原上缓慢走过。它的四条腿按真实的步态交替落地，脚掌着地时扬起尘土、地面轻轻一震；背上的塔楼亮着灯，鸟群绕着塔飞。我们和前景石头上的旅人一起，从很远的地方看它：太阳在它身后，所以它几乎是一整块剪影，只有边缘被夕阳点亮，走到太阳正前方时轮廓会烧成白金色。一趟走完一分钟。',
  controls:[],init(s){},tick(s){},draw,
  info(s){return '第 '+fl((s.t%LOOPT)/24)+' 秒 / 60'}});
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
