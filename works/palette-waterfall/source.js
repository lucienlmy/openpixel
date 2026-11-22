// SPDX-License-Identifier: MIT
// Copyright (c) 2026 喵老弟 / MarkMFFF

"use strict";
// ================= helpers =================
const fl=Math.floor, rd=Math.round, PI=Math.PI, D2R=PI/180;
const clamp=(v,a,b)=>v<a?a:v>b?b:v;

function hash(a,b,c){let h=Math.imul(a|0,374761393)^Math.imul((b|0)+0x9e37,668265263)^Math.imul((c|0)+0x7f4a,1274126177);
  h=Math.imul(h^(h>>>13),1103515245);h^=h>>>16;h=Math.imul(h,0x45d9f3b);h^=h>>>15;return (h>>>0)/4294967296}
function rng(s){return function(){s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const hx=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];


const SAMPLES=[];


// ================= 1. 雪夜公寓 =================


// ================= 2. 色彩循环瀑布 =================
(function(){
const W=320,H=180;
// ---------- the index buffer is painted once; afterwards only the palette changes ----------
const M={};let NI=1;
function mat(name,n,o){M[name]=Object.assign({b:NI,n},o||{});NI+=n;if(o&&o.twin){M[name].tb=NI;NI+=n}if(o&&o.twin2){M[name].t2=NI;NI+=n}}
const NB=12,NC=8;
mat('sky',NB);mat('cel',NC*7);mat('cloud',3);
mat('mtnFar',4,{a0:'#4c5a8e',a1:'#c4c8dc',d:0.62});mat('hillTree',3,{a0:'#1e3a44',a1:'#5a8060',d:0.34});
mat('rock',6,{a0:'#3a3a58',a1:'#c4b498',d:0.06,twin:1,twin2:1});mat('moss',4,{a0:'#1e4a42',a1:'#9ac868',d:0.06,twin:1});mat('vine',3,{a0:'#1a3c3a',a1:'#6aa858',d:0.05});
mat('foliN',5,{a0:'#122c30',a1:'#86c060',d:0});mat('foliM',4,{a0:'#1a3a3c',a1:'#78b058',d:0.12});mat('trunk',4,{a0:'#2a1e2a',a1:'#9a7a5a',d:0});
mat('fern',3,{a0:'#123a34',a1:'#7ac86a',d:0,twin:1});mat('grass',4,{a0:'#1c4034',a1:'#b4d070',d:0.02,twin:1,twin2:1});mat('dirt',3,{a0:'#2e2430',a1:'#a88660',d:0.02,twin:1,twin2:1});mat('stone',4,{a0:'#4a4a5a',a1:'#c8c4b4',d:0,twin:1,twin2:1});mat('flower',2,{a0:'#8a3060',a1:'#ffb0cc',d:0,twin:1});
mat('fall',8);mat('fall2',6);mat('pool',6);mat('river',8);mat('foam',4);mat('wdeep',3);mat('upriver',4);mat('mist',4);mat('mist2',4);mat('glow',3);mat('spray',3);
const CYCLES=[['fall',1,0.42],['fall2',1,0.5],['pool',1,0.16],['river',1,0.22],['foam',1,0.3],['upriver',1,0.25],['mist',1,0.03],['mist2',-1,0.02]];
let IB=null,LUT=new Uint32Array(256),PAL=new Array(256);
function n2(x,y,s){const xi=fl(x),yi=fl(y),xf=x-xi,yf=y-yi,u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);const a=hash(xi,yi,s),b=hash(xi+1,yi,s),c=hash(xi,yi+1,s),d=hash(xi+1,yi+1,s);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v}
function fb(x,y,s,o){o=o||4;let a=0,m=0.5,f=1,t=0;for(let i=0;i<o;i++){a+=n2(x*f,y*f,s+i*17)*m;t+=m;m*=0.5;f*=2.03}return a/t}
const LAN=[262,122];// stone lantern: things within reach of its light use twin indices
function put(x,y,name,s,lit){x=fl(x);y=fl(y);if(x<0||y<0||x>=W||y>=H)return;const m=M[name];s=clamp(fl(s),0,m.n-1);let b=m.b;
  if(m.tb&&lit!==false){const d=Math.hypot(x-LAN[0],(y-LAN[1])*1.5),e=n2(x*0.25,y*0.25,5)*10;if(d<16+e)b=m.tb;else if(m.t2&&d<30+e)b=m.t2}IB[y*W+x]=b+s}
const q=(v,n)=>clamp(fl(v*n),0,n-1);
function paint(){IB=new Uint8Array(W*H);const rb=rng(12);
  // sky bands, sun, moon, stars
  for(let y=0;y<H;y++)for(let x=0;x<W;x++)IB[y*W+x]=M.sky.b+Math.min(NB-1,fl(y/7));
  const cel=(x,y,l)=>{const bd=Math.min(NB-1,fl(y/7));if(bd>=NC)return;IB[y*W+x]=M.cel.b+bd*7+l};
  const SUN=[212,30],MOON=[112,17];
  for(let y=-16;y<=16;y++)for(let x=-16;x<=16;x++){const d=Math.hypot(x,y);if(d<=6.4)cel(SUN[0]+x,SUN[1]+y,0);else if(d<=10)cel(SUN[0]+x,SUN[1]+y,1);else if(d<=14.5)cel(SUN[0]+x,SUN[1]+y,2)}
  for(let y=-6;y<=6;y++)for(let x=-6;x<=6;x++){const d=Math.hypot(x,y);if(d<=5.6){const sh=Math.hypot(x+2.4,y-1.8)>5.3;cel(MOON[0]+x,MOON[1]+y,sh?4:3)}}
  const rs=rng(4);for(let i=0;i<110;i++){const x=fl(rs()*W),y=fl(rs()*56);if(Math.hypot(x-SUN[0],y-SUN[1])<16||Math.hypot(x-MOON[0],y-MOON[1])<8)continue;cel(x,y,rs()<0.25?5:6)}
  for(const [cx,cy,w] of [[70,14,64],[250,8,56],[160,24,40],[296,30,36],[20,30,30]]){for(let x=-w/2;x<w/2;x++){const top=fl(2+fb((cx+x)*0.07,cy,9,3)*6-Math.abs(x)/w*5);for(let y=-top;y<=1;y++){const xx=fl(cx+x),yy=cy+y;if(xx<0||xx>=W||yy<0)continue;IB[yy*W+xx]=M.cloud.b+(y>=0?2:y>-2?1:0)}}}
  // far mountains: several peaks, sunlit faces lighter, snow on the tops
  const ridge=x=>{let v=0,a=1,f=0.011;for(let i=0;i<4;i++){v+=a*(1-Math.abs(n2(x*f,i*3.1,37)*2-1));a*=0.5;f*=2.2}return 58-v*24};
  const RG=[];for(let x=-20;x<W+20;x++)RG.push(ridge(x));const ex=[];for(let i=2;i<RG.length-2;i++){if(RG[i]<RG[i-1]&&RG[i]<=RG[i+1]&&RG[i]<RG[i-2]&&RG[i]<=RG[i+2])ex.push([i-20,RG[i],1]);else if(RG[i]>RG[i-1]&&RG[i]>=RG[i+1]&&RG[i]>RG[i-2]&&RG[i]>=RG[i+2])ex.push([i-20,RG[i],0])}
  for(let x=0;x<W;x++){const top=fl(ridge(x));for(let y=top;y<110;y++){let best=null,bd=1e9;for(const e of ex){const lx=e[0]+(y-e[1])*(e[2]?0.35:-0.25);if(lx<=x&&x-lx<bd){bd=x-lx;best=e}}
      let s=best&&best[2]===1?0:2;if(best&&best[2]===0&&bd<2)s=1;if(y-top<2&&top<42)s=3;else if(y-top<1)s=Math.max(s,1);put(x,y,'mtnFar',s,false)}}
  for(let x=0;x<W;x++){const y0=46+fl(n2(x*0.05,1,7)*3),y1=y0+3+fl(n2(x*0.04,2,7)*4);for(let y=y0;y<y1;y++)IB[y*W+x]=M.mist.b+(fl(x/7+n2(x*0.1,y*0.3,3)*3))%4}
  // forested hills: overlapping conifers, lit on the left
  const hill=x=>52+fb(x*0.018,3,13,3)*10;
  for(let x=0;x<W;x++)for(let y=fl(hill(x))+3;y<130;y++)put(x,y,'hillTree',0,false);
  const trees=[];for(let i=0;i<190;i++){const x=rb()*W;trees.push([x,hill(x)+rb()*10,5+rb()*7])}trees.sort((a,b)=>a[1]-b[1]);
  for(const [x,yb,h] of trees){for(let k=0;k<h+3;k++){const yy=fl(yb-h+k),half=fl(Math.min(k,h)/h*h*0.34)+(k%3===2?1:0);for(let dx=-half;dx<=half;dx++)put(x+dx,yy,'hillTree',dx<0?2:dx===0&&k<h*0.6?2:dx<=1?1:0,false)}}
  // ---- the amphitheatre of rock around the fall: chunky blocks with bevelled edges and moss on their tops
  const ctop=x=>56-Math.pow(Math.min(1,Math.abs(x-160)/130),1.4)*16+n2(x*0.07,0,21)*5;
  const CW=19,CH=11,pt=(i,j)=>[i*CW+hash(i,j,61)*CW,j*CH+hash(i,j,62)*CH];
  const cid=new Int32Array(W*H).fill(-1),crack=new Uint8Array(W*H);
  for(let y=30;y<136;y++)for(let x=0;x<W;x++){if(y<ctop(x))continue;const ci=fl(x/CW),cj=fl(y/CH);let d1=1e9,d2=1e9,id=0;
    let id2=0;const wx=x+n2(x*0.15,y*0.15,4)*6-3,wy=y+n2(x*0.15,y*0.15,5)*4-2;for(let j=cj-1;j<=cj+1;j++)for(let i=ci-1;i<=ci+1;i++){const p_=pt(i,j),dx=(wx-p_[0])*0.8,dy=(wy-p_[1])*1.3,d=Math.hypot(dx,dy);const k=(i+50)*1000+j+50;if(d<d1){d2=d1;id2=id;d1=d;id=k}else if(d<d2){d2=d;id2=k}}
    cid[y*W+x]=id;if(d2-d1<1.05&&hash(Math.min(id,id2),Math.max(id,id2),77)<0.62)crack[y*W+x]=1}
  for(let y=30;y<136;y++)for(let x=0;x<W;x++){const i=y*W+x,id=cid[i];if(id<0)continue;
    if(crack[i]){put(x,y,'rock',0);continue}
    let s=0.56-(hash(id,1,0)*2-1)*0.2-(hash(id,2,0)*1.2-0.7)*0.25-(y-ctop(x))/80*0.28;
    if(Math.abs(x-160)<24)s-=0.14;
    const up=y>0?cid[i-W]:-1,lf=cid[i-1],dn=cid[i+W],rt=cid[i+1];
    if(crack[i-W]||(up!==id&&up>=0))s+=0.2;else if(crack[i-1])s+=0.1;else if(crack[i+W]||crack[i+1])s-=0.16;s+=(n2(x*0.25,y*0.25,13)-0.5)*0.12;
    const topEdge=(crack[i-W]||crack[i-2*W]&&hash(x,id,3)<0.5)&&hash(id,5,0)<0.55;
    if(topEdge||((crack[i-W]||cid[i-W]!==id)&&false))put(x,y,'moss',q(clamp(s+0.15,0,1),4));else put(x,y,'rock',q(clamp(s,0,1),6))}
  // moss drips under the mossy block tops
  for(let i=0;i<220;i++){const x=fl(30+rb()*260),y0=fl(ctop(x)+rb()*70);const k=y0*W+x;if(cid[k]<0||IB[k]<M.moss.b||IB[k]>=M.moss.b+4&&!(M.moss.tb&&IB[k]>=M.moss.tb&&IB[k]<M.moss.tb+4))continue;const len=1+fl(rb()*4);for(let j=1;j<=len;j++)put(x,y0+j,'moss',j===len?0:1)}
  // the lip of the cliff: a grassy edge and hanging bushes
  for(let x=0;x<W;x++){const y=fl(ctop(x));if(Math.abs(x-160)<16)continue;put(x,y,'grass',3);put(x,y+1,'grass',2);if(hash(x,3)<0.5)put(x,y+2,'grass',1)}
  for(let i=0;i<34;i++){const x=20+rb()*280;if(Math.abs(x-160)<22)continue;clump(x,ctop(x)+rb()*3-2,3+rb()*5,'foliM')}
  for(let i=0;i<30;i++){const x=fl(30+rb()*260);if(Math.abs(x-160)<18)continue;const y0=fl(ctop(x))+2,len=6+fl(rb()*24);for(let k=0;k<len;k++){const xx=x+fl(Math.sin(k*0.3+i)*1.2);put(xx,y0+k,'vine',k%5===0?2:k%3?1:0);if(k%4===0&&rb()<0.6)put(xx+(rb()<0.5?-1:1),y0+k,'vine',2)}}
  // ---- water: stream above the lip, the main fall in strands, a thread of a second fall
  for(let y=46;y<60;y++)for(let x=146;x<175;x++){if(y<ctop(x)-6||y>=ctop(x))continue;IB[y*W+x]=M.upriver.b+(fl((x*0.6+y*3+n2(x*0.3,y,3)*4))%4)}
  const strands=[];{let sx=146;while(sx<175){const w=2+fl(rb()*3);strands.push([sx,w,fl(rb()*40),2+fl(rb()*2)]);sx+=w}}
  for(const [sx,w,o,st] of strands)for(let x=sx;x<sx+w&&x<175;x++){const oo=o+fl(hash(x,2)*5),ss=st+2+fl(hash(x,4)*3),gap=x===sx&&w>2&&hash(sx,9)<0.6;for(let y=fl(ctop(x))-1;y<128;y++){const ph=fl((y+oo)/ss)%8;IB[y*W+x]=(x===146||x===174)?M.wdeep.b+2:gap?M.fall2.b+(fl((y+oo)/ss)%6):M.fall.b+ph}}
  for(let x=146;x<175;x++){const y=fl(ctop(x))-1;IB[y*W+x]=M.foam.b+(x%4)}
  for(let y=70;y<128;y++){const x0=228+fl(n2(y*0.1,4,4)*2);for(let x=x0;x<x0+2+(y>110?1:0);x++)IB[y*W+x]=M.fall2.b+(fl(y/2+x*3)%6)}
  // ---- pool and river
  const bankL=y=>98-(y-130)*1.3,bankR=y=>226+(y-130)*1.55;
  const isWater=(x,y)=>{const inPool=((x-161)/76)**2+((y-130)/9)**2<1&&y>=125;const inRiver=y>=130&&x>bankL(y)+n2(x*0.1,y*0.2,3)*6&&x<bankR(y)-n2(x*0.1,y*0.2,4)*6;return inPool||inRiver};
  for(let y=124;y<H;y++)for(let x=0;x<W;x++){if(!isWater(x,y))continue;
    const far=y<140+n2(x*0.08,1,2)*6,mid=y<158+n2(x*0.06,2,2)*8;let v=M.wdeep.b+(far?2:mid?1:0);
    if(y<140&&x>=144&&x<178&&hash(x,y,3)<0.55)v=M.pool.b+(fl(y*1.2+hash(x,1)*6)%6);
    IB[y*W+x]=v}
  for(let y=128;y<H;y+=(y<150?1:hash(y,3)<0.5?1:2)){const base=2+fl((y-128)/10);let x=fl(bankL(y))+fl(hash(y,1)*8);while(x<bankR(y)){const len=base+fl(hash(x,y,5)*base*1.5);if(isWater(x,y)&&hash(x,y,7)<0.5){const ph=fl(y*0.7+x*0.03);for(let k=0;k<len;k++)if(isWater(x+k,y))IB[y*W+x+k]=M.river.b+((ph+(k===0||k===len-1?5:0))%8)}x+=len+4+fl(hash(x,y,8)*12)}}
  for(let i=0;i<300;i++){const a=rb()*6.283,r=Math.sqrt(rb()),x=fl(160+Math.cos(a)*r*28),y=fl(128+Math.sin(a)*r*4-1);if(y<123||y>134)continue;IB[y*W+x]=M.foam.b+fl(rb()*4);if(rb()<0.6)IB[y*W+x+1]=M.foam.b+fl(rb()*4)}
  // spray mist rising at the foot of the fall
  const sr=rng(19),SP=[];for(let i=0;i<16;i++){const u=sr()*2-1;SP.push([fl(160+u*34),fl(124-(1-Math.abs(u))*7-sr()*5),fl(2+(1-Math.abs(u))*4+sr()*2)])}SP.sort((a,b)=>a[2]-b[2]);for(const [px_,py,pr] of SP){for(let y=-pr;y<=pr;y++)for(let x=-pr-2;x<=pr+2;x++){const d=(x/(pr+2))**2+(y/pr)**2;if(d>0.85+n2((px_+x)*0.5,(py+y)*0.5,3)*0.3)continue;const xx=px_+x,yy=py+y;if(xx>146&&xx<175&&yy<118&&d>0.5)continue;IB[yy*W+xx]=d<0.35?M.spray.b+2:d<0.7?M.spray.b+1:M.spray.b}}
  // boulders in the river with foam collars
  for(const [bx,by,br] of [[124,148,6],[198,145,5],[150,168,8],[230,166,6],[100,172,5]]){for(let y=-br;y<=br*0.6;y++)for(let x=-br-2;x<=br+2;x++){const d=(x/(br+1.5))**2+(y/br)**2;if(d>1)continue;let s=0.48-x/(br*2.4)-y/(br*1.5);if(d>0.75)s-=0.15;if(y<-br*0.55&&hash(bx,x,2)<0.7)put(bx+x,by+y,'moss',q(clamp(s+0.2,0,1),4));else put(bx+x,by+y,'rock',q(clamp(s,0,1),6))}
    for(let x=-br-3;x<=br+3;x++){const yy=by+fl(br*0.6)+1;if(hash(x,bx)<0.8)IB[yy*W+bx+x]=M.foam.b+((x+bx)&3);if(hash(x,by)<0.4)IB[(yy+1)*W+bx+x]=M.foam.b+((x+3)&3)}}
  // ---- banks: grass with tufts, a wet dirt edge, pebbles
  for(let y=110;y<H;y++)for(let x=0;x<W;x++){if(isWater(x,y))continue;const v=IB[y*W+x];if(v>=M.fall.b&&v<M.mist2.b+4)continue;
    const dl=bankL(y)+n2(x*0.1,y*0.2,3)*6-x,dr=x-(bankR(y)-n2(x*0.1,y*0.2,4)*6);const ed=dl>0?dl:dr>0?dr:-1;if(ed<0)continue;if(y<128&&cid[y*W+x]>=0&&ed>10)continue;
    if(ed<2.5)put(x,y,'dirt',ed<1.2?0:1);else if(ed<4.5)put(x,y,'dirt',2);else{const patch=fb(x*0.05,y*0.08,17,3);put(x,y,'grass',patch>0.56?2:1)}}
  for(let i=0;i<260;i++){const x=fl(rb()*W),y=fl(118+rb()*62);const k=y*W+x;const v=IB[k];if(!((v>=M.grass.b&&v<M.grass.b+4)||(v>=M.grass.tb&&v<M.grass.tb+4)||(v>=M.grass.t2&&v<M.grass.t2+4)))continue;
    put(x,y+1,'grass',0);for(let dx=-2;dx<=2;dx++){const hh=2+((dx+5+i)%3);for(let j=0;j<hh;j++)put(x+dx+(j===hh-1&&dx!==0?Math.sign(dx):0),y-j,'grass',j===hh-1?3:2)}}
  for(let i=0;i<70;i++){const x=fl(rb()*W),y=fl(130+rb()*50);const v=IB[y*W+x];if(!(v>=M.dirt.b&&v<M.dirt.b+3)&&!(v>=M.dirt.tb&&v<M.dirt.tb+3)&&!(v>=M.dirt.t2&&v<M.dirt.t2+3))continue;put(x,y,'stone',2);put(x+1,y,'stone',1);put(x,y+1,'stone',0)}
  // ---- mid-ground trees framing the gorge
  for(const [tx,tb,th] of [[50,142,92],[270,138,96]]){for(let y=tb-th;y<tb;y++){const u=(y-(tb-th))/th,w=4+fl(u*2)+(u>0.92?fl((u-0.92)*60):0);const x0=tx-fl(w/2);for(let x=0;x<w;x++){let s=x<1?2:x<w-2?1:0;if(n2(x*0.6,y*0.08,3)>0.72)s=Math.max(0,s-1);put(x0+x,y,'trunk',s,false)}}
    L_br(tx,tb-th+30,tx-14,tb-th+14);L_br(tx,tb-th+38,tx+15,tb-th+20);
    for(let i=0;i<30;i++){const a=rb()*6.283,r=Math.sqrt(rb())*20;clump(tx+Math.cos(a)*r*1.5,tb-th+10+Math.sin(a)*r*0.75,5+rb()*6,'foliM')}}
  function L_br(x0,y0,x1,y1){const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0));for(let i=0;i<=n;i++){const x=rd(x0+(x1-x0)*i/n),y=rd(y0+(y1-y0)*i/n);put(x,y,'trunk',1,false);put(x,y+1,'trunk',0,false)}}
  // stone lantern on the right bank
  (function(){const [lx,ly]=LAN;const S_=(x,y,s)=>put(x,y,'stone',s);
    for(let x=-7;x<=7;x++)for(let y=0;y<3;y++)S_(lx+x,ly+16+y,y===0?3:x<-3?1:x>3?0:2);
    for(let y=6;y<16;y++)for(let x=-2;x<=2;x++)S_(lx+x,ly+y,x<0?2:x>0?0:1);
    for(let y=-2;y<6;y++)for(let x=-5;x<=5;x++){if(Math.abs(x)<=2&&y>=0&&y<=3){IB[(ly+y)*W+lx+x]=M.glow.b+(Math.abs(x)<=1&&y>0&&y<3?0:1);continue}S_(lx+x,ly+y,y===-2?3:x<-2?2:x>2?0:1)}
    for(let k=0;k<5;k++)for(let x=-8+k;x<=8-k;x++)S_(lx+x,ly-3-k,k===0?3:x<0?2:1);S_(lx,ly-9,3);
    for(const [sx,sy,sw] of [[238,150,6],[250,160,7],[236,171,8]]){for(let x=-sw;x<=sw;x++)for(let y=-1;y<=1;y++){if(Math.abs(x)===sw&&y!==0)continue;S_(sx+x,sy+y,y<0?3:y>0?0:1)}}})();
  // ---- foreground: trunk, canopy, vines, ferns, flowers
  for(let y=0;y<H;y++){const w=19+fl(Math.max(0,y-140)*0.7)+fl(n2(y*0.05,1,6)*3);for(let x=0;x<w;x++){let s=x<2?0:x<6?1:x<w-4?2:1;if(n2(x*0.6,y*0.05,9)>0.7)s=Math.max(0,s-1);if(x===w-1)s=0;put(x,y,'trunk',s,false)}}
  for(let i=0;i<6;i++){const y0=50+i*22;for(let x=3;x<16;x++){if(hash(x,i)<0.7)put(x,y0+fl(Math.sin(x*0.5)*2),'moss',2,false)}}
  const rc=rng(55);
  for(let i=0;i<40;i++){const x=rc()*118-6,y=rc()*24-8;clump(x,y,5+rc()*8,'foliN')}
  for(let i=0;i<30;i++){const x=236+rc()*92,y=rc()*20-8;clump(x,y,5+rc()*7,'foliN')}
  for(let i=0;i<14;i++){const x=fl(14+rc()*96),y0=fl(10+rc()*12),len=10+fl(rc()*28);for(let k=0;k<len;k++)put(x+fl(Math.sin(k*0.25+i)*1.5),y0+k,'vine',k%4===0?2:1,false)}
  for(let i=0;i<10;i++){const x=fl(252+rc()*64),y0=fl(10+rc()*8),len=8+fl(rc()*20);for(let k=0;k<len;k++)put(x+fl(Math.sin(k*0.25+i)*1.5),y0+k,'vine',k%4===0?2:1,false)}
  for(const [fx,fy,fn] of [[34,180,9],[62,182,7],[10,176,6],[298,180,9],[274,182,7],[318,172,6]])fern(fx,fy,fn);
  const rfl=rng(9);for(let i=0;i<30;i++){const x=fl(rfl()<0.5?28+rfl()*56:246+rfl()*64),y=fl(146+rfl()*30);const v=IB[y*W+x];if(!(v>=M.grass.b&&v<M.grass.b+4)&&!(v>=M.grass.tb&&v<M.grass.tb+4)&&!(v>=M.grass.t2&&v<M.grass.t2+4))continue;put(x,y,'flower',1);put(x+1,y,'flower',0);put(x,y+1,'flower',0)}
}
function clump(cx,cy,r,mat_){const n=M[mat_].n;for(let y=-r;y<=r;y++)for(let x=-r*1.3;x<=r*1.3;x++){const a=Math.atan2(y,x),rr=r*(0.8+n2(Math.cos(a)*2+cx,Math.sin(a)*2+cy,3)*0.4);
    if((x/1.3)**2+y*y>rr*rr)continue;const e=((x/1.3)**2+y*y)/(rr*rr);let s=0.62-(x/(r*1.3))*0.3-(y/r)*0.5;if(e>0.7&&y>0)s-=0.2;s+=(n2((cx+x)*0.5,(cy+y)*0.5,7)-0.5)*0.22;put(cx+x,cy+y,mat_,q(clamp(s,0,0.999),n),false)}}
