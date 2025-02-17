document.addEventListener('DOMContentLoaded', function() {
    displayProfileIcon();
    const profileIcon = document.querySelector('.profile-icon');
    const dropdownMenu = document.querySelector('.dropdown-menu');
    const backButton = document.querySelector('.back-button');
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let isEditingComment = false;
    let editingCommentId = null;
    
    // 페이지 로드시 조회수를 증가시키기 위한 플래그
    let isFirstLoad = true;

    if (!currentUser) {
        window.location.href = '../index.html';
        return;
    }

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

    function getPost() {
        const posts = JSON.parse(localStorage.getItem('posts') || '[]');
        const post = posts.find(post => post.id.toString() === postId);
        if (!post) return null;
        
        post.views = post.views || 0;
        post.likes = post.likes || 0;
        post.likedBy = post.likedBy || [];
        post.comments = post.comments || [];
        
        return post;
    }

    function updatePost(updatedPost) {
        const posts = JSON.parse(localStorage.getItem('posts') || '[]');
        const updatedPosts = posts.map(post => 
            post.id.toString() === postId ? updatedPost : post
        );
        localStorage.setItem('posts', JSON.stringify(updatedPosts));
        return updatedPost;
    }

    function displayPost() {
        const post = getPost();
        const users = JSON.parse(localStorage.getItem('users') || '[]'); 
        if (!post) {
            window.location.href = './posts.html';
            return;
        }

        const author = users.find(user => user.nickname === post.author);
        const authorProfileImage = author?.profileImage || '/api/placeholder/24/24';

        // 최초 로드시에만 조회수 증가
        if (isFirstLoad) {
            post.views += 1;
            updatePost(post);
            isFirstLoad = false;
        }

        document.querySelector('.post-title').textContent = post.title;
        document.querySelector('.author-info').innerHTML = `
            <img src="${authorProfileImage}" alt="작성자 프로필" class="author-img">
            <span class="author-name">${post.author}</span>
            <span class="post-date">${post.date}</span>
        `;
        document.querySelector('.post-date').textContent = post.date;
        document.querySelector('.post-content').textContent = post.content;

        if (post.image) {
            const imgContainer = document.querySelector('.post-image');
            imgContainer.innerHTML = '';
            const imgElement = document.createElement('img');
            imgElement.src = post.image;
            imgContainer.appendChild(imgElement);
        }

        document.querySelector('.post-stats').innerHTML = `
            <div class="stat-box ${post.likedBy.includes(currentUser.email) ? 'liked' : ''}">
                <div class="stat-value">${formatNumber(post.likes || 0)}</div>
                <div class="stat-label">좋아요수</div>
            </div>
            <div class="stat-box">
                <div class="stat-value">${formatNumber(post.views)}</div>
                <div class="stat-label">조회수</div>
            </div>
            <div class="stat-box">
                <div class="stat-value">${formatNumber(post.comments.length)}</div>
                <div class="stat-label">댓글</div>
            </div>
        `;

        const actionButtons = document.querySelector('.post-actions');
        if (post.author !== currentUser.nickname) {
            actionButtons.style.display = 'none';
        }
    }

    document.querySelector('.post-stats').addEventListener('click', function(e) {
        const statBox = e.target.closest('.stat-box');
        if (statBox && statBox.querySelector('.stat-label').textContent === '좋아요수') {
            const post = getPost();
            const hasLiked = post.likedBy.includes(currentUser.email);
            
            if (!hasLiked) {
                post.likedBy.push(currentUser.email);
                post.likes += 1;
            } else {
                post.likedBy = post.likedBy.filter(email => email !== currentUser.email);
                post.likes = Math.max(0, post.likes - 1);
            }
            
            updatePost(post);
            displayPost();
        }
    });

    function displayComments() {
        const post = getPost();
        const commentsList = document.querySelector('.comments-list');
        commentsList.innerHTML = '';

        post.comments.forEach(comment => {
            const commentElement = document.createElement('div');
            commentElement.className = 'comment-item';
            commentElement.innerHTML = `
                <div class="comment-author">
                    <img src="/api/placeholder/24/24" alt="작성자 프로필" class="author-img">
                    <span>${comment.author}</span>
                    <span class="comment-date">${comment.date}</span>
                    ${comment.author === currentUser.nickname ? `
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

    function displayProfileIcon() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const profileImg = document.querySelector('.profile-icon img');
        
        if (currentUser && currentUser.profileImage) {
            profileImg.src = currentUser.profileImage;
        }
    }

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

    commentForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const content = commentInput.value.trim();
        if (!content) return;

        const post = getPost();

        if (isEditingComment) {
            const commentIndex = post.comments.findIndex(c => c.id === editingCommentId);
            if (commentIndex !== -1) {
                post.comments[commentIndex].content = content;
                post.comments[commentIndex].edited = true;
                post.comments[commentIndex].editDate = new Date().toLocaleString();
            }
            isEditingComment = false;
            editingCommentId = null;
            commentButton.textContent = '댓글 등록';
        } else {
            const newComment = {
                id: Date.now(),
                content: content,
                author: currentUser.nickname,
                date: new Date().toLocaleString()
            };
            post.comments.push(newComment);
        }

        updatePost(post);
        commentInput.value = '';
        commentButton.style.backgroundColor = '#ACA0EB';
        commentButton.disabled = true;
        
        displayComments();
        displayPost();
    });

    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('edit-comment')) {
            const commentId = parseInt(e.target.dataset.id);
            const post = getPost();
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
            createModal('댓글을 삭제하시겠습니까?', () => {
                const post = getPost();
                post.comments = post.comments.filter(c => c.id !== commentId);
                updatePost(post);
                displayComments();
                displayPost();
            });
        }
    });

    document.querySelector('.edit-btn')?.addEventListener('click', function() {
        window.location.href = `./edit-post.html?id=${postId}`;
    });

    document.querySelector('.delete-btn')?.addEventListener('click', function() {
        createModal('게시글을 삭제하시겠습니까?', () => {
            const posts = JSON.parse(localStorage.getItem('posts') || '[]');
            const updatedPosts = posts.filter(post => post.id.toString() !== postId);
            localStorage.setItem('posts', JSON.stringify(updatedPosts));
            window.location.href = './posts.html';
        });
    });

    displayPost();
    displayComments();
});