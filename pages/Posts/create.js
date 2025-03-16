import { Header } from '../../components/Header/index.js';
import { Api } from '../../utils/api.js';
import { validators } from '../../utils/validation.js';
import { helpers } from '../../utils/helpers.js';

class PostCreate {
    constructor() {
        this.header = new Header({ 
            title: '게시글 작성',
            showBackButton: true
        });
        
        this.currentUser = null;
        this.selectedFile = null;
        
        this.init();
    }
    
    async init() {
        await this.loadUserData();
        this.setupElements();
        this.setupEventListeners();
    }
    
    async loadUserData() {
        try {
            // 서버에서 사용자 정보 가져오기
            const response = await Api.get('/users/me');
            if (!response.data) {
                window.location.href = 'index.html';
                return;
            }
            
            this.currentUser = response.data;
        } catch (error) {
            console.error('Failed to load user data:', error);
            window.location.href = 'index.html';
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
        
        this.submitButton.disabled = true;
        this.submitButton.classList.remove('active');
    }
    
    setupEventListeners() {
        // 제목 입력 이벤트
        this.titleInput.addEventListener('blur', () => {
            this.titleInput.dataset.touched = 'true';
            this.validateForm();
        });
        
        this.titleInput.addEventListener('input', () => {
            if (this.titleInput.dataset.touched === 'true') {
                this.validateForm();
            }
            
            if (this.titleInput.value.length > 26) {
                this.titleInput.value = this.titleInput.value.substring(0, 26);
            }
        });
        
        // 내용 입력 이벤트
        this.contentInput.addEventListener('blur', () => {
            this.contentInput.dataset.touched = 'true';
            this.validateForm();
        });
        
        this.contentInput.addEventListener('input', () => {
            if (this.contentInput.dataset.touched === 'true') {
                this.validateForm();
            }
        });
        
        // 파일 업로드 이벤트
        this.uploadButton.addEventListener('click', this.handleFileUpload.bind(this));
        
        // 폼 제출 이벤트
        this.form.addEventListener('submit', this.handleSubmit.bind(this));
    }
    
    validateForm() {
        return validators.validatePostForm(
            this.titleInput, 
            this.contentInput, 
            this.submitButton, 
            this.contentError
        );
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
        
        if (!this.validateForm()) {
            return;
        }
        
        let imageData = null;
        if (this.selectedFile) {
            imageData = await helpers.readFile(this.selectedFile);
        }
        
        const requestData = {
            title,
            content,
            image: imageData
        };
        
        console.log('요청 데이터:', { 
            ...requestData, 
            image: imageData ? '(이미지 데이터 존재)' : '(이미지 없음)' 
        });
        
        try {
            // 세션 인증 사용하므로 이메일 파라미터 제거
            const result = await Api.post('/posts', requestData);
            
            if (result) {
                window.location.href = 'posts.html';
            }
        } catch (error) {
            console.error('Failed to create post:', error);
        }
    }
    
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    new PostCreate();
});