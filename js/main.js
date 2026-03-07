document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');
    const cubesContainer = document.querySelector('.cubes-container');
    const cubes = document.querySelectorAll('.cube');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            menuToggle.textContent = navLinks.classList.contains('active') ? '✕' : '☰';
        });
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Close mobile menu if open
                if (navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    menuToggle.textContent = '☰';
                }

                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Contact form submission handling
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        let emailSent = false;
        
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const subject = document.getElementById('subject').value;
            const message = document.getElementById('message').value;

            // Basic validation
            if (!name || !email || !phone || !subject || !message) {
                showNotification('Please fill out all required fields.', 'error');
                return;
            }

            // Get cart information
            const cartItems = ShoppingCart.getItems();
            const totalCartItems = ShoppingCart.getTotalItems();
            const totalPrice = ShoppingCart.getTotalPrice();

            // Prepare email content
            let emailContent = `New Contact Form Submission\n\n`;
            emailContent += `=== Contact Information ===\n`;
            emailContent += `Name: ${name}\n`;
            emailContent += `Email: ${email}\n`;
            emailContent += `Phone: ${phone}\n`;
            emailContent += `Subject: ${subject}\n\n`;
            emailContent += `=== Message ===\n${message}\n\n`;
            
            // Add cart information
            emailContent += `=== Shopping Cart Information ===\n`;
            emailContent += `Total Items: ${totalCartItems}\n`;
            emailContent += `Total Price: €${totalPrice.toFixed(2)}\n\n`;
            
            if (cartItems.length > 0) {
                emailContent += `Cart Items:\n`;
                cartItems.forEach((item, index) => {
                    emailContent += `${index + 1}. ${item.name} - Quantity: ${item.quantity} - Price: €${(item.price * item.quantity).toFixed(2)}\n`;
                });
            } else {
                emailContent += `Cart is empty.\n`;
            }

            emailContent += `\n=== Submission Time ===\n${new Date().toLocaleString()}\n`;

            // Mark that email was sent and open email client
            emailSent = true;
            sessionStorage.setItem('emailSent', 'true');
            sendViaMailto(emailContent);
            contactForm.reset();
        });
        
        // Show success message when user returns from email client
        window.addEventListener('focus', function() {
            if (emailSent || sessionStorage.getItem('emailSent') === 'true') {
                showNotification('Message sent successfully! We\'ll be in touch soon.', 'success');
                emailSent = false;
                sessionStorage.removeItem('emailSent');
            }
        });
    }

    // FAQ Chat Logic
    const chatMessages = document.getElementById('chatMessages');
    const questionChips = document.getElementById('questionChips');
    const faqData = document.querySelectorAll('#faq-data .faq-item');

    if (chatMessages && questionChips && faqData.length > 0) {
        
        function addMessage(text, sender) {
            const msgDiv = document.createElement('div');
            msgDiv.className = `message ${sender}`;
            msgDiv.textContent = text;
            chatMessages.appendChild(msgDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        function showTypingIndicator() {
            const indicator = document.createElement('div');
            indicator.className = 'typing-indicator';
            indicator.id = 'typingIndicator';
            indicator.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
            chatMessages.appendChild(indicator);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        function removeTypingIndicator() {
            const indicator = document.getElementById('typingIndicator');
            if (indicator) {
                indicator.remove();
            }
        }

        function handleQuestionClick(question, answer) {
            // User sends message
            addMessage(question, 'user');

            // AI "thinks"
            showTypingIndicator();

            // AI replies after delay
            setTimeout(() => {
                removeTypingIndicator();
                addMessage(answer, 'ai');
            }, 1500);
        }

        // Initialize Chips
        faqData.forEach(item => {
            const question = item.dataset.question;
            const answer = item.textContent.trim();

            const chip = document.createElement('div');
            chip.className = 'chip';
            chip.textContent = question;
            chip.addEventListener('click', () => handleQuestionClick(question, answer));
            questionChips.appendChild(chip);
        });

        // Initial Greeting
        setTimeout(() => {
            showTypingIndicator();
            setTimeout(() => {
                removeTypingIndicator();
                addMessage("Hello! I'm the Aigrit Support AI. How can I help you today?", 'ai');
            }, 1000);
        }, 500);
    }

    // Cube rolling logic
    // Store the state of each cube
    const cubeStates = {
        cube1: null,
        cube2: null,
        cube3: null
    };

    cubes.forEach((cube, index) => {
        cube.addEventListener('click', () => {
            if (cube.classList.contains('rolling') || cube.dataset.cheering) return; // Prevent double clicking

            // Use requestAnimationFrame for smoother start
            requestAnimationFrame(() => {
                cube.removeAttribute('style');
                cube.classList.add('rolling');
            });

            // Randomly determine the final rotation
            // We want to land on a face, which are at 0, 90, 180, 270 degrees
            // x and y rotations
            // Faces mapping:
            // Front: 0, 0 (Ai / gr / it)
            // Back: 0, 180 (??)
            // Right: 0, -90 ($$)
            // Left: 0, 90 (!!)
            // Top: -90, 0 (XX)
            // Bottom: 90, 0 (OO)

            const rotations = [
                { x: 0, y: 0, face: 'front' },      // front
                { x: 0, y: 180, face: 'back' },    // back
                { x: 0, y: -90, face: 'right' },    // right
                { x: 0, y: 90, face: 'left' },     // left
                { x: -90, y: 0, face: 'top' },    // top
                { x: 90, y: 0, face: 'bottom' }      // bottom
            ];

            const randomFace = rotations[Math.floor(Math.random() * rotations.length)];

            // Store the state
            cubeStates[cube.id] = randomFace.face;

            setTimeout(() => {
                requestAnimationFrame(() => {
                    cube.classList.remove('rolling');
                    cube.setAttribute('style', `transform: rotateX(${randomFace.x}deg) rotateY(${randomFace.y}deg) !important; animation: none !important; transition: transform 0.3s ease-out;`);

                    checkCubesCombination();
                });
            }, 600); // Reduced duration for snappier feel
        });
    });

    function checkCubesCombination() {
        const currentCubes = cubesContainer.querySelectorAll('.cube');
        const isCorrectOrder =
            currentCubes[0].id === 'cube1' &&
            currentCubes[1].id === 'cube2' &&
            currentCubes[2].id === 'cube3';

        if (isCorrectOrder && cubeStates.cube1 === 'front' && cubeStates.cube2 === 'front' && cubeStates.cube3 === 'front') {
            triggerWelcomeTextEffect();
        }
    }

    function triggerWelcomeTextEffect() {
        const welcomeText = document.getElementById('welcome-text');
        if (welcomeText) {
            requestAnimationFrame(() => {
                welcomeText.classList.add('cheering-text');
                cubes.forEach((cube, index) => {
                    cube.removeAttribute('style');
                    cube.classList.add(`cheering-cube${index + 1}`);
                    cube.dataset.cheering = "true";
                });
            });
            
            setTimeout(() => {
                requestAnimationFrame(() => {
                    welcomeText.classList.remove('cheering-text');
                    cubes.forEach((cube, index) => {
                        cube.classList.remove(`cheering-cube${index + 1}`);
                        delete cube.dataset.cheering;
                    });
                    resetCubes();
                });
            }, 10000); // 10 seconds
        }
    }

    function resetCubes() {
        const cubeArray = Array.from(cubes);
        // Sort back to original order: cube1, cube2, cube3
        cubeArray.sort((a, b) => {
            if (a.id < b.id) return -1;
            if (a.id > b.id) return 1;
            return 0;
        });

        cubesContainer.innerHTML = '';
        cubeArray.forEach(cube => {
            cubesContainer.appendChild(cube);
            cube.removeAttribute('style');
            cube.classList.remove('rolling', 'cheering-cube1', 'cheering-cube2', 'cheering-cube3');
            // Reset state
            cubeStates[cube.id] = null;
        });
    }
});

function filterProducts(category, event) {
    const cards = document.querySelectorAll('.product-card');
    const buttons = document.querySelectorAll('.filter-btn');

    // Update button active state
    buttons.forEach(btn => {
        btn.classList.remove('active');
    });

    if (event && event.target) {
        event.target.classList.add('active');
    } else {
        // Fallback for when event is not passed
        buttons.forEach(btn => {
            if (btn.textContent.toLowerCase().includes(category)) {
                btn.classList.add('active');
            }
        });
    }


    // Filter cards
    cards.forEach(card => {
        // Reset animation to ensure hover works correctly after filtering
        card.style.animation = 'none';
        card.offsetHeight; /* trigger reflow */
        
        if (category === 'all' || card.dataset.category === category) {
            card.style.display = 'flex'; // Changed from block to flex to maintain layout
            // Re-apply fade in animation
            setTimeout(() => {
                card.style.animation = 'fadeInUp 0.3s ease forwards';
                // Clear animation property after it finishes so CSS hover effects work
                setTimeout(() => {
                    card.style.animation = '';
                }, 300);
            }, 10);
        } else {
            card.style.display = 'none';
        }
    });
}

function showNotification(message, type = 'success') {
    let container = document.getElementById('notification-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `notification-toast ${type}`;
    
    const icon = document.createElement('span');
    icon.className = 'notification-icon';
    
    // Set icon based on type
    switch(type) {
        case 'success':
            icon.textContent = '✓';
            break;
        case 'error':
            icon.textContent = '!';
            break;
        case 'info':
        default:
            icon.textContent = 'ℹ';
            break;
    }

    const msg = document.createElement('span');
    msg.className = 'notification-message';
    msg.textContent = message;

    toast.appendChild(icon);
    toast.appendChild(msg);
    container.appendChild(toast);

    // Set border color and icon color based on type
    switch(type) {
        case 'success':
            toast.style.borderLeftColor = 'var(--primary-color)';
            icon.style.color = 'var(--primary-color)';
            break;
        case 'error':
            toast.style.borderLeftColor = '#E74C3C';
            icon.style.color = '#E74C3C';
            break;
        case 'info':
        default:
            toast.style.borderLeftColor = '#3498DB';
            icon.style.color = '#3498DB';
            break;
    }

    // Trigger the animation
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);

    // Hide and remove the toast after a few seconds
    setTimeout(() => {
        toast.classList.remove('show');
        toast.addEventListener('transitionend', () => {
            if (toast.parentNode) {
                toast.remove();
            }
        });
    }, type === 'info' ? 4000 : 3000); // Info messages stay longer
}

// Shopping Cart System
const ShoppingCart = {
    items: [],
    
    // Initialize cart from localStorage
    init() {
        const savedCart = localStorage.getItem('shoppingCart');
        if (savedCart) {
            this.items = JSON.parse(savedCart);
        }
        this.updateCartDisplay();
    },
    
    // Reset cart completely (for page refresh)
    resetCart() {
        this.items = [];
        this.saveCart();
        this.updateCartDisplay();
        // Clear any existing notifications
        this.clearNotifications();
    },
    
    // Clear all notifications
    clearNotifications() {
        const notificationContainer = document.getElementById('notification-container');
        if (notificationContainer) {
            // Remove all notification toasts
            const toasts = notificationContainer.querySelectorAll('.notification-toast');
            toasts.forEach(toast => {
                toast.classList.remove('show');
                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.remove();
                    }
                }, 300);
            });
        }
    },
    
    // Add item to cart
    addItem(productName, price = 0, quantity = 1, productId = null) {
        const existingItem = this.items.find(item => item.name === productName);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.items.push({
                name: productName,
                price: price,
                quantity: quantity,
                productId: productId || productName.toLowerCase().replace(/\s+/g, '-'),
                id: Date.now() // Unique ID for each item
            });
        }
        
        this.saveCart();
        this.updateCartDisplay();
        showNotification(`Added ${productName} to cart!`, 'success');
    },
    
    // Remove item from cart
    removeItem(itemId) {
        const itemToRemove = this.items.find(item => item.id === itemId);
        this.items = this.items.filter(item => item.id !== itemId);
        this.saveCart();
        this.updateCartDisplay();
        
        // Reset product card quantity when item is removed from cart
        if (itemToRemove && productCardQuantities[itemToRemove.productId]) {
            productCardQuantities[itemToRemove.productId] = 1;
            // Update the UI display
            const productCard = document.querySelector(`[data-product-id="${itemToRemove.productId}"]`);
            if (productCard) {
                const quantityDisplay = productCard.querySelector('.quantity-display');
                if (quantityDisplay) {
                    quantityDisplay.textContent = '1';
                }
                const minusBtn = productCard.querySelector('.quantity-minus');
                if (minusBtn) {
                    minusBtn.disabled = true;
                }
            }
        }
    },
    
    // Update item quantity
    updateQuantity(itemId, newQuantity) {
        const item = this.items.find(item => item.id === itemId);
        if (item) {
            if (newQuantity <= 0) {
                this.removeItem(itemId);
            } else {
                item.quantity = newQuantity;
                this.saveCart();
                this.updateCartDisplay();
            }
        }
    },
    
    // Get total items count
    getTotalItems() {
        return this.items.reduce((total, item) => total + item.quantity, 0);
    },
    
    // Get total price
    getTotalPrice() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    },
    
    // Save cart to localStorage
    saveCart() {
        localStorage.setItem('shoppingCart', JSON.stringify(this.items));
    },
    
    // Update cart display in UI
    updateCartDisplay() {
        const cartButton = document.getElementById('cartButton');
        const cartBadge = document.getElementById('cartBadge');
        
        if (cartButton && cartBadge) {
            const totalItems = this.getTotalItems();
            cartBadge.textContent = totalItems;
            cartBadge.style.display = totalItems > 0 ? 'block' : 'none';
        }
        
        // Update navbar button states
        updateNavbarButtonStates();
    },
    
    // Clear cart
    clearCart() {
        this.items = [];
        this.saveCart();
        this.updateCartDisplay();
        
        // Reset all product card quantities
        Object.keys(productCardQuantities).forEach(productId => {
            productCardQuantities[productId] = 1;
            const productCard = document.querySelector(`[data-product-id="${productId}"]`);
            if (productCard) {
                const quantityDisplay = productCard.querySelector('.quantity-display');
                if (quantityDisplay) {
                    quantityDisplay.textContent = '1';
                }
                const minusBtn = productCard.querySelector('.quantity-minus');
                if (minusBtn) {
                    minusBtn.disabled = true;
                }
            }
        });
    },
    
    // Get cart items
    getItems() {
        return [...this.items]; // Return copy to prevent direct manipulation
    }
};

