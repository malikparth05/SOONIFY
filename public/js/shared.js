document.addEventListener('DOMContentLoaded', () => {
    
    // --- DOM Elements ---
    const createSpaceBtn = document.querySelector('.invite-button');
    const spacesListContainer = document.getElementById('spaces-list-container');
    
    // Modal elements
    const modal = document.getElementById('create-space-modal');
    const cancelBtn = document.getElementById('cancel-space-btn');
    const saveBtn = document.getElementById('save-space-btn');
    const titleInput = document.getElementById('space-name-input');
    const descInput = document.getElementById('space-desc-input');

    function renderSpaces(spaces) {
        spacesListContainer.innerHTML = ''; // Clear old list
        if (!spaces || spaces.length === 0) {
            spacesListContainer.innerHTML = '<p style="color: var(--text-secondary); font-size: 14px; margin-bottom: 15px;">No shared spaces yet. Create one!</p>';
            return;
        }

        spaces.forEach(space => {
            const card = document.createElement('div');
            card.className = 'space-card';
            
            let membersHTML = '';
            if (space.members && space.members.length > 0) {
                membersHTML = space.members.map(member => 
                    `<img src="${member.avatar}" title="${member.username}">`
                ).join('');
            }

            card.innerHTML = `
                <h4>${space.title}</h4>
                <p>${space.description || 'No description'}</p>
                <div class="space-members">
                    ${membersHTML}
                </div>
            `;
            spacesListContainer.appendChild(card);
        });
    }

    async function loadAndRenderSpaces() {
        try {
            const response = await fetch('/api/spaces'); // Fetch from our API route
            if (!response.ok) throw new Error('Could not fetch spaces');
            const spaces = await response.json();
            renderSpaces(spaces);
        } catch (error) {
            console.error(error);
            spacesListContainer.innerHTML = '<p style="color: #F85149;">Error loading spaces.</p>';
        }
    }

    async function handleSaveSpace() {
        const title = titleInput.value.trim();
        const description = descInput.value.trim();

        if (!title) {
            return alert('Please enter a title for the space.');
        }

        saveBtn.textContent = 'Creating...';
        saveBtn.disabled = true;

        try {
            // Send data to our new API route
            const response = await fetch('/api/spaces', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, description })
            });

            if (!response.ok) throw new Error('Failed to create space');
            
            soonify.toast('Space created successfully!'); // This will now work
            modal.style.display = 'none'; // Hide modal
            loadAndRenderSpaces(); // Reload the list from the database
            
        } catch (error) {
            console.error(error);
            soonify.toast(error.message, 'error');
        } finally {
            saveBtn.textContent = 'Create';
            saveBtn.disabled = false;
        }
    }

    
    if (createSpaceBtn && modal) {
        // Open Modal
        createSpaceBtn.addEventListener('click', (e) => {
            e.preventDefault();
            titleInput.value = '';
            descInput.value = '';
            modal.style.display = 'flex';
            titleInput.focus();
        });

       
        cancelBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        // Close Modal (Clicking overlay)
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });

        // Save Action
        saveBtn.addEventListener('click', handleSaveSpace);
    }

    // --- Initial Load ---
    loadAndRenderSpaces();
    renderSidebarCalendar(); 
});

// Sidebar calendar function
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