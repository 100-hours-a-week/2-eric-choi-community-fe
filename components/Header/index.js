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
        try {
            const currentUser = await this.getCurrentUser();
            const isLoggedIn = !!currentUser && !!currentUser.id; // 로그인 상태 확인
            
            this.element.innerHTML = `
                ${showBackButton ? `
                    <button class="back-button">
                        <span class="back-arrow">←</span>
                    </button>
                ` : ''}
                <h1 class="title">${title || '아무 말 대잔치'}</h1>
                <div class="profile-icon">
                    <img src="${currentUser?.profileImage || '../assets/images/default-profile.png'}" 
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
        } catch (error) {
            console.error('헤더 렌더링 오류:', error);
           
            this.element.innerHTML = `
                ${showBackButton ? `
                    <button class="back-button">
                        <span class="back-arrow">←</span>
                    </button>
                ` : ''}
                <h1 class="title">${title || '아무 말 대잔치'}</h1>
                <div class="profile-icon">
                    <img src="../assets/images/default-profile.png" alt="프로필" class="profile-img">
                </div>
            `;
        }
    }

    async getCurrentUser() {
        try {
            const userJson = localStorage.getItem('currentUser');
            if (userJson) {
                return JSON.parse(userJson);
            }
            
            // 로그인하지 않은 상태
            return null;
        } catch (error) {
            console.error('Failed to fetch user:', error);
            return null;
        }
    }

    setupEventListeners() {
        console.log('이벤트 리스너 설정 시작');
        
        const profileIcon = this.element.querySelector('.profile-icon');
        const dropdownMenu = this.element.querySelector('.dropdown-menu');
        const backButton = this.element.querySelector('.back-button');
        const logoutBtn = this.element.querySelector('.logout-btn');

        // 로그인 상태일 때만 프로필 이미지 클릭 이벤트 추가
        if (profileIcon && dropdownMenu) {
            console.log('프로필 아이콘 이벤트 설정');
            profileIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                console.log('프로필 아이콘 클릭됨');
                dropdownMenu.classList.toggle('show');
            });
            
            // 문서 클릭 시 드롭다운 닫기
            document.addEventListener('click', (e) => {
                if (!profileIcon.contains(e.target)) {
                    dropdownMenu.classList.remove('show');
                }
            });
        }

        if (backButton) {
            console.log('뒤로가기 버튼 이벤트 설정');
            backButton.addEventListener('click', () => {
                console.log('뒤로가기 버튼 클릭됨');
                if (window.location.href.includes('post-detail.html')) {
                    window.location.href = 'posts.html';
                } else {
                    window.history.back();
                }
            });
        }

        // 로그아웃 버튼 이벤트
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('currentUser');
                window.location.href = '../html/index.html';
            });
        }
    }
}