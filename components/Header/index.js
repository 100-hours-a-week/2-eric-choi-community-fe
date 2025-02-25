export class Header {
    constructor(options = {}) {
        const { title, showBackButton = false, container = document.body } = options;
        this.element = document.createElement('header');
        this.element.className = 'header';
        
     
        this.init(title, showBackButton, container);
    }

    async init(title, showBackButton, container) {
        await this.render(title, showBackButton);
        container.prepend(this.element);
        this.setupEventListeners();
    }

    async render(title, showBackButton) {
        try {
        
            const currentUser = await this.getCurrentUser();
            
            this.element.innerHTML = `
                ${showBackButton ? `
                    <button class="back-button" onclick="window.history.back()">
                        <span class="back-arrow">←</span>
                    </button>
                ` : ''}
                <h1 class="title">${title || '아무 말 대잔치'}</h1>
                <div class="profile-icon">
                    <img src="${currentUser?.profileImage || '../assets/images/default-profile.png'}" 
                         alt="프로필" class="profile-img">
                    <div class="dropdown-menu">
                        <a href="../html/edit-profile.html" class="dropdown-item">회원정보 수정</a>
                        <a href="../html/edit-password.html" class="dropdown-item">비밀번호 수정</a>
                        <a href="../html/index.html" class="dropdown-item">로그아웃</a>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('헤더 렌더링 오류:', error);
           
            this.element.innerHTML = `
                ${showBackButton ? `
                    <button class="back-button" onclick="window.history.back()">
                        <span class="back-arrow">←</span>
                    </button>
                ` : ''}
                <h1 class="title">${title || '아무 말 대잔치'}</h1>
            `;
        }
    }

    async getCurrentUser() {
        try {
            const response = await fetch('../data/users.json');
            const userData = await response.json();
            return userData.data;
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

        if (profileIcon) {
            console.log('프로필 아이콘 이벤트 설정');
            profileIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                console.log('프로필 아이콘 클릭됨');
                dropdownMenu?.classList.toggle('show');
            });
        }

        if (backButton) {
            console.log('뒤로가기 버튼 이벤트 설정');
            backButton.addEventListener('click', () => {
                console.log('뒤로가기 버튼 클릭됨');
                window.history.back();
            });
        }

        document.addEventListener('click', (e) => {
            if (profileIcon && !profileIcon.contains(e.target)) {
                dropdownMenu?.classList.remove('show');
            }
        });
    }
}