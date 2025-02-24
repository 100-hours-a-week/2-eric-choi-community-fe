document.addEventListener('DOMContentLoaded', async function() {
    const form = document.getElementById('editForm');
    const emailInput = document.getElementById('email');
    const nicknameInput = document.getElementById('nickname');
    const nicknameError = document.getElementById('nicknameError');
    const profileIcon = document.querySelector('.profile-icon');
    const dropdownMenu = document.querySelector('.dropdown-menu');
    const modal = document.getElementById('deleteModal');
    const confirmBtn = modal.querySelector('.confirm-btn');
    let selectedFile = null;

    // 현재 로그인한 사용자 정보 가져오기
    let currentUser;
    try {
        const userResponse = await fetch('/data/users.json');
        const userData = await userResponse.json();
        currentUser = userData.data;
        
        // 폼에 현재 사용자 정보 설정
        emailInput.value = currentUser.email;
        nicknameInput.value = currentUser.nickname;

        // 프로필 이미지 설정
        const profileImage = document.getElementById('profileImage');
        const profileImg = document.querySelector('.profile-icon img');
        if (currentUser.profileImage) {
            profileImage.src = currentUser.profileImage;
            profileImg.src = currentUser.profileImage;
        }
    } catch (error) {
        console.error('Error fetching user:', error);
        window.location.href = '../index.html';
        return;
    }

    // 프로필 수정 API
    async function updateProfile(profileData) {
        try {
            const response = await fetch(`/users/${currentUser.id}/profile`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: currentUser.id,
                    nickname: profileData.nickname,
                    profile_image: profileData.profileImage
                })
            });
            return true;
        } catch (error) {
            console.error('Error updating profile:', error);
            return false;
        }
    }

    // 회원 탈퇴 API
    async function deleteUser() {
        try {
            const response = await fetch(`/users/${currentUser.id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: currentUser.id
                })
            });
            return true;
        } catch (error) {
            console.error('Error deleting user:', error);
            return false;
        }
    }

    // 이미지 업로드 처리
    const profileImageContainer = document.querySelector('.profile-image');
    profileImageContainer.addEventListener('click', function() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        
        input.onchange = async function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const profileImage = document.getElementById('profileImage');
                    const profileIcon = document.querySelector('.profile-icon img');
                    profileImage.src = e.target.result;
                    profileIcon.src = e.target.result;
                    selectedFile = e.target.result;
                }
                reader.readAsDataURL(file);
            }
        }
        input.click();
    });

    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast-message';
        toast.textContent = message;
        
        const deleteAccountBtn = document.querySelector('.delete-account');
        deleteAccountBtn.after(toast);
    
        setTimeout(() => {
            toast.remove();
        }, 2000);
    }

    // 폼 제출 처리
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const nickname = nicknameInput.value.trim();

        if (!nickname) {
            nicknameError.textContent = '*닉네임을 입력해주세요.';
            nicknameError.style.display = 'block';
            return;
        }

        const success = await updateProfile({
            nickname,
            profileImage: selectedFile
        });

        if (success) {
            showToast('수정 완료');
            setTimeout(() => {
                window.location.href = './posts.html';
            }, 2000);
        }
    });

    // 입력시 에러메시지 숨김
    nicknameInput.addEventListener('input', function() {
        nicknameError.style.display = 'none';
    });

    // 회원탈퇴 처리
    confirmBtn.addEventListener('click', async function() {
        const success = await deleteUser();
        if (success) {
            window.location.href = '../index.html';
        }
    });

    // 드롭다운 메뉴 관련
    profileIcon.addEventListener('click', function(e) {
        e.stopPropagation();
        dropdownMenu.classList.toggle('show');
    });

    document.addEventListener('click', function(e) {
        if (!profileIcon.contains(e.target)) {
            dropdownMenu.classList.remove('show');
        }
    });

    // 모달 관련
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.classList.remove('show');
        }
    });

    // 회원탈퇴 버튼 클릭 이벤트 
    const deleteAccountBtn = document.querySelector('.delete-account');
    deleteAccountBtn.addEventListener('click', function() {
        modal.classList.add('show');
    });

    // 모달 취소 버튼 클릭 이벤트 
    const cancelBtn = document.querySelector('.cancel-btn');
    cancelBtn.addEventListener('click', function() {
        modal.classList.remove('show');
    });
});