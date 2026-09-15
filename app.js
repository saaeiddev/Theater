import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const canvas = document.querySelector('#scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.8));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x080407);
scene.fog = new THREE.FogExp2(0x080407, 0.025);

const camera = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, 0.1, 100);
camera.position.set(0, 1.4, 18);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.055;
controls.enablePan = false;
controls.minDistance = 10.5;
controls.maxDistance = 24;
controls.minPolarAngle = Math.PI * 0.34;
controls.maxPolarAngle = Math.PI * 0.63;
controls.minAzimuthAngle = -0.48;
controls.maxAzimuthAngle = 0.48;
controls.target.set(0, 1.35, 0);

const COLORS = { red:0x74162e, darkRed:0x3a0918, gold:0xd7ae5c, ivory:0xffe6b0, black:0x080407, wood:0x2b140e };
const curtainMat = new THREE.MeshPhysicalMaterial({ color: COLORS.red, roughness:.55, metalness:.02, clearcoat:.18, clearcoatRoughness:.6 });
const goldMat = new THREE.MeshStandardMaterial({ color: COLORS.gold, metalness:.72, roughness:.32 });
const blackMat = new THREE.MeshStandardMaterial({ color:0x10090d, roughness:.68, metalness:.08 });
const woodMat = new THREE.MeshStandardMaterial({ color:COLORS.wood, roughness:.72, metalness:.05 });

scene.add(new THREE.HemisphereLight(0x8d7185, 0x14090d, 1.0));
const key = new THREE.SpotLight(0xffe0b0, 120, 35, Math.PI/6, .6, 1.2); key.position.set(0,10,11); key.target.position.set(0,1,0); key.castShadow=true; key.shadow.mapSize.set(1024,1024); scene.add(key,key.target);
const sideL = new THREE.SpotLight(0xbd355f, 70, 30, Math.PI/5,.8,1.4); sideL.position.set(-9,7,5); sideL.target.position.set(-2,1,0); scene.add(sideL,sideL.target);
const sideR = new THREE.SpotLight(0x5b4db7, 55, 30, Math.PI/5,.8,1.4); sideR.position.set(9,7,5); sideR.target.position.set(2,1,0); scene.add(sideR,sideR.target);

const stage = new THREE.Group(); scene.add(stage);

const floor = new THREE.Mesh(new THREE.PlaneGeometry(45,38), new THREE.MeshStandardMaterial({color:0x10090c,roughness:.92,metalness:.03})); floor.rotation.x=-Math.PI/2; floor.position.y=-3.25; floor.receiveShadow=true; scene.add(floor);
const stageFloor = new THREE.Mesh(new THREE.BoxGeometry(14.7,.55,7.8), woodMat); stageFloor.position.set(0,-2.78,0); stageFloor.castShadow=stageFloor.receiveShadow=true; stage.add(stageFloor);
for(let i=0;i<18;i++){const line=new THREE.Mesh(new THREE.BoxGeometry(14.2,.015,.012),new THREE.MeshBasicMaterial({color:0x5b2a1a,transparent:true,opacity:.28}));line.position.set(0,-2.49,-3.5+i*.41);stage.add(line)}

const arch = new THREE.Group(); stage.add(arch);
const columnGeo = new THREE.CylinderGeometry(.56,.72,8.8,18);
[-6.9,6.9].forEach(x=>{const c=new THREE.Mesh(columnGeo,new THREE.MeshStandardMaterial({color:0x1c1115,roughness:.7,metalness:.1}));c.position.set(x,1.0,.1);c.castShadow=true;arch.add(c);const cap=new THREE.Mesh(new THREE.CylinderGeometry(.85,.85,.35,24),goldMat);cap.position.set(x,5.4,.1);arch.add(cap)});
const topBeam = new THREE.Mesh(new THREE.BoxGeometry(15.1,.85,.8),blackMat); topBeam.position.set(0,5.45,.1); topBeam.castShadow=true; arch.add(topBeam);
for(let i=-6;i<=6;i+=2){const ornament=new THREE.Mesh(new THREE.TorusGeometry(.24,.055,10,24),goldMat);ornament.position.set(i,5.45,.55);arch.add(ornament)}

