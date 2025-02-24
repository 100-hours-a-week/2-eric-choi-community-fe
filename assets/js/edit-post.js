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
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');

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

    // 게시글 상세 정보 조회
    async function fetchPostDetail() {
        try {
            const response = await fetch('/data/posts.json');
            const result = await response.json();
            const post = result.data.find(p => p.id === parseInt(postId));
            
            if (post) {
                titleInput.value = post.title;
                contentInput.value = post.content;
                
                if (post.image) {
                    fileName.textContent = '기존 이미지가 있습니다.';
                }
        
                submitButton.disabled = false;
                submitButton.classList.add('active');
                contentError.style.display = 'none'; 
                submitButton.textContent = '수정하기';
            }
        } catch (error) {
            console.error('Error fetching post:', error);
        }
    }

    // 게시글 수정 API
    async function updatePost(postData) {
        try {
            const response = await fetch(`/posts/${postId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: currentUser.id,
                    title: postData.title,
                    content: postData.content,
                    image: postData.image
                })
            });
            return true;
        } catch (error) {
            console.error('Error updating post:', error);
            return false;
        }
    }

    // 입력 필드 유효성 검사 함수
    function validateForm() {
        const isTitleValid = titleInput.value.trim() !== '';
        const isContentValid = contentInput.value.trim() !== '';
        const isFormValid = isTitleValid && isContentValid;
    
        submitButton.disabled = !isFormValid;
        
        if (titleInput.value.trim() === '' || contentInput.value.trim() === '') {
            if (titleInput.dataset.touched === 'true' || contentInput.dataset.touched === 'true') {
                contentError.style.display = 'block';
            }
        } else {
            contentError.style.display = 'none';
        }
    
        if (isFormValid) {
            submitButton.classList.add('active');
        } else {
            submitButton.classList.remove('active');
        }
    }

    // 이벤트 리스너들
    titleInput.addEventListener('blur', function() {
        this.dataset.touched = 'true';
        validateForm();
    });

    contentInput.addEventListener('blur', function() {
        this.dataset.touched = 'true';
        validateForm();
    });

    titleInput.addEventListener('input', function() {
        this.dataset.touched = 'true';
        if (this.value.length > 26) {
            this.value = this.value.substring(0, 26);
        }
        validateForm();
    });

    contentInput.addEventListener('input', function() {
        this.dataset.touched = 'true';
        validateForm();
    });

    // 파일 업로드
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

    // 폼 제출
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

        const success = await updatePost({
            title,
            content,
            image: imageData
        });

        if (success) {
            window.location.href = `./post-detail.html?id=${postId}`;
        }
    });

    // 드롭다운 메뉴
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

    // 초기 데이터 로드
    await fetchPostDetail();
});