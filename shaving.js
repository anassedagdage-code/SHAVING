/* ---------------------------------------------------------
   HERO VISUAL — put a link to your own photo here
--------------------------------------------------------- */
const HERO_IMAGE_URL = 'images.jpg'; // e.g. 'https://example.com/my-photo.jpg'

if(HERO_IMAGE_URL){
  const heroImg = document.getElementById('heroVisualImg');
  if(heroImg){
    heroImg.src = HERO_IMAGE_URL;
    heroImg.classList.remove('hidden');
  }
}

/* ---------------------------------------------------------
   SHOP LOGO — put a link to your own logo/photo here
--------------------------------------------------------- */
const LOGO_URL = 'images.jpg'; // e.g. 'https://example.com/my-logo.jpg'

if(LOGO_URL){
  const logoMark = document.getElementById('logoMark');
  if(logoMark){
    logoMark.style.background = 'none';
    logoMark.innerHTML = `<img src="${LOGO_URL}" alt="" class="logo-photo">`;
  }
}

/* ---------------------------------------------------------
   DATA
--------------------------------------------------------- */
const CUTS = [
  {
    id:'skin-fade', name:'Skin Fade', price:90,category:'fade', duration:'40 min', image:'skin fade.jpg', // put an image URL here
    desc:'Bald-to-blend fade, sharp neckline, styled finish.',
    icon:`<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M8 30 L20 12 C24 6 32 8 32 16 C32 22 26 24 22 28 L14 40"/><rect x="30" y="24" width="10" height="6" rx="1" transform="rotate(28 30 24)"/></svg>`
  },
  {
    id:'classic-taper', name:'Classic Taper',category:'fade', price:90, duration:'35 min', image:'classic taper.jpg', // put an image URL here
    desc:'Timeless taper with scissor work on top.',
    icon:`<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="16" cy="14" r="6"/><circle cx="16" cy="34" r="6"/><path d="M20 18 L38 36"/><path d="M20 30 L38 12"/></svg>`
  },
  {
    id:'buzz-cut', name:'Buzz Cut', price:70,category:'fade', duration:'20 min', image:'buzz cut.jpg', // put an image URL here
    desc:'Even, all-over clipper cut. Quick and clean.',
    icon:`<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="10" y="16" width="20" height="16" rx="2"/><path d="M30 20 L40 20 L40 28 L30 28"/><path d="M14 32 L14 38 M20 32 L20 38 M26 32 L26 38"/></svg>`
  },
  {
    id:'beard-sculpt', name:'Beard Sculpt',category:'fade', price:60, duration:'25 min', image:'beard sculpt.png', // put an image URL here
    desc:'Line-up, taper and shape with a straight razor edge.',
    icon:`<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M14 10 C14 24 14 30 24 38 C34 30 34 24 34 10"/><path d="M18 20 C22 24 26 24 30 20"/></svg>`
  },
  {
    id:'hot-towel-shave', name:'Hot Towel Shave',category:'fade', price:120, duration:'1h', image:'hot towel shave.jpg', // put an image URL here
    desc:'Traditional lather shave with a warm towel finish.',
    icon:`<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 30 C12 20 18 12 24 12 C30 12 36 20 36 30" /><path d="M10 30 L38 30 L36 38 L12 38 Z"/><path d="M20 8 C18 10 18 12 20 14 M28 8 C26 10 26 12 28 14"/></svg>`
  },
  {
    id:'kids-cut', name:"Kids Cut", price:50,category:'fade', duration:'25 min', image:'kids cut.jpg', // put an image URL here
    desc:'Gentle trim for the under-12 crowd. Ages 4–12.',
    icon:`<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="24" cy="18" r="9"/><path d="M14 40 C14 30 18 26 24 26 C30 26 34 30 34 40"/></svg>`
  },
];

const SLOT_HOURS = ['09:00','10:00','11:00','12:00','14:00','15:00','16:00','17:00','18:00'];
const CAPACITY = 3;
const COOLDOWN_MS = 30000;
const CURRENCY = 'MAD';

let state = {
  cut: null,
  date: null,   // yyyy-mm-dd
  time: null,
  bookingCounts: {}, // key `${date}|${time}` -> count
};

/* ---------------------------------------------------------
   STORAGE HELPERS (shared, so capacity + cooldown are global)
--------------------------------------------------------- */
async function getShared(key, fallback){
  try{
    const res = await window.storage.get(key, true);
    return res ? JSON.parse(res.value) : fallback;
  }catch(e){
    return fallback;
  }
}
async function setShared(key, value){
  try{
    await window.storage.set(key, JSON.stringify(value), true);
  }catch(e){ /* best effort */ }
}

