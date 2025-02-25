export class Modal {
    constructor(options = {}) {
        const { title, message, confirmText = '확인', cancelText = '취소' } = options;
        this.element = document.createElement('div');
        this.element.className = 'modal';
        this.render(title, message, confirmText, cancelText);
        this.confirmCallback = null;
        this.cancelCallback = null;
    }

    render(title, message, confirmText, cancelText) {
        this.element.innerHTML = `
            <div class="modal-content">
                ${title ? `<p class="modal-title">${title}</p>` : ''}
                ${message ? `<p class="modal-subtitle">${message}</p>` : ''}
                <div class="modal-buttons">
                    <button type="button" class="cancel-btn">${cancelText}</button>
                    <button type="button" class="confirm-btn">${confirmText}</button>
                </div>
            </div>
        `;

        this.element.addEventListener('click', (e) => {
            if (e.target === this.element) {
                this.hide();
                if (this.cancelCallback) this.cancelCallback();
            }
        });

        this.element.querySelector('.cancel-btn').addEventListener('click', () => {
            this.hide();
            if (this.cancelCallback) this.cancelCallback();
        });

        this.element.querySelector('.confirm-btn').addEventListener('click', () => {
            this.hide();
            if (this.confirmCallback) this.confirmCallback();
        });
    }

    show() {
        document.body.appendChild(this.element);
        document.body.style.overflow = 'hidden';
        this.element.classList.add('show');
    }

    hide() {
        document.body.style.overflow = '';
        this.element.classList.remove('show');
        this.element.remove();
    }

    onConfirm(callback) {
        this.confirmCallback = callback;
    }

    onCancel(callback) {
        this.cancelCallback = callback;
    }
}