document.addEventListener("DOMContentLoaded", () => {
    
    let pastEventsData = [];
    const eventGrid = document.getElementById('event-grid');

    // 1. Load Data
    async function loadEventsData() {
        try {
            const response = await fetch('/data/past-events.json');
            const data = await response.json();
            pastEventsData = data.pastEvents;
            updatePage(); // Initial render
            renderCalendar(); 
        } catch (error) {
            console.error('Error loading past events JSON:', error);
            eventGrid.innerHTML = '<p style="color:#F85149">Error loading data. Please check console.</p>';
        }
    }

    // 2. Render Function
    function render(events) {
        eventGrid.innerHTML = '';

        if (events.length === 0) {
            eventGrid.innerHTML = '<p style="color: #8B949E; margin-top: 20px;">No events match your current criteria.</p>';
            return;
        }

        events.forEach(event => {
            const cardHTML = `
                <div class="event-card past-event-card">
                    <div class="card-image">
                        <img src="https://picsum.photos/300/150?random=${event.imageRandomSeed}" alt="Event Image">
                    </div>
                    <div class="card-content">
                        <div class="card-tags">
                            <span class="tag ${event.category}">${event.category.charAt(0).toUpperCase() + event.category.slice(1)}</span>
                        </div>
                        <h3>${event.title}</h3>
                        <p class="event-date">${event.date}</p>
                    </div>
                    <button class="view-event-button" onclick="openEventDetails('${event.id}')">View Details</button>
                </div>
            `;
            eventGrid.insertAdjacentHTML('beforeend', cardHTML);
        });
    }

    // 3. Filter Function (Standardized Name: updatePage)
    function updatePage() {
        const searchTerm = document.getElementById('search-input').value.toLowerCase().trim();
        const selectedCategory = document.getElementById('category-filter').value;

        let filteredEvents = pastEventsData;

        if (selectedCategory !== 'all') {
            filteredEvents = filteredEvents.filter(e => e.category === selectedCategory);
        }

        if (searchTerm) {
            filteredEvents = filteredEvents.filter(event =>
                event.title.toLowerCase().includes(searchTerm) ||
                event.description.toLowerCase().includes(searchTerm)
            );
        }

        render(filteredEvents);
    }

    // 4. Modal Logic
    window.openEventDetails = function(eventId) {
        const event = pastEventsData.find(e => e.id === eventId);
        if (!event) return;

        document.getElementById('modal-title').textContent = event.title;
        document.getElementById('modal-date').textContent = event.date;
        document.getElementById('modal-category').textContent = event.category.charAt(0).toUpperCase() + event.category.slice(1);
        document.getElementById('modal-description').textContent = event.description;
        document.getElementById('event-detail-modal').style.display = 'flex';
    }

    window.closeModal = function() {
        document.getElementById('event-detail-modal').style.display = 'none';
    }

    // 5. Calendar Logic (Specific to Past Page)
    function renderCalendar() {
        const calendarDays = document.getElementById("calendar-days");
        const calendarHeader = document.querySelector(".calendar-section h3");
        if (!calendarDays || !calendarHeader) return; 

        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        
        calendarHeader.textContent = `${monthNames[currentMonth]} ${currentYear}`;
        
        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        const startDay = firstDay.getDay(); 
        const totalDays = lastDay.getDate();
        const offset = (startDay === 0 ? 6 : startDay - 1); 
        
        calendarDays.innerHTML = "";
        
        const eventDates = pastEventsData
            .map(e => new Date(e.date))
            .filter(d => d.getMonth() === currentMonth && d.getFullYear() === currentYear)
            .map(d => d.getDate());

        for (let i = 0; i < offset; i++) {
            const emptyCell = document.createElement("div");
            emptyCell.classList.add("empty-day");
            calendarDays.appendChild(emptyCell);
        }
        
        for (let d = 1; d <= totalDays; d++) {
            const dayCell = document.createElement("div");
            dayCell.textContent = d;
            dayCell.classList.add("day-cell");

            if (d === today.getDate()) dayCell.classList.add("today");
            
            if (eventDates.includes(d)) {
                dayCell.style.backgroundColor = "#A371F7"; 
                dayCell.style.fontWeight = "bold";
                dayCell.style.cursor = "pointer";
                
                const relatedEvents = pastEventsData.filter(e => {
                    const ed = new Date(e.date);
                    return ed.getDate() === d && ed.getMonth() === currentMonth && ed.getFullYear() === currentYear;
                });
                dayCell.title = relatedEvents.map(e => e.title).join(", ");
                
                dayCell.addEventListener("click", () => {
                    if (relatedEvents.length === 1) openEventDetails(relatedEvents[0].id);
                    else alert("Events on this day:\n" + relatedEvents.map(e => "• " + e.title).join("\n"));
                });
            }
            calendarDays.appendChild(dayCell);
        }
    }
    
    // Init
    document.getElementById("search-input")?.addEventListener("input", updatePage);
    document.getElementById("category-filter")?.addEventListener("change", updatePage);
    loadEventsData();
    renderSidebarCalendar(); // <-- ✅ ADDED THIS LINE
});

/**
 * ✅ ADDED THIS FUNCTION
 * Renders the simple sidebar calendar (days 1-31 with offset).
 */
function renderSidebarCalendar() {
    const container = document.getElementById('sidebar-calendar-days');
    if (!container) return; // Stop if calendar isn't on the page
    
    const now = new Date();
    const today = now.getDate();
    // Get the first day of the month (e.g., 0=Sun, 1=Mon)
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
    // Convert 0=Sun to 6=Sun, making 0=Mon
    const offset = (firstDayOfMonth === 0) ? 6 : firstDayOfMonth - 1; 

    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    
    container.innerHTML = '';
    
    // Add empty cells for the offset
    for(let i = 0; i < offset; i++) {
        const span = document.createElement('span');
        container.appendChild(span);
    }
    
    // Add all the day cells
    for(let i = 1; i <= daysInMonth; i++) {
        const span = document.createElement('span');
        span.textContent = i;
        if(i === today) {
            span.classList.add('highlighted-day'); // Style for today's date
        }
        container.appendChild(span);
    }
}