// Initialize cart when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    // Initialize cart from localStorage (preserves items during navigation)
    ShoppingCart.init();
    
    // Add click event to cart button for visual feedback
    const cartButton = document.getElementById('cartButton');
    if (cartButton) {
        cartButton.addEventListener('click', function() {
            this.classList.add('added');
            setTimeout(() => {
                this.classList.remove('added');
            }, 600);
            
            // Show cart contents notification
            const items = ShoppingCart.getItems();
            if (items.length > 0) {
                const itemCount = ShoppingCart.getTotalItems();
                const totalPrice = ShoppingCart.getTotalPrice();
                showNotification(`Cart: ${itemCount} items (€${totalPrice.toFixed(2)})`, 'success');
            } else {
                showNotification('Your cart is empty', 'info');
            }
        });
    }
});

// Quantity control functions
// Product card quantity tracking - separate from cart
const productCardQuantities = {};

function updateQuantity(productId, delta) {
    const productCard = document.querySelector(`[data-product-id="${productId}"]`);
    if (!productCard) return;
    
    const quantityDisplay = productCard.querySelector('.quantity-display');
    const minusBtn = productCard.querySelector('.quantity-minus');
    const plusBtn = productCard.querySelector('.quantity-plus');
    
    if (!quantityDisplay) return;
    
    let currentQuantity = parseInt(quantityDisplay.textContent) || 1;
    let newQuantity = currentQuantity + delta;
    
    // Ensure quantity stays between 1 and 99
    newQuantity = Math.max(1, Math.min(99, newQuantity));
    
    // Update display
    quantityDisplay.textContent = newQuantity;
    
    // Update button states
    if (minusBtn) {
        minusBtn.disabled = newQuantity <= 1;
    }
    if (plusBtn) {
        plusBtn.disabled = newQuantity >= 99;
    }
    
    // Store product card quantity separately - DO NOT update cart yet
    productCardQuantities[productId] = newQuantity;
}

