// SPDX-License-Identifier: MIT
// Copyright (c) 2026 喵老弟 / MarkMFFF

const PF={
'0':['.###.','#..##','#.#.#','##..#','#...#','#...#','.###.'],'1':['..#..','.##..','#.#..','..#..','..#..','..#..','#####'],
'2':['.###.','#...#','....#','..##.','.#...','#....','#####'],'3':['####.','....#','....#','.###.','....#','....#','####.'],
'4':['...#.','..##.','.#.#.','#..#.','#####','...#.','...#.'],'5':['#####','#....','####.','....#','....#','#...#','.###.'],
'6':['.###.','#....','#....','####.','#...#','#...#','.###.'],'7':['#####','....#','...#.','..#..','.#...','.#...','.#...'],
'8':['.###.','#...#','#...#','.###.','#...#','#...#','.###.'],'9':['.###.','#...#','#...#','.####','....#','....#','.###.'],
'A':['.###.','#...#','#...#','#####','#...#','#...#','#...#'],'B':['####.','#...#','#...#','####.','#...#','#...#','####.'],
'C':['.###.','#...#','#....','#....','#....','#...#','.###.'],'D':['####.','#...#','#...#','#...#','#...#','#...#','####.'],
'E':['#####','#....','#....','####.','#....','#....','#####'],'F':['#####','#....','#....','####.','#....','#....','#....'],
'G':['.###.','#...#','#....','#.###','#...#','#...#','.####'],'H':['#...#','#...#','#...#','#####','#...#','#...#','#...#'],
'I':['###','.#.','.#.','.#.','.#.','.#.','###'],'J':['..###','...#.','...#.','...#.','#..#.','#..#.','.##..'],
'K':['#...#','#..#.','#.#..','##...','#.#..','#..#.','#...#'],'L':['#....','#....','#....','#....','#....','#....','#####'],
'M':['#...#','##.##','#.#.#','#.#.#','#...#','#...#','#...#'],'N':['#...#','##..#','#.#.#','#..##','#...#','#...#','#...#'],
'O':['.###.','#...#','#...#','#...#','#...#','#...#','.###.'],'P':['####.','#...#','#...#','####.','#....','#....','#....'],
'Q':['.###.','#...#','#...#','#...#','#.#.#','#..#.','.##.#'],'R':['####.','#...#','#...#','####.','#.#..','#..#.','#...#'],
'S':['.####','#....','#....','.###.','....#','....#','####.'],'T':['#####','..#..','..#..','..#..','..#..','..#..','..#..'],
'U':['#...#','#...#','#...#','#...#','#...#','#...#','.###.'],'V':['#...#','#...#','#...#','#...#','.#.#.','.#.#.','..#..'],
'W':['#...#','#...#','#...#','#.#.#','#.#.#','##.##','#...#'],'X':['#...#','#...#','.#.#.','..#..','.#.#.','#...#','#...#'],
'Y':['#...#','#...#','.#.#.','..#..','..#..','..#..','..#..'],'Z':['#####','....#','...#.','..#..','.#...','#....','#####'],
'+':['.....','..#..','..#..','#####','..#..','..#..','.....'],'-':['.....','.....','.....','#####','.....','.....','.....'],
'!':['#','#','#','#','#','.','#'],'?':['.###.','#...#','....#','..##.','..#..','.....','..#..'],'.':['.','.','.','.','.','.','#'],
':':['.','.','#','.','.','#','.'],'/':['....#','....#','...#.','..#..','.#...','#....','#....'],'x':['.....','.....','#...#','.#.#.','..#..','.#.#.','#...#'],
'%':['##..#','##..#','...#.','..#..','.#...','#..##','#..##'],"'":['#','#','.','.','.','.','.'],'*':['.....','#.#.#','.###.','#####','.###.','#.#.#','.....'],
'(':['.#','#.','#.','#.','#.','#.','.#'],')':['#.','.#','.#','.#','.#','.#','#.'],',':['..','..','..','..','..','.#','#.'],'=':['.....','.....','#####','.....','#####','.....','.....'],
'<':['...#','..#.','.#..','#...','.#..','..#.','...#'],'>':['#...','.#..','..#.','...#','..#.','.#..','#...'],'#':['.#.#.','#####','.#.#.','.#.#.','.#.#.','#####','.#.#.'],
'_':['.....','.....','.....','.....','.....','.....','#####'],' ':['...','...','...','...','...','...','...']};


// ================= K: a small true-colour pixel core =================
// A 480x270 colour buffer + emissive (for bloom) + depth. Each game owns its own renderer (voxel space, oblique heightfield,
// folding paper) and writes final pixels here; K only handles text, sound, helpers, and the hand-off to the display.
const K=(function(){
const W=480,H=270,N=W*H;
const col=new Uint32Array(N),em=new Uint8Array(N),dep=new Float32Array(N);
const img=new ImageData(W,H),o32=new Uint32Array(img.data.buffer);
const BW=W>>1,BH=H>>1,bimg=new ImageData(BW,BH),b32=new Uint32Array(bimg.data.buffer);
const S={W,H,col,em,dep,img,bimg,frame:0,flash:0,flashC:0xffffff,fade:0,fadeC:0,raw:false,bloomK:1,shx:0,shy:0};
// ---------------- colour helpers ----------------
const rgb=(r,g,b)=>((r<0?0:r>255?255:r|0)<<16)|((g<0?0:g>255?255:g|0)<<8)|(b<0?0:b>255?255:b|0);
const hex=s=>parseInt(s.replace('#',''),16);
function mix(a,b,t){if(t<=0)return a;if(t>=1)return b;const ar=a>>16&255,ag=a>>8&255,ab=a&255;return rgb(ar+((b>>16&255)-ar)*t,ag+((b>>8&255)-ag)*t,ab+((b&255)-ab)*t)}
function mul(a,k){return rgb((a>>16&255)*k,(a>>8&255)*k,(a&255)*k)}
function mulc(a,kr,kg,kb){return rgb((a>>16&255)*kr,(a>>8&255)*kg,(a&255)*kb)}
function add(a,b){return rgb((a>>16&255)+(b>>16&255),(a>>8&255)+(b>>8&255),(a&255)+(b&255))}
// a ramp is a hand-picked list of colours, dark to light; sampling snaps to a step (no gradients, no dither)
const ramp=s=>s.split(' ').map(hex);
function rs(R,t){const n=R.length;let i=Math.floor(t*n);return R[i<0?0:i>=n?n-1:i]}
// ---------------- random ----------------
let seed=1;const rnd=()=>{seed=(seed*1664525+1013904223)|0;return((seed>>>8)&0xffffff)/0x1000000};
const rr=(a,b)=>a+(b-a)*rnd(),ri=(a,b)=>Math.floor(rr(a,b+1));
function hash(x,y){let h=(x|0)*374761393+(y|0)*668265263;h=(h^(h>>>13))*1274126177;h=h^(h>>>16);return(h>>>0)/4294967296}
const pmod=(a,n)=>((a%n)+n)%n;
const clamp=(v,a,b)=>v<a?a:v>b?b:v,lerp=(a,b,t)=>a+(b-a)*t,sstep=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t)};
function vnoise(x,y,s){const X=Math.floor(x),Y=Math.floor(y),fx=x-X,fy=y-Y,u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy);s=s||0;
  const a=hash(X+s,Y),b=hash(X+1+s,Y),c=hash(X+s,Y+1),d=hash(X+1+s,Y+1);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v}
function fbm(x,y,o,s){let v=0,a=0.5,f=1;for(let i=0;i<o;i++){v+=a*vnoise(x*f,y*f,(s||0)+i*31);f*=2;a*=0.5}return v/(1-Math.pow(0.5,o))}
// ---------------- drawing ----------------
function clear(c){col.fill(c);em.fill(0);dep.fill(1e9)}
function px(x,y,c,e){x|=0;y|=0;if(x<0||y<0||x>=W||y>=H)return;const p=y*W+x;col[p]=c;em[p]=e||0}
function pxa(x,y,c,a,e){x|=0;y|=0;if(x<0||y<0||x>=W||y>=H)return;const p=y*W+x;col[p]=mix(col[p],c,a);if(e)em[p]=Math.max(em[p],e)}
function rect(x,y,w,h,c,e){x=Math.round(x);y=Math.round(y);for(let j=Math.max(0,y);j<Math.min(H,y+h);j++)for(let i=Math.max(0,x);i<Math.min(W,x+w);i++){const p=j*W+i;col[p]=c;em[p]=e||0}}
function recta(x,y,w,h,c,a){x=Math.round(x);y=Math.round(y);for(let j=Math.max(0,y);j<Math.min(H,y+h);j++)for(let i=Math.max(0,x);i<Math.min(W,x+w);i++){const p=j*W+i;col[p]=mix(col[p],c,a)}}
function line(x0,y0,x1,y1,c,e){x0=Math.round(x0);y0=Math.round(y0);x1=Math.round(x1);y1=Math.round(y1);const dx=Math.abs(x1-x0),dy=-Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1;let er=dx+dy;
  for(let k=0;k<3000;k++){px(x0,y0,c,e);if(x0===x1&&y0===y1)break;const e2=2*er;if(e2>=dy){er+=dy;x0+=sx}if(e2<=dx){er+=dx;y0+=sy}}}
