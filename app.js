const $=(f,n)=>f.querySelector('[name='+n+']'),num=(f,n)=>+$(f,n).value,out=(f,h)=>f.querySelector('.out').innerHTML=h;
const rnd=s=>()=>((s=s*16807%2147483647)-1)/2147483646,D={};
function line(g,P,col,w,dash,close){g.beginPath();P.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));if(close)g.closePath();g.strokeStyle=col;g.lineWidth=w;g.setLineDash(dash||[]);g.stroke();g.setLineDash([])}
function dot(g,x,y,r,col){g.beginPath();g.arc(x,y,r,0,7);g.fillStyle=col;g.fill()}
function field(){const R=rnd(3),A=[];for(let y=0;y<24;y++){A[y]=[];for(let x=0;x<40;x++){const s=Math.exp(-((x-27)**2/40+(y-8)**2/30))+.8*Math.exp(-((x-8)**2/20+(y-18)**2/14));const red=.08+.22*s+(R()-.5)*.03,nir=.5-.2*s+(R()-.5)*.04;A[y][x]=(nir-red)/(nir+red)}}return A}
function col(n,t){return n<t?`hsl(${8+n*50},62%,${40+n*20}%)`:`hsl(${85+n*45},48%,${62-n*32}%)`}
function drawField(g,A,t){A.forEach((r,y)=>r.forEach((n,x)=>{g.fillStyle=col(n,t);g.fillRect(x*16,y*15,16,15)}))}
const mpp=.5,LAT0=51.1694,LON0=71.4491;
D.gps=(c,f)=>{const g=c.getContext('2d');function r(){const sg=num(f,'s'),n=num(f,'n'),R=rnd(7),T=[],P=[];
for(let i=0;i<120;i++){const a=i/120*6.283;T.push([320+110*Math.cos(a),180+110*Math.sin(a)]);P.push([T[i][0]+(R()+R()+R()-1.5)*sg*2,T[i][1]+(R()+R()+R()-1.5)*sg*2])}
const F=P.map((p,i)=>{let x=0,y=0;for(let j=-n;j<=n;j++){const q=P[(i+j+120)%120];x+=q[0];y+=q[1]}return[x/(2*n+1),y/(2*n+1)]});
const e=A=>(Math.sqrt(A.reduce((s,p,i)=>s+(p[0]-T[i][0])**2+(p[1]-T[i][1])**2,0)/120)*mpp).toFixed(1);
g.clearRect(0,0,640,360);P.forEach(p=>dot(g,p[0],p[1],2.5,'#9aa7b3'));line(g,T,'#12263A',1,[4,4],1);line(g,F,'#3E7D4F',2.5,0,1);
out(f,`Серые точки — сырой GPS, зелёная линия — после фильтра, пунктир — истинный путь. Ошибка (RMSE): сырые <b>${e(P)} м</b>, после фильтра <b>${e(F)} м</b>. (1 пиксель ≈ 0.5 м)`)}
f.addEventListener('input',r);r()};
D.traj=(c,f)=>{const g=c.getContext('2d'),O=[[200,120,28],[430,230,32],[330,300,24],[470,100,22],[150,250,26]];
function r(){const sh=$(f,'sh').value,av=$(f,'av').checked,P=[];
for(let i=0;i<160;i++){const a=i/160*6.283;let p=sh=='c'?[320+130*Math.cos(a),180+120*Math.sin(a)]:sh=='e'?[320+190*Math.sin(a),180+100*Math.sin(2*a)]:[320+190*Math.sin(2*a+.6),180+110*Math.sin(3*a)];
if(av)O.forEach(o=>{const dx=p[0]-o[0],dy=p[1]-o[1],d=Math.hypot(dx,dy);if(d<o[2]+14)p=[o[0]+dx/d*(o[2]+14),o[1]+dy/d*(o[2]+14)]});P.push(p)}
let L=0,k=0;P.forEach((p,i)=>{L+=Math.hypot(p[0]-P[(i+1)%160][0],p[1]-P[(i+1)%160][1]);if(O.some(o=>Math.hypot(p[0]-o[0],p[1]-o[1])<o[2]))k++});
g.clearRect(0,0,640,360);O.forEach(o=>dot(g,o[0],o[1],o[2],'#b5472f88'));line(g,P,'#3E7D4F',3,0,1);dot(g,P[0][0],P[0][1],6,'#D9A441');
out(f,`Длина маршрута: <b>${(L*mpp).toFixed(0)} м</b>. Точек внутри препятствий: <b>${k}</b>${k?' — маршрут небезопасен, включите обход':' — маршрут свободен'}.`)}
f.addEventListener('input',r);r()};
D.pid=(c,f)=>{const g=c.getContext('2d');function r(){const kp=num(f,'kp'),ki=num(f,'ki'),kd=num(f,'kd'),dt=.02;let x=0,v=0,I=0,pe=1,X=[];
for(let i=0;i<250;i++){const e=1-x;I+=e*dt;const u=kp*e+ki*I+kd*(e-pe)/dt;pe=e;v+=(u-.8*v)*dt;x+=v*dt;if(Math.abs(x)>5)x=Math.sign(x)*5;X.push(x)}
g.clearRect(0,0,640,360);line(g,[[0,190],[640,190]],'#D9A441',1.5,[6,4]);line(g,X.map((x,i)=>[i*2.56,330-x*140]),'#3E7D4F',3);
const os=Math.max(0,(Math.max(...X)-1)*100);let st=250;for(let i=249;i>=0;i--){if(Math.abs(X[i]-1)>.05){st=i+1;break}else st=i}
out(f,`Жёлтая линия — заданная позиция, зелёная — движение дрона. Перерегулирование: <b>${os.toFixed(0)}%</b>, время установления: <b>${st>=249?'не достигнуто':(st*dt).toFixed(1)+' с'}</b>.`)}
f.addEventListener('input',r);r()};
D.yolo=(c,f)=>{const g=c.getContext('2d'),B=[['человек',150,90,22,44,.91],['транспорт',420,210,80,40,.87],['дерево',260,260,50,50,.62],['опора ЛЭП',520,80,16,70,.48]];
function r(){const t=num(f,'t');g.fillStyle='#bcd6a4';g.fillRect(0,0,640,360);for(let i=0;i<640;i+=32){g.fillStyle=i%64?'#b2cf99':'#c5dcad';g.fillRect(i,0,32,360)}
g.fillStyle='#7a5c3a';g.fillRect(150,95,22,44);g.fillStyle='#2f5fa0';g.fillRect(420,210,80,40);dot(g,285,285,25,'#2d6a3a');g.fillStyle='#555';g.fillRect(520,80,16,70);
let h='<table class="tbl"><tr><th>Класс</th><th>Уверенность</th><th>Широта, долгота</th></tr>';
B.forEach(b=>{if(b[5]<t)return;g.strokeStyle='#B5472F';g.lineWidth=2;g.strokeRect(b[1]-3,b[2]-3,b[3]+6,b[4]+6);g.fillStyle='#B5472F';g.font='13px sans-serif';g.fillText(b[0]+' '+b[5],b[1]-3,b[2]-8);
const cx=b[1]+b[3]/2,cy=b[2]+b[4]/2,la=LAT0-(cy-180)*mpp/111320,lo=LON0+(cx-320)*mpp/(111320*Math.cos(LAT0*Math.PI/180));h+=`<tr><td>${b[0]}</td><td>${b[5]}</td><td>${la.toFixed(6)}, ${lo.toFixed(6)}</td></tr>`});
out(f,h+'</table>')}
f.addEventListener('input',r);r()};
D.slam=(c,f)=>{const g=c.getContext('2d'),O=[[140,60,60,50],[470,80,50,60],[250,170,70,40],[440,250,70,50],[80,230,50,60]],cs=16,gw=40,gh=22;
const hit=(x,y)=>x<0||y<0||x>=640||y>=352||O.some(o=>x>=o[0]&&x<=o[0]+o[2]&&y>=o[1]&&y<=o[1]+o[3]);
function go(){cancelAnimationFrame(c._r);const M=Array.from({length:gh},()=>Array(gw).fill(0)),tr=[];let k=0;
function step(){const a=k*.04,px=320+130*Math.cos(a),py=176+110*Math.sin(a);tr.push([px,py]);
for(let j=0;j<40;j++){const b=j/40*6.283;let d=0,h=0;for(;d<120;d+=4){const x=px+d*Math.cos(b),y=py+d*Math.sin(b);if(hit(x,y)){h=1;break}M[Math.floor(y/cs)][Math.floor(x/cs)]=M[Math.floor(y/cs)][Math.floor(x/cs)]||1}
if(h&&px+d*Math.cos(b)>=0&&py+d*Math.sin(b)>=0&&px+d*Math.cos(b)<640&&py+d*Math.sin(b)<352)M[Math.floor((py+d*Math.sin(b))/cs)][Math.floor((px+d*Math.cos(b))/cs)]=2}
g.clearRect(0,0,640,360);let kn=0;M.forEach((r,y)=>r.forEach((v,x)=>{g.fillStyle=v==2?'#12263A':v==1?'#e9f0f4':'#9aa7b3';g.fillRect(x*cs,y*cs,cs,cs);if(v)kn++}));
line(g,tr,'#3E7D4F',2);dot(g,px,py,7,'#D9A441');out(f,`Тёмно-синие клетки — препятствия, светлые — свободное пространство, серые — не исследовано. Карта построена на <b>${(kn/gw/gh*100).toFixed(0)}%</b>.`);
if(++k<170)c._r=requestAnimationFrame(step)}step()}
$(f,'go').onclick=go;go()};
D.geo=(c,f)=>{function r(){const R=6378137,q=n=>num(f,n),rad=Math.PI/180,dN=(q('la')-q('la0'))*rad*R,dE=(q('lo')-q('lo0'))*rad*R*Math.cos(q('la0')*rad),b=(Math.atan2(dE,dN)/rad+360)%360;
out(f,`<table class="tbl"><tr><th>East (X), м</th><th>North (Y), м</th><th>Расстояние, м</th><th>Азимут, °</th></tr><tr><td>${dE.toFixed(2)}</td><td>${dN.toFixed(2)}</td><td>${Math.hypot(dE,dN).toFixed(2)}</td><td>${b.toFixed(1)}</td></tr></table>`)}
f.addEventListener('input',r);r()};
D.ndvi=(c,f)=>{const g=c.getContext('2d'),A=field();function r(){const t=num(f,'t'),lim=num(f,'p')/100;drawField(g,A,t);let h='',any=0;
for(let k=0;k<6;k++){let s=0,tot=0;for(let y=0;y<24;y++)for(let x=k*7;x<Math.min(40,k*7+7);x++){tot++;if(A[y][x]<t)s++}const p=s/tot,fl=p>lim;any+=fl;
line(g,[[k*112,0],[k*112,360]],'#fff',1.5,[5,4]);if(fl){g.fillStyle='#fff';g.font='22px sans-serif';g.fillText('📷',k*112+40,30)}
h+=`<tr><td>Кадр ${k+1}</td><td>${(p*100).toFixed(0)}%</td><td>${fl?'<b>съёмка</b>: фитостресс, сохранить координаты':'continue: аномалий нет'}</td></tr>`}
out(f,`<table class="tbl"><tr><th>Кадр</th><th>Доля пикселей NDVI&lt;порога</th><th>Решение</th></tr>${h}</table><p>Кадров со съёмкой: <b>${any}</b> из 6. Красно-коричневые клетки — подозрение на стресс.</p>`)}
f.addEventListener('input',r);r()};
D.resfc=(c,f)=>{const g=c.getContext('2d'),V=[.62,.64,.67,.69,.68,.66,.63,.59,.55,.52,.47,.44];
function r(){const n=num(f,'n'),X=[],Y=V.slice(-n);let sx=0,sy=0,sxx=0,sxy=0;Y.forEach((y,i)=>{const x=V.length-n+i;sx+=x;sy+=y;sxx+=x*x;sxy+=x*y});
const b=(n*sxy-sx*sy)/(n*sxx-sx*sx),a=(sy-b*sx)/n,F=[0,1,2,3].map(i=>a+b*(V.length+i)),px=i=>40+i*37,py=v=>330-(v-.2)*480;
g.clearRect(0,0,640,360);line(g,[[40,py(.35)],[620,py(.35)]],'#B5472F',1.2,[5,4]);line(g,V.map((v,i)=>[px(i),py(v)]),'#12263A',2.5);
line(g,[[px(V.length-n),py(a+b*(V.length-n))],[px(V.length+3),py(F[3])]],'#D9A441',2.5,[7,5]);V.forEach((v,i)=>dot(g,px(i),py(v),4,'#3E7D4F'));
out(f,`Тёмная линия — измеренный NDVI по неделям, жёлтый пунктир — линейная регрессия на последних ${n} точках, красный пунктир — порог 0.35. Прогноз на 4 недели: <b>${F.map(v=>v.toFixed(2)).join(', ')}</b>.`)}
f.addEventListener('input',r);r()};
D.reslos=(c,f)=>{const g=c.getContext('2d'),T=[],V=[];for(let e=0;e<50;e++){T.push([40+e*11.6,330-(1.2*Math.exp(-e/12)+.05)*230]);V.push([40+e*11.6,330-(1.2*Math.exp(-e/14)+.09+.01*Math.sin(e))*230])}
g.clearRect(0,0,640,360);line(g,T,'#3E7D4F',3);line(g,V,'#B5472F',3);g.fillStyle='#12263A';g.font='14px sans-serif';g.fillText('зелёная — обучение, красная — валидация (loss по эпохам)',60,24)};
D.resmap=(c,f)=>{const g=c.getContext('2d'),A=field();drawField(g,A,.35);const P=[];for(let k=0;k<6;k++)for(const y of k%2?[352,8]:[8,352])P.push([k*112+56,y]);line(g,P,'#fff',3);dot(g,P[0][0],P[0][1],7,'#D9A441');
[[27,8],[8,18]].forEach(p=>{g.strokeStyle='#fff';g.lineWidth=3;g.strokeRect(p[0]*16-40,p[1]*15-40,96,90)});out(f,'Итоговая карта: белая линия — траектория дрона, белые рамки — зоны фитостресса, отправленные в отчёт.')};
document.querySelectorAll('[data-d]').forEach(e=>D[e.dataset.d](e.querySelector('canvas'),e));
