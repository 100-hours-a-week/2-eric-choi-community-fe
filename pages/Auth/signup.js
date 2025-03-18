import { Header } from '../../components/Header/index.js';
import { validators } from '../../utils/validation.js';
import { Api } from '../../utils/api.js';

document.addEventListener('DOMContentLoaded', function() {
    // Header 컴포넌트 초기화
    const headerContainer = document.getElementById('header-container');
    const header = new Header({ 
        title: '아무 말 대잔치',
        showBackButton: true,
        container: headerContainer
    });
    headerContainer.innerHTML = '';
    headerContainer.appendChild(header.element);

    // 회원가입 폼 관련 요소들
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
    let profileImageFile = null; // 파일 객체를 직접 저장
    // helperText -> validationMessage
    const profileValidationMessage = profileUpload.parentElement.querySelector('.validation-message');
    profileValidationMessage.textContent = '*프로필 사진을 업로드해주세요.';
    profileValidationMessage.style.display = 'block'; // 안내 문구용

    profileUpload.addEventListener('click', function() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        
        input.onchange = function(e) {
            const file = e.target.files[0];
            if (file) {
                // 이미지 파일인지 검사
                if (!file.type.startsWith('image/')) {
                    profileValidationMessage.textContent = '*이미지 파일만 업로드 가능합니다.';
                    profileValidationMessage.classList.add('show-error');
                    validationState.profile = false;
                    checkFormValidity();
                    return;
                }

                // 이미지 파일 읽기
                const reader = new FileReader();
                reader.onload = function(e) {
                    profileUpload.style.backgroundImage = `url(${e.target.result})`;
                    profileUpload.innerHTML = '';
                    profileImageFile = file; // 파일 객체를 저장

                    // 에러 해제
                    profileValidationMessage.textContent = '';
                    profileValidationMessage.classList.remove('show-error');
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
        // applyValidation 함수는 내부에서 show-error, input-error 처리를 해줄 수도 있음
        validationState.email = validators.applyValidation(this, validators.email);
        checkFormValidity();
    });

    // 비밀번호 유효성 검사
    passwordInput.addEventListener('input', function() {
        const validationMessage = this.parentElement.querySelector('.validation-message');
        const errorMessage = validators.password(this.value);
        
        if (errorMessage) {
            validationMessage.textContent = errorMessage;
            validationMessage.classList.add('show-error');
            this.classList.add('input-error');
            validationState.password = false;
        } else {
            validationMessage.textContent = '';
            validationMessage.classList.remove('show-error');
            this.classList.remove('input-error');
            validationState.password = true;
        }
        
        // 비밀번호 확인 필드 재검사 (비밀번호가 바뀌면 비번확인도 다시 체크)
        if (passwordConfirmInput.value) {
            passwordConfirmInput.dispatchEvent(new Event('input'));
        }
        checkFormValidity();
    });

    // 비밀번호 확인 검사
    passwordConfirmInput.addEventListener('input', function() {
        const validationMessage = this.parentElement.querySelector('.validation-message');
        const errorMessage = validators.passwordConfirm(this.value, passwordInput.value);
        
        if (errorMessage) {
            validationMessage.textContent = errorMessage;
            validationMessage.classList.add('show-error');
            this.classList.add('input-error');
            validationState.passwordConfirm = false;
        } else {
            validationMessage.textContent = '';
            validationMessage.classList.remove('show-error');
            this.classList.remove('input-error');
            validationState.passwordConfirm = true;
        }
        checkFormValidity();
    });

    // 닉네임 유효성 검사
    nicknameInput.addEventListener('input', function() {
        const validationMessage = this.parentElement.querySelector('.validation-message');
        const errorMessage = validators.nickname(this.value);
        
        if (errorMessage) {
            validationMessage.textContent = errorMessage;
            validationMessage.classList.add('show-error');
            this.classList.add('input-error');
            validationState.nickname = false;
        } else {
            validationMessage.textContent = '';
            validationMessage.classList.remove('show-error');
            this.classList.remove('input-error');
            validationState.nickname = true;
        }
        checkFormValidity();
    });

    // 폼 제출 처리
    // 폼 제출 처리
form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    try {
        // FormData 객체 생성
        const formData = new FormData();
        
        // JSON 데이터 생성
        const userInfo = {
            email: emailInput.value,
            password: passwordInput.value,
            nickname: nicknameInput.value
        };
        
        // FormData에 JSON 데이터 추가
        formData.append('userInfo', new Blob([JSON.stringify(userInfo)], {
            type: 'application/json'
        }));
        
        // 이미지 파일 추가
        if (profileImageFile) {
            formData.append('profileImage', profileImageFile);
        }
        
        // 수정된 API 클래스 사용
        const response = await Api.postForm('/users/new', formData);
        
        if (response && response.message === 'register_success') {
            console.log('회원가입 성공:', response);
            window.location.href = 'http://localhost:5502/html/index.html';
        } else {
            console.error('회원가입 실패:', response);
            handleSignupError(response);
        }
    } catch (error) {
        console.error('회원가입 요청 중 오류 발생:', error);
        alert('서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
});
    
    // 회원가입 오류 처리 함수
    function handleSignupError(response) {
        if (response.message === 'email_already_exists') {
            const validationMessage = emailInput.parentElement.querySelector('.validation-message');
            validationMessage.textContent = '*이미 사용 중인 이메일입니다.';
            validationMessage.classList.add('show-error');
            emailInput.classList.add('input-error');
        } else if (response.message === 'nickname_already_exists') {
            const validationMessage = nicknameInput.parentElement.querySelector('.validation-message');
            validationMessage.textContent = '*이미 사용 중인 닉네임입니다.';
            validationMessage.classList.add('show-error');
            nicknameInput.classList.add('input-error');
        } else {
            alert('회원가입 중 오류가 발생했습니다: ' + (response.message || '알 수 없는 오류'));
        }
    }
});