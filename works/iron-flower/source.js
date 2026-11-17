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
// ================= shared bits for the three games: save data, pixel UI frames, floating numbers, particles, sound cues =================
const STORE=(function(){const mem={};
  return{get(k,d){try{const s=localStorage.getItem('zlyj.'+k);if(s!=null)return JSON.parse(s)}catch(e){}return k in mem?mem[k]:JSON.parse(JSON.stringify(d))},
    set(k,v){mem[k]=v;try{localStorage.setItem('zlyj.'+k,JSON.stringify(v))}catch(e){}}}})();
const UI=(function(){const {rect,recta,px,hex}=K;
  // a chunky pixel frame: dark ink outline, a light bevel on top-left, a dark one bottom-right, a flat face
  function frame(x,y,w,h,face,o){o=o||{};x|=0;y|=0;w|=0;h|=0;const ink=o.ink!=null?o.ink:0x14101c,hi=o.hi!=null?o.hi:K.mix(face,0xffffff,0.28),lo=o.lo!=null?o.lo:K.mix(face,0,0.35);
    if(o.a!=null){recta(x+1,y+1,w-2,h-2,face,o.a)}else rect(x+1,y+1,w-2,h-2,face);
    rect(x+1,y,w-2,1,ink);rect(x+1,y+h-1,w-2,1,ink);rect(x,y+1,1,h-2,ink);rect(x+w-1,y+1,1,h-2,ink);
    rect(x+1,y+1,w-2,1,hi);rect(x+1,y+1,1,h-3,hi);rect(x+1,y+h-2,w-2,1,lo);rect(x+w-2,y+2,1,h-4,lo);
    if(o.shadow)recta(x+2,y+h,w-2,2,0,0.45)}
  function bar(x,y,w,h,t,c,bg){x|=0;y|=0;rect(x,y,w,h,0x14101c);rect(x+1,y+1,w-2,h-2,bg!=null?bg:0x2a2434);const f=Math.round((w-2)*K.clamp(t,0,1));if(f>0){rect(x+1,y+1,f,h-2,c);rect(x+1,y+1,f,1,K.mix(c,0xffffff,0.4))}}
  return{frame,bar}})();
// floating text: score numbers, words. A list owned by each game; world or screen coordinates are the game's business
function Pops(){const L=[];return{L,
  add(x,y,s,c,o){o=o||{};L.push({x,y,s:String(s),c,t:0,life:o.life||46,vy:o.vy!=null?o.vy:-0.9,size:o.size||0,big:o.big||0,cjk:/[^\x00-\x7f]/.test(String(s))})},
  tick(){for(let i=L.length-1;i>=0;i--){const p=L[i];p.t++;p.y+=p.vy;p.vy*=0.92;if(p.t>p.life)L.splice(i,1)}},
  draw(ox,oy){for(const p of L){const x=p.x-(ox||0),y=p.y-(oy||0);const k=p.t<5?(p.big?1+(5-p.t)*0.1:1):1;const fade=p.t>p.life-10?(p.life-p.t)/10:1;if(fade<=0.05)continue;
    if(p.cjk||p.size)K.text(p.s,x,y,p.c,{size:Math.round((p.size||11)*k),bold:true,align:'c',ink:0x14101c,a:fade});
    else{const sc=p.big&&p.t<4?2:1;K.ptext(p.s,x,y,p.c,{align:'c',ink:0x14101c,scale:sc})}}}}}
// particles: point/streak bits with gravity and drag, drawn as 1–3 px
function Parts(){const L=[];return{L,
  add(x,y,vx,vy,c,o){o=o||{};if(L.length>1600)return;L.push({x,y,vx,vy,c,t:0,life:o.life||30,g:o.g!=null?o.g:0.08,dr:o.dr!=null?o.dr:0.96,s:o.s||1,e:o.e||0,c2:o.c2,floor:o.floor})},
  burst(x,y,n,sp,cols,o){for(let i=0;i<n;i++){const a=K.rnd()*Math.PI*2,v=sp*(0.35+K.rnd()*0.65);this.add(x,y,Math.cos(a)*v,Math.sin(a)*v-(o&&o.up||0),cols[i%cols.length],o)}},
  tick(){for(let i=L.length-1;i>=0;i--){const p=L[i];p.t++;p.vy+=p.g;p.vx*=p.dr;p.vy*=p.dr;p.x+=p.vx;p.y+=p.vy;if(p.floor!=null&&p.y>p.floor){p.y=p.floor;p.vy*=-0.4;p.vx*=0.6}if(p.t>p.life)L.splice(i,1)}},
  draw(ox,oy){ox=ox||0;oy=oy||0;for(const p of L){const c=p.c2!=null&&p.t>p.life*0.55?p.c2:p.c;const s=p.t>p.life*0.7&&p.s>1?p.s-1:p.s;K.rect(p.x-ox-(s>>1),p.y-oy-(s>>1),s,s,c,p.e)}}}}
// sound cues with a per-name rate limit so 200 hits in one frame make one sound
const SFX=(function(){const last={};
  function ok(n,gap){if(!K.live())return false;const t=K.now();if(last[n]&&t-last[n]<(gap||0.03))return false;last[n]=t;return true}
  return{ok,
    blip(f,d,v,type){if(!ok('b'+f,0.02))return;K.tone(type||'square',f,f*1.02,d||0.06,v||0.06,K.now())},
    up(f0,f1,d,v,type,n){if(!ok(n||('u'+f0),0.03))return;K.tone(type||'square',f0,f1,d,v,K.now())},
    hit(v){if(!ok('hit',0.035))return;const t=K.now();K.noise(0.05,v||0.1,t,'bandpass',2400,900,1.2);K.tone('square',220,90,0.05,(v||0.1)*0.5,t)},
    boom(v,f){if(!ok('boom',0.06))return;const t=K.now();K.noise(0.5,v||0.3,t,'lowpass',f||1400,60,0.8);K.tone('sine',90,32,0.4,(v||0.3)*0.9,t)},
    coin(p){if(!ok('coin',0.025))return;const t=K.now(),f=988*(p||1);K.tone('square',f,f,0.05,0.045,t);K.tone('square',f*1.335,f*1.335,0.18,0.045,t+0.05)},
    arp(notes,dt,type,v){if(!ok('arp'+notes[0],0.1))return;const t=K.now();notes.forEach((f,i)=>K.tone(type||'square',f,f,dt*1.6,v||0.05,t+i*dt))}}})();