/* ---------------------------------------------------------
   RENDER: CUT CARDS
--------------------------------------------------------- */
const cutsGrid = document.getElementById('cutsGrid');
try{
  if(!cutsGrid) throw new Error('#cutsGrid element not found in the HTML.');

  CUTS.forEach(cut=>{
    const card = document.createElement('div');
    card.className = 'cut-card';
    card.dataset.id = cut.id;
    card.innerHTML = `
      <div class="cut-icon" id="icon-${cut.id}">${cut.icon}</div>
      <h3>${cut.name}</h3>
      <div class="cut-desc">${cut.desc}</div>
      <div class="cut-foot">
        <span class="cut-price">${cut.price} ${CURRENCY}</span>
        <span class="cut-time">${cut.duration}</span>
      </div>
    `;
    card.addEventListener('click', ()=> selectCut(cut.id));

    // Add the card to the page BEFORE touching #icon-<id> by id,
    // otherwise it doesn't exist in the live DOM yet and lookups fail.
    cutsGrid.appendChild(card);

    // Show the photo set directly on the cut object above (cut.image).
    // Clicking the photo opens it bigger (see setCutPhoto / lightbox).
    if(cut.image){
      setCutPhoto(cut.id, cut.image);
    }
  });
}catch(err){
  console.error('Failed to render cuts:', err);
  if(cutsGrid){
    cutsGrid.innerHTML = `<div style="color:#c14536; font-family:monospace; font-size:0.85rem;">Couldn't load the cuts: ${err.message}</div>`;
  }
}

function setCutPhoto(cutId, dataUrl){
  const iconEl = document.getElementById(`icon-${cutId}`);
  if(!iconEl) return;
  iconEl.innerHTML = `<img src="${dataUrl}" alt="" class="cut-photo">`;
  iconEl.querySelector('img').addEventListener('click', (e)=>{
    e.stopPropagation();
    openPhotoLightbox(dataUrl);
  });
}

/* ---------------------------------------------------------
   PHOTO LIGHTBOX
--------------------------------------------------------- */
const photoLightbox = document.createElement('div');
photoLightbox.className = 'photo-lightbox hidden';
photoLightbox.innerHTML = `
  <div class="photo-lightbox-inner">
    <button class="photo-lightbox-close" aria-label="Close">✕</button>
    <img id="photoLightboxImg" src="" alt="">
  </div>
`;
document.body.appendChild(photoLightbox);

function openPhotoLightbox(src){
  document.getElementById('photoLightboxImg').src = src;
  photoLightbox.classList.remove('hidden');
}
function closePhotoLightbox(){
  photoLightbox.classList.add('hidden');
}
photoLightbox.addEventListener('click', (e)=>{
  if(e.target === photoLightbox) closePhotoLightbox();
});
photoLightbox.querySelector('.photo-lightbox-close').addEventListener('click', closePhotoLightbox);
document.addEventListener('keydown', (e)=>{
  if(e.key === 'Escape') closePhotoLightbox();
});

function selectCut(id){
  state.cut = CUTS.find(c=>c.id===id);
  document.querySelectorAll('.cut-card').forEach(el=>{
    el.classList.toggle('selected', el.dataset.id === id);
  });
  refreshSummary();
  document.getElementById('booking').scrollIntoView({behavior:'smooth'});
}

/* ---------------------------------------------------------
   RENDER: DATE PILLS
--------------------------------------------------------- */
const datePills = document.getElementById('datePills');
const DAYS = [];
for(let i=0;i<7;i++){
  const d = new Date();
  d.setDate(d.getDate()+i);
  DAYS.push(d);
}
function fmtDateKey(d){
  return d.toISOString().slice(0,10);
}
DAYS.forEach((d,i)=>{
  const pill = document.createElement('div');
  pill.className = 'date-pill' + (i===0 ? ' active':'');
  pill.dataset.date = fmtDateKey(d);
  pill.innerHTML = `
    <div class="d1">${i===0?'Today':d.toLocaleDateString('en-US',{weekday:'short'})}</div>
    <div class="d2">${d.getDate()}</div>
  `;
  pill.addEventListener('click', ()=> selectDate(pill.dataset.date));
  datePills.appendChild(pill);
});

async function selectDate(dateKey){
  state.date = dateKey;
  state.time = null;
  document.querySelectorAll('.date-pill').forEach(el=>{
    el.classList.toggle('active', el.dataset.date === dateKey);
  });
  await renderSlots();
  refreshSummary();
}

