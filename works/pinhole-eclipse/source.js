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



// ================= 树影日食: tree-dapple turns into crescents =================
// A plaster wall and a stone path in the shade of a tree. Every gap in the leaves is a pinhole camera, so each round spot
// of light on the wall is really a little picture of the sun. Drag the moon across the sun in the sky strip at the top
// and watch all the spots turn into crescents at once, thin to slivers, and vanish at totality: shadow bands ripple
// over the wall, the diamond ring flashes, the light drops to blue, the corona flares, stars come out and the birds go
// quiet while the crickets start. Drag lower down to shake the branches and make the spots dance.
const ECL=(function(){const {W,H,S,mix,mul,clamp,lerp,hash,fbm,rgb}=K;const col=S.col,em=S.em,N=W*H;
const SKY=60,GND=200;const BG=new Uint32Array(N);let built=false;const SX=404,SY=30,SR=11;
// a leaf: pointed ellipse, 9x5, three tones (0 none,1 dark,2 mid,3 light)
const LEAF=['...1122..','.1122233.','112223333','.1122233.','...1122..'];
function build(){built=true;K.setSeed(8301);
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const p=y*W+x;let c;
    if(y<SKY)c=mix(0x4a8ad0,0xa8d0f0,Math.pow(y/SKY,1.3));
    else if(y<GND){const n=fbm(x*0.06,y*0.06,3,8302),n2=hash(x,y*7);c=mix(0xe6d6b4,0xd2bc94,n*0.7+(y-SKY)/(GND-SKY)*0.25);if(n2>0.93)c=mul(c,0.95);if(n2<0.04)c=mix(c,0xfff4dc,0.3);
      if(y>GND-14){c=mix(0xbca888,0xa89474,(y-GND+14)/14);if(y===GND-14)c=0xf0e2c4;if(y===GND-13)c=0x8a7a60}}
    else{const row=Math.floor((y-GND)/10),off=row%2*15;const lx=(x+off)%30,ly=(y-GND)%10;const e=lx<1||ly<1;const h=hash(Math.floor((x+off)/30),row);
      c=e?0x5a5040:mix(0xb4a688,0x948666,h);if(!e&&(lx===1||ly===1))c=mix(c,0xd8ccb0,0.4);if(!e&&(lx===29||ly===9))c=mul(c,0.85);if(hash(x*3,y*5)>0.95)c=mul(c,0.92)}
    BG[p]=c}
  // a wooden window with dark glass, and a sill with a flower pot
  for(let y=84;y<166;y++)for(let x=58;x<142;x++){const p=y*W+x;const fr=x<63||x>136||y<89||y>160||Math.abs(x-100)<2||Math.abs(y-125)<2;
    let c=fr?(x===58||y===84?0xb08a62:0x7a5a3a):mix(0x1c2a3c,0x34485e,(y-89)/72);if(!fr&&(x-y*0.6)%46<5&&(x-y*0.6)%46>0)c=mix(c,0x6a7e94,0.35);BG[p]=c}
  for(let y=163;y<170;y++)for(let x=54;x<146;x++)BG[y*W+x]=y===163?0xd0b08a:y===164?0xa0805a:0x6a4a30;
  for(let y=148;y<163;y++)for(let x=110;x<126;x++){const w=6+(y-148)*0.12;if(Math.abs(x-118)>w)continue;BG[y*W+x]=y<150?0xc87850:mix(0xb06a40,0x7a4428,(x-112)/14)}
  const pl=[[118,147,0],[112,140,1],[124,138,1],[116,132,0],[121,128,1],[109,134,0]];for(const [x,y,s] of pl)for(let v=0;v<5;v++)for(let u=0;u<9;u++){const ch=LEAF[v][u];if(ch==='.')continue;const X=x+(s?u-4:4-u),Y=y+v-2;BG[Y*W+X]=[0,0x2a4a20,0x3e6a2c,0x5a8a3a][+ch]}}
function init(g){if(!built)build();K.setSeed(8303);g.e=0;g.gaps=[];let tries=0;
  while(g.gaps.length<210&&tries<20000){tries++;const x=K.rr(-10,W+10),y=K.rr(SKY+2,H+6);if(fbm(x*0.012,y*0.02,3,8304)<0.5&&K.rnd()>0.15)continue;g.gaps.push({x,y,r:K.rr(3.6,5.6),ph:K.rnd()*6,amp:K.rr(1.5,4.5),b:K.rr(0.7,1)})}
  // near sprays of leaves whose shadows lie crisp on the top of the wall
  g.spr=[];for(const [x0,y0,n] of [[150,SKY,9],[300,SKY,7],[468,SKY+6,8],[20,SKY+10,8]]){const lv=[];let x=x0,y=y0,a=1.4+K.rr(-0.5,0.5);for(let k=0;k<n;k++){x+=Math.cos(a)*7;y+=Math.sin(a)*6;a+=K.rr(-0.5,0.5);lv.push({x:x+K.rr(-8,8),y:y+K.rr(-4,4),a:K.rr(0,6.28),s:K.rr(1,1.6),ph:K.rnd()*6})}g.spr.push({x0,y0,lv})}
  // the branch above the strip, upper left
  g.br=[];for(let k=0;k<46;k++){const u=K.rnd();g.br.push({x:-6+u*150+K.rr(-10,10),y:4+u*u*30+K.rr(-8,10),f:K.rnd()>0.5?1:0,ph:K.rnd()*6,tn:K.rnd()})}
  g.wind=0;g.press=null;g.birds=1;g.flash=0;g.cr=0}
function tick(g,pad){const T=MT(g,pad.mouse);
  if(T.click)g.press={t:0,mv:0,x:T.x,y:T.y,top:T.y<SKY+6,e0:g.e};
  if(g.press&&T.down){const P=g.press;P.t++;P.mv=Math.max(P.mv,Math.hypot(T.x-P.x,T.y-P.y));if(P.top){g.e=clamp(P.e0-(T.x-P.x)/170,0,1);g.auto2=0}else if(P.mv>4)g.wind=Math.min(3,g.wind+Math.abs(T.vx)*0.05+Math.abs(T.vy)*0.03)}
  if(T.up&&g.press){if(!g.press.top&&g.press.mv<6&&g.press.t<14){g.wind=Math.min(3,g.wind+1.5);if(K.live())K.noise(0.9,0.05,K.now(),'bandpass',1800,900,0.5,0.1)}g.press=null}
  if(g.auto2){g.e=clamp(g.e+0.0016*g.auto2,0,1);if(g.e>=1&&g.auto2>0){g.hold2=(g.hold2||0)+1;if(g.hold2>320){g.auto2=-1;g.hold2=0}}if(g.e<=0&&g.auto2<0)g.auto2=0}
  const L=uncovered(g.e);
  // the diamond ring flashes as the last bead of sun goes or comes back
  const ring=L>0&&L<0.02;if(ring&&!g.wasRing&&K.live()){K.tone('sine',1760,1760,1.2,0.03,K.now(),0.02);K.tone('sine',2637,2637,1.4,0.02,K.now(),0.04)}g.wasRing=ring;
  g.wind*=0.985;g.birds=lerp(g.birds,L>0.2?1:0,0.02);g.cr=lerp(g.cr,L<0.06?1:0,0.01);
  if(K.SND.ctx){K.bed('eleaf','bandpass',2200,0.5);K.bedSet('eleaf',0.008+g.wind*0.015,2000);K.bed('ebird','bandpass',3800,9);K.bedSet('ebird',0.014*g.birds*Math.max(0,Math.sin(g.t*0.3)*Math.sin(g.t*0.07)),3800+Math.sin(g.t*0.9)*400);
    K.bed('ecri','bandpass',4600,30);K.bedSet('ecri',0.03*g.cr*(Math.sin(g.t*0.9)>0.2?1:0.1),4600)}}
// how far the moon's centre sits from the sun's, and the fraction of the sun left showing
function moonOff(e){return(1-e)*SR*2.3}
function uncovered(e){const d=moonOff(e),r=SR,R=SR*1.05;if(d>=r+R)return 1;if(d<=R-r)return 0;const a=(d*d+r*r-R*R)/(2*d*r),b=(d*d+R*R-r*r)/(2*d*R);const ov=r*r*Math.acos(clamp(a,-1,1))+R*R*Math.acos(clamp(b,-1,1))-0.5*Math.sqrt(Math.max(0,(-d+r+R)*(d+r-R)*(d-r+R)*(d+r+R)));return 1-ov/(Math.PI*r*r)}
function draw(g){const t=g.t;const L=uncovered(g.e);em.fill(0);const sw=g.wind;
  if(!g.lt||g.lt.length!==N)g.lt=new Float32Array(N);const lt=g.lt;lt.fill(0);
  // light level: drops slowly, then plunges in the last few percent, and turns blue
  const lv=0.22+0.78*Math.pow(L,0.45);const blue=1-Math.pow(L,0.25);
  const mo=moonOff(g.e);
  // 1. each gap in the leaves paints an inverted picture of the sun: a disc with the moon's bite on the opposite side
  for(const gp of g.gaps){const wob=Math.sin(t*0.08+gp.ph)*gp.amp*sw+Math.sin(t*0.017+gp.ph)*1.1;const cx=gp.x+wob,cy=gp.y+wob*0.35;const onG=cy>GND;const r=gp.r,sy=onG?0.5:1;const mx=-mo/SR*r;
    const y0=Math.floor(cy-r*sy-1),y1=Math.ceil(cy+r*sy+1),x0=Math.floor(cx-r-1),x1=Math.ceil(cx+r+1);
    for(let Y=Math.max(SKY,y0);Y<=Math.min(H-1,y1);Y++)for(let X=Math.max(0,x0);X<=Math.min(W-1,x1);X++){if(onG!==(Y>GND))continue;const x=X-cx,y=(Y-cy)/sy;
      // soft edged disc minus soft edged moon (the penumbra of a real pinhole)
      const a=clamp(r+0.45-Math.hypot(x,y),0,0.9)/0.9;if(a<=0)continue;const m=clamp(Math.hypot(x-mx,y)-r*1.05+0.45,0,0.9)/0.9;const v=a*m*gp.b;const p=Y*W+X;if(v>lt[p])lt[p]=v}}
  // 2. near leaves block the light crisply
  const sh=new Uint8Array(0);
  for(const s of g.spr){for(const lf of s.lv){const a=lf.a+Math.sin(t*0.07+lf.ph)*0.35*sw;const ox=Math.sin(t*0.06+lf.ph)*sw*3;const ca=Math.cos(a),sa=Math.sin(a),sc=lf.s*1.4;
      for(let Y=-9;Y<=9;Y++)for(let X=-9;X<=9;X++){const u=(X*ca+Y*sa)/sc,v=(-X*sa+Y*ca)/sc;if(u<-4.5||u>4.5)continue;const w=2.4*(1-(u/4.6)**2);if(Math.abs(v)>w)continue;const px=Math.round(lf.x+ox+X),py=Math.round(lf.y+Y);if(px<0||px>=W||py<SKY||py>=GND)continue;const p=py*W+px;lt[p]*=0.15;lt[p]-=0.5}}}
  // 3. shadow bands ripple across everything just before and after totality
  const band=L>0.002&&L<0.07?Math.sin((L-0.002)/0.068*Math.PI):0;
  // composite: shade colour, or sunlit colour where spots land
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const p=y*W+x;let c=BG[p];
    if(y<SKY){c=mix(c,0x0a1630,Math.pow(blue,0.8)*0.95);col[p]=c;continue}
    const l=lt[p];let shade=mix(mul(c,0.6),0x4a5a80,0.2);if(l<0)shade=mul(shade,0.82);
    // the shade is lit by the whole sky, so it dims with the sun; a crescent of sun is still the sun, just as bright
    shade=mix(mul(shade,lv),0x141e3e,blue*0.55);let o=shade;
    if(band>0){const b=Math.sin(x*0.09+y*0.35-t*0.5)*Math.sin(x*0.02-t*0.13);o=mul(o,1+b*0.18*band)}
    if(l>0){const sun=mix(c,0xfff0c8,0.3);o=mix(o,mul(sun,1.06),Math.min(1,l*1.5));em[p]=Math.min(255,l*70)}
    col[p]=o}
  // stars at totality
  for(let k=0;k<26;k++){const x=hash(k,1)*W,y=hash(k,2)*(SKY-8);const a=clamp((0.4-L)*2.5,0,1)*(0.5+0.5*Math.sin(t*0.05+k));if(a>0.02)K.pxa(x,y,0xfffaf0,a)}
  // 4. the sun, the moon, the corona and the diamond ring
  const cor=clamp(1-L*12,0,1);if(cor>0){for(let k=0;k<64;k++){const an=k/64*6.283;const len=SR*(1.3+hash(k,5)*1.6+(k%16<2?1.6:0));for(let r=SR;r<len;r+=0.5){const f=1-(r-SR)/(len-SR);K.pxa(SX+Math.cos(an)*r,SY+Math.sin(an)*r*0.9,0xe0ecff,f*0.35*cor)}}K.glow(SX,SY,34,0xb8d0ff,0.3*cor)}
  K.glow(SX,SY,40,0xfff4d0,0.55*Math.pow(L,0.7));
  for(let y=-SR-1;y<=SR+1;y++)for(let x=-SR-1;x<=SR+1;x++){const d=Math.hypot(x,y);if(d>SR+0.5)continue;const inM=Math.hypot(x-mo,y)<=SR*1.05;if(inM){if(cor>0||L<0.999)K.px(SX+x,SY+y,mix(0x2a3a5a,0x05070e,cor),0)}else{K.px(SX+x,SY+y,d>SR-1.5?0xfff0b0:0xfffcf0,255)}}
  if(L>0&&L<0.03){const a=1-L/0.03;const bx=SX+(mo>=0?-SR:SR),by=SY;K.glow(bx,by,16,0xffffff,0.9*a);for(let r=0;r<22*a;r++){K.pxa(bx+r,by,0xffffff,1-r/22);K.pxa(bx-r,by,0xffffff,1-r/22);K.pxa(bx,by+r*0.6,0xffffff,1-r/14);K.pxa(bx,by-r*0.6,0xffffff,1-r/14)}}
  // 5. the branch hanging into the strip, top left, in silhouette against the sky
  const leafCol=[0,mix(0x1e3a1a,0x0a1008,blue),mix(0x2e5426,0x0e160c,blue),mix(0x4a7a30,0x16200e,blue)];
  K.line(-4,2,150,34,mix(0x3a2a1c,0x0a0806,blue));K.line(-4,3,150,35,mix(0x3a2a1c,0x0a0806,blue));K.line(60,16,90,4,mix(0x3a2a1c,0x0a0806,blue));
  for(const b of g.br){const ox=Math.round(Math.sin(t*0.06+b.ph)*sw*1.5+Math.sin(t*0.02+b.ph)*0.6);for(let v=0;v<5;v++)for(let u=0;u<9;u++){const ch=LEAF[v][u];if(ch==='.')continue;const X=Math.round(b.x)+ox+(b.f?u-4:4-u),Y=Math.round(b.y)+v-2;if(X<0||X>=W||Y<0||Y>=SKY)continue;K.px(X,Y,leafCol[+ch],0)}}
  // birds cross the sky until it gets dark
  if(g.birds>0.2)for(let k=0;k<3;k++){const x=((t*0.6+k*170)%(W+60))-30,y=12+k*10+Math.sin(t*0.1+k)*2;const f=Math.sin(t*0.4+k)>0?1:0;const c=0x1a2030;K.pxa(x,y,c,g.birds);K.pxa(x-1,y-f,c,g.birds);K.pxa(x-2,y-f,c,g.birds);K.pxa(x+1,y-f,c,g.birds);K.pxa(x+2,y-f,c,g.birds)}
  K.text('日食 '+Math.round((1-L)*100)+'%',SX-22,SY+3,0xffffff,{size:9,align:'r'});
  if(g.e<0.02&&(t>>5)%2)K.text('← 拖',SX+14,SY+3,0xffffff,{size:9})}
