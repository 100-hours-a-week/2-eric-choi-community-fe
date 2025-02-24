document.addEventListener('DOMContentLoaded', async function() {
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

    // 현재 로그인한 사용자 정보 가져오기
    let currentUser;
    try {
        const userResponse = await fetch('/data/users.json');
        const userData = await userResponse.json();
        currentUser = userData.data;
        
        const profileImg = document.querySelector('.profile-icon img');
        if (currentUser && currentUser.profileImage) {
            profileImg.src = currentUser.profileImage;
        }
    } catch (error) {
        console.error('Error fetching user:', error);
        window.location.href = '../index.html';
        return;
    }

    // 게시글 생성 API
    async function createPost(postData) {
        try {
            const response = await fetch('/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: 1,
                    title: postData.title,
                    content: postData.content,
                    image: postData.image
                })
            });
            return await response.json();
        } catch (error) {
            console.error('Error creating post:', error);
            return null;
        }
    }

    // 입력 필드 유효성 검사 함수
    function validateForm() {
        const isTitleValid = titleInput.value.trim() !== '';
        const isContentValid = contentInput.value.trim() !== '';
        const isFormValid = isTitleValid && isContentValid;
        
        submitButton.disabled = !isFormValid;
        if (isFormValid) {
            submitButton.classList.add('active');
            contentError.style.display = 'none';
        } else {
            submitButton.classList.remove('active');
            if (titleInput.dataset.touched === 'true' || contentInput.dataset.touched === 'true') {
                contentError.style.display = 'block';
            }
        }
    }

    // 입력 필드 이벤트
    titleInput.addEventListener('blur', function() {
        this.dataset.touched = 'true';
        validateForm();
    });

    contentInput.addEventListener('blur', function() {
        this.dataset.touched = 'true';
        validateForm();
    });

    titleInput.addEventListener('input', function() {
        if (this.dataset.touched === 'true') {
            validateForm();
        }
        if (this.value.length > 26) {
            this.value = this.value.substring(0, 26);
        }
    });

    contentInput.addEventListener('input', function() {
        if (this.dataset.touched === 'true') {
            validateForm();
        }
    });

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

    // 폼 제출 처리
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const title = titleInput.value.trim();
        const content = contentInput.value.trim();
        
        if (!title || !content) {
            contentError.style.display = 'block';
            return;
        }
        
        contentError.style.display = 'none';

        let imageData = null;
        if (selectedFile) {
            imageData = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = e => resolve(e.target.result);
                reader.readAsDataURL(selectedFile);
            });
        }

        const result = await createPost({
            title,
            content,
            image: imageData
        });

        if (result) {
            window.location.href = './posts.html';
        }
    });

    // 드롭다운 메뉴 관련
    profileIcon.addEventListener('click', function(e) {
        e.stopPropagation();
        dropdownMenu.classList.toggle('show');
    });
    
    document.addEventListener('click', function(e) {
        if (!profileIcon.contains(e.target)) {
            dropdownMenu.classList.remove('show');
        }
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            dropdownMenu.classList.remove('show');
        }
    });
});