// ================= 竹林雨夜: a sword duel in a bamboo grove on a rainy night; deflect on the beat, break their posture, one clean cut =================
// Swordsmen are posed skeletons (IK legs) repainted every frame as robes, sleeves, hats and Verlet ribbons, lit by the moon from the upper left.
// The grove is drawn in parallax layers that also write a layer id per pixel, so lightning and the finishing cut can repaint the frame as silhouettes or ink.
const BB=(function(){const {W,H,S,mix,mul,clamp,lerp,hash,rnd,rr,ri,vnoise}=K;const col=S.col,em=S.em;
const mx=(a,b,t)=>{const ar=a>>16&255,ag=a>>8&255,ab=a&255;return((ar+(((b>>16&255)-ar)*t>>8))<<16)|((ag+(((b>>8&255)-ag)*t>>8))<<8)|(ab+(((b&255)-ab)*t>>8))};
const D=Math.PI/180,AW=760,FY=228,GH=198,LYB=new Uint8Array(W*H),PUD=new Uint8Array(W*H);
const ease=t=>1-Math.pow(1-clamp(t,0,1),3);
// ================= the swordsman painter =================
const SW=(function(){
const BW=210,BH=160,OX=105,OY=104,N=BW*BH;
const cl=new Int32Array(N),pid=new Int16Array(N),band=new Int8Array(N),out=new Int32Array(N),oa=new Uint8Array(N),gz=new Uint8Array(N);let part=0,gzc=0;
const LL=Math.hypot(0.55,0.62,0.56),l0=-0.55/LL,l1=-0.62/LL,l2=0.56/LL;
const sh=(nx,ny,nz)=>{const d=nx*l0+ny*l1+nz*l2;return d>0.62?3:d>0.28?2:d>-0.1?1:0};
let FAR=0;
function put(x,y,c,b){x+=OX;y+=OY;if(x<0||y<0||x>=BW||y>=BH)return;const i=y*BW+x;cl[i]=c;pid[i]=part;band[i]=b}
function cap(ax,ay,bx,by,r0,r1,R,fn){part++;const m=Math.max(r0,r1)+1,x0=Math.floor(Math.min(ax,bx)-m),x1=Math.ceil(Math.max(ax,bx)+m),y0=Math.floor(Math.min(ay,by)-m),y1=Math.ceil(Math.max(ay,by)+m),vx=bx-ax,vy=by-ay,ll=vx*vx+vy*vy||1e-6;
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const qx=x+0.5,qy=y+0.5;let t=((qx-ax)*vx+(qy-ay)*vy)/ll;t=t<0?0:t>1?1:t;const dx=qx-ax-vx*t,dy=qy-ay-vy*t,r=r0+(r1-r0)*t,d2=dx*dx+dy*dy;if(d2>r*r)continue;
    const nx=dx/r,ny=dy/r,nz=Math.sqrt(Math.max(0,1-nx*nx-ny*ny));let b=Math.max(0,sh(nx,ny,nz)-FAR),c=R[b];if(fn){const o=fn(t,nx,ny,b);if(o!=null){if(o<0)continue;c=o}}put(x,y,c,b)}}
function poly(P,R,fn){part++;let y0=1e9,y1=-1e9,x0=1e9,x1=-1e9;for(const p of P){if(p[1]<y0)y0=p[1];if(p[1]>y1)y1=p[1];if(p[0]<x0)x0=p[0];if(p[0]>x1)x1=p[0]}
  const n=P.length,xs=[];for(let y=Math.floor(y0);y<=Math.ceil(y1);y++){const sy=y+0.5;xs.length=0;for(let i=0;i<n;i++){const a=P[i],b=P[(i+1)%n];if((a[1]<=sy)!==(b[1]<=sy))xs.push(a[0]+(sy-a[1])/(b[1]-a[1])*(b[0]-a[0]))}xs.sort((a,b)=>a-b);
    for(let k=0;k+1<xs.length;k+=2){const xa=Math.round(xs[k]),xb=Math.round(xs[k+1]);for(let x=xa;x<xb;x++){const u=(x+0.5-x0)/(x1-x0+0.01),v=(sy-y0)/(y1-y0+0.01);let b=fn(u,v,x,y);if(b<0)continue;b=Math.max(0,b-FAR);put(x,y,R[b],b)}}}}
// ---- skeleton: torso/head/arms by angle, legs by IK to foot targets (hip at the origin, y down, facing +x) ----
const LN={torso:21,neck:3,head:5.4,th:15,sh:15.5,ua:11.5,fa:10.5};
function ik(F){let fx=F[0],fy=F[1],d=Math.hypot(fx,fy);const m=LN.th+LN.sh-0.05;if(d>m){fx*=m/d;fy*=m/d;d=m}
  const a=Math.acos(clamp((LN.th*LN.th+d*d-LN.sh*LN.sh)/(2*LN.th*d),-1,1)),b=Math.atan2(fy,fx),k1=[Math.cos(b-a)*LN.th,Math.sin(b-a)*LN.th],k2=[Math.cos(b+a)*LN.th,Math.sin(b+a)*LN.th];return[k1[0]>k2[0]?k1:k2,[fx,fy]]}
function fk(p,f){const J={},lean=p.lean*D,td=[Math.sin(lean),-Math.cos(lean)];
  J.C=[td[0]*LN.torso,td[1]*LN.torso];const hl=lean+(p.head||0)*D;J.ha=hl;J.H=[J.C[0]+Math.sin(hl)*(LN.neck+LN.head),J.C[1]-Math.cos(hl)*(LN.neck+LN.head)];
  J.S=[td[0]*17.5,td[1]*17.5];J.W=[td[0]*4,td[1]*4];J.td=td;
  [J.nK,J.nA]=ik(p.nf);[J.fK,J.fA]=ik(p.ff);
  const arm=(sa,eb)=>{sa*=D;eb*=D;const E=[J.S[0]+Math.sin(sa)*LN.ua,J.S[1]+Math.cos(sa)*LN.ua];return[E,[E[0]+Math.sin(sa+eb)*LN.fa,E[1]+Math.cos(sa+eb)*LN.fa]]};
  [J.nE,J.nH]=arm(p.as,p.ae);[J.fE,J.fH]=arm(p.fs,p.fe);J.sd=[Math.sin(p.sw*D),Math.cos(p.sw*D)];
  J.low=Math.max(J.nA[1],J.fA[1])+2.5;
  if(f<0){for(const k in J){const v=J[k];if(Array.isArray(v))J[k]=[-v[0],v[1]]}J.ha=-J.ha}J.f=f;return J}
// the blade in hip-local coordinates (for trails, sparks, chains)
function blade(J,k,s){const L=k.bl,c=k.curve||0,px=-J.sd[1],py=J.sd[0],cs=(c*J.f)*(s*s);return[J.nH[0]+J.sd[0]*(3+L*s)+px*cs*4,J.nH[1]+J.sd[1]*(3+L*s)+py*cs*4]}
// ---- parts ----
function leg(K,A,k){const f=JJ.f;cap(0,0,K[0],K[1],4.4,3.7,k.pant);cap(K[0],K[1],A[0],A[1],3.6,2.7,k.pant,(t)=>t>0.5?k.boot[Math.max(0,Math.min(3,sh(0,-0.3,0.9))-FAR)]:null);
  cap(A[0]-f*1.6,A[1]+0.4,A[0]+f*5.2,A[1]+0.9,2.5,2.0,k.boot,(t,nx,ny,b)=>ny>0.45?k.boot[0]:null)}
function sleeve(E,Hh,k){const S=JJ.S;cap(S[0],S[1],E[0],E[1],3.6,4.2,k.robe);const ex=Hh[0]-(Hh[0]-E[0])*0.12,ey=Hh[1]-(Hh[1]-E[1])*0.12;
  cap(E[0],E[1],ex,ey,4.2,5.4,k.robe,(t,nx,ny,b)=>t>0.86?k.robe[Math.max(0,b-1)]:null);cap(Hh[0],Hh[1],Hh[0]+0.01,Hh[1],2.1,2.1,k.skin)}
function skirt(J,k,o,front){const W0=J.W,K0=front?J.nK:J.fK,A0=front?J.nA:J.fA,fl=o.flut,m=front?0.55:1,len=k.hem||0.5;
  const hx=K0[0]+(A0[0]-K0[0])*len,hy=K0[1]+(A0[1]-K0[1])*len,wv=Math.sin(o.T*0.21+(front?1:0))*1.2;
  const P=[[W0[0]-6,W0[1]-1],[W0[0]+6,W0[1]-1],[K0[0]+7.5,K0[1]],[hx+7.5+fl[0]*m,hy+1.5+fl[1]*m+wv*0.5],[hx-7.5+fl[0]*m,hy+1.5+fl[1]*m-wv*0.5],[K0[0]-7.5,K0[1]]];
  poly(P,k.robe,(u,v,x,y)=>{let b=u<0.2?3:u<0.52?2:u<0.84?1:0;if(Math.sin((x-W0[0])*0.9+v*2.4+(front?2:0))>0.72)b=Math.max(0,b-1);if(!front)b=Math.max(0,b-1);if(v>0.9)b=Math.max(0,b-1);return b})}
function torso(J,k,o){const f=J.f,C=J.C,W0=J.W,td=J.td;
  // scabbard behind the hip
  if(k.scab)cap(W0[0]-f*2,W0[1]+1,W0[0]-f*22,W0[1]+11,1.9,1.6,k.scab);
  if(k.scab&&o.noBlade){cap(W0[0]+f*3,W0[1]-1,W0[0]+f*9,W0[1]-4,1.4,1.4,k.hilt);cap(W0[0]+f*2,W0[1]+1,W0[0]+f*2.6,W0[1]-3,1,1,k.gold)}
  cap(W0[0],W0[1],C[0],C[1],5.8,6.6,k.robe,(t,nx,ny,b)=>t>0.55&&nx*f>0.05&&nx*f<0.55&&ny<0.6?k.robe2[Math.min(3,b)]:null);
  // cross collar: the front edge of the outer robe
  cap(C[0]+f*1.5,C[1]+1,C[0]+f*4+td[0]*-6,C[1]+td[1]*-6+1,0.8,0.8,k.robe,(t,nx,ny,b)=>k.robe[3]);
  cap(W0[0]+td[0]*0.5,W0[1]+td[1]*0.5,W0[0]+td[0]*3.5,W0[1]+td[1]*3.5,6.3,6.4,k.sash,(t,nx,ny,b)=>t<0.12||t>0.88?k.sash[Math.max(0,b-1)]:null)}
function cape(J,k,o){const f=J.f,C=J.C,W0=J.W,fl=o.flut;
  const P=[[C[0]+f*1,C[1]-3.5],[C[0]+f*7,C[1]+1],[W0[0]+f*10,W0[1]+4],[W0[0]+f*2,W0[1]+9],[W0[0]-f*13+fl[0],W0[1]+8+fl[1]],[C[0]-f*9,C[1]+3]];
  poly(P,k.cape,(u,v,x,y)=>{const tier=Math.floor(v*6),tv=v*6-tier;let b=(f>0?u:1-u)<0.35?3:(f>0?u:1-u)<0.7?2:1;if(f<0)b=u<0.3?3:u<0.65?2:1;if(tv>0.78)b=0;if(hash(x*3,tier)<0.28)b=Math.max(0,b-1);
    if(v>0.93&&((x&1)===0))return -1;return b})}
function head(J,k,o){const f=J.f,Hc=J.H,a0=J.ha*f,ca=Math.cos(a0),sa=Math.sin(a0);
  const C=J.C;cap(C[0],C[1],C[0]+(Hc[0]-C[0])*0.5,C[1]+(Hc[1]-C[1])*0.5,2.2,2.2,k.skin);
  // skull, hair over the back and top, a face shadowed by the hat
  part++;for(let y=-7;y<=7;y++)for(let x=-7;x<=7;x++){const ux=(x+0.5)*f,uy=y+0.5,lx=ux*ca+uy*sa,ly=-ux*sa+uy*ca;const d=Math.hypot(ux,uy);if(d>5.6)continue;
    const nx=(x+0.5)/5.6,ny=(y+0.5)/5.6,nz=Math.sqrt(Math.max(0,1-nx*nx-ny*ny));let b=sh(nx,ny,nz);const hair=lx<-0.6||ly<-2.8+lx*0.15||(d>4.8&&lx<2&&ly<0.5);
    let c;if(hair)c=k.hair[b];else{if(k.hat&&ly<1.2)b=Math.max(0,b-2);c=k.skin[b]}put(Math.floor(Hc[0])+x,Math.floor(Hc[1])+y,c,b)}
  const P=(lx,ly,c)=>{put(Math.floor(Hc[0]+f*(lx*ca-ly*sa)),Math.floor(Hc[1]+lx*sa+ly*ca),c,1)};
  if(!k.veil){P(2.8,-0.5,0x08060a);P(3.6,-0.5,k.hat?k.skin[0]:0x08060a);P(4.4,2.8,k.skin[0]);if(!k.hat){P(2.6,-1.9,k.hair[1]);P(3.6,-1.9,k.hair[1])}}
  if(k.bun){const B=[Hc[0]+f*(-1.5*ca+6.2*sa),Hc[1]-1.5*sa-6.2*ca];cap(B[0],B[1],B[0]+0.01,B[1],2.7,2.7,k.hair);cap(B[0]-f*3.5,B[1]-0.6,B[0]+f*3,B[1]-0.2,0.6,0.6,k.gold)}
  if(k.hat)hat(J,k,o)}
function hat(J,k,o){const f=J.f,Hc=J.H,a0=J.ha*f*0.55,ca=Math.cos(a0),sa=Math.sin(a0);const R=k.hatR||15,A=k.hatA||10.5;
  const T=(lx,ly)=>[Hc[0]+f*(lx*ca-ly*sa),Hc[1]+lx*sa+ly*ca];const ap=T(0.5,-A),bl=T(-R,-3),br=T(R,-3),ul=T(-R+1.5,-1.8),ur=T(R-1.5,-1.8);
  const R0=k.hat;poly([ap,br,ur,ul,bl],R0,(u,v,x,y)=>{const an=Math.atan2(y+0.5-ap[1],x+0.5-ap[0]);let b=u<0.4?3:u<0.62?2:1;if(v>0.82)b=0;else if((Math.floor(an*22)&1)===0)b=Math.max(0,b-1);return b});
  cap(ap[0],ap[1],ap[0]+0.01,ap[1],1.2,1.2,R0);
  if(k.veil){const fl=o.flut,len=k.veil;for(let i=0;i<=1;i+=1/(R*2.2)){const top=[ul[0]+(ur[0]-ul[0])*i,ul[1]+(ur[1]-ul[1])*i];const wv=Math.sin(o.T*0.15+i*9)*1.2+fl[0]*0.5*(0.5+i);
      for(let s=0;s<len;s++){const x=Math.floor(top[0]+wv*(s/len)),y=Math.floor(top[1]+s);const X=x+OX,Y=y+OY;if(X<0||Y<0||X>=BW||Y>=BH)continue;const ii=Y*BW+X;const fold=Math.sin(i*R*1.6+o.T*0.05)*0.5+0.5;gz[ii]=Math.max(gz[ii],(70+fold*70)*(s>len-3?0.6:1))}}gzc=k.gauze}}
function sword(J,k,o){const f=J.f,Hh=J.nH,sd=J.sd,L=k.bl*(o.sheath!=null?o.sheath:1),w=k.bw,px=-sd[1],py=sd[0];part++;
  const up=py<0?1:-1;// which side of the blade faces up (toward the moon)
  for(let s=0;s<=L;s+=0.5){const t=s/k.bl,cs=(k.curve||0)*f*t*t*4,cx=Hh[0]+sd[0]*(3+s)+px*cs,cy=Hh[1]+sd[1]*(3+s)+py*cs;const hw=w*0.5*(s>L-7&&o.sheath==null?Math.max(0.25,(L-s)/7):1);
    for(let q=-hw;q<=hw;q+=0.5){const x=Math.floor(cx+px*q),y=Math.floor(cy+py*q);const side=q*up;const c=side>hw-0.7?k.steel[3]:side<-hw+0.6?k.steel[1]:k.steel[2];put(x,y,c,3)}}
  cap(Hh[0]+sd[0]*2.6+px*3.6,Hh[1]+sd[1]*2.6+py*3.6,Hh[0]+sd[0]*2.6-px*3.6,Hh[1]+sd[1]*2.6-py*3.6,1.1,1.1,k.gold);
  cap(Hh[0]+sd[0]*1.5,Hh[1]+sd[1]*1.5,Hh[0]-sd[0]*6,Hh[1]-sd[1]*6,1.35,1.35,k.hilt,(t,nx,ny,b)=>(Math.floor(t*7)&1)?k.hilt[Math.max(0,b-1)]:null);
  cap(Hh[0]-sd[0]*6.6,Hh[1]-sd[1]*6.6,Hh[0]-sd[0]*6.5,Hh[1]-sd[1]*6.5,1.4,1.4,k.gold)}
function chain(c){const P=c.pts,n=P.length;for(let i=n-1;i>0;i--){const t0=(i-1)/(n-1),t1=i/(n-1);cap(P[i-1][0],P[i-1][1],P[i][0],P[i][1],lerp(c.r0,c.r1,t0),lerp(c.r0,c.r1,t1),c.R)}}
let JJ=null;
function paint(J,k,o){cl.fill(-1);gz.fill(0);part=0;JJ=J;const f=J.f;
  for(const c of o.chains)if(c.back){FAR=c.far?1:0;chain(c)}
  FAR=1;sleeve(J.fE,J.fH,k);leg(J.fK,J.fA,k);FAR=0;
  skirt(J,k,o,false);torso(J,k,o);leg(J.nK,J.nA,k);skirt(J,k,o,true);if(k.cape)cape(J,k,o);head(J,k,o);
  sleeve(J.nE,J.nH,k);if(!o.noBlade)sword(J,k,o);
  for(const c of o.chains)if(!c.back){FAR=0;chain(c)}
  // post: cold moon rim on edges that face the upper left, inner contours where a nearer part overlaps, ink outline, gauze
  const RIM=k.rim||0xc8dcff,INK=0x06070c;out.fill(-1);oa.fill(0);
  for(let y=1;y<BH-1;y++)for(let x=1;x<BW-1;x++){const i=y*BW+x;if(cl[i]<0)continue;let c=cl[i];const L_=cl[i-1]<0,U=cl[i-BW]<0,UL=cl[i-BW-1]<0;
    if((L_||U||UL)&&band[i]>=1)c=mx(c,RIM,band[i]>=2?150:90);else{const q=[i+1,i+BW,i-1,i-BW];for(const j of q)if(cl[j]>=0&&pid[j]<pid[i]-1){c=mx(c,0,60);break}}out[i]=c;oa[i]=255}
  for(let y=1;y<BH-1;y++)for(let x=1;x<BW-1;x++){const i=y*BW+x;if(cl[i]>=0)continue;if(cl[i-1]>=0||cl[i+1]>=0||cl[i-BW]>=0||cl[i+BW]>=0){out[i]=INK;oa[i]=255}}
  if(gzc)for(let i=0;i<N;i++){const g=gz[i];if(!g)continue;if(oa[i]===255)out[i]=mx(out[i],gzc,g*0.8|0);else{out[i]=gzc;oa[i]=g}}gzc=0;
  return J}
return{fk,paint,blade,out,oa,BW,BH,OX,OY}})();
// ================= poses (facing +x; nf/ff = near/far foot targets from the hip; arm and sword angles absolute: 0 down, 90 forward, 180 up) =================
const PO={
  stance:{lean:8,head:-6,nf:[13,27],ff:[-15,27],as:62,ae:28,fs:-120,fe:-50,sw:108},
  walkA:{lean:9,head:-6,nf:[18,26],ff:[-10,27],as:60,ae:30,fs:-118,fe:-50,sw:105},
  walkB:{lean:8,head:-6,nf:[8,27],ff:[-19,26],as:64,ae:26,fs:-122,fe:-50,sw:111},
  wHigh:{lean:-4,head:-8,nf:[12,28],ff:[-14,28],as:170,ae:30,fs:150,fe:20,sw:232},
  high:{lean:26,head:-10,nf:[22,20],ff:[-20,22],as:84,ae:4,fs:-60,fe:20,sw:64},
  highF:{lean:24,head:-8,nf:[22,20],ff:[-20,22],as:42,ae:10,fs:-70,fe:20,sw:22},
  wSide:{lean:2,head:-6,nf:[12,26],ff:[-17,26],as:-40,ae:60,fs:60,fe:40,sw:-40},
  side:{lean:18,head:-8,nf:[20,22],ff:[-19,22],as:100,ae:4,fs:-60,fe:20,sw:118},
  sideF:{lean:14,head:-12,nf:[20,22],ff:[-19,22],as:150,ae:8,fs:-70,fe:20,sw:172},
  wThr:{lean:-6,head:-4,nf:[10,27],ff:[-16,27],as:-10,ae:100,fs:70,fe:20,sw:92},
  thr:{lean:30,head:-12,nf:[24,18],ff:[-20,21],as:92,ae:0,fs:-70,fe:10,sw:92},
  thrF:{lean:26,head:-10,nf:[24,18],ff:[-20,21],as:86,ae:6,fs:-70,fe:10,sw:96},
  wSwp:{lean:30,head:-14,nf:[14,17],ff:[-12,17],as:-30,ae:40,fs:100,fe:30,sw:-70},
  swp:{lean:34,head:-14,nf:[24,16],ff:[-18,17],as:62,ae:8,fs:-80,fe:20,sw:80},
  swpF:{lean:30,head:-12,nf:[24,16],ff:[-18,17],as:112,ae:10,fs:-80,fe:20,sw:122},
  parry:{lean:2,head:-10,nf:[12,27],ff:[-16,27],as:110,ae:50,fs:-40,fe:60,sw:152},
  defl:{lean:-3,head:-12,nf:[10,28],ff:[-18,27],as:128,ae:44,fs:-50,fe:60,sw:178},
  guard:{lean:12,head:-12,nf:[12,25],ff:[-15,26],as:100,ae:70,fs:-40,fe:60,sw:196},
  hurt:{lean:-24,head:18,nf:[8,28],ff:[-12,27],as:40,ae:40,fs:-100,fe:30,sw:60},
  stag:{lean:38,head:30,nf:[10,24],ff:[-12,25],as:22,ae:10,fs:-20,fe:20,sw:18},
  kneel:{lean:30,head:38,nf:[12,15],ff:[-14,15],as:44,ae:-24,fs:-10,fe:20,sw:2},
  jump:{lean:10,head:-8,nf:[10,16],ff:[-6,20],as:110,ae:40,fs:-110,fe:-30,sw:140},
  back:{lean:-14,head:-6,nf:[6,27],ff:[-22,24],as:70,ae:30,fs:-120,fe:-40,sw:112},
  dashW:{lean:36,head:-12,nf:[16,20],ff:[-16,20],as:-20,ae:70,fs:60,fe:30,sw:60},
  dash:{lean:40,head:-10,nf:[24,20],ff:[-22,20],as:-70,ae:0,fs:60,fe:20,sw:-95},
  flick:{lean:10,head:-6,nf:[14,26],ff:[-14,26],as:50,ae:-10,fs:-30,fe:30,sw:40},
  shea:{lean:4,head:-4,nf:[8,28],ff:[-10,28],as:-20,ae:80,fs:40,fe:60,sw:100},
  rest:{lean:3,head:-2,nf:[5,29],ff:[-6,29],as:10,ae:16,fs:-6,fe:16,sw:180},
  bow:{lean:14,head:10,nf:[5,29],ff:[-6,29],as:60,ae:80,fs:60,fe:84,sw:0}};
function LP(a,b,t){const o={};for(const k in a){const x=a[k],y=b[k];o[k]=Array.isArray(x)?[x[0]+(y[0]-x[0])*t,x[1]+(y[1]-x[1])*t]:x+(y-x)*t}return o}
const SK={high:['wHigh','high','highF'],side:['wSide','side','sideF'],thr:['wThr','thr','thrF'],swp:['wSwp','swp','swpF'],leap:['wHigh','high','highF']};
const PERIL={thr:1,swp:1};
// ================= costumes and opponents =================
const RAMP=(a)=>a;
const KITS={
  hero:{robe:[0x34425e,0x6c84a6,0xaec4dc,0xe8f2ff],robe2:[0x121420,0x1e2234,0x2e344c,0x464e6a],pant:[0x151926,0x252c3e,0x3a4258,0x566078],sash:[0x0a0a10,0x16161f,0x262634,0x3c3c4c],
    boot:[0x0a0a0e,0x16161c,0x24242c,0x383842],skin:[0x5a3a3a,0x9a6a5a,0xc8987a,0xe8c0a0],hair:[0x08080c,0x121220,0x20202e,0x363648],hat:[0x3a2c18,0x6a5430,0xa08650,0xd8be80],
    steel:[0x3a4450,0x7a8a98,0xc8d8e4,0xffffff],hilt:[0x1a0c10,0x3a1a20,0x5a2a30,0x804048],gold:[0x5a4010,0x9a7a2a,0xd0b050,0xfff0a0],scab:[0x0c0a10,0x1a1420,0x2c2232,0x443650],
    rib:[0x5a0a14,0x9a1424,0xd82a3a,0xff6a6a],bl:34,bw:2,hatR:15,hatA:10.5},
  duan:{robe:[0x0e121c,0x1c2436,0x2c3850,0x46567a],robe2:[0x0a0a0e,0x16161c,0x24242c,0x383842],pant:[0x0e1018,0x1a1e2a,0x2a3040,0x404858],sash:[0x2a1a0e,0x4a3018,0x6e4a26,0x946a3a],
    boot:[0x0a0a0e,0x16161c,0x24242c,0x383842],skin:[0x4a3028,0x84584a,0xb0806a,0xd0a488],hair:[0x08080c,0x121220,0x20202e,0x363648],hat:[0x2a2010,0x4a3a1e,0x766034,0xa48a54],
    cape:[0x241e10,0x463c22,0x706036,0x9a8852],steel:[0x2e343c,0x5e6a76,0xa4b0bc,0xe8f0f8],hilt:[0x0a0a0e,0x1a1a20,0x2a2a32,0x3e3e48],gold:[0x3a2a10,0x6a5222,0x9a7c3a,0xc8a860],scab:[0x0a0a0c,0x16161a,0x24242a,0x36363e],
    bl:40,bw:3.6,curve:0.6,hatR:17,hatA:12.5,hem:0.62},
  yan:{robe:[0x2a0810,0x5a1020,0x8e1a2e,0xc8384a],robe2:[0x0a0608,0x160c10,0x241418,0x382026],pant:[0x0c080a,0x181014,0x28181e,0x3c242c],sash:[0x4a3410,0x7a5a1a,0xb0882a,0xe0be52],
    boot:[0x0a0608,0x160c10,0x241418,0x382026],skin:[0x5a3a3a,0x9a6a5a,0xd0a084,0xf0c8aa],hair:[0x08060a,0x140e14,0x221a22,0x382c38],hat:[0x08080c,0x16161e,0x282834,0x464656],
    steel:[0x3a4450,0x7a8a98,0xc8d8e4,0xffffff],hilt:[0x1a0a0e,0x3a1018,0x5a1a26,0x802a3a],gold:[0x5a4010,0x9a7a2a,0xd0b050,0xfff0a0],scab:[0x180608,0x2a0c10,0x40141a,0x5a1e26],
    rib:[0x6a5664,0xa88c9e,0xdcc4d2,0xfff2f8],bl:33,bw:1.8,hatR:11.5,hatA:9.5,veil:34,gauze:0x6a3442,rim:0xe0d0ff},
  ming:{robe:[0x38383e,0x6a6a72,0xa4a4ac,0xdcdce2],robe2:[0x16161c,0x24242c,0x34343e,0x4a4a56],pant:[0x16161c,0x24242c,0x34343e,0x4a4a56],sash:[0x0e1424,0x1a2440,0x2a3a60,0x405486],
    boot:[0x0a0a0e,0x16161c,0x24242c,0x383842],skin:[0x5a4038,0x8e6a5a,0xb89482,0xd8b8a6],hair:[0x5a5a62,0x9a9aa2,0xcacad2,0xf8f8ff],
    steel:[0x404a58,0x8494a4,0xd0e0ee,0xffffff],hilt:[0x14141c,0x262634,0x3a3a4c,0x56566a],gold:[0x4a4a52,0x7a7a86,0xb0b0bc,0xe8e8f0],scab:[0x101016,0x1c1c26,0x2c2c3a,0x424254],
    bl:46,bw:2,bun:1,hem:0.7}};
const FOES=[
  {name:'断水',title:'蓑衣刀客',kit:'duan',hp:8,post:100,w0:34,wn:22,rec:46,cool:[40,80],bp:17,pd:24,dmg:3,dist:84,spd:0.7,lives:1,
   combos:[['high','side'],['side','side','high'],['swp'],['high','thr'],['high','high','swp'],['side','high']],chains:['sash']},
  {name:'飞燕',title:'幂篱剑客',kit:'yan',hp:7,post:90,w0:20,wn:10,rec:34,cool:[24,56],bp:12,pd:14,dmg:2,dist:90,spd:1.3,lives:1,
   combos:[['side','high','side'],['thr'],['side','side','side','high'],['leap','side'],['high','swp'],['side','thr'],['side','high','side','high','thr']],chains:['scarf','tassel']},
  {name:'无名',title:'白发剑圣',kit:'ming',hp:10,post:110,w0:26,wn:15,rec:30,cool:[20,46],bp:12,pd:18,dmg:3,dist:88,spd:1,lives:2,
   combos:[['high','side','high','side','thr'],['side','side','swp'],['thr','high'],['high','high','side','side','swp'],['side','high','thr'],['swp','high','side']],chains:['hairL','beard','sash']}];
const REACH={high:72,side:74,thr:88,swp:70,leap:70};
// ================= the grove =================
let GR=null;
function grove(){if(GR)return GR;K.setSeed(4242);const L=[];
  const lay=(lv,n,pf,wmin,wmax,base)=>{const span=W+(AW-W)*pf+80;for(let i=0;i<n;i++){const x=-40+(i+rr(0.1,0.9))*span/n;const lvs=[];
      const nc=lv===1?0:lv===2?3:lv===3?5:lv===4?6:4;for(let c=0;c<nc;c++){const y=lv===5?rr(-20,50):rr(-24,lv===2?60:lv===3?80:70)+(rnd()<0.15?rr(30,60):0);const side=rnd()<0.5?-1:1,leaves=[];
        const nl=ri(4,7);for(let j=0;j<nl;j++)leaves.push({a:side>0?rr(-0.4,1.1):Math.PI-rr(-0.4,1.1),l:lv===5?rr(22,34):lv===2?rr(6,10):rr(9,15),ph:rnd()*6});lvs.push({y,side,bl:lv===5?rr(10,18):rr(3,8),leaves})}
      L.push({lv,pf,x,w:ri(wmin,wmax),yb:base+rr(-2,2),ph:rnd()*6.28,gap:ri(26,38)*(lv>=4?1.3:1),no:rnd()*40,hue:ri(0,2),lvs,cut:null})}};
  lay(1,60,0.22,2,3,GH-6);lay(2,30,0.48,4,6,GH-1);lay(3,15,0.74,7,9,GH+6);lay(4,8,1,10,12,FY-12);lay(5,4,1.38,24,30,H+40);
  // ramps per layer: bamboo greens fogged toward the night mist; index 4 is the moon rim
  const FOG=0x2c4448,HUE=[[0x0a1a12,0x14301c,0x24502c,0x3c7642,0x9ad0a0],[0x12160a,0x262e12,0x3e4c20,0x627436,0xc8d890],[0x08181a,0x10302e,0x1c4c46,0x326e64,0x98d8d0]];
  const FK=[0,0.9,0.66,0.36,0.06,0];const DK=[1,1,0.9,0.8,0.8,0.3];
  const RP=[];for(let lv=1;lv<=5;lv++){RP[lv]=HUE.map(h=>h.map(c=>mix(mul(c,DK[lv]),FOG,FK[lv])))}
  const LF=[];const LH=[0x0c2214,0x1c4224,0x346a36,0x5e9a58];for(let lv=1;lv<=5;lv++)LF[lv]=LH.map(c=>mix(mul(c,DK[lv]),FOG,FK[lv]));
  // sky panorama, cached: clouds around a hidden moon, and a clear version for the ending
  const sky=new Uint32Array(W*GH),clr=new Uint32Array(W*GH),MX=372,MY=52;
  for(let y=0;y<GH;y++)for(let x=0;x<W;x++){const t=y/GH;let c=mix(0x060a16,0x1e3440,Math.pow(t,1.3));const dm=Math.hypot(x-MX,(y-MY)*1.1);
    const n=K.fbm(x*0.012,y*0.03,4,9),band=n+(1-t)*0.1;let cc=c;if(band>0.5){const lit=clamp(1-dm/160,0,1);cc=mix(mix(c,0x2a3848,0.7),0x9ab0c4,lit*lit*clamp((band-0.5)*4,0,1)*0.8);if(band<0.55)cc=mix(cc,0xc8d8e4,lit*0.6)}
    const halo=clamp(1-dm/120,0,1);c=mix(c,0x8aa0b4,halo*halo*0.6);const c2=mix(c,0xb8cce0,halo*halo*0.35);
    let cm=mix(cc,0x8aa0b4,halo*halo*(band>0.5?0.25:0.6));if(dm<15){const nz=Math.sqrt(1-dm*dm/225);cm=mix(0xc8d4d0,0xf4f8ec,nz);if(band>0.54)cm=mix(cm,0x6a7a88,0.75)}sky[y*W+x]=cm;
    let c3=c2;const dm2=Math.hypot(x-MX,(y-MY)*1.05);if(dm2<22){const nz=Math.sqrt(1-dm2*dm2/484);c3=mix(0xd8e0d8,0xfffff4,nz);if(K.fbm(x*0.12,y*0.12,2,3)>0.62)c3=mix(c3,0xb8c0bc,0.5)}else if(band>0.62)c3=mix(c2,0x30485a,0.4);clr[y*W+x]=c3}
  // ground rows (flagstones in perspective)
  const rows=[];let y=GH;const hs=[4,5,6,7,8,9,11,12,14];let ri_=0;while(y<H){const h=hs[Math.min(hs.length-1,ri_)];const sid=new Int16Array(1400),st=new Uint8Array(1400);let u=0,id=0;while(u<1400){const w=Math.round(h*rr(2.2,5.8)+4);st[u]=1;for(let q=0;q<w&&u+q<1400;q++)sid[u+q]=id;u+=w;id++}rows.push({y0:y,h,pf:lerp(0.78,1.32,(y+h/2-GH)/(H-GH)),sid,st,off:rr(0,40)});y+=h;ri_++}
  const rowOf=new Int16Array(H);rows.forEach((r,i)=>{for(let j=r.y0;j<Math.min(H,r.y0+r.h);j++)rowOf[j]=i});
  const n1=new Float32Array(2048);for(let i=0;i<2048;i++)n1[i]=vnoise(i*0.02,0.5,77)*0.6+vnoise(i*0.07,1.5,78)*0.4;
  const GC=[],GP=[];for(let y=GH;y<H;y++){const r=rows[rowOf[y]],ty=y-r.y0,dk=(y-GH)/(H-GH);const C=new Int32Array(1400),Pd=new Uint8Array(1400);
    for(let u=0;u<1400;u++){const si=r.sid[u],fu=r.st[u]?0:(u>0&&r.st[u-1]?1.5:3),hs=hash(si,rowOf[y]*7+3);
      const pn=vnoise(u*0.016,(y-GH)*(0.05+0.05*(1-dk)),31)*0.75+vnoise(u*0.05,(y-GH)*0.2,32)*0.25;let c;
      if(pn>0.45){Pd[u]=1+Math.min(2,(pn-0.45)*10|0);c=0x0c161c}
      else{c=mix(0x1a2228,0x34404a,hs);if(hs>0.82)c=mix(c,0x2a3a26,0.6);c=mix(c,0x0a1014,hash(u,y)*0.25);
        if(fu<1)c=mix(c,0x080c0e,0.7);else if(ty===0)c=mix(c,0x080c0e,0.45);else if(ty===1&&hs>0.45&&fu>2)c=mix(c,0x5a7080,0.3)}
      C[u]=mul(c,0.75+dk*0.4)}GC[y]=C;GP[y]=Pd}
  GR={L,RP,LF,FOG,sky,clr,MX,MY,rows,rowOf,n1,GC,GP};return GR}
function stalk(s,cx,T,g){const G=GR,x0=s.x-cx*s.pf,w=s.w;if(x0<-70||x0>W+70)return;const R=G.RP[s.lv][s.hue],yb=Math.min(H-1,Math.round(s.yb)),ly=s.lv+0;
  const A=(Math.sin(T*0.011+s.ph)*2.4+Math.sin(T*0.029+s.ph*2)*0.7+(g.gust||0)*Math.sin(s.ph+T*0.2))*(s.lv>=4?1.5:s.lv===1?0.5:1);s.A=A;
  const cut=s.cut,cy=cut?cut.y:-1e9;const fade=s.lv===5&&g.fx0!=null&&x0+w>g.fx0-10&&x0-w<g.fx1+10?110:0;
  const bt=[];for(let i=0;i<w;i++){const u=(i+0.5)/w;bt.push(w<=3?(i===0?3:i===w-1?1:2):u<0.16?4:u<0.4?3:u<0.68?2:u<0.88?1:0)}
  for(let y=Math.max(0,cut?Math.floor(cy-w):0);y<=yb;y++){const h=(s.yb-y)/(s.yb+60),off=A*h*h,xc=Math.round(x0+off-w/2);const nd=((s.yb-y+s.no)%s.gap+s.gap)%s.gap;
    const ring=nd<1.5&&s.lv>1,shad=nd>=1.5&&nd<3&&s.lv>1;const o=y*W;
    for(let i=(ring?-1:0);i<(ring?w+1:w);i++){if(cut&&y<cy+(i-w/2)*cut.sl)continue;const X=xc+i;if(X<0||X>=W)continue;let b=bt[Math.max(0,Math.min(w-1,i))];if(ring)b=Math.min(4,b+1);else if(shad)b=Math.max(0,b-1);
      if(fade){col[o+X]=mx(col[o+X],R[b],fade);continue}col[o+X]=R[b];em[o+X]=0;LYB[o+X]=ly}}
  if(cut)cutPiece(s,x0,R,ly);
  // leaf clusters
  if(s.lvs.length){const LF=G.LF[s.lv];for(const c of s.lvs){if(cut&&c.y<cy)continue;const h=(s.yb-c.y)/(s.yb+60),off=A*h*h,bx=x0+off+c.side*w*0.4,by=c.y;
      const ex=bx+c.side*c.bl,ey=by-c.bl*0.35;K.line(bx,by,ex,ey,R[1]);if(by>=0&&by<H)for(let q=0;q<1;q++);
      for(const lf of c.leaves){const fl=Math.sin(T*0.05+lf.ph)*0.12+A*0.01;leaf(ex,ey,lf.a+fl,lf.l,LF,ly)}}}}
function leaf(x,y,a,l,R,ly){let dx=Math.cos(a),dy=Math.sin(a);const n=Math.ceil(l*1.4);for(let i=0;i<=n;i++){const s=i/n,wd=Math.sin(Math.PI*Math.min(1,s*1.15))*(l>20?2.6:1.4);
    const px_=x+dx*l*s,py=y+dy*l*s+s*s*l*0.35;for(let q=-wd;q<=wd;q+=0.7){const X=Math.round(px_-dy*q),Y=Math.round(py+dx*q);if(X<0||Y<0||X>=W||Y>=H)continue;const b=q*(dx>0?1:-1)<-0.2?3:q<0.5?2:1;const p=Y*W+X;col[p]=R[s>0.85?1:b];em[p]=0;LYB[p]=ly}}}
// a cut stalk's top: slides down the slanted cut, tips over and falls
function cutPiece(s,x0,R,ly){const c=s.cut;if(c.gone)return;const w=s.w,pvx=x0+c.dx,pvy=c.y+c.dy,ca=Math.cos(c.rot),sa=Math.sin(c.rot);const len=c.y+40;
  for(let v=0;v<len;v+=0.6)for(let u=0;u<w;u+=0.6){const lx=u-w/2,ly_=-v+(lx)*c.sl;const X=Math.round(pvx+lx*ca-ly_*sa),Y=Math.round(pvy+lx*sa+ly_*ca);if(X<0||Y<0||X>=W||Y>=H)continue;const uu=(u+0.5)/w;const b=uu<0.16?4:uu<0.4?3:uu<0.68?2:uu<0.88?1:0;const p=Y*W+X;col[p]=R[b];LYB[p]=ly}}
// ================= fighters =================
function mkF(kitName,x,face){const k=KITS[kitName];return{x,y:0,vx:0,vy:0,face,k,kn:kitName,st:'idle',t:0,pz:Object.assign({},PO.stance),J:null,ch:[],flut:[0,0],arc:null,hit:0,alpha:1,par:-99,spam:0,win:9,walk:0,post:0,pt:0,hp:10,hpM:10,blk:0,sid:0,noBlade:false,sheath:null}}
function addChains(f,names){f.ch=[];for(const n of names){const c={n,pts:[],old:[]};const spec={rib:[7,3.2,1.4,0.9,'rib',1],sash:[5,3,2,1.4,'sash',1],tassel:[4,2.4,1,0.7,'rib',0],scarf:[9,3.4,1.5,1.2,'rib',0],hairL:[9,3.2,3,1.6,'hair',1],beard:[4,2.6,1.6,0.8,'hair',0],tasselR:[4,2.4,1,0.7,'rib',0]}[n];
    c.len=spec[1];c.r0=spec[2];c.r1=spec[3];c.R=f.k[spec[4]]||f.k.rib;c.back=!!spec[5];for(let i=0;i<spec[0];i++){c.pts.push([f.x,FY-40]);c.old.push([f.x,FY-40])}f.ch.push(c)}}
function anchor(f,n){const J=f.J,ox=f.x,oy=FY+f.y-J.low,fc=f.face;
  if(n==='rib')return[ox+J.H[0]-fc*7,oy+J.H[1]-4];if(n==='sash')return[ox+J.W[0]-fc*6,oy+J.W[1]+1];if(n==='scarf')return[ox+J.nE[0],oy+J.nE[1]+2];
  if(n==='hairL')return[ox+J.H[0]-fc*4,oy+J.H[1]-1];if(n==='beard')return[ox+J.H[0]+fc*3.5,oy+J.H[1]+4.5];
  const sd=J.sd;return[ox+J.nH[0]-sd[0]*7,oy+J.nH[1]-sd[1]*7]}
function tickChains(f,g){for(const c of f.ch){const a=anchor(f,c.n);const P=c.pts,O=c.old;P[0][0]=a[0];P[0][1]=a[1];const wind=g.wind;
    for(let i=1;i<P.length;i++){const p=P[i],o=O[i],vx=(p[0]-o[0])*0.93,vy=(p[1]-o[1])*0.93;o[0]=p[0];o[1]=p[1];p[0]+=vx+wind+Math.sin(g.T*0.13+i*0.9+f.x*0.01)*0.12;p[1]+=vy+(c.n==='scarf'?0.16:0.28)}
    for(let it=0;it<3;it++)for(let i=1;i<P.length;i++){const a_=P[i-1],b=P[i];const dx=b[0]-a_[0],dy=b[1]-a_[1],d=Math.hypot(dx,dy)||1e-3,k=(d-c.len)/d;b[0]-=dx*k;b[1]-=dy*k;if(i===1)continue}
    for(const p of P)if(p[1]>FY+1)p[1]=FY+1}}
// the pose a fighter wants this frame (blended into f.pz)
function target(f,g){const s=f.st,t=f.t;
  if(s==='idle')return PO.stance;if(s==='walk'){const ph=f.walk;return LP(PO.walkA,PO.walkB,0.5+0.5*Math.sin(ph))}
  if(s==='wind')return PO[SK[f.atk.k][0]];if(s==='strike')return t<7?PO[SK[f.atk.k][1]]:PO[SK[f.atk.k][2]];if(s==='rec')return t<14?PO[SK[f.atk.k][2]]:PO.stance;
  if(s==='parry')return f.dfl>0?PO.defl:PO.parry;if(s==='guard')return f.dfl>0?PO.defl:PO.guard;if(s==='block')return PO.guard;if(s==='hurt')return PO.hurt;if(s==='recoil'||s==='pbreak')return t<10?PO.defl:PO.stag;
  if(s==='broken')return PO.stag;if(s==='jump')return PO.jump;if(s==='back')return PO.back;if(s==='kneel'||s==='dead')return PO.kneel;if(s==='rise')return t<40?PO.kneel:PO.stance;
  if(s==='dashW')return PO.dashW;if(s==='dash')return PO.dash;if(s==='flick')return PO.flick;if(s==='shea')return PO.shea;if(s==='rest')return PO.rest;if(s==='bow')return PO.bow;return PO.stance}
function rate(f){const s=f.st;if(s==='strike'&&f.t<7)return 0.75;if(s==='wind')return clamp(2.6/f.atk.w,0.14,0.45);if(s==='parry'||s==='guard'||s==='dash')return 0.6;if(s==='hurt'||s==='recoil')return 0.45;if(s==='kneel'||s==='dead'||s==='rest'||s==='bow')return 0.12;return 0.24}
function pose(f,g){const tg=target(f,g);f.pz=LP(f.pz,tg,rate(f));// a tremble at the top of a heavy windup
  let p=f.pz;if(f.st==='wind'&&f.t>f.atk.w*0.6){p=Object.assign({},p);p.sw+=Math.sin(g.T*1.7)*1.2}
  f.J=SW.fk(p,f.face)}
function bladeW(f,s){const b=SW.blade(f.J,f.k,s);return[f.x+b[0],FY+f.y-f.J.low+b[1]]}
// the arc a cut leaves: sampled by blending wind -> hit poses through the skeleton
function mkArc(f,k,red){const A=[],a=PO[SK[k][0]],b=PO[SK[k][1]];for(let i=0;i<=10;i++){const p=LP(a,b,ease(i/10));const J=SW.fk(p,f.face),bx=f.x,by=FY+f.y-J.low;const t=SW.blade(J,f.k,1),m=SW.blade(J,f.k,0.45);A.push([bx+t[0],by+t[1],bx+m[0],by+m[1]])}
  f.arc={pts:A,t:0,red}}
// ================= game =================
function init(g){grove();g.T=0;g.sv=STORE.get('bamboo1',{best:0,wins:0});g.parts=Parts();g.pops=Pops();g.wind=-0.08;g.gust=0;g.shake=0;
  g.p=mkF('hero',-30,1);g.p.hp=g.p.hpM=10;addChains(g.p,['rib','sash','tassel']);g.e=null;g.stage=0;g.state='intro';g.it=0;g.lights=[];g.ghosts=[];g.slash=null;g.ink=0;g.lf=0;g.lseq=null;g.lt=240;g.bolt=null;
  g.camx=0;g.rainK=1;g.clear=0;g.stats={dfl:0,perf:0,hurt:0,t0:0};g.leaves=[];g.rip=[];g.freeze=0;g.py=0;g.ai={};
  for(const s of GR.L)s.cut=null;
  g.rain=[];for(let i=0;i<520;i++){const z=i<280?0:i<430?1:2;g.rain.push({x:rr(0,W+60),y:rr(-20,H),z,ex:0,ey:0})}
  pose(g.p,g);for(const c of g.p.ch)for(let i=0;i<c.pts.length;i++){const a=anchor(g.p,c.n);c.pts[i]=[a[0]-i*2,a[1]+i*2];c.old[i]=c.pts[i].slice()}}
function spawnFoe(g){const F=FOES[g.stage];const e=mkF(F.kit,Math.min(AW-60,g.p.x+230),-1);e.F=F;e.hp=e.hpM=F.hp;e.postM=F.post;e.lives=F.lives;e.cool=60;addChains(e,F.chains);
  e.st='walk';if(F.kit==='yan'){e.x=g.p.x+150;e.y=-260;e.vy=0;e.st='drop'}else if(F.kit==='ming'){e.x=g.p.x+170;e.st='bow';e.face=-1}
  pose(e,g);for(const c of e.ch)for(let i=0;i<c.pts.length;i++){const a=anchor(e,c.n);c.pts[i]=[a[0]+i*2,a[1]+i*2];c.old[i]=c.pts[i].slice()}g.e=e;g.p.post=0}
function setS(f,s){f.st=s;f.t=0}
function sparks(g,x,y,n,big){const P=g.parts;for(let i=0;i<n;i++){const a=rnd()*Math.PI*2,v=rr(1,big?6:4);P.add(x,y,Math.cos(a)*v,Math.sin(a)*v-1.2,rnd()<0.5?0xfff0b0:0xffb048,{life:ri(10,28),g:0.16,dr:0.94,e:255,c2:0xd0602a,floor:FY+rr(0,30)})}
  g.lights.push({x,y,r:big?130:84,c:0xffc070,k:big?0.85:0.6,t:0,l:big?14:9});if(big){for(const d of g.rain)if(d.z===2){const dx=d.x-(x-g.camx*1.15),dy=d.y-y,dd=Math.hypot(dx,dy);if(dd<90){d.ex+=dx/dd*(90-dd)*0.09;d.ey+=dy/dd*(90-dd)*0.05}}g.gust=3}}
function inkSpray(g,x,y,n,dir){for(let i=0;i<n;i++){const a=(dir>0?0:Math.PI)+rr(-0.9,0.6),v=rr(1,5);g.parts.add(x,y,Math.cos(a)*v,Math.sin(a)*v-1,rnd()<0.5?0xa8101e:0xd82a34,{life:ri(14,34),g:0.2,dr:0.95,s:rnd()<0.3?2:1,c2:0x5a0810,floor:FY+rr(0,26)})}}
function snd(n){if(!K.live())return;const t=K.now();
  if(n==='clang'||n==='perfect'){if(!SFX.ok('clang',0.04))return;const big=n==='perfect';K.tone('square',1780,1640,0.05,0.04,t);K.tone('triangle',2960,2880,big?0.6:0.32,big?0.08:0.05,t);K.tone('sine',4230,4200,big?0.9:0.45,0.035,t);K.tone('sine',1245,1240,big?0.7:0.3,0.04,t);K.noise(0.07,0.18,t,'highpass',5000,3000,0.8)}
  else if(n==='block'){if(!SFX.ok('blk',0.05))return;K.tone('triangle',1100,900,0.16,0.06,t);K.noise(0.06,0.14,t,'bandpass',2600,1800,1.5)}
  else if(n==='hit'){if(!SFX.ok('hit',0.05))return;K.noise(0.14,0.2,t,'lowpass',1400,300,0.9);K.tone('sine',160,60,0.18,0.18,t)}
  else if(n==='swish'){if(!SFX.ok('sw',0.05))return;K.noise(0.13,0.07,t,'bandpass',900,3600,2.5)}
  else if(n==='peril'){K.tone('sine',96,46,0.5,0.34,t);K.noise(0.3,0.16,t,'lowpass',500,80,0.8);K.tone('sine',96,46,0.4,0.2,t+0.13)}
  else if(n==='thunder'){K.noise(2.6,0.3,t,'lowpass',700,60,0.6);K.noise(0.4,0.2,t,'lowpass',2600,300,0.7)}
  else if(n==='kill'){K.noise(0.5,0.3,t,'highpass',3000,800,0.6);K.tone('sine',70,30,1.2,0.4,t+0.05);K.tone('triangle',2200,2150,1.6,0.05,t)}
  else if(n==='draw'){K.noise(0.25,0.08,t,'bandpass',3000,6000,3)}
  else if(n==='click'){K.tone('square',2400,2400,0.03,0.05,t);K.tone('square',1600,1600,0.04,0.04,t+0.05)}
  else if(n==='pluck'){const sc=[293.7,349.2,392,440,523.3,587.3,698.5];const f0=sc[ri(0,sc.length-1)]*(rnd()<0.3?0.5:1);K.tone('triangle',f0,f0*0.995,1.4,0.035,t);K.tone('sine',f0*2,f0*2,0.6,0.012,t)}}
function rainBed(g){if(!K.live())return;K.bed('rain','bandpass',2400,0.5);K.bedSet('rain',0.15*g.rainK,2400);K.bed('rainlow','lowpass',500,0.7);K.bedSet('rainlow',0.1*g.rainK,500)}
// ---- the player's input ----
function pInput(g,pad){const p=g.p,e=g.e;const jy=pad.y<-0.6&&!(g.py<-0.6),by=pad.y>0.6&&!(g.py>0.6);g.py=pad.y;
  const s=p.st,free=s==='idle'||s==='walk';const canP=free||s==='guard'||s==='parry'&&p.t>3||(s==='strike'&&p.t>2)||s==='rec';
  if(e&&e.st==='broken'&&pad.a&&Math.abs(e.x-p.x)<96&&(free||s==='guard'||s==='parry'||s==='rec'||s==='strike')){startKill(g);return}
  if(pad.b&&canP){p.spam=g.T-p.par<22?Math.min(3,p.spam+1):0;p.par=g.T;p.win=9-p.spam*2;setS(p,'parry');p.dfl=0;return}
  if(jy&&(free||s==='guard'||s==='rec')&&p.y===0){setS(p,'jump');p.vy=-4.8;p.vx=pad.x*1.5;return}
  if(by&&(free||s==='guard'||s==='rec'||s==='parry')){setS(p,'back');return}
  if(pad.a){if(free||s==='guard'||s==='parry'&&p.t>4){p.ci=0;startAtk(g,p)}else if((s==='strike'||s==='rec')&&p.t>1)p.q=1}
  if(free){const mv=pad.x;p.vx=mv*1.35;if(Math.abs(mv)>0.2){if(s!=='walk')setS(p,'walk');p.walk+=0.22*Math.sign(mv*p.face)}else if(s==='walk')setS(p,'idle')}}
function startAtk(g,p){const ks=['side','high','side'];p.atk={k:ks[p.ci%3],w:7};setS(p,'wind');p.sid++;p.q=0}
// ---- the opponent's mind ----
function eAI(g){const e=g.e,p=g.p,F=e.F,d=Math.abs(p.x-e.x),dir=Math.sign(p.x-e.x)||1;
  if(e.st==='idle'||e.st==='walk'){e.face=dir;e.cool--;const want=F.dist;
    if(d>want+12){e.x+=dir*F.spd;e.walk+=0.2;if(e.st!=='walk')setS(e,'walk')}else if(d<want-22){e.x-=dir*F.spd*0.7;e.walk-=0.2;if(e.st!=='walk')setS(e,'walk')}else if(e.st==='walk')setS(e,'idle');
    if((e.cool<=0&&d<want+40)||p.st==='pbreak'&&d<want+30){let c;do{c=F.combos[ri(0,F.combos.length-1)]}while(c===e.lastC&&F.combos.length>1);if(F.kit==='yan'&&d>120&&rnd()<0.5)c=['leap','side'];e.lastC=c;e.combo=c;e.ci=0;startStrike(g,e)}}}
function startStrike(g,e){const F=e.F,k=e.combo[e.ci];let w=(e.ci===0?F.w0:F.wn)*(e.phase2?0.8:1);if(PERIL[k])w+=10;if(k==='leap')w=46;w=Math.round(w);e.atk={k,w};setS(e,'wind');e.sid++;e.lunge=0;
  if(PERIL[k]){g.peril={t:0,k};snd('peril')}else{e.glint=0}if(k==='leap'){e.vy=-6.2;e.lx0=e.x}}
// ---- resolve a cut landing ----
function eStrike(g){const e=g.e,p=g.p,F=e.F,k=e.atk.k,d=Math.abs(p.x-e.x);mkArc(e,k,!!PERIL[k]);snd('swish');
  const last=e.ci>=e.combo.length-1;const reach=REACH[k];if(d>reach+10||p.st==='dead'||p.st==='kneel'){return}
  const since=g.T-p.par,inPar=(p.st==='parry'||p.st==='guard')&&since<=p.win,perf=since<=4;const cp=bladeW(p,0.6);
  if(p.st==='back'&&p.t<12){g.pops.add(p.x,FY-74,'闪','#'?0xc8e0ff:0,{size:11});return}
  if(k==='swp'){if(p.y<-8){g.pops.add(p.x,FY-90,'跃',0xffd0a0,{size:12});return}hurtP(g,F.dmg);return}
  if(k==='thr'){if((p.st==='parry'||p.st==='guard')&&since<=5){p.dfl=8;e.post+=F.bp*1.8;e.pt=0;g.stats.dfl++;g.stats.perf++;sparks(g,cp[0],cp[1],70,true);snd('perfect');g.stop=9;g.shake=4;g.pops.add(cp[0],cp[1]-18,'看破',0xff6a5a,{size:14,big:1});setS(e,'recoil');e.t=-20;return}hurtP(g,F.dmg+1);return}
  if(inPar){p.dfl=7;e.post+=F.bp*(perf?1.35:1)*(e.phase2?0.9:1);e.pt=0;p.post+=perf?2:6;g.stats.dfl++;if(perf)g.stats.perf++;sparks(g,cp[0],cp[1],perf?60:34,perf);snd(perf?'perfect':'clang');g.stop=perf?7:4;g.shake=perf?3:2;
    if(perf)g.pops.add(cp[0],cp[1]-16,'完美',0xffe0a0,{size:11});p.x-=e.face*-1*(perf?1.5:3)*-1;if(last){setS(e,'recoil');}return}
  if(p.st==='guard'||p.st==='parry'){p.post+=F.pd;g.parts.burst(cp[0],cp[1],10,2.5,[0xffd080,0xc8b0a0],{life:12,g:0.1});g.lights.push({x:cp[0],y:cp[1],r:50,c:0xffb060,k:0.6,t:0,l:6});snd('block');g.stop=3;p.x-=e.face*-4*-1;
    if(p.post>=100){p.post=60;setS(p,'pbreak');g.pops.add(p.x,FY-80,'失衡',0xff8a6a,{size:11})}return}
  hurtP(g,F.dmg*(p.st==='pbreak'?2:1))}
function hurtP(g,dmg){const p=g.p,e=g.e;p.hp=Math.max(0,p.hp-dmg);g.stats.hurt++;setS(p,'hurt');p.vx=e.face*2.6;inkSpray(g,p.x,FY+p.y-44,26,e.face);snd('hit');g.stop=7;g.shake=4;p.hit=6;S.flash=0.14;S.flashC=0x5a0810;
  if(p.hp<=0){setS(p,'kneel');g.state='dead';g.dt=0}}
function pStrike(g){const p=g.p,e=g.e,k=p.atk.k,d=Math.abs(p.x-e.x);mkArc(p,k,false);snd('swish');if(d>REACH[k]+6||!e||e.st==='kneel'||e.st==='dead'||e.st==='drop'||e.st==='bow')return;
  const cp=bladeW(p,0.8);
  if(e.st==='idle'||e.st==='walk'||e.st==='block'){e.blk++;if(e.blk>=3||e.hp<e.hpM*0.5&&e.blk>=2&&rnd()<0.6){// they deflect you and answer at once
      e.blk=0;sparks(g,cp[0],cp[1],40,false);snd('clang');g.stop=5;setS(p,'recoil');p.vx=-p.face*2;p.post+=12;e.combo=e.F.combos[ri(0,e.F.combos.length-1)];e.ci=0;e.face=Math.sign(p.x-e.x);startStrike(g,e);e.t=Math.round(e.atk.w*0.35);return}
    setS(e,'block');e.post+=5*(1.4-0.8*e.hp/e.hpM);e.pt=0;sparks(g,cp[0],cp[1],14,false);snd('block');g.stop=3;e.x+=p.face*3;return}
  // open: a real cut
  e.hp--;e.post+=8;e.pt=0;e.hit=5;inkSpray(g,cp[0],cp[1],18,p.face);snd('hit');g.stop=5;g.shake=2;e.blk=0;
  if(e.st==='rec'||e.st==='recoil'||e.st==='hurt'){setS(e,'hurt');e.x+=p.face*4}
  if(e.hp<=0){e.hp=0;setS(e,'broken');e.t=-9999}}
// ---- the finishing cut ----
function startKill(g){const p=g.p,e=g.e;g.state='kill';g.kt=0;setS(p,'dashW');setS(e,'broken');e.t=-9999;snd('draw');g.kx0=p.x}
function tickKill(g){const p=g.p,e=g.e,t=++g.kt;
  if(t===10){const x0=p.x,x1=e.x+p.face*74;g.ghosts=[];for(let i=0;i<7;i++)g.ghosts.push({x:lerp(x0,x1,i/7),a:1-i/8});p.x=x1;setS(p,'dash');
    const sy=FY-40;g.slash={x0:e.x-p.face*120,y0:sy+26,x1:e.x+p.face*120,y1:sy-26,t:0};g.freeze=1;g.ink=1;snd('kill')}
  if(t>10&&t<58){g.freeze=1}
  if(t===58){g.freeze=0;g.ink=0;g.slash=null;const ex=e.x,ey=FY-40;for(let i=0;i<4;i++)inkSpray(g,ex,ey-i*4,30,p.face);sparks(g,ex,ey,30,true);g.lseq=[1,0.3,0,1,0.8,0.6,0.4,0.25,0.12];g.li=0;g.lsnd=40;g.shake=6;
    for(const s of GR.L)if(s.lv===4&&!s.cut){const sx=s.x-g.camx;if(Math.abs(sx+g.camx-ex)<120){s.cut={y:rr(70,140),sl:rr(-0.5,0.5),dx:0,dy:0,rot:0,vr:0,vx:(s.x-ex)>0?0.4:-0.4,t:0}}}
    for(let i=0;i<40;i++)g.leaves.push({x:ex+rr(-140,140),y:rr(-20,60),vx:rr(-0.6,0.6),vy:rr(0.2,0.8),ph:rnd()*6,c:ri(0,2)});
    e.lives--;if(e.lives>0){setS(e,'kneel');e.revive=1}else setS(e,'kneel')}
  if(t===80)setS(p,'flick');if(t===104){setS(p,'shea')}
  if(t>104&&t<144){p.sheath=1-(t-104)/40}if(t===144){p.noBlade=true;p.sheath=null;snd('click');setS(p,'rest')}
  if(e.revive&&t===150){// the old master rises again, faster
    p.noBlade=false;p.sheath=null;setS(p,'idle');p.face=Math.sign(e.x-p.x)||1;e.revive=0;e.phase2=1;e.hp=e.hpM;e.post=0;setS(e,'rise');g.state='fight';g.pops.add(e.x,FY-96,'二式',0xff6a5a,{size:14,big:1});g.lt=40;g.rainK=1.4;return}
  if(t===190&&!e.revive){g.state='won';g.wt=0;g.sv.wins++;}}
// ---- one step ----
function tick(g,pad){g.T++;rainBed(g);if(!g.freeze){g.parts.tick();g.pops.tick()}g.shake*=0.86;g.gust*=0.96;g.wind=-0.08-0.06*Math.sin(g.T*0.004)-g.gust*0.05;
  if(g.T%46===0&&rnd()<0.55&&g.state!=='kill')snd('pluck');
  const p=g.p;
  if(g.state==='intro'){g.it++;if(g.it>40){if(p.x<170){p.x+=1.1;p.walk+=0.22;setS(p,'walk');p.t=0}else if(p.st==='walk')setS(p,'idle')}if(g.it===60){g.lseq=[1,0.2,0,0.9,0.7,0.5,0.3,0.15];g.li=0;g.lsnd=50}
    if(g.it>230||g.it>60&&(pad.a||pad.b)&&!g.auto){g.state='meet';g.mt=0;spawnFoe(g)}}
  else if(g.state==='meet'){g.mt++;const e=g.e;if(e.st==='walk'&&e.x>p.x+150){e.x-=0.9;e.walk+=0.18}else if(e.st==='walk')setS(e,'idle');
    if(e.st==='drop'){e.vy+=0.22;e.y+=e.vy;if(e.y>=0){e.y=0;setS(e,'idle');g.parts.burst(e.x,FY,20,2,[0x6a8a9a,0x4a6a7a],{life:20,g:0.05});g.shake=3}}
    if(e.st==='bow'&&g.mt>120)setS(e,'idle');if(p.st==='walk')setS(p,'idle');p.face=Math.sign(e.x-p.x)||1;
    if(g.mt>150){g.state='fight';g.stats.t0=g.stats.t0||g.T;e.cool=40}}
  else if(g.state==='fight')fight(g,pad);
  else if(g.state==='kill')tickKill(g);
  else if(g.state==='won'){g.wt++;const e=g.e;e.alpha=clamp(1-(g.wt-30)/90,0,1);if(g.wt===150){g.stage++;p.noBlade=false;setS(p,'idle');if(g.stage>=FOES.length){g.state='end';g.et=0;g.e=null;g.ttot=g.T-g.stats.t0;if(!g.sv.best||g.ttot<g.sv.best)g.sv.best=g.ttot;STORE.set('bamboo1',g.sv)}else{g.state='meet';g.mt=0;spawnFoe(g)}}}
  else if(g.state==='dead'){g.dt++;if(g.dt===170){// back to the start of this duel
      p.hp=p.hpM;p.post=0;setS(p,'idle');p.x=Math.max(60,p.x-40);g.state='meet';g.mt=60;spawnFoe(g);g.e.x=p.x+150;g.e.y=0;setS(g.e,'idle')}}
  else if(g.state==='end'){g.et++;g.rainK=Math.max(0,1-g.et/220);g.clear=clamp((g.et-60)/240,0,1);if(g.et===30)setS(p,'rest');if(g.et>200&&g.et<520&&p.x<AW-30){}
    if(g.et>140&&pad.a&&(!g.auto||g.et>560)){init(g);return}}
  // fighters: physics, poses, cloth
  for(const f of[p,g.e])if(f){f.t++;if(f.hit>0)f.hit--;if(f.dfl>0)f.dfl--;
    if(g.freeze)continue;
    if(f.st==='jump'||f.y<0){f.vy+=0.3;f.y+=f.vy;f.x+=f.vx;if(f.y>=0){f.y=0;f.vy=0;if(f.st==='jump'){setS(f,'idle');g.parts.burst(f.x,FY,8,1.2,[0x6a8a9a],{life:14,g:0.04})}}}
    else if(f.st==='hurt'||f.st==='recoil'||f.st==='back'){f.x+=f.st==='back'?-f.face*2.6*Math.max(0,1-f.t/14):f.vx;f.vx*=0.85}
    f.x=clamp(f.x,24,AW-24);pose(f,g);
    const v=(f.x-(f.px||f.x));f.px=f.x;f.flut[0]=lerp(f.flut[0],-v*5+g.wind*20+Math.sin(g.T*0.07+f.x)*1.2,0.12);f.flut[1]=lerp(f.flut[1],Math.abs(v)*-1.2,0.12);
    tickChains(f,g);if(f.arc){f.arc.t++;if(f.arc.t>9)f.arc=null}}
  // camera
  const e=g.e;let tx=e&&g.state!=='end'?(p.x+e.x)/2-W/2:p.x-W/2;if(g.state==='intro')tx=lerp(260,p.x-W/2+40,ease(g.it/200));if(g.state==='kill')tx=g.e.x-W/2;g.camx=clamp(lerp(g.camx,tx,0.08),0,AW-W);
  // lightning
  if(!g.freeze){g.lt--;if(g.lt<=0&&(g.state==='fight'||g.state==='meet')){g.lseq=[1,0.25,0,0.9,0.7,0.5,0.3,0.15];g.li=0;g.lsnd=ri(25,70);g.lt=e&&e.phase2?ri(180,360):ri(420,900)}
    if(g.lseq){g.lf=g.lseq[g.li++]||0;if(g.li===1){g.bolt=mkBolt()}if(g.li>g.lseq.length){g.lseq=null;g.lf=0;g.bolt=null}}
    if(g.lsnd>0&&--g.lsnd===0)snd('thunder')}
  if(!g.freeze){for(const l of g.lights)l.t++;g.lights=g.lights.filter(l=>l.t<l.l);for(const s of GR.L)if(s.cut&&!s.cut.gone){const c=s.cut;c.t++;if(c.t<16){c.dx+=c.vx*0.3;c.dy+=Math.abs(c.vx)*c.sl*0.3*Math.sign(c.vx)}else{c.vr+=0.0016*Math.sign(c.vx);c.rot+=c.vr;c.dx+=c.vx;c.dy+=0.5*c.t*0.02}if(c.t>150)c.gone=1}
    for(const l of g.leaves){l.ph+=0.08;l.x+=l.vx+Math.sin(l.ph)*0.6+g.wind*4;l.y+=l.vy;l.vy=Math.min(0.9,l.vy+0.01)}g.leaves=g.leaves.filter(l=>l.y<FY+30);if(g.T%14===0&&g.leaves.length<30)g.leaves.push({x:g.camx+rr(-40,W+40),y:-8,vx:rr(-0.3,0.3),vy:rr(0.2,0.5),ph:rnd()*6,c:ri(0,2)});
    for(const r of g.rip)r.t++;g.rip=g.rip.filter(r=>r.t<22)}
  if(g.peril){g.peril.t++;if(g.peril.t>36)g.peril=null}if(g.slash)g.slash.t++}
function fight(g,pad){const p=g.p,e=g.e;g.ftime=(g.ftime||0)+1;
  if(p.st!=='hurt'&&p.st!=='recoil'&&p.st!=='pbreak'&&p.st!=='kill')pInput(g,pad);
  if(p.st==='idle'||p.st==='walk')p.face=Math.sign(e.x-p.x)||1;
  // player timers
  if(p.st==='wind'&&p.t>=p.atk.w){setS(p,'strike');pStrike(g)}else if(p.st==='strike'&&p.t>=9){if(p.q&&p.ci<2){p.ci++;startAtk(g,p)}else setS(p,'rec')}else if(p.st==='rec'&&p.t>=12)setS(p,'idle');
  if(p.st==='wind'||p.st==='strike')p.x+=p.face*(p.t<4?1.2:0.3);
  if(p.st==='parry'&&p.t>=10)setS(p,'guard');if(p.st==='guard'&&p.t>=18)setS(p,'idle');if(p.st==='hurt'&&p.t>=20)setS(p,'idle');if(p.st==='recoil'&&p.t>=16)setS(p,'idle');if(p.st==='back'&&p.t>=16)setS(p,'idle');if(p.st==='pbreak'&&p.t>=54)setS(p,'idle');
  if(p.st!=='guard'&&p.st!=='parry'&&g.T-p.par>40)p.post=Math.max(0,p.post-0.22);
  // opponent timers
  eAI(g);const F=e.F;
  if(e.st==='wind'){const k=e.atk.k,d=Math.abs(p.x-e.x),dir=Math.sign(p.x-e.x)||1;e.face=dir;
    if(k==='leap'){const u=e.t/e.atk.w;e.x=lerp(e.lx0,p.x-dir*44,ease(u));e.y=-Math.sin(Math.PI*Math.min(1,u))*90}
    else{const rem=Math.max(1,e.atk.w-e.t),want=REACH[k]-16;if(d>want&&e.t>e.atk.w*0.45)e.x+=dir*Math.min(4,(d-want)/rem*1.4)}
    if(e.t===1&&!PERIL[k])g.glint={t:0};
    if(e.t>=e.atk.w){e.y=0;setS(e,'strike');eStrike(g)}}
  else if(e.st==='strike'){if(e.t>=10){if(e.ci<e.combo.length-1){e.ci++;startStrike(g,e)}else{setS(e,'rec');e.cool=ri(F.cool[0],F.cool[1])}}}
  else if(e.st==='rec'&&e.t>=F.rec*(e.phase2?0.75:1))setS(e,'idle');
  else if(e.st==='recoil'&&e.t>=30){setS(e,'idle');e.cool=ri(16,30)}
  else if(e.st==='block'&&e.t>=12){setS(e,'idle');e.cool=Math.min(e.cool,14)}
  else if(e.st==='hurt'&&e.t>=14){setS(e,'idle');e.cool=ri(6,14);e.blk=1}
  else if(e.st==='broken'&&e.t>=120){setS(e,'idle');e.post=e.postM*0.5;e.cool=10}
  else if(e.st==='rise'&&e.t>=70){setS(e,'idle');e.cool=30}
  if(e.post>=e.postM&&e.st!=='broken'){e.post=e.postM;setS(e,'broken');g.pops.add(e.x,FY-92,'破',0xff3a3a,{size:16,big:1});snd('peril');g.shake=3}
  e.pt++;if(e.pt>50&&e.st!=='broken')e.post=Math.max(0,e.post-0.16*(0.25+0.75*e.hp/e.hpM));
  // keep apart
  const dx=e.x-p.x;if(Math.abs(dx)<38&&e.y===0&&p.y===0){const push=(38-Math.abs(dx))/2*Math.sign(dx||1);e.x+=push;p.x-=push}
  if(g.glint)g.glint.t++}
function mkBolt(){const P=[];let x=rr(60,W-60),y=-4;P.push([x,y]);while(y<GH-20){x+=rr(-14,14);y+=rr(6,16);P.push([x,y])}return P}
// ---- autoplay ----
function ai(g){const pad={x:0,y:0,a:false,b:false,fire:false};const p=g.p,e=g.e,A=g.ai;
  if(g.state==='end'){if(g.et>570)pad.a=true;return pad}if(g.state!=='fight'||!e)return pad;
  const d=Math.abs(e.x-p.x),dir=Math.sign(e.x-p.x);
  if(e.st==='broken'){if(d>80)pad.x=dir;else pad.a=g.T%4===0;return pad}
  if(e.st==='wind'){const rem=e.atk.w-e.t,k=e.atk.k;if(A.sid!==e.sid){A.sid=e.sid;const r=rnd();A.act=k==='swp'?(r<0.95?'jump':'none'):k==='thr'?(r<0.82?'par':r<0.96?'back':'none'):(r<0.9?'par':r<0.98?'early':'none');if(A.act==='par'&&k==='thr')A.thr=1;else A.thr=0;A.at=A.act==='par'?(A.thr?ri(2,4):ri(2,8)):A.act==='early'?16:A.act==='jump'?ri(8,11):9}
    if(rem===A.at){if(A.act==='par'||A.act==='early')pad.b=true;else if(A.act==='jump')pad.y=-1;else if(A.act==='back')pad.y=1}return pad}
  if(e.st==='rec'||e.st==='recoil'||e.st==='hurt'){if(d>60)pad.x=dir;else if(g.T%7===0)pad.a=true;return pad}
  if(e.st==='strike'){return pad}
  if(d>84)pad.x=dir;else if(d<60)pad.x=-dir;else if(e.st==='idle'&&rnd()<0.012)pad.a=true;return pad}
// ================= drawing =================
function draw(g){const G=GR,T=g.T;const sh=g.shake>0.5?g.shake:0;const cx=Math.round(g.camx+(rnd()-0.5)*sh),cyo=Math.round((rnd()-0.5)*sh*0.6);g.cx=cx;
  // sky (clouds, or the clear moon at the end)
  const ck=Math.round(g.clear*256);if(ck)for(let i=0;i<GH*W;i++)col[i]=mx(G.sky[i],G.clr[i],ck);else col.set(G.sky);em.fill(0);LYB.fill(0,0,GH*W);
  for(let i=GH*W;i<W*H;i++){col[i]=0x101a1e;LYB[i]=4;em[i]=0}
  const mm=Math.round(G.MY);for(let y=mm-22;y<mm+22;y++)for(let x=G.MX-22;x<G.MX+22;x++){if(x<0||y<0)continue;const dm=Math.hypot(x-G.MX,(y-mm)*1.1);if(dm<(g.clear>0.5?22:15))em[y*W+x]=g.clear>0.5?160:90}
  if(g.bolt&&g.lf>0.5)bolt(g);
  // grove layers, mist between them
  for(const s of G.L)if(s.lv===1)stalk(s,cx,T,g);mist(g,cx,0.5,116,GH+2,0.22);
  for(const s of G.L)if(s.lv===2)stalk(s,cx,T,g);mist(g,cx,0.75,140,GH+4,0.3);shafts(g,cx);
  for(const s of G.L)if(s.lv===3)stalk(s,cx,T,g);
  ground(g,cx);mist(g,cx,1,170,GH+10,0.16);
  for(const s of G.L)if(s.lv===4)stalk(s,cx,T,g);
  // fighters, shadows first
  for(const f of[g.e,g.p])if(f&&f.alpha>0.02){const sx=Math.round(f.x-cx);shadow(sx+5,FY+1,f.y,f.alpha)}
  for(const gh of g.ghosts)if(g.state==='kill'&&g.kt<60)fig(g,g.p,cx,gh.x,0xa8d8ff,gh.a*0.45);
  if(g.e&&g.e.alpha>0.02)fig(g,g.e,cx);fig(g,g.p,cx);
  arcs(g,cx);
  reflect(g);
  {const xs=[g.p.x-cx];if(g.e)xs.push(g.e.x-cx);g.fx0=Math.min(...xs)-30;g.fx1=Math.max(...xs)+30}
  for(const s of G.L)if(s.lv===5)stalk(s,cx,T,g);
  // lightning / ink repaint by layer
  if(g.lf>0.02)remap(g.lf,LIGHT);if(g.ink)remap(1,INK);
  leavesFx(g,cx);rain(g,cx);
  g.parts.draw(cx,0);
  if(g.slash)slashFx(g,cx);
  lights(g,cx);
  if(cyo)shiftY(cyo);
  hud(g,cx);g.pops.draw(cx,0)}
function shiftY(d){if(d>0){col.copyWithin(d*W,0,(H-d)*W)}else{col.copyWithin(0,-d*W)}}
// moonlight falling in slanted shafts through the canopy
function shaftK(x,y,cx,T){const v=pm(x+y*0.55+cx*0.6+T*0.04,170);if(v>=38)return 0;return Math.sin(Math.PI*v/38)*(1-y/(FY+40))}
const SHT=new Float32Array(38);for(let i=0;i<38;i++)SHT[i]=Math.sin(Math.PI*(i+0.5)/38);
function shafts(g,cx){const T=g.T,k=1-g.clear*0.5;for(let y=0;y<FY;y++){const o=y*W,fy=(1-y/(FY+40))*64*k,ph=pm(y*0.55+cx*0.6+T*0.04,170);
    for(let b0=Math.floor(-ph/170)*170-ph;b0<W;b0+=170){for(let j=0;j<38;j++){const x=Math.round(b0+j);if(x<0||x>=W)continue;const i=o+x;col[i]=mx(col[i],0x9ab8c0,(SHT[j]*fy)|0)}}}}
function mist(g,cx,pf,y0,y1,k){const n1=GR.n1,T=g.T;for(let y=y0;y<Math.min(H,y1);y++){const ty=(y-y0)/(y1-y0),a0=ty*ty*k;const o=y*W;for(let x=0;x<W;x++){const nn=n1[((x+cx*pf+T*0.15*pf+y*3)|0)&2047];const a=a0*(0.55+nn*0.9);if(a<0.01)continue;const i=o+x;col[i]=mx(col[i],GR.FOG,Math.min(255,a*256)|0)}}}
function ground(g,cx){const G=GR,T=g.T;PUD.fill(0);const rows=G.rows;
  for(let y=GH;y<H;y++){const r=rows[G.rowOf[y]],o=y*W,C=G.GC[y],Pd=G.GP[y],u0=cx*r.pf+r.off;
    for(let x=0;x<W;x++){const u=Math.min(1399,(x+u0)|0),i=o+x;col[i]=C[u];PUD[i]=Pd[u];LYB[i]=4}}
  // fallen leaves on the stones
  K.setSeed(99);for(let i=0;i<70;i++){const wx=rr(0,AW*1.2),y=ri(GH+3,H-2),r=rows[G.rowOf[y]],x=Math.round(wx-cx*r.pf);if(x<0||x>=W)continue;const c=[0x3a4a1e,0x5a5a26,0x2a3a1a][i%3];K.line(x,y,x+ri(2,4),y+(i&1?1:-1),c)}K.setSeed((g.T*7)|0)}
function shadow(x,y,fy,a){const w=22+fy*0.12;for(let j=-3;j<=3;j++)for(let i=-w;i<=w;i++){if(i*i/(w*w)+j*j/9>1)continue;const X=x+i,Y=y+j;if(X<0||X>=W||Y<0||Y>=H)continue;const p=Y*W+X;if(LYB[p]===4)col[p]=mx(col[p],0x04080a,(110*a)|0)}}
function fig(g,f,cx,ox,tint,ta){if(!f.J)return;const k=f.k,J=f.J;const hx=ox!=null?ox:f.x,hy=FY+f.y-J.low;
  const chains=f.ch.map(c=>({pts:c.pts.map(q=>[q[0]-hx,q[1]-hy]),r0:c.r0,r1:c.r1,R:c.R,back:c.back}));
  SW.paint(J,k,{chains:ox!=null?[]:chains,flut:f.flut,T:g.T,noBlade:f.noBlade,sheath:f.sheath});
  const X0=Math.round(hx-cx)-SW.OX,Y0=Math.round(hy)-SW.OY,o=SW.out,oa=SW.oa,BW=SW.BW,BH=SW.BH;const al=ta!=null?ta:f.alpha,ht=f.hit>0&&(f.hit&1);
  for(let j=0;j<BH;j++){const Y=Y0+j;if(Y<0||Y>=H)continue;for(let i=0;i<BW;i++){const q=j*BW+i,A=oa[q];if(!A)continue;const X=X0+i;if(X<0||X>=W)continue;const p=Y*W+X;let c=o[q];
      if(ht)c=mx(c,0xffc8b8,80);if(tint!=null){col[p]=mx(col[p],tint,(al*200)|0);em[p]=60;continue}
      const a=A*al;if(a>=254){col[p]=c;em[p]=0;LYB[p]=6}else col[p]=mx(col[p],c,a|0)}}
  // the broken guard: a red mark on the chest
  if(f.st==='broken'&&g.state==='fight'){const mxp=Math.round(hx-cx+J.C[0]*0.6),myp=Math.round(hy+J.C[1]*0.6);const pul=0.6+0.4*Math.sin(g.T*0.3);K.glow(mxp,myp,10,0xff2030,pul*0.9);K.disc(mxp,myp,2.5,0xff4050,255);K.ring(mxp,myp,5+pul*2,1,0xff3040,200)}}
function arcs(g,cx){for(const f of[g.p,g.e])if(f&&f.arc){const A=f.arc,P=A.pts,fade=1-A.t/10;const c=A.red?0xff5a4a:0xd8f0ff;
    for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1];const age=(P.length-1-i)/P.length;const al=fade*(1-age*0.7);if(al<=0.05)continue;
      quad([[a[0]-cx,a[1]],[b[0]-cx,b[1]],[b[2]-cx,b[3]],[a[2]-cx,a[3]]],c,al*0.42,(al*90)|0);const ma=[(a[0]*3+a[2])/4-cx,(a[1]*3+a[3])/4],mb=[(b[0]*3+b[2])/4-cx,(b[1]*3+b[3])/4];quad([[a[0]-cx,a[1]],[b[0]-cx,b[1]],mb,ma],0xffffff,al*0.7,(al*230)|0)}}}
