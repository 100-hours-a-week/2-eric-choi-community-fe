import { Header } from '../../components/Header/index.js';
import { Api } from '../../utils/api.js';
import { validators } from '../../utils/validation.js';
import { helpers } from '../../utils/helpers.js';

class PostEdit {
    constructor() {
        this.header = new Header({ 
            title: '게시글 수정',
            showBackButton: true
        });
        
        this.postId = new URLSearchParams(window.location.search).get('id');
        this.currentUser = null;
        this.selectedFile = null;
        this.post = null;
        
        this.init();
    }
    
    async init() {
        if (!this.postId) {
            window.location.href = 'posts.html';
            return;
        }
        
        await this.loadUserData();
        await this.loadPostData();
        this.setupElements();
        this.setupEventListeners();
    }
    
    async loadUserData() {
        try {
            const userData = await Api.get('/users');
            this.currentUser = userData.data;
            
            if (!this.currentUser) {
                window.location.href = 'index.html';
                return;
            }
        } catch (error) {
            console.error('Failed to load user data:', error);
            window.location.href = 'index.html';
        }
    }
    
    async loadPostData() {
        try {
            const response = await Api.get(`/posts/${this.postId}`);
            this.post = response.data;
            
            if (!this.post) {
                window.location.href = 'posts.html';
                return;
            }
            
            // 작성자만 수정 가능
            if (this.post.author.id !== this.currentUser.id) {
                window.location.href = `post-detail.html?id=${this.postId}`;
                return;
            }
        } catch (error) {
            console.error('Failed to load post:', error);
            window.location.href = 'posts.html';
        }
    }
    
    setupElements() {
        this.form = document.getElementById('postForm');
        this.titleInput = document.getElementById('title');
        this.contentInput = document.getElementById('content');
        this.uploadButton = document.querySelector('.upload-button');
        this.fileName = document.querySelector('.file-name');
        this.submitButton = document.querySelector('.submit-button');
        this.contentError = document.getElementById('contentError');
        
        // 폼에 게시글 데이터 설정
        this.titleInput.value = this.post.title;
        this.contentInput.value = this.post.content;
        
        if (this.post.image) {
            this.fileName.textContent = '기존 이미지가 있습니다.';
        }
        
        this.submitButton.disabled = false;
        this.submitButton.classList.add('active');
        this.contentError.style.display = 'none';
    }
    
    setupEventListeners() {
        // 제목 입력 이벤트
        this.titleInput.addEventListener('blur', () => {
            this.titleInput.dataset.touched = 'true';
            this.validateForm();
        });
        
        this.titleInput.addEventListener('input', () => {
            this.titleInput.dataset.touched = 'true';
            
            if (this.titleInput.value.length > 26) {
                this.titleInput.value = this.titleInput.value.substring(0, 26);
            }
            
            this.validateForm();
        });
        
        // 내용 입력 이벤트
        this.contentInput.addEventListener('blur', () => {
            this.contentInput.dataset.touched = 'true';
            this.validateForm();
        });
        
        this.contentInput.addEventListener('input', () => {
            this.contentInput.dataset.touched = 'true';
            this.validateForm();
        });
        
        // 파일 업로드 이벤트
        this.uploadButton.addEventListener('click', this.handleFileUpload.bind(this));
        
        // 폼 제출 이벤트
        this.form.addEventListener('submit', this.handleSubmit.bind(this));
    }
    
    validateForm() {
        const isTitleValid = this.titleInput.value.trim() !== '';
        const isContentValid = this.contentInput.value.trim() !== '';
        const isFormValid = isTitleValid && isContentValid;
        
        this.submitButton.disabled = !isFormValid;
        
        if (this.titleInput.value.trim() === '' || this.contentInput.value.trim() === '') {
            if (this.titleInput.dataset.touched === 'true' || this.contentInput.dataset.touched === 'true') {
                this.contentError.style.display = 'block';
            }
        } else {
            this.contentError.style.display = 'none';
        }
        
        if (isFormValid) {
            this.submitButton.classList.add('active');
        } else {
            this.submitButton.classList.remove('active');
        }
    }
    
    handleFileUpload() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        
        input.onchange = (e) => {
            this.selectedFile = e.target.files[0];
            if (this.selectedFile) {
                this.fileName.textContent = this.selectedFile.name;
            }
        };
        
        input.click();
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        const title = this.titleInput.value.trim();
        const content = this.contentInput.value.trim();
        
        if (!title || !content) {
            this.contentError.style.display = 'block';
            return;
        }
        
        this.contentError.style.display = 'none';
        
        let imageData = null;
        if (this.selectedFile) {
            imageData = await helpers.readFile(this.selectedFile);
        }
        
        try {
            const success = await Api.patch(`/posts/${this.postId}`, {
                userId: this.currentUser.id,
                title,
                content,
                image: imageData || this.post.image
            });
            
            if (success) {
                window.location.href = `post-detail.html?id=${this.postId}`;
            }
        } catch (error) {
            console.error('Failed to update post:', error);
        }
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    new PostEdit();
});