/* ---------------------------------------------------------
   RENDER: SLOTS
--------------------------------------------------------- */
const slotGrid = document.getElementById('slotGrid');
async function renderSlots(){
  slotGrid.innerHTML = '<div style="color:var(--cream-dim); font-size:0.85rem;">Loading availability…</div>';
  const counts = {};
  for(const hour of SLOT_HOURS){
    const key = `slot|${state.date}|${hour}`;
    const c = await getShared(key, 0);
    counts[hour] = c;
  }
  slotGrid.innerHTML = '';
  SLOT_HOURS.forEach(hour=>{
    const count = counts[hour] || 0;
    const full = count >= CAPACITY;
    const el = document.createElement('div');
    el.className = 'slot' + (full ? ' full' : '') + (state.time===hour ? ' selected':'');
    el.innerHTML = `
      <span class="time">${hour}</span>
      <div class="cap">
        <div class="cap-dots">
          ${[0,1,2].map(i=>`<span class="cap-dot ${i<count?'filled':''}"></span>`).join('')}
        </div>
        <span>${full ? 'Full' : (CAPACITY-count)+' left'}</span>
      </div>
    `;
    if(!full){
      el.addEventListener('click', ()=>{
        state.time = hour;
        document.querySelectorAll('.slot').forEach(s=>s.classList.remove('selected'));
        el.classList.add('selected');
        refreshSummary();
      });
    }
    slotGrid.appendChild(el);
  });
}
selectDate(DAYS[0].toISOString().slice(0,10));

/* ---------------------------------------------------------
   SUMMARY + STEP NAV
--------------------------------------------------------- */
function fmtDateLabel(dateKey){
  const d = new Date(dateKey + 'T00:00:00');
  return d.toLocaleDateString('en-US',{weekday:'long', month:'short', day:'numeric'});
}

function refreshSummary(){
  const ready = state.cut && state.date && state.time;
  const summaryBox = document.getElementById('step2Summary');
  const toDetailsBtn = document.getElementById('toDetailsBtn');
  if(state.cut){
    summaryBox.classList.remove('hidden');
    document.getElementById('sumCut').textContent = `${state.cut.name}`;
  }
  if(state.date && state.time){
    document.getElementById('sumWhen').textContent = `${fmtDateLabel(state.date)}, ${state.time}`;
  }
  if(state.cut){
    document.getElementById('sumPrice').textContent = `${state.cut.price} ${CURRENCY}`;
  }
  toDetailsBtn.disabled = !ready;
  setActiveStep(ready ? 2 : (state.cut?2:1));
}

function setActiveStep(n){
  document.querySelectorAll('.progress-step').forEach(el=>{
    const step = parseInt(el.dataset.step,10);
    el.classList.toggle('active', step===n);
    el.classList.toggle('done', step<n);
  });
}

function goToDetails(){
  document.getElementById('sumCut2').textContent = state.cut.name;
  document.getElementById('sumWhen2').textContent = `${fmtDateLabel(state.date)}, ${state.time}`;
  document.getElementById('sumPrice2').textContent = `${state.cut.price} ${CURRENCY}`;
  setActiveStep(3);
  document.getElementById('details').scrollIntoView({behavior:'smooth'});
}

/* ---------------------------------------------------------
   COOLDOWN + SUBMIT
--------------------------------------------------------- */
const payBtn = document.getElementById('payBtn');
const cooldownNote = document.getElementById('cooldownNote');
let cooldownTimer = null;

async function checkCooldown(){
  const last = await getShared('lastBookingAt', 0);
  const remain = COOLDOWN_MS - (Date.now() - last);
  return remain;
}

async function tickCooldownDisplay(){
  const remain = await checkCooldown();
  if(remain > 0){
    payBtn.disabled = true;
    cooldownNote.textContent = `The shop needs a short pause between bookings — try again in ${Math.ceil(remain/1000)}s.`;
    clearTimeout(cooldownTimer);
    cooldownTimer = setTimeout(tickCooldownDisplay, 1000);
  } else {
    payBtn.disabled = false;
    cooldownNote.textContent = '';
  }
}
tickCooldownDisplay();

