class DraggableElement {
    constructor(element) {
        this.element = element;
        this.originalPosition = null;
        this.lastPosition = null;
        this.isDragging = false;
        this.isSticky = false;
        this.lastClickTime = 0;
        this.clickTimeout = null;

        const style = window.getComputedStyle(element);
        this.originalPosition = {
            x: parseInt(style.left),
            y: parseInt(style.top)
        };

        this.element.style.backgroundColor = 'red';

        this.setupEventListeners();
    }

    setupEventListeners() {
        this.element.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.element.addEventListener('click', this.handleClick.bind(this));
    }

    handleClick(e) {
        const currentTime = Date.now();
        const timeDiff = currentTime - this.lastClickTime;

        if (timeDiff < 300 && !this.isDragging) {
            this.toggleStickyMode();
        }

        this.lastClickTime = currentTime;
    }

    handleMouseDown(e) {
        if (this.isSticky) {
            this.toggleStickyMode();
            return;
        }

        const style = window.getComputedStyle(this.element);
        this.lastPosition = {
            x: parseInt(style.left),
            y: parseInt(style.top)
        };

        this.isDragging = true;
        const rect = this.element.getBoundingClientRect();

        this.mouseOffset = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };

        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        document.addEventListener('mouseup', this.handleMouseUp.bind(this));
    }

    handleMouseMove(e) {
        if (!this.isDragging && !this.isSticky) return;

        const x = e.clientX - this.mouseOffset.x;
        const y = e.clientY - this.mouseOffset.y;

        this.element.style.left = `${x}px`;
        this.element.style.top = `${y}px`;
    }

    handleMouseUp() {
        if (!this.isDragging) return;

        this.isDragging = false;
        document.removeEventListener('mousemove', this.handleMouseMove.bind(this));
        document.removeEventListener('mouseup', this.handleMouseUp.bind(this));
    }

    toggleStickyMode() {
        this.isSticky = !this.isSticky;

        if (this.isSticky) {
            this.element.style.backgroundColor = 'blue';

            const handlers = document.getEventListeners(document).mousemove;
            handlers.forEach(handler => {
                if (handler.listener.toString().includes('handleMouseMove')) {
                    document.removeEventListener('mousemove', handler.listener);
                }
            });

            document.addEventListener('mousemove', this.handleMouseMove.bind(this));
            document.addEventListener('click', () => {
                this.toggleStickyMode();
            });
        } else {
            this.element.style.backgroundColor = 'red';

            document.removeEventListener('mousemove', this.handleMouseMove.bind(this));
            document.removeEventListener('click', arguments.callee);
        }
    }

    resetPosition() {
        if (!this.lastPosition) {
            this.lastPosition = this.originalPosition;
        }

        this.element.style.left = `${this.lastPosition.x}px`;
        this.element.style.top = `${this.lastPosition.y}px`;

        if (this.isSticky) {
            this.toggleStickyMode();
        }

        this.isDragging = false;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const targets = document.querySelectorAll('.target');

    const draggableElements = Array.from(targets).map(element =>
        new DraggableElement(element)
    );

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const stickyElement = draggableElements.find(el => el.isSticky);
            if (stickyElement) {
                stickyElement.resetPosition();
            }
        }
    });
});