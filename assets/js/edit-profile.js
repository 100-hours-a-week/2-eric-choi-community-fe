document.addEventListener('DOMContentLoaded', function() {
    displayProfileIcon();
    const form = document.getElementById('editForm');
    const emailInput = document.getElementById('email');
    const nicknameInput = document.getElementById('nickname');
    const nicknameError = document.getElementById('nicknameError');
    const profileIcon = document.querySelector('.profile-icon');
    const dropdownMenu = document.querySelector('.dropdown-menu');

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {

        window.location.href = '../index.html';
        return;
    }


    emailInput.value = currentUser.email;
    nicknameInput.value = currentUser.nickname;

    const profileImage = document.getElementById('profileImage');
    if (currentUser.profileImage) {
        profileImage.src = currentUser.profileImage;
    }

    const profileImageContainer = document.querySelector('.profile-image');
        profileImageContainer.addEventListener('click', function() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            
            input.onchange = function(e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        profileImage.src = e.target.result;
                        currentUser.profileImage = e.target.result;
                        profileIcon.querySelector('img').src = e.target.result;
                    }
                    reader.readAsDataURL(file);
                }
            }
            input.click();
        });
    

    // 드롭다운 메뉴 토글
    profileIcon.addEventListener('click', function(e) {
        e.stopPropagation();
        dropdownMenu.classList.toggle('show');
    });

    // 외부 클릭시 드롭다운 메뉴 닫기
    document.addEventListener('click', function(e) {
        if (!profileIcon.contains(e.target)) {
            dropdownMenu.classList.remove('show');
        }
    });

    // 닉네임 중복 체크
    function checkNicknameDuplicate(nickname) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        return users.some(user => 
            user.email !== currentUser.email && 
            user.nickname === nickname
        );
    }

    function displayProfileIcon() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const profileImg = document.querySelector('.profile-icon img');
        
        if (currentUser && currentUser.profileImage) {
            profileImg.src = currentUser.profileImage;
        }
    }

    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast-message';
        toast.textContent = message;
        
        // 회원탈퇴 버튼 다음에 토스트 메시지 추가
        const deleteAccountBtn = document.querySelector('.delete-account');
        deleteAccountBtn.after(toast);
    
        setTimeout(() => {
            toast.remove();
        }, 2000);
    }


    // 폼 제출 처리
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const nickname = nicknameInput.value.trim();

        // 닉네임 빈값 체크
        if (!nickname) {
            nicknameError.textContent = '*닉네임을 입력해주세요.';
            nicknameError.style.display = 'block';
            return;
        }

        // 닉네임 중복 체크
        if (checkNicknameDuplicate(nickname)) {
            nicknameError.textContent = '*중복된 닉네임입니다.';
            nicknameError.style.display = 'block';
            return;
        }

        // 유효성 검사 통과시 사용자 정보 업데이트
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const updatedUsers = users.map(user => {
            if (user.email === currentUser.email) {
                return { 
                    ...user, 
                    nickname: nickname,
                    profileImage: currentUser.profileImage  
                };
            }
            return user;
        });


        // 로컬 스토리지 업데이트
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        localStorage.setItem('currentUser', JSON.stringify({
            ...currentUser,
            nickname: nickname,
            profileImage: currentUser.profileImage
        }));

        showToast('수정 완료');

   
        setTimeout(() => {
            window.location.href = './posts.html';
        }, 2000);
    });

    // 입력시 에러메시지 숨김
    nicknameInput.addEventListener('input', function() {
        nicknameError.style.display = 'none';
    });

    // 로그아웃 처리
    const logoutButton = document.querySelector('.dropdown-item:last-child');
    logoutButton.addEventListener('click', function(e) {
        e.preventDefault();
        localStorage.removeItem('currentUser');
        window.location.href = '../index.html';
    });
    

    // 모달 관련 요소 선택
    const modal = document.getElementById('deleteModal');
    const confirmBtn = modal.querySelector('.confirm-btn');

    confirmBtn.addEventListener('click', function() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const users = JSON.parse(localStorage.getItem('users'));
    
    // 1. 게시글 삭제
    const posts = JSON.parse(localStorage.getItem('posts') || '[]');
    const updatedPosts = posts.filter(post => post.author !== currentUser.nickname);
    localStorage.setItem('posts', JSON.stringify(updatedPosts));

    // 2. 남은 게시글들의 댓글 중 사용자가 작성한 댓글 삭제
    const updatedPostsWithoutComments = updatedPosts.map(post => {
        if (post.comments) {
            post.comments = post.comments.filter(comment => 
                comment.author !== currentUser.nickname
            );
        }
        return post;
    });
    localStorage.setItem('posts', JSON.stringify(updatedPostsWithoutComments));

    // 3. users 배열에서 현재 사용자 제거
    const updatedUsers = users.filter(user => user.email !== currentUser.email);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    // 4. 현재 사용자 정보 삭제
    localStorage.removeItem('currentUser');
    
    // 5. 로그인 페이지로 이동
    window.location.href = '../index.html';
});

// 모달 외부 클릭 시 닫기
modal.addEventListener('click', function(e) {
    if (e.target === modal) {
        modal.classList.remove('show');
    }
});
});