document.getElementById('detailsForm').addEventListener('submit', async (e)=>{
  e.preventDefault();
  const remain = await checkCooldown();
  if(remain > 0){
    tickCooldownDisplay();
    return;
  }

  // re-check capacity right before booking (race safety)
  const slotKey = `slot|${state.date}|${state.time}`;
  const current = await getShared(slotKey, 0);
  if(current >= CAPACITY){
    alert('That slot just filled up — please pick another time.');
    await renderSlots();
    setActiveStep(2);
    document.getElementById('booking').scrollIntoView({behavior:'smooth'});
    return;
  }

  payBtn.disabled = true;
  payBtn.textContent = 'Confirming…';

  const newCount = current + 1;
  await setShared(slotKey, newCount);
  await setShared('lastBookingAt', Date.now());

  const name = document.getElementById('fname').value.trim();
  const phone = document.getElementById('fphone').value.trim();
  const ticketId = 'FC' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2,5).toUpperCase();

  showTicket({
    id: ticketId,
    name, phone,
    cut: state.cut.name,
    date: fmtDateLabel(state.date),
    time: state.time,
    chair: newCount,
    amount: `${state.cut.price} ${CURRENCY}`
  });

  document.getElementById('detailsForm').classList.add('hidden');
  document.getElementById('ticketSection').classList.remove('hidden');
  document.getElementById('confirmActions').classList.remove('hidden');
  document.getElementById('ticketSection').scrollIntoView({behavior:'smooth'});
  payBtn.textContent = 'Confirm booking';
  tickCooldownDisplay();
});

/* ---------------------------------------------------------
   TICKET + BARCODE
--------------------------------------------------------- */
function showTicket(t){
  document.getElementById('ticketNo').textContent = t.id;
  document.getElementById('tName').textContent = t.name;
  document.getElementById('tPhone').textContent = t.phone;
  document.getElementById('tCut').textContent = t.cut;
  document.getElementById('tDate').textContent = t.date;
  document.getElementById('tTime').textContent = t.time;
  document.getElementById('tChair').textContent = 'Chair ' + t.chair;
  document.getElementById('tAmount').textContent = t.amount;
  document.getElementById('barcodeId').textContent = t.id;
  drawBarcode(t.id);
}

function drawBarcode(text){
  const canvas = document.getElementById('barcodeCanvas');
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0,0,canvas.width, canvas.height);
  ctx.fillStyle = '#f0e9dd';
  ctx.fillRect(0,0,canvas.width, canvas.height);
  ctx.fillStyle = '#1c1a17';

  // Deterministic pseudo-barcode derived from the ticket id's char codes
  let x = 6;
  const usableWidth = canvas.width - 12;
  const codes = text.split('').map(c=>c.charCodeAt(0));
  let seed = codes.reduce((a,b)=>a+b, 7);
  function rand(){
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  }
  while(x < usableWidth){
    const w = 2 + Math.floor(rand()*4);
    if(rand() > 0.42){
      ctx.fillRect(x, 4, w, canvas.height-8);
    }
    x += w + 1;
  }
}

function downloadTicket(){
  const barcodeCanvas = document.getElementById('barcodeCanvas');
  const width = 440, padding = 20;
  const out = document.createElement('canvas');
  out.width = width;
  out.height = 660;
  const ctx = out.getContext('2d');

  ctx.fillStyle = '#f0e9dd';
  ctx.fillRect(0,0,out.width,out.height);

  ctx.fillStyle = '#9c342b';
  ctx.fillRect(0,0,out.width,80);
  ctx.fillStyle = '#f0e9dd';
  ctx.font = '600 22px monospace';
  ctx.fillText('FADE & CO', padding, 46);
  ctx.font = '14px monospace';
  ctx.fillText('No. ' + document.getElementById('ticketNo').textContent, padding, 68);

  ctx.fillStyle = '#1c1a17';
  ctx.font = '14px monospace';
  const rows = [
    ['Customer', document.getElementById('tName').textContent],
    ['Phone', document.getElementById('tPhone').textContent],
    ['Service', document.getElementById('tCut').textContent],
    ['Date', document.getElementById('tDate').textContent],
    ['Time', document.getElementById('tTime').textContent],
    ['Chair', document.getElementById('tChair').textContent],
    ['Price', document.getElementById('tAmount').textContent],
  ];
  let y = 120;
  rows.forEach(([k,v])=>{
    ctx.fillStyle = '#6b6459';
    ctx.fillText(k, padding, y);
    ctx.fillStyle = '#1c1a17';
    ctx.font = '600 14px monospace';
    const tw = ctx.measureText(v).width;
    ctx.fillText(v, out.width - padding - tw, y);
    ctx.font = '14px monospace';
    y += 34;
  });

  ctx.drawImage(barcodeCanvas, padding, y+20, out.width - padding*2, 70);
  ctx.fillStyle = '#6b6459';
  ctx.font = '11px monospace';
  const idText = document.getElementById('barcodeId').textContent;
  const idW = ctx.measureText(idText).width;
  ctx.fillText(idText, (out.width-idW)/2, y+110);

  const link = document.createElement('a');
  link.download = 'fade-and-co-ticket.png';
  link.href = out.toDataURL('image/png');
  link.click();
}