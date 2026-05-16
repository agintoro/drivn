const OWNER_PIN = '141007';
const WHATSAPP_NUMBER = '6287774872494'; // Change to Driva WhatsApp number, no plus sign.
const PROCESS_OPTIONS = ['Classic Washed','Slow Dried Natural','Dual Phase Natural','Lalvin Yeast Natural','Thermal Shock Natural','Custom'];
const STORAGE_KEY = 'drivn_lots_v1';

const seedLots = [
  {
    id: crypto.randomUUID(), lotName:'Indragiri Ancient Typica', origin:'Indragiri', region:'Rancabali, Ciwidey, Bandung Selatan', process:'Lalvin Yeast Natural', varietals:'Ancient Typica / Heirloom', altitude:'1600–1800 MASL', farm:'Indragiri Collective', producer:'Agintoro', price:'Rp 310.000 / kg', availability:'Limited', moq:'1 kg', recommended:'Filter', notes:'Orange, Lemony, Prune, Passion Fruit, Florals', processDetails:'24H aerobic phase followed by 120H anaerobic fermentation with Lalvin yeast, then slow drying on raised beds.', moisture:'10.5–11.2%', aw:'0.55–0.58', description:'A bright, floral, and articulate microlot built for roasters who want clarity without boring-clean sterility.'
  },
  {
    id: crypto.randomUUID(), lotName:'Indragiri Mossto Natural 120H', origin:'Indragiri', region:'Rancabali, Ciwidey, Bandung Selatan', process:'Mossto Natural', varietals:'Typica, Ateng, Yellow Bourbon', altitude:'1600–1800 MASL', farm:'Indragiri Collective', producer:'Agintoro', price:'Rp 250.000 / kg', availability:'Available', moq:'1 kg', recommended:'Filter / Espresso', notes:'Black Plum, Berries, Malic Acidity, Brown Sugary', processDetails:'Natural fermentation supported with mossto for 120 hours, followed by controlled slow drying.', moisture:'10.5–11.5%', aw:'0.55–0.60', description:'Layered fruit sweetness with enough structure for both filter and espresso development.'
  },
  {
    id: crypto.randomUUID(), lotName:'Indragiri Dual Phase Natural', origin:'Indragiri', region:'Rancabali, Ciwidey, Bandung Selatan', process:'Dual Phase Natural', varietals:'Typica, Ateng, Yellow Bourbon', altitude:'1600–1800 MASL', farm:'Indragiri Collective', producer:'Agintoro', price:'Rp 270.000 / kg', availability:'Coming Soon', moq:'5 kg', recommended:'Filter', notes:'Tropical Fruit, Mandarin, Pineapple, White Floral, Sweet Fructose', processDetails:'24H aerobic phase to build microbial activity, then 120H anaerobic phase to intensify fruit expression.', moisture:'Target 10.5–11.5%', aw:'Target 0.55–0.58', description:'A controlled fruit-forward lot designed to be expressive without collapsing into heavy ferment noise.'
  }
];

let state = { lots: [], selectedId: null, filter: 'all', query: '', owner: false };

const $ = (id) => document.getElementById(id);
const lotList = $('lotList');
const detailCard = $('detailCard');
const libraryRows = $('libraryRows');
const processSelect = $('process');

