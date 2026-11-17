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
// a stroke helper: push a polyline as one pressed drag
function aiStroke(A,pts,spd){const p0=pts[0];A.q.push([p0[0],p0[1],false,24],[p0[0],p0[1],true,3]);for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i];A.q.push([b[0],b[1],true,Math.max(2,Math.round(Math.hypot(b[0]-a[0],b[1]-a[1])/(spd||3))),null,'lin'])}A.q.push([pts[pts.length-1][0],pts[pts.length-1][1],false,6])}
// shared mouse tracker: previous position, velocity, press edges
function MT(g,m){const T=g._mt||(g._mt={x:240,y:135,px:240,py:135,vx:0,vy:0,down:false,pdown:false,on:false});T.pdown=T.down;
  if(m){T.px=T.on?T.x:m.x;T.py=T.on?T.y:m.y;T.x=m.x;T.y=m.y;T.vx=T.vx*0.6+(T.x-T.px)*0.4;T.vy=T.vy*0.6+(T.y-T.py)*0.4;T.down=m.down;T.on=true;T.click=m.click}else{T.on=false;T.down=false;T.click=false}
  T.up=T.pdown&&!T.down;return T}



// ================= 珊瑚礁: touch the reef and it flinches =================
// A sunlit patch of shallow reef: a brain coral, branching staghorn and a purple sea fan, every surface furred with
// tiny feeding polyps, an anemone with two clownfish, a school of blue chromis overhead, caustics crawling on the sand.
// Tap a coral and its polyps snap shut in a wave that runs out from your finger, then slowly bloom open again. Drag to
// push a current through: tentacles, fan and fish all lean with it. Reach toward the anemone and the clownfish dive in.
const REEF=(function(){const {W,H,S,mix,mul,clamp,lerp,hash,fbm,rgb}=K;const col=S.col,em=S.em,N=W*H;
const BG=new Uint32Array(N),CM=new Uint8Array(N);let built=false;const SAND=222;let POLY=[];
function build(){built=true;K.setSeed(8201);
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const t=y/H;let c=mix(0x3ab0d8,0x0a4a7a,Math.pow(t,0.8));BG[y*W+x]=c}
  // far reef silhouettes in the blue haze
  for(let x=0;x<W;x++){const h=170-fbm(x*0.02,1,3,8202)*50;for(let y=Math.floor(h);y<SAND;y++)BG[y*W+x]=mix(BG[y*W+x],0x1a6a8a,0.45)}
  for(let y=SAND-6;y<H;y++)for(let x=0;x<W;x++){const top=SAND-4+Math.sin(x*0.05)*3;if(y<top)continue;BG[y*W+x]=mix(0xd8c8a0,0x9a8a6a,clamp((y-top)/50+hash(x,y)*0.15,0,1))}
  const put=(x,y,c,m)=>{x=Math.round(x);y=Math.round(y);if(x<0||y<0||x>=W||y>=H)return;BG[y*W+x]=c;CM[y*W+x]=m};
  // brain coral: a dome of winding grooves
  for(let y=150;y<SAND+2;y++)for(let x=30;x<170;x++){const u=(x-100)/70,v=(y-SAND)/72;if(u*u+v*v>1||y>SAND+1)continue;const nz=Math.sqrt(Math.max(0,1-u*u-v*v));const gr=Math.sin(fbm(x*0.03,y*0.04,3,8203)*40);const l=clamp(0.4-u*0.4-v*0.3+nz*0.3,0,1);
    let c=mix(0x8a7a3a,0xd8c870,l);if(Math.abs(gr)<0.22)c=mul(c,0.55);else if(Math.abs(gr)<0.4)c=mul(c,0.8);put(x,y,c,1)}
  // staghorn: branching antlers
  const branch=(x,y,a,len,w,d)=>{for(let i=0;i<len;i++){x+=Math.cos(a);y+=Math.sin(a);a+=K.rr(-0.06,0.06);for(let o=-w;o<=w;o++){const l=clamp(0.6-o/w*0.4,0,1);put(x+o*Math.sin(a)*-1,y+o*Math.cos(a),mix(0x9a6a5a,0xe8b8a0,l),2)}
      if(d<4&&i>len*0.4&&K.rnd()<0.05){branch(x,y,a+K.rr(0.4,0.8)*(K.rnd()<0.5?-1:1),len*0.6,Math.max(1,w-1),d+1)}}put(x,y,0xfff0e0,2)};
  for(let k=0;k<6;k++)branch(210+k*9,SAND,-Math.PI/2+K.rr(-0.7,0.7),K.rr(40,70),2,0);
  // table coral and a few small heads
  for(let y=196;y<SAND;y++)for(let x=388;x<466;x++){const u=(x-427)/39;if(y<204&&Math.abs(u)<1-((204-y)/8)*0.1){put(x,y,mix(0x5a8a6a,0x9ad0a0,clamp(0.5-u*0.4,0,1)),3)}else if(Math.abs(x-427)<4)put(x,y,0x4a6a5a,3)}
  // orange tube sponges and a pink soft coral
  for(const [bx,h,c] of [[176,38,0xe8742a],[184,28,0xd8622a],[191,44,0xf08a3a],[300,22,0xe8742a],[310,30,0xd86a2a]]){for(let y=SAND-h;y<SAND;y++)for(let x=bx-3;x<=bx+3;x++){const o=x-bx;put(x,y,y<SAND-h+2&&Math.abs(o)<2?0x5a2010:mix(mul(c,0.7),c,clamp(0.6-o/3*0.4,0,1)),4)}}
  for(let k=0;k<60;k++){const a=-Math.PI/2+K.rr(-1.1,1.1),L=K.rr(10,24);let x=150+K.rr(-4,4),y=SAND;for(let i=0;i<L;i++){x+=Math.cos(a)*0.9;y+=Math.sin(a);put(x,y,mix(0xc0507a,0xff9ac0,i/L),5)}}
  // build polyps: points scattered on every coral surface
  POLY=[];for(let k=0;k<9000;k++){const x=K.ri(0,W-1),y=K.ri(100,SAND+2);const m=CM[y*W+x];if(!m||m===4)continue;if(m===1&&k%3)continue;POLY.push({x,y,m,ph:K.rnd()*6,c:m===1?0xc8ff60:m===2?0xfff4b0:m===5?0xffe0f0:0x80ffd0})}}
function fanPts(){// the sea fan's lattice (drawn live so it can sway)
  const pts=[];K.setSeed(8204);const rec=(x,y,a,len,d)=>{for(let i=0;i<len;i++){x+=Math.cos(a);y+=Math.sin(a);a+=K.rr(-0.08,0.08);pts.push([x,y,d])}if(d<7){rec(x,y,a-K.rr(0.2,0.45),len*0.76,d+1);rec(x,y,a+K.rr(0.2,0.45),len*0.76,d+1)}};rec(300,SAND-2,-Math.PI/2-0.15,34,0);rec(318,SAND-2,-Math.PI/2+0.2,26,1);return pts}
let FAN=null;
function init(g){if(!built)build();if(!FAN)FAN=fanPts();K.setSeed(8205);g.ext=new Float32Array(POLY.length).fill(1);g.rt=new Float32Array(POLY.length).fill(-1);g.waves=[];g.cur=0;g.curY=0;
  g.ten=[];for(let k=0;k<64;k++)g.ten.push({a:-Math.PI/2+(k/63-0.5)*2.8,len:K.rr(22,36),ph:K.rnd()*6,curl:0});
  g.clown=[{x:400,y:190,vx:0,vy:0,a:0},{x:380,y:200,vx:0,vy:0,a:1}];g.fish=[];for(let k=0;k<34;k++)g.fish.push({x:K.rr(150,350),y:K.rr(40,100),vx:K.rr(-0.5,0.5),vy:0});g.press=null}
const ANX=372,ANY=SAND-6;
function tick(g,pad){const T=MT(g,pad.mouse);const t=g.t;
  if(T.click)g.press={t:0,mv:0,x:T.x,y:T.y};if(g.press&&T.down){g.press.t++;g.press.mv=Math.max(g.press.mv,Math.hypot(T.x-g.press.x,T.y-g.press.y));if(g.press.mv>6){g.cur=lerp(g.cur,clamp(T.vx*0.4,-2,2),0.2);g.curY=lerp(g.curY,clamp(T.vy*0.3,-1.5,1.5),0.2)}}
  if(T.up&&g.press){if(g.press.mv<6&&g.press.t<16){g.waves.push({x:T.x,y:T.y,t0:t});for(let i=0;i<POLY.length;i++){const p=POLY[i];const d=Math.hypot(p.x-T.x,p.y-T.y);if(d<200){const at=t+d/2.2;if(g.rt[i]<t||at<g.rt[i])g.rt[i]=at}}if(K.live()){const t0=K.now();for(let k=0;k<6;k++)K.noise(0.03,0.02,t0+k*0.05,'highpass',4000,4000,1,0.002)}}g.press=null}
  g.cur*=0.98;g.curY*=0.97;const sway=Math.sin(t*0.02)*0.4+g.cur;g.sway=sway;
  for(let i=0;i<POLY.length;i++){if(g.rt[i]>=0&&t>=g.rt[i]&&t<g.rt[i]+4)g.ext[i]=0;else g.ext[i]=Math.min(1,g.ext[i]+0.006)}
  // holding near any coral keeps it shut
  if(g.press&&T.down&&g.press.t>12)for(let i=0;i<POLY.length;i++){const p=POLY[i];if(Math.abs(p.x-T.x)<26&&Math.abs(p.y-T.y)<26)g.ext[i]=Math.max(0,g.ext[i]-0.08)}
  // anemone tentacles curl when you come close
  const near=T.on&&Math.hypot(T.x-ANX,T.y-ANY+14)<50&&(T.down||g.auto);for(const tn of g.ten){tn.curl=lerp(tn.curl,near?1:0,near?0.12:0.02)}
  // clownfish: hover over the anemone, dive into it when the finger comes near
  g.clown.forEach((c,k)=>{const hide=near||(T.down&&Math.hypot(T.x-c.x,T.y-c.y)<60);const tx=ANX+Math.sin(t*0.02+k*2)*(hide?4:26),ty=ANY-(hide?8:26)+Math.cos(t*0.03+k)*(hide?2:10);c.vx+=(tx-c.x)*0.01+g.cur*0.02;c.vy+=(ty-c.y)*0.01;c.vx*=0.9;c.vy*=0.9;c.x+=c.vx;c.y+=c.vy;if(Math.abs(c.vx)>0.05)c.dir=c.vx>0?1:-1});
  // chromis school
  let cx=0,cy=0;for(const f of g.fish){cx+=f.x;cy+=f.y}cx/=g.fish.length;cy/=g.fish.length;
  for(const f of g.fish){for(const o of g.fish){if(o===f)continue;const dx=f.x-o.x,dy=f.y-o.y,d2=dx*dx+dy*dy;if(d2<64&&d2>0){f.vx+=dx/d2*0.4;f.vy+=dy/d2*0.4}}f.vx+=(cx-f.x)*0.0008+Math.sin(t*0.01)*0.01+g.cur*0.03;f.vy+=(cy-f.y)*0.0008+(70-f.y)*0.0005+g.curY*0.02;if(T.down){const dx=f.x-T.x,dy=f.y-T.y,d=Math.hypot(dx,dy)+1;if(d<50){f.vx+=dx/d*0.3;f.vy+=dy/d*0.3}}
    const v=Math.hypot(f.vx,f.vy);if(v>1.8){f.vx*=1.8/v;f.vy*=1.8/v}f.vx*=0.98;f.vy*=0.98;f.x+=f.vx;f.y+=f.vy;if(f.x<20)f.vx+=0.05;if(f.x>W-20)f.vx-=0.05;if(f.y<20)f.vy+=0.05;if(f.y>150)f.vy-=0.05}
  if(K.SND.ctx){K.bed('rsea','lowpass',400,0.5);K.bedSet('rsea',0.025+Math.abs(g.cur)*0.02,350);K.bed('rsnap','highpass',5000,0.6);K.bedSet('rsnap',0.006,6000)}}
function draw(g){const t=g.t;col.set(BG);em.fill(0);const sw=g.sway||0;
  // sun shafts and caustics on the sand
  for(let y=0;y<SAND;y++){const f=0.18*(1-y/SAND);for(let x=0;x<W;x++){const u=x-y*0.3;const v=Math.sin(u*0.05+t*0.008)+Math.sin(u*0.13-t*0.013)*0.6;if(v>0.9){const p=y*W+x;col[p]=mix(col[p],0xc8f4ff,(v-0.9)*f)}}}
  for(let y=SAND-4;y<H;y++)for(let x=0;x<W;x++){const p=y*W+x;if(CM[p])continue;const a=Math.sin(x*0.12+Math.sin(y*0.2+t*0.03)*2+t*0.02)+Math.sin(y*0.3-x*0.05+t*0.025);if(a>1.3)col[p]=mix(col[p],0xffffe8,0.4)}
  // sea fan: lattice of purple twigs, swaying more toward the top
  for(const [x,y,d] of FAN){const h=(SAND-y)/100;const X=x+sw*h*h*14+Math.sin(t*0.03+y*0.05)*h*1.5;K.px(X,y,d<2?0x6a2a6a:mix(0xb04ab0,0xe070d0,d/6),0);if(d<3)K.px(X+1,y,0x5a1a5a,0)}
  // polyps: little open stars that shut to dots
  for(let i=0;i<POLY.length;i++){const p=POLY[i];const e=g.ext[i];const bob=Math.sin(t*0.05+p.ph)*0.5;if(e>0.3){const c=p.c;K.px(p.x,p.y-1+bob*0.5,c,Math.round(60*e));if(e>0.6){K.pxa(p.x-1,p.y-1,c,0.7*e);K.pxa(p.x+1,p.y-1,c,0.7*e);K.pxa(p.x+sw*0.5,p.y-2,c,0.8*e);K.pxa(p.x,p.y,c,0.4*e)}}else K.px(p.x,p.y,mul(BG[p.y*W+p.x],0.85),0)}
  // anemone: pink tentacles with purple tips, curling in when you come close
  for(let k=0;k<16;k++)K.disc(ANX+(k-8)*2,ANY+3,5,k%3?0x8a3a5a:0x7a2a4a,0);
  for(const tn of g.ten){let x=ANX+Math.cos(tn.a)*8,y=ANY+Math.sin(tn.a)*3;let a=tn.a;const L=tn.len*(1-tn.curl*0.55);for(let s=0;s<L;s++){const u=s/L;a+=(Math.sin(t*0.05+tn.ph+s*0.2)*0.04+sw*0.012)+tn.curl*0.1*(tn.a<-Math.PI/2?1:-1);x+=Math.cos(a);y+=Math.sin(a);K.px(x,y,mix(0xf07aa0,0xc060e0,u),u>0.8?60:0);if(u<0.6)K.px(x+1,y,0xd05a80,0)}K.px(x,y,0xffd0ff,90)}
  // clownfish
  for(const c of g.clown){const d=c.dir||1;for(let u=-5;u<=5;u++)for(let v=-3;v<=3;v++){if((u/5)**2+(v/3)**2>1)continue;const band=Math.abs(u+1*d)<1||Math.abs(u-3*d)<1;K.px(c.x+u*d,c.y+v,band?0xffffff:Math.abs(u)>4?0x2a1a10:0xff7a1a,0)}K.px(c.x-6*d,c.y,0xff7a1a,0);K.px(c.x-7*d,c.y-1,0xff7a1a,0);K.px(c.x-7*d,c.y+1,0xff7a1a,0);K.px(c.x+3*d,c.y-1,0x101010,0)}
  // chromis
  for(const f of g.fish){const d=f.vx>=0?1:-1;for(let u=-2;u<=2;u++){K.px(f.x+u*d,f.y,u>0?0x9af0e0:0x4ac0c0,0)}K.px(f.x-3*d,f.y-1,0x4ac0c0,0);K.px(f.x-3*d,f.y+1,0x4ac0c0,0);K.px(f.x,f.y-1,0x6ad8d0,0)}
  // the touch wave, a faint ring through the water
  for(const w of g.waves){const r=(t-w.t0)*2.2;if(r<200)for(let k=0;k<60;k++){const a=k/60*6.283;K.pxa(w.x+Math.cos(a)*r,w.y+Math.sin(a)*r,0xffffff,0.12*(1-r/200))}}g.waves=g.waves.filter(w=>(t-w.t0)*2.2<200)}
function ai(g){return AIQ(g,(g,A)=>{const r=K.rnd();
  if(r<0.45){const p=POLY[K.ri(0,POLY.length-1)];A.q.push([p.x,p.y-6,false,40],[p.x,p.y,true,3],[p.x,p.y,false,K.ri(120,220)])}
  else if(r<0.7){const y=K.rr(80,190);const d=K.rnd()<0.5?1:-1;aiStroke(A,[[240-160*d,y],[240,y-10],[240+160*d,y+10]],6);A.q.push([A.x,A.y,false,K.ri(120,200)])}
  else if(r<0.85){A.q.push([ANX+20,ANY-40,false,50],[ANX+10,ANY-26,true,K.ri(80,140)],[ANX+60,ANY-60,false,K.ri(100,160)])}
  else{const x=K.rr(60,150),y=K.rr(170,215);A.q.push([x,y,false,40],[x,y,true,K.ri(80,140)],[x,y,false,K.ri(120,200)])}})}
function info(g){let n=0;for(let i=0;i<g.ext.length;i+=9)if(g.ext[i]<0.5)n++;return'珊瑚礁 · '+(n>20?'珊瑚虫缩回去了':'珊瑚虫张开着')}
return{init,tick,draw,ai,info};})();
GAMES.push({id:'reef',name:'珊瑚礁',ref:'碰一下珊瑚，珊瑚虫一圈圈缩回去',keys:'点珊瑚：珊瑚虫从手指处一圈圈缩回去，再慢慢张开 · 按住：一直缩着 · 拖动：推一股水流，海葵、海扇和鱼都跟着倒 · 靠近海葵：小丑鱼钻进去躲',thumbAt:150,
  init:REEF.init,tick:REEF.tick,draw:REEF.draw,ai:REEF.ai,info:REEF.info,
  about:['阳光照着的一片浅水珊瑚礁：脑珊瑚、鹿角珊瑚、一把紫色的海扇，表面布满一粒粒在进食的小珊瑚虫；一株海葵里住着两条小丑鱼，头顶游着一群蓝色的光鳃鱼，沙地上爬着光纹。','点一下珊瑚，珊瑚虫会从你手指的地方开始一圈圈合上，像波浪一样传开，然后慢慢再张开。拖动是推一股水流过去，海葵的触手、海扇和鱼都跟着倒；手伸向海葵，小丑鱼就钻进去躲起来。'],
  tags:['珊瑚虫一圈圈缩回去','按住一直缩着','拖动推一股水流','海扇和触手跟着摆','小丑鱼钻进海葵躲','沙地上的光纹']});



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