function quad(P,c,a,e){let y0=1e9,y1=-1e9;for(const p of P){y0=Math.min(y0,p[1]);y1=Math.max(y1,p[1])}const n=P.length,xs=[];const A=(a*256)|0;
  for(let y=Math.max(0,Math.floor(y0));y<=Math.min(H-1,Math.ceil(y1));y++){const sy=y+0.5;xs.length=0;for(let i=0;i<n;i++){const p=P[i],q=P[(i+1)%n];if((p[1]<=sy)!==(q[1]<=sy))xs.push(p[0]+(sy-p[1])/(q[1]-p[1])*(q[0]-p[0]))}xs.sort((a,b)=>a-b);
    for(let k=0;k+1<xs.length;k+=2)for(let x=Math.max(0,Math.round(xs[k]));x<Math.min(W,Math.round(xs[k+1]));x++){const i=y*W+x;col[i]=mx(col[i],c,A);if(e)em[i]=Math.max(em[i],e)}}}
// puddles: mirror what stands on the line above them, rippled; ground mirrored as dark sky
function reflect(g){const T=g.T;for(let y=GH+1;y<H;y++){const ml=y>FY?FY:GH+5,sy0=2*ml-y;const o=y*W;const wob=Math.sin(y*0.9+T*0.12)*1.2;for(let x=0;x<W;x++){const i=o+x,pd=PUD[i];if(!pd||LYB[i]!==4)continue;
      let sx=Math.round(x+wob+Math.sin((x+y*3)*0.15+T*0.08)*0.6),sy=sy0;if(sy<0)sy=0;if(sx<0)sx=0;if(sx>=W)sx=W-1;const si=sy*W+sx;let c=LYB[si]===4?0x16242e:col[si];
      c=mx(mx(c,0x0a1418,90),0x3a5a70,24);col[i]=mx(col[i],c,pd===1?150:pd===2?200:225);if(em[si]&&LYB[si]!==4)em[i]=em[si]>>1}}
  for(const r of g.rip){const rr_=r.t*0.4,a=Math.round(140*(1-r.t/22));for(let k=0;k<20;k++){const an=k/20*Math.PI*2,x=Math.round(r.x+Math.cos(an)*rr_*2.4),y=Math.round(r.y+Math.sin(an)*rr_*0.7);if(x<0||y<0||x>=W||y>=H)continue;const i=y*W+x;if(PUD[i])col[i]=mx(col[i],0x9ab8c8,a)}}}
