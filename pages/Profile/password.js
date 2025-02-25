import { Header } from '../../components/Header/index.js';
import { Api } from '../../utils/api.js';
import { validators } from '../../utils/validation.js';
import { helpers } from '../../utils/helpers.js';

class PasswordEdit {
    constructor() {
        this.header = new Header({ 
            title: '비밀번호 수정',
            showBackButton: false
        });
        
        this.currentUser = null;
        this.validationState = {
            password: false,
            passwordConfirm: false
        };
        
        this.init();
    }
    
    async init() {
        await this.loadUserData();
        this.setupElements();
        this.setupEventListeners();
    }
    
    async loadUserData() {
        try {
            const userData = await Api.get('/users');
            this.currentUser = userData.data;
            
            if (!this.currentUser) {
                window.location.href = 'index.html';
                return;
            }
        } catch (error) {
            console.error('Failed to load user data:', error);
            window.location.href = 'index.html';
        }
    }
    
    setupElements() {
        this.form = document.getElementById('editForm');
        this.passwordInput = document.getElementById('password');
        this.passwordConfirmInput = document.getElementById('passwordConfirm');
        this.submitButton = document.querySelector('.submit-button');
        
        // 초기 버튼 비활성화
        this.submitButton.disabled = true;
        this.submitButton.style.opacity = '0.5';
    }
    
    setupEventListeners() {
        // 비밀번호 유효성 검사
        this.passwordInput.addEventListener('input', this.validatePassword.bind(this));
        
        // 비밀번호 확인 검사
        this.passwordConfirmInput.addEventListener('input', this.validatePasswordConfirm.bind(this));
        
        // 폼 제출 처리
        this.form.addEventListener('submit', this.handleSubmit.bind(this));
    }
    
    validatePassword() {
        const password = this.passwordInput.value;
        const helperText = this.passwordInput.parentElement.querySelector('.helper-text');
        const error = validators.password(password);
        
        if (error) {
            helperText.textContent = error;
            helperText.style.display = 'block';
            this.passwordInput.style.borderColor = 'var(--error)';
            this.validationState.password = false;
        } else {
            helperText.style.display = 'none';
            this.passwordInput.style.borderColor = 'var(--text-primary)';
            this.validationState.password = true;
        }
        
        if (this.passwordConfirmInput.value) {
            this.validatePasswordConfirm();
        }
        
        this.checkFormValidity();
    }
    
    validatePasswordConfirm() {
        const confirmation = this.passwordConfirmInput.value;
        const password = this.passwordInput.value;
        const helperText = this.passwordConfirmInput.parentElement.querySelector('.helper-text');
        const error = validators.passwordConfirm(confirmation, password);
        
        if (error) {
            helperText.textContent = error;
            helperText.style.display = 'block';
            this.passwordConfirmInput.style.borderColor = 'var(--error)';
            this.validationState.passwordConfirm = false;
        } else {
            helperText.style.display = 'none';
            this.passwordConfirmInput.style.borderColor = 'var(--text-primary)';
            this.validationState.passwordConfirm = true;
        }
        
        this.checkFormValidity();
    }
    
    checkFormValidity() {
        const isAllValid = Object.values(this.validationState).every(value => value === true);
        this.submitButton.disabled = !isAllValid;
        this.submitButton.style.opacity = isAllValid ? '1' : '0.5';
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        try {
            const success = await Api.patch(`/users/${this.currentUser.id}/password`, {
                userId: this.currentUser.id,
                password: this.passwordInput.value,
                confirmPassword: this.passwordInput.value
            });
            
            if (success) {
                helpers.showToast('비밀번호가 변경되었습니다');
                setTimeout(() => {
                    window.location.href = 'posts.html';
                }, 2000);
            }
        } catch (error) {
            console.error('Failed to update password:', error);
            helpers.showToast('비밀번호 변경 실패', 2000);
        }
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    new PasswordEdit();
});