function fern(x0,y0,n){for(let k=0;k<n;k++){const a=-1.57+(k-(n-1)/2)*0.34,len=10+((k*7)%5)*2;for(let i=0;i<len;i++){const t=i/len,ang=a+t*0.9*(a<-1.57?-1:1);const x=x0+Math.cos(ang)*i*1.1,y=y0+Math.sin(ang)*i*1.1+t*t*4;put(x,y,'fern',t<0.3?0:1);
      if(i%2===0&&i>2){const sd=Math.cos(ang)<0?-1:1;put(x+sd,y-1,'fern',2);put(x-sd,y+1,'fern',1)}}}}
// ---------- palettes for time of day ----------
const KEYS=[
 {n:'清晨',top:'#3e4a8e',hor:'#f2a8a0',sun:'#ffdcae',key:[1.12,0.92,0.84],amb:[0.38,0.38,0.58],fog:'#c8a6bc',fa:0.6,glow:0.25,star:0.25,sunV:1,moonV:0.2,cl:['#7a6a9a','#e8a8b0','#ffd8c0']},
 {n:'白天',top:'#2e6ad0',hor:'#b4dcf6',sun:'#fffbe8',key:[1.16,1.13,1.02],amb:[0.44,0.52,0.7],fog:'#b4d4ee',fa:0.5,glow:0,star:0,sunV:0.0,moonV:0,cl:['#b8c8e8','#e8f0fa','#ffffff']},
 {n:'黄昏',top:'#28286a',hor:'#ff9450',sun:'#ffc060',key:[1.3,0.78,0.52],amb:[0.36,0.26,0.46],fog:'#d4826e',fa:0.6,glow:0.7,star:0.25,sunV:1,moonV:0.1,cl:['#5a3a6a','#e0605a','#ffb070']},
 {n:'夜晚',top:'#060a20',hor:'#1c2c5c',sun:'#ffffff',key:[0.4,0.5,0.82],amb:[0.13,0.16,0.32],fog:'#2a3a6a',fa:0.55,glow:1,star:1,sunV:0,moonV:1,cl:['#141c3a','#2a3a6a','#4a5a8a']}];
