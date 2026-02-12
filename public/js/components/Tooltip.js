/**
 * Simple Tooltip Component using Tailwind CSS
 */

export function initTooltips() {
    // Remove existing tooltips to avoid duplicates
    const existingTooltips = document.querySelectorAll('.custom-tooltip');
    existingTooltips.forEach(t => t.remove());

    const tooltipEl = document.createElement('div');
    tooltipEl.className = 'custom-tooltip fixed z-[100] px-2 py-1 bg-slate-900 text-white text-[10px] font-bold rounded shadow-xl pointer-events-none opacity-0 transition-opacity duration-200 uppercase tracking-wider';
    document.body.appendChild(tooltipEl);

    const elements = document.querySelectorAll('[data-tooltip]');
    
    elements.forEach(el => {
        el.addEventListener('mouseenter', (e) => {
            const text = el.getAttribute('data-tooltip');
            if (!text) return;
            
            tooltipEl.innerText = text;
            tooltipEl.classList.remove('opacity-0');
            tooltipEl.classList.add('opacity-100');
            
            updatePosition(e, tooltipEl);
        });

        el.addEventListener('mousemove', (e) => {
            updatePosition(e, tooltipEl);
        });

        el.addEventListener('mouseleave', () => {
            tooltipEl.classList.add('opacity-0');
            tooltipEl.classList.remove('opacity-100');
        });
    });
}

function updatePosition(e, tooltipEl) {
    const padding = 12;
    let x = e.clientX + padding;
    let y = e.clientY + padding;

    // Check bounds
    const rect = tooltipEl.getBoundingClientRect();
    if (x + rect.width > window.innerWidth) {
        x = e.clientX - rect.width - padding;
    }
    if (y + rect.height > window.innerHeight) {
        y = e.clientY - rect.height - padding;
    }

    tooltipEl.style.left = `${x}px`;
    tooltipEl.style.top = `${y}px`;
}