// Update navbar cart quantity - NOW directly modifies cart items
function updateNavbarQuantity(delta) {
    const minusBtn = document.getElementById('navbarQuantityMinus');
    const plusBtn = document.getElementById('navbarQuantityPlus');
    
    // Get current cart items
    const cartItems = ShoppingCart.getItems();
    
    if (cartItems.length === 0) {
        // No items in cart - show notification
        showNotification('Cart is empty! Add items first.', 'warning');
        return;
    }
    
    // Apply delta to all items in cart
    let totalChange = 0;
    cartItems.forEach(item => {
        const newQuantity = Math.max(1, item.quantity + delta);
        const quantityChange = newQuantity - item.quantity;
        
        if (quantityChange !== 0) {
            ShoppingCart.updateQuantity(item.id, newQuantity);
            totalChange += quantityChange;
        }
    });
    
    // Show appropriate notification
    if (totalChange > 0) {
        showNotification(`Increased all items by ${totalChange}`, 'success');
    } else if (totalChange < 0) {
        showNotification(`Decreased all items by ${Math.abs(totalChange)}`, 'info');
    }
    
    // Update button states based on cart state
    const totalItems = ShoppingCart.getTotalItems();
    if (minusBtn) {
        minusBtn.disabled = totalItems <= cartItems.length; // Can't go below 1 per item
    }
    if (plusBtn) {
        plusBtn.disabled = totalItems >= 99 * cartItems.length; // Reasonable upper limit
    }
}