const H2=h=>hx(h);
function lerpA(a,b,t){return a.map((v,i)=>v+(b[i]-v)*t)}
function env(tod,rain){const n=KEYS.length,f=((tod%1)+1)%1*n,i=fl(f),k=f-i,A=KEYS[i],B=KEYS[(i+1)%n];const e={};
  for(const key of ['top','hor','sun','fog'])e[key]=lerpA(H2(A[key]),H2(B[key]),k);for(const key of ['key','amb'])e[key]=lerpA(A[key],B[key],k);
  for(const key of ['fa','glow','star','sunV','moonV'])e[key]=A[key]+(B[key]-A[key])*k;e.cl=A.cl.map((c,j)=>lerpA(H2(c),H2(B.cl[j]),k));
  if(rain){const grey=c=>{const m=(c[0]+c[1]+c[2])/3;return c.map(v=>v*0.45+m*0.4)};e.top=grey(e.top);e.hor=grey(e.hor);e.fog=grey(e.fog);e.key=e.key.map(v=>v*0.62);e.amb=e.amb.map(v=>v*0.85);e.fa=Math.min(0.85,e.fa+0.2);e.sunV*=0.15;e.star=0;e.moonV*=0.2;e.cl=e.cl.map(grey)}
  e.name=k<0.5?A.n:B.n;return e}
