// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Gallery image click handler
document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', function() {
        const img = this.querySelector('img');
        const modal = document.createElement('div');
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.backgroundColor = 'rgba(0,0,0,0.9)';
        modal.style.display = 'flex';
        modal.style.justifyContent = 'center';
        modal.style.alignItems = 'center';
        modal.style.zIndex = '1000';
        modal.style.cursor = 'pointer';

        const modalImg = document.createElement('img');
        modalImg.src = img.src;
        modalImg.style.maxWidth = '90%';
        modalImg.style.maxHeight = '90%';
        modalImg.style.objectFit = 'contain';

        modal.appendChild(modalImg);
        document.body.appendChild(modal);

        modal.addEventListener('click', () => {
            modal.remove();
        });
    });
});

// Debug log to confirm script loading
console.log('Navigation script loaded');

// Wrap all navigation-related code in a try-catch block
try {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('DOM Content Loaded');
        
        const hamburger = document.querySelector('.hamburger');
        const navLinks = document.querySelector('.nav-links');
        const navLinksItems = document.querySelectorAll('.nav-links a');

        if (!hamburger || !navLinks) {
            console.error('Navigation elements not found');
            return;
        }

        console.log('Navigation elements found');

        // Toggle menu
        hamburger.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent event bubbling
            console.log('Hamburger clicked');
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        // Close menu when clicking a link
        navLinksItems.forEach(link => {
            link.addEventListener('click', () => {
                console.log('Nav link clicked');
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!event.target.closest('nav')) {
                console.log('Clicked outside nav');
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            }
        });

        const contactForm = document.querySelector('.contact-form');
        const contactStatus = document.querySelector('.contact-status');

        if (contactForm) {
            contactForm.addEventListener('submit', async event => {
                event.preventDefault();

                const formData = new FormData(contactForm);
                const payload = {
                    email: formData.get('email') || '',
                    msg: formData.get('msg') || ''
                };

                if (contactStatus) {
                    contactStatus.textContent = 'Sending your message...';
                    contactStatus.classList.remove('contact-status--success', 'contact-status--error');
                }

                try {
                    const response = await fetch('https://n8n.skasystems.com/webhook/contact', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Basic ${btoa('nadart:barnouss56')}`
                        },
                        body: JSON.stringify(payload)
                    });

                    if (!response.ok) {
                        throw new Error(`Request failed with status ${response.status}`);
                    }

                    if (contactStatus) {
                        contactStatus.textContent = 'Thank you! Your message has been sent.';
                        contactStatus.classList.add('contact-status--success');
                    }

                    contactForm.reset();
                } catch (error) {
                    console.error('Error sending contact form:', error);
                    if (contactStatus) {
                        contactStatus.textContent = 'Sorry, something went wrong. Please try again later.';
                        contactStatus.classList.add('contact-status--error');
                    }
                }
            });
        }
    });
} catch (error) {
    console.error('Error in navigation script:', error);
}

