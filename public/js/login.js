document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector('.local-login form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginButton = document.querySelector('.btn-login');

    // --- Utility function from your PREVIOUS file ---
    function showError(inputElement, message) {
        let errorElement = inputElement.nextElementSibling;
        if (!errorElement || !errorElement.classList.contains('input-error')) {
            errorElement = document.createElement('div');
            errorElement.className = 'input-error';
            inputElement.parentNode.insertBefore(errorElement, inputElement.nextSibling);
        }
        errorElement.textContent = message;
    }

    function clearError(inputElement) {
        let errorElement = inputElement.nextElementSibling;
        if (errorElement && errorElement.classList.contains('input-error')) {
            errorElement.remove();
        }
    }

    function validateForm() {
        let isValid = true;
        clearError(usernameInput);
        clearError(passwordInput);

        if (usernameInput.value.trim() === '') {
            showError(usernameInput, 'Username cannot be empty.');
            isValid = false;
        }

        if (passwordInput.value === '') {
            showError(passwordInput, 'Password cannot be empty.');
            isValid = false;
        }
        
        return isValid;
    }

    // --- LOCAL LOGIN HANDLER ---
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault(); 
            
            if (validateForm()) {
                loginButton.textContent = 'Logging in...';
                loginButton.disabled = true;

                try {
                    const username = usernameInput.value.trim();
                    const password = passwordInput.value;

                    const res = await fetch('/api/auth/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username, password })
                    });

                    if (!res.ok) {
                        const err = await res.json();
                        throw new Error(err.message);
                    }

                    const user = await res.json();
                    
                    localStorage.setItem('soonify_user', JSON.stringify({ username: user.username, loggedAt: new Date().toISOString() }));
                    
                    if(typeof soonify !== 'undefined') soonify.toast('Logged in as ' + user.username);
                    
                    setTimeout(()=> location.href = '/dashboard', 500);

                } catch (err) {
                    if(typeof soonify !== 'undefined') soonify.toast(err.message, 'error');
                    loginButton.textContent = 'Login';
                    loginButton.disabled = false;
                }
            }
        });
    }

    // ----------------------------------------------------------------------
    // --- ENHANCED SOCIAL LOGIN SIMULATION ---
    // ----------------------------------------------------------------------
    const socialButtons = document.querySelectorAll('.social-login .social-button');
    
    socialButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const provider = Array.from(button.classList).find(cls => 
                ['google', 'microsoft', 'apple'].includes(cls)
            );
            
            if (provider) {
                // Visual feedback on main page
                const originalText = button.innerHTML;
                button.innerHTML = `Connecting...`;
                button.style.opacity = "0.7";
                socialButtons.forEach(b => b.style.pointerEvents = "none"); // Prevent double clicks

                // Center the popup
                const width = 500;
                const height = 600;
                const left = (screen.width / 2) - (width / 2);
                const top = (screen.height / 2) - (height / 2);

                const popup = window.open('', '_blank', `width=${width},height=${height},top=${top},left=${left},menubar=no,toolbar=no,location=no,status=no`);
                
                if (popup) {
                    // Determine colors and icons based on provider
                    let providerColor = '#333';
                    let iconClass = '';
                    let providerName = provider.charAt(0).toUpperCase() + provider.slice(1);

                    if (provider === 'google') {
                        providerColor = '#4285F4';
                        iconClass = 'fab fa-google';
                    } else if (provider === 'microsoft') {
                        providerColor = '#00a4ef';
                        iconClass = 'fab fa-microsoft';
                    } else if (provider === 'apple') {
                        providerColor = '#000000';
                        iconClass = 'fab fa-apple';
                    }

                    // Write the styled HTML into the popup
                    popup.document.write(`
                        <!DOCTYPE html>
                        <html lang="en">
                        <head>
                            <title>Login with ${providerName}</title>
                            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
                            <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap" rel="stylesheet">
                            <style>
                                body { 
                                    font-family: 'Poppins', sans-serif; 
                                    background-color: #f0f2f5; 
                                    display: flex; 
                                    justify-content: center; 
                                    align-items: center; 
                                    height: 100vh; 
                                    margin: 0; 
                                    color: #333;
                                }
                                .card { 
                                    background: white; 
                                    padding: 40px 30px; 
                                    border-radius: 12px; 
                                    text-align: center; 
                                    box-shadow: 0 10px 25px rgba(0,0,0,0.1); 
                                    width: 100%;
                                    max-width: 350px;
                                }
                                .logo-circle {
                                    width: 80px;
                                    height: 80px;
                                    border-radius: 50%;
                                    background-color: #fff;
                                    border: 2px solid #eee;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    margin: 0 auto 20px;
                                    font-size: 32px;
                                    color: ${providerColor};
                                    box-shadow: 0 4px 10px rgba(0,0,0,0.05);
                                }
                                h2 { margin: 0 0 10px; font-weight: 600; color: #1a1a1a; }
                                p { color: #666; font-size: 0.9rem; margin-bottom: 30px; line-height: 1.5; }
                                .spinner {
                                    border: 3px solid #f3f3f3;
                                    border-top: 3px solid ${providerColor};
                                    border-radius: 50%;
                                    width: 24px;
                                    height: 24px;
                                    animation: spin 1s linear infinite;
                                    margin: 0 auto 20px;
                                }
                                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                                .btn-continue { 
                                    background-color: ${providerColor}; 
                                    color: white; 
                                    padding: 12px 24px; 
                                    border: none; 
                                    border-radius: 6px; 
                                    cursor: pointer; 
                                    font-weight: 500; 
                                    font-size: 1rem;
                                    width: 100%;
                                    transition: opacity 0.2s;
                                }
                                .btn-continue:hover { opacity: 0.9; }
                            </style>
                        </head>
                        <body>
                            <div class="card">
                                <div class="logo-circle">
                                    <i class="${iconClass}"></i>
                                </div>
                                <h2>Sign in with ${providerName}</h2>
                                <p>Soonify is requesting access to your name, email, and profile picture.</p>
                                
                                <div class="spinner"></div>

                                <button class="btn-continue" onclick="
                                    window.opener.postMessage('success-${provider}', '*'); 
                                    window.close();
                                ">
                                    Continue as User
                                </button>
                            </div>
                        </body>
                        </html>
                    `);
                    popup.document.close();
                }

                const receiveMessage = (event) => {
                    if (event.data === `success-${provider}`) {
                        // Success simulation
                        window.location.href = '/dashboard'; 
                    }
                    
                    // Cleanup UI on main page regardless of success/close
                    window.removeEventListener('message', receiveMessage);
                    socialButtons.forEach(b => b.style.pointerEvents = "auto");
                    button.innerHTML = originalText;
                    button.style.opacity = "1";
                };

                window.addEventListener('message', receiveMessage, false);
            }
        });
    });
});