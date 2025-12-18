// Help page specific JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initializeHelpPage();
});

function initializeHelpPage() {
    // Initialize FAQ functionality
    initializeFAQ();
    
    // Initialize search functionality
    initializeSearch();
}

function initializeFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', function() {
            const isActive = item.classList.contains('active');
            
            // Close all other FAQ items
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Toggle current item
            if (isActive) {
                item.classList.remove('active');
            } else {
                item.classList.add('active');
            }
        });
    });
}

function initializeSearch() {
    const searchInput = document.getElementById('helpSearch');
    const faqItems = document.querySelectorAll('.faq-item');
    
    if (!searchInput) return;
    
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase().trim();
        
        if (searchTerm === '') {
            // Show all FAQ items
            faqItems.forEach(item => {
                item.style.display = 'block';
            });
            return;
        }
        
        // Filter FAQ items based on search term
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question h3').textContent.toLowerCase();
            const answer = item.querySelector('.faq-answer p').textContent.toLowerCase();
            
            if (question.includes(searchTerm) || answer.includes(searchTerm)) {
                item.style.display = 'block';
                // Highlight matching text
                highlightSearchTerm(item, searchTerm);
            } else {
                item.style.display = 'none';
            }
        });
    });
    
    // Clear search on escape key
    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            this.value = '';
            this.dispatchEvent(new Event('input'));
        }
    });
}

function highlightSearchTerm(item, searchTerm) {
    const question = item.querySelector('.faq-question h3');
    const answer = item.querySelector('.faq-answer p');
    
    // Remove existing highlights
    question.innerHTML = question.textContent;
    answer.innerHTML = answer.textContent;
    
    if (searchTerm.length < 2) return;
    
    // Highlight in question
    const questionText = question.textContent;
    const questionRegex = new RegExp(`(${escapeRegex(searchTerm)})`, 'gi');
    question.innerHTML = questionText.replace(questionRegex, '<mark style="background: rgba(99, 102, 241, 0.3); color: #ffffff; padding: 2px 4px; border-radius: 4px;">$1</mark>');
    
    // Highlight in answer
    const answerText = answer.textContent;
    const answerRegex = new RegExp(`(${escapeRegex(searchTerm)})`, 'gi');
    answer.innerHTML = answerText.replace(answerRegex, '<mark style="background: rgba(99, 102, 241, 0.3); color: #ffffff; padding: 2px 4px; border-radius: 4px;">$1</mark>');
}

function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Add smooth scrolling to FAQ items when they become active
document.addEventListener('click', function(e) {
    if (e.target.closest('.faq-question')) {
        const faqItem = e.target.closest('.faq-item');
        
        setTimeout(() => {
            if (faqItem.classList.contains('active')) {
                faqItem.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest'
                });
            }
        }, 300);
    }
});

// Add keyboard navigation for FAQ
document.addEventListener('keydown', function(e) {
    const activeElement = document.activeElement;
    
    if (activeElement && activeElement.closest('.faq-question')) {
        const faqItem = activeElement.closest('.faq-item');
        const allFaqItems = Array.from(document.querySelectorAll('.faq-item'));
        const currentIndex = allFaqItems.indexOf(faqItem);
        
        switch(e.key) {
            case 'ArrowDown':
                e.preventDefault();
                if (currentIndex < allFaqItems.length - 1) {
                    allFaqItems[currentIndex + 1].querySelector('.faq-question').focus();
                }
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                if (currentIndex > 0) {
                    allFaqItems[currentIndex - 1].querySelector('.faq-question').focus();
                }
                break;
                
            case 'Enter':
            case ' ':
                e.preventDefault();
                activeElement.click();
                break;
        }
    }
});

// Make FAQ questions focusable
document.querySelectorAll('.faq-question').forEach(question => {
    question.setAttribute('tabindex', '0');
    question.setAttribute('role', 'button');
    question.setAttribute('aria-expanded', 'false');
    
    question.addEventListener('focus', function() {
        this.style.outline = '2px solid #6366f1';
        this.style.outlineOffset = '2px';
    });
    
    question.addEventListener('blur', function() {
        this.style.outline = 'none';
    });
});

// Update aria-expanded when FAQ items are toggled
const faqObserver = new MutationObserver(function(mutations) {
    mutations.forEach(mutation => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            const faqItem = mutation.target;
            const question = faqItem.querySelector('.faq-question');
            const isActive = faqItem.classList.contains('active');
            
            question.setAttribute('aria-expanded', isActive.toString());
        }
    });
});

document.querySelectorAll('.faq-item').forEach(item => {
    faqObserver.observe(item, { attributes: true });
});