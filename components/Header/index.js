import { Api } from '../../utils/api.js';

export class Header {
    constructor(options = {}) {
        const { title, showBackButton = false, container = document.body } = options;
        this.element = document.createElement('header');
        this.element.className = 'header';
        
        this.renderHeader(title, showBackButton, container);
    }

    async renderHeader(title, showBackButton, container) {
        await this.render(title, showBackButton);
        container.prepend(this.element);
        this.setupEventListeners();
    }

    async render(title, showBackButton) {
        // 로그인 여부 확인 - 인증 오류 예상 및 처리
        const { currentUser, isLoggedIn } = await this.checkLoginStatus();
        
        this.element.innerHTML = `
            ${showBackButton ? `
                <button class="back-button">
                    <span class="back-arrow">←</span>
                </button>
            ` : ''}
            <h1 class="title">${title || '아무 말 대잔치'}</h1>
            <div class="profile-icon">
                <img src="${isLoggedIn && currentUser?.profileImage ? currentUser.profileImage : '../assets/images/default-profile.png'}" 
                     alt="프로필" class="profile-img">
                ${isLoggedIn ? `
                    <div class="dropdown-menu">
                        <a href="../html/edit-profile.html" class="dropdown-item">회원정보 수정</a>
                        <a href="../html/edit-password.html" class="dropdown-item">비밀번호 수정</a>
                        <a href="#" class="dropdown-item logout-btn">로그아웃</a>
                    </div>
                ` : ''}
            </div>
        `;
    }

    // checkLoginStatus 메서드 수정
    async checkLoginStatus() {
        // 로그인이 필요하지 않은 페이지 확인
        const isAuthPage = window.location.href.includes('index.html') || 
                        window.location.href.includes('signup.html') || 
                        window.location.pathname === '/' || 
                        window.location.pathname.endsWith('/');
        
        // 로그인이 필요하지 않은 페이지에서는 확인하지 않음
        if (isAuthPage) {
            return { currentUser: null, isLoggedIn: false };
        }
        
        // 메모리에 토큰이 있는지 확인
        const token = Api.getToken();
        if (!token) {
            return { currentUser: null, isLoggedIn: false };
        }
        
        try {
            const response = await Api.get('/users/me');
            if (response && response.data) {
                return { currentUser: response.data, isLoggedIn: true };
            }
        } catch (error) {
            // 인증 오류는 예상된 오류이므로 조용히 처리
            console.log('사용자 정보 가져오기 실패:', error);
            // 토큰이 유효하지 않으면 메모리 정리
            Api.setToken(null);
        }
        
        return { currentUser: null, isLoggedIn: false };
    }

    setupEventListeners() {
        const profileIcon = this.element.querySelector('.profile-icon');
        const dropdownMenu = this.element.querySelector('.dropdown-menu');
        const backButton = this.element.querySelector('.back-button');
        const logoutBtn = this.element.querySelector('.logout-btn');

        // 드롭다운 메뉴가 있을 때만 클릭 이벤트 추가
        if (profileIcon && dropdownMenu) {
            profileIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdownMenu.classList.toggle('show');
            });
            
            document.addEventListener('click', (e) => {
                if (!profileIcon.contains(e.target)) {
                    dropdownMenu.classList.remove('show');
                }
            });
        }

        if (backButton) {
            backButton.addEventListener('click', () => {
                if (window.location.href.includes('post-detail.html')) {
                    window.location.href = 'posts.html';
                } else {
                    window.history.back();
                }
            });
        }

        // 로그아웃 버튼이 있을 때만 이벤트 추가
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                try {
                    await Api.post('/users/logout');
                } catch (error) {
                    console.error('로그아웃 요청 실패:', error);
                } finally {
                    // 메모리에서 액세스 토큰 제거
                    Api.setToken(null);
                    window.location.href = '../html/index.html';
                }
            });
        }
    }
}