function ai(g){return AIQ(g,(g,A)=>{const r=K.rnd();
  // mostly: push the moon slowly across in several small drags, rest at totality, then pull it back
  if(r<0.7){const dir=g.e<0.98&&!(g.e>0.3&&g.aiBack)?1:-1;if(g.e>=0.98)g.aiBack=1;if(g.e<=0.02)g.aiBack=0;const x0=SX+6,dist=K.rr(18,34)*dir;
    A.q.push([x0,SY,false,30],[x0,SY,true,3]);for(let k=1;k<=40;k++)A.q.push([x0-dist*k/40,SY,true,3,null,'lin']);A.q.push([x0-dist,SY,false,g.e>0.9?K.ri(260,380):K.ri(40,90)])}
  else if(r<0.88){const y=K.rr(110,240);aiStroke(A,[[40,y],[160,y-20],[280,y+20],[440,y-10]],7);A.q.push([A.x,A.y,false,K.ri(80,140)])}
  else{const x=K.rr(100,400),y=K.rr(120,230);A.q.push([x,y,false,40],[x,y,true,3],[x,y,false,K.ri(80,140)])}})}
function info(g){return'树影日食 · 食分 '+Math.round((1-uncovered(g.e))*100)+'%'}
return{init,tick,draw,ai,info};})();
GAMES.push({id:'eclipse',name:'树影日食',ref:'日食那天，树影里的光斑全变成月牙',keys:'在上面天空那条里横着拖：把月亮推过太阳，墙上的光斑全变成月牙 · 在下面拖或点：摇树枝，光斑跟着晃',thumbAt:60,
  init:ECL.init,tick:ECL.tick,draw:ECL.draw,ai:ECL.ai,info:ECL.info,
  opts:[{label:'看一次日全食',set:g=>{g.auto2=1}}],
  about:['树荫里一面灰泥墙和石板路。树叶之间的每个缝都是一个小孔相机，所以墙上一个个圆圆的光斑，其实都是太阳的小像。','在上面天空那条里拖动，把月亮推过太阳：墙上所有光斑会同时变成月牙，越来越细；快到全食时墙上会爬过一道道影带，最后一点太阳变成钻石环一闪，天一下暗成深蓝，日冕亮起，冒出星星，鸟不叫了，蟋蟀开始叫。在下面拖动或点一下是摇树枝，光斑跟着晃。'],
  tags:['每个光斑都是太阳的小像','日食时光斑全变成月牙','全食前的影带','钻石环','日冕和星星','鸟停蟋蟀叫','摇树枝光斑跟着晃']});



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
