// Create cursor glow element
const cursorGlow = document.createElement('div');
cursorGlow.classList.add('cursor-glow');
document.body.appendChild(cursorGlow);

// Update cursor position
const updateCursor = (e) => {
  const { clientX: x, clientY: y } = e || { clientX: 0, clientY: 0 };
  cursorGlow.style.left = `${x}px`;
  cursorGlow.style.top = `${y}px`;
};

// Add event listeners
document.addEventListener('mousemove', updateCursor);
document.addEventListener('mousedown', () => {
  cursorGlow.style.transform = 'translate(-50%, -50%) scale(0.8)';
});
document.addEventListener('mouseup', () => {
  cursorGlow.style.transform = 'translate(-50%, -50%)';
});

// Add cursor glow to the document when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    document.body.appendChild(cursorGlow);
  });
} else {
  document.body.appendChild(cursorGlow);
}