// Helper function to update navbar button states based on cart content
function updateNavbarButtonStates() {
    const minusBtn = document.getElementById('navbarQuantityMinus');
    const plusBtn = document.getElementById('navbarQuantityPlus');
    
    const cartItems = ShoppingCart.getItems();
    const totalItems = ShoppingCart.getTotalItems();
    
    if (minusBtn) {
        minusBtn.disabled = cartItems.length === 0 || totalItems <= cartItems.length;
    }
    if (plusBtn) {
        plusBtn.disabled = cartItems.length === 0 || totalItems >= 99 * cartItems.length;
    }
}

// Get current navbar quantity
function getNavbarQuantity() {
    return 1; // Not used anymore since we're working with actual cart items
}

function addToCart(productName, price = 1, productId = null) {
    // If no productId provided, generate one
    if (!productId) {
        productId = productName.toLowerCase().replace(/\s+/g, '-');
    }
    
    // Get quantity from product card storage (separate from cart)
    let quantity = productCardQuantities[productId] || 1;
    
    // Add to cart with the selected quantity
    ShoppingCart.addItem(productName, price, quantity, productId);
    
    // Show confirmation with the actual quantity added
    showNotification(`Added ${quantity} × ${productName} to cart!`, 'success');
}

// Setup navbar quantity controls
function setupNavbarQuantityControls() {
    const cartNavItem = document.querySelector('.cart-nav-item');
    if (!cartNavItem) return;
    
    // Check if navbar controls already exist
    if (document.getElementById('navbarQuantityControls')) return;
    
    // Create navbar quantity controls
    const navbarControls = document.createElement('div');
    navbarControls.id = 'navbarQuantityControls';
    navbarControls.className = 'navbar-quantity-controls';
    
    navbarControls.innerHTML = `
        <button id="navbarQuantityPlus" class="navbar-quantity-btn" onclick="updateNavbarQuantity(1)">+</button>
        <button id="navbarQuantityMinus" class="navbar-quantity-btn" onclick="updateNavbarQuantity(-1)">-</button>
    `;
    
    // Add direct styling for compact vertical appearance
    navbarControls.style.display = 'flex';
    navbarControls.style.flexDirection = 'column';
    navbarControls.style.alignItems = 'center';
    navbarControls.style.justifyContent = 'center';
    navbarControls.style.gap = '0.1rem';
    navbarControls.style.marginLeft = '0.3rem';
    navbarControls.style.padding = '0.1rem';
    navbarControls.style.background = 'transparent';
    navbarControls.style.borderRadius = '3px';
    navbarControls.style.border = 'none';
    navbarControls.style.height = '50px';
    navbarControls.style.alignSelf = 'center';
    
    // Insert after the cart button
    const cartButton = cartNavItem.querySelector('.cart-button');
    if (cartButton) {
        cartNavItem.insertBefore(navbarControls, cartButton.nextSibling);
    }
    
    // Initialize button states based on cart content
    setTimeout(() => {
        updateNavbarButtonStates();
    }, 100);
}