const back = new THREE.Mesh(new THREE.PlaneGeometry(13.5,8.2),new THREE.MeshStandardMaterial({color:0x0f090c,roughness:.9})); back.position.set(0,1,-3.55); stage.add(back);
const stageTitle = makeTextSprite('THEATER', {font:'700 82px Georgia', color:'#d9b365', bg:'transparent', scale:[4.2,.8,1]}); stageTitle.position.set(0,4.1,-3.35); stageTitle.material.opacity=.17; stage.add(stageTitle);

const leftCurtain = new THREE.Group(), rightCurtain = new THREE.Group();
leftCurtain.userData.curtain=true; rightCurtain.userData.curtain=true; stage.add(leftCurtain,rightCurtain);
function buildCurtainHalf(group, side){
  const count=18, width=7.0/count;
  for(let i=0;i<count;i++){
    const g=new THREE.CapsuleGeometry(width*.56,7.8,8,12);
    const m=new THREE.Mesh(g,curtainMat.clone());
    m.scale.set(1,1,.34);
    const local = (i+.5)*width;
    m.position.set(side<0 ? -local : local,1.1,.82 + Math.sin(i*.82)*.07);
    m.castShadow=true; m.receiveShadow=true; m.userData.curtain=true;
    group.add(m);
  }
}
buildCurtainHalf(leftCurtain,-1); buildCurtainHalf(rightCurtain,1);
const valance = new THREE.Group(); stage.add(valance);
for(let i=-7;i<=7;i++){const drop=new THREE.Mesh(new THREE.SphereGeometry(.72,24,16,0,Math.PI*2,0,Math.PI*.58),curtainMat);drop.scale.set(1.08,.62,.32);drop.position.set(i*.95,5.25,.95);drop.castShadow=true;drop.userData.curtain=true;valance.add(drop)}
const ropeGeo=new THREE.TorusGeometry(.42,.055,12,32);[-1,1].forEach(s=>{const rope=new THREE.Mesh(ropeGeo,goldMat);rope.position.set(s*6.25,.35,1.27);rope.rotation.y=Math.PI/2;rope.userData.curtain=true;stage.add(rope)});

const loader = new GLTFLoader();
const chairs = new THREE.Group(); stage.add(chairs);
const chairUrl='https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/SheenChair/glTF-Binary/SheenChair.glb';
loader.load(chairUrl,(gltf)=>{
  const base=gltf.scene;base.scale.setScalar(1.55);base.position.set(-5.3,-2.45,-1.7);base.rotation.y=.45;chairs.add(base);
  const copy=base.clone();copy.position.x=5.3;copy.rotation.y=-.45;chairs.add(copy);
},undefined,()=>{
  [-5.5,5.5].forEach(x=>{const seat=new THREE.Mesh(new THREE.BoxGeometry(1.5,.45,1.5),curtainMat);seat.position.set(x,-2.15,-1.8);const back=new THREE.Mesh(new THREE.BoxGeometry(1.5,1.8,.35),curtainMat);back.position.set(x,-1.05,-2.35);chairs.add(seat,back)});
});

