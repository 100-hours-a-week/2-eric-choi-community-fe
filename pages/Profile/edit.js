import { Header } from '../../components/Header/index.js';
import { Modal } from '../../components/Modal/index.js';
import { Api } from '../../utils/api.js';
import { validators } from '../../utils/validation.js';
import { helpers } from '../../utils/helpers.js';

class ProfileEdit {
    constructor() {
        this.header = new Header({ 
            title: '회원정보 수정',
            showBackButton: true
        });
        
        this.currentUser = null;
        this.selectedFile = null; // 실제 File 객체로 저장
        
        this.init();
    }
    
    async init() {
        await this.loadUserData();
        this.setupElements();
        this.setupEventListeners();
    }
    
    async loadUserData() {
        // 로컬 스토리지에 토큰이 없으면 로그인 페이지로 리다이렉트
        const token = localStorage.getItem('accessToken');
        if (!token) {
            window.location.href = 'index.html';
            return;
        }
        
        try {
            // 서버에서 현재 로그인된 사용자 정보 조회
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
        this.form = document.getElementById('editForm');
        this.emailInput = document.getElementById('email');
        this.nicknameInput = document.getElementById('nickname');
        this.nicknameError = document.getElementById('nicknameError');
        this.profileImage = document.getElementById('profileImage');
        this.profileImageContainer = document.querySelector('.profile-image');
        this.deleteAccountBtn = document.querySelector('.delete-account');
        
        // 폼에 현재 사용자 정보 설정
        this.emailInput.value = this.currentUser.email;
        this.nicknameInput.value = this.currentUser.nickname;
        
        // 프로필 이미지 설정
        if (this.currentUser.profileImage) {
            this.profileImage.src = this.currentUser.profileImage;
        }
    }
    
    setupEventListeners() {
        // 이미지 업로드 처리
        this.profileImageContainer.addEventListener('click', this.handleImageUpload.bind(this));
        
        // 닉네임 입력 이벤트
        this.nicknameInput.addEventListener('input', () => {
            this.nicknameError.style.display = 'none';
        });
        
        // 폼 제출 처리
        this.form.addEventListener('submit', this.handleSubmit.bind(this));
        
        // 회원탈퇴 처리
        this.deleteAccountBtn.addEventListener('click', this.handleDeleteAccount.bind(this));
    }
    
    handleImageUpload() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
                try {
                    // 미리보기를 위한 DataURL 생성
                    const dataUrl = await helpers.readFile(file);
                    this.profileImage.src = dataUrl;
                    // 실제 파일 객체 저장
                    this.selectedFile = file;
                } catch (error) {
                    console.error('Error reading file:', error);
                }
            }
        };
        
        input.click();
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        const nickname = this.nicknameInput.value.trim();
        const error = validators.nickname(nickname);
        
        if (error) {
            this.nicknameError.textContent = error;
            this.nicknameError.style.display = 'block';
            return;
        }
        
        try {
            // FormData 객체 생성
            const formData = new FormData();
            
            // JSON 데이터 준비
            const userInfo = {
                userId: this.currentUser.id,
                nickname: nickname
            };
            
            // FormData에 JSON 추가
            formData.append('userInfo', new Blob([JSON.stringify(userInfo)], {
                type: 'application/json'
            }));
            
            // 이미지 파일 추가 (선택된 경우에만)
            if (this.selectedFile) {
                formData.append('profileImage', this.selectedFile);
            }
            
            // 서버에 PATCH 요청 보내기
            const success = await Api.patchForm(`/users/${this.currentUser.id}`, formData);

            
            if (success) {
                helpers.showToast('수정 완료');
                setTimeout(() => {
                    window.location.href = 'posts.html';
                }, 2000);
            }
        } catch (error) {
            console.error('Failed to update profile:', error);
            helpers.showToast('수정 실패', 2000);
        }
        }
    
    async handleDeleteAccount() {
        const modal = new Modal({
            title: '회원탈퇴 하시겠습니까?',
            message: '작성된 게시글과 댓글은 삭제됩니다.'
        });
        
        document.body.appendChild(modal.element);
        
        modal.onConfirm(async () => {
            try {
                const success = await Api.delete(`/users/${this.currentUser.id}`, {
                    userId: this.currentUser.id
                });
                
                if (success) {
                    window.location.href = 'index.html';
                }
            } catch (error) {
                console.error('Failed to delete account:', error);
            }
        });
        
        modal.onCancel(() => {
            // 취소 시 아무 작업 없음
        });
        
        modal.show();
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    new ProfileEdit();
});