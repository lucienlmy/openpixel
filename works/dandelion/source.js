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



// ================= 蒲公英: blow the clocks, watch the seeds take root =================
// A meadow on a slope at golden hour, the sun low behind it, white dandelion clocks lit from behind. Swipe across them
// and the wind of your finger tears seeds off: each one a tiny parachute that sails, spins, drifts with the gust and
// sinks slowly into the grass. Hold still beside a clock to breathe on it. Seeds that land can take root: a rosette of
// toothed leaves, a stem, a yellow flower that opens, closes and turns into a new clock, ready to be blown again.
const DANDY=(function(){const {W,H,S,mix,mul,clamp,lerp,hash,fbm,rgb}=K;const col=S.col,em=S.em,N=W*H;
const BG=new Uint32Array(N);let built=false;const HOR=138;const SUNX=392,SUNY=112;
const GW=31,GH=18,CS=16;
function build(){built=true;
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const p=y*W+x;let c;const ds=Math.hypot(x-SUNX,(y-SUNY)*1.3);
    if(y<HOR){const t=y/HOR;c=t<0.6?mix(0x6a84b8,0xd0b0a0,t/0.6):mix(0xd0b0a0,0xf8c888,(t-0.6)/0.4);c=mix(c,0xfff0c8,Math.exp(-ds/50)*0.8);
      // two long thin clouds catching the light
      const cl=fbm(x*0.008,y*0.06,3,4101);if(y>30&&y<90&&cl>0.55)c=mix(c,mix(0xf8e0c8,0xb8a0a8,(y-30)/80),Math.min(0.6,(cl-0.55)*4))}
    else c=0x5a7a3a;
    BG[p]=c}
  // far hills (blue), then a nearer ridge with a line of trees, then the meadow sloping toward us
  const ridge=(x,a,b,f,s)=>a+Math.sin(x*f+s)*b+Math.sin(x*f*2.7+s*2)*b*0.4;
  for(let x=0;x<W;x++){const h1=ridge(x,HOR-22,8,0.012,1),h2=ridge(x,HOR-8,6,0.02,4);
    for(let y=Math.floor(h1);y<HOR+30;y++){const p=y*W+x;if(y<h2){BG[p]=mix(0x8a98b8,0xc8b8b0,clamp((y-h1)/30,0,1));BG[p]=mix(BG[p],0xffe8c0,Math.exp(-Math.hypot(x-SUNX,y-SUNY)/60)*0.5)}}
    for(let y=Math.floor(h2);y<H;y++){const p=y*W+x;const t=(y-h2)/(H-h2);let c=mix(0xa8a058,0x34501e,Math.min(1,t*1.3));c=mix(c,mul(c,0.75),clamp(fbm(x*0.02,y*0.05,3,4102)-0.45,0,0.4)*2);
      c=mix(c,0xf8d080,Math.exp(-Math.hypot(x-SUNX,(y-HOR)*2.2)/120)*0.6*(1-t*0.8));BG[p]=c}
    // a row of small trees on the near ridge, warm-rimmed from the sun behind
    const tr=hash(Math.floor(x/9),41);if(tr<0.35){const cx=Math.floor(x/9)*9+4,hh=6+tr*14;const dx=x-cx;for(let y=Math.floor(h2-hh);y<h2;y++){const v=(y-(h2-hh))/hh;if(Math.abs(dx)<=Math.sin(v*Math.PI*0.9+0.2)*4){const p=y*W+x;BG[p]=dx>2?0x8a7a50:0x4a5a44}}}}}
// a few hundred grass blades, near ones big; each sways with the local wind
let BL=null;function blades(){BL=[];K.setSeed(4103);for(let k=0;k<1500;k++){const y=K.rr(HOR+6,H+8),s=0.3+(y-HOR)/(H-HOR)*1.2;BL.push({x:K.rr(-4,W+4),y,h:K.rr(4,11)*s,c:mix(0xa0a850,0x2a441a,K.rnd()*0.7),lit:K.rnd()<0.3,ph:K.rnd()*6})}BL.sort((a,b)=>a.y-b.y)}
function seedsFor(n){const out=[];for(let k=0;k<n;k++){const z=1-2*(k+0.5)/n,r=Math.sqrt(1-z*z),a=k*2.39996;out.push({dx:Math.cos(a)*r,dy:Math.sin(a)*r,dz:z,thr:0.7+K.rnd()*2.2,on:1})}return out}
function plant(g,x,y,age){const s=0.45+(y-HOR)/(H-HOR)*0.75;const p={x,y,s,age,Hh:(42+K.rnd()*26)*s,bend:0,bv:0,seeds:seedsFor(Math.round(64*s+20)),leaves:[],dead:0};
  const nl=K.ri(4,6);for(let i=0;i<nl;i++)p.leaves.push({a:(i/nl)*Math.PI*2+K.rr(-0.3,0.3),L:K.rr(10,17)*s});g.P.push(p);g.P.sort((a,b)=>a.y-b.y);return p}
function init(g){if(!built)build();if(!BL)blades();K.setSeed(4104);g.P=[];g.F=[];g.land=[];g.wx=new Float32Array(GW*GH);g.wy=new Float32Array(GW*GH);g.press=null;g.blown=0;
  const spots=[[96,206,800],[150,236,800],[214,190,800],[262,226,800],[318,200,420],[360,244,800],[420,212,800],[54,240,800],[180,172,800],[452,182,260]];for(const [x,y,a] of spots)plant(g,x,y,a)}
function wind(g,x,y){const fx=clamp(x/CS-0.5,0,GW-1.001),fy=clamp(y/CS-0.5,0,GH-1.001);const i=fx|0,j=fy|0,u=fx-i,v=fy-j;const q=j*GW+i;
  const a=(A)=>lerp(lerp(A[q],A[q+1],u),lerp(A[q+GW],A[q+GW+1],u),v);return[a(g.wx),a(g.wy)]}
function push(g,x,y,vx,vy,rad){const r=rad/CS;const ci=x/CS-0.5,cj=y/CS-0.5;for(let j=Math.max(0,Math.floor(cj-r));j<=Math.min(GH-1,Math.ceil(cj+r));j++)for(let i=Math.max(0,Math.floor(ci-r));i<=Math.min(GW-1,Math.ceil(ci+r));i++){const d=Math.hypot(i-ci,j-cj)/r;if(d>1)continue;const k=(1-d)*(1-d);const q=j*GW+i;
  if(vx===null){const ox=i-ci,oy=j-cj,L=Math.hypot(ox,oy)||1;g.wx[q]+=ox/L*vy*k;g.wy[q]+=oy/L*vy*k}else{g.wx[q]+=vx*k;g.wy[q]+=vy*k}}}
function headPos(p){const st=stem(p);return[p.x+p.bend,p.y-st]}
function stem(p){const a=p.age;return a<120?0:a<300?p.Hh*(a-120)/180:p.Hh}
function tick(g,pad){const T=MT(g,pad.mouse);const t=g.t;
  // finger: dragging pushes air along the stroke, holding still is a breath out from that point, a tap is a puff
  if(T.click)g.press={x:T.x,y:T.y,t:0,mv:0};
  if(g.press&&T.down){const P=g.press;P.t++;P.mv=Math.max(P.mv,Math.hypot(T.x-P.x,T.y-P.y));const sp=Math.hypot(T.vx,T.vy);
    if(sp>0.6)push(g,T.x,T.y,T.vx*0.5,T.vy*0.5,40);else if(P.t>14){push(g,T.x,T.y,null,0.45,46);g.breath=Math.min(1,(g.breath||0)+0.05)}}
  else g.breath=Math.max(0,(g.breath||0)-0.05);
  if(T.up&&g.press){if(g.press.mv<6&&g.press.t<16)push(g,T.x,T.y,null,3.2,50);g.press=null}
  // air relaxes and smears a little
  const wx=g.wx,wy=g.wy;for(let j=0;j<GH;j++)for(let i=0;i<GW;i++){const q=j*GW+i;const l=i>0?q-1:q,r=i<GW-1?q+1:q,u=j>0?q-GW:q,d=j<GH-1?q+GW:q;
    wx[q]=(wx[q]*0.6+(wx[l]+wx[r]+wx[u]+wx[d])*0.1)*0.955;wy[q]=(wy[q]*0.6+(wy[l]+wy[r]+wy[u]+wy[d])*0.1)*0.955}
  const amb=0.08+0.3*Math.sin(t*0.006)+0.12*Math.sin(t*0.037);g.amb=amb;
  // plants grow, bend, lose seeds to strong air
  for(const p of g.P){p.age+=p.age<800?(g.fast?3:1.4):1;const [hx,hy]=headPos(p);const [ax,ay]=wind(g,hx,hy);const f=ax+amb*0.4;
    p.bv+=(f*7*p.s-p.bend)*0.08;p.bv*=0.86;p.bend+=p.bv;
    if(p.age>=700){const m=Math.hypot(ax,ay)+amb*0.3;for(const sd of p.seeds){if(!sd.on||m<sd.thr)continue;if(K.rnd()>0.35)continue;sd.on=0;g.blown++;const r=11*p.s;
      g.F.push({x:hx+sd.dx*r,y:hy+sd.dy*r,vx:ax*0.6+sd.dx*0.4,vy:ay*0.6+sd.dy*0.3-0.3,s:p.s,sp:K.rr(0,6),gy:Math.min(H-4,p.y+K.rr(-30,60)),age:0})}
      if(p.seeds.every(s=>!s.on))p.dead++}}
  // seeds in the air: they chase the wind, flutter and sink; landing on the meadow they may take root
  for(let k=g.F.length-1;k>=0;k--){const s=g.F[k];s.age++;const [ax,ay]=wind(g,s.x,s.y);const tx=ax*1.4+amb*0.9+Math.sin(s.age*0.05+s.sp)*0.25,ty=ay*1.4+0.22*s.s+Math.cos(s.age*0.07+s.sp)*0.12;
    s.vx+=(tx-s.vx)*0.05;s.vy+=(ty-s.vy)*0.05;s.x+=s.vx;s.y+=s.vy;
    if(s.y>=s.gy&&s.vy>0&&s.age>40){g.F.splice(k,1);if(s.x>4&&s.x<W-4){g.land.push({x:s.x,y:s.y,t:0});const room=g.P.length<17&&!g.P.some(p=>Math.hypot(p.x-s.x,(p.y-s.y)*2)<26)&&s.y>HOR+20;if(room&&K.rnd()<0.22)plant(g,s.x,s.y,0)}}
    else if(s.x<-30||s.x>W+30||s.y<-40)g.F.splice(k,1)}
  for(let k=g.land.length-1;k>=0;k--)if(++g.land[k].t>400)g.land.splice(k,1);
  // bald heads wither away once there are enough plants
  for(let k=g.P.length-1;k>=0;k--){const p=g.P[k];if(p.dead>300&&g.P.length>8)g.P.splice(k,1)}
  if(K.SND.ctx){let m=0;for(let q=0;q<GW*GH;q++)m+=Math.abs(wx[q])+Math.abs(wy[q]);K.bed('dwind','bandpass',600,0.6);K.bedSet('dwind',Math.min(0.08,0.012+m*0.0006),400+Math.min(1200,m*6))}
  if(K.live()&&g.blown>g.lastB+6){g.lastB=g.blown;const t0=K.now();K.tone('sine',1568+K.rnd()*800,1500,0.5,0.012,t0,0.02)}if(g.lastB===undefined||g.lastB>g.blown)g.lastB=g.blown}
function leaf(p,lf,sway){// a toothed dandelion leaf lying in the grass, flattened by perspective
  const ca=Math.cos(lf.a),sa=Math.sin(lf.a)*0.35;const L=lf.L*Math.min(1,p.age/120+0.15);for(let i=0;i<L;i++){const t=i/L;const w=Math.sin(Math.PI*Math.pow(t,0.7))*2.6*p.s+((t*7)%1<0.45&&t>0.2?1.2*p.s:0);
    const cx=p.x+ca*i+sway*t*t,cy=p.y+sa*i-t*2*p.s;for(let k=-Math.ceil(w);k<=Math.ceil(w);k++){if(Math.abs(k)>w)continue;const x=Math.round(cx-sa*k*2),y=Math.round(cy+ca*k*0.35);K.px(x,y,k===0?0x6a9a3a:k<0?0x4a7a2a:0x2e5a1c,0)}}}
function draw(g){const t=g.t;col.set(BG);em.fill(0);const amb=g.amb||0.3;
  // sun disc and its bloom
  K.glow(SUNX,SUNY,28,0xfff0c0,0.35);for(let y=-5;y<=5;y++)for(let x=-5;x<=5;x++)if(x*x+y*y<=25){K.px(SUNX+x,SUNY+y,0xfffbe8,255)}
  // blades and plants interleaved by depth
  let bi=0;const drawBlades=(ylim)=>{for(;bi<BL.length&&BL[bi].y<ylim;bi++){const b=BL[bi];const [ax]=wind(g,b.x,b.y-b.h);const sw=(ax*3+amb*1.6+Math.sin(t*0.05+b.ph)*0.6)*b.h/8;const n=Math.ceil(b.h);
    for(let k=0;k<n;k++){const u=k/n;const x=Math.round(b.x+sw*u*u),y=Math.round(b.y-k);if(y<0||y>=H||x<0||x>=W)continue;col[y*W+x]=u>0.55&&(b.lit||Math.abs(b.x-SUNX)<90)?mix(b.c,0xf8d880,b.lit?0.6:0.35):u<0.25?mul(b.c,0.8):b.c}}};
  for(const p of g.P){drawBlades(p.y);drawPlant(g,p,t)}drawBlades(H+20);
  // fallen seeds resting on the grass
  for(const l of g.land){const a=Math.max(0,1-l.t/400);K.pxa(l.x,l.y,0xf8f4e8,0.6*a);K.pxa(l.x,l.y+1,0x6a4a2a,0.6*a)}
  // seeds in flight: a white parachute over a brown seed; lit gold when they cross the sun
  for(const s of g.F){const x=Math.round(s.x),y=Math.round(s.y);const near=Math.exp(-Math.hypot(s.x-SUNX,s.y-SUNY)/70);const c=mix(0xf4f0e8,0xfff0b0,near);const e=Math.round(80+near*170);
    K.px(x,y,c,e);if(s.s>0.75){K.px(x-1,y,mix(c,col[y*W+x-1]||0,0.4),e>>1);K.px(x+1,y,mix(c,col[y*W+x+1]||0,0.4),e>>1)}
    const tilt=Math.round(clamp(-s.vx*1.5,-1,1));K.px(x+tilt,y+1,0xd8d0c0,0);if(s.s>0.6)K.px(x+tilt,y+2,0x7a5a3a,0)}
  if(g.breath>0.05){const T=g._mt;for(let k=0;k<14;k++){const a=k/14*6.28+t*0.02,r=8+((t*1.5+k*13)%40);K.pxa(T.x+Math.cos(a)*r,T.y+Math.sin(a)*r*0.8,0xffffff,0.12*g.breath*(1-r/48))}}}
function drawPlant(g,p,t){const a=p.age;const sway=p.bend*0.3;for(const lf of p.leaves)leaf(p,lf,sway);if(a<120)return;
  const st=stem(p);const [hx,hy]=[p.x+p.bend,p.y-st];
  // stem: a soft curve from the rosette to the head, catching a thread of light on the sun side
  const n=Math.max(2,Math.ceil(st));for(let k=0;k<=n;k++){const u=k/n;const x=Math.round(p.x+p.bend*u*u),y=Math.round(p.y-st*u);K.px(x,y,0x5a8a34,0);if(p.s>0.8)K.px(x+1,y,0x8ab04a,0)}
  const s=p.s;
  if(a<300){// a closed green bud nodding on the rising stem
    for(let y=-3;y<=2;y++)for(let x=-2;x<=2;x++)if(x*x/4+y*y/9<=1)K.px(hx+x,hy+y-2*s,y<-1?0xd8c040:0x5a8a34,0);return}
  if(a<600){// the yellow flower: rays open, then fold back into a bud
    const o=a<340?(a-300)/40:a<520?1:Math.max(0,1-(a-520)/60);const R=Math.max(2,7*s*o);
    if(o<0.05){for(let y=-4;y<=2;y++)for(let x=-2;x<=2;x++)if(x*x/4+y*y/12<=1)K.px(hx+x,hy+y-2,0x5a8a34,0);return}
    for(let k=0;k<44;k++){const an=k/44*Math.PI*2+hash(k,3)*0.1;const L=R*(0.75+hash(k,p.x|0)*0.3);for(let r=1;r<=L;r++){const x=Math.round(hx+Math.cos(an)*r),y=Math.round(hy+Math.sin(an)*r*0.8);K.px(x,y,r>L-1?0xfff070:mix(0xe89a10,0xffd830,r/L),Math.round(50*o))}}
    for(let y=-2;y<=2;y++)for(let x=-2;x<=2;x++)if(x*x+y*y<=4)K.px(hx+x,hy+y,0xd88a10,30);return}
  // the clock: seeds spread out on fine stalks, back ones dim, sun-side ones glowing
  const open=Math.min(1,(a-600)/100),r=11*s*open;const lx=(SUNX-hx)/300;
  const order=p.seeds.slice().sort((A,B)=>A.dz-B.dz);
  for(const sd of order){if(!sd.on)continue;const ex=hx+sd.dx*r,ey=hy+sd.dy*r;const front=sd.dz>0;const back=(1-sd.dz)/2;
    const L=Math.max(1,Math.round(r*Math.hypot(sd.dx,sd.dy)));for(let k=1;k<L;k+=1){const u=k/L;K.pxa(hx+sd.dx*r*u,hy+sd.dy*r*u,0xe8e0d0,front?0.22:0.1)}
    const rim=clamp(sd.dx*lx*6+(1-Math.abs(sd.dz))*0.4,0,1);const c=mix(mix(0xb8b4a8,0xfaf6ee,front?1:0.4),0xfff0c0,rim*0.7);K.px(Math.round(ex),Math.round(ey),c,Math.round((front?70:20)+rim*120));
    if(front&&s>0.7){K.pxa(ex+1,ey,c,0.35);K.pxa(ex,ey-1,c,0.25)}}
  K.px(hx,hy,0x8a7a4a,0);K.px(hx+1,hy,0x6a5a3a,0);if(p.dead)K.px(hx,hy-1,0x9a8a5a,0)}
function ai(g){return AIQ(g,(g,A)=>{const r=K.rnd();const ready=g.P.filter(p=>p.age>=700&&p.seeds.some(s=>s.on));
  if(r<0.5&&ready.length){const p=ready[K.ri(0,ready.length-1)];const [hx,hy]=headPos(p);const d=K.rnd()<0.5?1:-1;aiStroke(A,[[hx-50*d,hy+10],[hx-10*d,hy+2],[hx+40*d,hy-12],[hx+90*d,hy-30]],K.rr(4,7));A.q.push([A.x,A.y,false,K.ri(120,220)])}
  else if(r<0.75&&ready.length){const p=ready[K.ri(0,ready.length-1)];const [hx,hy]=headPos(p);A.q.push([hx-26,hy+8,false,40],[hx-26,hy+8,true,K.ri(50,90)],[hx-26,hy+8,false,K.ri(120,200)])}
  else if(r<0.88){const x=K.rr(60,420),y=K.rr(150,240);A.q.push([x,y,false,40],[x,y,true,3],[x,y,false,K.ri(100,160)])}
  else A.q.push([K.rr(100,380),K.rr(60,120),false,K.ri(120,200)])})}
function info(g){const c=g.P.filter(p=>p.age>=700&&p.seeds.some(s=>s.on)).length;return'蒲公英 · '+g.F.length+' 颗种子在飞 · '+c+' 个绒球'}
return{init,tick,draw,ai,info};})();
GAMES.push({id:'dandelion',name:'蒲公英',ref:'吹散绒球，看种子落地长出新的一棵',keys:'划过绒球：手指带起的风把种子吹散 · 在绒球旁按住不动：对它吹气 · 点草地：一小阵风 · 落下的种子会生根，长出叶子、开黄花、再变成新的绒球',thumbAt:300,
  init:DANDY.init,tick:DANDY.tick,draw:DANDY.draw,ai:DANDY.ai,info:DANDY.info,
  opts:[{label:'快进生长',set:g=>{g.fast=!g.fast}}],
  about:['傍晚的山坡上，太阳低低地落在后面，一个个白色的蒲公英绒球被逆光照亮。手指划过去，带起的风会把种子扯下来：每一颗都是一顶小降落伞，跟着风飘、打转，慢慢沉进草里；飘过太阳的时候会被染成金色。','在绒球旁边按住不动，就是凑近对它吹气。落地的种子有的会生根：先长出一圈锯齿边的叶子，再抽出花茎、开一朵黄花，花合上以后变成一个新的绒球，又可以吹了。'],
  tags:['手指带起的风吹散种子','每颗种子都是一顶小降落伞','飘过太阳时被染成金色','按住不动就是吹气','落地的种子会长出新的一棵','叶子、黄花、绒球的完整一生']});



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