function disc(cx,cy,r,c,e){for(let y=Math.floor(cy-r);y<=Math.ceil(cy+r);y++)for(let x=Math.floor(cx-r);x<=Math.ceil(cx+r);x++){const dx=x+0.5-cx,dy=y+0.5-cy;if(dx*dx+dy*dy<=r*r)px(x,y,c,e)}}
function disca(cx,cy,r,c,a){for(let y=Math.floor(cy-r);y<=Math.ceil(cy+r);y++)for(let x=Math.floor(cx-r);x<=Math.ceil(cx+r);x++){const dx=x+0.5-cx,dy=y+0.5-cy;if(dx*dx+dy*dy<=r*r)pxa(x,y,c,a)}}
function ring(cx,cy,r,w,c,e){const r0=Math.max(0,r-w);for(let y=Math.floor(cy-r);y<=Math.ceil(cy+r);y++)for(let x=Math.floor(cx-r);x<=Math.ceil(cx+r);x++){const dx=x+0.5-cx,dy=y+0.5-cy,d=dx*dx+dy*dy;if(d<=r*r&&d>=r0*r0)px(x,y,c,e)}}
// soft additive glow (goes to colour and to bloom)
function glow(cx,cy,r,c,k){const cr=(c>>16&255)*k,cg=(c>>8&255)*k,cb=(c&255)*k;for(let y=Math.max(0,Math.floor(cy-r));y<=Math.min(H-1,Math.ceil(cy+r));y++)for(let x=Math.max(0,Math.floor(cx-r));x<=Math.min(W-1,Math.ceil(cx+r));x++){
  const dx=x+0.5-cx,dy=y+0.5-cy,d=(dx*dx+dy*dy)/(r*r);if(d>=1)continue;const a=(1-d)*(1-d),p=y*W+x,o=col[p];col[p]=rgb((o>>16&255)+cr*a,(o>>8&255)+cg*a,(o&255)+cb*a);em[p]=Math.min(255,em[p]+a*120*k)}}
// sprites: rows of chars mapped through a palette object; '.' is empty
function spr(rows,map){const h=rows.length,w=Math.max(...rows.map(r=>r.length)),c=new Int32Array(w*h).fill(-1);
  for(let y=0;y<h;y++)for(let x=0;x<rows[y].length;x++){const ch=rows[y][x];if(ch==='.'||ch===' ')continue;const m=map[ch];if(m==null)throw new Error('sprite char '+ch);c[y*w+x]=m}return{w,h,c}}
function blit(s,x,y,o){o=o||{};x=Math.round(x);y=Math.round(y);const fl=o.flip,tint=o.tint,ta=o.ta||0,e=o.em||0,al=o.a;
  for(let j=0;j<s.h;j++){const Y=y+j;if(Y<0||Y>=H)continue;for(let i=0;i<s.w;i++){let c=s.c[j*s.w+(fl?s.w-1-i:i)];if(c<0)continue;const X=x+i;if(X<0||X>=W)continue;const p=Y*W+X;
    if(tint!=null)c=mix(c,tint,ta);if(al!=null)col[p]=mix(col[p],c,al);else col[p]=c;em[p]=e}}}
// ---------------- text: 5x7 latin, 3x5 digits, CJK rasterised from the system font at 4x ----------------
const S8=[[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[1,-1],[-1,1],[1,1]];
function ptext(str,x,y,c,o){o=o||{};const sc=o.scale||1,e=o.em||0;str=String(str).toUpperCase();let w=0;for(const ch of str){const g=PF[ch]||PF[' '];w+=(g[0].length+1)*sc}w-=sc;
  if(o.align==='c')x-=Math.floor(w/2);else if(o.align==='r')x-=w;x=Math.round(x);y=Math.round(y);
  const pass=(cc,dx,dy,ee)=>{let cx=x;for(const ch of str){const g=PF[ch]||PF[' '];for(let j=0;j<7;j++)for(let i=0;i<g[j].length;i++)if(g[j][i]==='#')rect(cx+i*sc+dx,y+j*sc+dy,sc,sc,cc,ee);cx+=(g[0].length+1)*sc}};
  if(o.ink!=null)for(const[dx,dy]of S8)pass(o.ink,dx,dy,0);if(o.shadow!=null)pass(o.shadow,sc,sc,0);pass(c,0,0,e);return w}
const GC=new Map();let gcv=null,gcg=null;
const FAM='"PingFang SC","Hiragino Sans GB","Noto Sans SC","Noto Sans CJK SC","Microsoft YaHei","WenQuanYi Zen Hei",sans-serif';
const FAMS={kai:'"Kaiti SC","STKaiti","KaiTi","AR PL UKai CN","Noto Serif SC","Noto Serif CJK SC","Songti SC",serif',serif:'"Songti SC","Noto Serif SC","Noto Serif CJK SC","SimSun",serif'};
function glyph(ch,size,bold,fam){const key=ch+'|'+size+'|'+(bold?1:0)+'|'+(fam||'');let G=GC.get(key);if(G)return G;
  if(ch===' '){G={w:Math.round(size*0.35),px:[]};GC.set(key,G);return G}
  const KK=4;if(!gcv){gcv=document.createElement('canvas');gcg=gcv.getContext('2d',{willReadFrequently:true})}
  const f=(bold?'bold ':'')+(size*KK)+'px '+(fam?FAMS[fam]||fam:FAM);gcg.font=f;const mw=gcg.measureText(ch).width;const w=Math.max(1,Math.round(mw/KK)),h=size+3;
  gcv.width=(w+2)*KK;gcv.height=h*KK;gcg.font=f;gcg.textBaseline='top';gcg.fillStyle='#fff';gcg.fillText(ch,KK,KK*0.5);
  const d=gcg.getImageData(0,0,gcv.width,gcv.height).data,pp=[],CW=gcv.width;
  for(let y=0;y<h;y++)for(let x=0;x<w+2;x++){let s=0;for(let j=0;j<KK;j++)for(let i=0;i<KK;i++)s+=d[((y*KK+j)*CW+x*KK+i)*4+3];if(s/(KK*KK*255)>(bold?0.42:0.34))pp.push(x-1,y)}
  G={w,px:pp};GC.set(key,G);return G}
function measure(str,size,bold,fam){let w=0;for(const ch of String(str))w+=glyph(ch,size,bold,fam).w;return w}
// o: size, bold, align, ink (outline), shadow, em, sp (letter spacing), a (alpha)
function text(str,x,y,c,o){o=o||{};const size=o.size||12,sp=o.sp||0;str=String(str);const w=measure(str,size,o.bold,o.fam)+sp*(str.length-1);if(o.align==='c')x-=Math.floor(w/2);else if(o.align==='r')x-=w;x=Math.round(x);y=Math.round(y);
  const a=o.a==null?1:o.a;const put=a>=1?(X,Y,cc,ee)=>px(X,Y,cc,ee):(X,Y,cc,ee)=>pxa(X,Y,cc,a,ee);
  const pass=(cc,dx,dy,ee,list)=>{let cx=x;for(const ch of str){const G=glyph(ch,size,o.bold,o.fam);const q=G.px;for(let i=0;i<q.length;i+=2)for(const[ax,ay]of list)put(cx+q[i]+dx+ax,y+q[i+1]+dy+ay,cc,ee);cx+=G.w+sp}};
  if(o.ink!=null)pass(o.ink,0,0,0,S8);if(o.shadow!=null)pass(o.shadow,1,1,0,[[0,0]]);pass(c,0,0,o.em||0,[[0,0]]);return w}
// ---------------- present: grade, flash/fade, bloom bright-pass from emissive ----------------
function present(){const raw=S.raw,fl=S.flash,fc=S.flashC,fd=S.fade,fdc=S.fadeC;
  for(let p=0;p<N;p++){let c=col[p];if(!raw){if(fd>0)c=mix(c,fdc,fd);if(fl>0)c=mix(c,fc,fl)}o32[p]=0xff000000|(c&255)<<16|(c&0xff00)|(c>>16&255)}
  const k=S.bloomK;for(let y=0;y<BH;y++)for(let x=0;x<BW;x++){const p=(y*2)*W+x*2;let r=0,g=0,b=0;
    for(let j=0;j<4;j++){const q=p+(j&1)+(j>>1)*W,e=em[q];if(!e)continue;const c=col[q],f=e/255*k;r+=(c>>16&255)*f;g+=(c>>8&255)*f;b+=(c&255)*f}
    r=Math.min(255,r/4);g=Math.min(255,g/4);b=Math.min(255,b/4);b32[y*BW+x]=0xff000000|(b<<16)|(g<<8)|r}}
// ---------------- sound: a tiny WebAudio synth ----------------
const SND={on:false,ctx:null,last:{},master:null,nb:null,amb:null};
function sndInit(){if(SND.ctx)return;try{const C=new (window.AudioContext||window.webkitAudioContext)();SND.ctx=C;SND.master=C.createGain();SND.master.gain.value=0.5;
  const comp=C.createDynamicsCompressor();SND.master.connect(comp);comp.connect(C.destination);
  const nb=C.createBuffer(1,C.sampleRate*2,C.sampleRate),d=nb.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;SND.nb=nb}catch(e){SND.ctx=null}}
function tone(type,f0,f1,dur,vol,t0,att){const C=SND.ctx,o=C.createOscillator(),g=C.createGain();o.type=type;o.frequency.setValueAtTime(f0,t0);o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t0+dur);
  if(att){g.gain.setValueAtTime(0.0008,t0);g.gain.exponentialRampToValueAtTime(vol,t0+att)}else g.gain.setValueAtTime(vol,t0);g.gain.exponentialRampToValueAtTime(0.0008,t0+dur);o.connect(g);g.connect(SND.master);o.start(t0);o.stop(t0+dur+0.02)}