function loadLots(){
  const saved = localStorage.getItem(STORAGE_KEY);
  state.lots = saved ? JSON.parse(saved) : seedLots;
  state.selectedId = state.lots[0]?.id || null;
  saveLots();
}
function saveLots(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state.lots)); }
function filteredLots(){
  const q = state.query.trim().toLowerCase();
  return state.lots.filter(l => {
    const filterOk = state.filter === 'all' || l.process === state.filter;
    const hay = Object.values(l).join(' ').toLowerCase();
    return filterOk && (!q || hay.includes(q));
  });
}
function moneyish(str){ return str || 'Contact for price'; }
function statusClass(status){
  if(status === 'Available') return 'mint';
  if(status === 'Limited' || status === 'Coming Soon') return 'gold';
  return 'rose';
}
function render(){
  document.body.classList.toggle('owner', state.owner);
  $('ownerPill').textContent = state.owner ? 'Owner Mode' : 'Buyer View';
  $('ownerPill').classList.toggle('on', state.owner);
  renderLots(); renderDetail(); renderLibrary();
}
function renderLots(){
  const lots = filteredLots();
  if(!lots.length){ lotList.innerHTML = '<div class="empty">No lots found. The shelf is quiet.</div>'; return; }
  lotList.innerHTML = lots.map(l => `
    <article class="lot-card ${l.id === state.selectedId ? 'active' : ''}" data-id="${l.id}">
      <div class="lot-top">
        <div class="thumb">${escapeHtml(l.process.split(' ').slice(0,2).join(' '))}</div>
        <div>
          <div class="lot-title">${escapeHtml(l.lotName)}</div>
          <div class="lot-sub">${escapeHtml(l.origin)} • ${escapeHtml(l.varietals || 'Mixed varietals')}<br>${escapeHtml(l.notes || '')}</div>
        </div>
      </div>
      <div class="chips">
        <span class="chip mint">${escapeHtml(l.process)}</span>
        <span class="chip gold">${escapeHtml(moneyish(l.price))}</span>
        <span class="chip ${statusClass(l.availability)}">${escapeHtml(l.availability)}</span>
      </div>
    </article>
  `).join('');
  document.querySelectorAll('.lot-card').forEach(card => card.addEventListener('click', () => { state.selectedId = card.dataset.id; render(); }));
}
function renderDetail(){
  const lot = state.lots.find(l => l.id === state.selectedId) || filteredLots()[0] || state.lots[0];
  if(!lot){ detailCard.innerHTML = '<div class="empty">Add your first lot.</div>'; return; }
  state.selectedId = lot.id;
  detailCard.innerHTML = `
    <div class="hero-banner">
      <div><p class="eyebrow">${escapeHtml(lot.availability)} • ${escapeHtml(lot.process)}</p><h2>${escapeHtml(lot.lotName)}</h2></div>
      <div class="bean-orbit">☕</div>
    </div>
    <div class="detail-body">
      <h3>${escapeHtml(lot.origin)} Lot Details</h3>
      <p class="description">${escapeHtml(lot.description || 'No description yet.')}</p>
      <div class="meta-line">
        <span class="chip mint">${escapeHtml(lot.notes || 'Notes TBA')}</span>
        <span class="chip gold">${escapeHtml(moneyish(lot.price))}</span>
        <span class="chip ${statusClass(lot.availability)}">${escapeHtml(lot.availability)}</span>
      </div>
      <div class="spec-grid">
        ${spec('Region', lot.region)}${spec('Varietals', lot.varietals)}${spec('Altitude', lot.altitude)}${spec('Farm', lot.farm)}${spec('Producer', lot.producer)}${spec('MOQ', lot.moq)}${spec('Recommended', lot.recommended)}${spec('Moisture / Aw', `${lot.moisture || '-'} / ${lot.aw || '-'}`)}
      </div>
      <h3>Process Details</h3>
      <p class="description">${escapeHtml(lot.processDetails || 'Process details not added yet.')}</p>
      <div class="actions">
        <button class="primary" onclick="generatePDF('${lot.id}')">Generate PDF Spec Sheet</button>
        <button class="ghost" onclick="shareWhatsApp('${lot.id}')">Request This Lot</button>
        <button class="ghost owner-only" onclick="openEditor('${lot.id}')">Edit</button>
      </div>
    </div>`;
}
function spec(k,v){ return `<div class="spec"><small>${escapeHtml(k)}</small><strong>${escapeHtml(v || '-')}</strong></div>`; }
function renderLibrary(){
  if(!state.owner){ libraryRows.innerHTML = '<div class="empty">Unlock Owner Mode to edit the library.</div>'; return; }
  libraryRows.innerHTML = state.lots.map(l => `
    <div class="library-row">
      <div><strong>${escapeHtml(l.lotName)}</strong><p>${escapeHtml(l.process)} • ${escapeHtml(l.origin)} • ${escapeHtml(l.price || 'No price')}</p></div>
      <div class="row-actions"><button class="ghost" onclick="openEditor('${l.id}')">Edit</button><button class="danger" onclick="deleteLot('${l.id}')">Delete</button></div>
    </div>`).join('');
}
function escapeHtml(value=''){
  return String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
}
function showPanel(panel){
  $('libraryPanel').classList.toggle('hidden', panel !== 'library');
  $('aboutPanel').classList.toggle('hidden', panel !== 'about');
  document.querySelectorAll('.rail-btn').forEach(b => b.classList.toggle('active', b.dataset.panel === panel));
}
function populateProcessOptions(){ processSelect.innerHTML = PROCESS_OPTIONS.map(p => `<option>${p}</option>`).join(''); }
function openEditor(id){
  if(!state.owner){ $('ownerDialog').showModal(); return; }
  const l = state.lots.find(x => x.id === id) || {};
  $('formTitle').textContent = id ? 'Edit Lot' : 'Add Lot';
  $('lotId').value = l.id || '';
  ['lotName','origin','region','varietals','altitude','farm','producer','price','moq','recommended','notes','processDetails','moisture','aw','description'].forEach(key => $(key).value = l[key] || '');
  $('process').value = l.process || PROCESS_OPTIONS[0];
  $('availability').value = l.availability || 'Available';
  $('lotDialog').showModal();
}
function deleteLot(id){
  if(!confirm('Delete this lot from this device library?')) return;
  state.lots = state.lots.filter(l => l.id !== id);
  state.selectedId = state.lots[0]?.id || null;
  saveLots(); render();
}
function collectForm(){
  const data = { id: $('lotId').value || crypto.randomUUID() };
  ['lotName','origin','region','process','varietals','altitude','farm','producer','price','availability','moq','recommended','notes','processDetails','moisture','aw','description'].forEach(key => data[key] = $(key).value.trim());
  return data;
}
function shareWhatsApp(id){
  const l = state.lots.find(x => x.id === id);
  if(!l) return;
  const msg = `Hello Driva, I want to request this lot:%0A%0A${encodeURIComponent(l.lotName)}%0AProcess: ${encodeURIComponent(l.process)}%0ANotes: ${encodeURIComponent(l.notes)}%0APrice: ${encodeURIComponent(l.price)}`;
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank');
}
async function generatePDF(id){
  const l = state.lots.find(x => x.id === id);
  if(!l) return;
  const holder = document.createElement('div');
  holder.style.position = 'fixed'; holder.style.left = '-9999px'; holder.style.top = '0';
  holder.innerHTML = `
    <div class="pdf-page" id="pdfSheet">
      <div class="pdf-head"><div><div class="pdf-brand">DRIVN • DRIVA COFFEE PROCESSING</div><h1>${escapeHtml(l.lotName)}</h1><p>${escapeHtml(l.origin)} • ${escapeHtml(l.region || '')}</p></div><div><strong>${escapeHtml(l.availability)}</strong><br><span>${new Date().toLocaleDateString()}</span></div></div>
      <p class="pdf-notes">${escapeHtml(l.notes || 'Tasting notes TBA')}</p>
      <div class="pdf-grid">
        ${pdfBox('Process', l.process)}${pdfBox('Varietals', l.varietals)}${pdfBox('Altitude', l.altitude)}${pdfBox('Farm', l.farm)}${pdfBox('Producer', l.producer)}${pdfBox('Price', l.price)}${pdfBox('MOQ', l.moq)}${pdfBox('Recommended Use', l.recommended)}${pdfBox('Moisture', l.moisture)}${pdfBox('Water Activity', l.aw)}
      </div>
      <h2 style="margin-top:24px">Process Details</h2><p>${escapeHtml(l.processDetails || '-')}</p>
      <h2>Buyer Description</h2><p>${escapeHtml(l.description || '-')}</p>
      <p style="margin-top:28px;border-top:2px solid #13223a;padding-top:14px;font-weight:800">Instagram: @drivacoffee • Tracing Coffee To Its Soul</p>
    </div>`;
  document.body.appendChild(holder);
  try{
    const canvas = await html2canvas(holder.querySelector('#pdfSheet'), { scale: 2, backgroundColor: '#fffaf0' });
    const imgData = canvas.toDataURL('image/png');
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p','pt','a4');
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const ratio = Math.min(pageW / canvas.width, pageH / canvas.height);
    const imgW = canvas.width * ratio;
    const imgH = canvas.height * ratio;
    pdf.addImage(imgData, 'PNG', (pageW-imgW)/2, 0, imgW, imgH);
    pdf.save(`${l.lotName.replace(/[^a-z0-9]+/gi,'-').toLowerCase()}-drivn-spec-sheet.pdf`);
  }catch(err){
    alert('PDF failed: ' + err.message + '. Make sure internet is available for jsPDF/html2canvas CDN.');
  }finally{ holder.remove(); }
}
function pdfBox(k,v){ return `<div class="pdf-box"><small>${escapeHtml(k)}</small><p><strong>${escapeHtml(v || '-')}</strong></p></div>`; }

