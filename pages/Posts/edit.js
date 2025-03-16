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
        this.email = new URLSearchParams(window.location.search).get('email');
        this.currentUser = null;
        this.post = null;
        this.selectedFile = null;
        
        this.init();
    }
    
    async init() {
        if (!this.postId || !this.email) {
            alert('게시글 정보가 올바르지 않습니다.');
            window.location.href = 'posts.html';
            return;
        }

        await this.loadUserData();
        this.setupElements();
        this.setupEventListeners();
        await this.loadPostData();
    }
    
    async loadUserData() {
        try {
            // localStorage에서 사용자 정보 가져오기
            const userJson = localStorage.getItem('currentUser');
            if (!userJson) {
                window.location.href = 'index.html';
                return;
            }
            
            this.currentUser = JSON.parse(userJson);
            
            // 이메일 파라미터와 로컬 저장소의 이메일이 일치하는지 확인
            if (this.currentUser.email !== this.email) {
                console.error('인증 정보 불일치');
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
            // 이메일 파라미터를 포함하여 게시글 데이터 로드
            const response = await Api.get(`/posts/${this.postId}?email=${encodeURIComponent(this.email)}`);
            this.post = response.data;
            
            if (!this.post) {
                alert('게시글을 찾을 수 없습니다.');
                window.location.href = 'posts.html';
                return;
            }
            
            // 작성자와 현재 사용자가 같은지 확인
            if (this.post.author.nickname !== this.currentUser.nickname) {
                alert('게시글 수정 권한이 없습니다.');
                window.location.href = `post-detail.html?id=${this.postId}`;
                return;
            }
            
            // 폼에 기존 데이터 채우기
            this.titleInput.value = this.post.title;
            this.contentInput.value = this.post.content;
            
            if (this.post.image) {
                this.fileName.textContent = '기존 이미지가 있습니다';
            }
            
            // 폼 유효성 검사
            this.validateForm();
        } catch (error) {
            console.error('Failed to load post data:', error);
            alert('게시글을 불러오는 중 오류가 발생했습니다.');
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
        } else if (this.post.image) {
            // 기존 이미지 유지
            imageData = this.post.image;
        }
        
        try {
            // PATCH 요청으로 게시글 수정
            const emailParam = `?email=${encodeURIComponent(this.email)}`;
            const result = await Api.patch(`/posts/${this.postId}${emailParam}`, {
                title,
                content,
                image: imageData
            });
            
            if (result) {
                alert('게시글이 수정되었습니다.');
                window.location.href = `post-detail.html?id=${this.postId}`;
            }
        } catch (error) {
            console.error('Failed to update post:', error);
            alert('게시글 수정 중 오류가 발생했습니다.');
        }
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    new PostEdit();
});