// layer remaps: lightning silhouettes and the finishing cut's ink painting
const LIGHT=[0xdce8f4,0xaabccc,0x70808e,0x2c3642,0,0x0c1016,0x04060a,0x000000],INKP=[0xece4d0,0xd6ceba,0xb2aa98,0x868072,0,0x4a443c,0x14100c,0x080604];const INK=INKP;
function remap(k,TB){const A=Math.min(255,(k*256)|0),ink=TB===INK;for(let y=0;y<H;y++){const o=y*W;for(let x=0;x<W;x++){const i=o+x,l=LYB[i];let c;
      if(l===4){const v=col[i];const lum=((v>>16&255)*0.3+(v>>8&255)*0.55+(v&255)*0.15);c=ink?(PUD[i]?mix(0xd8d0bc,0x5a544a,clamp(1-lum/90,0,1)):mix(0xc4bca8,0x8a8270,hash(x>>2,y)*0.5)):(PUD[i]?0x8a9cae:mix(v,0x4a5a68,0.6))}
      else c=TB[l];
      // a bright rim where a nearer thing meets something farther above-left of it
      if(l>=5&&y>0&&x>0){const u=LYB[i-W-1];if(u<l&&u!==4)c=ink?0x2a2420:0xffffff}
      if(ink&&l<4)c=mix(c,0xb8b0a0,hash(x,y*3)*0.12);
      col[i]=A>=255?c:mx(col[i],c,A)}}}
function bolt(g){const P=g.bolt;for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1];const n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1]));for(let s=0;s<=n;s++){const x=Math.round(lerp(a[0],b[0],s/n)),y=Math.round(lerp(a[1],b[1],s/n));for(let d=-1;d<=1;d++){const X=x+d;if(X<0||X>=W||y<0||y>=H)continue;const q=y*W+X;col[q]=d?0xc8d8ff:0xffffff;em[q]=255}}}}
function rain(g,cx){const T=g.T,fz=g.freeze,k=g.rainK;if(k<=0.01)return;const lf=g.lf;const PF=[0.4,0.8,1.15],LEN=[4,7,11],AL=[50,80,120],SP=[4.5,7,10];
  const n=Math.round(g.rain.length*Math.min(1,k));for(let j=0;j<n;j++){const d=g.rain[j];if(!fz){d.y+=SP[d.z];d.x+=-1.2*SP[d.z]*0.12+d.ex;d.y+=d.ey;d.ex*=0.88;d.ey*=0.88;
      if(d.y>(d.z===2?H:d.z===1?FY+10:GH+10)){if(d.z>=1&&rnd()<0.5){const sx=pm(d.x-cx*PF[d.z],W+60)-30,sy=d.z===2?ri(FY+2,H-2):ri(GH+4,FY);if(sx>=0&&sx<W){const pi=sy*W+(sx|0);if(PUD[pi]&&g.rip.length<60)g.rip.push({x:sx,y:sy,t:0});else K.px(sx,sy-1,0x8aa0b0)}}d.y=rr(-30,-4);d.x=rr(0,W+60)+cx*PF[d.z]*0}}
    const x=pm(d.x-cx*PF[d.z],W+60)-30,y=d.y;const L=fz?1:LEN[d.z]*(k>1?1.3:1);const a=Math.min(255,AL[d.z]*(1+lf*2.2+(y>0&&y<FY?shaftK(x,y,cx,T)*1.6:0))*(g.ink?1.4:1));const c=g.ink?0x3a3430:lf>0.3?0xffffff:0xb8d0e4;
    for(let s=0;s<L;s++){const X=Math.round(x-s*0.15),Y=Math.round(y-s);if(X<0||X>=W||Y<0||Y>=H)continue;const i=Y*W+X;col[i]=mx(col[i],c,a|0)}}}
function pm(a,m){return((a%m)+m)%m}
function leavesFx(g,cx){const C=[0x4a6a2a,0x6a7a30,0x3a5a2a];for(const l of g.leaves){const x=Math.round(l.x-cx),y=Math.round(l.y);const s=Math.sin(l.ph*1.7);const dx=Math.round(s*2),dy=s>0?1:-1;K.line(x-dx,y,x+dx,y+dy,g.ink?0x5a5248:C[l.c])}}
function slashFx(g,cx){const s=g.slash,t=s.t;const x0=s.x0-cx,y0=s.y0,x1=s.x1-cx,y1=s.y1;const L=Math.min(1,t/5);const ex=lerp(x0,x1,L),ey=lerp(y0,y1,L);const dx=x1-x0,dy=y1-y0,ln=Math.hypot(dx,dy),nx=-dy/ln,ny=dx/ln;
  // a dry brush stroke in red ink, ragged at the edges, with a black core
  const n=Math.ceil(ln*L);for(let i=0;i<=n;i++){const u=i/Math.max(1,ln),px_=x0+dx/ln*i,py=y0+dy/ln*i;const wd=(Math.sin(Math.PI*Math.min(1,u))*11+1.5)*(1+0.25*Math.sin(i*0.37)+0.15*Math.sin(i*1.3));
    for(let q=-wd;q<=wd;q+=0.6){const X=Math.round(px_+nx*q),Y=Math.round(py+ny*q);if(X<0||Y<0||X>=W||Y>=H)continue;if(Math.abs(q)>wd*0.6&&hash(i>>1,Math.round(q*2))<0.35)continue;const p=Y*W+X;col[p]=Math.abs(q)<wd*0.25?0x1a0408:0xc8141e;em[p]=Math.abs(q)<wd*0.25?0:80}}
  if(t>6){const a=clamp((t-6)/8,0,1);K.text('斩',W-70,40,0xc8141e,{size:44,bold:true,fam:'kai',a})}}
function lights(g,cx){for(const l of g.lights){const k=l.k*(1-l.t/l.l),x=l.x-cx,y=l.y,r=l.r,cr=(l.c>>16&255),cg=(l.c>>8&255),cb=l.c&255;
    for(let Y=Math.max(0,Math.floor(y-r));Y<Math.min(H,Math.ceil(y+r));Y++)for(let X=Math.max(0,Math.floor(x-r));X<Math.min(W,Math.ceil(x+r));X++){const d=Math.hypot(X-x,Y-y)/r;if(d>=1)continue;const f=(1-d)*(1-d)*k;const i=Y*W+X,c=col[i];
      const R=(c>>16&255),G_=(c>>8&255),B=c&255;col[i]=(Math.min(255,R+(R*cr/255*1.2+cr*0.12)*f)<<16)|(Math.min(255,G_+(G_*cg/255*1.2+cg*0.12)*f)<<8)|Math.min(255,B+(B*cb/255*1.2+cb*0.12)*f)}}}
// ---- HUD: posture bars grow from the centre, names in brush script ----
function hud(g,cx){const p=g.p,e=g.e;const st=g.state;
  if(st==='intro'){const a=clamp((g.it-50)/30,0,1)*clamp((220-g.it)/30,0,1);if(a>0){for(let y=50;y<142;y++){const e=Math.min(1,(y-50)/24,(142-y)/24);K.recta(0,y,W,1,0x04070a,a*0.5*e)}K.text('竹林雨夜',W/2,70,0xe8eef0,{size:40,bold:true,fam:'kai',align:'c',ink:0x0a0e12,a,sp:6});K.text('三场决斗 · 听刀声，看破来招',W/2,122,0xa8bcc8,{size:11,align:'c',a})}}
  if(st==='meet'&&e){const a=clamp(g.mt/20,0,1)*clamp((150-g.mt)/20,0,1);if(a>0){const F=FOES[g.stage];K.text(['壹','贰','叁'][g.stage],W/2-62,56,0xfff0e8,{size:12,bold:true,align:'c',a});
      K.rect(W/2-70,52,16,18,0xb0141e);K.text(['壹','贰','叁'][g.stage],W/2-62,54,0xfff0e8,{size:12,bold:true,align:'c',a});K.text(F.name,W/2+8,40,0xf0f0f0,{size:36,bold:true,fam:'kai',align:'c',ink:0x08080c,a,sp:8});K.text(F.title,W/2+8,84,0xa8bcc8,{size:11,align:'c',a})}}
  if((st==='fight'||st==='kill'||st==='meet'&&g.mt>100)&&e){const F=e.F;K.text(F.name,16,10,0xe8e8e8,{size:13,bold:true,fam:'kai',ink:0x08080c});for(let i=0;i<e.lives;i++)K.disc(58+i*8,18,2.5,0xd82030);
    UI.bar(16,30,90,4,e.hp/e.hpM,0xc83a3a,0x1a1418);pbar(W/2,16,e.post/e.postM,e.st==='broken',g.T);
    K.text('你',16,H-34,0xe8e8e8,{size:11,bold:true,fam:'kai',ink:0x08080c});UI.bar(16,H-18,90,4,p.hp/p.hpM,0xd8e4ec,0x1a1418);pbar(W/2,H-14,p.post/100,p.st==='pbreak',g.T)}
  if(g.peril&&g.e){const a=clamp(1-g.peril.t/36,0,1)*clamp(g.peril.t/3,0,1);const x=g.e.x-cx,y=FY-112;K.glow(x,y+10,22,0xff2020,a*0.8);K.text('危',x,y,0xff2a2a,{size:24,bold:true,fam:'kai',align:'c',ink:0x200000,a,em:200})}
  if(g.glint&&g.e&&g.e.st==='wind'&&g.glint.t<10){const b=bladeW(g.e,0.92);const x=Math.round(b[0]-cx),y=Math.round(b[1]),s=g.glint.t<5?g.glint.t:10-g.glint.t;for(let i=-s*2;i<=s*2;i++){K.px(x+i,y,0xffffff,255);K.px(x,y+i,0xffffff,255)}K.px(x-1,y-1,0xffffff,200);K.px(x+1,y+1,0xffffff,200)}
  if(st==='dead'){const a=clamp((g.dt-20)/30,0,1);for(let i=0;i<W*H;i++){const c=col[i];const l=((c>>16&255)*0.3+(c>>8&255)*0.55+(c&255)*0.15)|0;col[i]=mx(c,(l<<16)|(l<<8)|l,(a*200)|0)}K.text('死',W/2,80,0xc8101c,{size:64,bold:true,fam:'kai',align:'c',a,em:120});K.text('再来',W/2,160,0xd8d0c8,{size:12,align:'c',a})}
  if(st==='end'){const a=clamp((g.et-100)/40,0,1);if(a>0){K.text('雨歇',W/2,52,0xf4f4ec,{size:40,bold:true,fam:'kai',align:'c',ink:0x0a0e12,a,sp:10});const s=g.stats,tt=Math.round((g.ttot||0)/60);
      K.text('用时 '+Math.floor(tt/60)+':'+String(tt%60).padStart(2,'0')+'   弹刀 '+s.dfl+'   完美 '+s.perf+'   受伤 '+s.hurt,W/2,104,0xc8d8e0,{size:11,align:'c',a,ink:0x0a0e12});if(g.et>200)K.text(g.auto?'演示中':'按 J 再来一次',W/2,124,0x8aa0b0,{size:10,align:'c',a})}}}
function pbar(x,y,t,br,T){const w=Math.round(70*clamp(t,0,1));K.rect(x-72,y-1,144,5,0x08080c);K.rect(x-71,y,142,3,0x1c1820);if(w>0){const c=br?((T>>2)&1?0xff3030:0xffe0a0):t>0.75?0xff6a2a:0xf0b040;K.rect(x-w,y,w*2,3,c,br?200:60);K.rect(x-w,y,w*2,1,mix(c,0xffffff,0.4))}K.rect(x,y-2,1,7,0xe8d8b0)}
function info(g){const s=g.stats;return(g.e?'第'+(g.stage+1)+'战 '+FOES[Math.min(g.stage,2)].name+' · ':'')+'弹刀 '+s.dfl+' · 完美 '+s.perf+(g.sv&&g.sv.best?' · 最快 '+Math.round(g.sv.best/60)+'s':'')}
return{init,tick,draw,ai,info,SW,PO}})();