const mixA=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
const pk=c=>((255<<24)|(clamp(rd(c[2]/4)*4,0,255)<<16)|(clamp(rd(c[1]/4)*4,0,255)<<8)|clamp(rd(c[0]/4)*4,0,255))>>>0;
function buildPal(E,t){const set=(i,c)=>{PAL[i]=c};
  const band=k=>mixA(E.top,E.hor,Math.pow(k/(NB-1),1.5));
  for(let k=0;k<NB;k++)set(M.sky.b+k,band(k));
  const tw1=0.7+0.3*Math.sin(t*0.11),tw2=0.55+0.45*Math.sin(t*0.07+2);
  for(let k=0;k<NC;k++){const b=band(k),o=M.cel.b+k*7;set(o,mixA(b,mixA(E.sun,[255,255,240],0.3),E.sunV));set(o+1,mixA(b,E.sun,0.42*E.sunV));set(o+2,mixA(b,E.sun,0.2*E.sunV));
    set(o+3,mixA(b,[244,240,220],E.moonV));set(o+4,mixA(b,[170,176,200],E.moonV));set(o+5,mixA(b,[255,255,255],E.star*tw1));set(o+6,mixA(b,[150,164,224],E.star*tw2))}
  for(let j=0;j<3;j++)set(M.cloud.b+j,E.cl[j]);
  for(const name in M){const m=M[name];if(!m.a0)continue;const A0=H2(m.a0),A1=H2(m.a1);
    for(let s=0;s<m.n;s++){const u=m.n>1?s/(m.n-1):1;const sh=A0.map((v,i)=>v*E.amb[i]),li=A1.map((v,i)=>v*E.key[i]);let c=mixA(sh,li,Math.pow(u,1.1));c=mixA(c,E.fog,m.d*E.fa);set(m.b+s,c);
      if(m.tb){const wc=[c[0]*1.9+40+30*E.star,c[1]*1.4+20+14*E.star,c[2]*0.9+2];set(m.tb+s,mixA(c,wc,E.glow));if(m.t2)set(m.t2+s,mixA(c,wc,E.glow*0.42))}}}
  // water reads the sky and the light
  const SR=mixA(E.top,E.hor,0.7),kk=(E.key[0]+E.key[1]+E.key[2])/3;
  const D=mixA(SR.map(v=>v*0.4),[20,52,78].map((v,i)=>v*E.amb[i]*2.4),0.5),Mi=mixA(D,SR,0.5),Li=mixA(SR,[255,255,255],0.35*Math.min(1,kk)).map(v=>v*Math.min(1.05,0.55+kk*0.45)),Wh=mixA(Li,[240,248,255],Math.min(1,kk*0.7));
  const ramp=(name,arr)=>{const m=M[name];for(let s=0;s<m.n;s++)set(m.b+s,arr[s%arr.length])};
  ramp('fall',[Wh,Wh,Li,Wh,Wh,Wh,Li,Mi]);ramp('fall2',[Li,Mi,Li,Mi,Mi,Li]);ramp('pool',[D,D,Mi,Li,Mi,D]);ramp('river',[D,D,mixA(D,Mi,0.5),Mi,Li,Wh,Mi,D]);ramp('foam',[Wh,Li,Wh,Mi]);
  ramp('wdeep',[mixA(D,[0,0,0],0.25),D,mixA(D,Mi,0.4)]);ramp('upriver',[Mi,Li,Mi,D]);
  const FL=mixA(E.fog,[255,255,255],0.22),FM=E.fog,FD=mixA(E.fog,E.top,0.35);ramp('mist',[FL,FM,FL,FD]);ramp('spray',[mixA(Mi,Wh,0.45),mixA(Li,Wh,0.4),mixA(Li,Wh,0.75)]);ramp('mist2',[FM,FL,FM,FD]);
  const gl=E.glow;set(M.glow.b,mixA(H2('#8a8478').map((v,i)=>v*E.key[i]),[255,236,170],gl));set(M.glow.b+1,mixA(H2('#5a5a60').map((v,i)=>v*E.key[i]),[240,140,60],gl));set(M.glow.b+2,[255,255,255]);}
