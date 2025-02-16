document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('postForm');
    const titleInput = document.getElementById('title');
    const contentInput = document.getElementById('content');
    const uploadButton = document.querySelector('.upload-button');
    const fileName = document.querySelector('.file-name');
    const submitButton = document.querySelector('.submit-button');
    const contentError = document.getElementById('contentError');
    const profileIcon = document.querySelector('.profile-icon');
    const dropdownMenu = document.querySelector('.dropdown-menu');

    let selectedFile = null;

    // 입력 필드 유효성 검사 함수
    function validateForm() {
        const isTitleValid = titleInput.value.trim() !== '';
        const isContentValid = contentInput.value.trim() !== '';

        // 버튼 상태 업데이트
        const isFormValid = isTitleValid && isContentValid;
        submitButton.disabled = !isFormValid;
        
        if (isFormValid) {
            submitButton.classList.add('active');
            contentError.style.display = 'none';
        } else {
            submitButton.classList.remove('active');
            // 제목이나 내용이 비어있으면 에러 메시지 표시
            contentError.style.display = 'block';
        }
    }

    // 입력 필드 blur 이벤트 리스너 (포커스를 잃을 때)
    titleInput.addEventListener('blur', validateForm);
    contentInput.addEventListener('blur', validateForm);

    // 입력 필드 input 이벤트 리스너 (입력할 때마다)
    titleInput.addEventListener('input', validateForm);
    contentInput.addEventListener('input', validateForm);

    // 파일 업로드 처리
    uploadButton.addEventListener('click', function() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        
        input.onchange = function(e) {
            selectedFile = e.target.files[0];
            if (selectedFile) {
                fileName.textContent = selectedFile.name;
            }
        };
        
        input.click();
    });

    // 제목 글자수 제한
    titleInput.addEventListener('input', function() {
        if (this.value.length > 26) {
            this.value = this.value.substring(0, 26);
        }
    });

    // 폼 제출 처리
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const title = titleInput.value.trim();
        const content = contentInput.value.trim();
        const contentError = document.getElementById('contentError');
    
        // 현재 로그인한 사용자 정보 가져오기
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) {
            // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
            window.location.href = '../index.html';
            return;
        }
    
        // 제목이나 내용이 비어있는 경우
        if (!title || !content) {
            contentError.style.display = 'block';
            return;
        }
    
        // 유효성 검사 통과시 에러 메시지 숨김
        contentError.style.display = 'none';
    
        // 게시글 객체 생성
        const newPost = {
            id: Date.now(),
            title: title,
            content: content,
            author: currentUser.nickname,  // currentUser에서 닉네임 가져오기
            date: new Date().toLocaleString(),
            likes: 0,
            views: 0,
            comments: 0
        };
    
        // 이미지가 있는 경우
        if (selectedFile) {
            const reader = new FileReader();
            reader.onload = function(e) {
                newPost.image = e.target.result;
                savePost(newPost);
            };
            reader.readAsDataURL(selectedFile);
        } else {
            savePost(newPost);
        }
    });

    function savePost(post) {
        const posts = JSON.parse(localStorage.getItem('posts') || '[]');
        posts.unshift(post);
        localStorage.setItem('posts', JSON.stringify(posts));
        window.location.href = './posts.html';
    }

    profileIcon.addEventListener('click', function(e) {
        e.stopPropagation();
        dropdownMenu.classList.toggle('show');
    });
    
    // 다른 곳을 클릭하면 드롭다운 메뉴 닫기
    document.addEventListener('click', function(e) {
        if (!profileIcon.contains(e.target)) {
            dropdownMenu.classList.remove('show');
        }
    });
    
    // ESC 키를 누르면 드롭다운 메뉴 닫기
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            dropdownMenu.classList.remove('show');
        }
    });
});