const genres = [
 {fa:'کمدی',en:'Comedy',icon:'😂',mood:'شاد، بازیگوش و انتقادی',focus:'طنز، سوءتفاهم و رفتار انسانی',desc:'کمدی با موقعیت‌های خنده‌آور، تضادهای رفتاری و اغراق، ضعف‌ها و تناقض‌های انسان و جامعه را آشکار می‌کند. پایان آن معمولاً سبک‌تر و آشتی‌جویانه‌تر از تراژدی است.',plays:[['خسیس','مولیر'],['شب دوازدهم','ویلیام شکسپیر'],['اهمیت ارنست بودن','اسکار وایلد']]},
 {fa:'تراژدی',en:'Tragedy',icon:'😢',mood:'سنگین، عاطفی و سرنوشت‌محور',focus:'سقوط قهرمان و تعارض اخلاقی',desc:'تراژدی بر یک بحران جدی و پیامدهای گریزناپذیر انتخاب‌ها تمرکز دارد. قهرمان معمولاً با نیرویی بزرگ‌تر از خود، خطایی درونی یا تقدیری ویرانگر روبه‌رو می‌شود.',plays:[['ادیپ شهریار','سوفوکل'],['هملت','ویلیام شکسپیر'],['مرگ فروشنده','آرتور میلر']]},
 {fa:'درام',en:'Drama',icon:'🎭',mood:'واقع‌گرا، انسانی و چندلایه',focus:'روابط، انتخاب و تعارض',desc:'درام به تعارض‌های انسانی و روابط پیچیده می‌پردازد و لزوماً کمدی یا تراژدی خالص نیست. شخصیت‌ها و انتخاب‌هایشان موتور اصلی پیشرفت داستان هستند.',plays:[['خانه عروسک','هنریک ایبسن'],['باغ آلبالو','آنتون چخوف'],['باغ‌وحش شیشه‌ای','تنسی ویلیامز']]},
 {fa:'جنایی',en:'Crime',icon:'🕵️',mood:'پرتنش، رازآلود و منطقی',focus:'جرم، انگیزه و کشف حقیقت',desc:'نمایش جنایی پیرامون جرم، تحقیق، مظنون‌ها و کشف انگیزه‌ها شکل می‌گیرد. تعلیق و سرنخ‌گذاری دقیق، تماشاگر را به بخشی از فرایند کشف تبدیل می‌کند.',plays:[['تله موش','آگاتا کریستی'],['شاهدی برای تعقیب','آگاتا کریستی'],['بازرس وارد می‌شود','جی. بی. پریستلی']]},
 {fa:'ترسناک',en:'Horror',icon:'💀',mood:'دلهره‌آور، تاریک و تهدیدکننده',focus:'ترس، ناشناخته و بقا',desc:'تئاتر وحشت با فضا، نور، صدا، غافلگیری و تهدیدهای روانی یا فراطبیعی حس ناامنی می‌سازد و مرز واقعیت و کابوس را به بازی می‌گیرد.',plays:[['زن سیاه‌پوش','استیون مالاترات'],['دراکولا','اقتباس‌های نمایشی از برام استوکر'],['مکبث','ویلیام شکسپیر']]},
 {fa:'تاریخی',en:'Historical',icon:'🏛️',mood:'حماسی، مستندگونه یا بازآفرینانه',focus:'رویداد، دوره و شخصیت تاریخی',desc:'نمایش تاریخی گذشته را از زاویه‌ای نمایشی بازسازی می‌کند. نویسنده می‌تواند به اسناد وفادار بماند یا برای رسیدن به حقیقت دراماتیک، واقعیت را بازتفسیر کند.',plays:[['هنری پنجم','ویلیام شکسپیر'],['ریچارد سوم','ویلیام شکسپیر'],['مردی برای تمام فصول','رابرت بولت']]},
 {fa:'زندگی‌نامه‌ای',en:'Biographical',icon:'👤',mood:'شخصیت‌محور و پژوهشی',focus:'زندگی و میراث یک فرد',desc:'درام زندگی‌نامه‌ای بخشی از زندگی یک شخصیت واقعی را انتخاب و آن را به ساختاری نمایشی تبدیل می‌کند؛ تمرکز بر نقاط عطف، تضادهای درونی و اثرگذاری تاریخی فرد است.',plays:[['آمادئوس','پیتر شفر'],['رد','جان لوگان'],['زندگی گالیله','برتولت برشت']]},
 {fa:'عاشقانه',en:'Romance',icon:'❤️',mood:'احساسی، صمیمی و امیدبخش',focus:'عشق، فاصله و انتخاب',desc:'ژانر عاشقانه رابطه عاطفی را در مرکز تعارض قرار می‌دهد؛ موانع بیرونی یا درونی، شخصیت‌ها را وادار می‌کند میان عشق، هویت، خانواده و جامعه انتخاب کنند.',plays:[['رومئو و ژولیت','ویلیام شکسپیر'],['سیرانو دو برژراک','ادمون روستان'],['همان زمان، سال بعد','برنارد اسلید']]},
 {fa:'رازآلود',en:'Mystery',icon:'🔍',mood:'مرموز، کنجکاوی‌برانگیز',focus:'سرنخ، راز و افشا',desc:'در نمایش رازآلود اطلاعات به‌تدریج آشکار می‌شود. تماشاگر مدام فرضیه می‌سازد و هر سرنخ می‌تواند معنای صحنه‌های قبلی را تغییر دهد.',plays:[['تله موش','آگاتا کریستی'],['قتل در کشیش‌خانه','اقتباس از آگاتا کریستی'],['بازی کارآگاه','آنتونی شفر']]},
 {fa:'موزیکال',en:'Musical',icon:'🎵',mood:'ریتمیک، نمایشی و پرانرژی',focus:'ترکیب بازی، موسیقی و حرکت',desc:'موزیکال داستان را با بازی، آواز و رقص پیش می‌برد. قطعات موسیقی فقط تزئین نیستند؛ احساس، تصمیم یا نقطه عطف داستان را بیان می‌کنند.',plays:[['بینوایان','شوئنبرگ و بوبلیل'],['شیکاگو','کندر و اِب'],['همیلتون','لین-منوئل میراندا']]},
 {fa:'ابزورد',en:'Absurd',icon:'🌀',mood:'نامتعارف، فلسفی و ناآرام',focus:'بی‌معنایی، تکرار و زبان',desc:'تئاتر ابزورد منطق روزمره را می‌شکند. گفت‌وگوهای دوری، سکوت، تکرار و موقعیت‌های بی‌نتیجه، پرسش‌هایی درباره معنا، ارتباط و وضعیت انسان ایجاد می‌کنند.',plays:[['در انتظار گودو','ساموئل بکت'],['کرگدن','اوژن یونسکو'],['خواننده طاس','اوژن یونسکو']]},
 {fa:'طنز اجتماعی',en:'Satire',icon:'🃏',mood:'تیز، شوخ و انتقادی',focus:'قدرت، فرهنگ و تناقض اجتماعی',desc:'طنز اجتماعی با شوخی، کنایه و اغراق ساختارهای قدرت و عادت‌های جمعی را نقد می‌کند. خنده در این ژانر اغلب راهی برای دیدن یک مسئله جدی‌تر است.',plays:[['بازرس','نیکلای گوگول'],['دایره گچی قفقازی','برتولت برشت'],['اوبو شاه','آلفرد ژاری']]},
 {fa:'فانتزی',en:'Fantasy',icon:'🐉',mood:'خیال‌انگیز، جادویی و نمادین',focus:'جهان‌سازی و امر ناممکن',desc:'فانتزی قوانین واقعیت را گسترش می‌دهد و جهان‌هایی جادویی، اسطوره‌ای یا نمادین می‌سازد. عناصر غیرواقعی اغلب برای بیان مسائل بسیار انسانی به کار می‌روند.',plays:[['رویای شب نیمه تابستان','ویلیام شکسپیر'],['پیتر پن','جی. ام. بری'],['شیر، کمد و جادوگر','اقتباس‌های نمایشی از سی. اس. لوئیس']]},
 {fa:'اجتماعی',en:'Social Drama',icon:'👥',mood:'واقع‌گرا، مسئله‌محور',focus:'جامعه، طبقه و مسئولیت',desc:'درام اجتماعی تأثیر ساختارهای اقتصادی، خانوادگی و فرهنگی بر زندگی فرد را بررسی می‌کند و معمولاً مسئله‌ای عمومی را از خلال تجربه چند شخصیت ملموس می‌سازد.',plays:[['دشمن مردم','هنریک ایبسن'],['نگاهی از پل','آرتور میلر'],['کشمش در آفتاب','لورین هنس‌بری']]},
 {fa:'تجربی',en:'Experimental',icon:'⚗️',mood:'جسور، فرمی و پیش‌بینی‌ناپذیر',focus:'شکستن قواعد اجرا',desc:'تئاتر تجربی قراردادهای رایج روایت، صحنه، زمان و رابطه با تماشاگر را می‌آزماید. شکل اجرا می‌تواند به اندازه داستان اهمیت داشته باشد.',plays:[['شش شخصیت در جست‌وجوی نویسنده','لوئیجی پیراندلو'],['جتِ خون','آنتونن آرتو'],['مارا/ساد','پیتر وایس']]}
];