// ================= 云海: a side-scrolling shoot-'em-up above a sea of clouds at sunset, ending with a sky fortress =================
// Cloud layers are baked once as wrap-around panoramas: puffs are stamped into a height field, then lit by the low sun on the right
// in a few flat tones with gold rims. The fortress is painted part by part each frame, and every part can be shot off.
const SK=(function(){const {W,H,S,mix,clamp,lerp,hash,rnd,rr,ri,vnoise}=K;const col=S.col,em=S.em;
const mx=(a,b,t)=>{const ar=a>>16&255,ag=a>>8&255,ab=a&255;return((ar+(((b>>16&255)-ar)*t>>8))<<16)|((ag+(((b>>8&255)-ag)*t>>8))<<8)|(ab+(((b&255)-ab)*t>>8))};
const CWID=960,SUNX=410,SUNY=168;
let BK=null;
function bake(){if(BK)return BK;K.setSeed(5151);
  // sky
  const SKY=new Uint32Array(W*H);for(let y=0;y<H;y++){const t=y/H;const c=t<0.45?mix(0x1e2260,0x8a3a78,t/0.45):t<0.68?mix(0x8a3a78,0xf07a5a,(t-0.45)/0.23):mix(0xf07a5a,0xffc078,(t-0.68)/0.32);
    for(let x=0;x<W;x++){const dx=x-SUNX,dy=y-SUNY,d=Math.hypot(dx,dy);let k=c;if(d<120)k=mx(k,0xffe0a0,((1-d/120)**2*170)|0);// warm haze around the sun
      const an=Math.atan2(dy,dx);if(d>30&&Math.sin(an*14)>0.6&&y<SUNY)k=mx(k,0xffd8a0,Math.max(0,(1-d/420)*18)|0);SKY[y*W+x]=k}}
  // thin high streaks
  for(let i=0;i<14;i++){const y=ri(20,110),x0=ri(-40,W),L=ri(60,180);for(let x=x0;x<x0+L;x++){if(x<0||x>=W)continue;const a=Math.sin((x-x0)/L*Math.PI);SKY[y*W+x]=mx(SKY[y*W+x],0xffb8a0,(a*90)|0);if(a>0.5)SKY[(y+1)*W+x]=mx(SKY[(y+1)*W+x],0xc8708a,(a*50)|0)}}
  // a cloud bank: a wavy top line crowned with small puffs (a height field), a soft body below; lit from the sun on the right in flat tones
  function layer(y0,amp,rmin,rmax,n,pal,seed,dark){K.setSeed(seed);const LH=H,HF=new Float32Array(CWID*LH),A=new Uint8Array(CWID*LH),C=new Uint32Array(CWID*LH);
    const nz=x=>{const t=x/CWID;return vnoise(x*0.006,seed,1)*(1-t)+vnoise((x-CWID)*0.006,seed,1)*t};const top=new Float32Array(CWID);for(let x=0;x<CWID;x++)top[x]=y0-amp*nz(x);
    for(let i=0;i<n*1.6;i++){const inner=i>=n;const x=rr(0,CWID),r=rr(rmin,rmax)*(0.6+0.6*nz(x|0))*(inner?0.8:1),y=top[x|0]+(inner?r*rr(1.2,3.5):r*rr(0.1,0.5));const base=inner?(y-top[x|0])*0.25:0;
      for(let j=-r;j<=r;j++)for(let q=-r;q<=r;q++){const d2=q*q+j*j;if(d2>r*r)continue;const X=(((x+q)|0)%CWID+CWID)%CWID,Y=(y+j)|0;if(Y<0||Y>=LH)continue;const h=Math.sqrt(r*r-d2)+base;const k=Y*CWID+X;if(h>HF[k])HF[k]=h}}
    for(let X=0;X<CWID;X++)for(let Y=Math.max(0,top[X]+rmin|0);Y<LH;Y++){const k=Y*CWID+X,h=(Y-top[X])*0.25;if(h>HF[k])HF[k]=h}
    const L=[0.55,-0.55,0.63];for(let Y=1;Y<LH-1;Y++)for(let X=0;X<CWID;X++){const k=Y*CWID+X,h=HF[k];if(h<=0)continue;const hx=HF[Y*CWID+(X+1)%CWID]-HF[Y*CWID+(X-1+CWID)%CWID],hy=HF[k+CWID]-HF[k-CWID];
      let nx=-hx*0.5,ny=-hy*0.5,nzz=1;const nl=Math.hypot(nx,ny,nzz);nx/=nl;ny/=nl;nzz/=nl;const lit=nx*L[0]+ny*L[1]+nzz*L[2];const edge=HF[k-CWID]<=0||HF[Y*CWID+(X+1)%CWID]<=0;
      let t=edge&&nx>0.1?0:lit>0.9?1:lit>0.6?2:lit>0.3?3:4;const depth=(Y-top[X])/(dark||40);if(depth>1.2)t=Math.max(t,3);if(depth>2.2)t=4;C[k]=pal[t];A[k]=255}
    return{A,C}}
  const L0=layer(200,18,5,12,260,[0xffe0c0,0xf4b49a,0xd88c96,0xa8708e,0x86608e],11,30);
  const L1=layer(222,22,6,15,300,[0xfff0cc,0xffc898,0xf09a82,0xb86c82,0x8a5280],12,34);
  const L2=layer(246,16,8,20,340,[0xfff6d8,0xffd4a0,0xf8a282,0xc46e7c,0x7e4672],13,30);
  const L3=layer(266,10,10,24,120,[0xfff6e0,0xffdab0,0xf4aa90,0xc87a88,0x8a5a7a],14,20);
  BK={SKY,L0,L1,L2,L3};return BK}
function drawLayer(Lr,off,alpha){const {A,C}=Lr,o=((Math.floor(off)%CWID)+CWID)%CWID;for(let y=0;y<H;y++){const ro=y*CWID,so=y*W;for(let x=0;x<W;x++){const k=ro+(x+o)%CWID,a=A[k];if(!a)continue;const i=so+x;col[i]=a===255&&alpha>=255?C[k]:mx(col[i],C[k],(a*alpha/255)|0)}}}
// ---------------- game state ----------------
function init(g){bake();g.T=0;g.sv=STORE.get('sky1',{best:0});g.parts=Parts();g.pops=Pops();g.p={x:70,y:130,vx:0,vy:0,inv:120,lives:3,pow:1,bombs:2,dead:0,bank:0};g.pb=[];g.eb=[];g.en=[];g.items=[];g.fx=[];g.score=0;g.chain=0;g.chT=0;
  g.st=0;g.state='play';g.boss=null;g.shake=0;g.flash=0;g.bomb=0;g.scroll=0;g.ai={tx:70,ty:130};g.res=0;g.smoke=[];g.birds=[];for(let i=0;i<8;i++)g.birds.push({x:rr(0,W),y:rr(40,140),ph:rnd()*6,s:rr(0.3,0.7)})}
function snd(n){if(!K.live())return;const t=K.now();
  if(n==='shot'){if(SFX.ok('shot',0.07))K.tone('square',1200,900,0.04,0.012,t)}
  else if(n==='hit'){if(SFX.ok('hit',0.04))K.noise(0.04,0.04,t,'highpass',3000,2000,1)}
  else if(n==='pop'){K.noise(0.25,0.14,t,'lowpass',1400,200,0.8);K.tone('sine',140,60,0.25,0.08,t)}
  else if(n==='big'){K.noise(1.2,0.26,t,'lowpass',900,50,0.6);K.tone('sine',90,30,1,0.15,t)}
  else if(n==='pow'){[784,988,1175,1568].forEach((f,i)=>K.tone('square',f,f,0.07,0.04,t+i*0.05))}
  else if(n==='die'){K.noise(0.8,0.2,t,'lowpass',2000,100,0.7);K.tone('sawtooth',400,60,0.8,0.08,t)}
  else if(n==='bomb'){K.noise(1.6,0.24,t,'bandpass',300,3000,0.6);K.tone('sine',60,200,1.2,0.12,t)}
  else if(n==='warn'){for(let i=0;i<3;i++)K.tone('square',220,220,0.25,0.05,t+i*0.4)}
  else if(n==='eshot'){if(SFX.ok('es',0.1))K.tone('triangle',500,300,0.08,0.02,t)}}
function beds(g){if(!K.live()||g.thumb)return;K.bed('wind','bandpass',600,0.6);K.bedSet('wind',0.06,500+Math.sin(g.T*0.01)*150);K.bed('prop','bandpass',140,6);K.bedSet('prop',g.p.dead?0:0.03,130+g.p.vx*20)}
// ---------------- stage script ----------------
const WAVES=[];const at=(t,f)=>WAVES.push({t,f});
for(let i=0;i<5;i++)at(120+i*16,g=>spawn(g,'gyro',W+10,70+Math.sin(i)*20,{ph:i*0.6}));
for(let i=0;i<5;i++)at(320+i*16,g=>spawn(g,'gyro',W+10,190,{ph:i*0.6,amp:-1}));
at(520,g=>{for(let i=0;i<6;i++)spawn(g,'kite',W+10+i*18,40+i*14,{})});
at(700,g=>spawn(g,'balloon',W+20,90,{}));at(760,g=>spawn(g,'balloon',W+20,170,{}));at(820,g=>spawn(g,'balloon',W+20,120,{}));
at(900,g=>spawn(g,'gunboat',W+40,110,{}));
for(let i=0;i<8;i++)at(1150+i*12,g=>spawn(g,'gyro',W+10,40+i*26,{ph:i}));
at(1350,g=>{for(let i=0;i<6;i++)spawn(g,'kite',W+10+i*18,230-i*14,{})});
at(1500,g=>spawn(g,'gunboat',W+40,70,{}));at(1560,g=>spawn(g,'gunboat',W+40,190,{}));
for(let i=0;i<4;i++)at(1800+i*40,g=>spawn(g,'balloon',W+20,60+i*45,{}));
for(let i=0;i<10;i++)at(1980+i*10,g=>spawn(g,'gyro',W+10,135+Math.sin(i*0.8)*80,{ph:i,amp:0.5}));
at(2250,g=>{for(let i=0;i<8;i++)spawn(g,'kite',W+10+i*14,60+i*20,{})});
at(2500,g=>{g.warn=200;snd('warn')});at(2700,g=>startBoss(g));
const HP={gyro:3,kite:2,balloon:6,gunboat:60};
function spawn(g,kind,x,y,o){g.en.push(Object.assign({kind,x,y,x0:x,y0:y,t:0,hp:HP[kind],r:kind==='gunboat'?22:kind==='balloon'?12:8,flash:0},o))}
// ---------------- boss: 天穹号 ----------------
function startBoss(g){g.boss={x:W+180,y:120,t:0,ph:0,dead:0,parts:{cannon:{hp:220,ox:-118,oy:22,r:12,alive:true},tL:{hp:120,ox:-50,oy:66,r:9,alive:true},tR:{hp:120,ox:30,oy:66,r:9,alive:true},propU:{hp:90,ox:60,oy:-56,r:12,alive:true},propD:{hp:90,ox:70,oy:68,r:12,alive:true},core:{hp:460,ox:-126,oy:-12,r:15,alive:true,shield:true}}}}
function bossTick(g){const B=g.boss;B.t++;const P=B.parts;
  if(B.dead){B.dead++;B.y+=0.25+B.dead*0.004;B.x+=0.1;B.tilt=(B.tilt||0)+0.0006;if(B.dead%6===0){const px_=B.x+rr(-120,110),py_=B.y+rr(-50,50);boom(g,px_,py_,rr(10,22));if(B.dead%18===0)snd('pop')}if(B.dead%3===0)g.smoke.push({x:B.x+rr(-100,100),y:B.y+rr(-40,40),r:rr(6,12),t:0,l:ri(60,90),vx:rr(-1.2,-0.4),vy:rr(-0.6,-0.1),dark:1})
    if(B.dead===220){g.flash=30;S.flash=1;S.flashC=0xfff0d0;snd('big');boom(g,B.x,B.y,60)}if(B.dead>420){g.state='clear';g.ct=0;if(g.score>(g.sv.best||0)){g.sv.best=g.score;if(!g.auto)STORE.set('sky1',g.sv)}}return}
  // fly in, then hang ahead of you, bobbing
  const tx=W-150,ty=125+Math.sin(B.t*0.012)*30;B.x=lerp(B.x,tx,0.012);B.y=lerp(B.y,ty,0.03);
  const tAlive=P.tL.alive||P.tR.alive;P.core.shield=P.cannon.alive||tAlive;B.ph=P.core.shield?1:2;const pl=g.p;
  const wp=k=>[B.x+P[k].ox,B.y+P[k].oy];
  // turrets: aimed three-way bursts
  for(const k of['tL','tR'])if(P[k].alive&&B.t%90===(k==='tL'?0:45)&&B.t>120){const [x,y]=wp(k);const a=Math.atan2(pl.y-y,pl.x-x);for(let i=-1;i<=1;i++)eshot(g,x,y,a+i*0.18,2.2,0)}
  // the bow cannon: a slow shell that bursts into a ring
  if(P.cannon.alive&&B.t%150===70){const [x,y]=wp('cannon');g.eb.push({x:x-14,y,vx:-2.2,vy:(pl.y-y)*0.008,r:6,shell:40,c:1});g.fx.push({k:'muz',x:x-16,y,t:0});snd('pop')}
  // phase 2: the core opens and sprays spirals; the propeller pods fire streams
  if(B.ph===2){if(B.t%5===0){const [x,y]=wp('core');for(let s=0;s<3;s++){const a=B.t*0.07+s*2.094;eshot(g,x,y,a,1.6,2)}}
    for(const k of['propU','propD'])if(P[k].alive&&B.t%40<12&&B.t%4===0){const [x,y]=wp(k);eshot(g,x-10,y,Math.PI+rr(-0.25,0.25),3,1)}}
  if(!P.core.alive&&!B.dead){B.dead=1;g.eb=[];snd('big');g.shake=8;add(g,50000,B.x,B.y-40)}}
function eshot(g,x,y,a,v,c){g.eb.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,r:3,c:c||0});snd('eshot')}
function boom(g,x,y,s){g.fx.push({k:'boom',x,y,s,t:0});for(let i=0;i<s*1.2;i++){const a=rnd()*6.283,v=rr(0.5,1.6)*s*0.09;g.parts.add(x,y,Math.cos(a)*v-1,Math.sin(a)*v,i%3?0xffb040:0xffffff,{life:ri(14,30),g:0.04,dr:0.93,e:200,c2:0x8a3a2a})}
  for(let i=0;i<Math.ceil(s/4);i++)g.smoke.push({x:x+rr(-s*0.3,s*0.3),y:y+rr(-s*0.3,s*0.3),r:rr(s*0.25,s*0.45),t:0,l:ri(40,70),vx:rr(-1.4,-0.6),vy:rr(-0.5,0),dark:rnd()<0.5?1:0})}
function add(g,v,x,y){const m=1+Math.min(9,g.chain/10|0);const p=v*m;g.score+=p;if(x!=null)g.pops.add(x,y,String(p),0xfff0c0,{life:36})}
// ---------------- tick ----------------
function tick(g,pad){g.T++;beds(g);g.parts.tick();g.pops.tick();g.shake*=0.86;if(g.flash>0)g.flash--;if(g.warn>0)g.warn--;g.scroll+=1;
  for(const w of WAVES)if(w.t===g.st)w.f(g);if(g.state==='play')g.st++;
  const p=g.p;
  if(g.state==='clear'){g.ct++;if(g.ct>120&&pad.a&&(!g.auto||g.ct>420)){init(g);return}}
  if(g.state==='over'){g.ct++;if(g.ct>90&&pad.a&&(!g.auto||g.ct>300)){init(g);return}}
  // the player plane: momentum, banking, auto-fire, a bomb that is a wall of wind
  if(!p.dead&&g.state!=='over'){const sp=pad.fire&&!g.auto?1.6:2.6;p.vx=lerp(p.vx,(pad.x||0)*sp,0.35);p.vy=lerp(p.vy,(pad.y||0)*sp,0.35);p.x=clamp(p.x+p.vx,10,W-20);p.y=clamp(p.y+p.vy,12,H-14);p.bank=lerp(p.bank,p.vy,0.2);
    if(g.state==='play'&&g.T%5===0){const n=p.pow;const sh=(dy,vy)=>g.pb.push({x:p.x+10,y:p.y+dy,vx:9,vy,dmg:1});sh(0,0);if(n>=2){sh(-4,-0.5);sh(4,0.5)}if(n>=3){sh(-7,-1.2);sh(7,1.2)}if(n>=4&&g.T%10===0){g.pb.push({x:p.x+4,y:p.y,vx:5,vy:0,dmg:3,homing:1})}snd('shot')}
    if(pad.b&&p.bombs>0&&!g.bomb){p.bombs--;g.bomb=70;snd('bomb');g.shake=6;S.flash=0.6;S.flashC=0xffffff}}
  else if(p.dead){p.dead++;if(p.dead>90){if(p.lives>0){p.dead=0;p.inv=150;p.x=60;p.y=130}else if(g.state==='play'){g.state='over';g.ct=0}}}
  if(p.inv>0)p.inv--;
  if(g.bomb){g.bomb--;const bx=p.x+(70-g.bomb)*8;g.eb=g.eb.filter(b=>b.x>bx||b.x<p.x-20);for(const e of g.en)if(e.x<bx&&e.x>p.x)hurt(g,e,1.5);if(g.boss&&!g.boss.dead)for(const k in g.boss.parts){const q=g.boss.parts[k];if(q.alive&&g.boss.x+q.ox<bx)partHit(g,q,k,0.6)}}
  if(g.chT>0)g.chT--;else g.chain=0;
  // bullets
  for(const b of g.pb){if(b.homing){let best=null,bd=1e9;for(const e of g.en){const d=Math.hypot(e.x-b.x,e.y-b.y);if(d<bd){bd=d;best=e}}if(best){const a=Math.atan2(best.y-b.y,best.x-b.x);b.vx=lerp(b.vx,Math.cos(a)*6,0.15);b.vy=lerp(b.vy,Math.sin(a)*6,0.15)}}b.x+=b.vx;b.y+=b.vy}
  g.pb=g.pb.filter(b=>b.x<W+10&&b.y>-10&&b.y<H+10&&!b.gone);
  for(const b of g.eb){b.x+=b.vx;b.y+=b.vy;if(b.shell){b.shell--;if(b.shell<=0){b.gone=1;for(let i=0;i<14;i++)g.eb.push({x:b.x,y:b.y,vx:Math.cos(i/14*6.283)*1.8,vy:Math.sin(i/14*6.283)*1.8,r:3,c:1});boom(g,b.x,b.y,10)}}}
  g.eb=g.eb.filter(b=>!b.gone&&b.x>-10&&b.x<W+10&&b.y>-10&&b.y<H+10);
  // enemies
  for(const e of g.en){e.t++;if(e.flash>0)e.flash--;const t=e.t;
    if(e.kind==='gyro'){e.x-=2.1;e.y=e.y0+Math.sin(t*0.05+(e.ph||0))*30*(e.amp||1);if(t%110===60&&e.x<W-30)eshot(g,e.x,e.y,Math.atan2(p.y-e.y,p.x-e.x),2,0)}
    else if(e.kind==='kite'){if(t<50)e.x-=3;else{e.vy=(e.vy||0)+(p.y>e.y?0.06:-0.06);e.vy=clamp(e.vy,-1.6,1.6);e.y+=e.vy;e.x-=3.4}}
    else if(e.kind==='balloon'){e.x-=0.7;e.y=e.y0+Math.sin(t*0.03)*6}
    else if(e.kind==='gunboat'){e.x=lerp(e.x,W-90,0.01);e.y=e.y0+Math.sin(t*0.02)*18;if(t>500)e.x-=1.5;if(t%70===30&&t<500){const a=Math.atan2(p.y-e.y,p.x-e.x);for(let i=0;i<5;i++)eshot(g,e.x-18,e.y+6,a+(i-2)*0.12,2.4,1)}}
    // your shots
    for(const b of g.pb){if(b.gone)continue;if(Math.abs(b.x-e.x)<e.r+3&&Math.abs(b.y-e.y)<e.r+3){b.gone=1;hurt(g,e,b.dmg)}}
    // touching you
    if(!p.dead&&p.inv<=0&&Math.hypot(e.x-p.x,e.y-p.y)<e.r+3)kill(g)}
  for(const e of g.en)if(e.hp<=0&&!e.gone){e.gone=1;g.chain++;g.chT=90;add(g,{gyro:100,kite:80,balloon:150,gunboat:3000}[e.kind],e.x,e.y-10);boom(g,e.x,e.y,e.kind==='gunboat'?40:e.kind==='balloon'?20:12);snd(e.kind==='gunboat'?'big':'pop');if(e.kind==='gunboat')g.shake=5;
    if(e.kind==='balloon')for(let i=0;i<10;i++)g.eb.push({x:e.x,y:e.y,vx:Math.cos(i/10*6.283)*1.6,vy:Math.sin(i/10*6.283)*1.6,r:3,c:2});
    if(e.kind==='gunboat'||rnd()<0.06)g.items.push({x:e.x,y:e.y,t:0,kind:e.kind==='gunboat'&&rnd()<0.4?'bomb':'pow'})}
  g.en=g.en.filter(e=>!e.gone&&e.x>-60);
  // boss
  if(g.boss){bossTick(g);const B=g.boss;if(!B.dead)for(const k in B.parts){const q=B.parts[k];if(!q.alive)continue;const x=B.x+q.ox,y=B.y+q.oy;for(const b of g.pb){if(b.gone)continue;if(Math.hypot(b.x-x,b.y-y)<q.r+3){b.gone=1;partHit(g,q,k,b.dmg)}}}
    // the hull itself blocks shots and rams you
    if(!B.dead){const inHull=(x,y)=>((x-B.x)/135)**2+((y-B.y+10)/36)**2<1||(y>B.y+28&&y<B.y+58&&x>B.x-112&&x<B.x+92);for(const b of g.pb)if(!b.gone&&inHull(b.x,b.y)){b.gone=1;g.parts.add(b.x,b.y,rr(-1,0),rr(-1,1),0xffe0a0,{life:6,g:0,e:120})}
      if(!p.dead&&p.inv<=0&&inHull(p.x+6,p.y))kill(g)}}
  // bullets hit you; the hit box is the small bright core
  if(!p.dead&&p.inv<=0)for(const b of g.eb)if(Math.hypot(b.x-p.x,b.y-p.y)<b.r+1.5){b.gone=1;kill(g);break}
  // pickups drift toward you
  for(const it of g.items){it.t++;it.x-=0.6;const d=Math.hypot(p.x-it.x,p.y-it.y);if(d<60){it.x+=(p.x-it.x)*0.08;it.y+=(p.y-it.y)*0.08}if(d<10&&!p.dead){it.gone=1;if(it.kind==='pow'){p.pow=Math.min(4,p.pow+1);g.pops.add(p.x,p.y-14,p.pow>=4?'满火力':'火力 +1',0x9ae0ff,{size:10})}else{p.bombs=Math.min(5,p.bombs+1);g.pops.add(p.x,p.y-14,'风暴 +1',0xa8ffc0,{size:10})}snd('pow')}}
  g.items=g.items.filter(i=>!i.gone&&i.x>-10);
  for(const f of g.fx)f.t++;g.fx=g.fx.filter(f=>f.t<(f.k==='boom'?f.s*0.8+10:8));
  for(const s of g.smoke){s.t++;s.x+=s.vx;s.y+=s.vy;s.r+=0.15}g.smoke=g.smoke.filter(s=>s.t<s.l);
  // the plane trails a little vapour and smoke when it is damaged
  if(!p.dead&&g.T%2===0)g.parts.add(p.x-8,p.y+1,-2,rr(-0.2,0.2),0xffffff,{life:10,g:0,dr:0.95});
  for(const b of g.birds){b.x-=b.s;b.ph+=0.15;if(b.x<-10)b.x=W+10}}
function hurt(g,e,d){e.hp-=d;e.flash=3;snd('hit')}
function partHit(g,q,k,d){if(q.shield){g.parts.add(g.boss.x+q.ox+rr(-8,8),g.boss.y+q.oy+rr(-8,8),rr(-1,1),rr(-1,1),0x9ad0ff,{life:8,g:0,e:120});return}q.hp-=d;q.flash=3;snd('hit');
  if(q.hp<=0&&q.alive){q.alive=false;const x=g.boss.x+q.ox,y=g.boss.y+q.oy;boom(g,x,y,30);snd('big');g.shake=6;add(g,k==='core'?0:5000,x,y-16);g.chain+=5;g.chT=120;g.items.push({x,y,t:0,kind:'pow'})}}
function kill(g){const p=g.p;if(p.dead)return;p.dead=1;p.lives--;p.pow=Math.max(1,p.pow-1);boom(g,p.x,p.y,26);snd('die');g.shake=6;g.eb=g.eb.filter(b=>Math.hypot(b.x-p.x,b.y-p.y)>60)}
// ---------------- autoplay: stay in line with a target, slip away from the nearest bullets ----------------
function ai(g){const p=g.p,A=g.ai;const pad={x:0,y:0,a:false,b:false,fire:false};if(g.state==='clear'||g.state==='over'){pad.a=g.ct>420;return pad}if(p.dead)return pad;
  let ty=130,tx=80;let best=null,bd=1e9;for(const e of g.en){const d=Math.abs(e.x-p.x);if(e.x>p.x&&d<bd){bd=d;best=e}}if(best)ty=best.y;if(g.boss&&!g.boss.dead){const B=g.boss;let tgt=null;for(const k of['tL','tR','cannon','propU','propD','core']){const q=B.parts[k];if(q.alive&&!q.shield){tgt=q;break}}if(tgt)ty=B.y+tgt.oy;tx=60}
  for(const it of g.items)if(it.x<p.x+80){ty=it.y;tx=it.x}
  // score nine candidate moves by how close bullets get over the next frames
  let bm=[0,0],bs=-1e9;for(const mvx of[-1,0,1])for(const mvy of[-1,0,1]){let s=0;const nx=clamp(p.x+mvx*14,10,W-20),ny=clamp(p.y+mvy*14,12,H-14);
      for(const b of g.eb){for(let f=2;f<=14;f+=4){const d=Math.hypot(b.x+b.vx*f-lerp(p.x,nx,f/14),b.y+b.vy*f-lerp(p.y,ny,f/14));if(d<14)s-=(14-d)*(16-f)}}
      for(const e of g.en){const d=Math.hypot(e.x-nx,e.y-ny);if(d<e.r+16)s-=200}if(g.boss&&!g.boss.dead&&nx>g.boss.x-150)s-=300;
      s-=Math.abs(ny-ty)*0.6+Math.abs(nx-tx)*0.2;if(s>bs){bs=s;bm=[mvx,mvy]}}
  pad.x=bm[0];pad.y=bm[1];if(bs<-600&&p.bombs>0&&!g.bomb)pad.b=true;return pad}
// ---------------- drawing ----------------
function draw(g){const B=bake(),T=g.T;const sh=g.shake>0.5?g.shake:0;const ox=Math.round((rnd()-0.5)*sh),oy=Math.round((rnd()-0.5)*sh);
  col.set(B.SKY);em.fill(0);
  K.glow(SUNX,SUNY,56,0xffd080,0.22);K.disc(SUNX,SUNY,24,0xffd890,60);K.disc(SUNX,SUNY,20,0xffeec0,90);
  // distant fleet silhouettes and birds
  for(let i=0;i<3;i++){const x=((i*190-g.scroll*0.15)%(W+120)+W+120)%(W+120)-60,y=120+i*12;for(let j=-4;j<=4;j++){const w=Math.round(14*Math.sqrt(1-j*j/20));K.recta(x-w,y+j,w*2,1,0x6a3a6a,0.55)}K.recta(x-5,y+5,10,2,0x5a2a5a,0.55)}
  for(const b of g.birds){const f=Math.sin(b.ph);K.px(b.x,b.y,0x4a2a4a);K.px(b.x-1,b.y-(f>0?1:0),0x4a2a4a);K.px(b.x+1,b.y-(f>0?1:0),0x4a2a4a)}
  drawLayer(B.L0,g.scroll*0.35,255);drawLayer(B.L1,g.scroll*0.8,255);
  // smoke behind the action
  for(const s of g.smoke){const a=(1-s.t/s.l)*0.7;K.disca(s.x+ox,s.y+oy,s.r,s.dark?0x3a2a3a:0x9a7a8a,a);K.disca(s.x+ox-s.r*0.3,s.y+oy-s.r*0.3,s.r*0.6,s.dark?0x5a4048:0xc8a0a0,a*0.8)}
  if(g.boss)drawBoss(g,ox,oy);
  for(const e of g.en)drawEnemy(g,e,ox,oy);
  for(const it of g.items){const x=Math.round(it.x+ox),y=Math.round(it.y+oy),c=it.kind==='pow'?0x6ac8ff:0x7aff9a;K.glow(x,y,10,c,0.4);K.disc(x,y,4,c,200);K.text(it.kind==='pow'?'P':'B',x+1,y-4,0xffffff,{size:7,bold:true,align:'c'})}
  drawPlane(g,ox,oy);
  for(const b of g.pb){const x=Math.round(b.x+ox),y=Math.round(b.y+oy);if(b.homing){K.disc(x,y,2,0x9ad0ff,220);K.px(x-3,y,0x4a8aff,150)}else{K.rect(x-5,y,7,1,0xfff0a0,200);K.px(x+1,y,0xffffff,255)}}
  for(const b of g.eb){const x=Math.round(b.x+ox),y=Math.round(b.y+oy);const C=[[0xff4a8a,0xffd0e0],[0xff8a2a,0xfff0c0],[0xb86aff,0xf0e0ff]][b.c];const r=b.r;K.disc(x,y,r+1,0x2a0a1a,0);K.disc(x,y,r,C[0],200);K.disc(x,y,r-1.2,C[1],255)}
  g.parts.draw(-ox,-oy);
  for(const f of g.fx){if(f.k==='boom'){const L=f.s*0.8+10,t=f.t/L,r=f.s*(0.4+t*0.8);if(t<0.2)K.disc(f.x+ox,f.y+oy,r*1.1,0xffffff,255);else{K.disc(f.x+ox,f.y+oy,r,t<0.5?0xffb040:0xc8502a,200);K.disc(f.x+ox+r*0.2,f.y+oy-r*0.2,r*0.6,t<0.5?0xfff0c0:0xff8a3a,220)}if(t<0.3)K.ring(f.x+ox,f.y+oy,r*1.6,1,0xffe0a0,150)}
    else if(f.k==='muz'){K.disc(f.x+ox,f.y+oy,7-f.t*0.7,0xfff0c0,255)}}
  // the cloud sea in front, then foreground wisps that sweep past
  drawLayer(B.L2,g.scroll*1.6,255);drawLayer(B.L3,g.scroll*2.6,255);
  if(g.bomb){const bx=g.p.x+(70-g.bomb)*8;for(let y=0;y<H;y++){const w=Math.sin(y*0.1+g.T*0.4)*6;for(let x=Math.max(0,bx-30+w|0);x<Math.min(W,bx+w|0);x++){const i=y*W+x;col[i]=mx(col[i],0xe8f8ff,((x-(bx-30+w))/30*160)|0);em[i]=80}}}
  if(g.flash>0)for(let i=0;i<W*H;i++)col[i]=mx(col[i],0xfff0d8,(g.flash/30*200)|0);
  hud(g)}