function buildLUT(t){for(let i=0;i<256;i++)LUT[i]=PAL[i]?pk(PAL[i]):0xff000000;
  for(const [name,dir,rate] of CYCLES){const m=M[name],sh=fl(t*rate)*dir;const tmp=[];for(let s=0;s<m.n;s++)tmp.push(LUT[m.b+((s-sh)%m.n+m.n)%m.n]);for(let s=0;s<m.n;s++)LUT[m.b+s]=tmp[s]}}
// ---------- overlays that are not palette tricks: rain, fireflies, birds ----------
function draw(S,g){if(!IB)paint();const t=S.t;
  const tod=S.opt.tod==='auto'?(t/1920+0.62)%1:+S.opt.tod;const rain=S.opt.rain;const E=env(tod,rain);S.envName=E.name;
  buildPal(E,t);buildLUT(t);
  const im=S.im||(S.im=g.createImageData(W,H)),out=new Uint32Array(im.data.buffer);for(let i=0;i<W*H;i++)out[i]=LUT[IB[i]];
  const put32=(x,y,c)=>{x=fl(x);y=fl(y);if(x>=0&&y>=0&&x<W&&y<H)out[y*W+x]=c};
  if(E.glow>0.3){const gc=pk([220,255,120]),gd=pk(mixA(PAL[M.foliM.b+1],[200,255,120],0.45));for(let i=0;i<22;i++){const ph=hash(i,3)*6.28,x=40+hash(i,1)*240+Math.sin(t*0.013+ph)*18,y=118+hash(i,2)*50+Math.sin(t*0.021+ph*2)*8;
      if(Math.sin(t*0.06+ph*3)<0.2)continue;put32(x,y,gc);if(E.glow>0.7){put32(x+1,y,gd);put32(x-1,y,gd);put32(x,y+1,gd);put32(x,y-1,gd)}}}
  if(!rain&&E.glow<0.5){const bc=pk(mixA(E.top,[20,20,40],0.6));for(let i=0;i<5;i++){const bx=((t*0.45+i*13)%(W+80))-40,by=34+i*4+Math.sin(t*0.03+i)*2+(i%2)*3,f=(fl(t/6)+i)%2;put32(bx,by,bc);put32(bx-1,by-f,bc);put32(bx+1,by-f,bc);put32(bx-2,by-1+f,bc);put32(bx+2,by-1+f,bc)}}
  if(rain){const rc=pk(mixA(E.fog,[255,255,255],0.3)),rc2=pk(mixA(E.fog,E.top,0.2));for(let i=0;i<260;i++){const sp=3+hash(i,5)*2,x0=hash(i,1)*(W+60),y=(hash(i,2)*H+t*sp*2.4)%(H+20)-10,x=(x0-y*0.35)%W;const c=i%3?rc2:rc;for(let k=0;k<4;k++)put32(x-k*0.35,y-k,c)}
    for(let i=0;i<40;i++){const k=(t+i*7)%12;if(k>3)continue;const x=hash(i,fl((t+i*7)/12),9)*W,y=124+hash(i,fl((t+i*7)/12),8)*52;const v=IB[fl(y)*W+fl(x)];if(v>=M.pool.b&&v<M.upriver.b){put32(x-1,y,rc);put32(x+1,y,rc);if(k<2)put32(x,y-1,rc)}}}
  if(S.opt.pal){for(let i=1;i<NI;i++){const x=(i-1)%80*4,y=H-8+fl((i-1)/80)*3;for(let a=0;a<4;a++)for(let b=0;b<2;b++)put32(x+a,y+b,LUT[i])}}
  g.putImageData(im,0,0)}
