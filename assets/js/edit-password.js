document.addEventListener('DOMContentLoaded', function() {
    displayProfileIcon();
    const form = document.getElementById('editForm');
    const passwordInput = document.getElementById('password');
    const passwordConfirmInput = document.getElementById('passwordConfirm');
    const submitButton = document.querySelector('.submit-button');
    const profileIcon = document.querySelector('.profile-icon');
    const dropdownMenu = document.querySelector('.dropdown-menu');

    // 초기 버튼 비활성화
    submitButton.disabled = true;
    submitButton.style.opacity = '0.5';

    // 유효성 상태 관리 객체
    let validationState = {
        password: false,
        passwordConfirm: false
    };

    // 버튼 활성화 상태 체크 함수
    function checkFormValidity() {
        const isAllValid = Object.values(validationState).every(value => value === true);
        submitButton.disabled = !isAllValid;
        submitButton.style.opacity = isAllValid ? '1' : '0.5';
    }

    function displayProfileIcon() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const profileImg = document.querySelector('.profile-icon img');
        
        if (currentUser && currentUser.profileImage) {
            profileImg.src = currentUser.profileImage;
        }
    }

    // 현재 로그인한 사용자 확인
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = '../index.html';
        return;
    }

    // 드롭다운 메뉴 토글
    profileIcon.addEventListener('click', function(e) {
        e.stopPropagation();
        dropdownMenu.classList.toggle('show');
    });

    // 외부 클릭시 드롭다운 메뉴 닫기
    document.addEventListener('click', function(e) {
        if (!profileIcon.contains(e.target)) {
            dropdownMenu.classList.remove('show');
        }
    });

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
            helperText.style.display = 'none';   /
            this.style.borderColor = '#111';
            validationState.password = true;
        }
        
 
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


    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const newPassword = passwordInput.value;


        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const updatedUsers = users.map(user => {
            if (user.email === currentUser.email) {
                return { ...user, password: newPassword };
            }
            return user;
        });

 
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        window.location.href = './posts.html';
    });

    // ESC 키로 드롭다운 메뉴 닫기
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            dropdownMenu.classList.remove('show');
        }
    });
});