window.openEditor = openEditor; window.deleteLot = deleteLot; window.generatePDF = generatePDF; window.shareWhatsApp = shareWhatsApp;

document.addEventListener('DOMContentLoaded', () => {
  populateProcessOptions(); loadLots(); render();
  document.querySelectorAll('.rail-btn[data-panel]').forEach(btn => btn.addEventListener('click', () => showPanel(btn.dataset.panel)));
  document.querySelectorAll('.category').forEach(btn => btn.addEventListener('click', () => { document.querySelectorAll('.category').forEach(b=>b.classList.remove('active')); btn.classList.add('active'); state.filter = btn.dataset.filter; render(); }));
  $('searchInput').addEventListener('input', e => { state.query = e.target.value; render(); });
  $('ownerToggle').addEventListener('click', () => state.owner ? (state.owner=false, render()) : $('ownerDialog').showModal());
  $('unlockBtn').addEventListener('click', e => { e.preventDefault(); if($('ownerPin').value === OWNER_PIN){ state.owner = true; $('ownerPin').value=''; $('ownerDialog').close(); showPanel('library'); render(); } else alert('Wrong PIN.'); });
  $('addLotBtn').addEventListener('click', () => openEditor());
  $('addLotBtn2').addEventListener('click', () => openEditor());
  $('saveLotBtn').addEventListener('click', e => { e.preventDefault(); const data = collectForm(); if(!data.lotName || !data.origin){ alert('Lot Name and Origin are required.'); return; } const idx = state.lots.findIndex(l => l.id === data.id); if(idx >= 0) state.lots[idx] = data; else state.lots.unshift(data); state.selectedId = data.id; saveLots(); $('lotDialog').close(); render(); });
});