// Initialize quantity controls on page load
document.addEventListener('DOMContentLoaded', () => {
    // Setup quantity controls for all product cards
    setupQuantityControls();
});

function setupQuantityControls() {
    // Setup navbar quantity controls first
    setupNavbarQuantityControls();
    
    // Find all product cards that need quantity controls
    const productCards = document.querySelectorAll('.product-card, .subscription-card');
    
    productCards.forEach((card, index) => {
        // Skip cards that already have quantity controls
        if (card.querySelector('.cart-quantity-controls')) return;
        
        // Get product info
        const productNameElement = card.querySelector('h3');
        const priceElement = card.querySelector('.price, .subscription-price');
        
        if (!productNameElement) return;
        
        const productName = productNameElement.textContent.trim();
        const productId = productName.toLowerCase().replace(/\s+/g, '-') + '-' + index;
        
        // Extract price (handle both €1 and Contact Us formats)
        let price = 1;
        if (priceElement && priceElement.textContent.includes('€')) {
            const priceText = priceElement.textContent.replace('€', '').trim();
            price = parseFloat(priceText) || 1;
        }
        
        // Add data attribute to card
        card.setAttribute('data-product-id', productId);
        
        // Initialize product card quantity (separate from cart)
        productCardQuantities[productId] = 1;
        
        // Create quantity controls
        const quantityControls = document.createElement('div');
        quantityControls.className = 'cart-quantity-controls';
        quantityControls.innerHTML = `
            <button class="quantity-btn quantity-minus" onclick="updateQuantity('${productId}', -1)" disabled>-</button>
            <span class="quantity-display">1</span>
            <button class="quantity-btn quantity-plus" onclick="updateQuantity('${productId}', 1)">+</button>
        `;
        
        // Add some spacing styles directly
        quantityControls.style.margin = '1rem 0 0.8rem 0';
        quantityControls.style.padding = '0.6rem';
        quantityControls.style.background = 'rgba(255, 255, 255, 0.7)';
        quantityControls.style.borderRadius = '6px';
        quantityControls.style.border = '1px solid #D4AF37';
        quantityControls.style.gap = '0.4rem';
        
        // Find the add to cart button and insert controls before it
        const addToCartBtn = card.querySelector('[onclick*="addToCart"]');
        if (addToCartBtn) {
            addToCartBtn.parentNode.insertBefore(quantityControls, addToCartBtn);
        }
        
        // Update the addToCart button to include productId
        if (addToCartBtn) {
            const originalOnclick = addToCartBtn.getAttribute('onclick');
            if (originalOnclick) {
                addToCartBtn.setAttribute('onclick', `addToCart('${productName}', ${price}, '${productId}')`);
            }
        }
    });
}