const genreGroup = new THREE.Group(); stage.add(genreGroup); genreGroup.visible=false;
const pickables=[];
function makeTextSprite(text,{font='700 54px Vazirmatn',color='#fff',bg='transparent',scale=[2.4,.7,1]}={}){
 const c=document.createElement('canvas'),ctx=c.getContext('2d');c.width=1024;c.height=256;ctx.clearRect(0,0,c.width,c.height);if(bg!=='transparent'){ctx.fillStyle=bg;ctx.fillRect(0,0,c.width,c.height)}ctx.font=font;ctx.textAlign='center';ctx.textBaseline='middle';ctx.direction='rtl';ctx.fillStyle=color;ctx.fillText(text,512,132);const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;tex.minFilter=THREE.LinearFilter;const mat=new THREE.SpriteMaterial({map:tex,transparent:true,depthWrite:false});const s=new THREE.Sprite(mat);s.scale.set(...scale);return s;
}
function makeIconTexture(icon){const c=document.createElement('canvas'),ctx=c.getContext('2d');c.width=c.height=512;const grd=ctx.createRadialGradient(180,130,20,256,256,270);grd.addColorStop(0,'rgba(255,255,255,.16)');grd.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=grd;ctx.fillRect(0,0,512,512);ctx.font='260px Apple Color Emoji, Segoe UI Emoji, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(icon,256,270);const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;return tex}
function buildGenre(g,i){
 const group=new THREE.Group();group.userData={genreIndex:i,baseY:0,phase:i*.72};
 const hue=(i/genres.length)*.34+.93;const col=new THREE.Color().setHSL(hue%1,.56,.42);
 const diskMat=new THREE.MeshPhysicalMaterial({color:col,roughness:.28,metalness:.45,clearcoat:.65,clearcoatRoughness:.18});
 const disk=new THREE.Mesh(new THREE.CylinderGeometry(.74,.74,.24,48),diskMat);disk.rotation.x=Math.PI/2;disk.castShadow=true;disk.userData.genreIndex=i;group.add(disk);pickables.push(disk);
 const ring=new THREE.Mesh(new THREE.TorusGeometry(.78,.045,10,48),goldMat);ring.position.z=.145;ring.userData.genreIndex=i;group.add(ring);pickables.push(ring);
 const face=new THREE.Mesh(new THREE.CircleGeometry(.62,48),new THREE.MeshBasicMaterial({map:makeIconTexture(g.icon),transparent:true,depthWrite:false}));face.position.z=.145;face.userData.genreIndex=i;group.add(face);pickables.push(face);
 const halo=new THREE.Mesh(new THREE.TorusGeometry(.92,.015,8,64),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.38}));halo.position.z=-.06;halo.rotation.z=i*.3;group.add(halo);
 const label=makeTextSprite(g.fa,{font:'700 58px Vazirmatn',color:'#fff5e4',scale:[2.25,.55,1]});label.position.set(0,-1.08,.1);group.add(label);
 const en=makeTextSprite(g.en.toUpperCase(),{font:'600 34px Arial',color:'rgba(255,255,255,.52)',scale:[1.65,.35,1]});en.position.set(0,-1.42,.1);group.add(en);
 group.scale.setScalar(.001);
 genreGroup.add(group);return group;
}
const genreObjects=genres.map(buildGenre);
function layoutGenres(){
 const mobile=innerWidth<760;const cols=mobile?3:5;const spacingX=mobile?2.2:2.45;const spacingY=mobile?2.25:2.25;
 genreObjects.forEach((o,i)=>{const row=Math.floor(i/cols),col=i%cols;const rows=Math.ceil(genres.length/cols);o.position.set((col-(cols-1)/2)*spacingX,2.75-row*spacingY + (rows===3?0:.2),-.85-row*.15);o.userData.baseY=o.position.y});
}
layoutGenres();

