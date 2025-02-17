document.addEventListener('DOMContentLoaded', function() {
    displayProfileIcon();
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

    // URL에서 게시글 ID 가져오기
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');

    // 기존 게시글 데이터 불러오기
    function loadPost() {
        if (!postId) return;
    
        const posts = JSON.parse(localStorage.getItem('posts') || '[]');
        const post = posts.find(p => p.id.toString() === postId);
        
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
    }

    function displayProfileIcon() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const profileImg = document.querySelector('.profile-icon img');
        
        if (currentUser && currentUser.profileImage) {
            profileImg.src = currentUser.profileImage;
        }
    }

    // 페이지 로드시 기존 게시글 데이터 불러오기
    loadPost();

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

    titleInput.addEventListener('blur', validateForm);
    contentInput.addEventListener('blur', validateForm);
    titleInput.addEventListener('input', validateForm);
    contentInput.addEventListener('input', validateForm);

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

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const title = titleInput.value.trim();
        const content = contentInput.value.trim();
    
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) {
            window.location.href = '../index.html';
            return;
        }
    
        if (!title || !content) {
            contentError.style.display = 'block';
            return;
        }
    
        contentError.style.display = 'none';

        // 게시글 수정 로직
        const posts = JSON.parse(localStorage.getItem('posts') || '[]');
        const postIndex = posts.findIndex(p => p.id.toString() === postId);

        if (postIndex !== -1) {

            if (selectedFile) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    posts[postIndex] = {
                        ...posts[postIndex],
                        title: title,
                        content: content,
                        image: e.target.result,
                        editDate: new Date().toLocaleString()
                    };
                    localStorage.setItem('posts', JSON.stringify(posts));
                    window.location.href = `./post-detail.html?id=${postId}`;
                };
                reader.readAsDataURL(selectedFile);
            } else {

                posts[postIndex] = {
                    ...posts[postIndex],
                    title: title,
                    content: content,
                    editDate: new Date().toLocaleString()
                };
                localStorage.setItem('posts', JSON.stringify(posts));
                window.location.href = `./post-detail.html?id=${postId}`;
            }
        }
    });

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