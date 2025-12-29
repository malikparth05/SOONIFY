document.addEventListener('DOMContentLoaded', () => {
    
    class SoonifyApp {
        constructor() {
            // Data
            this.allEvents = [];
            this.PRIORITY_MAP = { high: 3, medium: 2, low: 1 };

            // DOM Elements
            this.eventGrid = document.getElementById("event-grid");
            this.searchInput = document.getElementById("search-input");
            this.categoryFilter = document.getElementById("category-filter");
            this.sortSelect = document.getElementById("sort-select");

            // Child Components
            this.modal = new EventModal('event-detail-modal');
            this.timers = []; // To keep track of active countdowns

            this.init();
        }

        
        init() {
            this.setupEventListeners();
            this.loadAllData();
            this.renderSidebarCalendar();
        }

        setupEventListeners() {
            this.searchInput.addEventListener("input", () => this.updatePage());
            this.categoryFilter.addEventListener("change", () => this.updatePage());
            this.sortSelect.addEventListener("change", () => this.updatePage());

            // Make modal and priority updates globally accessible from the HTML
            window.openEventDetails = (id) => this.openEventDetails(id);
            window.closeModal = () => this.modal.close();
            window.updatePriority = (id, pr) => this.updatePriority(id, pr);
        }

        
        async loadAllData() {
            try {
                // This now fetches from your MongoDB database via the API
                const response = await fetch('/api/events');
                if (!response.ok) {
                    throw new Error('Failed to fetch events from API');
                }
                const eventsFromDB = await response.json();
                this.allEvents = eventsFromDB;
                
            } catch (error) {
                console.error('Error loading data:', error);
                this.allEvents = []; // Start with an empty list on error
            }
            this.updatePage();
        }

        /**
         * Filters, sorts, and then renders the events.
         */
        updatePage() {
            const term = this.searchInput.value.toLowerCase();
            const cat = this.categoryFilter.value;
            const sort = this.sortSelect.value;

            // 1. Filter
            let list = this.allEvents.filter(ev =>
                (cat === "all" || ev.category === cat) &&
                (ev.title.toLowerCase().includes(term) || ev.description.toLowerCase().includes(term))
            );

            // 2. Sort
            list.sort((a, b) => {
                switch (sort) {
                    case "date-asc": return new Date(a.date || a.rawDateISO) - new Date(b.date || b.rawDateISO);
                    case "date-desc": return new Date(b.date || b.rawDateISO) - new Date(a.date || a.rawDateISO);
                    case "priority-desc": return (this.PRIORITY_MAP[b.priority] || 0) - (this.PRIORITY_MAP[a.priority] || 0);
                    case "priority-asc": return (this.PRIORITY_MAP[a.priority] || 0) - (this.PRIORITY_MAP[b.priority] || 0);
                    default: return new Date(a.date || a.rawDateISO) - new Date(b.date || b.rawDateISO);
                }
            });

            // 3. Render
            this.render(list);
        }

        
        render(events) {
            // Stop all previous timers
            this.timers.forEach(timer => timer.stop());
            this.timers = [];
            
            this.eventGrid.innerHTML = "";

            if (events.length === 0) {
                this.eventGrid.innerHTML = `<p style="color:#8B949E">No events found. Add one!</p>`;
                return;
            }

            events.forEach(ev => {
                const dateObj = new Date(ev.date || ev.rawDateISO);
                const isPast = dateObj < new Date();
                const formatted = dateObj.toLocaleDateString("en-US", { day: "2-digit", month: "long", year: "numeric" });

                const cardClass = isPast ? "event-card past-event-card" : "event-card";
                const priorityHTML = isPast ? '' : `
                    <div class="priority-dropdown">
                        <select onchange="updatePriority('${ev.id}', this.value)">
                            <option value="low" ${ev.priority === "low" ? "selected" : ""}>Low</option>
                            <option value="medium" ${ev.priority === "medium" ? "selected" : ""}>Medium</option>
                            <option value="high" ${ev.priority === "high" ? "selected" : ""}>High</option>
                        </select>
                    </div>`;
                const countdownHTML = isPast ? '' : `<div class="countdown" id="countdown-${ev.id}"></div>`;

                const html = `
                    <div class="${cardClass}">
                        <div class="card-image">
                            <img src="https://picsum.photos/300/150?random=${ev.imageRandomSeed}">
                            ${priorityHTML}
                        </div>
                        ${countdownHTML}
                        <div class="card-content">
                            <div class="card-tags">
                                <span class="tag ${ev.category}">
                                    ${ev.category[0].toUpperCase() + ev.category.slice(1)}
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
                this.eventGrid.insertAdjacentHTML("beforeend", html);

                if (!isPast) {
                    const timer = new CountdownTimer(ev.id, dateObj);
                    this.timers.push(timer);
                    timer.start();
                }
            });
        }

       
        openEventDetails(id) {
            const ev = this.allEvents.find(e => e.id === id);
            if (ev) {
                this.modal.open(ev);
            }
        }

        
        updatePriority(id, pr) {
            const e = this.allEvents.find(x => x.id === id);
            if (e) {
                e.priority = pr;
                // Here you would add a fetch() call to update the database
                console.log(`Updated ${id} to ${pr} (DB update not implemented yet)`);
                this.updatePage(); // Re-sort and re-render
            }
        }

        
        renderSidebarCalendar() {
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
    }

   
    class EventModal {
        constructor(modalId) {
            this.modal = document.getElementById(modalId);
            this.title = document.getElementById('modal-title');
            this.date = document.getElementById('modal-date');
            this.category = document.getElementById('modal-category');
            this.description = document.getElementById('modal-description');
        }

        open(event) {
            this.title.textContent = event.title;
            this.date.textContent = new Date(event.date || event.rawDateISO).toLocaleDateString("en-US", { day: "2-digit", month: "long", year: "numeric" });
            this.category.textContent = event.category.charAt(0).toUpperCase() + event.category.slice(1);
            this.description.textContent = event.description;
            this.modal.style.display = 'flex';
        }

        close() {
            this.modal.style.display = 'none';
        }
    }

   
    class CountdownTimer {
        constructor(id, targetDate) {
            this.element = document.getElementById(`countdown-${id}`);
            this.targetDate = targetDate;
            this.interval = null;
        }

        start() {
            this.tick(); // Run once immediately
            this.interval = setInterval(() => this.tick(), 1000);
        }

        stop() {
            clearInterval(this.interval);
        }

        tick() {
            if (!this.element) {
                this.stop();
                return;
            }
            
            const now = new Date();
            const diff = this.targetDate - now;

            if (diff <= 0) {
                this.element.innerHTML = `<span style="color:#F85149;font-size:15px;">Event Passed!</span>`;
                this.stop();
                return;
            }

            const d = Math.floor(diff / (1000 * 60 * 60 * 24));
            const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const m = Math.floor((diff / (1000 * 60)) % 60);
            const s = Math.floor((diff / 1000) % 60);

            this.element.innerHTML = `
                <span>${String(d).padStart(2, '0')}<small>D</small></span>
                <span>${String(h).padStart(2, '0')}<small>H</small></span>
                <span>${String(m).padStart(2, '0')}<small>M</small></span>
                <span>${String(s).padStart(2, '0')}<small>S</small></span>
            `;
        }
    }

    
    new SoonifyApp();
});