const dustGeo=new THREE.BufferGeometry();const dustCount=500;const arr=new Float32Array(dustCount*3);for(let i=0;i<dustCount;i++){arr[i*3]=(Math.random()-.5)*17;arr[i*3+1]=Math.random()*11-3;arr[i*3+2]=Math.random()*10-5}dustGeo.setAttribute('position',new THREE.BufferAttribute(arr,3));const dust=new THREE.Points(dustGeo,new THREE.PointsMaterial({color:0xdab873,size:.025,transparent:true,opacity:.35,depthWrite:false}));scene.add(dust);

let curtainOpen=false, openingStart=0, audioEnabled=true, selected=-1;
const clock=new THREE.Clock();const raycaster=new THREE.Raycaster();const pointer=new THREE.Vector2();let hovered=null,downPos=null;
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;

function smoothstep(t){return t*t*(3-2*t)}
function openCurtain(){if(curtainOpen)return;curtainOpen=true;openingStart=performance.now();document.querySelector('#heroCopy').classList.add('hidden');document.querySelector('#curtainHint').classList.add('hidden');document.querySelector('#stageNav').classList.add('show');document.querySelector('#stageNav').setAttribute('aria-hidden','false');genreGroup.visible=true;playChime();}
function closeCurtain(){curtainOpen=false;openingStart=performance.now();document.querySelector('#heroCopy').classList.remove('hidden');document.querySelector('#curtainHint').classList.remove('hidden');document.querySelector('#stageNav').classList.remove('show');closePanel();}
function playChime(){if(!audioEnabled)return;try{const ac=window.__theaterAudio||(window.__theaterAudio=new (window.AudioContext||window.webkitAudioContext)());const now=ac.currentTime;[220,330,440].forEach((f,i)=>{const o=ac.createOscillator(),g=ac.createGain();o.type='sine';o.frequency.value=f;g.gain.setValueAtTime(0,now);g.gain.linearRampToValueAtTime(.025,now+.03+i*.03);g.gain.exponentialRampToValueAtTime(.001,now+.8+i*.08);o.connect(g).connect(ac.destination);o.start(now+i*.04);o.stop(now+1.1)})}catch{}}

