document.addEventListener('DOMContentLoaded', () => {
    
    // --- Get all the form elements ---
    const saveProfileBtn = document.querySelector('#profile .btn-submit');
    const updateSecurityBtn = document.querySelector('#security .btn-submit');
    const saveNotificationsBtn = document.querySelector('#notifications .btn-submit');
    
    const fullNameInput = document.getElementById('full-name');
    const emailInput = document.getElementById('email');
    const userIdInput = document.getElementById('user-id');
    
    const currentPassInput = document.getElementById('current-password');
    const newPassInput = document.getElementById('new-password');
    
    // Selectors for toggles
    const emailNotifToggle = document.querySelector('#notifications .toggle-container:nth-of-type(1) input');
    const pushNotifToggle = document.querySelector('#notifications .toggle-container:nth-of-type(2) input');

    // ✅ FIX: Get the actual logged-in user
    const storedUser = JSON.parse(localStorage.getItem('soonify_user'));
    if (!storedUser || !storedUser.username) {
        if(typeof soonify !== 'undefined') soonify.toast('Please log in first', 'error');
        // Optional: Redirect to login if no user found
        // window.location.href = '/login';
        return;
    }
    const USERNAME = storedUser.username;

    /**
     * --- 1. LOAD USER DATA ---
     */
    async function loadSettings() {
        try {
            const res = await fetch(`/api/settings/${USERNAME}`);
            if (!res.ok) throw new Error('Could not load user data');
            
            const user = await res.json();
            
            if (fullNameInput) fullNameInput.value = user.fullName || '';
            if (emailInput) emailInput.value = user.email || `${user.username}@example.com`; // Fallback email
            if (userIdInput) userIdInput.value = user._id || 'Unknown';
            
            // Safely handle notifications object
            const notifs = user.notifications || { email: true, push: false };
            if (emailNotifToggle) emailNotifToggle.checked = notifs.email;
            if (pushNotifToggle) pushNotifToggle.checked = notifs.push;

        } catch (err) {
            console.error(err);
            if (typeof soonify !== 'undefined') soonify.toast(err.message, 'error');
        }
    }

    /**
     * --- 2. SAVE PROFILE ---
     */
    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            const newFullName = fullNameInput.value;
            
            try {
                const res = await fetch(`/api/settings/${USERNAME}/profile`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ fullName: newFullName })
                });
                if (!res.ok) throw new Error('Failed to save profile');
                
                if (typeof soonify !== 'undefined') soonify.toast('Profile saved!');
                showButtonFeedback(saveProfileBtn, 'Save Profile Changes');
            } catch (err) {
                console.error(err);
                if (typeof soonify !== 'undefined') soonify.toast('Error saving profile', 'error');
            }
        });
    }
    
    /**
     * --- 3. SAVE SECURITY ---
     */
    if (updateSecurityBtn) {
        updateSecurityBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            const currentPassword = currentPassInput.value;
            const newPassword = newPassInput.value;

            try {
                const res = await fetch(`/api/settings/${USERNAME}/security`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ currentPassword, newPassword })
                });
                
                const data = await res.json();
                if (!res.ok) throw new Error(data.message);

                if (typeof soonify !== 'undefined') soonify.toast('Password updated!');
                showButtonFeedback(updateSecurityBtn, 'Update Security');
                currentPassInput.value = '';
                newPassInput.value = '';
            } catch (err) {
                if (typeof soonify !== 'undefined') soonify.toast(err.message, 'error');
            }
        });
    }
    
    /**
     * --- 4. SAVE NOTIFICATIONS ---
     */
    if (saveNotificationsBtn) {
        saveNotificationsBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            const notifData = {
                email: emailNotifToggle ? emailNotifToggle.checked : true,
                push: pushNotifToggle ? pushNotifToggle.checked : false
            };

            try {
                const res = await fetch(`/api/settings/${USERNAME}/notifications`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ notifications: notifData })
                });
                if (!res.ok) throw new Error('Failed to save notifications');

                if (typeof soonify !== 'undefined') soonify.toast('Notifications saved!');
                showButtonFeedback(saveNotificationsBtn, 'Save Notifications');
            } catch (err) {
                console.error(err);
                if (typeof soonify !== 'undefined') soonify.toast('Error saving notifications', 'error');
            }
        });
    }
    
    // Helper: Button Feedback
    function showButtonFeedback(button, originalText) {
        button.textContent = 'Saving...';
        button.disabled = true;
        setTimeout(() => {
            button.textContent = "Saved!";
            button.style.backgroundColor = '#2EA043';
        }, 500);
        setTimeout(() => {
            button.textContent = originalText;
            button.disabled = false;
            button.style.backgroundColor = ''; 
        }, 2500);
    }

    // Initial Load
    loadSettings();
    if (typeof renderSidebarCalendar === 'function') renderSidebarCalendar();
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