function drawPlane(g,ox,oy){const p=g.p,T=g.T;if(p.dead)return;if(p.inv>0&&(T>>2)&1)return;const x=Math.round(p.x+ox),y=Math.round(p.y+oy),bk=clamp(Math.round(p.bank*0.8),-2,2);
  // a cream-and-red biplane seen from the side, lit from the sun ahead (right); banking tilts the wings
  const R_=(X,Y,w,h,c)=>K.rect(x+X,y+Y,w,h,c);
  R_(-5,-7-bk,13,2,0xf4e8cc);R_(-5,-7-bk,13,1,0xfff8e8);R_(-5,-6-bk,13,1,0xc8b898);// upper wing
  R_(-1,-5-bk,1,4+bk,0x5a4a3a);R_(5,-5-bk,1,4+bk,0x5a4a3a);// struts
  R_(-13,-2,22,5,0xe8dcc0);R_(-13,-2,22,1,0xfff4e0);R_(-13,2,22,1,0xa89878);R_(-13,0,22,1,0xd83a2a);// fuselage with a red stripe
  R_(7,-2,4,5,0xc8302a);R_(9,-2,2,5,0xe85a3a);// red cowling
  R_(-15,-6,4,5,0xc8302a);R_(-15,-6,4,1,0xe85a3a);R_(-15,1,6,2,0xd8c8a8);// tail fin and tailplane
  R_(-4,3+bk,13,2,0xd8c8a8);R_(-4,4+bk,13,1,0xa89878);// lower wing
  R_(0,-4,4,2,0x3a5a7a);R_(1,-5,2,1,0x6a4a3a);K.px(x+3,y-5,0x9ad0ff);// cockpit, pilot, goggles
  R_(2,5,1,2,0x3a3a3a);K.disc(x+2.5,y+7.5,1.5,0x2a2a2a);// wheel
  const pr=(T>>1)&1;K.recta(x+12,y-6,1,13,0xffffff,pr?0.5:0.25);K.px(x+12,y+0,0x3a3a3a);K.px(x+12,y-6+((T*3)%13),0xffffff,160);
  for(let i=0;i<7;i++)K.px(x-1-i*1.3,y-5+Math.round(Math.sin(T*0.3-i*0.8)*1.2),i<4?0xd83a2a:0xb82a1a);// the scarf
  K.px(x,y,0xffffff,255);K.ring(x,y,2.4,1,0xff5a8a,140)}
function drawEnemy(g,e,ox,oy){const x=Math.round(e.x+ox),y=Math.round(e.y+oy),T=g.T,fl=e.flash>0&&(T&2)>0;const W1=fl?0xffffff:0;
  if(e.kind==='gyro'){// gyrocopter: a round cockpit pod with a spinning rotor
    K.disc(x,y,7,fl?0xffffff:0x4a3a30);K.disc(x+1,y-1,5.5,fl?0xffffff:0x8a6a4a);K.disc(x+2,y-2,3,fl?0xffffff:0xc89a6a);K.rect(x-6,y-3,3,3,0x9ad0ff,180);const s=Math.sin(T*0.8)*14;K.line(x-s,y-10,x+s,y-10,0xd8c8b0);K.recta(x-14,y-11,28,1,0xffffff,0.15);K.line(x,y-7,x,y-10,0x3a2a2a);K.rect(x+6,y,7,2,0x3a2a2a);K.line(x+13,y-3,x+13,y+4,0xc8c0b0)}
  else if(e.kind==='kite'){// a pirate glider kite: a red diamond sail with a long tail
    for(let j=-9;j<=9;j++){const w=9-Math.abs(j);for(let q=-w;q<=w;q++)K.px(x+q,y+j,fl?0xffffff:(q<0?(j<0?0xa8281e:0xc8302a):(j<0?0xff7a4a:0xe85a3a)))}K.line(x-9,y,x+9,y,0x2a1010);K.line(x,y-9,x,y+9,0x2a1010);K.px(x,y,0xffd040);for(let i=0;i<12;i++)K.px(x+9+i*1.5,y+Math.round(Math.sin(T*0.2+i*0.7)*2.5),i%3?0xffd040:0xffffff)}
  else if(e.kind==='balloon'){// a mine balloon with a lit fuse
    for(let j=-12;j<=12;j++)for(let q=-11;q<=11;q++){const d=(q*q)/121+(j*j)/144;if(d>1)continue;const lit=(q*0.6-j*0.5)/12+0.3;K.px(x+q,y+j,fl?0xffffff:(Math.abs(q)<1.5?0x5a2a2a:lit>0.5?0xc88a5a:lit>0?0x8a5a3a:0x4a2a24))}
    K.line(x,y+12,x,y+17,0x2a1a1a);K.rect(x-3,y+17,7,5,0x3a2a1a);K.rect(x-3,y+17,7,1,0x8a6a4a);if((T>>3)&1){K.disc(x,y+23,2,0xffd040,255);K.glow(x,y+23,8,0xffa040,0.4)}}
  else if(e.kind==='gunboat'){// a small armoured airship: envelope, gondola, guns
    for(let j=-14;j<=14;j++)for(let q=-26;q<=26;q++){const d=(q*q)/676+(j*j)/196;if(d>1)continue;const nz=Math.sqrt(1-d),lit=(q/26)*0.5-(j/14)*0.4+nz*0.5;let c=lit>0.75?0xf0d8a8:lit>0.45?0xc8a07a:lit>0.15?0x8a6a5a:0x4a3a44;if(((q+30)%10)===0)c=mx(c,0,60);K.px(x+q,y-6+j,fl?0xffffff:c)}
    K.rect(x-16,y+8,30,7,fl?0xffffff:0x5a3a24);K.rect(x-16,y+8,30,1,0xc8a070);K.rect(x-22,y+10,6,2,0x2a2a2a);for(let i=0;i<4;i++)K.px(x-12+i*7,y+11,0xffd080,200);
    const s=Math.sin(T*0.9)*6;K.line(x+27,y-6-s,x+27,y-6+s,0xd8d0c0)}}
function drawBoss(g,ox,oy){const B=g.boss,T=g.T,P=B.parts;const bx=B.x+ox,by=B.y+oy,tilt=B.tilt||0;
  const R=(u,v)=>[bx+u*Math.cos(tilt)-v*Math.sin(tilt),by+u*Math.sin(tilt)+v*Math.cos(tilt)];
  // gas envelope: a long ellipsoid of patched fabric, ribbed, lit warm from the sun ahead
  for(let v=-44;v<=26;v++)for(let u=-140;u<=130;u++){const d=(u*u)/(135*135)+((v+10)*(v+10))/(36*36);if(d>1)continue;const nz=Math.sqrt(1-d);const lit=(u/135)*0.55-((v+10)/36)*0.45+nz*0.45;
    let c=lit>0.85?0xffecc0:lit>0.62?0xf0c890:lit>0.38?0xc8906a:lit>0.12?0x8a5a5a:0x4a3448;if(((u+200)%22)<1)c=mx(c,0x2a1a1a,90);if(vnoise((u+300)*0.06,(v+100)*0.1,77)>0.72)c=mx(c,0x6a4a3a,70);
    if(d>0.94)c=mx(c,u>40?0xffe8b0:0x2a1a2a,u>40?140:90);const [X,Y]=R(u,v);K.px(X,Y,c)}
  // the core hatch on top of the envelope: shut while the shield is up
  {const q=P.core,[X,Y]=R(q.ox,q.oy);if(q.alive){const open=!q.shield;K.disc(X,Y,14,0x3a2a2a);K.disc(X,Y,12,open?0x2a0a10:0x8a7a6a);if(open){const pul=0.5+0.5*Math.sin(T*0.2);K.disc(X,Y,8,0xff4a6a,220);K.disc(X,Y,5,0xffd0e0,255);K.glow(X,Y,26,0xff4a6a,0.3+pul*0.3)}else for(let a=0;a<6;a++)K.line(X,Y,X+Math.cos(a*1.047)*12,Y+Math.sin(a*1.047)*12,0x4a3a34);
      if(q.flash>0){q.flash--;if(T&2)K.disca(X,Y,12,0xffffff,0.5)}if(q.shield)K.ring(X,Y,17+Math.sin(T*0.1),1,0x9ad0ff,120)}else{K.disc(X,Y,13,0x1a0a0a);if(T%3===0)g.smoke.push({x:X-ox,y:Y-oy,r:6,t:0,l:60,vx:-0.8,vy:-0.8,dark:1})}}
  // rigging down to the hull
  for(let i=0;i<7;i++){const u=-90+i*30;const [a1,a2]=R(u,22),[b1,b2]=R(u*0.8-5,34);K.line(a1,a2,b1,b2,0x3a2a2a)}
  // the hull: a wooden ship with red trim, lit portholes and a figurehead
  for(let v=30;v<=58;v++){const half=lerp(112,70,Math.pow((v-30)/28,1.6));for(let u=-half-10;u<=half-20;u++){const plank=((v-30)%5===0);let c=v<33?0xd83a2a:plank?0x3a2416:v<44?0x7a4a2a:0x5a361e;if(u>half-30)c=mx(c,0xffd8a0,50);if(u<-half)c=mx(c,0,60);const [X,Y]=R(u,v);K.px(X,Y,c)}}
  for(let i=0;i<9;i++){const [X,Y]=R(-88+i*20,40);K.rect(X-1,Y-1,3,3,0x2a1a10);K.px(X,Y,(T+i*7)%60<50?0xffc060:0xffe8a0,220)}
  {const [X,Y]=R(-132,30);K.line(X,Y,X-10,Y-6,0xd8a040);K.disc(X-11,Y-7,2.5,0xd8a040)}
  // flags on the stern mast
  {const [X,Y]=R(70,-48);K.line(X,Y,X,Y-18,0x2a1a10);for(let j=0;j<6;j++)for(let q=0;q<14;q++){K.px(X+1+q,Y-18+j+Math.round(Math.sin(T*0.15-q*0.4)*1.5),j<3?0xd83a2a:0xffd040)}}
  // weapons and propeller pods
  for(const k of['cannon','tL','tR']){const q=P[k],[X,Y]=R(q.ox,q.oy);if(k!=='cannon'){const [hx,hy]=R(q.ox,56);K.rect(hx-2,hy,5,Y-hy,0x2a2a30)}if(q.alive){const f=q.flash>0&&(T&2)>0;if(q.flash>0)q.flash--;K.disc(X,Y,q.r,f?0xffffff:0x3a3a42);K.disc(X+1,Y-1,q.r-3,f?0xffffff:0x6a6a74);const a=k==='cannon'?Math.PI:Math.atan2(g.p.y-Y,g.p.x-X);K.line(X,Y,X+Math.cos(a)*(q.r+8),Y+Math.sin(a)*(q.r+8),0x1a1a20);K.line(X,Y+1,X+Math.cos(a)*(q.r+8),Y+1+Math.sin(a)*(q.r+8),0x4a4a54)}
    else{K.disc(X,Y,q.r-2,0x1a1010);if(T%5===0)g.smoke.push({x:X-ox,y:Y-oy,r:5,t:0,l:50,vx:-1,vy:-0.4,dark:1});if(T%7===0)g.parts.add(X-ox,Y-oy,rr(-1,0),rr(-1,0),0xffa040,{life:12,g:-0.03,e:200})}}
  for(const k of['propU','propD']){const q=P[k],[X,Y]=R(q.ox,q.oy);{const [hx,hy]=R(q.ox-4,k==='propU'?-40:56);K.line(hx,hy,X-4,Y,0x2a2a30);K.line(hx+1,hy,X-3,Y,0x4a4a54)}K.rect(X-14,Y-5,18,10,q.alive?0x5a4a42:0x1a1010);K.rect(X-14,Y-5,18,1,0xc8a080);if(q.alive){const f=q.flash>0&&(T&2)>0;if(q.flash>0)q.flash--;const s=Math.sin(T*1.1)*q.r;K.line(X+5,Y-s,X+5,Y+s,f?0xffffff:0xd8d0c0);K.recta(X+4,Y-q.r,3,q.r*2,0xffffff,0.15)}else if(T%6===0)g.smoke.push({x:X-ox,y:Y-oy,r:5,t:0,l:50,vx:-1,vy:-0.4,dark:1})}
  // a health bar for the core
  if(!B.dead){const q=P.core;UI.bar(W/2-80,H-12,160,6,q.hp/460,q.shield?0x6a8aa8:0xff4a6a);K.text('天穹号',W/2,H-24,0xffe0c0,{size:9,bold:true,align:'c',ink:0x1a0a10})}}
function hud(g){const p=g.p,T=g.T;g.pops.draw(0,0);K.ptext(String(g.score).padStart(8,'0'),W-8,8,0xfff0e0,{align:'r',ink:0x2a0a18,scale:1});if(g.chain>=10)K.ptext('X'+(1+Math.min(9,g.chain/10|0)),W-8,18,0xffd070,{align:'r',ink:0x2a0a18,em:100});
  for(let i=0;i<p.lives;i++){K.rect(8+i*12,8,8,3,0xe8dcc0);K.rect(13+i*12,8,2,3,0xc8302a)}for(let i=0;i<p.bombs;i++){K.disc(10+i*9,20,3,0x7aff9a,160)}
  K.ptext('POW '+'|'.repeat(p.pow),8,28,0x9ad0ff,{ink:0x1a0a18});
  if(g.st<220&&g.state==='play'){const a=clamp(g.st/30,0,1)*clamp((220-g.st)/30,0,1);K.text('云 海',W/2,72,0xfff0d8,{size:34,bold:true,fam:'kai',align:'c',ink:0x3a0a2a,a,sp:8,em:60});K.text('落日下的云层之上，空贼的舰队拦住了去路',W/2,116,0xffe0c8,{size:10,align:'c',ink:0x3a0a2a,a});
    if(!g.auto)K.text('方向键移动 · 自动开火 · 按住 J 慢速精确移动 · K 放风暴清弹',W/2,H-18,0xfff0e0,{size:9,align:'c',ink:0x3a0a2a,a})}
  if(g.warn>0&&(g.warn>>4)&1){K.recta(0,110,W,30,0x5a0a1a,0.5);K.text('警 告 · 天穹号接近',W/2,116,0xff6a7a,{size:16,bold:true,align:'c',ink:0x1a0008,em:120})}
  if(g.state==='clear'){const a=clamp(g.ct/40,0,1);K.text('击 落',W/2,70,0xfff0c0,{size:34,bold:true,fam:'kai',align:'c',ink:0x3a0a2a,a,sp:8,em:80});K.text('得分 '+g.score+(g.score>=(g.sv.best||0)?' · 新纪录':''),W/2,114,0xffe0c8,{size:11,align:'c',ink:0x3a0a2a,a});if(g.ct>120)K.text(g.auto?'演示中':'按 J 再来',W/2,132,0xffd0b0,{size:9,align:'c',a})}
  if(g.state==='over'){K.text('坠 落',W/2,80,0xffb0a0,{size:30,bold:true,fam:'kai',align:'c',ink:0x1a0008,sp:8});K.text('得分 '+g.score,W/2,118,0xffe0c8,{size:11,align:'c',ink:0x1a0008});if(g.ct>90)K.text(g.auto?'演示中':'按 J 再来',W/2,136,0xffd0b0,{size:9,align:'c'})}}
function info(g){return (g.boss?'天穹号':'第 '+Math.min(9,1+(g.st/600|0))+' 段')+' · '+g.score+(g.sv&&g.sv.best?' · 最高 '+g.sv.best:'')}
return{init,tick,draw,ai,info}})();



