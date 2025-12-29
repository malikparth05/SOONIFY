// renderer.js - renders event cards from server or localStorage fallback
(async function(){
  const grid = document.querySelector('.event-grid');
  if(!grid) return;

  async function fetchServerEvents(){
    try {
      const res = await fetch('/api/events');
      if(!res.ok) throw new Error('no server');
      const j = await res.json();
      return j.map(e => Object.assign({}, e, { imageRandomSeed: e.imageRandomSeed || Math.floor(Math.random()*1000) }));
    } catch (err) {
      return null;
    }
  }

  function getLocal(){
    try { return JSON.parse(localStorage.getItem('soonify_events') || '[]'); } catch(e){ return []; }
  }

  async function loadFallback() {
    try {
      const res = await fetch('/public/data/past-events.json');
      if(!res.ok) throw new Error('no fallback');
      const d = await res.json();
      return (d.pastEvents || []).map(e=>({ id: e.id, title: e.title, description: e.description, date: e.date, category: e.category, priority:'medium', imageRandomSeed: e.imageRandomSeed || Math.floor(Math.random()*1000)}));
    } catch(e){
      return [];
    }
  }

  let events = await fetchServerEvents();
  if(!events || events.length === 0) {
    events = getLocal();
    if(!events || events.length === 0) {
      events = await loadFallback();
    }
  }

  if(!events || events.length === 0) {
    grid.innerHTML = '<p style="color:var(--muted)">No events yet. Add one from Add Event.</p>';
    window.dispatchEvent(new CustomEvent('events:rendered'));
    return;
  }

  function cardHTML(e){
    const dateText = e.date || (e.rawDateISO ? new Date(e.rawDateISO).toLocaleDateString() : 'No date set');
    return `
      <div class="event-card" data-id="${e._id || e.id}">
        <div class="card-image"><img src="https://picsum.photos/300/150?random=${e.imageRandomSeed}" alt=""></div>
        <div class="countdown"><span>${dateText}</span></div>
        <div class="card-content">
          <h3>${e.title}</h3>
          <p class="muted">${(e.description||'').slice(0,120)}</p>
          <div style="margin-top:8px;"><button class="view-event-button btn small" data-id="${e._id || e.id}">View</button></div>
        </div>
      </div>
    `;
  }

  grid.innerHTML = events.map(cardHTML).join('');
  window.__eventsRendered = true;
  window.dispatchEvent(new CustomEvent('events:rendered'));
})();
