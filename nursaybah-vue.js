
const { createApp, ref, onMounted, onUnmounted } = Vue;


function spawnBling(x, y, count = 8, colors = ['#d8b078','#fff','#e2b3a3','#f8efe3']) {
  for (let i = 0; i < count; i++) {
    const el = document.createElement('span');
    el.className = 'bling-spark';
    const angle  = (360 / count) * i;
    const dist   = 28 + Math.random() * 32;
    const size   = 4 + Math.random() * 6;
    el.style.cssText = `
      left:${x}px; top:${y}px;
      width:${size}px; height:${size}px;
      background:${colors[Math.floor(Math.random()*colors.length)]};
      --tx:${Math.cos(angle*Math.PI/180)*dist}px;
      --ty:${Math.sin(angle*Math.PI/180)*dist}px;
    `;
    document.body.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  }
}


const MagicBtn = {
  name: 'MagicBtn',
  props: {
    label:   { type: String, default: '' },
    href:    { type: String, default: '#' },
    variant: { type: String, default: 'primary' },
  },
  emits: ['click'],
  setup(props, { emit }) {
    const btnEl   = ref(null);
    const ripples = ref([]);
    const sparks  = ref([]);
    const isHover = ref(false);
    let   rid = 0, sid = 0;

    function handleClick(e) {
      
      const rect = btnEl.value.getBoundingClientRect();
      const x = e.clientX - rect.left, y = e.clientY - rect.top;
      const id = ++rid;
      ripples.value.push({ id, x, y });
      setTimeout(() => { ripples.value = ripples.value.filter(r => r.id !== id); }, 700);

      
      spawnBling(e.clientX, e.clientY, 10);

      emit('click', e);
    }

    function handleMouseMove(e) {
      if (!btnEl.value) return;
      const rect = btnEl.value.getBoundingClientRect();
      const dx = (e.clientX - rect.left - rect.width/2)  / (rect.width/2);
      const dy = (e.clientY - rect.top  - rect.height/2) / (rect.height/2);
      btnEl.value.style.transform =
        `translate(${dx*7}px,${dy*4}px) rotateX(${-dy*7}deg) rotateY(${dx*9}deg) scale(1.07)`;
    }

    function handleMouseLeave() {
      isHover.value = false;
      if (btnEl.value) btnEl.value.style.transform = '';
    }

    return {
      btnEl, ripples, isHover, handleClick, handleMouseMove, handleMouseLeave,
      handleMouseEnter: () => { isHover.value = true; },
    };
  },
  template: `
    <a ref="btnEl"
       :href="href"
       :class="['magic-btn','btn', variant==='ghost'?'btn-ghost':'btn-primary']"
       @click.prevent="handleClick"
       @mousemove="handleMouseMove"
       @mouseenter="handleMouseEnter"
       @mouseleave="handleMouseLeave"
    >
      <span class="magic-btn__shimmer" :class="{active:isHover}"></span>
      <span class="magic-btn__label">
        <span v-for="(ch,i) in label.split('')" :key="i"
              class="magic-btn__char"
              :style="{'--delay':(i*0.03)+'s'}">
          {{ ch===' '?'\u00a0':ch }}
        </span>
      </span>
      <span v-for="r in ripples" :key="r.id"
            class="magic-btn__ripple"
            :style="{left:r.x+'px',top:r.y+'px'}">
      </span>
    </a>
  `,
};


const EmojiBtn = {
  name: 'EmojiBtn',
  props: {
    emoji: { type: String, default: '✨' },
    label: { type: String, default: '' },
    href:  { type: String, default: '#' },
    color: { type: String, default: '#d8b078' },
  },
  setup(props) {
    const el      = ref(null);
    const spinning = ref(false);
    const glowing  = ref(false);

    function handleClick(e) {
      if (spinning.value) return;
      spinning.value = true;
      glowing.value  = true;
      spawnBling(e.clientX, e.clientY, 12, [props.color, '#fff', '#f8efe3', props.color]);
      setTimeout(() => { spinning.value = false; }, 600);
      setTimeout(() => { glowing.value  = false; }, 800);
    }

    function handleMouseMove(e) {
      if (!el.value) return;
      const rect = el.value.getBoundingClientRect();
      el.value.style.setProperty('--mx', ((e.clientX-rect.left)/rect.width*100).toFixed(1)+'%');
      el.value.style.setProperty('--my', ((e.clientY-rect.top)/rect.height*100).toFixed(1)+'%');
    }

    return { el, spinning, glowing, handleClick, handleMouseMove };
  },
  template: `
    <a ref="el"
       :href="href"
       target="_blank" rel="noopener"
       class="emoji-btn contact-pill"
       :class="{'spinning': spinning, 'glowing': glowing}"
       @click="handleClick"
       @mousemove="handleMouseMove"
    >
      <span class="emoji-btn__glow" :style="{background: color}"></span>
      <span class="emoji-btn__icon" :class="{'spin': spinning}">{{ emoji }}</span>
      <span class="emoji-btn__label">{{ label }}</span>
    </a>
  `,
};


