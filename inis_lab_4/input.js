const targets = document.querySelectorAll('.target');

targets.forEach(target => {
    let isDragging = false;
    let isDoubleClick = false;
    let initialX, initialY;
    let offsetX, offsetY;

    let lastPosition = {x: target.offsetLeft, y: target.offsetTop};

    target.addEventListener('mousedown', (e) => {
        if (isDoubleClick) return;

        isDragging = true;

        initialX = e.clientX - target.offsetLeft;
        initialY = e.clientY - target.offsetTop;

        document.addEventListener('mousemove', mouseMove);
        document.addEventListener('mouseup', mouseUp);
    });

    function mouseMove(e) {
        if (isDragging) {
            let newX = e.clientX - initialX;
            let newY = e.clientY - initialY;

            target.style.left = newX + 'px';
            target.style.top = newY + 'px';
        }
    }

    function mouseUp() {
        if (isDragging) {
            isDragging = false;
            lastPosition.x = target.offsetLeft;
            lastPosition.y = target.offsetTop;
        }
        document.removeEventListener('mousemove', mouseMove);
        document.removeEventListener('mouseup', mouseUp);
    }

    target.addEventListener('dblclick', () => {
        isDoubleClick = true;
        target.style.backgroundColor = 'blue';
        document.addEventListener('mousemove', mouseMoveDoubleClick);

        target.addEventListener('click', () => {
            isDoubleClick = false;
            target.style.backgroundColor = '';
            document.removeEventListener('mousemove', mouseMoveDoubleClick);
        });
    });

    function mouseMoveDoubleClick(e) {
        if (isDoubleClick) {
            let newX = e.clientX - initialX;
            let newY = e.clientY - initialY;

            target.style.left = newX + 'px';
            target.style.top = newY + 'px';
        }
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && (isDragging || isDoubleClick)) {
            target.style.left = lastPosition.x + 'px';
            target.style.top = lastPosition.y + 'px';
            isDragging = false;
            isDoubleClick = false;
            target.style.backgroundColor = '';
        }
    });
});