// ================= 打铁花: the iron-flower show on a snowy village night. Scoop molten iron, raise the stick, and strike it into a sky of sparks =================
// The performer scoops white-hot iron from the furnace, walks out under the 花棚 (a tall frame thatched with willow and hung with firecracker
// strings) and waits. Hold J to raise the cup stick overhead; let go and the other stick slams it from below, throwing the iron up as sparks.
// Higher is better, but the iron in the cup is cooling the whole time, and a cool strike gives a dull, short spray. ←→ aims the throw.
// Every spark is a particle with its own temperature, glowing by black-body colour; when one hits the willow thatch it splits into more, the
// "flower" opening. The sparks are also the only real light: the whole village is lit from a light map they paint each frame.
// Sparks that touch a firecracker string set it off.
const IFL=(function(){const {W,H,S,mix,clamp,lerp,hash,rnd,rr,vnoise}=K;const col=S.col,em=S.em;
const mx=(a,b,t)=>{const ar=a>>16&255,ag=a>>8&255,ab=a&255;return((ar+(((b>>16&255)-ar)*t>>8))<<16)|((ag+(((b>>8&255)-ag)*t>>8))<<8)|(ab+(((b&255)-ab)*t>>8))};
const GY=224,PX=214,SX=330,SY=84,SRX=92,SRY=40,THROWS=8;
const STR=[258,290,322,354,386,410].map(x=>({x,y0:SY+10,n:16}));
// black body for the sparks
const BB=[[0,0x3a1408],[0.2,0x8a2410],[0.4,0xd84a14],[0.6,0xff8a24],[0.8,0xffd060],[1,0xfffbe8]];
function bb(t){t=clamp(t,0,1);for(let i=1;i<BB.length;i++)if(t<=BB[i][0]){const a=BB[i-1],b=BB[i];return mix(a[1],b[1],(t-a[0])/(b[0]-a[0]))}return BB[BB.length-1][1]}
// ---------------- the village at night, baked as albedo (unlit colour) ----------------
let A=null,ST=null,sl0=0;const LW=120,LH=68;
function bake(){if(A)return A;K.setSeed(1314);A=new Int32Array(W*H);ST=new Float32Array(LW*LH);const put=(x,y,c)=>{x|=0;y|=0;if(x>=0&&y>=0&&x<W&&y<H)A[y*W+x]=c};
  for(let y=0;y<H;y++)for(let x=0;x<W;x++)A[y*W+x]=mix(0x0a1030,0x2a3460,clamp(y/200,0,1));
  for(let i=0;i<120;i++){const x=rnd()*W|0,y=rnd()*120|0;put(x,y,mix(0x8a90c0,0xffffff,rnd()))}
  // a far ridge, then the village: walls and roofs with snow on them, an old gate tower on the left
  for(let x=0;x<W;x++){const h=150-vnoise(x*0.01,1,4)*36;for(let y=Math.floor(h);y<GY;y++)put(x,y,mix(0x3a4468,0x2a3050,(y-h)/60))}
  const house=(x0,w,base,h,roof)=>{for(let y=base-h;y<base;y++)for(let x=x0;x<x0+w;x++){let c=mix(0x8a7a6a,0x6a5a4a,(x-x0)/w);if((x-x0)%11===5&&y>base-h+5&&y<base-6)c=0x3a2a20;put(x,y,c)}
    for(let j=0;j<roof;j++)for(let x=x0-4+j*0.4;x<x0+w+4-j*0.4;x++)put(x,base-h-roof+j,j<3?0xf4f6fc:mix(0x4a4448,0x3a3438,j/roof))};
  house(150,60,GY-4,30,9);house(214,40,GY-6,24,8);house(400,70,GY-4,34,10);house(-10,40,GY-2,28,8);
  // gate tower with red lanterns
  for(let y=96;y<GY;y++)for(let x=40;x<120;x++){let c=mix(0x7a6a5a,0x5a4a3e,vnoise(x*0.1,y*0.1,3));const row=(y-96)>>2;if((y-96)%4===0||((x+(row&1)*5)%10)===0)c=mx(c,0x2a2018,90);const dd=Math.hypot((x-80)/14,(y-178)/14);if(y>164&&Math.abs(x-80)<14&&(y>178||dd<1))c=0x120c0a;else if(y>162&&Math.abs(x-80)<17&&(y>178||dd<1.2))c=0x9a8a74;if(y>104&&y<118&&Math.abs(x-80)<14)c=(y===104||y===117||Math.abs(x-80)===13)?0xb89a50:0x1a1410;put(x,y,c)}
  for(let j=0;j<14;j++)for(let x=34+j*0.8;x<126-j*0.8;x++)put(x,82+j,j<4?0xf4f6fc:mix(0x5a3a2a,0x3a2418,j/14));
  for(let y=60;y<82;y++)for(let x=56;x<104;x++)put(x,y,(x-56)%8<2?0x6a2a1a:0x9a3a24);for(let j=0;j<10;j++)for(let x=50+j*0.6;x<110-j*0.6;x++)put(x,50+j,j<3?0xf4f6fc:0x3a2418);
  for(const lx of[54,106])for(let j=0;j<10;j++)for(let q=-4;q<=4;q++)if(q*q/16+(j-5)**2/25<=1)put(lx+q,140+j,mix(0xff5a3a,0xa81a14,Math.abs(q)/4));sl0=1;
  // the 花棚: two tall posts, a crossbeam, a dome of willow thatch
  for(const px of[SX-78,SX+78])for(let y=SY;y<GY;y++)for(let q=-2;q<=2;q++)put(px+q,y,q<0?0x6a4a2a:0x4a3018);
  for(let y=SY+4;y<SY+8;y++)for(let x=SX-82;x<SX+82;x++)put(x,y,0x5a3a20);
  // the canopy: an umbrella of willow branches laid over ribs, thick at the crown, ragged at the rim
  for(let y=SY-SRY;y<SY+10;y++)for(let x=SX-SRX;x<SX+SRX;x++){const u=(x-SX)/SRX;if(Math.abs(u)>1)continue;const top=SY-SRY*(1-u*u)*0.95-3*vnoise(x*0.2,1,6),bot=SY+6-Math.abs(u)*4+4*vnoise(x*0.3,2,7);if(y<top||y>bot)continue;
    const n=vnoise(x*0.35,y*0.5,6),rib=Math.abs(((x-SX+200)%23)-11)<1&&y>top+3;let c=rib?0x5a3a20:mix(0x6a6a3a,0x2e3a1c,clamp((y-top)/(bot-top)*0.8+n*0.4,0,1));if(hash(x,y)<0.12)c=0x9a9a5a;if(y<top+2)c=0xe8ecf4;put(x,y,c)}
  for(let k=0;k<120;k++){const x=SX-SRX+k*SRX*2/120,len=8+((hash(k,2)*18)|0);for(let j=0;j<len;j++)put(x+Math.sin(j*0.3+k)*1.2,SY+8+j,j%3?0x3a4a22:0x5a6a32)}
  // a tall centre pole above the canopy with a little lantern
  for(let y=SY-SRY-26;y<SY-SRY+4;y++){put(SX,y,0x5a3a20);put(SX+1,y,0x3a2414)}
  // the furnace on the left of the square: clay body, a dark mouth (lit live), the bellows
  for(let y=170;y<GY;y++)for(let x=128;x<170;x++){const u=(x-149)/21;if(Math.abs(u)>1-(170-y+54)/200)continue;put(x,y,mix(0x8a5a3a,0x6a4028,vnoise(x*0.2,y*0.2,8)))}
  for(let y=196;y<212;y++)for(let x=140;x<158;x++)put(x,y,0x1a0a06);
  // snow on the ground
  for(let y=GY;y<H;y++)for(let x=0;x<W;x++){let c=mix(0xe8ecf4,0xc8d0e0,vnoise(x*0.05,y*0.2,9));if(hash(x,y)<0.04)c=0xffffff;A[y*W+x]=c}
  // static light: furnace mouth, gate lanterns
  const sl=(cx,cy,r,k)=>{for(let y=0;y<LH;y++)for(let x=0;x<LW;x++){const d=Math.hypot(x*4-cx,y*4-cy)/r;if(d<1)ST[y*LW+x]+=k*(1-d)*(1-d)}};sl(149,204,70,0.7);sl(54,145,34,0.35);sl(106,145,34,0.35);
  return A}
// ---------------- game ----------------
const SMAX=6000;
function init(g){bake();g.T=0;g.sv=STORE.get('ifl1',{best:0});g.pops=Pops();g.state='intro';g.it=0;
  g.n=0;g.fx=new Float32Array(SMAX);g.fy=new Float32Array(SMAX);g.fvx=new Float32Array(SMAX);g.fvy=new Float32Array(SMAX);g.ft=new Float32Array(SMAX);g.fg=new Uint8Array(SMAX);
  g.L=new Float32Array(LW*LH);g.Lt=new Float32Array(LW*LH);g.act='scoop';g.at=0;g.px=150;g.lift=0;g.heat=1;g.aim=0.3;g.throws=0;g.score=0;g.flowers=0;g.best=0;g.res=[];
  g.str=STR.map(s=>({x:s.x,lit:0,k:0,done:0}));g.smoke=[];g.paper=[];g.flash=0}
function snd(n,a){if(!K.live())return;const t=K.now();
  if(n==='strike'){K.noise(0.08,0.09,t,'lowpass',1400,300,1);K.noise(0.9,0.05*a,t+0.02,'highpass',3000,6000,0.6);K.tone('sine',90,40,0.3,0.08,t)}
  else if(n==='scoop'){K.noise(0.5,0.03,t,'bandpass',600,300,1.2)}
  else if(n==='pop'){K.noise(0.03,0.05,t,'highpass',1800,900,1)}
  else if(n==='drip'){K.noise(0.05,0.015,t,'highpass',4000,2000,2)}}
function beds(g){if(!K.live()||g.thumb)return;K.bed('crack','highpass',5000,0.8);K.bedSet('crack',Math.min(0.03,g.n*0.00001),5000+Math.min(3000,g.n));K.bed('fire','lowpass',300,0.7);K.bedSet('fire',0.015,260)}
function spark(g,x,y,vx,vy,t,gen){if(g.n>=SMAX)return;const i=g.n++;g.fx[i]=x;g.fy[i]=y;g.fvx[i]=vx;g.fvy[i]=vy;g.ft[i]=t;g.fg[i]=gen}
function cup(g){// shoulder, stick angle from the lift, cup at the stick's end
  const sx=g.px+3,sy=GY-30,a=lerp(0.25,1.5,g.lift);return{sx,sy,cx:sx+Math.cos(a)*34,cy:sy-Math.sin(a)*34,a}}
function strike(g){const c=cup(g),q=clamp(Math.pow(g.lift,1.3)*clamp((g.heat-0.25)/0.6,0,1),0,1);const n=Math.round(400+q*1100);
  for(let k=0;k<n;k++){const a=-Math.PI/2+g.aim+(rnd()+rnd()+rnd()-1.5)*0.55,sp=(2.2+rnd()*5.8)*(0.5+q*0.62);spark(g,c.cx+rr(-2,2),c.cy+rr(-2,2),Math.cos(a)*sp,Math.sin(a)*sp,0.86+q*0.16+rr(-0.08,0.04),0)}
  snd('strike',0.5+q);g.flash=0.6+q*0.6;const grade=q>0.82?'满天星':q>0.6?'好花':q>0.35?'散了些':'铁凉了';g.res.push(q);g.pops.add(c.cx,c.cy-30,grade,q>0.6?0xfff0b0:0xffd8c0,{size:q>0.82?14:11,life:60});g.score+=Math.round(q*200);g.best=Math.max(g.best,q)}
function tick(g,pad){g.T++;g.pops.tick();beds(g);
  // sparks: gravity, drag, cooling; the willow thatch splits them; the snow bounces and kills them
  let w=0;const fl=g.flowers;for(let i=0;i<g.n;i++){let x=g.fx[i],y=g.fy[i],vx=g.fvx[i]*0.992,vy=g.fvy[i]*0.992+0.05,t=g.ft[i]-(0.0034+(i%7)*0.0006);x+=vx;y+=vy;
    if(g.fg[i]<2){const u=(x-SX)/SRX,v=(y-SY)/SRY;if(u*u+v*v<1&&y>SY-SRY&&rnd()<0.12){// into the thatch: split into a little flower
      g.flowers++;const m=g.fg[i]===0?3:2;for(let k=0;k<m;k++){const a=rnd()*6.283,s=rr(0.8,2.8);spark(g,x,y,vx*0.2+Math.cos(a)*s,vy*0.2+Math.sin(a)*s-0.6,t*0.95,g.fg[i]+1)}t=0}}
    for(const s of g.str)if(!s.lit&&Math.abs(x-s.x)<4&&y>s.y0&&y<s.y0+s.n*3.4&&t>0.15){s.lit=1;s.k=0;g.score+=300;g.pops.add(s.x,s.y0-6,'响了！',0xffe0a0,{size:10,life:40})}
    if(y>GY){if(vy>1.2&&t>0.3){vy=-vy*0.25;vx*=0.5;y=GY;t*=0.6}else t=0}
    if(t>0.04&&x>-10&&x<W+10&&y<H){g.fx[w]=x;g.fy[w]=y;g.fvx[w]=vx;g.fvy[w]=vy;g.ft[w]=t;g.fg[w]=g.fg[i];w++}}
  g.n=Math.min(g.n,SMAX);if(w<g.n){/* new sparks appended during the loop beyond i are kept */}g.n=w+Math.max(0,g.n-g.n);
  for(const s of g.str)if(s.lit&&!s.done){s.k+=0.34;const kk=s.k|0;if(Math.abs(s.k-kk)<0.34){snd('pop');const y=s.y0+kk*3.4;g.flash=Math.max(g.flash,0.25);for(let j=0;j<3;j++)g.paper.push({x:s.x,y,vx:rr(-1.5,1.5),vy:rr(-1.5,0.5),c:hash(kk,j)<0.8?0xd8282a:0xf0c040,t:0});g.smoke.push({x:s.x+rr(-3,3),y,r:rr(2,4),t:0});spark(g,s.x,y,rr(-1,1),rr(-1,0.3),0.9,2)}if(kk>=s.n)s.done=1}
  for(const p of g.paper){p.t++;p.x+=p.vx;p.y+=p.vy;p.vy=Math.min(0.8,p.vy+0.04);p.vx*=0.97}g.paper=g.paper.filter(p=>p.y<GY+4&&p.t<300);
  for(const s of g.smoke){s.t++;s.y-=0.25;s.x+=0.15;s.r+=0.05}g.smoke=g.smoke.filter(s=>s.t<260);
  g.flash*=0.86;
  if(g.state==='intro'){g.it++;if(g.it>170||g.it>40&&(pad.a||pad.b)&&!g.auto)g.state='play';return}
  if(g.state==='end'){g.et++;if(g.et>520&&(pad.a||g.auto&&g.et>580)){init(g);g.state='play'}return}
  g.at++;
  if(g.act==='scoop'){g.px=lerp(g.px,150,0.2);g.lift=lerp(g.lift,0.05,0.2);if(g.at===20){snd('scoop');g.heat=1}if(g.at>50){g.act='walk';g.at=0}}
  else if(g.act==='walk'){g.px=Math.min(PX,g.px+1.6);if(g.T%5===0){const c=cup(g);spark(g,c.cx,c.cy,rr(-0.3,0.3),rr(-0.5,0),0.7,2)}if(g.px>=PX){g.act='ready';g.at=0}}
  else if(g.act==='ready'||g.act==='lift'){g.heat=Math.max(0,g.heat-0.0028);g.aim=clamp(g.aim+(pad.x||0)*0.012,-0.5,0.9);
    if(pad.fire){g.act='lift';g.lift=Math.min(1,g.lift+0.018);if(g.lift>0.97&&g.T%4===0)g.lift-=0.01}
    else if(g.act==='lift'){strike(g);g.act='watch';g.at=0}
    if(g.T%(g.act==='lift'?3:9)===0){const c=cup(g);spark(g,c.cx,c.cy+2,rr(-0.2,0.2),0.3,0.6*g.heat+0.2,2);if(g.T%18===0)snd('drip')}
    if(g.heat<=0.05){g.res.push(0);g.pops.add(PX,GY-70,'铁水凉透了',0xd8c8c0,{size:11,life:50});g.act='watch';g.at=0}}
  else if(g.act==='watch'){g.lift=lerp(g.lift,0.1,0.06);if(g.at>110){g.throws++;if(g.throws>=THROWS){g.state='end';g.et=0;for(const s of g.str)if(!s.lit){s.lit=1;s.k=0}const sc=g.score;if(sc>(g.sv.best||0)){g.sv.best=sc;if(!g.auto)STORE.set('ifl1',g.sv)}}else{g.act='back';g.at=0}}}
  else if(g.act==='back'){g.px-=1.8;if(g.px<=150){g.act='scoop';g.at=0}}}
// ---------------- autoplay: aim at the nearest unlit string, raise to the top, strike before the iron cools ----------------
function ai(g){const pad={x:0,y:0,a:false,b:false,fire:false};if(g.state==='end'){pad.a=g.et>580;return pad}if(g.state!=='play')return pad;
  if(g.act==='ready'||g.act==='lift'){const un=g.str.filter(s=>!s.lit);const tx=un.length?un[(g.throws*3)%un.length].x:SX;const want=clamp(Math.atan2((tx+SX)/2-PX,150),-0.5,0.9);pad.x=Math.abs(want-g.aim)>0.03?Math.sign(want-g.aim):0;
    const stop=0.9+hash(g.throws,5)*0.08-(hash(g.throws,9)<0.15?0.35:0);pad.fire=g.at>30&&(g.act!=='lift'||g.lift<stop)}return pad}
// ---------------- drawing ----------------
function light(g){// decay last frame's light, add every spark (hot ones far brighter), blur, add the static lights
  const L=g.L,Lt=g.Lt;for(let i=0;i<L.length;i++)L[i]*=0.55;
  for(let i=0;i<g.n;i++){const t=g.ft[i];const cx=(g.fx[i]/4)|0,cy=(g.fy[i]/4)|0;if(cx<0||cy<0||cx>=LW||cy>=LH)continue;L[cy*LW+cx]+=t*t*0.09}
  for(const s of g.str)if(s.lit&&!s.done){const cx=(s.x/4)|0,cy=((s.y0+s.k*3.4)/4)|0;if(cy<LH)L[cy*LW+cx]+=0.8}
  for(let pass=0;pass<3;pass++){for(let y=0;y<LH;y++)for(let x=0;x<LW;x++){let s=0,n=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const X=x+dx,Y=y+dy;if(X>=0&&Y>=0&&X<LW&&Y<LH){s+=L[Y*LW+X];n++}}Lt[y*LW+x]=s/n}L.set(Lt)}
  // a wide wash so a big burst lights the whole square, not just around the sparks
  let tot=0;for(let i=0;i<g.n;i++)tot+=g.ft[i]*g.ft[i];return Math.min(0.55,tot*0.0003)+g.flash*0.25}
function draw(g){const Al=bake(),T=g.T;const wash=light(g),L=g.L;
  // furnace light flickers
  const fk=0.85+0.15*vnoise(T*0.1,1,4);
  for(let y=0;y<H;y++){const ly=y/4-0.5,y0=clamp(Math.floor(ly),0,LH-1),y1=Math.min(LH-1,y0+1),fy=clamp(ly-y0,0,1);for(let x=0;x<W;x++){const lx=x/4-0.5,x0=clamp(Math.floor(lx),0,LW-1),x1=Math.min(LW-1,x0+1),fx=clamp(lx-x0,0,1);
    const l=(L[y0*LW+x0]*(1-fx)+L[y0*LW+x1]*fx)*(1-fy)+(L[y1*LW+x0]*(1-fx)+L[y1*LW+x1]*fx)*fy+ST[y0*LW+x0]*fk+wash*(y>40?1:0.6);
    const c=Al[y*W+x];const r=(c>>16&255)*(0.2+l*1.5),gg=(c>>8&255)*(0.22+l*1.05),b=(c&255)*(0.34+l*0.55);col[y*W+x]=(Math.min(255,r)<<16)|(Math.min(255,gg)<<8)|Math.min(255,b);em[y*W+x]=0}}
  // the furnace mouth and the molten iron inside
  for(let y=196;y<212;y++)for(let x=140;x<158;x++){const d=Math.hypot(x-149,(y-208)*1.5)/14;K.px(x,y,bb(1-d*0.6+0.1*vnoise(x*0.4,y*0.4+T*0.1,2)),200)}
  // firecracker strings
  for(const s of g.str){for(let k=0;k<s.n;k++){const y=s.y0+k*3.4;if(s.lit&&k<s.k)continue;const sw=Math.sin(T*0.03+s.x)*0.5;for(let j=0;j<3;j++){K.px(s.x+sw-1,y+j,0xe8483a);K.px(s.x+sw,y+j,0xc8281e);K.px(s.x+sw+1,y+j,0x8a1410)}K.px(s.x+sw,y-1,0xf0c040)}}
  for(const s of g.smoke)K.disca(s.x,s.y,s.r,0x8a8aa0,0.25*(1-s.t/260));
  for(const p of g.paper)K.px(p.x,p.y,p.c);
  performer(g);
  // the sparks: a hot head and a short streak behind it
  for(let i=0;i<g.n;i++){const t=g.ft[i],x=g.fx[i],y=g.fy[i];const c=bb(t),e=t>0.55?Math.round((t-0.55)*300):0;const vx=g.fvx[i],vy=g.fvy[i],sp=Math.hypot(vx,vy);
    K.px(x,y,c,e);if(sp>0.8&&t>0.2){const n=Math.min(9,sp*1.6|0);for(let k=1;k<=n;k++)K.pxa(x-vx*k*0.55,y-vy*k*0.55,bb(t-k*0.04),0.75-k*0.07,0)}}
  // the crowd in the foreground, black against the sparks, with warm rims when the sky is bright
  crowd(g,wash);
  g.pops.draw(0,0);hud(g)}
function performer(g){// a man in an inside-out sheepskin coat and a straw hat, the cup stick in his left hand, the striker in his right
  const T=g.T,x=Math.round(g.px),gy=GY,walk=g.act==='walk'||g.act==='back',ph=Math.sin(T*0.25),bend=g.act==='scoop'?6:g.act==='ready'?2:0;const lit=(c,k)=>mx(c,0xffc070,Math.round(clamp(k,0,1)*120));
  const glow=clamp(g.flash+0.2,0,1);
  for(const s of[-1,1]){const fx=x+(walk?Math.round(ph*s*4):s*3);K.line(x+s*2,gy-16,fx,gy-1,0x1a1a2a);K.line(x+s*2+1,gy-16,fx+1,gy-1,0x2a2a3a);K.px(fx,gy,0x0a0a10);K.px(fx+1,gy,0x0a0a10)}
  for(let j=0;j<16;j++)for(let q=-5-(j>10?1:0);q<=5+(j>10?1:0);q++){const c=hash(q+x*0,j)<0.3?0xd8ccb0:0xbcae90;K.px(x+q+Math.round(bend*j/16),gy-31+j+bend,lit(q>2?mx(c,0x000000,40):c,glow*(q>0?1:0.5)))}
  const hx=x+bend,hy=gy-35+bend;for(let j=-3;j<=3;j++)for(let q=-3;q<=3;q++)if(q*q+j*j<=11)K.px(hx+q,hy+j,lit(0x8a5a3a,glow));for(let q=-9;q<=9;q++){K.px(hx+q,hy-3+Math.abs(q)*0.15,lit(0xc8a860,glow));K.px(hx+q,hy-2+Math.abs(q)*0.15,lit(0x8a7040,glow))}for(let j=0;j<4;j++)for(let q=-4+j;q<=4-j;q++)K.px(hx+q,hy-7+j,lit(0xd8b870,glow));
  // the cup stick
  const c=cup(g);K.line(c.sx,c.sy,c.cx,c.cy,0x5a3a20);K.line(c.sx+1,c.sy,c.cx+1,c.cy,0x3a2414);for(let j=-2;j<=1;j++)for(let q=-2;q<=2;q++)K.px(c.cx+q,c.cy+j,j<0&&g.act!=='watch'&&g.act!=='back'?bb(g.heat*0.95):0x3a3a40,j<0&&g.act!=='watch'?Math.round(g.heat*220):0);
  // the striker held low, ready to come up
  const sa=g.act==='watch'&&g.at<8?1.2-g.at*0.05:-0.3;K.line(x+4,gy-24,x+4+Math.cos(sa)*26,gy-24-Math.sin(sa)*26,0x6a4a28);
  if(g.act==='lift'||g.act==='ready')K.glow(c.cx,c.cy,10,0xff9a40,0.12*g.heat)}
function crowd(g,wash){const rimk=Math.round(clamp(wash*2.2+g.flash*0.5,0,1)*170),rim=mx(0x2a2028,0xffb060,rimk);
  for(let k=0;k<24;k++){const x=k*21+((k*13)%9)-8,r=5+(k%3),hy=H-24-((k*5)%4)*2+(g.flash>0.5&&k%3===0?-1:0);const kid=false;
    const sw=r*2.6;for(let y=hy+r;y<H;y++)for(let q=-sw;q<=sw;q++){const u=q/sw,top=hy+r+4+u*u*14;if(y<top)continue;K.px(x+q,y,y<top+1.2&&u>-0.3?rim:0x0c0a12)}
    for(let y=hy+r-2;y<hy+r+5;y++)for(let q=-2;q<=2;q++)K.px(x+q,y,0x0c0a12);
    for(let y=-r;y<=r;y++)for(let q=-r;q<=r;q++){const d=q*q+y*y;if(d>r*r)continue;K.px(x+q,hy+y,y<-r*0.3&&d>(r-1.3)**2&&q>-r*0.4?rim:0x0c0a12)}
    if(k%3===0)for(let q=-r-1;q<=r+1;q++)for(let j=0;j<3;j++)K.px(x+q,hy-r*0.4-j,j===2&&q>-2?rim:0x14101a);
    if(kid){const kx=x+3,ky=hy-14;for(let y=-4;y<=4;y++)for(let q=-4;q<=4;q++)if(q*q+y*y<=16)K.px(kx+q,ky+y,y<-2&&q>-1?rim:0x0c0a12);for(let y=ky+4;y<hy-r+2;y++)for(let q=-5;q<=5;q++)K.px(kx+q,y,0x0c0a12)}}}
function hud(g){if(g.state==='intro'){const a=clamp((g.it-20)/30,0,1)*clamp((170-g.it)/30,0,1);K.text('打 铁 花',240,74,0xffd890,{size:30,bold:true,fam:'kai',align:'c',a,sp:10,ink:0x2a0a04});K.text('正月十五，村口搭起花棚。铁水化好了，看谁的铁花开得高。',240,112,0xf0e0d0,{size:10,align:'c',a,ink:0x000000});return}
  if(g.state==='end'){const a=clamp((g.et-160)/40,0,1);if(a<=0)return;const good=g.res.filter(q=>q>0.82).length;K.text('铁花落尽',240,40,0xffe0a0,{size:20,fam:'kai',align:'c',a,sp:4,ink:0x000000});
    K.text('满天星 '+good+' 回 · 开花 '+g.flowers+' 朵 · 鞭炮 '+g.str.filter(s=>s.lit).length+' 挂 · 得分 '+g.score+(g.sv.best?' · 最高 '+g.sv.best:''),240,66,0xf8e8d0,{size:10,align:'c',a,ink:0x000000});return}
  K.text('第 '+Math.min(THROWS,g.throws+1)+'/'+THROWS+' 棒',12,8,0xf0e0d0,{size:11,ink:0x000000});K.text(g.score+'',W-12,8,0xffe0a0,{size:12,align:'r',ink:0x000000});
  if(g.act==='ready'||g.act==='lift'){UI.bar(12,26,60,4,g.heat,mix(0x8a2410,0xffd060,g.heat));K.text('铁水',76,23,0xf0e0d0,{size:8,ink:0x000000});UI.bar(12,36,60,4,g.lift,0xd8e0f0);K.text('举高',76,33,0xf0e0d0,{size:8,ink:0x000000});
    const c=cup(g);for(let k=4;k<26;k+=3)K.pxa(c.cx+Math.sin(g.aim)*k,c.cy-Math.cos(g.aim)*k,0xffe0a0,0.5);
    if(!g.auto)K.text('按住 J 举棒，松手就打 · ←→ 瞄准 · 铁水凉了花就小',240,H-8,0xf0e0d0,{size:9,align:'c',ink:0x000000})}}
function info(g){return '打铁花 · 第 '+Math.min(THROWS,(g.throws||0)+1)+'/'+THROWS+' 棒 · '+(g.score||0)+' 分'+(g.sv&&g.sv.best?' · 最高 '+g.sv.best:'')}
return{init,tick,draw,ai,info}})();
GAMES.push({id:'ironflower',name:'打铁花',ref:'手艺 · 雪夜村口',keys:'按住 J 把盛铁水的花棒举高，松手另一根棒从下面打上去 · 举得越高花越大，但铁水一直在变凉 · ←→ 瞄准，打到花棚上的鞭炮就点着 · 手机：摇杆 + 按钮',touch:'stick',tbtn:['举棒 / 打'],thumbAt:378,
  init:IFL.init,tick:IFL.tick,draw:IFL.draw,ai:IFL.ai,info:IFL.info,canAttract:g=>g.state==='intro'||g.throws===0,
  about:['正月十五的雪夜，村口搭起花棚，柳枝铺顶，挂满鞭炮。打花的人披着反穿的羊皮袄，从炉子里舀出白热的铁水。','举棒、松手、一棒打上天：铁水碎成几千颗火星，撞上柳枝又炸开一层。整个村子只有这些火星照亮。'],
  tags:['每一颗火星都有自己的温度，按黑体颜色由白变红','火星是场景里真正的光：逐帧画进光照图再照亮雪、屋顶和人','撞上花棚柳枝的火星会再分裂开花','举得越高越好，但铁水在变凉，要抢时间','打到鞭炮就从上往下一路炸响']});