function noise(dur,vol,t0,ftype,f0,f1,q,att){const C=SND.ctx,s=C.createBufferSource(),f=C.createBiquadFilter(),g=C.createGain();s.buffer=SND.nb;f.type=ftype||'lowpass';f.frequency.setValueAtTime(f0||3000,t0);f.frequency.exponentialRampToValueAtTime(Math.max(30,f1||f0||3000),t0+dur);f.Q.value=q||0.7;
  if(att){g.gain.setValueAtTime(0.0008,t0);g.gain.exponentialRampToValueAtTime(vol,t0+att)}else g.gain.setValueAtTime(vol,t0);g.gain.exponentialRampToValueAtTime(0.0008,t0+dur);s.connect(f);f.connect(g);g.connect(SND.master);s.start(t0,Math.random()*1);s.stop(t0+dur+0.02)}
// a looping filtered-noise bed whose level and colour a game sets every frame (wind, rain, crowd)
function bed(name,ftype,f,q){if(!SND.ctx)return null;SND.beds=SND.beds||{};if(SND.beds[name])return SND.beds[name];const C=SND.ctx,s=C.createBufferSource(),fl=C.createBiquadFilter(),g=C.createGain();
  s.buffer=SND.nb;s.loop=true;fl.type=ftype;fl.frequency.value=f;fl.Q.value=q||0.7;g.gain.value=0;s.connect(fl);fl.connect(g);g.connect(SND.master);s.start();return SND.beds[name]={g,fl}}
function bedSet(name,vol,f){const b=SND.beds&&SND.beds[name];if(!b)return;const t=SND.ctx.currentTime;b.g.gain.setTargetAtTime(SND.on?vol:0,t,0.15);if(f)b.fl.frequency.setTargetAtTime(f,t,0.2)}
function bedsOff(){if(!SND.beds)return;for(const k in SND.beds)SND.beds[k].g.gain.setTargetAtTime(0,SND.ctx.currentTime,0.1)}
function now(){return SND.ctx?SND.ctx.currentTime:0}
const live=()=>SND.on&&SND.ctx&&!S.mute;
return {W,H,N,S,rgb,hex,mix,mul,mulc,add,ramp,rs,rnd,rr,ri,hash,pmod,clamp,lerp,sstep,vnoise,fbm,setSeed:v=>{seed=v|0},
  clear,px,pxa,rect,recta,line,disc,disca,ring,glow,spr,blit,ptext,text,measure,glyph,present,
  SND,sndInit,tone,noise,bed,bedSet,bedsOff,now,live};
})();

const GAMES=[];


// ================= shared bits for the twenty pieces: an autoplay queue, easing, palettes =================
// AIQ: the demo hand walks a queue of [x, y, down, frames, fn?] steps; plan(g, A) refills it when empty.
function AIQ(g,plan){const A=g.ai||(g.ai={q:[],k:0,x:240,y:135,down:false,sx:240,sy:135});if(!A.q.length)plan(g,A);if(!A.q.length)A.q.push([A.x,A.y,false,30]);const tg=A.q[0];A.k++;
  if(A.k===1){A.sx=A.x;A.sy=A.y;if(tg[4])tg[4](g)}const k=Math.min(1,A.k/Math.max(1,tg[3]));const e=tg[5]==='lin'?k:(k<0.5?2*k*k:1-Math.pow(-2*k+2,2)/2);
  A.x=A.sx+(tg[0]-A.sx)*e;A.y=A.sy+(tg[1]-A.sy)*e;const down=tg[2],click=down&&!A.down;A.down=down;if(A.k>=tg[3]){A.q.shift();A.k=0}
  return{x:0,y:0,mouse:{x:A.x,y:A.y,down,click}}}

// shared mouse tracker: previous position, velocity, press edges
function MT(g,m){const T=g._mt||(g._mt={x:240,y:135,px:240,py:135,vx:0,vy:0,down:false,pdown:false,on:false});T.pdown=T.down;
  if(m){T.px=T.on?T.x:m.x;T.py=T.on?T.y:m.y;T.x=m.x;T.y=m.y;T.vx=T.vx*0.6+(T.x-T.px)*0.4;T.vy=T.vy*0.6+(T.y-T.py)*0.4;T.down=m.down;T.on=true;T.click=m.click}else{T.on=false;T.down=false;T.click=false}
  T.up=T.pdown&&!T.down;return T}



