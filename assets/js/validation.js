document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const emailValidation = document.getElementById('email-validation');
    const passwordValidation = document.getElementById('password-validation');
    const submitBtn = document.getElementById('submitBtn');

    // 로그인 API
    async function login(email, password) {
        try {
            const response = await fetch('/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });
            return await response.json();
        } catch (error) {
            console.error('Error logging in:', error);
            return null;
        }
    }

    function updateDimensions(input) {
        const dimensions = input.parentElement.querySelector('.input-dimensions');
        if (dimensions) {
            const width = input.offsetWidth;
            const height = input.offsetHeight;
            dimensions.textContent = `${width} × ${height}`;
        }
    }

    // 초기 치수 표시
    updateDimensions(emailInput);
    updateDimensions(passwordInput);

    // 이메일 유효성 검사
    emailInput.addEventListener('input', function() {
        const email = this.value;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!email || !emailRegex.test(email)) {
            emailValidation.classList.add('show-error');
            this.classList.add('input-error');
        } else {
            emailValidation.classList.remove('show-error');
            this.classList.remove('input-error');
        }
    });

    // 비밀번호 유효성 검사
    passwordInput.addEventListener('input', function() {
        const password = this.value;
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,20}$/;
        
        if (!password || !passwordRegex.test(password)) {
            passwordValidation.classList.add('show-error');
            this.classList.add('input-error');
        } else {
            passwordValidation.classList.remove('show-error');
            this.classList.remove('input-error');
        }
    });

    // 폼 제출 처리
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = emailInput.value;
        const password = passwordInput.value;

        // 유효성 검사
        const isEmailValid = !emailInput.classList.contains('input-error');
        const isPasswordValid = !passwordInput.classList.contains('input-error');

        if (!isEmailValid || !isPasswordValid) {
            if (!isEmailValid) {
                emailValidation.classList.add('show-error');
                emailInput.classList.add('input-error');
            }
            if (!isPasswordValid) {
                passwordValidation.classList.add('show-error');
                passwordInput.classList.add('input-error');
            }
            return;
        }

        const result = await login(email, password);
        
        if (result?.message === "login_success") {
            localStorage.setItem('currentUser', JSON.stringify(result.data));
            window.location.href = "./pages/posts.html";
        } else {
            alert('이메일 또는 비밀번호가 올바르지 않습니다.');
        }
    });

    // 입력 필드 포커스 처리
    [emailInput, passwordInput].forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.querySelector('.helper-text')?.classList.add('show-error');
        });

        input.addEventListener('blur', function() {
            if (!this.value) {
                this.parentElement.querySelector('.helper-text')?.classList.remove('show-error');
            }
        });
    });
});