const HobbyCardVue = {
  name: 'HobbyCardVue',
  props: {
    icon:      { type: String, default: '' },
    title:     { type: String, default: '' },
    backText:  { type: String, default: '' },
    color:     { type: String, default: '#d8b078' },
  },
  setup(props) {
    const flipped  = ref(false);
    const spinning = ref(false);

    function handleClick(e) {
      flipped.value = !flipped.value;
      if (!spinning.value) {
        spinning.value = true;
        spawnBling(e.clientX, e.clientY, 8, [props.color,'#fff','#f8efe3']);
        setTimeout(() => { spinning.value = false; }, 500);
      }
    }

    return { flipped, spinning, handleClick };
  },
  template: `
    <div class="hobby-card" @click="handleClick">
      <div class="hobby-card-flip" :class="{flipped}">
        <div class="hobby-face hobby-front">
          <span class="hobby-icon" :class="{'spin-once': spinning}">{{ icon }}</span>
          <h3>{{ title }}</h3>
        </div>
        <div class="hobby-face hobby-back">
          <p>{{ backText }}</p>
        </div>
      </div>
    </div>
  `,
};


const StatCard = {
  name: 'StatCard',
  props: {
    target: { type: Number, default: 0 },
    label:  { type: String, default: '' },
    href:   { type: String, default: '' },
  },
  setup(props) {
    const displayed = ref(0);
    const cardEl    = ref(null);
    let   started = false, obs = null;

    function countUp() {
      if (started) return;
      started = true;
      const dur = 1600, start = performance.now();
      function step(now) {
        const t = Math.min((now-start)/dur, 1);
        displayed.value = Math.round((1-Math.pow(1-t,3)) * props.target);
        if (t < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    onMounted(() => {
      obs = new IntersectionObserver(([en]) => { if (en.isIntersecting) countUp(); }, { threshold: 0.5 });
      if (cardEl.value) obs.observe(cardEl.value);
    });
    onUnmounted(() => obs?.disconnect());

    function handleClick(e) {
      const rect = cardEl.value.getBoundingClientRect();
      spawnBling(rect.left+rect.width/2, rect.top+rect.height/2, 6);
      if (props.href) document.querySelector(props.href)?.scrollIntoView({ behavior: 'smooth' });
    }

    return { displayed, cardEl, handleClick };
  },
  template: `
    <div ref="cardEl" class="stat-card vue-stat" :style="href?'cursor:pointer':''" @click="handleClick">
      <span class="stat-number">{{ displayed }}</span>
      <span class="stat-label">{{ label }}</span>
    </div>
  `,
};


const TypewriterHero = {
  name: 'TypewriterHero',
  props: {
    phrases: { type: Array, default: () => [] },
  },
  setup(props) {
    const displayed = ref('');
    let phraseIdx = 0, charIdx = 0, deleting = false, timeout = null;

    function tick() {
      const phrase = props.phrases[phraseIdx];
      if (!deleting) {
        displayed.value = phrase.slice(0, ++charIdx);
        if (charIdx === phrase.length) { deleting = true; timeout = setTimeout(tick, 1800); }
        else timeout = setTimeout(tick, 75);
      } else {
        displayed.value = phrase.slice(0, --charIdx);
        if (charIdx === 0) {
          deleting = false;
          phraseIdx = (phraseIdx+1) % props.phrases.length;
          timeout = setTimeout(tick, 400);
        } else timeout = setTimeout(tick, 42);
      }
    }

    onMounted  (() => { timeout = setTimeout(tick, 900); });
    onUnmounted(() => clearTimeout(timeout));
    return { displayed };
  },
  template: `<span class="vue-typewriter">{{ displayed }}<span class="vue-caret">|</span></span>`,
};


const VueNav = {
  name: 'VueNav',
  props: { labels: { type: Object, default: () => ({}) } },
  setup(props) {
    const sections = ['beranda','tentang','skill','proyek','perjalanan','hobi','kontak'];
    const active   = ref('beranda');
    let   obs      = null;

    onMounted(() => {
      obs = new IntersectionObserver((entries) => {
        entries.forEach(en => { if (en.isIntersecting) active.value = en.target.id; });
      }, { threshold: 0.35 });
      sections.forEach(id => { const el = document.getElementById(id); if (el) obs.observe(el); });
    });
    onUnmounted(() => obs?.disconnect());

    return { sections, active };
  },
  template: `
    <nav class="nav-links vue-nav">
      <a v-for="s in sections" :key="s" :href="'#'+s" :class="{'nav-active': active===s}">
        {{ labels[s] || s }}
      </a>
    </nav>
  `,
};


const LANG = {
  ID: {
    // Nav
    nav: { beranda:'Beranda', tentang:'Tentang', skill:'Skill', proyek:'Proyek', perjalanan:'Perjalanan', hobi:'Hobi', kontak:'Kontak' },
    // Hero
    eyebrow: 'Portfolio . 2026',
    heroTagline: 'Belajar membangun hal-hal yang indah dari baris kode — satu langkah kecil setiap harinya, seperti kupu-kupu yang perlahan membentuk sayapnya.🦋',
    heroBtn1: 'Tentang Aku', heroBtn2: 'Hubungi Aku',
    typewriterPhrases: ['UI/UX Developer · Frontend Enthusiast','Mahasiswa Informatika, Univ. Satya Terra Bhinneka','Membangun hal indah dari baris kode ✨'],
    // About
    aboutTitle: 'Tentang Saybah',
    aboutLead: 'Hai! Aku <strong>Nursaybah Kirani Br Sembiring</strong>, biasa dipanggil Saybah. Saat ini aku sedang menempuh semester 2 di jurusan <strong>Informatika</strong>, Universitas Satya Terra Bhinneka. Aku tertarik pada dunia UI/UX — karena bagiku, teknologi yang baik adalah yang terasa nyaman dan indah saat digunakan.',
    aboutP2: 'Desain adalah cara aku bercerita tanpa kata-kata — lewat warna, bentuk, dan ruang kosong yang justru punya makna. Setiap elemen yang aku susun adalah bagian dari cerita yang ingin aku sampaikan kepada siapa pun yang melihatnya.',
    statLabel1: 'Proyek Selesai', statLabel2: 'Skill & Tools', statLabel3: 'Semester Berjalan',
    // Skills
    skillTitle: 'Skill & Tools',
    skillsIntro: 'Sebagai calon <strong>UI/UX Developer</strong>, aku menggabungkan kemampuan desain dan teknis berikut untuk membangun produk digital yang cantik sekaligus fungsional.',
    cat1:'🎨 Design Tools', cat2:'💻 Frontend Development', cat3:'🧠 Programming & Logic', cat4:'🗄️ Database', cat5:'🌸 Soft Skills',
    // Projects
    projTitle: 'Proyek & Karya',
    p1Title: 'Portfolio Personal — Saybah',
    p1Desc: 'Website portfolio dengan tema coklat elegan, dan struktur kode yang dipisah ke HTML, CSS, dan JavaScript.',
    p2Title: 'BiodataOUH — Website Konservasi Orangutan',
    p2Desc: 'Website informasi konservasi orangutan bersama tim — menampilkan biodata, fitur pencarian, dan laporan perlindungan habitat.',
    p3Title: 'SiagaID — Aplikasi Layanan Darurat Terpadu',
    p3Desc: 'Aplikasi mobile darurat terpadu — Damkar, Ambulans, Polisi & SAR. Dikerjakan bersama tim, mencakup UI mobile, dashboard Super Admin, dan prototipe interaktif Figma.',
    // Journey
    journeyTitle: 'Perjalanan',
    t1Year:'2019 - 2022', t1Title:'SMP Negeri 05 Satu Atap Bahorok',
    t1Desc:'Selalu masuk 3 besar di kelas, aktif berorganisasi sebagai Bendahara OSIS dan Sekretaris Kelas — awal mula belajar tanggung jawab dan kepemimpinan.',
    t2Year:'2022 - 2025', t2Title:'SMK Swasta Swakarya Salapian',
    t2Desc:'Tiga tahun mempertahankan ranking 1, menjabat sebagai Sekretaris Kelas, dan menjalani PKL selama 3 bulan di Enter Computer Binjai — pengalaman pertama terjun langsung ke dunia teknologi.',
    t3Year:'2025 - Sekarang', t3Title:'Mahasiswa Informatika, Universitas Satya Terra Bhinneka',
    t3Desc:'Sedang memperdalam dasar-dasar pemrograman, struktur data, dan pengembangan web — sambil terus mengeksplorasi sisi kreatif lewat desain antarmuka.',
    t4Year:'Sedang Berlangsung', t4Title:'Membangun Portfolio & Skill Baru',
    t4Desc:'Terus belajar HTML, CSS, dan JavaScript untuk membangun proyek-proyek personal — salah satunya halaman yang sedang kamu lihat sekarang ini 🤎',
    // Hobbies
    hobbyTitle: 'Hal yang Aku Sukai',
    h1:'Cats', h1Back:'Jatuh berkali-kali, bangkit lebih cepat.',
    h2:'Music', h2Back:'Satu nada salah tidak merusak keseluruhan lagu.',
    h3:'Gaming', h3Back:'Level up dalam game, skill up dalam coding.',
    h4:'Chocolate', h4Back:'Dari biji sederhana jadi sesuatu yang luar biasa.',
    // Contact
    contactTitle: 'Mari Terhubung',
    contactDesc: 'Terima kasih sudah mengunjungi portfolio ini. Yuk, terhubung dan ngobrol bareng — siapa tahu kita bisa belajar bareng juga!',
    footer: '© 2026 Nursaybah Kirani Br Sembiring · Dibuat dengan penuh kesabaran & begadang semalaman 🌙',
  },
  EN: {
    nav: { beranda:'Home', tentang:'About', skill:'Skill', proyek:'Projects', perjalanan:'Journey', hobi:'Hobbies', kontak:'Contact' },
    eyebrow: 'Portfolio . 2026',
    heroTagline: 'Learning to build beautiful things from lines of code — one small step at a time, like a butterfly slowly forming its wings. 🦋',
    heroBtn1: 'About Me', heroBtn2: 'Contact Me',
    typewriterPhrases: ['UI/UX Developer · Frontend Enthusiast','Informatics Student, Univ. Satya Terra Bhinneka','Building beautiful things from code ✨'],
    aboutTitle: 'About Saybah',
    aboutLead: 'Hi! I\'m <strong>Nursaybah Kirani Br Sembiring</strong>, usually called Saybah. I\'m currently in my 2nd semester of <strong>Informatics</strong> at Universitas Satya Terra Bhinneka. I\'m passionate about UI/UX — because great technology should feel both comfortable and beautiful to use.',
    aboutP2: 'Design is how I tell stories without words — through color, shape, and the meaningful use of empty space. Every element I arrange is part of a story I want to share with anyone who sees it.',
    statLabel1: 'Projects Done', statLabel2: 'Skill & Tools', statLabel3: 'Semesters',
    skillTitle: 'Skill & Tools',
    skillsIntro: 'As an aspiring <strong>UI/UX Developer</strong>, I combine design and technical skills to build digital products that are both beautiful and functional.',
    cat1:'🎨 Design Tools', cat2:'💻 Frontend Development', cat3:'🧠 Programming & Logic', cat4:'🗄️ Database', cat5:'🌸 Soft Skills',
    projTitle: 'Projects & Work',
    p1Title: 'Personal Portfolio — Saybah',
    p1Desc: 'Portfolio website with an elegant brown theme, with code structured into separate HTML, CSS, and JavaScript files.',
    p2Title: 'BiodataOUH — Orangutan Conservation Website',
    p2Desc: 'Orangutan conservation information website built with a team — featuring biodata, search functionality, and habitat protection reports.',
    p3Title: 'SiagaID — Integrated Emergency Services App',
    p3Desc: 'Integrated mobile emergency app — Fire, Ambulance, Police & SAR. Built with a team, covering mobile UI, Super Admin dashboard, and Figma interactive prototype.',
    journeyTitle: 'Journey',
    t1Year:'2019 - 2022', t1Title:'SMP Negeri 05 Satu Atap Bahorok',
    t1Desc:'Consistently in the top 3 of class, active in student organizations as OSIS Treasurer and Class Secretary — the beginning of learning responsibility and leadership.',
    t2Year:'2022 - 2025', t2Title:'SMK Swasta Swakarya Salapian',
    t2Desc:'Maintained rank 1 for three years, served as Class Secretary, and completed a 3-month internship at Enter Computer Binjai — first real-world tech experience.',
    t3Year:'2025 - Present', t3Title:'Informatics Student, Universitas Satya Terra Bhinneka',
    t3Desc:'Deepening foundations in programming, data structures, and web development — while continuously exploring the creative side through interface design.',
    t4Year:'Ongoing', t4Title:'Building Portfolio & New Skills',
    t4Desc:'Continuously learning HTML, CSS, and JavaScript to build personal projects — including the page you\'re looking at right now 🤎',
    hobbyTitle: 'Things I Love',
    h1:'Cats', h1Back:'Fall many times, rise even faster.',
    h2:'Music', h2Back:'One wrong note doesn\'t ruin the whole song.',
    h3:'Gaming', h3Back:'Level up in game, skill up in coding.',
    h4:'Chocolate', h4Back:'From a simple bean to something extraordinary.',
    contactTitle: "Let's Connect",
    contactDesc: 'Thank you for visiting my portfolio! Let\'s connect and have a chat — maybe we can learn together too!',
    footer: '© 2026 Nursaybah Kirani Br Sembiring · Built with patience & all-nighters 🌙',
  }
};


let currentLang    = 'ID';
let navApp         = null;
let navLabelsRef   = { value: LANG.ID.nav };
let twApp          = null;
let twPhrasesRef   = { value: LANG.ID.typewriterPhrases };
let heroApp        = null;
let heroLabelsRef  = { value: { btn1: LANG.ID.heroBtn1, btn2: LANG.ID.heroBtn2 } };
let hobbyApp       = null;
let statApp        = null;

function applyTranslation(lang) {
  const t = LANG[lang];

 
  const eyebrow = document.querySelector('.hero-eyebrow');
  if (eyebrow) eyebrow.textContent = t.eyebrow;

  
  const tagline = document.querySelector('.hero-tagline');
  if (tagline) tagline.textContent = t.heroTagline;

  
  const heroButtons = document.querySelector('.hero-buttons');
  if (heroButtons) {
    heroButtons.innerHTML = '';
    createApp({
      components: { MagicBtn },
      setup() {
        const go = href => document.querySelector(href)?.scrollIntoView({ behavior:'smooth' });
        return { go, t };
      },
      template: `
        <MagicBtn :label="t.heroBtn1" href="#tentang" variant="primary" @click="go('#tentang')" />
        <MagicBtn :label="t.heroBtn2" href="#kontak"  variant="ghost"   @click="go('#kontak')"  />
      `,
    }).mount(heroButtons);
  }

  
  const twMount = document.getElementById('vt-mount');
  if (twMount) {
    twMount.innerHTML = '';
    createApp({
      components: { TypewriterHero },
      data() { return { phrases: t.typewriterPhrases }; },
      template: `<TypewriterHero :phrases="phrases" />`,
    }).mount(twMount);
  }

  
  const aboutTitle = document.querySelector('#tentang .section-title');
  if (aboutTitle) aboutTitle.textContent = t.aboutTitle;
  const aboutLead = document.querySelector('.about-lead');
  if (aboutLead) aboutLead.innerHTML = t.aboutLead;
  const aboutPs = document.querySelectorAll('.about-text > p:not(.about-lead)');
  if (aboutPs[0]) aboutPs[0].textContent = t.aboutP2;

  
  const statLabels = document.querySelectorAll('.stat-label');
  if (statLabels[0]) statLabels[0].textContent = t.statLabel1;
  if (statLabels[1]) statLabels[1].textContent = t.statLabel2;
  if (statLabels[2]) statLabels[2].textContent = t.statLabel3;

  
  const skillTitle = document.querySelector('#skill .section-title');
  if (skillTitle) skillTitle.textContent = t.skillTitle;
  const skillsIntro = document.querySelector('.skills-intro');
  if (skillsIntro) skillsIntro.innerHTML = t.skillsIntro;
  const cats = document.querySelectorAll('.skill-category');
  const catKeys = ['cat1','cat2','cat3','cat4','cat5'];
  cats.forEach((el, i) => { if (t[catKeys[i]]) el.textContent = t[catKeys[i]]; });

  
  const projTitle = document.querySelector('#proyek .section-title');
  if (projTitle) projTitle.textContent = t.projTitle;
  const projCards = document.querySelectorAll('.project-card');
  const projData = [
    { title: t.p1Title, desc: t.p1Desc },
    { title: t.p2Title, desc: t.p2Desc },
    { title: t.p3Title, desc: t.p3Desc },
  ];
  projCards.forEach((card, i) => {
    const h3 = card.querySelector('h3');
    const p  = card.querySelector('.project-body p');
    if (h3 && projData[i]) h3.textContent = projData[i].title;
    if (p  && projData[i]) p.textContent  = projData[i].desc;
  });

  
  const journeyTitle = document.querySelector('#perjalanan .section-title');
  if (journeyTitle) journeyTitle.textContent = t.journeyTitle;
  const tlItems = document.querySelectorAll('.timeline-item');
  const tlData = [
    { year: t.t1Year, title: t.t1Title, desc: t.t1Desc },
    { year: t.t2Year, title: t.t2Title, desc: t.t2Desc },
    { year: t.t3Year, title: t.t3Title, desc: t.t3Desc },
    { year: t.t4Year, title: t.t4Title, desc: t.t4Desc },
  ];
  tlItems.forEach((item, i) => {
    const year  = item.querySelector('.timeline-year');
    const title = item.querySelector('h3');
    const desc  = item.querySelector('p');
    if (year  && tlData[i]) year.textContent  = tlData[i].year;
    if (title && tlData[i]) title.textContent = tlData[i].title;
    if (desc  && tlData[i]) desc.textContent  = tlData[i].desc;
  });

  
  const hobbyGrid = document.querySelector('.hobby-grid');
  if (hobbyGrid) {
    hobbyGrid.innerHTML = '<div id="vh-mount" style="display:contents"></div>';
    createApp({
      components: { HobbyCardVue },
      data() {
        return {
          hobbies: [
            { icon:'🐱', title: t.h1, back: t.h1Back, color:'#b9835c' },
            { icon:'🎧', title: t.h2, back: t.h2Back, color:'#d8b078' },
            { icon:'🎮', title: t.h3, back: t.h3Back, color:'#7eb8d4' },
            { icon:'🍫', title: t.h4, back: t.h4Back, color:'#e2b3a3' },
          ]
        };
      },
      template: `
        <HobbyCardVue v-for="h in hobbies" :key="h.title"
          :icon="h.icon" :title="h.title" :backText="h.back" :color="h.color" />
      `,
    }).mount('#vh-mount');
  }

  
  const hobbyTitle = document.querySelector('#hobi .section-title');
  if (hobbyTitle) hobbyTitle.textContent = t.hobbyTitle;

  
  const contactTitle = document.querySelector('#kontak .section-title');
  if (contactTitle) contactTitle.textContent = t.contactTitle;
  const contactDesc = document.querySelector('.contact-card > p');
  if (contactDesc) contactDesc.textContent = t.contactDesc;
  const footerP = document.querySelector('.footer p');
  if (footerP) footerP.textContent = t.footer;

  
  const navLinksEl = document.querySelector('.vue-nav') || document.querySelector('.nav-links');
  if (navLinksEl) {
    const mountEl = document.createElement('div');
    navLinksEl.parentNode.replaceChild(mountEl, navLinksEl);
    createApp({
      components: { VueNav },
      data() { return { labels: t.nav }; },
      template: `<VueNav :labels="labels" />`,
    }).mount(mountEl);
  }

  
  const langBtn = document.getElementById('langToggle');
  if (langBtn) langBtn.textContent = '🌐 ' + (lang === 'ID' ? 'EN' : 'ID');
}


function initDarkMode() {
  const darkBtn = document.getElementById('darkToggle');
  if (!darkBtn) return;
  darkBtn.addEventListener('click', (e) => {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    darkBtn.textContent = isDark ? '☀️' : '🌙';

    spawnBling(e.clientX, e.clientY, 10, isDark
      ? ['#3d1f0f','#6b3a1f','#c8a882','#fff']
      : ['#d8b078','#f8efe3','#e2b3a3','#fff']
    );
  });
}


window.addEventListener('DOMContentLoaded', () => {

  
  const heroButtons = document.querySelector('.hero-buttons');
  if (heroButtons) {
    heroButtons.innerHTML = '';
    createApp({
      components: { MagicBtn },
      setup() {
        const go = href => document.querySelector(href)?.scrollIntoView({ behavior:'smooth' });
        return { go };
      },
      template: `
        <MagicBtn label="Tentang Aku" href="#tentang" variant="primary" @click="go('#tentang')" />
        <MagicBtn label="Hubungi Aku" href="#kontak"  variant="ghost"   @click="go('#kontak')"  />
      `,
    }).mount(heroButtons);
  }

  
  const subtitleEl = document.querySelector('.hero-subtitle');
  if (subtitleEl) {
    subtitleEl.innerHTML = '<span id="vt-mount"></span>';
    createApp({
      components: { TypewriterHero },
      data() { return { phrases: LANG.ID.typewriterPhrases }; },
      template: `<TypewriterHero :phrases="phrases" />`,
    }).mount('#vt-mount');
  }

  
  const contactLinks = document.querySelector('.contact-links');
  if (contactLinks) {
    contactLinks.innerHTML = '<div id="vc-mount" style="display:contents"></div>';
    createApp({
      components: { EmojiBtn },
      template: `
        <EmojiBtn label="Instagram" href="https://www.instagram.com/sssaybah_"  emoji="📸" color="#e2b3a3" />
        <EmojiBtn label="Email"     href="mailto:saybahkirani1@gmail.com"        emoji="✉️" color="#d8b078" />
        <EmojiBtn label="WhatsApp"  href="https://wa.me/6285277646574"           emoji="💬" color="#b9835c" />
      `,
    }).mount('#vc-mount');
  }

 
  const statRow = document.querySelector('.stat-row');
  if (statRow) {
    statRow.innerHTML = '<div id="vs-mount" style="display:contents"></div>';
    createApp({
      components: { StatCard },
      template: `
        <StatCard :target="3"  label="Proyek Selesai"    href="#proyek" />
        <StatCard :target="10" label="Skill & Tools"     href="#skill"  />
        <StatCard :target="2"  label="Semester Berjalan" />
      `,
    }).mount('#vs-mount');
  }

  
  const hobbyGrid = document.querySelector('.hobby-grid');
  if (hobbyGrid) {
    hobbyGrid.innerHTML = '<div id="vh-mount" style="display:contents"></div>';
    createApp({
      components: { HobbyCardVue },
      data() {
        return {
          hobbies: [
            { icon:'🐱', title:'Cats',      back:'Jatuh berkali-kali, bangkit lebih cepat.',         color:'#b9835c' },
            { icon:'🎧', title:'Music',     back:'Satu nada salah tidak merusak keseluruhan lagu.',  color:'#d8b078' },
            { icon:'🎮', title:'Gaming',    back:'Level up dalam game, skill up dalam coding.',      color:'#7eb8d4' },
            { icon:'🍫', title:'Chocolate', back:'Dari biji sederhana jadi sesuatu yang luar biasa.',color:'#e2b3a3' },
          ]
        };
      },
      template: `
        <HobbyCardVue v-for="h in hobbies" :key="h.title"
          :icon="h.icon" :title="h.title" :backText="h.back" :color="h.color" />
      `,
    }).mount('#vh-mount');
  }

  
  const navLinksEl = document.querySelector('.nav-links');
  if (navLinksEl) {
    const mountEl = document.createElement('div');
    navLinksEl.parentNode.replaceChild(mountEl, navLinksEl);
    createApp({
      components: { VueNav },
      data() { return { labels: LANG.ID.nav }; },
      template: `<VueNav :labels="labels" />`,
    }).mount(mountEl);
  }

  
  document.querySelectorAll('.skill-card').forEach(card => {
    card.addEventListener('click', (e) => {
      const icon = card.querySelector('.skill-icon');
      if (icon) {
        icon.classList.remove('spin-once');
        void icon.offsetWidth;
        icon.classList.add('spin-once');
        icon.addEventListener('animationend', () => icon.classList.remove('spin-once'), { once: true });
      }
      spawnBling(e.clientX, e.clientY, 7, ['#d8b078','#fff','#e2b3a3']);
    });
  });

  
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('click', (e) => {
      const emoji = card.querySelector('.project-emoji');
      if (emoji) {
        emoji.classList.remove('spin-once');
        void emoji.offsetWidth;
        emoji.classList.add('spin-once');
        emoji.addEventListener('animationend', () => emoji.classList.remove('spin-once'), { once: true });
      }
      spawnBling(e.clientX, e.clientY, 9, ['#d8b078','#fff','#e2b3a3','#b9835c']);
    });
  });

  
  document.querySelectorAll('.section-num').forEach(el => {
    el.addEventListener('mouseenter', (e) => {
      const rect = el.getBoundingClientRect();
      spawnBling(rect.left + rect.width/2, rect.top + rect.height/2, 6, ['#d8b078','#fff']);
    });
  });

  
  const langBtn = document.getElementById('langToggle');
  if (langBtn) {
    langBtn.addEventListener('click', (e) => {
      currentLang = currentLang === 'ID' ? 'EN' : 'ID';
      spawnBling(e.clientX, e.clientY, 8, ['#7eb8d4','#fff','#d4b8e0']);
     
      document.body.classList.add('lang-flash');
      setTimeout(() => document.body.classList.remove('lang-flash'), 400);
      applyTranslation(currentLang);
    });
  }

  initDarkMode();

  injectCSS();
});

function injectCSS() {
  const style = document.createElement('style');
  style.textContent = `

/* ---- Bling Sparks ---- */
.bling-spark {
  position: fixed;
  border-radius: 50%;
  pointer-events: none;
  z-index: 99999;
  transform: translate(-50%, -50%);
  animation: bling-fly 0.6s cubic-bezier(.22,.61,.36,1) forwards;
}
@keyframes bling-fly {
  0%   { transform: translate(-50%,-50%) scale(1); opacity: 1; }
  100% { transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(0); opacity: 0; }
}

/* ---- Emoji Spin ---- */
.spin-once {
  animation: emoji-spin 0.55s cubic-bezier(.22,.61,.36,1) forwards;
  display: inline-block;
}
@keyframes emoji-spin {
  0%   { transform: rotate(0deg) scale(1); }
  40%  { transform: rotate(200deg) scale(1.4); }
  100% { transform: rotate(360deg) scale(1); }
}

/* ---- MagicBtn ---- */
.magic-btn {
  position: relative; overflow: hidden; display: inline-flex;
  align-items: center; justify-content: center;
  transform-style: preserve-3d;
  transition: transform 0.25s cubic-bezier(.22,.61,.36,1), box-shadow 0.25s;
  will-change: transform;
}
.magic-btn__shimmer {
  position: absolute; inset: 0;
  background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,.35) 50%, transparent 60%);
  transform: translateX(-130%); border-radius: inherit; pointer-events: none;
}
.magic-btn__shimmer.active { transform: translateX(130%); transition: transform 0.55s ease; }
.magic-btn__label { position: relative; display: inline-flex; z-index: 1; }
.magic-btn__char {
  display: inline-block;
  transition: transform 0.28s cubic-bezier(.22,.61,.36,1);
  transition-delay: var(--delay, 0s);
}
.magic-btn:hover .magic-btn__char             { transform: translateY(-3px); }
.magic-btn:hover .magic-btn__char:nth-child(even) { transform: translateY(3px); }
.magic-btn__ripple {
  position: absolute; width: 6px; height: 6px; border-radius: 50%;
  background: rgba(255,255,255,.5);
  transform: translate(-50%,-50%) scale(0);
  animation: vue-ripple 0.65s ease-out forwards; pointer-events: none;
}
@keyframes vue-ripple { to { transform: translate(-50%,-50%) scale(32); opacity: 0; } }
.magic-btn.btn-primary:hover {
  box-shadow: 0 0 0 2px var(--gold), 0 14px 28px -10px rgba(216,176,120,.65);
}
.magic-btn.btn-ghost:hover {
  box-shadow: 0 0 0 1px rgba(248,239,227,.55), 0 14px 28px -12px rgba(74,47,34,.4);
}

/* ---- EmojiBtn (ContactPill) ---- */
.emoji-btn {
  position: relative; overflow: hidden; isolation: isolate;
  --mx:50%; --my:50%;
  transition: transform .3s cubic-bezier(.22,.61,.36,1), box-shadow .3s;
}
.emoji-btn__glow {
  position: absolute; width: 130px; height: 130px; border-radius: 50%;
  opacity: 0; filter: blur(28px);
  left: var(--mx); top: var(--my);
  transform: translate(-50%,-50%);
  transition: opacity .3s; pointer-events: none; z-index: 0;
}
.emoji-btn:hover .emoji-btn__glow { opacity: .6; }
.emoji-btn.glowing .emoji-btn__glow { opacity: 1; }
.emoji-btn__icon {
  font-size: 1.15rem; margin-right: .45rem;
  position: relative; z-index: 1;
  display: inline-block;
  transition: transform .3s cubic-bezier(.22,.61,.36,1);
}
.emoji-btn:hover .emoji-btn__icon { transform: rotate(-15deg) scale(1.3); }
.emoji-btn__icon.spin { animation: emoji-spin 0.55s cubic-bezier(.22,.61,.36,1) forwards; }
.emoji-btn__label { position: relative; z-index: 1; }
.emoji-btn.spinning { animation: pill-bounce .4s cubic-bezier(.22,.61,.36,1); }
@keyframes pill-bounce {
  0%{transform:scale(1)} 35%{transform:scale(.92) translateY(2px)}
  70%{transform:scale(1.08) translateY(-5px)} 100%{transform:scale(1)}
}

/* ---- HobbyCard ---- */
.hobby-card-flip.flipped { transform: rotateY(180deg); }

/* ---- StatCard ---- */
.vue-stat { transition: transform .35s, box-shadow .35s; cursor: pointer; }
.vue-stat:hover { transform: translateY(-7px) scale(1.05); box-shadow: 0 20px 40px -22px rgba(74,47,34,.55); }
.vue-stat .stat-number { display:block; font-size:2rem; font-family:var(--font-display); font-weight:700; color:var(--mocha); line-height:1; }
.vue-stat .stat-label  { font-size:.78rem; color:var(--caramel); letter-spacing:.06em; text-transform:uppercase; margin-top:.3rem; display:block; }

/* ---- Typewriter ---- */
.vue-typewriter { color: var(--latte); }
.vue-caret { display:inline-block; color:var(--gold); font-weight:300; animation:caret-blink 1s step-end infinite; margin-left:1px; }
@keyframes caret-blink { 0%,100%{opacity:1} 50%{opacity:0} }

/* ---- Navbar ---- */
.vue-nav { display:flex; gap:2.2rem; font-size:.85rem; letter-spacing:.08em; text-transform:uppercase; }
.vue-nav a { position:relative; padding-bottom:4px; transition:opacity .4s; color:inherit; text-decoration:none; }
.vue-nav a::after { content:''; position:absolute; left:0; bottom:0; width:0; height:1px; background:currentColor; transition:width .4s cubic-bezier(.22,.61,.36,1); }
.vue-nav a:hover::after, .vue-nav a.nav-active::after { width:100%; }
.vue-nav a.nav-active { font-weight:600; }

/* ---- Project card click hint ---- */
.project-card { cursor: pointer; position: relative; overflow: hidden; }
.project-card::after {
  content: '↗ Lihat Proyek'; position:absolute; bottom:-40px; right:1.6rem;
  font-size:.75rem; letter-spacing:.08em; text-transform:uppercase;
  color:var(--caramel); font-weight:600;
  transition: bottom .35s cubic-bezier(.22,.61,.36,1);
}
.project-card:hover::after { bottom:1.2rem; }
.project-card:active { transform: translateY(-2px) scale(0.97); transition: transform 0.1s ease; }

/* ---- Lang flash ---- */
@keyframes lang-flash { 0%{opacity:1} 30%{opacity:.5} 100%{opacity:1} }
body.lang-flash { animation: lang-flash .35s ease; }

/* ---- DARK MODE — Hitam & Coklat Tua Elegan ---- */
body.dark {
  --cream: #f0e6d6;
  --espresso: #1a0e06;
  --mocha: #2c1a0e;
  --coffee: #4a2f1a;
  --caramel: #c8956a;
  --latte: #d4b896;
  --gold: #c8956a;
  --blush: #b8785a;
  background: #0f0805;
  color: #e8d5be;
}
body.dark section           { background: #120a05; }
body.dark .about            { background: linear-gradient(180deg, #120a05, #0f0805); }
body.dark .skills           { background: #0d0703; }
body.dark .projects         { background: #0f0805; }
body.dark .hobbies          { background: #0d0703; }
body.dark .journey          { background: linear-gradient(180deg, #120a05, #0f0805); }
body.dark .contact          { background: linear-gradient(160deg, #080401, #120a05); }

body.dark .project-card     { background: #1e1008; border-color: rgba(200,149,106,.15); }
body.dark .timeline-card    { background: #1e1008; border-color: rgba(200,149,106,.12); }
body.dark .skill-card       { background: #1a0d06; border-color: rgba(200,149,106,.12); }
body.dark .soft-skill-pill  { background: #1e1008; color: #d4b896; border-color: rgba(200,149,106,.2); }
body.dark .hobby-face.hobby-front { background: linear-gradient(150deg, #1e1008, #150c04); border-color: rgba(200,149,106,.12); }
body.dark .hobby-face.hobby-back  { background: linear-gradient(150deg, #2c1505, #1a0d06); }

body.dark .section-title    { color: #e8d5be; }
body.dark .section-num      { border-color: rgba(200,149,106,.5) !important; color: #c8956a !important; }
body.dark .about-text p, body.dark .about-lead { color: #b8a090; }
body.dark .about-lead strong { color: #c8956a; }
body.dark .project-body h3  { color: #e8d5be; }
body.dark .project-body p   { color: #8a7060; }
body.dark .timeline-card h3 { color: #e8d5be; }
body.dark .timeline-card p  { color: #8a7060; }
body.dark .hobby-front h3   { color: #e8d5be; }
body.dark .hobby-back p     { color: #d4b896; }
body.dark .timeline-year    { color: #c8956a; }

body.dark .btn-primary      { background: linear-gradient(135deg, #6b3a1f, #c8956a); color: #f0e6d6; }
body.dark .btn-primary:hover { box-shadow: 0 0 30px rgba(200,149,106,.35), 0 12px 24px -10px rgba(107,58,31,.5); }
body.dark .btn-ghost        { border-color: rgba(200,149,106,.35); }
body.dark .btn-ghost:hover  { background: rgba(200,149,106,.08); }

body.dark .contact-pill, body.dark .emoji-btn {
  border-color: rgba(200,149,106,.3);
  color: #e8d5be;
}
body.dark .contact-pill:hover, body.dark .emoji-btn:hover {
  background: linear-gradient(135deg, #6b3a1f, #4a2010);
  color: #f0e6d6;
}

body.dark .skill-bar        { background: rgba(200,149,106,.1) !important; }
body.dark .vue-stat .stat-number { color: #c8956a; }
body.dark .vue-stat .stat-label  { color: #8a7060; }
body.dark .vue-stat:hover   { box-shadow: 0 20px 40px -22px rgba(8,4,1,.8); }

body.dark .navbar           { background: rgba(8,4,1,.85); border-bottom: 1px solid rgba(200,149,106,.1); }
body.dark .toggle-btn       { background: rgba(200,149,106,.1) !important; border-color: rgba(200,149,106,.25) !important; color: #d4b896 !important; }
body.dark .toggle-btn:hover { background: rgba(200,149,106,.2) !important; }

body.dark .hero { background: linear-gradient(160deg, #080401 0%, #120a05 55%, #1e0f07 100%) !important; }
body.dark .hero-title       { color: #e8d5be; }
body.dark .hero-title-accent { color: #c8956a; }
body.dark .hero-tagline     { color: rgba(212,184,150,.6); }
body.dark .footer           { color: rgba(200,149,106,.4) !important; }
body.dark .skill-category   { color: #c8956a; }
body.dark .skills-intro     { color: #8a7060; }
body.dark .project-card::after { color: #c8956a; }
body.dark .vue-caret        { color: #c8956a; }
body.dark .vue-typewriter   { color: #d4b896; }

/* ---- Reduced Motion ---- */
@media (prefers-reduced-motion: reduce) {
  .magic-btn__char, .magic-btn__ripple, .bling-spark,
  .spin-once, .emoji-btn__icon, .vue-caret { animation: none !important; transition: none !important; }
}
  `;
  document.head.appendChild(style);
}

/* ===========================
   MOBILE MENU
=========================== */

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");
const overlay = document.getElementById("menuOverlay");

if (menuToggle && navLinks && overlay) {

    menuToggle.addEventListener("click", () => {

        navLinks.classList.toggle("show");
        overlay.classList.toggle("show");

        menuToggle.innerHTML =
            navLinks.classList.contains("show")
            ? "✕"
            : "☰";

    });

    overlay.addEventListener("click", () => {

        navLinks.classList.remove("show");
        overlay.classList.remove("show");
        menuToggle.innerHTML = "☰";

    });

    document.querySelectorAll(".nav-links a").forEach(link => {

        link.addEventListener("click", () => {

            navLinks.classList.remove("show");
            overlay.classList.remove("show");
            menuToggle.innerHTML = "☰";

        });

    });

}