SAMPLES.push({id:'cycle',name:'色彩循环瀑布',w:W,h:H,thumb:120,
  tags:['整幅只画一次','动的全是调色板','流水靠循环换色','一天四时只改颜色','石灯笼照亮周围','雨天与萤火'],
  about:'向上世纪九十年代 Mark Ferrari 的色彩循环致敬：这幅山谷瀑布在页面打开时只画了一次，之后再也没有改动过任何一个像素的“编号”。瀑布下落、河水流淌、雾气飘移，全靠调色板里几组颜色轮流转动；清晨、白天、黄昏、夜晚的变化，也只是把同一套编号换成另一套颜色。夜里石灯笼亮起，周围的岩石和草地被染成暖色，也只是换色。打开“显示调色板”能在底部看到这一百多个颜色正在转。',
  controls:[{type:'seg',key:'tod',label:'时间',options:[['auto','自动'],['0','清晨'],['0.25','白天'],['0.5','黄昏'],['0.75','夜晚']],def:'auto'},{type:'toggle',key:'rain',label:'下雨',def:false},{type:'toggle',key:'pal',label:'显示调色板',def:false}],
  init(s){},tick(s){},draw,
  info(s){return(s.envName||'')+' · 共 '+(NI-1)+' 色'+(s.opt.tod==='auto'?' · 自动流转':'')}});
})();

// ================= 3. 雨夜窗边 =================


// ================= 4. 巨像 =================


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
