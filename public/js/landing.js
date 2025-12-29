document.addEventListener('DOMContentLoaded', () => {
    
    function typeWriterEffect() {
        const taglineElement = document.getElementById('typewriter-tagline');
        // Check if the element exists and is empty
        if (!taglineElement || taglineElement.textContent.length > 0) return;
        
        const text = "Stay ahead, Stay on track";
        let i = 0;
        const speed = 75; // milliseconds per character

        function type() {
            if (i < text.length) {
                taglineElement.innerHTML += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        }
        
        type();
    }
   

    const ctaButton = document.querySelector('.cta-button');
    const header = document.querySelector('.landing-container');
    const stickyThreshold = header ? header.offsetHeight / 2 : 300; // Half the initial header height

    function handleStickyHeader() {
        if (window.scrollY > stickyThreshold) {
            // Add a class that makes the button sticky/fixed, or adjust its style
            if (ctaButton) {
                ctaButton.style.position = 'fixed';
                ctaButton.style.top = '20px';
                ctaButton.style.right = '20px';
                ctaButton.style.zIndex = '100';
                // OPTIONAL: Add a subtle background for better visibility on a busy page
                ctaButton.style.backgroundColor = '#2563EB'; 
                ctaButton.textContent = 'Get Started →';
            }
        } else {
            
            if (ctaButton) {
                ctaButton.style.position = 'static';
                ctaButton.style.top = 'auto';
                ctaButton.style.right = 'auto';
                ctaButton.style.zIndex = 'auto';
                ctaButton.style.backgroundColor = '#3B82F6';
                ctaButton.textContent = 'Get Started';
            }
        }
    }
   

    const featureCards = document.querySelectorAll('.feature-card');

    featureCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'scale(1.03) translateY(-5px)';
            card.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.5)';
        });
        
        card.addEventListener('mouseleave', () => {
            // Reset to the original hover CSS values
            card.style.transform = 'translateY(-5px)'; 
            card.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)';
        });
    });


    // Initialize functions
    typeWriterEffect();
    
    // Only set up the scroll listener if the CTA button is found
    if (ctaButton) {
        window.addEventListener('scroll', handleStickyHeader);
        // Run once on load to catch if the user loaded the page already scrolled down
        handleStickyHeader(); 
    }
});