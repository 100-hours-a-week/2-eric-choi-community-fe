document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('signupForm');
    const profileUpload = document.querySelector('.profile-circle');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const passwordConfirmInput = document.getElementById('passwordConfirm');
    const nicknameInput = document.getElementById('nickname');
    const submitButton = document.querySelector('.signup-button');
    
    // 초기 버튼 비활성화
    submitButton.disabled = true;
    submitButton.style.backgroundColor = '#ACA0EB';

    // 유효성 상태 관리 객체
    let validationState = {
        profile: false,
        email: false,
        password: false,
        passwordConfirm: false,
        nickname: false
    };

    // 버튼 활성화 상태 체크 함수
    function checkFormValidity() {
        const isAllValid = Object.values(validationState).every(value => value === true);
        submitButton.disabled = !isAllValid;
        submitButton.style.backgroundColor = isAllValid ? '#7F6AEE' : '#ACA0EB';
    }

    // 프로필 이미지 업로드
    let profileImageUrl = null;
    const profileHelperText = profileUpload.parentElement.querySelector('.helper-text');
    profileHelperText.textContent = '*프로필 사진을 업로드해주세요.';
    profileHelperText.style.display = 'block';

    profileUpload.addEventListener('click', function() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        
        input.onchange = function(e) {
            const file = e.target.files[0];
            if (file) {
                if (!file.type.startsWith('image/')) {
                    profileHelperText.textContent = '*이미지 파일만 업로드 가능합니다.';
                    profileHelperText.style.display = 'block';
                    validationState.profile = false;
                    return;
                }

                const reader = new FileReader();
                reader.onload = function(e) {
                    profileUpload.style.backgroundImage = `url(${e.target.result})`;
                    profileUpload.innerHTML = '';
                    profileImageUrl = e.target.result;
                    profileHelperText.style.display = 'none';
                    validationState.profile = true;
                    checkFormValidity();
                }
                reader.readAsDataURL(file);
            }
        }
        input.click();
    });

    // 이메일 유효성 검사
    emailInput.addEventListener('input', function() {
        const email = this.value;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const helperText = this.parentElement.querySelector('.helper-text');
        
        if (!email) {
            helperText.textContent = '*이메일을 입력해주세요.';
            helperText.style.display = 'block';
            this.style.borderColor = '#ff0000';
            validationState.email = false;
        } else if (!emailRegex.test(email)) {
            helperText.textContent = '*올바른 이메일 주소 형식을 입력해주세요. (예: example@example.com)';
            helperText.style.display = 'block';
            this.style.borderColor = '#ff0000';
            validationState.email = false;
        } else {
            helperText.style.display = 'none';
            this.style.borderColor = '#111';
            validationState.email = true;
        }
        checkFormValidity();
    });

    // 비밀번호 유효성 검사
    passwordInput.addEventListener('input', function() {
        const password = this.value;
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,20}$/;
        const helperText = this.parentElement.querySelector('.helper-text');
        
        if (!password) {
            helperText.textContent = '*비밀번호를 입력해주세요';
            helperText.style.display = 'block';
            this.style.borderColor = '#ff0000';
            validationState.password = false;
        } else if (!passwordRegex.test(password)) {
            helperText.textContent = '*비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.';
            helperText.style.display = 'block';
            this.style.borderColor = '#ff0000';
            validationState.password = false;
        } else {
            helperText.style.display = 'none';
            this.style.borderColor = '#111';
            validationState.password = true;
        }
        
        // 비밀번호 확인 필드 재검사
        if (passwordConfirmInput.value) {
            passwordConfirmInput.dispatchEvent(new Event('input'));
        }
        checkFormValidity();
    });

    // 비밀번호 확인 검사
    passwordConfirmInput.addEventListener('input', function() {
        const helperText = this.parentElement.querySelector('.helper-text');
        
        if (!this.value) {
            helperText.textContent = '*비밀번호를 한번 더 입력해주세요';
            helperText.style.display = 'block';
            this.style.borderColor = '#ff0000';
            validationState.passwordConfirm = false;
        } else if (this.value !== passwordInput.value) {
            helperText.textContent = '*비밀번호가 다릅니다.';
            helperText.style.display = 'block';
            this.style.borderColor = '#ff0000';
            validationState.passwordConfirm = false;
        } else {
            helperText.style.display = 'none';
            this.style.borderColor = '#111';
            validationState.passwordConfirm = true;
        }
        checkFormValidity();
    });

    // 닉네임 유효성 검사
    nicknameInput.addEventListener('input', function() {
        const nickname = this.value;
        const helperText = this.parentElement.querySelector('.helper-text');
        
        if (!nickname) {
            helperText.textContent = '*닉네임을 입력해주세요.';
            helperText.style.display = 'block';
            this.style.borderColor = '#ff0000';
            validationState.nickname = false;
        } else if (nickname.length > 10) {
            helperText.textContent = '*닉네임은 최대 10자까지 작성 가능합니다.';
            helperText.style.display = 'block';
            this.style.borderColor = '#ff0000';
            validationState.nickname = false;
        } else {
            helperText.style.display = 'none';
            this.style.borderColor = '#111';
            validationState.nickname = true;
        }
        checkFormValidity();
    });

    // 폼 제출 처리
    form.addEventListener('submit', function(e) {
        e.preventDefault();
    
        // 이메일 중복 체크
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        if (users.some(user => user.email === emailInput.value)) {
            const helperText = emailInput.parentElement.querySelector('.helper-text');
            helperText.textContent = '*이미 사용 중인 이메일입니다.';
            helperText.style.display = 'block';
            emailInput.style.borderColor = '#ff0000';
            return;
        }
    
        // 닉네임 중복 체크
        if (users.some(user => user.nickname === nicknameInput.value)) {
            const helperText = nicknameInput.parentElement.querySelector('.helper-text');
            helperText.textContent = '*이미 사용 중인 닉네임입니다.';
            helperText.style.display = 'block';
            nicknameInput.style.borderColor = '#ff0000';
            return;
        }
    
        // 새로운 사용자 객체 생성
        const newUser = {
            email: emailInput.value,
            password: passwordInput.value, // 실제로는 비밀번호 해싱이 필요하지만 예시이므로 생략
            nickname: nicknameInput.value,
            profileImage: profileImageUrl
        };
    
        // 사용자 추가
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
    
        window.location.href = '../index.html';
    });
});