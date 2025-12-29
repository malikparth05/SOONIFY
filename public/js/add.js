document.addEventListener('DOMContentLoaded', () => {
    const saveBtn = document.querySelector('.btn-save');
    const cancelBtn = document.querySelector('.btn-cancel');

    // Helper function to show an error
    function showError(elementId, message) {
        const element = document.getElementById(elementId);
        clearError(element);
        const error = document.createElement('span');
        error.className = 'input-error-message';
        error.textContent = message;
        error.style.color = '#F85149';
        error.style.fontSize = '0.8rem';
        error.style.display = 'block';
        error.style.marginTop = '5px';
        element.parentNode.appendChild(error);
    }

    // Helper function to clear errors
    function clearError(element) {
        const oldError = element.parentNode.querySelector('.input-error-message');
        if (oldError) oldError.remove();
    }
    function clearAllErrors() {
        document.querySelectorAll('.input-error-message').forEach(err => err.remove());
    }

    // Handle saving the event
    saveBtn.addEventListener('click', async () => {
        clearAllErrors();
        let isValid = true;

        // 1. Get ALL values from the form
        const title = document.getElementById('event-name').value;
        const description = document.getElementById('description').value;
        const rawDateISO = document.getElementById('date').value;
        const time = document.getElementById('time').value;
        const category = document.getElementById('category').value;
        const priority = document.getElementById('priority').value;

        // 2. Interactive validation
        if (!title) {
            showError('event-name', 'Event Name is required.');
            isValid = false;
        }
        if (!rawDateISO) {
            showError('date', 'Date is required.');
            isValid = false;
        }

        if (!isValid) return; // Stop if form is invalid

        // 3. Create the Event Data object
        const eventData = {
            id: 'ev_' + Date.now(), // Create a unique ID
            title: title,
            description: description,
            rawDateISO: rawDateISO,
            time: time,
            category: category,
            priority: priority,
            imageRandomSeed: Math.floor(Math.random() * 1000)
        };

        // 4. ✅ SEND DATA TO THE DATABASE
        try {
            saveBtn.textContent = 'Saving...';
            saveBtn.disabled = true;
            cancelBtn.disabled = true;

            const response = await fetch('/api/events', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(eventData)
            });

            if (!response.ok) {
                throw new Error('Server failed to save the event.');
            }

            // 5. Show success and redirect
            saveBtn.textContent = 'Saved!';
            saveBtn.style.backgroundColor = '#2EA043'; // Green

            setTimeout(() => {
                // ✅ --- CORRECTED PATH ---
                window.location.href = '/dashboard'; 
            }, 1000); // Wait 1s

        } catch (error) {
            console.error('Error saving event:', error);
            alert('An error occurred. Please try again.');
            saveBtn.textContent = 'Save Event';
            saveBtn.disabled = false;
            cancelBtn.disabled = false;
        }
    });

    // Handle canceling
    cancelBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
            // ✅ --- CORRECTED PATH ---
            window.location.href = '/dashboard'; 
        }
    });
});