// ================= 雨的乐器: the eaves drip, and whatever stands under them sings =================
// A night porch in the rain with a paper lantern. Water runs off ten round tile ends along the eave and drips in a
// steady pulse, each tile at its own rhythm, so together they make a slow polyrhythm. Under the eave stand bottles,
// porcelain bowls, a tin bucket, a clay pot, an upturned wok and a lotus leaf in a basin: every drip that lands on one
// plays its note. Bottles slowly fill and climb the scale. Drag a thing to another tile to change the tune, tap a
// bottle or bowl to pour it out, drag across the sky to make the rain heavier or lighter.
const RAINM=(function(){const {W,H,S,mix,mul,clamp,lerp,hash,fbm,rgb}=K;const col=S.col,em=S.em,N=W*H;
const NC=8,CX=k=>46+k*52,EAVE=40,LEDGE=226,LX=452,LY=96;const STEP=60*60/92/4;
// each tile end drips every P sixteenth notes, offset by its phase
const PER=[6,4,7,5,8,3,6,5],PHS=[0,1,3,2,5,0,4,1];
const SCALES=[['宫调',[0,2,4,7,9]],['羽调',[0,3,5,7,10]],['都节',[0,1,5,7,8]]];
const TYPES={bottle:{w:18,h:60},bowl:{w:44,h:18},tin:{w:32,h:34},pot:{w:40,h:38},wok:{w:50,h:20},leaf:{w:48,h:16}};
const BG=new Uint32Array(N);let built=false;
function light(x,y){const d=Math.hypot(x-LX,(y-LY)*1.2);return 0.5+0.85*Math.exp(-d/130)}
function build(){built=true;K.setSeed(9101);
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const p=y*W+x;let c=mix(0x0a1424,0x16243a,y/H);
    // a garden behind the rain: a far wall, then misty bamboo
    if(y>150&&y<LEDGE){c=mix(0x1a2434,0x222c3a,(y-150)/76);if(y===151)c=0x3a4658;if((x+(y>>3)*9)%26===0)c=mul(c,0.85)}
    if(y<=150&&fbm(x*0.02,y*0.03,3,9103)>0.55)c=mix(c,0x14282a,0.6);
    if(y>=LEDGE&&y<LEDGE+10){c=mix(0x5a5a5e,0x3a3a40,(y-LEDGE)/10);if(y===LEDGE)c=0x8a8a90;if(hash(x>>3,7)>0.8)c=mul(c,0.9)}
    else if(y>=LEDGE+10){const pl=Math.floor((y-LEDGE-10)/9);c=mix(0x3a2a1e,0x2a1c12,hash(pl,x>>6));if((y-LEDGE-10)%9===0)c=0x140c08}
    // the eave: beam, then a row of round tile ends
    if(y<EAVE-12){c=mix(0x1a120c,0x2a1c12,y/(EAVE-12));if(y%7===0)c=mul(c,0.8)}
    BG[p]=c}
  K.setSeed(9105);for(let b=0;b<16;b++){const x0=K.rr(0,W),wd=K.ri(3,6),far=K.rnd();const base=mix(0x2a4a3a,0x1a2c2a,far);for(let y=EAVE;y<LEDGE;y++){const x=Math.round(x0+Math.sin(y*0.01+b)*3);for(let u=0;u<wd;u++){const X=x+u;if(X<0||X>=W)continue;let c=u===0?mul(base,1.25):u===wd-1?mul(base,0.7):base;if((y+b*13)%30<2)c=mix(c,0x6a8a6a,0.4);BG[y*W+X]=c}}
    for(let l=0;l<7;l++){const ly=K.rr(EAVE+10,150),dir=K.rnd()>0.5?1:-1;for(let u=0;u<16;u++){const X=Math.round(x0+dir*u),Y=Math.round(ly+u*0.35+(u*u)*0.02);for(let v=-1;v<=1;v++){if(Math.abs(v)*16>16-u)continue;if(X>=0&&X<W&&Y>=0)BG[(Y+v)*W+X]=mix(0x2a5a40,0x16302a,far+(v+1)*0.15)}}}}
  for(let k=-1;k<=NC+1;k++){const cx=CX(k)+26;for(let y=EAVE-14;y<EAVE-4;y++)for(let x=cx-27;x<cx+27;x++)if(x>=0&&x<W)BG[y*W+x]=mix(0x2a2a30,0x1a1a20,(y-EAVE+14)/10)}
  for(let k=0;k<NC;k++){const cx=CX(k);for(let y=-9;y<=9;y++)for(let x=-9;x<=9;x++){const d=Math.hypot(x,y);if(d>8.5)continue;const X=cx+x,Y=EAVE-6+y;let c=d>7?0x24242a:mix(0x5a5a64,0x3a3a44,(y+8)/16);if(d<4.5&&d>3.5)c=0x2a2a32;if(d<1.5)c=0x6a6a74;BG[Y*W+X]=c}}}
function init(g){if(!built)build();g.obj=[{t:'bottle',c:0,fill:0.1},{t:'bowl',c:1,fill:0.5},{t:'pot',c:2},{t:'bottle',c:3,fill:0.45},{t:'tin',c:4},{t:'wok',c:5},{t:'bottle',c:6,fill:0.75},{t:'leaf',c:7}];
  for(const o of g.obj){o.x=CX(o.c);o.wob=0;o.hit=0;o.fill=o.fill||0}
  g.clock=0;g.drops=[];g.sp=[];g.rip=[];g.rain=0.7;g.scale=g.scale||0;g.press=null;g.carry=null;g.notes=[];K.setSeed(9104);
  g.streaks=[];for(let k=0;k<260;k++)g.streaks.push({x:K.rr(0,W),y:K.rr(0,H),v:K.rr(5,8),l:K.rr(4,10)})}
function at(g,c){return g.obj.find(o=>o.c===c&&o!==g.carry)}
function topY(o){const T=TYPES[o.t];return LEDGE-T.h+(o.t==='leaf'?4:o.t==='bowl'?2:0)}
function freq(g,deg){const sc=SCALES[g.scale][1];const o=Math.floor(deg/5),d=((deg%5)+5)%5;return 196*Math.pow(2,o+sc[d]/12)}
function degOf(o){switch(o.t){case'bottle':return 7+Math.floor(o.fill*5);case'bowl':return 5+Math.floor(o.fill*3);case'tin':return 3;case'pot':return 0;case'wok':return 2;case'leaf':return -3}}
function play(g,o,vol){const f=freq(g,degOf(o));o.hit=1;o.wob=1;g.notes.push({x:o.x,y:topY(o)-6,f:degOf(o),a:1,r:2});if(!K.live())return;const t=K.now(),v=vol||1;
  switch(o.t){case'bottle':K.tone('sine',f*2,f*2,0.9,0.05*v,t,0.002);K.tone('sine',f*4.02,f*4.02,0.3,0.012*v,t,0.002);K.noise(0.03,0.02*v,t,'highpass',5000,5000,1);break;
    case'bowl':K.tone('sine',f*2,f*2,1.6,0.05*v,t,0.003);K.tone('sine',f*2*2.71,f*2*2.71,0.7,0.015*v,t,0.003);K.tone('sine',f*2*5.2,f*2*5.2,0.25,0.006*v,t,0.002);break;
    case'tin':K.tone('triangle',f*2,f*1.96,0.25,0.04*v,t,0.001);K.tone('square',f*3.3,f*3.2,0.08,0.008*v,t,0.001);K.noise(0.08,0.03*v,t,'bandpass',3500,2500,2);break;
    case'pot':K.tone('sine',f*1.6,f,0.35,0.09*v,t,0.004);K.noise(0.05,0.02*v,t,'lowpass',600,300,1);break;
    case'wok':K.tone('triangle',f,f,1.1,0.05*v,t,0.002);K.tone('sine',f*1.47,f*1.47,0.8,0.02*v,t,0.002);K.tone('sine',f*2.09,f*2.09,0.5,0.012*v,t,0.002);break;
    case'leaf':K.noise(0.12,0.05*v,t,'lowpass',500,200,1);K.tone('sine',f,f*0.7,0.18,0.06*v,t,0.003);break}}
function tick(g,pad){const T=MT(g,pad.mouse);g.clock++;
  if(T.click){const o=g.obj.find(o=>{const Tp=TYPES[o.t];return Math.abs(T.x-o.x)<Tp.w/2+6&&T.y>topY(o)-10&&T.y<LEDGE+6});g.press={t:0,mv:0,x:T.x,y:T.y,o,sky:!o&&T.y<LEDGE-50,r0:g.rain}}
  if(g.press&&T.down){const P=g.press;P.t++;P.mv=Math.max(P.mv,Math.hypot(T.x-P.x,T.y-P.y));
    if(P.o&&P.mv>5){g.carry=P.o;P.o.x=lerp(P.o.x,clamp(T.x,20,W-20),0.5);P.o.lift=Math.min(1,(P.o.lift||0)+0.15)}
    if(P.sky)g.rain=clamp(P.r0+(T.x-P.x)/260,0.1,1)}
  if(T.up&&g.press){const P=g.press;if(P.o){if(g.carry===P.o){let best=0,bd=1e9;for(let k=0;k<NC;k++){const d=Math.abs(CX(k)-P.o.x);if(d<bd){bd=d;best=k}}const other=at(g,best);if(other)other.c=P.o.c;P.o.c=best;g.carry=null;if(K.live())K.tone('sine',300,200,0.08,0.03,K.now(),0.002)}
      else if(P.t<14){if(P.o.fill>0.05&&(P.o.t==='bottle'||P.o.t==='bowl')){P.o.pour=40;for(let k=0;k<16;k++)g.sp.push({x:P.o.x+6,y:topY(P.o),vx:K.rr(0.5,1.8),vy:K.rr(-1,0.5),l:K.ri(20,40)});if(K.live())K.noise(0.6,0.04,K.now(),'bandpass',900,400,1.5,0.05)}else play(g,P.o,1)}}
    g.press=null}
  for(const o of g.obj){if(o!==g.carry){o.x=lerp(o.x,CX(o.c),0.25);o.lift=Math.max(0,(o.lift||0)-0.12)}o.wob*=0.86;o.hit*=0.9;if(o.pour>0){o.pour--;o.fill=Math.max(0,o.fill-0.02)}}
  // schedule drips so they land exactly on a sixteenth note
  const FALL=26;const sNow=Math.floor((g.clock+FALL)/STEP),sPrev=Math.floor((g.clock+FALL-1)/STEP);
  if(sNow!==sPrev){const order=[0,5,3,7,1,6,2,4];for(let r=0;r<NC;r++){const k=order[r];if(r>=Math.round(g.rain*NC))continue;if((sNow+PHS[k])%PER[k])continue;g.drops.push({c:k,x:CX(k),t:0})}}
  for(let i=g.drops.length-1;i>=0;i--){const d=g.drops[i];d.t++;const o=at(g,d.c);const ty=o&&!o.lift?topY(o):LEDGE+18;d.ty=ty;
    if(d.t>=FALL){g.drops.splice(i,1);if(o&&!o.lift){play(g,o,0.8+g.rain*0.3);if(o.t==='bottle'||o.t==='bowl')o.fill=Math.min(1,o.fill+(o.t==='bottle'?0.012:0.02));const n=o.t==='leaf'?3:6;for(let k=0;k<n;k++)g.sp.push({x:d.x,y:ty,vx:K.rr(-1.4,1.4),vy:K.rr(-2.4,-0.8),l:K.ri(12,24)})}
      else{g.rip.push({x:d.x,y:LEDGE+18,r:0});if(K.live())K.tone('sine',900,500,0.06,0.012,K.now(),0.001)}}}
  for(const s of g.sp){s.x+=s.vx;s.y+=s.vy;s.vy+=0.2;s.l--}g.sp=g.sp.filter(s=>s.l>0);
  if(K.rnd()<g.rain*0.6)g.rip.push({x:K.rr(0,W),y:K.rr(LEDGE+14,H),r:0});for(const r of g.rip)r.r+=0.35;g.rip=g.rip.filter(r=>r.r<9);
  for(const n of g.notes){n.y-=0.25;n.a-=0.035;n.r+=0.8}g.notes=g.notes.filter(n=>n.a>0);
  if(K.SND.ctx){K.bed('rmr','lowpass',1400,0.6);K.bedSet('rmr',0.01+g.rain*0.03,900+g.rain*1500)}}
const NOTEC=[0xff8a7a,0xffc46a,0xf0f07a,0x8ae8a0,0x7ac8ff];
function draw(g){const t=g.t;em.fill(0);col.set(BG);
  // the lantern's warm pool on the ledge and boards, and its reflection in the wet floor
  for(let y=LEDGE;y<H;y++)for(let x=0;x<W;x++){const p=y*W+x;const l=light(x,y);col[p]=mul(col[p],l);const rx=Math.abs(x-LX+Math.sin(y*0.5+t*0.1)*1.5);if(y>LEDGE+12&&rx<6)col[p]=mix(col[p],0xffc070,(1-rx/6)*0.35*Math.max(0,1-(y-LEDGE-12)/50))}
  for(let y=EAVE;y<LEDGE;y++)for(let x=0;x<W;x++){const p=y*W+x;col[p]=mul(col[p],0.8+0.5*Math.exp(-Math.hypot(x-LX,y-LY)/90))}
  // rain streaks, brighter near the lantern
  const nS=Math.round(g.streaks.length*g.rain);for(let i=0;i<nS;i++){const s=g.streaks[i];const y=(s.y+t*s.v)%H,x=(s.x+y*0.12)%W;const b=0.12+0.7*Math.exp(-Math.hypot(x-LX,y-LY)/90);for(let k=0;k<s.l;k++)K.pxa(x-k*0.12,y-k,0xb0c8e8,b*(1-k/s.l))}
  for(const r of g.rip){const a=(1-r.r/9)*0.5;for(let k=0;k<20;k++){const an=k/20*6.283;K.pxa(r.x+Math.cos(an)*r.r,r.y+Math.sin(an)*r.r*0.3,0xc8d8f0,a*light(r.x,r.y)*0.6)}}
  // the lantern: a string, a red paper globe with ribs, glowing
  K.line(LX,0,LX,LY-16,0x1a1410);const sw=Math.sin(t*0.03)*1.5;
  for(let y=-15;y<=15;y++)for(let x=-12;x<=12;x++){const e=(x/12)**2+(y/15)**2;if(e>1)continue;const rib=Math.abs(Math.sin(Math.asin(clamp(y/15,-1,1))*4))<0.12;let c=mix(0xffe0a0,0xd83a20,Math.sqrt(e));if(rib)c=mul(c,0.75);K.px(LX+x+sw,LY+y,c,90*(1-e))}
  for(let x=-6;x<=6;x++){K.px(LX+x+sw,LY-16,0x2a1a10,0);K.px(LX+x+sw,LY+16,0x2a1a10,0)}for(let k=0;k<6;k++)K.px(LX+sw+(k%3-1),LY+17+k,0xd8a030,0);
  K.glow(LX+sw,LY,80,0xffa850,0.22);
  // the drips
  for(const d of g.drops){const u=d.t/26;const y=EAVE+(d.ty-EAVE)*u*u;const b=light(d.x,y);for(let k=0;k<3+u*4;k++)K.pxa(d.x,y-k,0xd8e8ff,(1-k/(3+u*4))*Math.min(1,b*0.9));K.px(d.x,y,mix(0xffffff,0xffd8a0,b>0.8?0.4:0),120)}
  // a slow bead of water hanging under each tile, swelling until it drops
  for(let k=0;k<NC;k++){const ph=((g.clock/STEP+PHS[k])%PER[k])/PER[k];K.disc(CX(k),EAVE+2+ph*1.5,0.8+ph*1.2,0xa8c0e0,40)}
  // the instruments
  for(const o of g.obj)drawObj(g,o);
  for(const s of g.sp)K.pxa(s.x,s.y,0xe0ecff,Math.min(1,s.l/10)*light(s.x,s.y)*0.8);
  for(const n of g.notes){const c=NOTEC[((n.f%5)+5)%5];const m=Math.ceil(n.r*2.2);for(let k=0;k<m;k++){const an=k/m*6.283;K.pxa(n.x+Math.cos(an)*n.r,n.y+Math.sin(an)*n.r*0.35,c,n.a*0.7)}K.pxa(n.x,n.y-n.r*0.4,c,n.a)}
  K.text('雨 '+'▮'.repeat(Math.round(g.rain*10)),8,60,0x8aa0c0,{size:9});K.text(SCALES[g.scale][0],8,72,0x8aa0c0,{size:9})}
function drawObj(g,o){const T=TYPES[o.t];const bx=Math.round(o.x+Math.sin(g.t*0.9)*o.wob*1.5),by=LEDGE-Math.round((o.lift||0)*20);const L=Math.min(1.3,light(o.x,LEDGE-T.h/2));const lx=o.x<LX?-1:1;const hl=o.hit;
  const P=(x,y,c)=>K.px(bx+x,by+y,mul(c,L),0);
  // a soft contact shadow, and a warm rim on the side that faces the lantern
  if(!o.lift)for(let x=-T.w/2-3;x<=T.w/2+3;x++){K.pxa(bx+x,LEDGE,0x000000,0.4);K.pxa(bx+x,LEDGE+1,0x000000,0.25);K.pxa(bx+x,LEDGE+2,0x000000,0.1)}
  if(o.t==='bottle'){const lvl=Math.round(o.fill*38);
    for(let y=-60;y<0;y++){const neck=y<-44;let w=y<-57?4:neck?3:y<-38?3+Math.round((y+44)*0.9):9;if(y>-3)w=8;for(let x=-w;x<=w;x++){const edge=Math.abs(x)>=w-0;const body=y>=-40&&!neck;const inside=body&&-y<=lvl+1;const s=0.5-x/w*0.5*lx;
      let c=edge?mix(0x3a7a58,0x1a3a28,s):mix(0x1e4a34,0x0e2a1c,s);if(inside)c=edge?mix(0x5aa088,0x2a5a4a,s):mix(0x4a9a88,0x1a5a50,s);if(-y===lvl+1&&body&&!edge)c=0xb0f0e0;if(y<-56)c=mix(0x5a8a6a,0x2a4a38,s);
      if(x===-lx*(w-2)&&y<-4&&y>-56)c=mix(c,0xf0fff4,0.6);if(x===-lx*(w-3)&&y<-10&&y>-38)c=mix(c,0xf0fff4,0.25);P(x,y,c)}}
    if(hl>0.15){K.glow(bx,by-lvl-3,16,0x8af0d0,0.3*hl);em[(by-lvl-2)*W+bx]=255}}
  else if(o.t==='bowl'){const r=22;for(let y=-18;y<0;y++){const u=(y+18)/18;const w=Math.round(r*Math.sqrt(1-(u*0.8)**2));for(let x=-w;x<=w;x++){const s=0.5-x/w*0.5*lx;let c=mix(0xf4f6f8,0xa8b4c4,s);
      if(y>=-13&&y<=-10)c=mix(0x3058b0,0x14286a,s);if(y===-8&&(x+30)%5<2)c=mix(0x4068c0,0x1a3478,s);if(y===-14||y===-9)c=mix(c,0x3058b0,0.4);if(y>-4)c=mul(c,0.85);if(y>-2&&Math.abs(x)<9)c=mix(0x8a94a4,0x5a6474,s);if(Math.abs(x)===w)c=mul(c,0.82);if(x===-lx*(w-3)&&y<-12)c=mix(c,0xffffff,0.7);P(x,y,c)}}
    for(let x=-r;x<=r;x++)P(x,-18,0xfafcff);const wl=o.fill>0.05;for(let x=-r+2;x<=r-2;x++){if(!wl){P(x,-17,0x8a94a4);continue}const ref=Math.abs(x+lx*8)<3;P(x,-17,ref?0xffd8a0:mix(0x2a4a6a,0x4a7090,(x+r)/(2*r)));if(hl>0.3&&((x+Math.round(g.t*0.5))%6===0))P(x,-17,0xe0f0ff)}
    if(hl>0.15)K.glow(bx,by-18,22,0xa8c8ff,0.25*hl)}
  else if(o.t==='tin'){for(let y=-34;y<0;y++){const w=16-Math.round((y+34)/34*1.5);for(let x=-w;x<=w;x++){const s=0.5-x/w*0.5*lx;let c=mix(0xc8d0d8,0x4a5058,s);if((y+34)%10===0)c=mul(c,0.7);if((y+34)%10===1)c=mix(c,0xffffff,0.2);if(x===-lx*(w-4))c=mix(c,0xffffff,0.55);if(x===-lx*(w-5))c=mix(c,0xffffff,0.2);if(Math.abs(x)===w)c=mul(c,0.75);P(x,y,c)}}
    for(let x=-16;x<=16;x++){P(x,-34,0xe0e8f0);P(x,-33,0x2a3038)}for(let a=0;a<=20;a++){const an=Math.PI+a/20*Math.PI;P(Math.round(Math.cos(an)*14),-35+Math.round(Math.sin(an)*12),0x8a9098)}P(-15,-31,0x6a7078);P(15,-31,0x6a7078);
    if(hl>0.15)K.glow(bx,by-30,20,0xe0eaff,0.25*hl)}
  else if(o.t==='pot'){for(let y=-38;y<0;y++){const u=(y+18)/20;let w=Math.round(20*Math.sqrt(Math.max(0,1-u*u*0.8)));if(y<-33)w=7;if(y===-38)w=8;for(let x=-w;x<=w;x++){const d=Math.hypot(x+lx*7,y+24)/22;let c=mix(0xe8a070,0x5a2810,clamp(d,0,1));if(y===-20&&(x+40)%4<2)c=mul(c,0.78);if(y===-19)c=mul(c,0.9);if(y>-4)c=mul(c,0.8);if(Math.abs(x)===w)c=mul(c,0.8);P(x,y,c)}}
    for(let x=-5;x<=5;x++){P(x,-38,0x9a5a34);P(x,-37,x*x<16?0x140804:0x7a3a1c)}
    if(hl>0.15)K.glow(bx,by-38,18,0xffb070,0.25*hl)}
  else if(o.t==='wok'){for(let y=-20;y<0;y++){const u=(y+21)/21;const w=Math.round(25*Math.sqrt(u*(2-u)));for(let x=-w;x<=w;x++){const d=Math.hypot(x+lx*9,y+13)/18;let c=mix(0x7a7a84,0x101014,clamp(d,0,1));if(Math.abs(x+lx*9)<2&&y<-10&&y>-18)c=mix(c,0xffe8c0,0.55);if(y===-1)c=0x2a2a30;P(x,y,c)}}
    for(let x=-3;x<=3;x++){P(x,-21,0x3a3a40);P(x,-22,0x2a2a2e)}for(let k=0;k<4;k++){P(-26-k,-2,0x3a2a1e);P(26+k,-2,0x3a2a1e)}
    if(hl>0.15)K.glow(bx,by-16,24,0xffe0b0,0.22*hl)}
  else if(o.t==='leaf'){for(let y=-9;y<0;y++)for(let x=-24;x<=24;x++){let c=mix(0x8a8a92,0x4a4a52,(y+9)/9);if(y===-9)c=0xaaaab2;if(Math.abs(x)===24)c=mul(c,0.8);if(hash(x,y+50)>0.85)c=mul(c,0.9);P(x,y,c)}
    for(let y=-8;y<=4;y++)for(let x=-23;x<=23;x++){const e=(x/23)**2+(y/7)**2;if(e>1)continue;const an=Math.atan2(y*3.3,x);const vein=Math.abs(Math.sin(an*5))<0.1&&e>0.05;let c=mix(0x8ac858,0x2a5a24,Math.sqrt(e)*0.6+(y+8)/24);if(vein)c=mix(c,0xb0e080,0.4);if(e>0.86)c=mul(c,0.75);P(x,y-10,c)}
    const bead=Math.sin(g.t*0.02)*12+hl*Math.sin(g.t*0.8)*2;K.disc(bx+bead,by-13,2.2,mul(0xc8e8ff,L),0);K.px(bx+bead-1,by-14,0xffffff,200);
    if(hl>0.15)K.glow(bx,by-12,20,0xb0ffa0,0.2*hl)}}
function ai(g){return AIQ(g,(g,A)=>{const r=K.rnd();
  if(r<0.45){const o=g.obj[K.ri(0,g.obj.length-1)];let k=K.ri(0,NC-1);if(k===o.c)k=(k+1)%NC;const y=LEDGE-TYPES[o.t].h/2;
    A.q.push([o.x,y,false,40],[o.x,y,true,6]);for(let s=1;s<=30;s++)A.q.push([lerp(o.x,CX(k),s/30),y-Math.sin(s/30*Math.PI)*20,true,2,null,'lin']);A.q.push([CX(k),y,false,K.ri(220,420)])}
  else if(r<0.62){const x0=K.rr(150,330),dx=K.rr(-90,90);A.q.push([x0,110,false,40],[x0,110,true,4],[x0+dx,112,true,40],[x0+dx,112,false,K.ri(200,360)])}
  else if(r<0.8){const bs=g.obj.filter(o=>(o.t==='bottle'||o.t==='bowl')&&o.fill>0.5);if(bs.length){const o=bs[0];const y=LEDGE-10;A.q.push([o.x,y,false,40],[o.x,y,true,3],[o.x,y,false,K.ri(160,300)])}else A.q.push([A.x,A.y,false,120])}
  else{for(let k=0;k<4;k++){const o=g.obj[K.ri(0,g.obj.length-1)];const y=LEDGE-8;A.q.push([o.x,y,false,16],[o.x,y,true,3],[o.x,y,false,12])}A.q.push([A.x,A.y,false,200])}})}
function info(g){return'雨的乐器 · '+SCALES[g.scale][0]+' · 雨量 '+Math.round(g.rain*100)+'%'}
return{init,tick,draw,ai,info};})();
GAMES.push({id:'rainmusic',name:'雨的乐器',ref:'屋檐滴水，底下放什么就响什么',keys:'拖动瓶子碗罐：挪到别的瓦当底下，旋律就变了 · 点瓶子或碗：把水倒掉 · 点别的东西：敲一下 · 在天上横着拖：雨大雨小',thumbAt:140,
  init:RAINM.init,tick:RAINM.tick,draw:RAINM.draw,ai:RAINM.ai,info:RAINM.info,
  opts:[{label:'换调式',set:g=>{g.scale=(g.scale+1)%3}}],
  about:['夜里下雨的廊下，挂着一盏纸灯笼。檐口十个圆瓦当往下滴水，每个瓦当有自己的节拍，合在一起是一段慢慢的复节奏。','瓦当底下摆着玻璃瓶、青花碗、铁桶、陶罐、倒扣的铁锅，还有石盆里的一片荷叶：水滴落在谁身上，谁就响一个音。瓶子会慢慢被雨灌满，音一级级往上走。把东西拖到别的瓦当下面，曲子就变了；点瓶子或碗把水倒掉；在天上横着拖，让雨大一点或小一点。'],
  tags:['每个瓦当一个节拍','滴水正好落在节拍上','六种器物六种音色','瓶子灌满音往上走','拖动换位置就换旋律','灯笼照亮的雨丝']});



