class DraggableElement {
    constructor(element) {
        this.element = element;
        this.originalPosition = null;
        this.lastPosition = null;
        this.isDragging = false;
        this.isSticky = false;
        this.lastTouchTime = 0;
        this.touchTimeout = null;
        this.originalSize = {
            width: element.offsetWidth,
            height: element.offsetHeight
        };
        this.MIN_SIZE = 10;

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
        this.element.addEventListener('dblclick', this.handleDoubleClick.bind(this));
        this.element.addEventListener('contextmenu', (e) => e.preventDefault());
        this.element.addEventListener('mousedown', this.handleRightClick.bind(this));

        this.element.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        this.element.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        this.element.addEventListener('touchend', this.handleTouchEnd.bind(this));

        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        document.addEventListener('touchstart', this.handleGlobalTouchStart.bind(this), { passive: false });
        document.addEventListener('touchend', this.handleGlobalTouchEnd.bind(this));
    }

    handleClick(e) {
        if (this.isSticky) {
            this.toggleStickyMode();
        }
    }

    handleDoubleClick(e) {
        if (!this.isSticky) {
            this.toggleStickyMode();
        }
    }

    handleMouseDown(e) {
        if (e.button === 2) {
            this.startResize(e.clientX, e.clientY);
            return;
        }

        if (this.isSticky) {
            return;
        }

        this.startDrag(e.clientX, e.clientY);
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        document.addEventListener('mouseup', this.handleMouseUp.bind(this));
    }

    handleMouseMove(e) {
        if (this.isResizing) {
            this.resize(e.clientX, e.clientY);
        } else if (this.isDragging || this.isSticky) {
            this.move(e.clientX, e.clientY);
        }
    }

    handleMouseUp() {
        if (this.isResizing) {
            this.stopResize();
        } else if (this.isDragging) {
            this.stopDrag();
        }

        document.removeEventListener('mousemove', this.handleMouseMove.bind(this));
        document.removeEventListener('mouseup', this.handleMouseUp.bind(this));
    }

    handleRightClick(e) {
        if (e.button === 2) {
            e.preventDefault();
            this.startResize(e.clientX, e.clientY);
            document.addEventListener('mousemove', this.handleMouseMove.bind(this));
            document.addEventListener('mouseup', this.handleMouseUp.bind(this));
        }
    }

    handleTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const currentTime = Date.now();

        if (currentTime - this.lastTouchTime < 300) {
            if (!this.isSticky) {
                this.toggleStickyMode();
            }
        } else {
            if (!this.isSticky) {
                this.startDrag(touch.clientX, touch.clientY);
            }
        }

        this.lastTouchTime = currentTime;
    }

    handleTouchMove(e) {
        e.preventDefault();
        if (e.touches.length === 2) {
            this.handleMultiTouch(e);
            return;
        }

        const touch = e.touches[0];
        if (this.isDragging || this.isSticky) {
            this.move(touch.clientX, touch.clientY);
        }
    }

    handleTouchEnd(e) {
        if (this.isDragging && !this.isSticky) {
            this.stopDrag();
        }
    }

    handleGlobalTouchStart(e) {
        if (this.isSticky && e.touches.length === 1) {
            const touch = e.touches[0];
            this.move(touch.clientX, touch.clientY);
        } else if (e.touches.length >= 2 && (this.isDragging || this.isSticky)) {
            this.cancelAction();
        }
    }

    handleGlobalTouchEnd(e) {
        if (this.isSticky && e.touches.length === 0) {
            const touch = e.changedTouches[0];
            const elementCenter = {
                x: this.element.offsetLeft + this.element.offsetWidth / 2,
                y: this.element.offsetTop + this.element.offsetHeight / 2
            };

            const distance = Math.sqrt(
                Math.pow(touch.clientX - elementCenter.x, 2) +
                Math.pow(touch.clientY - elementCenter.y, 2)
            );

            if (distance < 10) {
                this.toggleStickyMode();
            }
        }
    }

    handleKeyDown(e) {
        if (e.key === 'Escape' && (this.isDragging || this.isSticky)) {
            this.cancelAction();
        }
    }

    handleMultiTouch(e) {
        if (e.touches.length === 2) {
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];

            const currentDistance = Math.sqrt(
                Math.pow(touch1.clientX - touch2.clientX, 2) +
                Math.pow(touch1.clientY - touch2.clientY, 2)
            );

            if (!this.resizeStartDistance) {
                this.resizeStartDistance = currentDistance;
                this.initialSize = {
                    width: this.element.offsetWidth,
                    height: this.element.offsetHeight
                };
            } else {
                const scale = currentDistance / this.resizeStartDistance;
                const newWidth = Math.max(this.initialSize.width * scale, this.MIN_SIZE);
                const newHeight = Math.max(this.initialSize.height * scale, this.MIN_SIZE);

                this.element.style.width = `${newWidth}px`;
                this.element.style.height = `${newHeight}px`;
            }
        }
    }

    startDrag(clientX, clientY) {
        this.isDragging = true;
        this.saveOriginalPos();

        const rect = this.element.getBoundingClientRect();
        this.offset = {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    }

    stopDrag() {
        this.isDragging = false;
    }

    startResize(clientX, clientY) {
        this.isResizing = true;
        this.resizeStart = { x: clientX, y: clientY };
        this.initialSize = {
            width: this.element.offsetWidth,
            height: this.element.offsetHeight
        };
    }

    resize(clientX, clientY) {
        const dx = clientX - this.resizeStart.x;
        const dy = clientY - this.resizeStart.y;

        const newWidth = Math.max(this.initialSize.width + dx, this.MIN_SIZE);
        const newHeight = Math.max(this.initialSize.height + dy, this.MIN_SIZE);

        this.element.style.width = `${newWidth}px`;
        this.element.style.height = `${newHeight}px`;
    }

    stopResize() {
        this.isResizing = false;
        this.resizeStart = null;
    }

    move(clientX, clientY) {
        this.element.style.left = `${clientX - this.offset.x}px`;
        this.element.style.top = `${clientY - this.offset.y}px`;
    }

    toggleStickyMode() {
        this.isSticky = !this.isSticky;

        if (this.isSticky) {
            this.element.style.backgroundColor = 'brown';
            this.saveOriginalPos();

            const rect = this.element.getBoundingClientRect();
            this.offset = {
                x: rect.width / 2,
                y: rect.height / 2
            };
        } else {
            this.element.style.backgroundColor = 'red';
        }
    }

    saveOriginalPos() {
        this.originalPosition = {
            x: parseInt(this.element.style.left),
            y: parseInt(this.element.style.top)
        };
    }

    cancelAction() {
        if (this.isSticky) {
            this.toggleStickyMode();
        }

        this.element.style.left = `${this.originalPosition.x}px`;
        this.element.style.top = `${this.originalPosition.y}px`;
        this.isDragging = false;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const targets = document.querySelectorAll('.target');
    Array.from(targets).map(element => new DraggableElement(element));
});