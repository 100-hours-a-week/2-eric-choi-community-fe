import { Api } from '../../utils/api.js';
import { Header } from '../../components/Header/index.js';
import { validators } from '../../utils/validation.js';

class Login {
    constructor() {
        this.header = new Header({ 
            title: '아무 말 대잔치',
            showBackButton: false
        });
        this.init();
    }
    
    init() {
        this.setupElements();
        this.setupEventListeners();
    }
    
    setupElements() {
        this.form = document.getElementById('loginForm');
        this.emailInput = document.getElementById('email');
        this.passwordInput = document.getElementById('password');
        this.emailValidation = document.getElementById('email-validation');
        this.passwordValidation = document.getElementById('password-validation');
        this.submitBtn = document.getElementById('submitBtn');
    }
    
    setupEventListeners() {
        // 이메일 유효성 검사
        this.emailInput.addEventListener('input', this.validateEmail.bind(this));
        
        // 비밀번호 유효성 검사
        this.passwordInput.addEventListener('input', this.validatePassword.bind(this));
        
        // 폼 제출 처리
        this.form.addEventListener('submit', this.handleSubmit.bind(this));
    }
    
    validateEmail() {
        const email = this.emailInput.value;
        const errorMessage = validators.email(email);
        
        if (errorMessage) {
            this.emailValidation.classList.add('show-error');
            this.emailInput.classList.add('input-error');
            this.emailValidation.textContent = errorMessage;
        } else {
            this.emailValidation.classList.remove('show-error');
            this.emailInput.classList.remove('input-error');
        }
    }
    
    validatePassword() {
        const password = this.passwordInput.value;
        const errorMessage = validators.password(password);
        
        if (errorMessage) {
            this.passwordValidation.classList.add('show-error');
            this.passwordInput.classList.add('input-error');
            this.passwordValidation.textContent = errorMessage;
        } else {
            this.passwordValidation.classList.remove('show-error');
            this.passwordInput.classList.remove('input-error');
        }
    }
    
    // handleSubmit 메서드 수정
    async handleSubmit(e) {
        e.preventDefault();
        
        const email = this.emailInput.value;
        const password = this.passwordInput.value;

        // 유효성 검사 코드는 그대로 유지
        const isEmailValid = !this.emailInput.classList.contains('input-error');
        const isPasswordValid = !this.passwordInput.classList.contains('input-error');

        if (!isEmailValid || !isPasswordValid) {
            // 유효성 검사 실패 처리는 그대로 유지
            return;
        }

        try {
            // JWT 관련 정보 저장 초기화
            sessionStorage.removeItem('accessToken');
            sessionStorage.removeItem('userId');
            sessionStorage.removeItem('email');
            sessionStorage.removeItem('nickname');
            
            // credentials: 'include' 옵션으로 리프레시 토큰 쿠키 수신
            const result = await Api.post('/users/auth', { email, password });
            console.log(result)
            if (result?.message === "login_success") {
                // JWT 토큰 및 사용자 정보 저장
                console.log('로그인 성공하여 토큰 세팅 시작')
                sessionStorage.setItem('accessToken', result.data.accessToken);
                sessionStorage.setItem('userId', result.data.userId);
                sessionStorage.setItem('email', result.data.email);
                sessionStorage.setItem('nickname', result.data.nickname);
                console.log('토큰 세팅 완료')
                window.location.href = "posts.html";
            } else {
                alert('이메일 또는 비밀번호가 올바르지 않습니다.');
            }
        } catch (error) {
            console.error('Login failed:', error);
            alert('로그인 중 오류가 발생했습니다.');
        }
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    new Login();
});