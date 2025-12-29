// This creates the 'soonify' object and the 'toast' function
var soonify = (function(){
  
  return {
    // A simple toast notification function
    toast: function(message, type = 'success') {
      console.log(`Toast (${type}): ${message}`);
      
      let toast = document.createElement('div');
      toast.className = 'soonify-toast';
      toast.textContent = message;
      
      // Basic styling
      toast.style = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: ${type === 'success' ? '#2EA043' : '#F85149'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 9999;
        font-family: Arial, sans-serif;
        opacity: 0;
        transition: opacity 0.5s, top 0.5s;
      `;
      
      document.body.appendChild(toast);
      
      // Animate in
      setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.top = '30px';
      }, 100);
      
      // Animate out
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.top = '20px';
        setTimeout(() => toast.remove(), 500);
      }, 3000); // Show for 3 seconds
    }
  };

})();