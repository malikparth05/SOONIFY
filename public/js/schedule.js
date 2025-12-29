document.addEventListener('DOMContentLoaded', () => {

    let allScheduledEvents = []; // This will hold our data from the API
    const eventGrid = document.getElementById("event-grid");
    const PRIORITY_MAP = { high: 3, medium: 2, low: 1 };

    /**
     * ✅ NEW: Fetches all events, filters for future ones, and renders them.
     */
    async function loadAndRenderEvents() {
        try {
            const response = await fetch('/api/events');
            if (!response.ok) throw new Error('Failed to fetch events');
            
            const allEvents = await response.json();
            const now = new Date();
            
            // Filter for future events only
            allScheduledEvents = allEvents.filter(ev => {
                const eventDate = new Date(ev.date || ev.rawDateISO);
                return eventDate > now;
            });
            
            updatePage(); // Render the filtered list
            
        } catch (error) {
            console.error('Error loading scheduled events:', error);
            eventGrid.innerHTML = `<p style="color:#F85149">Error loading events from database.</p>`;
        }
        renderSidebarCalendar();
    }

    // 1. Countdown Logic
    function startCountdown(id, targetDate) {
        const el = document.getElementById(`countdown-${id}`);
        if (!el) return;

        function tick() {
            const now = new Date();
            const diff = targetDate - now;

            if (diff <= 0) {
                el.innerHTML = `<span style="color:#F85149;font-size:15px;">Event Passed!</span>`;
                return;
            }

            const d = Math.floor(diff / (1000 * 60 * 60 * 24));
            const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const m = Math.floor((diff / (1000 * 60)) % 60);
            const s = Math.floor((diff / 1000) % 60);

            el.innerHTML = `
                <span>${String(d).padStart(2, '0')}<small>D</small></span>
                <span>${String(h).padStart(2, '0')}<small>H</small></span>
                <span>${String(m).padStart(2, '0')}<small>M</small></span>
                <span>${String(s).padStart(2, '0')}<small>S</small></span>
            `;
        }
        tick();
        setInterval(tick, 1000);
    }

    // 2. Render Logic
    function render(events) {
        eventGrid.innerHTML = "";

        if (events.length === 0) {
            eventGrid.innerHTML = `<p style="color:#8B949E">No upcoming events found.</p>`;
            return;
        }

        events.forEach(ev => {
            const dateObj = new Date(ev.date || ev.rawDateISO);
            const formatted = dateObj.toLocaleDateString("en-US", { day:"2-digit", month:"long", year:"numeric" });

            const html = `
                <div class="event-card">
                    <div class="card-image">
                        <img src="https://picsum.photos/300/150?random=${ev.imageRandomSeed}">
                        <div class="priority-dropdown">
                            <select onchange="updatePriority('${ev.id}', this.value)">
                                <option value="low" ${ev.priority==="low"?"selected":""}>Low</option>
                                <option value="medium" ${ev.priority==="medium"?"selected":""}>Medium</option>
                                <option value="high" ${ev.priority==="high"?"selected":""}>High</option>
                            </select>
                        </div>
                    </div>

                    <div class="countdown" id="countdown-${ev.id}"></div>

                    <div class="card-content">
                        <div class="card-tags">
                            <span class="tag ${ev.category}">
                                ${ev.category[0].toUpperCase()+ev.category.slice(1)}
                            </span>
                        </div>
                        <h3>${ev.title}</h3>
                        <p class="event-date">${formatted}</p>
                    </div>

                    <button class="view-event-button" onclick="openEventDetails('${ev.id}')">
                        View Details
                    </button>
                </div>
            `;
            eventGrid.insertAdjacentHTML("beforeend", html);
            startCountdown(ev.id, dateObj);
        });
    }

    // 3. Filter & Sort Logic
    function updatePage() {
        const term = document.getElementById("search-input")?.value.toLowerCase() || "";
        const cat = document.getElementById("category-filter")?.value || "all";
        const sort = document.getElementById("sort-select")?.value || "date-asc";

        // ✅ CHANGED: Reads from the new global variable
        let list = allScheduledEvents.filter(ev => 
            (cat==="all" || ev.category===cat) &&
            (ev.title.toLowerCase().includes(term) || ev.description.toLowerCase().includes(term))
        );

        list.sort((a,b) => {
            const dateA = new Date(a.date || a.rawDateISO);
            const dateB = new Date(b.date || b.rawDateISO);
            if (sort==="date-asc") return dateA - dateB;
            if (sort==="date-desc") return dateB - dateA;
            if (sort==="priority-desc") return PRIORITY_MAP[b.priority]-PRIORITY_MAP[a.priority];
            if (sort==="priority-asc") return PRIORITY_MAP[a.priority]-PRIORITY_MAP[b.priority];
        });

        render(list);
    }

    // 4. Update Priority
    window.updatePriority = function(id, pr) {
        const e = allScheduledEvents.find(x => x.id===id);
        if (e) { 
            e.priority = pr;
            // You would add a fetch() call to update the database here
            updatePage(); 
        }
    };

    // 5. Modal Logic
    window.openEventDetails = function(id) {
        const ev = allScheduledEvents.find(e => e.id===id);
        if (!ev) return;
        
        const dateObj = new Date(ev.date || ev.rawDateISO);
        const formatted = dateObj.toLocaleDateString("en-US", { day:"2-digit", month:"long", year:"numeric" });

        document.getElementById('modal-title').textContent = ev.title;
        document.getElementById('modal-date').textContent = formatted;
        document.getElementById('modal-category').textContent = ev.category.charAt(0).toUpperCase() + ev.category.slice(1);
        document.getElementById('modal-description').textContent = ev.description;
        document.getElementById('event-detail-modal').style.display = 'flex';
    };

    window.closeModal = function() {
        document.getElementById('event-detail-modal').style.display = 'none';
    };

    // Init
    document.getElementById("search-input")?.addEventListener("input", updatePage);
    document.getElementById("category-filter")?.addEventListener("change", updatePage);
    document.getElementById("sort-select")?.addEventListener("change", updatePage);

    loadAndRenderEvents(); // <-- ✅ CHANGED: Call the new async function
});

/**
 * Renders the simple sidebar calendar (days 1-31 with offset).
 */
function renderSidebarCalendar() {
    const container = document.getElementById('sidebar-calendar-days');
    if (!container) return; 
    
    const now = new Date();
    const today = now.getDate();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
    const offset = (firstDayOfMonth === 0) ? 6 : firstDayOfMonth - 1; 
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    
    container.innerHTML = '';
    for(let i = 0; i < offset; i++) container.appendChild(document.createElement('span'));
    for(let i = 1; i <= daysInMonth; i++) {
        const span = document.createElement('span');
        span.textContent = i;
        if(i === today) span.classList.add('highlighted-day');
        container.appendChild(span);
    }
}