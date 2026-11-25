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



// ================= 撞钟: a mountain temple bell that rings in the sunrise =================
// Before dawn on a snowy summit, a bronze bell hangs in an open pavilion above a sea of clouds. Grab the hanging log,
// pull it back and let it go. It swings, the bell booms, and the sound becomes visible: a ring of bent air rolls out
// over the clouds and shoves them apart (the sleeping village shows through the gap), knocks the snow off the pines and
// the eaves, scatters the crows, and comes back faintly off the far peak. Every strike brings the sunrise closer:
// the sky warms, the peaks catch pink and then gold, and the sun lifts out of the clouds.
const BELL=(function(){const {W,H,S,mix,mul,clamp,lerp,hash,fbm,rgb}=K;const col=S.col,em=S.em,N=W*H;
let built=false;
// static layers, lit every frame by the time of dawn: albedo, how much each pixel faces the sun (east, right), how much it faces the sky
const FA=new Uint32Array(N),FF=new Float32Array(N),FT=new Float32Array(N),FM=new Uint8Array(N);// far peaks
const NA=new Uint32Array(N),NF=new Float32Array(N),NT=new Float32Array(N),NM=new Uint8Array(N);// near: cliff, pines, pavilion
const VAL=new Uint32Array(N),VLT=new Uint8Array(N);// valley under the clouds, village light mask
const COPY=new Uint32Array(N);
const BX=150,BT=82,BB=180;// bell centre x, top, bottom
const PV=[221,72],RL=64,LOGH=35;// log pivot (centre between ropes), rope length, half length
const PK=[[382,34,0.92],[300,72,0.85],[452,58,0.8],[246,98,0.7],[94,90,0.75],[24,104,0.8],[180,116,0.6]];
const yP=x=>{let m=1e9;for(const [px,py,s] of PK)m=Math.min(m,py+Math.abs(x-px)*s+(Math.abs(x-px)<6?1:0));return Math.round(m+5*fbm(x*0.04,1,3,71)-3)};
const domPeak=x=>{let m=1e9,b=null;for(const k of PK){const v=k[1]+Math.abs(x-k[0])*k[2];if(v<m){m=v;b=k}}return b};
const CT=x=>x<296?Math.round(204+3*fbm(x*0.05,2,3,72)):Math.round(204+Math.pow(x-296,1.35)*0.5+3*fbm(x*0.05,2,3,72));
function setN(x,y,c,f,t){x|=0;y|=0;if(x<0||y<0||x>=W||y>=H)return;const p=y*W+x;NA[p]=c;NF[p]=f;NT[p]=t;NM[p]=1}
const SNOW=0xe8eef8,SNOWS=0xa8b8d0;
const CLUMPS=[],CROWS=[],PUFF=[],FLAKES=[];
function build(){built=true;K.setSeed(11);
  // far peaks: snow above a ragged snowline, rock in gullies and on steep faces; east faces take the sun
  for(let x=0;x<W;x++){const top=yP(x);const pk=domPeak(x);const east=x>pk[0];
    for(let y=top;y<H;y++){const p=y*W+x;const dd=y-top;const gul=fbm(x*0.09,y*0.03,3,73);const sl=fbm(x*0.03,y*0.05,2,74);
      const snowLine=124+12*sl;const str=fbm(x*0.22,y*0.035,3,80);const rock=y>snowLine+(gul-0.5)*30||(str>0.66&&dd>5&&gul>0.45);
      let c=rock?(str>0.74?0x3c4050:0x50566a):(dd<2?0xf4f8ff:0xdde6f2);let f=east?0.85:0.12;f+=(gul-0.5)*0.4;if(rock)f*=0.7;
      const ridge=Math.abs(x-pk[0])<2&&dd<30;if(ridge)f=0.5;
      FA[p]=c;FF[p]=clamp(f,0,1);FT[p]=(rock?0.35:0.9)*(east?1:0.62);FM[p]=1}}
  // valley under the clouds: dark forest folds, a river, a village with lit windows
  for(let y=140;y<H;y++)for(let x=0;x<W;x++){const p=y*W+x;const n=fbm(x*0.02,y*0.05,3,75);let c=mix(0x0a1018,0x141c24,n);const rv=Math.abs(y-200-14*Math.sin(x*0.02))<2;if(rv)c=0x1a2a3a;VAL[p]=c}
  K.setSeed(12);for(let i=0;i<70;i++){const x=K.ri(300,470),y=K.ri(178,236);VLT[y*W+x]=1;if(K.rnd()<0.4)VLT[y*W+x+1]=1;VAL[(y+1)*W+x]=0x2a2018}
  for(let i=0;i<40;i++){const x=K.ri(20,280),y=K.ri(214,262);VLT[y*W+x]=1}
  // the cliff the pavilion stands on
  for(let x=0;x<W;x++){const top=CT(x);for(let y=top;y<H;y++){const dd=y-top;const n=fbm(x*0.06,y*0.06,3,76);const face=x>290?0.75:0.35;
    // stepped ledges: each one carries a line of snow, the rock below it darkens into the next step
    const lv=(dd+4*fbm(x*0.04,3,2,81))/15;const fr=lv-Math.floor(lv);const sn2=dd>8&&fr<0.12&&fbm(x*0.08,Math.floor(lv),2,82)>0.38;
    if(dd<4-(n>0.6?1:0)||sn2)setN(x,y,dd===0||fr<0.04?0xffffff:SNOW,0.6,1);else{const lb=clamp(Math.floor((1-fr)*4+(n-0.5)*1.5),0,4);setN(x,y,[0x2a2a34,0x34343e,0x3e3e4a,0x4a4a56,0x56566a][lb],face+(n-0.5)*0.3,0.25+(1-fr)*0.3)}}}
  // stone platform
  for(let y=196;y<206;y++)for(let x=54;x<248;x++){const blk=((x+(y>200?6:0))%14===0)||y===200;setN(x,y,y===196?SNOW:blk?0x3a3a42:0x5a5a62,0.4,y===196?1:0.4)}
  // posts and beams (vermilion lacquer, weathered)
  const red=[0x4a140e,0x6a1e14,0x8a2a1a,0xa83a22];
  for(const px0 of [64,230])for(let y=64;y<196;y++)for(let i=0;i<7;i++){const t=i<2?3:i<4?2:i<6?1:0;setN(px0+i,y,red[t],i<3?0.2:0.7,0.3)}
  for(let y=66;y<76;y++)for(let x=50;x<252;x++){setN(x,y,y===66?red[3]:y>73?red[0]:red[2],0.5,y===66?0.8:0.3)}
  for(let y=92;y<96;y++)for(let x=64;x<237;x++)setN(x,y,y===92?red[3]:red[1],0.5,0.3);
  // bracket blocks
  for(const bx of [56,96,136,176,216,240])for(let y=58;y<66;y++)for(let x=bx;x<bx+8;x++)setN(x,y,y<60?0x6a5a3a:0x3a2a1a,0.5,0.4);
  // roof: tiles in a curve with upturned eaves, snow on top, icicles along the eave
  for(let x=24;x<278;x++){const u=(x-151)/127;const au=Math.abs(u);const ridge=24;const eave=56-Math.pow(au,6)*12;const top=Math.round(ridge+Math.pow(au,1.6)*24-Math.pow(au,8)*10);
    for(let y=top;y<=Math.round(eave);y++){const tile=(x%5===0);const dd=y-top;let c=tile?0x14181e:0x232a32;if(dd<5-Math.round(2*fbm(x*0.1,0,2,77)))c=dd<1?0xffffff:SNOW;setN(x,y,c,u>0?0.7:0.25,dd<5?1:0.4)}
    for(let y=Math.round(eave)+1;y<=Math.round(eave)+3;y++)setN(x,y,0x3a2414,0.3,0.1);
    if(hash(x,3)<0.18){const l=1+Math.floor(hash(x,4)*5);for(let k=1;k<=l;k++)setN(x,Math.round(eave)+3+k,0xc8dcf0,0.6,0.5)}}
  for(let x=104;x<198;x++)for(let y=18;y<24;y++)setN(x,y,y<20?SNOW:0x1a1e24,0.5,y<20?1:0.3);// ridge
  // pines: tiers of needles, snow lying on each tier
  const pine=(cx,base,hgt,tiers)=>{for(let y=base-hgt;y<base;y++)for(let i=-1;i<=1;i++)setN(cx+i,y,0x2a1a12,i>0?0.7:0.2,0.2);
    for(let k=0;k<tiers;k++){const ty=base-hgt+k*(hgt/tiers)+4,w=6+k*4.5;for(let j=0;j<9;j++){const hw=w*(j/9);for(let i=-hw;i<=hw;i++){const x=Math.round(cx+i+Math.sin(k*1.7)*2),y=Math.round(ty+j);const n=fbm(x*0.3,y*0.3,2,78);if(Math.abs(i)>hw-1.5&&n<0.4)continue;
        const sn=j<2+(n>0.55?1:0)&&Math.abs(i)<hw-1;setN(x,y,sn?(i>0?SNOW:0xd0dcec):n>0.6?0x1a3028:0x10221c,i>0?0.75:0.2,sn?1:0.3)}}
      CLUMPS.push({x:cx+Math.sin(k*1.7)*2-w*0.6,y:ty+1,w:Math.round(w*0.5),on:1,t:0},{x:cx+Math.sin(k*1.7)*2+w*0.35,y:ty+1,w:Math.round(w*0.45),on:1,t:0})}};
  pine(318,CT(318)+2,92,6);pine(14,CT(14)+2,110,7);pine(352,CT(352)+4,60,4);
  for(let k=0;k<7;k++)CLUMPS.push({x:40+k*34,y:52-Math.pow(Math.abs((40+k*34-151)/127),6)*12,w:10,on:1,t:0,roof:1});
  // crows on the big pine
  for(let k=0;k<9;k++)CROWS.push({hx:306+k*3+(k%2)*2,hy:CT(318)+2-92+4+Math.floor(k/3)*14,x:0,y:0,fly:0,vx:0,vy:0,ph:K.rnd()*6});
  // cloud sea: overlapping puffs in rows, back to front
  K.setSeed(13);for(let row=0;row<8;row++){const y0=150+row*13;for(let x=-30;x<W+30;x+=K.rr(20,30)+row*2)PUFF.push({bx:x+K.rr(-6,6),by:y0+K.rr(-3,3),r:K.rr(14,22)+row*2.2,dx:0,dy:0,vx:0,vy:0,ph:K.rnd()*6})}
  PUFF.sort((a,b)=>a.by-b.by);
  for(let i=0;i<120;i++)FLAKES.push({x:K.rr(0,W),y:K.rr(0,H),v:K.rr(0.2,0.6),ph:K.rnd()*6})}
// ---------------- sound: an inharmonic bronze bell with a long hum, echoed by the mountain ----------------
let AU=null;
function audio(){if(AU||!K.SND.ctx)return AU;const C=K.SND.ctx;AU={};const conv=C.createConvolver();const len=C.sampleRate*5,ir=C.createBuffer(2,len,C.sampleRate);
  for(let ch=0;ch<2;ch++){const d=ir.getChannelData(ch);for(let i=0;i<len;i++){const t=i/C.sampleRate;d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2.5)*0.5*(1+1.5*Math.exp(-((t-1.1)**2)/0.004)+0.9*Math.exp(-((t-2.3)**2)/0.006))}}
  conv.buffer=ir;const wet=C.createGain();wet.gain.value=0.5;conv.connect(wet);wet.connect(K.SND.master);const dry=C.createGain();dry.gain.value=0.8;dry.connect(K.SND.master);dry.connect(conv);AU.out=dry;return AU}
const PART=[[0.5,0.9,14],[0.502,0.5,14],[1,1,9],[1.004,0.6,9],[1.183,0.55,6],[1.506,0.4,4.5],[2.0,0.32,3.5],[2.514,0.22,2.6],[2.662,0.2,2.2],[3.011,0.14,1.8],[4.166,0.08,1.2]];
function bong(s){if(!K.live())return;const A=audio();if(!A)return;const C=K.SND.ctx,t=C.currentTime,f=98;const v=clamp(s,0.08,1.4);
  for(const [r,a,d] of PART){const o=C.createOscillator(),g=C.createGain();o.type='sine';o.frequency.value=f*r;g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(a*0.09*v,t+0.008);g.gain.exponentialRampToValueAtTime(0.0001,t+d*(0.6+v*0.4));o.connect(g);g.connect(A.out);o.start(t);o.stop(t+d+0.1)}
  K.noise(0.12,0.2*v,t,'lowpass',500,80,0.8)}
function tap(){if(!K.live())return;const A=audio();if(!A)return;const C=K.SND.ctx,t=C.currentTime;for(const [r,a,d] of PART.slice(2,8)){const o=C.createOscillator(),g=C.createGain();o.frequency.value=98*r*2;g.gain.setValueAtTime(a*0.025,t);g.gain.exponentialRampToValueAtTime(0.0001,t+d*0.3);o.connect(g);g.connect(A.out);o.start(t);o.stop(t+d*0.3+0.05)}}
// ---------------- state ----------------
function init(g){if(!built)build();g.th=0;g.om=0;g.grab=false;g.rings=[];g.dawn=g.dawnKeep||0;g.dawnT=g.dawn;g.n=0;g.sway=0;g.swv=0;g.glow=0;g.fall=[];g.puffs=[];g.hum=0;
  for(const c of CLUMPS){c.on=1;c.t=0}for(const c of CROWS){c.fly=0;c.x=c.hx;c.y=c.hy}for(const p of PUFF){p.dx=p.dy=p.vx=p.vy=0}
  g.ai={q:[],k:0,x:300,y:120,down:false,sx:0,sy:0}}
function logPos(th){return[PV[0]+Math.sin(th)*RL,PV[1]+Math.cos(th)*RL]}
function bellHalf(y){// bell profile: half width at a row
  const u=(y-BT)/(BB-BT);if(u<0||u>1)return 0;if(u<0.1)return 0;if(u<0.18)return 18+Math.sqrt((u-0.1)/0.08)*10;if(u<0.88)return 28+(u-0.18)*3.2;return 30.5+(u<0.94?0.8:0)}
function strike(g,s){g.n++;g.glow=1;g.swv+=s*0.006;g.hum=1;g.rings.push({x:BX+30,y:132,r:6,a:clamp(s,0.15,1.3),t:0,echo:0});
  g.dawnT=Math.min(1,g.dawnT+0.04+s*0.07);bong(s);if(s>0.45)S.flash=0.08*s;
  if(s>0.35)for(const c of CROWS)if(!c.fly){c.fly=1;c.vx=-K.rr(1.4,2.6);c.vy=-K.rr(1,2);c.t=0}
  // the beam shakes snow loose
  for(let k=0;k<Math.round(s*20);k++)g.fall.push({x:K.rr(40,262),y:K.rr(54,62),vx:K.rr(-0.2,0.2),vy:K.rr(0,0.5),t:0,life:K.ri(60,120)})}
function tick(g,pad){const m=pad.mouse;const [lx,ly]=logPos(g.th);
  if(m){if(m.click){if(Math.abs(m.y-ly)<12&&m.x>lx-LOGH-6&&m.x<lx+LOGH+6){g.grab=true;g.gx=m.x-lx}else if(Math.abs(m.x-BX)<34&&m.y>BT+10&&m.y<BB){strike(g,0.12);tap()}}
    if(!m.down&&g.grab){g.grab=false}
    if(g.grab){const tx=clamp((m.x-PV[0]-(g.gx||0))/RL,-0.06,0.82);const th=Math.asin(tx);g.om=th-g.th;g.th=th}}
  else g.grab=false;
  if(!g.grab){g.om+=-0.0062*Math.sin(g.th);g.om*=0.996;const pth=g.th;g.th+=g.om;
    const hit=-Math.asin(4/RL);if(g.th<hit&&g.om<0){const s=clamp(-g.om/0.058,0,1.4);g.th=hit;g.om=-g.om*0.22;if(s>0.04)strike(g,s)}}
  // the bell swings a little and settles
  g.swv+=-0.004*g.sway;g.swv*=0.985;g.sway+=g.swv;g.glow*=0.94;g.hum*=0.992;
  g.dawn=lerp(g.dawn,g.dawnT,0.01);
  // sound rings: grow, push clouds, knock snow, echo off the peak
  for(let k=g.rings.length-1;k>=0;k--){const r=g.rings[k];r.t++;r.r+=3.4;const a=r.a*Math.max(0,1-r.t/150);
    for(const p of PUFF){const x=p.bx+p.dx,y=p.by+p.dy;const d=Math.hypot(x-r.x,(y-r.y)*1.3);if(Math.abs(d-r.r)<4){const f=a*1.6*Math.max(0,1-d/360);p.vx+=(x-r.x)/d*f;p.vy+=(y-r.y)/d*f*0.35}}
    for(const c of CLUMPS){if(!c.on)continue;const d=Math.hypot(c.x-r.x,c.y-r.y);if(Math.abs(d-r.r)<4&&K.rnd()<a*0.85){c.on=0;c.t=0;for(let j=0;j<c.w*2;j++)g.fall.push({x:c.x+K.rr(-c.w/2,c.w/2),y:c.y+K.rr(-1,1),vx:K.rr(-0.3,0.3),vy:K.rr(-0.2,0.4),t:0,life:K.ri(60,140)})}}
    if(!r.echo&&r.r>Math.hypot(382-r.x,60-r.y)){r.echo=1;g.rings.push({x:382,y:70,r:4,a:r.a*0.3,t:0,echo:1})}
    if(r.t>150)g.rings.splice(k,1)}
  for(const p of PUFF){p.vx+=-p.dx*0.0012;p.vy+=-p.dy*0.003;p.vx*=0.96;p.vy*=0.96;p.dx+=p.vx;p.dy+=p.vy}
  for(const c of CLUMPS){if(!c.on){c.t++;if(c.t>1500)c.on=1}}
  for(let k=g.fall.length-1;k>=0;k--){const f=g.fall[k];f.t++;f.vy+=0.04;f.vx*=0.98;f.x+=f.vx+Math.sin(f.t*0.1)*0.1;f.y+=f.vy;if(f.t>f.life)g.fall.splice(k,1)}
  for(const c of CROWS){if(c.fly===1){c.t++;c.x+=c.vx;c.y+=c.vy;c.vy+=0.02*Math.sin(c.t*0.05);c.vy*=0.99;if(c.y<20)c.vy+=0.05;if(c.t>200){c.fly=2;c.t=0}}
    else if(c.fly===2){c.t++;const tx=c.hx,ty=c.hy;c.vx+=(tx-c.x)*0.0008;c.vy+=(ty-c.y)*0.0008;c.vx*=0.985;c.vy*=0.985;c.x+=c.vx;c.y+=c.vy;if(Math.hypot(tx-c.x,ty-c.y)<2&&c.t>200){c.fly=0;c.x=tx;c.y=ty}}}
  for(const f of FLAKES){f.y+=f.v;f.x+=Math.sin(g.t*0.01+f.ph)*0.2-0.1;if(f.y>H){f.y=-2;f.x=K.rr(0,W)}if(f.x<0)f.x+=W}
  if(K.SND.ctx){K.bed('mwind','bandpass',260,0.5);K.bedSet('mwind',0.035,240+60*Math.sin(g.t*0.002))}}
// ---------------- render ----------------
function skyAt(d,y){const top=d<0.4?mix(0x040716,0x18224a,d/0.4):d<0.7?mix(0x18224a,0x34467a,(d-0.4)/0.3):mix(0x34467a,0x5a80c0,(d-0.7)/0.3);
  const hz=d<0.4?mix(0x0c1430,0x40345e,d/0.4):d<0.7?mix(0x40345e,0xd8806e,(d-0.4)/0.3):mix(0xd8806e,0xffd49a,(d-0.7)/0.3);return mix(top,hz,Math.pow(clamp(y/160,0,1),1.5))}
function lights(d){// ambient and sun colour for the time of dawn
  const am=[lerp(0.2,0.62,d),lerp(0.24,0.66,d),lerp(0.4,0.74,d)];let sn=[0,0,0];
  if(d>0.35){const k=clamp((d-0.35)/0.35,0,1);const pink=[1.0,0.5,0.62],gold=[1.25,1.0,0.65];const t=clamp((d-0.6)/0.4,0,1);sn=[lerp(pink[0],gold[0],t)*k,lerp(pink[1],gold[1],t)*k,lerp(pink[2],gold[2],t)*k]}return[am,sn]}
const QB=8;const qz=v=>Math.floor(v*QB+0.5)/QB;
function lit(a,f,t,am,sn){const kr=qz(am[0]*(0.55+0.45*t)+sn[0]*f),kg=qz(am[1]*(0.55+0.45*t)+sn[1]*f),kb=qz(am[2]*(0.55+0.45*t)+sn[2]*f);return rgb((a>>16&255)*kr,(a>>8&255)*kg,(a&255)*kb)}
function draw(g){const t=g.t,d=g.dawn;const [am,sn]=lights(d);em.fill(0);
  // sky, stars fading, sun rising out of the clouds on the right
  for(let y=0;y<H;y++){const c=skyAt(d,y);for(let x=0;x<W;x++)col[y*W+x]=c}
  if(d<0.6){K.setSeed(3);for(let i=0;i<120;i++){const x=K.ri(0,W-1),y=K.ri(0,120);col[y*W+x]=mix(col[y*W+x],0xe0e8ff,(0.6-d)*(0.5+0.5*Math.sin(t*0.05+i))*1.4)}}
  const sy=lerp(176,92,clamp((d-0.55)/0.45,0,1)),sx=460;if(d>0.45){K.glow(sx,sy,70,0xffb070,0.35*clamp((d-0.45)*3,0,1));if(sy<170)K.disc(sx,sy,9,mix(0xffc080,0xfff4d8,clamp((d-0.7)*3,0,1)),200)}
  // far peaks
  for(let p=0;p<N;p++){if(FM[p]){col[p]=lit(FA[p],FF[p],FT[p],am,sn)}}
  // valley and village (lights go out as day comes)
  for(let y=146;y<H;y++)for(let x=0;x<W;x++){const p=y*W+x;let c=lit(VAL[p],0.3,0.5,am,sn);if(VLT[p]&&d<0.85){c=mix(c,0xffc060,0.9*(1-d));em[p]=Math.round(180*(1-d))}col[p]=c}
  // cloud sea: puffs lit from above by the sky and from the right by the sun
  const top=mix(skyAt(d,150),0xffffff,0.45),cl=lit(0xd8dce8,0,1,am,sn),cs=lit(0x8a90a8,0,0.4,am,sn),cw=lit(0xffffff,1,1,am,sn);
  const cm=mix(cl,cs,0.45);
  for(const p of PUFF){const cx=p.bx+p.dx+Math.sin(t*0.004+p.ph)*2,cy=p.by+p.dy,r=p.r,rx=r*1.5,ry=r*0.72;
    for(let y=Math.floor(cy-ry);y<=Math.ceil(cy+ry);y++){if(y<0||y>=H)continue;for(let x=Math.floor(cx-rx);x<=Math.ceil(cx+rx);x++){if(x<0||x>=W)continue;const dx=(x-cx)/rx,dy=(y-cy)/ry;
      // a lumpy dome: the outline wobbles so the cloud tops cauliflower
      const wob=1+0.09*Math.sin(Math.atan2(dy,dx)*7+p.ph*3);const dd=(dx*dx+dy*dy)/(wob*wob);if(dd>1)continue;
      const nz=Math.sqrt(1-dd);const up=-dy*0.85+nz*0.25,east=dx*0.8+nz*0.2;let c=up>0.62?cl:up>0.15?cm:cs;if(east>0.45&&up>0.35&&sn[0]>0.05)c=mix(c,cw,0.32);
      if(up>0.8&&dd>0.7)c=mix(c,top,0.35);col[y*W+x]=c}}}
  // near: cliff, pines, pavilion
  for(let p=0;p<N;p++){if(NM[p])col[p]=lit(NA[p],NF[p],NT[p],am,sn)}
  drawLantern(g);drawBell(g,am,sn);drawLog(g,am,sn);
  // snow clumps still on the branches
  for(const c of CLUMPS){if(!c.on)continue;const w=c.w;for(let i=-w/2;i<=w/2;i++){const x=Math.round(c.x+i),y=Math.round(c.y-1-(Math.abs(i)<w/4?1:0));K.px(x,y,lit(SNOW,i>0?0.7:0.3,1,am,sn));K.px(x,y+1,lit(SNOWS,0.4,0.6,am,sn))}}
  // falling snow from branches and the beam, gentle snowfall
  for(const f of g.fall){K.px(f.x,f.y,lit(SNOW,0.6,1,am,sn))}
  for(const f of FLAKES){const x=Math.round(f.x),y=Math.round(f.y);if(x>=0&&y>=0&&x<W&&y<H)col[y*W+x]=mix(col[y*W+x],0xf0f4ff,0.7*(1-d*0.6))}
  // crows
  for(const c of CROWS){const x=Math.round(c.fly?c.x:c.hx),y=Math.round(c.fly?c.y:c.hy);if(c.fly){const up=Math.sin(t*0.4+c.ph)>0;K.px(x,y,0x0a0a10);K.px(x-1,y+(up?-1:1),0x0a0a10);K.px(x+1,y+(up?-1:1),0x0a0a10);K.px(x-2,y+(up?-2:1),0x0a0a10);K.px(x+2,y+(up?-2:1),0x0a0a10)}
    else{K.px(x,y,0x0a0a10);K.px(x,y-1,0x0a0a10);K.px(x+1,y-1,0x0a0a10);K.px(x-1,y,0x0a0a10)}}
  // the sound made visible: a ring of bent air
  if(g.rings.length){COPY.set(col);for(const r of g.rings){const a=r.a*Math.max(0,1-r.t/150);if(a<0.02)continue;const R=r.r,w=7;
    for(let y=Math.max(0,Math.floor(r.y-R-w));y<=Math.min(H-1,Math.ceil(r.y+R+w));y++){const dy=(y-r.y)*1.3;const o2=(R+w)*(R+w)-dy*dy;if(o2<0)continue;const xo=Math.sqrt(o2);const i2=(R-w)*(R-w)-dy*dy;const xi=i2>0?Math.sqrt(i2):0;
      for(const sgn of [-1,1])for(let xx=Math.floor(xi);xx<=Math.ceil(xo);xx++){const x=Math.round(r.x+sgn*xx);if(x<0||x>=W)continue;const dx=x-r.x;const dist=Math.hypot(dx,dy);const u=(dist-R)/w;if(u<-1||u>1)continue;
        const prof=Math.sin(u*Math.PI)*a*3.2;const sx2=clamp(Math.round(x+dx/dist*prof),0,W-1),sy2=clamp(Math.round(y+(dy/1.3)/dist*prof),0,H-1);let c=COPY[sy2*W+sx2];const br=Math.cos(u*Math.PI*0.5)*a*0.3;c=mix(c,0xffffff,br);col[y*W+x]=c}}}}}
const LAN=[96,108];let LK=0;
function drawLantern(g){LK=Math.max(0,1-g.dawn*1.3)*(0.92+0.08*Math.sin(g.t*0.13)+0.04*Math.sin(g.t*0.37));const sw=Math.sin(g.t*0.03)*0.6+g.sway*30;const x=LAN[0]+Math.round(sw),y=LAN[1];
  K.line(LAN[0],76,x,y-8,0x2a1a10);
  for(let j=-7;j<=7;j++){const hw=Math.round(5*Math.sqrt(1-(j/8)**2));for(let i=-hw;i<=hw;i++){const rib=j%3===0;const c=mix(0x8a2a14,0xffb060,LK*(rib?0.6:1)*(1-Math.abs(i)/(hw+2)));K.px(x+i,y+j,c,Math.round(LK*160))}}
  K.rect(x-3,y-9,7,2,0x1a1210);K.rect(x-3,y+8,7,2,0x1a1210);if(LK>0.05)K.glow(x,y,46,0xff9a40,0.28*LK)}
function drawBell(g,am,sn){const sw=g.sway;const hang=BT;
  for(let y=BT;y<BB;y++){const hw=bellHalf(y);const off=sw*(y-hang);const u=(y-BT)/(BB-BT);
    if(u<0.1){// dragon-head hanger: a loop on the crown
      const lo=Math.abs(y-BT-4)<4?[-7,-5,5,7]:[-7,7];for(let x=-7;x<=7;x++){const ring=(y<=BT+1&&Math.abs(x)<7)||(Math.abs(x)>=5&&Math.abs(x)<=7);if(!ring)continue;K.px(BX+x+off,y,lit(0x3a4a3a,x>0?0.8:0.2,0.6,am,sn))}continue}
    for(let x=-Math.floor(hw);x<=Math.floor(hw);x++){const nx=x/hw;const nz=Math.sqrt(Math.max(0,1-nx*nx));
      // bronze with green patina; raised bands and bosses catch light
      let band=(Math.abs(u-0.18)<0.012)||(Math.abs(u-0.5)<0.012)||(Math.abs(u-0.53)<0.01)||(u>0.86&&u<0.9)||(Math.abs(x)<1&&u<0.5)||(Math.abs(Math.abs(nx)-0.62)<0.04&&u<0.5);
      let boss=false;if(u>0.2&&u<0.48){const cu=(u-0.2)/0.28*4,cn=(Math.abs(nx)-0.16)/0.4*3;const fu=cu-Math.floor(cu),fn=cn-Math.floor(cn);boss=cn>0&&cn<3&&(fu-0.5)**2+(fn-0.5)**2<0.09}
      const seat=Math.hypot(x+8,(y-(BT+(BB-BT)*0.7))*1.1)<7;
      const pat=fbm((BX+x)*0.2,y*0.2,2,79);const base=pat>0.58?0x3a5a4a:pat>0.45?0x34483a:0x2c3a2e;let a=band||boss?0x6a6a4a:base;if(seat)a=Math.hypot(x+8,(y-(BT+(BB-BT)*0.7))*1.1)<3?0x8a7a4a:0x4a4a36;
      const f=clamp(nx*0.7+0.3,0,1),tt=nz*0.6+0.2;let c=lit(a,f,tt,am,sn);
      // specular highlight from the sky on the left, warm rim from the sun on the right
      if(nx<-0.35&&nx>-0.55&&(band||boss))c=mix(c,0xc8c0a0,0.35);if(nx>0.86&&sn[0]>0.1)c=mix(c,0xffc890,0.4*sn[0]);
      c=mul(c,Math.floor((0.45+0.55*nz-nx*0.22)*6+0.5)/6*1.15);if(Math.abs(x)===Math.floor(hw))c=mix(c,0x0a0e0c,0.5);
      if(LK>0.02){const ld=Math.hypot(BX+x-LAN[0],y-LAN[1]);const k=LK*Math.max(0,-nx*0.8+nz*0.4)/(1+ld*ld/900);if(k>0.03)c=K.add(c,rgb(255*k*0.55,160*k*0.55,70*k*0.55))}
      if(g.glow>0.05){const gd=Math.hypot(x-26,y-132);if(gd<20)c=mix(c,0xfff0c0,g.glow*(1-gd/20)*0.6)}
      K.px(BX+x+off,y,c)}}
  // shimmer while it hums
  if(g.hum>0.1){for(let k=0;k<3;k++){const yy=BT+20+((g.t*2+k*30)%70);const hw=bellHalf(yy);for(let x=-hw;x<=hw;x+=1){if(hash(x,yy+g.t)<0.5)K.pxa(BX+x+sw*(yy-BT),yy,0xe8f0d0,g.hum*0.12)}}}}
function drawLog(g,am,sn){const [cx,cy]=logPos(g.th);
  // ropes from the beam
  for(const ox of [-16,16]){K.line(PV[0]+ox,PV[1]+2,cx+ox,cy-5,lit(0x8a7a5a,0.5,0.5,am,sn))}
  for(let y=-5;y<=5;y++){const hw=LOGH-(Math.abs(y)>3?1:0);for(let x=-hw;x<=hw;x++){const ny=y/5;const end=x<=-hw+1;let a=end?0x9a8a6a:(hash(Math.floor(x/3),y)<0.3?0x5a4a34:0x6a5840);const c=lit(a,clamp(0.5-ny*0.3,0,1),clamp(0.6-ny*0.6,0,1),am,sn);K.px(cx+x,cy+y,Math.abs(y)===5?mix(c,0x100a06,0.5):c)}}
  // rope bindings
  for(const ox of [-16,16])for(let y=-5;y<=5;y++)K.px(cx+ox,cy+y,lit(0xb0a070,0.5,0.6,am,sn))}
// ---------------- autoplay ----------------
function ai(g){const A=g.ai;if(!A.q.length){const [lx,ly]=logPos(0);const pull=K.rr(26,48);const gx=lx+K.rr(-10,14);
    A.q.push([gx,ly,false,60],[gx,ly,true,8],[gx+pull,ly-pull*0.35,true,Math.round(40+pull)],[gx+pull,ly-pull*0.35,true,20],[gx+pull+4,ly-pull*0.35-8,false,10],[gx+pull+30,ly-40,false,K.ri(200,320)]);
    if(K.rnd()<0.2)A.q.push([BX-10,140,false,40],[BX-10,140,true,4],[BX-10,140,false,90])}
  const tg=A.q[0];A.k++;if(A.k===1){A.sx=A.x;A.sy=A.y}const k=Math.min(1,A.k/tg[3]);const e=k<0.5?2*k*k:1-Math.pow(-2*k+2,2)/2;A.x=lerp(A.sx,tg[0],e);A.y=lerp(A.sy,tg[1],e);
  const down=tg[2],click=down&&!A.down;A.down=down;if(A.k>=tg[3]){A.q.shift();A.k=0}
  if(g.dawn>0.98&&g.n>14&&!A.reset){A.reset=g.t}if(A.reset&&g.t-A.reset>900){A.reset=0;g.dawnT=0;g.n=0}
  return{x:0,y:0,mouse:{x:A.x,y:A.y,down,click}}}
function info(g){return'撞钟 · '+(g.n?'第 '+g.n+' 响':'天还没亮')+(g.dawn>0.9?' · 日出':'')}
return{init,tick,draw,ai,info};})();
GAMES.push({id:'bell',name:'撞钟',ref:'拉开撞木再松手 · 一声声敲出日出',keys:'按住撞木往右拉开，松手：撞钟（拉得越开越响）· 点钟身：用手敲一下',thumbAt:1500,
  init:BELL.init,tick:BELL.tick,draw:BELL.draw,ai:BELL.ai,info:BELL.info,
  opts:[{label:'回到夜里',get:()=>false,set:g=>{g.dawnT=0;g.n=0}}],
  about:['天亮之前的雪山顶，一座钟亭立在云海上，亭里挂着一口铜钟，旁边吊着一根撞木。按住撞木往后拉，松手，它荡回去撞在钟上：拉得越开，撞得越响。','钟声变成看得见的东西：一圈被声音推弯的空气从钟上滚出去，把云海推开（云下面睡着的村子露了出来），把松枝和屋檐上的积雪震落，把乌鸦惊飞，碰到远处的山峰又弱弱地弹回来一圈。每撞一下，天就亮一点：天空变暖，雪峰先染上粉色再变成金色，太阳从云海里升起来。钟声由十几个不成整数比的泛音合成，带着很长的嗡鸣和山谷回声。'],
  tags:['撞木是真实的单摆：拉多开就撞多响','声波圈扭曲空气，推开云海','积雪从松枝和屋檐上震落，乌鸦惊飞','声波碰到远山弹回一圈回声','每撞一下天就亮一点，雪峰从粉变金','铜钟的不和谐泛音、长嗡鸣和山谷回声']});

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
