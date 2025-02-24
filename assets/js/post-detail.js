document.addEventListener('DOMContentLoaded', async function() {
    const profileIcon = document.querySelector('.profile-icon');
    const dropdownMenu = document.querySelector('.dropdown-menu');
    const backButton = document.querySelector('.back-button');
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');
    let isEditingComment = false;
    let editingCommentId = null;
    
    // 현재 로그인한 사용자 정보 가져오기
    let currentUser;
    try {
        const userResponse = await fetch('/data/users.json');
        const userData = await userResponse.json();
        currentUser = userData.data;
        
        // 프로필 이미지 설정
        const profileImg = document.querySelector('.profile-icon img');
        if (currentUser && currentUser.profileImage) {
            profileImg.src = currentUser.profileImage;
        }
    } catch (error) {
        console.error('Error fetching user:', error);
        window.location.href = '../index.html';
        return;
    }
 
    // 게시글 상세 조회
    async function fetchPostDetail(postId) {
        try {
            const response = await fetch('/data/posts.json');
            const result = await response.json();
            const post = result.data.find(p => p.id === parseInt(postId));
            
            if (!post) {
                throw new Error('Post not found');
            }
 
            return {
                message: "post_detail_success",
                data: post
            };
        } catch (error) {
            console.error('Error fetching post:', error);
            return {
                message: "internal_server_error",
                data: null
            };
        }
    }
 
    // 게시글 삭제 API
    async function deletePost(postId) {
        try {
            const response = await fetch(`/posts/${postId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId: 1 })
            });
            return true;
        } catch (error) {
            console.error('Error deleting post:', error);
            return false;
        }
    }
 
    function formatNumber(num) {
        if (num >= 100000) return Math.floor(num/1000) + 'k';
        if (num >= 10000) return Math.floor(num/1000) + 'k';
        if (num >= 1000) return Math.floor(num/1000) + 'k';
        return num;
    }
 
    function createModal(message, onConfirm) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>${message}</h3>
                <p>삭제한 내용은 복구 할 수 없습니다.</p>
                <div class="modal-buttons">
                    <button class="modal-cancel">취소</button>
                    <button class="modal-confirm">확인</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';
 
        modal.querySelector('.modal-cancel').addEventListener('click', () => {
            document.body.style.overflow = '';
            modal.remove();
        });
 
        modal.querySelector('.modal-confirm').addEventListener('click', () => {
            onConfirm();
            document.body.style.overflow = '';
            modal.remove();
        });
    }
 
    // 게시글 표시
    async function displayPost() {
        const result = await fetchPostDetail(postId);
        if (!result.data) {
            window.location.href = './posts.html';
            return;
        }
 
        const post = result.data;
        
        document.querySelector('.post-title').textContent = post.title;
        document.querySelector('.author-info').innerHTML = `
            <img src="${post.author.profileImageUrl}" alt="작성자 프로필" class="author-img">
            <span class="author-name">${post.author.nickname}</span>
            <span class="post-date">${post.createdAt}</span>
        `;
        document.querySelector('.post-content').textContent = post.content;
 
        if (post.image) {
            const imgContainer = document.querySelector('.post-image');
            imgContainer.innerHTML = '';
            const imgElement = document.createElement('img');
            imgElement.src = post.image;
            imgContainer.appendChild(imgElement);
        }
 
        document.querySelector('.post-stats').innerHTML = `
            <div class="stat-box">
                <div class="stat-value">${formatNumber(post.likeCount)}</div>
                <div class="stat-label">좋아요수</div>
            </div>
            <div class="stat-box">
                <div class="stat-value">${formatNumber(post.viewCount)}</div>
                <div class="stat-label">조회수</div>
            </div>
            <div class="stat-box">
                <div class="stat-value">${formatNumber(post.commentCount)}</div>
                <div class="stat-label">댓글</div>
            </div>
        `;
 
        const actionButtons = document.querySelector('.post-actions');
        if (post.author.nickname !== currentUser.nickname) {
            actionButtons.style.display = 'none';
        }
 
        displayComments(post.comments);
    }
 
    function displayComments(comments) {
        const commentsList = document.querySelector('.comments-list');
        commentsList.innerHTML = '';
 
        comments.forEach(comment => {
            const commentElement = document.createElement('div');
            commentElement.className = 'comment-item';
            commentElement.innerHTML = `
                <div class="comment-author">
                    <img src="${comment.author.profileImageUrl}" alt="작성자 프로필" class="author-img">
                    <span>${comment.author.nickname}</span>
                    <span class="comment-date">${comment.createdAt}</span>
                    ${comment.author.nickname === currentUser.nickname ? `
                        <div class="comment-actions">
                            <button class="edit-comment" data-id="${comment.id}">수정</button>
                            <button class="delete-comment" data-id="${comment.id}">삭제</button>
                        </div>
                    ` : ''}
                </div>
                <div class="comment-content">${comment.content}</div>
            `;
            commentsList.appendChild(commentElement);
        });
    }
 
    // 좋아요 토글 API
    async function toggleLike(postId) {
        try {
            const response = await fetch(`/posts/${postId}/likes`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId: 1 })
            });
            return true;
        } catch (error) {
            console.error('Error toggling like:', error);
            return false;
        }
    }
 
    // 댓글 작성 API
    async function createComment(postId, content) {
        try {
            const response = await fetch(`/posts/${postId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: 1,
                    content: content
                })
            });
            return true;
        } catch (error) {
            console.error('Error creating comment:', error);
            return false;
        }
    }
 
    // 댓글 수정 API
    async function updateComment(postId, commentId, content) {
        try {
            const response = await fetch(`/posts/${postId}/comments/${commentId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: 1,
                    content: content
                })
            });
            return true;
        } catch (error) {
            console.error('Error updating comment:', error);
            return false;
        }
    }
 
    // 댓글 삭제 API
    async function deleteComment(postId, commentId) {
        try {
            const response = await fetch(`/posts/${postId}/comments/${commentId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId: 1 })
            });
            return true;
        } catch (error) {
            console.error('Error deleting comment:', error);
            return false;
        }
    }
 
    // 이벤트 리스너들
    profileIcon.addEventListener('click', function(e) {
        e.stopPropagation();
        dropdownMenu.classList.toggle('show');
    });
 
    document.addEventListener('click', function(e) {
        if (!profileIcon.contains(e.target)) {
            dropdownMenu.classList.remove('show');
        }
    });
 
    backButton.addEventListener('click', () => window.location.href = './posts.html');
 
    // 댓글 입력 관련
    const commentForm = document.getElementById('commentForm');
    const commentInput = commentForm.querySelector('textarea');
    const commentButton = commentForm.querySelector('button');
 
    commentInput.addEventListener('input', function() {
        const isEmpty = !this.value.trim();
        commentButton.style.backgroundColor = isEmpty ? '#ACA0EB' : '#7F6AEE';
        commentButton.disabled = isEmpty;
    });
 
    commentInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); 
            if (!this.value.trim()) return; 
            commentForm.dispatchEvent(new Event('submit')); 
        }
    });
 
    // 댓글 제출
    commentForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const content = commentInput.value.trim();
        if (!content) return;
 
        if (isEditingComment) {
            const success = await updateComment(postId, editingCommentId, content);
            if (success) {
                isEditingComment = false;
                editingCommentId = null;
                commentButton.textContent = '댓글 등록';
                commentInput.value = '';
                commentButton.style.backgroundColor = '#ACA0EB';
                commentButton.disabled = true;
                displayPost();
            }
        } else {
            const success = await createComment(postId, content);
            if (success) {
                commentInput.value = '';
                commentButton.style.backgroundColor = '#ACA0EB';
                commentButton.disabled = true;
                displayPost();
            }
        }
    });
 
    // 게시글 좋아요
    document.querySelector('.post-stats').addEventListener('click', async function(e) {
        const statBox = e.target.closest('.stat-box');
        if (statBox && statBox.querySelector('.stat-label').textContent === '좋아요수') {
            const success = await toggleLike(postId);
            if (success) {
                displayPost();
            }
        }
    });
 
    // 댓글 수정/삭제
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('edit-comment')) {
            const commentId = parseInt(e.target.dataset.id);
            const post = result.data;
            const comment = post.comments.find(c => c.id === commentId);
            
            commentInput.value = comment.content;
            commentButton.textContent = '댓글 수정';
            commentButton.style.backgroundColor = '#7F6AEE';
            commentButton.disabled = false;
            isEditingComment = true;
            editingCommentId = commentId;
        }
        
        if (e.target.classList.contains('delete-comment')) {
            const commentId = parseInt(e.target.dataset.id);
            createModal('댓글을 삭제하시겠습니까?', async () => {
                const success = await deleteComment(postId, commentId);
                if (success) {
                    displayPost();
                }
            });
        }
    });
 
    // 수정/삭제 버튼
    document.querySelector('.edit-btn')?.addEventListener('click', function() {
        window.location.href = `./edit-post.html?id=${postId}`;
    });
 
    document.querySelector('.delete-btn')?.addEventListener('click', function() {
        createModal('게시글을 삭제하시겠습니까?', async () => {
            const success = await deletePost(postId);
            if (success) {
                window.location.href = './posts.html';
            }
        });
    });
 
    // 초기 로드
    displayPost();
 });