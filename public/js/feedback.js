document.addEventListener('DOMContentLoaded', () => {
    const feedbackForm = document.querySelector('.feedback-form');
    const submitBtn = document.querySelector('.btn-submit');

    if (feedbackForm) {
        feedbackForm.addEventListener('submit', async (e) => {
            e.preventDefault(); 
            const email = document.getElementById('email').value.trim();
            const message = document.getElementById('message').value.trim();

            if (!email || !message) {
                if(typeof soonify !== 'undefined') soonify.toast('Please fill in both fields', 'error');
                else alert('Please fill in both fields');
                return;
            }

            // Disable button to prevent double-submit
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';

            try {
                // ✅ Send to API
                const res = await fetch('/api/feedback', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, message })
                });

                if (!res.ok) throw new Error('Failed to submit');

                // Success Animation
                feedbackForm.style.transition = 'opacity 0.5s ease';
                feedbackForm.style.opacity = '0';

                setTimeout(() => {
                    feedbackForm.innerHTML = `
                        <div style="text-align: center; padding: 40px 0; background: var(--sidebar-bg); border-radius: 8px;">
                            <span class="material-icons" style="font-size: 48px; color: #2EA043;">check_circle</span>
                            <h3 style="color: var(--text-primary); margin-top: 15px;">Thank You!</h3>
                            <p style="color: var(--text-secondary);">Your feedback has been submitted.</p>
                        </div>
                    `;
                    feedbackForm.style.opacity = '1';
                }, 500);

            } catch (err) {
                console.error(err);
                if(typeof soonify !== 'undefined') soonify.toast('Error sending feedback', 'error');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Submit Feedback';
            }
        });
    }

    renderSidebarCalendar(); 
});

function renderSidebarCalendar() {
    // ... (Same calendar function as before) ...
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