// ================= 守灯塔: a storm night from the lighthouse gallery; the ships follow your beam =================
// You are the keeper. Fishing boats come home through the rain and cannot see the reef. Any boat inside the pool of your light
// turns toward its centre, so you lead them, one pool at a time, between the rocks to the harbour mouth. The lamp is heavy and
// swings slowly. Rocks only show where the light (or lightning) falls on them, and the foam they throw lingers a while.
const LIGHT=(function(){const {W,H,S,mix,clamp,lerp,hash,rnd,rr,vnoise,sstep}=K;const col=S.col,em=S.em;
const rgb=(r,g,b)=>(clamp(r|0,0,255)<<16)|(clamp(g|0,0,255)<<8)|clamp(b|0,0,255);
const HZ=52,F=250,HC=14,Q=0.6,CX=240,ZMIN=30,SPR=17;// horizon row, focal length, eye height (m), depth squash, spot radius (m)
const zOf=y=>F*HC/((y-HZ)*Q),yOf=z=>HZ+F*HC/(z*Q),PP=z=>F/(z*Q),xOf=(x,z)=>CX+x*PP(z);
const MOUTH=[-14,47],ROCKS=[[38,330,7],[-60,300,8],[70,250,9],[18,265,6],[-20,205,7],[50,180,8],[-5,140,6],[32,118,7],[10,85,5],[100,140,9]];
const CHAN=[[0,420],[-5,370],[0,300],[-25,265],[-5,235],[15,205],[20,160],[12,125],[-15,108],[-22,95],[-18,70],[-14,48]];
// tileable wave texture
const TS=128,TEX=new Float32Array(TS*TS);for(let y=0;y<TS;y++)for(let x=0;x<TS;x++){let v=0;for(const [f,a] of [[4,0.6],[8,0.3],[16,0.15]]){const u=x/TS*f,w=y/TS*f,X=Math.floor(u),Y=Math.floor(w),fx=u-X,fy=w-Y,
  h=(i,j)=>hash(((X+i)%f+f)%f,((Y+j)%f+f)%f+f*31),sx=fx*fx*(3-2*fx),sy=fy*fy*(3-2*fy);v+=a*lerp(lerp(h(0,0),h(1,0),sx),lerp(h(0,1),h(1,1),sx),sy)}TEX[y*TS+x]=v/1.05}
const tex=(u,v)=>TEX[((v|0)&127)*TS+((u|0)&127)];
let ROWZ=null,SKY=null;
function bake(){ROWZ=new Float32Array(H);for(let y=0;y<H;y++)ROWZ[y]=y>HZ?zOf(y+0.5):1e9;
  SKY=new Uint8Array(W*HZ);for(let y=0;y<HZ;y++)for(let x=0;x<W;x++){const a=x/W*Math.PI*2,c=Math.cos(a),s=Math.sin(a);
    const n=vnoise(c*7+y*0.05,s*7+y*0.16,3)*0.65+vnoise(c*18+20,s*18+y*0.35,4)*0.35,b=n<0.36?0:n<0.5?1:n<0.62?2:n<0.72?3:4;SKY[y*W+x]=b}}
// the coast on the left: cliffs, the breakwater, the town; land where world x is left of this line
const coast=z=>z<46?-20:-20-(z-46)*0.3-Math.max(0,z-200)*0.2;
function init(g){if(!ROWZ)bake();g.T=0;g.sv=STORE.get('light1',{best:0});g.pops=Pops();g.st='intro';g.it=0;g.sp=[0,300];g.tg=[0,300];g.ships=[];g.foam=ROCKS.map(()=>0);
  g.saved=0;g.lost=0;g.n=0;g.total=9;g.next=60;g.bolt=0;g.boltT=rr(300,500)|0;g.boltX=0;g.rain=[];for(let i=0;i<420;i++)g.rain.push({x:rnd()*W,y:rnd()*H,v:rr(5,8),l:rr(4,9)|0});
  g.dawn=0;g.et=0;g.aiK=null;g.aiT=0;g.sink=[];g.wake=[]}
function snd(g,n,v){if(!K.live()||g.thumb)return;const t=K.now();
  if(n==='thunder'){const d=v||0.4;K.noise(2.6,0.16,t+d,'lowpass',300,40,0.6);K.noise(0.4,0.12,t+d*0.6,'lowpass',2000,200,0.6)}
  else if(n==='horn'){K.tone('sawtooth',98,96,1.4,0.03,t,0.15);K.tone('sawtooth',147,145,1.4,0.02,t,0.15)}
  else if(n==='bell'){for(let i=0;i<3;i++)K.tone('sine',740,740,1.2,0.03,t+i*0.45)}
  else if(n==='crack'){K.noise(0.5,0.12,t,'lowpass',900,120,0.7);K.tone('sine',120,40,0.6,0.06,t)}
  else if(n==='lamp'){if(SFX.ok('lamp',0.2))K.noise(0.15,0.01,t,'bandpass',300,200,2)}}
function beds(g){if(!K.live()||g.thumb)return;const k=1-g.dawn;K.bed('rain','highpass',3000,0.5);K.bedSet('rain',0.05*k+0.005,3500);K.bed('sea','lowpass',260,0.7);K.bedSet('sea',0.07*k+0.02,220+100*Math.sin(g.T*0.013));K.bed('wind','bandpass',600,1.5);K.bedSet('wind',0.03*k,400+300*Math.sin(g.T*0.007))}
function spawn(g){const x=rr(-90,110),z=rr(400,440);g.ships.push({x,z,h:Math.atan2(rr(-60,40)-x,z-60),v:rr(0.24,0.3),st:'sail',lit:0,id:g.n,kind:g.n%3,lt:0});g.n++;snd(g,'horn')}
function tick(g,pad){g.T++;g.pops.tick();beds(g);const T=g.T;
  for(const r of g.rain){r.y+=r.v;r.x-=r.v*0.35;if(r.y>H){r.y=-10;r.x=rnd()*(W+60)}}
  if(g.bolt>0)g.bolt--;if(--g.boltT<=0&&g.dawn<0.5){g.bolt=12;g.boltX=rr(40,440);g.boltT=rr(260,520)|0;snd(g,'thunder',rr(0.3,1.2))}
  for(let i=0;i<ROCKS.length;i++)g.foam[i]=Math.max(0,g.foam[i]-0.004);
  for(const w of g.wake)w.l--;g.wake=g.wake.filter(w=>w.l>0);for(const s of g.sink)s.t++;g.sink=g.sink.filter(s=>s.t<200);
  if(g.st==='intro'){g.it++;if(g.it>200||g.it>40&&(pad.a||pad.b)&&!g.auto)g.st='play';return}
  if(g.st==='end'){g.et++;g.dawn=Math.min(1,g.dawn+0.004);if(g.et>660&&(pad.a||g.auto&&g.et>740)){init(g);g.st='play'}return}
  // the lamp: the spot chases where you point, but slowly
  if(g.auto)aiAim(g);else{const m=pad.mouse;if(m&&m.y>HZ+4){const z=clamp(zOf(m.y),ZMIN+6,460);g.tg=[(m.x-CX)/PP(z),z]}else if(pad.x||pad.y){g.tg[0]+=pad.x*1.4;g.tg[1]=clamp(g.tg[1]-pad.y*2.4,ZMIN+6,460)}}
  const dx=g.tg[0]-g.sp[0],dz=g.tg[1]-g.sp[1],dd=Math.hypot(dx*1.5,dz),mv=Math.min(dd,0.9+g.sp[1]*0.006);if(dd>0.01){g.sp[0]+=dx*1.5/dd*mv/1.5;g.sp[1]+=dz/dd*mv;if(mv>0.5)snd(g,'lamp')}
  // reveal rocks where the light falls
  ROCKS.forEach((r,i)=>{if(Math.hypot(r[0]-g.sp[0],r[1]-g.sp[1])<SPR+r[2]||g.bolt>6)g.foam[i]=1});
  if(--g.next<=0&&g.n<g.total){spawn(g);g.next=g.n<3?520:rr(380,560)|0}
  for(const s of g.ships){if(s.st!=='sail')continue;const d=Math.hypot(s.x-g.sp[0],s.z-g.sp[1]),inL=d<SPR;s.lit=inL?1:Math.max(0,s.lit-0.03);
    if(inL&&d>2){const want=Math.atan2(g.sp[0]-s.x,-(g.sp[1]-s.z));let da=want-s.h;while(da>Math.PI)da-=2*Math.PI;while(da<-Math.PI)da+=2*Math.PI;s.h+=clamp(da,-0.02,0.02)}
    const sp=s.v*(0.4+0.6*s.lit);s.x+=Math.sin(s.h)*sp+0.02;s.z-=Math.cos(s.h)*sp;s.lt++;if(s.lt%8===0)g.wake.push({x:s.x,z:s.z,l:120});
    for(let i=0;i<ROCKS.length;i++){const r=ROCKS[i];if(Math.hypot(s.x-r[0],s.z-r[1])<r[2]+2){s.st='wreck';g.lost++;g.foam[i]=1;g.sink.push({x:s.x,z:s.z,t:0,k:s.kind});snd(g,'crack');g.pops.add(xOf(s.x,s.z),yOf(s.z)-20,'触礁',0xff9a8a,{size:10,life:70});break}}
    if(s.st==='sail'&&(s.x<coast(s.z)+1||s.z<ZMIN)){if(Math.hypot(s.x-MOUTH[0],s.z-MOUTH[1])<12){s.st='home';g.saved++;snd(g,'bell');g.pops.add(xOf(s.x,s.z),yOf(s.z)-24,'进港 '+g.saved,0xfff0b0,{size:11,life:80})}
      else{s.st='wreck';g.lost++;g.sink.push({x:s.x,z:s.z,t:0,k:s.kind});snd(g,'crack');g.pops.add(xOf(s.x,s.z),yOf(s.z)-20,'撞上岸',0xff9a8a,{size:10,life:70})}}
    if(s.st==='sail'&&Math.hypot(s.x-MOUTH[0],s.z-MOUTH[1])<10){s.st='home';g.saved++;snd(g,'bell');g.pops.add(xOf(s.x,s.z),yOf(s.z)-24,'进港 '+g.saved,0xfff0b0,{size:11,life:80})}
    if(s.x>220||s.z>520){s.st='lost';g.lost++}}
  g.ships=g.ships.filter(s=>s.st==='sail');
  if(g.n>=g.total&&g.ships.length===0){g.st='end';g.et=0;if(g.saved>g.sv.best){g.sv.best=g.saved;STORE.set('light1',g.sv)}}}
// ---------------- autoplay: lead the ship nearest to trouble along the safe channel ----------------
function chanAhead(s,ahead){let bi=0,bd=1e9;for(let i=0;i<CHAN.length;i++){const d=Math.hypot(CHAN[i][0]-s.x,CHAN[i][1]-s.z);if(CHAN[i][1]<s.z+4&&d<bd){bd=d;bi=i}}
  const i=Math.min(CHAN.length-1,bi+(bd<14?1:0));const c=CHAN[i],dx=c[0]-s.x,dz=c[1]-s.z,l=Math.hypot(dx,dz)||1;return[s.x+dx/l*Math.min(ahead,l),s.z+dz/l*Math.min(ahead,l)]}
function danger(s){let k=0;for(let t=0;t<220;t+=10){const x=s.x+(Math.sin(s.h)*s.v*0.4+0.02)*t,z=s.z-Math.cos(s.h)*s.v*0.4*t;for(const r of ROCKS)if(Math.hypot(x-r[0],z-r[1])<r[2]+5)return 300-t;if(x<coast(z)&&Math.hypot(x-MOUTH[0],z-MOUTH[1])>12)return 250-t}return k}
function aiAim(g){g.aiT--;let s=g.ships.find(q=>q.id===g.aiK);
  if(!s||g.aiT<=0){let best=null,bv=-1;for(const q of g.ships){const v=danger(q)+(q.id===g.aiK?40:0);if(v>bv){bv=v;best=q}}s=best;g.aiK=s?s.id:null;g.aiT=150}
  if(!s){g.tg=[0,300];return}const p=chanAhead(s,10);g.tg=[p[0],p[1]]}
function ai(g){const pad={x:0,y:0,a:false,b:false,fire:false};if(g.st==='end')pad.a=g.et>720;return pad}
// ---------------- drawing ----------------
function inTri(px,py,a,b,c){const s=(x0,y0,x1,y1)=>(px-x1)*(y0-y1)-(x0-x1)*(py-y1);const d1=s(a[0],a[1],b[0],b[1]),d2=s(b[0],b[1],c[0],c[1]),d3=s(c[0],c[1],a[0],a[1]);return!((d1<0||d2<0||d3<0)&&(d1>0||d2>0||d3>0))}
function ship(sx,sy,sc,h,lit,kind,sinkT){// a little fishing boat seen from the lighthouse: hull, wheelhouse, mast with a lamp; turns with its heading
  const w=Math.max(2,9*sc),hh=Math.max(1,2.6*sc),side=Math.sin(h),lean=sinkT?Math.min(1,sinkT/80):0,dn=sinkT?sinkT*sc*0.04:0;sy+=dn;
  const L=Math.abs(side)*w*0.9,base=lit>0.1?mix(0x1a2030,0x8a96a8,lit):0x0c1018,hull=kind===1?mix(base,0x6a2a2a,0.5):kind===2?mix(base,0x2a4a6a,0.5):base;
  const half=w/2+L/2;for(let y=0;y<hh;y++){const k=1-y/hh*0.25;for(let x=-half*k;x<=half*k;x++){const X=sx+x+(side>0?1:-1)*L*0.0,Y=sy-y+Math.round(x*lean*0.3);K.px(X,Y,y===0?0x060810:hull)}}
  const cw=Math.max(1,3*sc),ch=Math.max(1,2.4*sc),cx0=sx-cw/2-side*w*0.2;for(let y=0;y<ch;y++)for(let x=0;x<cw;x++)K.px(cx0+x,sy-hh-y+Math.round((x-cw/2)*lean*0.3),lit>0.1?mix(0x2a3040,0xc8ccd8,lit):0x141a24);
  if(sc>0.5)for(let x=1;x<cw-1;x+=Math.max(2,sc*1.2|0))K.px(cx0+x,sy-hh-ch*0.5,0xffc860,120);
  const mx=sx+side*w*0.25,mh=Math.max(3,8*sc);for(let y=0;y<mh;y++)K.px(mx,sy-hh-y-y*lean*0.6,0x0a0c14);if(!sinkT||sinkT<60){K.px(mx,sy-hh-mh,0xf0fff0,220);K.glow(mx,sy-hh-mh,3+sc*2,0xd8ffe0,0.25)}
  if(!sinkT){const fw=w*0.5+1;for(let x=-fw;x<=fw;x++)if(hash(x|0,(sy|0)+(K.S.frame>>2))<0.5)K.px(sx+x-side*w*0.5,sy+1,0xd8e0e8,160)}}
function draw(g){em.fill(0);const T=g.T,fl=g.bolt>0?(g.bolt>9?1:g.bolt>6?0.4:g.bolt>4?0.8:0.2):0,dw=g.dawn;
  // sky: storm cloud bands, lit from below by lightning, warming at dawn
  const SP=[0x080b14,0x0e1420,0x151d2c,0x1e2838,0x2a3646].map(c=>c);const sp=(c,y)=>{if(fl)c=mix(c,0xb8c8e8,fl*0.55*(0.5+0.5*y/HZ));if(dw)c=mix(c,mix(0xf0a070,0x6a7aa0,1-y/HZ),dw*0.85);return c};
  for(let y=0;y<HZ;y++){const pl=SP.map(c=>sp(c,y)),off=(T>>3)+y*0;for(let x=0;x<W;x++)col[y*W+x]=pl[SKY[y*W+((x+off)%W)]]}
  if(fl>0.5){let x=g.boltX,y=0;while(y<HZ+4){const nx=x+rr(-6,6);K.line(x,y,nx,y+6,0xffffff,200);if(rnd()<0.15)K.line(nx,y+6,nx+rr(-12,12),y+14,0xc8d8ff,120);x=nx;y+=6}}
  // the sea: wave texture in perspective, a dark ambient, the beam's pool and its glitter
  const sx0=g.sp[0],sz0=g.sp[1],t=T*0.35;
  const BASE=[0x08101c,0x0d1726,0x142234,0x1e3044],LIT=[0x2a3a46,0x5a6a74,0xb8c4c4,0xfff6e0],LK=[0,0.08,0.2,0.42,0.7,1],PAL=new Uint32Array(4*6*4);
  for(let f=0;f<4;f++)for(let L=0;L<6;L++)for(let b=0;b<4;b++){let c=mix(BASE[b],LIT[b],LK[L]);if(fl)c=mix(c,b>=2?0x9ab0d0:0x4a5a78,fl*0.7);if(dw)c=mix(c,b>=3?0xf0c0a0:mix(0x3a4a68,0x6a6a80,b/3),dw*0.8);PAL[(f*6+L)*4+b]=mix(c,fl?0x6a7898:dw?0x9a8a98:0x0e141e,f*0.17)}
  const R2=SPR*SPR,TH2=[0.5,0.8,1.1,1.35,1.6].map(k=>k*k*R2);
  for(let y=HZ;y<H;y++){const z=ROWZ[y],row=y*W,fq=Math.min(3,Math.max(0,(z-90)/110|0)),ip=1/PP(z),dz=(z-sz0)*0.9,dz2=dz*dz,v1=z*3-t*1.4,v2=z*1.2+t*0.5;for(let x=0;x<W;x++){const wx=(x-CX)*ip;
      const n=tex(wx*0.8+t*0.5,v1)*0.65+tex(wx*0.35-t*0.2,v2)*0.35,b=n<0.42?0:n<0.56?1:n<0.68?2:3,ex=wx-sx0,d2=ex*ex+dz2;
      const L=d2<TH2[0]?5:d2<TH2[1]?4:d2<TH2[2]?3:d2<TH2[3]?2:d2<TH2[4]?1:0;col[row+x]=PAL[(fq*6+L)*4+b];if(L>=4&&b===3)em[row+x]=60}}
  // the coast on the left: cliffs, breakwater with its red and green lights, and the town above
  for(let y=HZ-6;y<H;y++){const z=y>HZ?ROWZ[y]:900,cx_=Math.round(xOf(coast(Math.min(z,900)),Math.min(z,900)));for(let x=0;x<Math.min(W,cx_);x++){const top=y<HZ+2;const n=vnoise(x*0.08,y*0.12,7),bd=n<0.4?0:n<0.65?1:2;let c=fl?[0x1e2638,0x2a3448,0x3a4660][bd]:dw?[0x2a2232,0x3a3040,0x4a3c4a][bd]:[0x040609,0x06090e,0x0a0e14][bd];if(x>cx_-3)c=fl?0x6a7898:dw?0x6a5050:0x10151e;if(top)c=0x04060a;col[y*W+x]=c}
    if(y>HZ+2)for(let k=0;k<3;k++)if(hash(cx_+k,(y*7+(T>>2))|0)<0.45-k*0.12)K.pxa(cx_+k,y,0xd8e0e8,0.5-k*0.12)}
  const town=[[10,60],[18,90],[6,72],[14,120],[24,150],[8,104],[30,190],[12,82],[40,240]];for(const [dx0,z] of town){const x=coast(z)-dx0;const X=xOf(x,z),Y=yOf(z)-10;for(let i=0;i<4;i++){K.px(X+i*2,Y,0xffc070,140);K.px(X+i*2,Y-3,0xffb050,100)}K.glow(X+3,Y,6,0xffa040,0.25);for(let k=1;k<12;k+=2)K.pxa(X+3,Y+10+k,0xffa040,0.3*(1-k/12))}
  const bx=xOf(MOUTH[0]-4,MOUTH[1]),by=yOf(MOUTH[1]);K.rect(bx-30,by-3,32,4,0x0a0c12);const bl=(T>>4)&1;K.px(bx,by-6,0xff3a2a,bl?230:60);K.glow(bx,by-6,6,0xff3a2a,bl?0.4:0.1);
  const gx=xOf(MOUTH[0]+8,MOUTH[1]-2),gy=yOf(MOUTH[1]-2);K.rect(gx-1,gy-3,6,4,0x0a0c12);K.px(gx+2,gy-6,0x3aff7a,bl?60:230);K.glow(gx+2,gy-6,6,0x3aff7a,bl?0.1:0.4);
  // rocks and their foam, visible only while lit or remembered
  const Q=[];ROCKS.forEach((r,i)=>{if(g.foam[i]>0.02||fl)Q.push({z:r[1],f:()=>{const X=xOf(r[0],r[1]),Y=yOf(r[1]),s=PP(r[1]),a=Math.max(g.foam[i],fl),lit=Math.max(0,1-Math.hypot(r[0]-sx0,r[1]-sz0)/(SPR+r[2]));const rw=r[2]*s;
    for(let k=0;k<rw*1.6;k++){const u=k/(rw*1.6)*2-1,hgt=Math.round((1-u*u)*rw*0.7*(0.7+0.3*hash(i,k)));for(let j=0;j<hgt;j++)K.px(X+u*rw*0.9,Y-j,mix(0x05070c,j>hgt-2?0x9aa4b0:0x3a4250,lit*0.9+fl*0.4))}
    for(let k=0;k<rw*5;k++){const an=hash(k,i*7)*Math.PI*2,rr2=rw*(0.7+0.8*hash(k,i*7+1)),fx=X+Math.cos(an)*rr2,fy=Y+Math.sin(an)*rr2*0.32-(hash(k,(T>>3)+i)<0.08?2:0);if(hash(k,(T>>2)+i*13)<0.55)K.pxa(fx,fy,0xf0f4f8,a*(0.9-0.5*(rr2/rw-0.7)))}}})});
  for(const w of g.wake){if(w.z<ZMIN)continue;const X=xOf(w.x,w.z),Y=yOf(w.z),a=w.l/120*0.35;K.pxa(X-1,Y,0xc8d0d8,a);K.pxa(X+1,Y,0xc8d0d8,a)}
  for(const s of g.ships)Q.push({z:s.z,f:()=>ship(xOf(s.x,s.z),yOf(s.z),PP(s.z)*0.55,s.h,s.lit,s.kind,0)});
  for(const s of g.sink)Q.push({z:s.z,f:()=>ship(xOf(s.x,s.z),yOf(s.z),PP(s.z)*0.55,0.6,0.3,s.k,s.t)});
  Q.sort((a,b)=>b.z-a.z);for(const q of Q)q.f();
  // the beam: a wedge of lit rain from the lamp behind you out to the pool
  const PX=xOf(sx0,sz0),PY=yOf(sz0),r=PP(sz0)*SPR,O=[CX+40,H+30],A=[PX-r,PY],B=[PX+r,PY];
  for(const q of g.rain){const inB=dw<0.6&&inTri(q.x,q.y,O,A,B),c=inB?0xfff8e0:fl?0xa8b8d8:0x2a3444,a=inB?0.55:fl?0.4:0.35;for(let k=0;k<q.l;k++)K.pxa(q.x-k*0.35,q.y-k,c,a*(1-k/q.l))}
  if(dw<0.6){const y0=Math.max(HZ,Math.min(PY-r*0.4,H)),k0=0.08*(1-dw*1.6);for(let y=Math.floor(y0);y<H;y++){const t=(y-PY)/(O[1]-PY),xl=lerp(A[0],O[0]-6,t),xr=lerp(B[0],O[0]+6,t);for(let x=Math.max(0,xl|0);x<Math.min(W,xr);x++){const e=Math.abs((x-(xl+xr)/2)/((xr-xl)/2+0.01));const a=(e<0.4?1:e<0.75?0.6:0.3)*k0*(1-t*0.5);const p=y*W+x,o=col[p];col[p]=rgb((o>>16&255)+255*a,(o>>8&255)+246*a,(o&255)+220*a)}}}
  // the gallery rail in the foreground, wet and glinting
  for(let x=0;x<W;x++){for(let y=H-12;y<H-9;y++)col[y*W+x]=y===H-12?(fl?0x8a98b8:0x3a4458):0x0a0c12;for(let y=H-9;y<H;y++)if(x%26<3)col[y*W+x]=x%26===0?(fl?0x6a7898:0x2a3244):0x0a0c12}
  for(let k=0;k<12;k++){const x=(k*41+((T*0.7+k*97)|0)%40)%W,y=H-9+((T+k*13)>>1)%9;K.px(x,y,0xa8b8d0,120)}
  hud(g)}
function hud(g){if(g.st==='intro'){const a=clamp((g.it-20)/30,0,1)*clamp((200-g.it)/30,0,1);K.text('守 灯 塔',240,22,0xf0f4ff,{size:24,bold:true,fam:'kai',align:'c',a,sp:8,ink:0x060a14});
    K.text('暴风雨夜，渔船看不见暗礁。船会朝你的光走，用光把它们一条条领进港。',240,52,0xd8e0f0,{size:10,align:'c',a,ink:0x060a14});return}
  UI.frame(4,4,168,20,0x0a1020,{a:0.75});K.text('进港 '+g.saved+' · 触礁 '+g.lost+' · 还有 '+(g.total-g.n+g.ships.length)+' 条船',12,8,0xf0f4ff,{size:9,ink:0x000000});
  if(g.st==='end'){const a=clamp(g.et/50,0,1);K.text(g.saved>=g.total?'一条不少，全都回家了':'天亮了，进港 '+g.saved+' 条',240,90,0xfff4e0,{size:18,bold:true,fam:'kai',align:'c',a,ink:0x2a1a20});if(g.sv.best)K.text('最多 '+g.sv.best+' 条',240,118,0xfff0d0,{size:10,align:'c',a,ink:0x2a1a20})}
  if(!g.auto&&g.st==='play'&&g.T<1500)K.text('鼠标指向海面，或方向键移动光斑 · 船在光里会转向光的中心 · 红绿两盏灯中间是港口',240,H-22,0xf0f4ff,{size:9,align:'c',ink:0x060a14});
  g.pops.draw(0,0)}
function info(g){return '守灯塔 · 进港 '+(g.saved||0)+(g.sv&&g.sv.best?' · 最多 '+g.sv.best:'')}
return{init,tick,draw,ai,info}})();



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
function step(){const d=G.d;
  if(G.stop>0){G.stop--;S.frame++;return}
  let pad;
  if(mode==='play'){pad=readPad();const any=pad.x||pad.y||pad.fire||pad.a||pad.b||(pad.mouse&&(pad.mouse.down||pad.mouse.click));if(!any)idle++;else idle=0;
    if(idle>60*45&&(!d.canAttract||d.canAttract(G))){setMode('auto');G=newGame(d)}}
  else{pressed.clear();mouse.click=false;pad=d.ai(G)}
  d.tick(G,pad);G.t++;S.frame++;if(S.flash>0){S.flash*=0.86;if(S.flash<0.02)S.flash=0}}
function frame(){G.d.draw(G);S.raw=false;K.present();lg.putImageData(S.img,0,0);
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
let infoLast='';function syncInfo(){const d=G.d;const s=(d.info?d.info(G):'')+(mode==='play'?'':' · 演示中');if(s!==infoLast){$('info').textContent=s;infoLast=s}}
// ---------------- controls ----------------
const rail=$('rail');
function seg(label,opts,get,set){const l=document.createElement('span');l.className='lab';l.textContent=label;const s=document.createElement('div');s.className='seg';
  for(const[v,t]of opts){const b=document.createElement('button');b.type='button';b.textContent=t;b.onclick=()=>{set(v);sync()};b.dataset.v=v;s.appendChild(b)}
  const sync=()=>{for(const b of s.children)b.classList.toggle('on',String(b.dataset.v)===String(get()))};rail.append(l,s);sync();return sync}
const btn=(t,fn)=>{const b=document.createElement('button');b.type='button';b.className='btn';b.textContent=t;b.onclick=fn;rail.appendChild(b);return b};
const syncMode=seg('',[['play','我来玩'],['auto','看演示']],()=>mode,v=>{wake();setMode(v);G=newGame(GAMES[cur]);cv.focus()});
const playB=btn('暂停',()=>setPaused(!paused));
btn('重开',()=>{G=newGame(GAMES[cur]);frame();cv.focus()});
let sndUser=false;
const sndB=btn('声音 开',()=>{K.sndInit();sndUser=true;K.SND.on=!K.SND.on;syncSnd();if(K.SND.ctx&&K.SND.ctx.state==='suspended')K.SND.ctx.resume();if(!K.SND.on)K.bedsOff()});
function syncSnd(){const on=K.SND.on||!sndUser;sndB.textContent=on?'声音 开':'声音 关';sndB.classList.toggle('on',on)}
// sound comes on with the first key or touch (browsers need a gesture), unless the player turned it off
function wake(){if(sndUser)return;K.sndInit();if(K.SND.ctx){K.SND.on=true;if(K.SND.ctx.state==='suspended')K.SND.ctx.resume()}syncSnd()}
const info=document.createElement('span');info.id='info';rail.appendChild(info);
function setMode(m){mode=m;idle=0;syncMode();$('hint').textContent=m==='play'?(GAMES[cur].keys||''):'演示中 · 按任意键或点画面开始玩';if(G)G.auto=m==='auto';touchUI()}
function setPaused(p){paused=p;playB.textContent=p?'继续':'暂停'}
addEventListener('keydown',e=>{if(e.target.tagName==='INPUT')return;const gameKey=/^(Arrow|Key[WASDJKZX]|Space|Enter|Escape)/.test(e.code);
  if(e.code==='KeyP'){setPaused(!paused);return}
  if(gameKey&&(e.code==='Space'||e.code==='Enter')&&document.activeElement&&document.activeElement.tagName==='BUTTON')return;
  if(gameKey){wake();if(paused)setPaused(false);if(mode!=='play'){setMode('play');G=newGame(GAMES[cur]);e.preventDefault();return}if(!keys.has(e.code))pressed.add(e.code);keys.add(e.code);e.preventDefault()}});
addEventListener('keyup',e=>keys.delete(e.code));
addEventListener('blur',()=>{keys.clear();if(mode==='play'&&G&&G.d.onBlur)G.d.onBlur(G)});
function cpos(e){const r=cv.getBoundingClientRect();return[(e.clientX-r.left)/r.width*W,(e.clientY-r.top)/r.height*H]}
const coarse=matchMedia('(pointer: coarse)').matches;
cv.addEventListener('pointermove',e=>{const p=cpos(e);if(e.pointerId===stick.id){stick.x=p[0]-stick.ox;stick.y=p[1]-stick.oy}if(mode!=='play')return;mouse.x=p[0];mouse.y=p[1];mouse.active=true;mouse.touch=e.pointerType!=='mouse'});
cv.addEventListener('pointerdown',e=>{cv.focus();wake();const p=cpos(e);e.preventDefault();
  if(mode!=='play'){setMode('play');G=newGame(GAMES[cur]);return}
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
  b.addEventListener('pointerdown',e=>{e.preventDefault();wake();if(mode!=='play'){setMode('play');G=newGame(GAMES[cur]);return}TB[k]=true;TB[k+'p']=true});
  const up=()=>{TB[k]=false};b.addEventListener('pointerup',up);b.addEventListener('pointercancel',up);b.addEventListener('pointerleave',up);tb.appendChild(b);return b}
const tA=tbtn('A','a'),tB=tbtn('B','b');
function touchUI(){const d=GAMES[cur];const show=coarse&&d.tbtn&&mode==='play';tb.style.display=show?'flex':'none';if(show){tA.textContent=d.tbtn[0];tB.textContent=d.tbtn[1]||'B';tB.style.display=d.tbtn[1]?'':'none'}}
// ---------------- cartridges ----------------
const carts=$('carts');
function select(i){cur=i;const d=GAMES[i];mode='auto';G=newGame(d);$('nm').textContent=d.name;$('about').innerHTML=d.about.map(p=>'<p>'+p+'</p>').join('');$('tags').innerHTML=d.tags.map(t=>'<li>'+t+'</li>').join('');
  for(const[k,c]of [...carts.children].entries())c.classList.toggle('on',k===i);setMode(mode);try{history.replaceState(null,'','#'+d.id)}catch(e){}frame()}
GAMES.forEach((d,i)=>{const b=document.createElement('button');b.type='button';b.className='cart';const c=document.createElement('canvas');c.width=W;c.height=H;
  const nm=document.createElement('span');nm.className='nm';nm.textContent=d.name;const rf=document.createElement('span');rf.className='ref';rf.textContent=d.ref;b.append(c,nm,rf);
  b.onclick=()=>{select(i);stage.scrollIntoView({block:'nearest',behavior:'smooth'})};carts.appendChild(b);d._thumb=c});
// thumbnails are simulated one per task after the page is up, so it opens at once; the game being played just lends its live frame
function thumb(d){const keep=[cur,G];cur=GAMES.indexOf(d);G=newGame(d);G.auto=true;G.thumb=true;for(let k=0;k<(d.thumbAt||300);k++){const pad=d.ai(G);if(G.stop>0)G.stop--;else{d.tick(G,pad);G.t++}S.frame++}d.draw(G);S.raw=false;K.present();
  const g=d._thumb.getContext('2d');g.putImageData(S.img,0,0);cur=keep[0];G=keep[1]}
function thumbs(){const q=GAMES.slice();const one=()=>{const d=q.shift();if(!d)return;if(GAMES.indexOf(d)===cur){if(!d._lent){d._lent=1;q.push(d)}else{d.draw(G);S.raw=false;K.present();d._thumb.getContext('2d').putImageData(S.img,0,0)}}else thumb(d);setTimeout(one,30)};setTimeout(one,200)}
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