// Reset cart and notifications only on actual browser refresh
// Using performance.navigation API for reliable detection
// No need for beforeunload handler in this simplified approach

// Simple and reliable refresh detection
window.addEventListener('load', function() {
    // Check if this page load was from a refresh
    const navigationType = performance.navigation.type;
    
    // Type 1 = Page was reloaded
    // Type 2 = Back/forward navigation
    // Type 0 = Normal navigation
    
    if (navigationType === 1) {
        // This is definitely a page reload/refresh
        console.log('Page reload detected - resetting cart');
        ShoppingCart.resetCart();
        return;
    }
    
    // Additional check for F5 refresh
    if (navigationType === 0) {
        // Check if there's a reload indicator in sessionStorage
        const wasReload = sessionStorage.getItem('manualReload') === 'true';
        if (wasReload) {
            console.log('Manual reload detected - resetting cart');
            ShoppingCart.resetCart();
            sessionStorage.removeItem('manualReload');
            return;
        }
    }
    
    console.log('Normal navigation - preserving cart');
    
    // Clean up any reload flags
    sessionStorage.removeItem('manualReload');
});

// Detect F5/manual refresh
document.addEventListener('keydown', function(e) {
    if ((e.key === 'F5') || (e.ctrlKey && e.key === 'r')) {
        sessionStorage.setItem('manualReload', 'true');
    }
});

// Email sending function using mailto
function sendViaMailto(emailContent, name, email) {
    // Encode the email content for URL
    const subject = encodeURIComponent('New Contact Form Submission - Aigrit');
    const body = encodeURIComponent(emailContent);
    
    // Create mailto link
    const mailtoLink = `mailto:lengpovsry666@gmail.com?subject=${subject}&body=${body}`;
    
    // Open mailto link immediately
    window.location.href = mailtoLink;
}