function showGenre(i){selected=(i+genres.length)%genres.length;const g=genres[selected];document.querySelector('#panelIcon').textContent=g.icon;document.querySelector('#panelTitle').textContent=g.fa;document.querySelector('#panelEnglish').textContent=g.en;document.querySelector('#panelDescription').textContent=g.desc;document.querySelector('#panelMood').textContent=g.mood;document.querySelector('#panelFocus').textContent=g.focus;document.querySelector('#examples').innerHTML=g.plays.map(([p,a])=>`<div class="example"><b>${p}</b><span>${a}</span><i>◈</i></div>`).join('');document.querySelector('#genreCounter').textContent=String(selected+1).padStart(2,'0')+' / '+String(genres.length).padStart(2,'0');const panel=document.querySelector('#genrePanel');panel.classList.add('open');panel.setAttribute('aria-hidden','false');playChime();
 genreObjects.forEach((o,idx)=>{o.userData.selected=idx===selected});
}
function closePanel(){const p=document.querySelector('#genrePanel');p.classList.remove('open');p.setAttribute('aria-hidden','true');genreObjects.forEach(o=>o.userData.selected=false)}

function pointerToNDC(e){const r=canvas.getBoundingClientRect();pointer.x=((e.clientX-r.left)/r.width)*2-1;pointer.y=-((e.clientY-r.top)/r.height)*2+1;raycaster.setFromCamera(pointer,camera)}
function onPointerMove(e){pointerToNDC(e);if(!curtainOpen){canvas.style.cursor='pointer';return}const hit=raycaster.intersectObjects(pickables,false)[0];const obj=hit?.object||null;const idx=obj?.userData?.genreIndex;hovered=Number.isInteger(idx)?genreObjects[idx]:null;canvas.style.cursor=hovered?'pointer':'grab'}
canvas.addEventListener('pointerdown',e=>{downPos=[e.clientX,e.clientY]});
canvas.addEventListener('pointerup',e=>{if(!downPos)return;const moved=Math.hypot(e.clientX-downPos[0],e.clientY-downPos[1]);downPos=null;if(moved>9)return;pointerToNDC(e);if(!curtainOpen){openCurtain();return}const hit=raycaster.intersectObjects(pickables,false)[0];if(hit&&Number.isInteger(hit.object.userData.genreIndex))showGenre(hit.object.userData.genreIndex)});
canvas.addEventListener('pointermove',onPointerMove,{passive:true});