// ================= player: 60 Hz fixed step, hit-stop, keyboard / mouse / touch, attract-mode autoplay, bloom display =================
(function(){
const $=id=>document.getElementById(id);
const {W,H,S}=K;
const cv=$('cv'),ctx=cv.getContext('2d'),stage=$('stage');
const low=document.createElement('canvas');low.width=W;low.height=H;const lg=low.getContext('2d');
const half=document.createElement('canvas');half.width=W>>1;half.height=H>>1;const hg=half.getContext('2d');
const b1=document.createElement('canvas');b1.width=W;b1.height=H;const b1g=b1.getContext('2d');
const b2=document.createElement('canvas');b2.width=W>>1;b2.height=H>>1;const b2g=b2.getContext('2d');
const FILT=(()=>{try{const c=document.createElement('canvas');c.width=c.height=9;const g=c.getContext('2d');g.filter='blur(2px)';g.fillStyle='#fff';g.fillRect(4,4,1,1);return g.getImageData(1,4,1,1).data[3]>0}catch(e){return false}})();
const mips=[[120,68],[60,34],[30,17]].map(([w,h])=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c});
let skip=false,slow=false,avg=8,cur=0,G=null,paused=false,acc=0,last=performance.now(),visible=true,mode='auto',idle=0;
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const keys=new Set(),pressed=new Set();
// mouse / touch: pointer position in game pixels; click = a press this step; stick = the floating joystick for touch play
const mouse={x:W/2,y:H/2,down:false,active:false,click:false,touch:false};
const stick={id:null,ox:0,oy:0,x:0,y:0};
function newGame(d){K.setSeed((Date.now()&0xffff)+cur*77);S.flash=0;S.fade=0;S.frame=0;S.bloomK=1;K.bedsOff();
  const g={t:0,stop:0,ts:1,d,auto:mode==='auto'};d.init(g);return g}
const TB={a:false,b:false,ap:false,bp:false};
function readPad(){const k=c=>keys.has(c);
  let x=(k('ArrowRight')||k('KeyD')?1:0)-(k('ArrowLeft')||k('KeyA')?1:0),y=(k('ArrowDown')||k('KeyS')?1:0)-(k('ArrowUp')||k('KeyW')?1:0);
  if(stick.id!=null){const m=Math.hypot(stick.x,stick.y);if(m>3){const s=Math.min(1,(m-3)/18);x=stick.x/m*s;y=stick.y/m*s}}
  const pad={x,y,
    up:pressed.has('ArrowUp')||pressed.has('KeyW'),down:pressed.has('ArrowDown')||pressed.has('KeyS'),left:pressed.has('ArrowLeft')||pressed.has('KeyA'),right:pressed.has('ArrowRight')||pressed.has('KeyD'),
    fire:k('KeyJ')||k('KeyZ')||k('Space')||TB.a,
    a:pressed.has('KeyJ')||pressed.has('KeyZ')||pressed.has('Space')||pressed.has('Enter')||TB.ap,
    b:pressed.has('KeyK')||pressed.has('KeyX')||pressed.has('Escape')||TB.bp,
    hl:k('ArrowLeft')||k('KeyA')||k('KeyZ')||k('ShiftLeft')||TB.a,hr:k('ArrowRight')||k('KeyD')||k('KeyJ')||k('Slash')||k('ShiftRight')||TB.b,hd:k('ArrowDown')||k('KeyS')||k('Space'),
    bh:k('KeyK')||k('KeyX')||TB.b,
    stick:stick.id!=null,
    mouse:mouse.active?{x:mouse.x,y:mouse.y,down:mouse.down,click:mouse.click,touch:mouse.touch}:null};
  pressed.clear();mouse.click=false;TB.ap=TB.bp=false;return pad}
const HAND=K.spr(['.kk.......','kwwk......','kwwk......','kwwkkk....','kwwkwwkk..','kwwkwwkwkk','kwwwwwwwwk','kwwwwwwwwk','.kwwwwwwk.','..kwwwwk..','..kwwwwk..'],{k:0x1a1418,w:0xf4ecdc});
const HANDD=K.spr(['..........','..........','.kk.......','kwwkkkkk..','kwwkwwkwkk','kwwwwwwwwk','kwwwwwwwwk','kwwwwwwwwk','.kwwwwwwk.','..kwwwwk..','..kwwwwk..'],{k:0x1a1418,w:0xf4ecdc});
function drawHand(){if(!G||G.d.noHand||G.thumb)return;let m=null;if(mode==='play'){if(mouse.active&&!mouse.touch)m={x:mouse.x,y:mouse.y,down:mouse.down}}else m=G._hand;if(!m)return;
  const s=m.down?HANDD:HAND;const st=G.d.handStyle;K.blit(s,Math.round(m.x)-2,Math.round(m.y)-(m.down?2:0))}
function step(){const d=G.d;
  if(G.stop>0){G.stop--;S.frame++;return}
  let pad;
  if(mode==='play'){pad=readPad();const any=pad.x||pad.y||pad.fire||pad.a||pad.b||(pad.mouse&&(pad.mouse.down||pad.mouse.click));if(!any)idle++;else idle=0;
    if(idle>60*40&&(!d.canAttract||d.canAttract(G))){setMode('auto');if(d.onAuto)d.onAuto(G)}}
  else{pressed.clear();mouse.click=false;pad=d.ai(G);G._hand=pad.mouse||null}
  d.tick(G,pad);G.t++;S.frame++;if(S.flash>0){S.flash*=0.86;if(S.flash<0.02)S.flash=0}}
function frame(){G.d.draw(G);drawHand();S.raw=false;K.present();lg.putImageData(S.img,0,0);
  ctx.imageSmoothingEnabled=false;ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;ctx.drawImage(low,0,0,cv.width,cv.height);
  hg.putImageData(S.bimg,0,0);ctx.globalCompositeOperation='lighter';ctx.imageSmoothingEnabled=true;
  if(FILT){b1g.clearRect(0,0,W,H);b1g.filter='blur(2px)';b1g.drawImage(half,0,0,W,H);b1g.filter='none';
    b2g.clearRect(0,0,W>>1,H>>1);b2g.filter='blur(7px)';b2g.drawImage(half,0,0);b2g.filter='none';
    ctx.globalAlpha=0.8;ctx.drawImage(b1,0,0,cv.width,cv.height);ctx.globalAlpha=0.9;ctx.drawImage(b2,0,0,cv.width,cv.height);ctx.globalAlpha=1}
  else{let src=half;const al=[0.6,0.7,0.8];mips.forEach((m,i)=>{const g=m.getContext('2d');g.imageSmoothingEnabled=true;g.clearRect(0,0,m.width,m.height);g.drawImage(src,0,0,m.width,m.height);src=m;ctx.globalAlpha=al[i];ctx.drawImage(m,0,0,cv.width,cv.height)});ctx.globalAlpha=1}
  ctx.globalCompositeOperation='source-over';syncInfo()}
function fit(){const aw=stage.clientWidth-2,ah=Math.max(200,innerHeight*0.74);let sc=Math.min(aw/W,ah/H);const dpr=devicePixelRatio||1;
  const css=sc>=2?Math.floor(sc*dpr)/dpr:Math.max(0.5,sc);const dev=Math.max(1,Math.min(4,Math.round(css*dpr)));if(cv.width!==W*dev){cv.width=W*dev;cv.height=H*dev}
  cv.style.width=Math.floor(W*css)+'px';cv.style.height=Math.floor(H*css)+'px'}
let infoLast='';function syncInfo(){const d=G.d;const s=(d.info?d.info(G):'')+(mode==='play'?'':' · 自己在动');if(s!==infoLast){$('info').textContent=s;infoLast=s}}
// ---------------- controls ----------------
const rail=$('rail');
function seg(label,opts,get,set){const l=document.createElement('span');l.className='lab';l.textContent=label;const s=document.createElement('div');s.className='seg';
  for(const[v,t]of opts){const b=document.createElement('button');b.type='button';b.textContent=t;b.onclick=()=>{set(v);sync()};b.dataset.v=v;s.appendChild(b)}
  const sync=()=>{for(const b of s.children)b.classList.toggle('on',String(b.dataset.v)===String(get()))};rail.append(l,s);sync();return sync}
const btn=(t,fn)=>{const b=document.createElement('button');b.type='button';b.className='btn';b.textContent=t;b.onclick=fn;rail.appendChild(b);return b};
const syncMode=seg('',[['play','亲手摸'],['auto','自己动']],()=>mode,v=>{wake();setMode(v);cv.focus()});
const playB=btn('暂停',()=>setPaused(!paused));
btn('重来',()=>{G=newGame(GAMES[cur]);frame();cv.focus()});
let sndUser=false;
const sndB=btn('声音 开',()=>{K.sndInit();sndUser=true;K.SND.on=!K.SND.on;syncSnd();if(K.SND.ctx&&K.SND.ctx.state==='suspended')K.SND.ctx.resume();if(!K.SND.on)K.bedsOff()});
function syncSnd(){const on=K.SND.on||!sndUser;sndB.textContent=on?'声音 开':'声音 关';sndB.classList.toggle('on',on)}
// sound comes on with the first key or touch (browsers need a gesture), unless the player turned it off
function wake(){if(sndUser)return;K.sndInit();if(K.SND.ctx){K.SND.on=true;if(K.SND.ctx.state==='suspended')K.SND.ctx.resume()}syncSnd()}
const optBox=document.createElement('span');optBox.className='opts';rail.appendChild(optBox);
function buildOpts(){optBox.innerHTML='';const d=GAMES[cur];for(const o of d.opts||[]){const b=document.createElement('button');b.type='button';b.className='btn';b.onclick=()=>{wake();o.set(G);syncOpts();cv.focus()};b._o=o;optBox.appendChild(b)}syncOpts()}
function syncOpts(){for(const b of optBox.children){const o=b._o;const v=o.get?o.get(G):null;b.textContent=typeof o.label==='function'?o.label(G):o.label;b.classList.toggle('on',!!v)}}
setInterval(()=>{if(G)syncOpts()},500);
const info=document.createElement('span');info.id='info';rail.appendChild(info);
function setMode(m){mode=m;idle=0;syncMode();$('hint').textContent=m==='play'?(GAMES[cur].keys||''):'它在自己动 · 把手放上画面就换成你';if(G)G.auto=m==='auto';touchUI()}
function setPaused(p){paused=p;playB.textContent=p?'继续':'暂停'}
addEventListener('keydown',e=>{if(e.target.tagName==='INPUT')return;const gameKey=/^(Arrow|Key[WASDJKZX]|Space|Enter|Escape)/.test(e.code);
  if(e.code==='KeyP'){setPaused(!paused);return}
  if(gameKey&&(e.code==='Space'||e.code==='Enter')&&document.activeElement&&document.activeElement.tagName==='BUTTON')return;
  if(gameKey){wake();if(paused)setPaused(false);if(mode!=='play'){setMode('play')}if(!keys.has(e.code))pressed.add(e.code);keys.add(e.code);e.preventDefault()}});
addEventListener('keyup',e=>keys.delete(e.code));
addEventListener('blur',()=>{keys.clear();if(mode==='play'&&G&&G.d.onBlur)G.d.onBlur(G)});
function cpos(e){const r=cv.getBoundingClientRect();return[(e.clientX-r.left)/r.width*W,(e.clientY-r.top)/r.height*H]}
const coarse=matchMedia('(pointer: coarse)').matches;
let hov=0;cv.addEventListener('pointermove',e=>{const p=cpos(e);if(e.pointerId===stick.id){stick.x=p[0]-stick.ox;stick.y=p[1]-stick.oy}if(mode!=='play'){if(e.pointerType==='mouse'&&GAMES[cur].hover&&++hov>40){hov=0;setMode('play')}else return}mouse.x=p[0];mouse.y=p[1];mouse.active=true;mouse.touch=e.pointerType!=='mouse'});
cv.addEventListener('pointerdown',e=>{cv.focus();wake();const p=cpos(e);e.preventDefault();
  if(mode!=='play'){setMode('play')}
  // touch on a stick game: a touch anywhere starts a floating joystick; the game may also read it as a tap
  if(e.pointerType!=='mouse'&&G.d.touch==='stick'){stick.id=e.pointerId;stick.ox=p[0];stick.oy=p[1];stick.x=stick.y=0}
  try{cv.setPointerCapture(e.pointerId)}catch(_){}
  mouse.x=p[0];mouse.y=p[1];mouse.active=true;mouse.down=true;mouse.click=true;mouse.touch=e.pointerType!=='mouse'});
addEventListener('pointerup',e=>{if(e.pointerId===stick.id){stick.id=null;stick.x=stick.y=0}mouse.down=false});
addEventListener('pointercancel',e=>{if(e.pointerId===stick.id){stick.id=null;stick.x=stick.y=0}mouse.down=false});
cv.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse')mouse.active=false});
// touch buttons (A / B) for games that want them
const tb=$('tbtn');
function tbtn(lbl,k){const b=document.createElement('button');b.type='button';b.textContent=lbl;
  b.addEventListener('pointerdown',e=>{e.preventDefault();wake();if(mode!=='play'){setMode('play')}TB[k]=true;TB[k+'p']=true});
  const up=()=>{TB[k]=false};b.addEventListener('pointerup',up);b.addEventListener('pointercancel',up);b.addEventListener('pointerleave',up);tb.appendChild(b);return b}
const tA=tbtn('A','a'),tB=tbtn('B','b');
function touchUI(){const d=GAMES[cur];const show=coarse&&d.tbtn&&mode==='play';tb.style.display=show?'flex':'none';if(show){tA.textContent=d.tbtn[0];tB.textContent=d.tbtn[1]||'B';tB.style.display=d.tbtn[1]?'':'none'}}
// ---------------- cartridges ----------------
const carts=$('carts');
function select(i){cur=i;const d=GAMES[i];mode='auto';G=newGame(d);$('nm').textContent=d.name;$('about').innerHTML=d.about.map(p=>'<p>'+p+'</p>').join('');$('tags').innerHTML=d.tags.map(t=>'<li>'+t+'</li>').join('');
  for(const[k,c]of [...carts.children].entries())c.classList.toggle('on',k===i);buildOpts();setMode(mode);try{history.replaceState(null,'','#'+d.id)}catch(e){}frame()}
GAMES.forEach((d,i)=>{const b=document.createElement('button');b.type='button';b.className='cart';const c=document.createElement('canvas');c.width=W;c.height=H;
  const nm=document.createElement('span');nm.className='nm';nm.textContent=d.name;const rf=document.createElement('span');rf.className='ref';rf.textContent=d.ref;b.append(c,nm,rf);
  b.onclick=()=>{select(i);stage.scrollIntoView({block:'nearest',behavior:'smooth'})};carts.appendChild(b);d._thumb=c});
// thumbnails are simulated one per task after the page is up, so it opens at once; the game being played just lends its live frame
function thumb(d){const keep=[cur,G];cur=GAMES.indexOf(d);G=newGame(d);G.auto=true;G.thumb=true;for(let k=0;k<(d.thumbAt||300);k++){const pad=d.ai(G);if(G.stop>0)G.stop--;else{d.tick(G,pad);G.t++}S.frame++;if(d.thumbUntil&&d.thumbUntil(G))break}d.draw(G);S.raw=false;K.present();
  const g=d._thumb.getContext('2d');g.putImageData(S.img,0,0);cur=keep[0];G=keep[1]}
function thumbs(){const q=GAMES.slice();const one=()=>{const d=q.shift();if(!d)return;thumb(d);setTimeout(one,30)};setTimeout(one,200)}
new ResizeObserver(()=>{fit();if(G)frame()}).observe(stage);
new IntersectionObserver(es=>{visible=es[0].isIntersecting}).observe(stage);
document.addEventListener('visibilitychange',()=>{if(document.hidden&&mode==='play'&&G&&G.d.onBlur)G.d.onBlur(G)});
const start=Math.max(0,GAMES.findIndex(d=>'#'+d.id===location.hash));
fit();select(start);thumbs();if(reduce)setPaused(true);syncSnd();
function loop(now){const dt=Math.min(0.1,(now-last)/1000);last=now;
  if(!paused&&visible){acc+=dt*60*(G.ts||1);let n=0;while(acc>=1&&n<5){step();acc-=1;n++}skip=!skip;if(n&&(!slow||!skip)){const t0=performance.now();frame();const ft=performance.now()-t0;avg=avg*0.95+ft*0.05;slow=avg>14}}
  requestAnimationFrame(loop)}
requestAnimationFrame(loop);
window.__TT={step:()=>step(),frame,select,get G(){return G},setMode:m=>{setMode(m);G=newGame(GAMES[cur])},press:c=>{pressed.add(c)},hold:(c,on)=>{on?keys.add(c):keys.delete(c)},mouse};
})();
