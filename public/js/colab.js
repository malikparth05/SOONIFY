document.addEventListener('DOMContentLoaded', () => {
    
    // --- DOM Elements ---
    const teamContainer = document.querySelector('.team-members');
    const inviteButton = document.querySelector('.invite-button');
    
    // Modal elements
    const modal = document.getElementById('invite-member-modal');
    const cancelBtn = document.getElementById('invite-cancel-btn');
    const saveBtn = document.getElementById('invite-save-btn');
    
    // Modal Form Inputs
    const fullNameInput = document.getElementById('invite-fullname-input');
    const usernameInput = document.getElementById('invite-username-input');
    const emailInput = document.getElementById('invite-email-input');

    function renderTeam(team) {
        // Clear all existing member cards, but don't remove the invite button
        teamContainer.querySelectorAll('.member-card').forEach(card => card.remove());

        team.forEach(member => {
            const card = document.createElement('div');
            card.className = 'member-card';
            card.innerHTML = `
                <img src="${member.avatar}" alt="${member.fullName}">
                <div class="member-info">
                    <span>${member.fullName || member.username}</span>
                    <span class="username">@${member.username}</span>
                </div>
                <div class="status-dot ${member.status === 'online' ? 'online' : ''}"></div>
            `;
            // Insert the new card *before* the invite button
            teamContainer.insertBefore(card, inviteButton);
        });
    }

    
    async function loadAndRenderTeam() {
        try {
            // ✅ CHANGED: Fetch from the new API route
            const response = await fetch('/api/auth/users'); 
            if (!response.ok) throw new Error('Could not fetch users');
            const users = await response.json();
            renderTeam(users);
        } catch (error) {
            console.error(error);
            teamContainer.innerHTML = '<p style="color: #F85149;">Error loading team.</p>';
        }
    }

    
    async function handleInviteMember() {
        const fullName = fullNameInput.value.trim();
        const username = usernameInput.value.trim();
        const email = emailInput.value.trim();

        if (!username || !email) {
            soonify.toast('Username and Email are required.', 'error');
            return;
        }

        saveBtn.textContent = 'Saving...';
        saveBtn.disabled = true;

        try {
            
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fullName, username, email })
            });
            
            const result = await response.json();
            if (!response.ok) throw new Error(result.message);
            
            // Success!
            soonify.toast('Member added successfully!');
            modal.style.display = 'none'; // Hide modal
            loadAndRenderTeam(); // Reload the team list from the database
            
        } catch (error) {
            console.error(error);
            soonify.toast(error.message, 'error');
        } finally {
            saveBtn.textContent = 'Save Member';
            saveBtn.disabled = false;
        }
    }

    
    if (inviteButton && modal) {
        // Open Modal
        inviteButton.addEventListener('click', (e) => {
            e.preventDefault();
            // Clear form
            fullNameInput.value = '';
            usernameInput.value = '';
            emailInput.value = '';
            // Show modal
            modal.style.display = 'flex';
            fullNameInput.focus();
        });

        // Close Modal (Cancel Button)
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
        saveBtn.addEventListener('click', handleInviteMember);
    }

    
    loadAndRenderTeam();
    renderSidebarCalendar(); 
});

// Sidebar calendar function (from previous fix)
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