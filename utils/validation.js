// validation.js에 추가할 내용
export const validators = {
    email: (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) return '이메일을 입력해주세요.';
        if (!emailRegex.test(email)) return '올바른 이메일 형식이 아닙니다.';
        return null;
    },

    password: (password) => {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,20}$/;
        if (!password) return '비밀번호를 입력해주세요.';
        if (!passwordRegex.test(password)) {
            return '비밀번호는 8-20자의 영문 대/소문자, 숫자, 특수문자를 포함해야 합니다.';
        }
        return null;
    },

    passwordConfirm: (confirmation, password) => {
        if (!confirmation) return '비밀번호를 한번 더 입력해주세요.';
        if (confirmation !== password) return '비밀번호가 일치하지 않습니다.';
        return null;
    },

    nickname: (nickname) => {
        if (!nickname) return '닉네임을 입력해주세요.';
        if (nickname.length > 10) return '닉네임은 10자 이내로 입력해주세요.';
        return null;
    },

    title: (title) => {
        if (!title) return '제목을 입력해주세요.';
        if (title.length > 26) return '제목은 26자 이내로 입력해주세요.';
        return null;
    },

    content: (content) => {
        if (!content) return '내용을 입력해주세요.';
        return null;
    },
    
    // 폼 유효성 검사 - 게시글 작성/수정에 사용할 수 있는 유틸리티 함수
    validatePostForm: (titleInput, contentInput, submitButton, contentError) => {
        const isTitleValid = titleInput.value.trim() !== '';
        const isContentValid = contentInput.value.trim() !== '';
        const isFormValid = isTitleValid && isContentValid;
        
        submitButton.disabled = !isFormValid;
        
        if (!isFormValid && (titleInput.dataset.touched === 'true' || contentInput.dataset.touched === 'true')) {
            contentError.style.display = 'block';
        } else {
            contentError.style.display = 'none';
        }
        
        if (isFormValid) {
            submitButton.classList.add('active');
        } else {
            submitButton.classList.remove('active');
        }
        
        return isFormValid;
    }
};