document.querySelector('#openCurtainBtn').addEventListener('click',openCurtain);
document.querySelector('#closePanel').addEventListener('click',closePanel);
document.querySelector('#homeBtn').addEventListener('click',()=>{closeCurtain();controls.reset();camera.position.set(0,1.4,18);controls.target.set(0,1.35,0)});
document.querySelector('#prevGenre').addEventListener('click',()=>showGenre(selected<0?genres.length-1:selected-1));
document.querySelector('#nextGenre').addEventListener('click',()=>showGenre(selected<0?0:selected+1));
const soundBtn=document.querySelector('#soundBtn');soundBtn.addEventListener('click',()=>{audioEnabled=!audioEnabled;soundBtn.textContent=audioEnabled?'♪':'×';soundBtn.setAttribute('aria-pressed',String(audioEnabled))});
const modal=document.querySelector('#aboutModal');document.querySelector('#aboutBtn').addEventListener('click',()=>{modal.classList.add('open');modal.setAttribute('aria-hidden','false')});function closeAbout(){modal.classList.remove('open');modal.setAttribute('aria-hidden','true')}document.querySelector('#closeAbout').addEventListener('click',closeAbout);modal.addEventListener('click',e=>{if(e.target===modal)closeAbout()});
addEventListener('keydown',e=>{if(e.key==='Escape'){closePanel();closeAbout()}if(e.key==='ArrowLeft'&&curtainOpen)showGenre(selected<0?0:selected+1);if(e.key==='ArrowRight'&&curtainOpen)showGenre(selected<0?genres.length-1:selected-1)});

function animate(){requestAnimationFrame(animate);const t=clock.getElapsedTime();controls.update();dust.rotation.y=t*.008;
 if(curtainOpen){const p=Math.min(1,(performance.now()-openingStart)/(reduceMotion?30:1800)),e=smoothstep(p);leftCurtain.position.x=-5.35*e;rightCurtain.position.x=5.35*e;leftCurtain.scale.x=1-.48*e;rightCurtain.scale.x=1-.48*e;genreObjects.forEach((o,i)=>{const delay=i*.035;const q=Math.max(0,Math.min(1,(p-delay)/(1-delay)));const s=reduceMotion?1:smoothstep(q);o.scale.setScalar(Math.max(.001,s));o.rotation.y=Math.sin(t*.55+o.userData.phase)*.08;o.position.y=o.userData.baseY+Math.sin(t*1.25+o.userData.phase)*.09;const target=o===hovered||o.userData.selected?1.14:1;const current=o.scale.x;o.scale.multiplyScalar(THREE.MathUtils.lerp(1,target/current,.08))})}
 else {const p=Math.min(1,(performance.now()-openingStart)/(reduceMotion?30:1100)),e=smoothstep(p);leftCurtain.position.x=THREE.MathUtils.lerp(leftCurtain.position.x,0,e*.16+.05);rightCurtain.position.x=THREE.MathUtils.lerp(rightCurtain.position.x,0,e*.16+.05);leftCurtain.scale.x=THREE.MathUtils.lerp(leftCurtain.scale.x,1,e*.16+.05);rightCurtain.scale.x=THREE.MathUtils.lerp(rightCurtain.scale.x,1,e*.16+.05);genreObjects.forEach(o=>o.scale.multiplyScalar(.9));if(genreObjects[0].scale.x<.01)genreGroup.visible=false}
 key.intensity=curtainOpen?150+Math.sin(t*.7)*10:115;sideL.intensity=curtainOpen?85:55;sideR.intensity=curtainOpen?70:45;
 renderer.render(scene,camera)}

function resize(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.8));layoutGenres()}addEventListener('resize',resize,{passive:true});
setTimeout(()=>document.querySelector('#loader').classList.add('done'),750);
animate();
