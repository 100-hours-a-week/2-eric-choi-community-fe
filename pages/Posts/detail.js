import { Header } from '../../components/Header/index.js';
import { Modal } from '../../components/Modal/index.js';
import { Api } from '../../utils/api.js';
import { helpers } from '../../utils/helpers.js';

class PostDetail {
    constructor() {
        this.header = new Header({ 
            title: '게시글',
            showBackButton: true
        });
        
        this.postId = new URLSearchParams(window.location.search).get('id');
        this.currentUser = null;
        this.post = null;
        this.isEditingComment = false;
        this.editingCommentId = null;
        this.firstLoad = true; // 여기에 추가
        
        this.init();
    }
    async init() {
        if (!this.postId) {
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
        } catch (error) {
            console.error('Failed to load user data:', error);
            window.location.href = 'index.html';
        }
    }
    
    setupElements() {
        this.postTitle = document.querySelector('.post-title');
        this.authorInfo = document.querySelector('.author-info');
        this.postContent = document.querySelector('.post-content');
        this.postImage = document.querySelector('.post-image');
        this.postStats = document.querySelector('.post-stats');
        this.commentsList = document.querySelector('.comments-list');
        this.actionButtons = document.querySelector('.post-actions');
        this.editBtn = document.querySelector('.edit-btn');
        this.deleteBtn = document.querySelector('.delete-btn');
        this.commentForm = document.getElementById('commentForm');
        this.commentInput = this.commentForm.querySelector('textarea');
        this.commentButton = this.commentForm.querySelector('button');
    }
    
    setupEventListeners() {
        // 댓글 입력 관련
        this.commentInput.addEventListener('input', () => {
            const isEmpty = !this.commentInput.value.trim();
            this.commentButton.style.backgroundColor = isEmpty ? 'var(--primary-light)' : 'var(--primary)';
            this.commentButton.disabled = isEmpty;
        });

        this.commentInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault(); 
                if (!this.commentInput.value.trim()) return; 
                this.commentForm.dispatchEvent(new Event('submit')); 
            }
        });
        
        // 댓글 제출
        this.commentForm.addEventListener('submit', this.handleCommentSubmit.bind(this));
        
        // 게시글 좋아요
        this.postStats.addEventListener('click', this.handleLikeToggle.bind(this));

        // 댓글 수정/삭제
        document.addEventListener('click', this.handleCommentActions.bind(this));
        
        // 수정/삭제 버튼
        this.editBtn?.addEventListener('click', () => {
            const encodedEmail = encodeURIComponent(this.currentUser.email);
            window.location.href = `edit-post.html?id=${this.postId}&email=${encodedEmail}`;
        });
        
        this.deleteBtn?.addEventListener('click', this.handlePostDelete.bind(this));
    }
    
    async loadPostData() {
        try {
            console.log('게시글 데이터 로드, 첫 로드 여부:', this.firstLoad);
            // incrementView 파라미터 추가
            const incrementViewParam = this.firstLoad ? '&incrementView=true' : '&incrementView=false';
            // 첫 로드 후 false로 설정
            this.firstLoad = false;
            
            // 파라미터 추가하여 게시글 데이터 로드
            const response = await Api.get(`/posts/${this.postId}?email=${encodeURIComponent(this.currentUser.email)}${incrementViewParam}`);
            this.post = response.data;
            
            // 좋아요 상태 별도 확인
            const likeStatus = await Api.get(`/posts/${this.postId}/likes/status?email=${encodeURIComponent(this.currentUser.email)}`);
            this.isLiked = likeStatus.data.data;
            
            this.displayPost();
        } catch (error) {
            console.error('게시글 로드 실패:', error);
        }
    }
    
    displayPost() {
        const post = this.post;
        
        this.postTitle.textContent = post.title;
        this.authorInfo.innerHTML = `
            <img src="${post.author.profileImage}" alt="작성자 프로필" class="author-img">
            <span class="author-name">${post.author.nickname}</span>
            <span class="post-date">${post.createdAt}</span>
        `;
        this.postContent.textContent = post.content;
        
        if (post.image) {
            this.postImage.innerHTML = '';
            const imgElement = document.createElement('img');
            imgElement.src = post.image;
            this.postImage.appendChild(imgElement);
        }
        
        this.postStats.innerHTML = `
            <div class="stat-box">
                <div class="stat-value">${helpers.formatNumber(post.likeCount)}</div>
                <div class="stat-label">좋아요수</div>
            </div>
            <div class="stat-box">
                <div class="stat-value">${helpers.formatNumber(post.viewCount)}</div>
                <div class="stat-label">조회수</div>
            </div>
            <div class="stat-box">
                <div class="stat-value">${helpers.formatNumber(post.commentCount)}</div>
                <div class="stat-label">댓글</div>
            </div>
        `;
        
        if (post.author.nickname !== this.currentUser.nickname) {
            this.actionButtons.style.display = 'none';
        }
        
        this.displayComments(post.comments);
    }
    
    displayComments(comments) {
        this.commentsList.innerHTML = '';
        
        comments.forEach(comment => {
            const commentElement = document.createElement('div');
            commentElement.className = 'comment-item';
            commentElement.innerHTML = `
                <div class="comment-author">
                    <img src="${comment.author.profileImage}" alt="작성자 프로필" class="author-img">
                    <span>${comment.author.nickname}</span>
                    <span class="comment-date">${comment.createdAt}</span>
                    ${comment.author.nickname === this.currentUser.nickname ? `
                        <div class="comment-actions">
                            <button class="edit-comment" data-id="${comment.commentId}">수정</button>
                            <button class="delete-comment" data-id="${comment.commentId}">삭제</button>
                        </div>
                    ` : ''}
                </div>
                <div class="comment-content">${comment.content}</div>
            `;
            this.commentsList.appendChild(commentElement);
        });
    }
    
    async handleLikeToggle(e) {
        const statBox = e.target.closest('.stat-box');
        if (statBox && statBox.querySelector('.stat-label').textContent === '좋아요수') {
            try {
                let success;
                const emailParam = '?email=' + encodeURIComponent(this.currentUser.email);
                
                if (this.isLiked) {
                    // 좋아요 취소: DELETE 요청 - 요청 본문 필요 없음
                    success = await Api.delete(`/posts/${this.postId}/likes${emailParam}`);
                    this.isLiked = false;
                } else {
                    // 좋아요 추가: POST 요청 - 요청 본문에 postId 필요
                    success = await Api.post(`/posts/${this.postId}/likes${emailParam}`, {
                        postId: parseInt(this.postId)
                    });
                    this.isLiked = true;
                }
                
                if (success) {
                    await this.loadPostData();
                }
            } catch (error) {
                console.error('Failed to toggle like:', error);
                // 오류 메시지 표시 (선택 사항)
                if (error.message && error.message.includes('Unauthorized')) {
                    console.log('이미 처리된 요청이거나 권한이 없습니다.');
                }
            }
        }
    }
    
    async handleCommentSubmit(e) {
        e.preventDefault();
        
        const content = this.commentInput.value.trim();
        if (!content) return;
    
        const emailParam = '?email=' + encodeURIComponent(this.currentUser.email);
    
        try {
            let success;  // 미리 선언
    
            // 수정 모드라면 PATCH 요청
            if (this.isEditingComment) {
                // PATCH 요청
                success = await Api.patch(`/posts/${this.postId}/comments/${this.editingCommentId}` + emailParam, {
                    userId: this.currentUser.id,
                    content
                });
            } else {
                // POST 요청
                success = await Api.post(`/posts/${this.postId}/comments` + emailParam, {
                    userId: this.currentUser.id,
                    content
                });
            }
    
            if (success) {
                // 공통 후처리
                this.isEditingComment = false;
                this.editingCommentId = null;
                this.commentButton.textContent = '댓글 등록';
                this.commentInput.value = '';
                this.commentButton.style.backgroundColor = 'var(--primary-light)';
                this.commentButton.disabled = true;
                await this.loadPostData();
            }
        } catch (error) {
            console.error('Failed to submit comment:', error);
        }
    }
    
    
    handleCommentActions(e) {
        if (e.target.classList.contains('edit-comment')) {
            const commentId = parseInt(e.target.dataset.id);
            const comment = this.post.comments.find(c => c.commentId === commentId);
            
            if (comment) {
                this.commentInput.value = comment.content;
                this.commentButton.textContent = '댓글 수정';
                this.commentButton.style.backgroundColor = 'var(--primary)';
                this.commentButton.disabled = false;
                this.isEditingComment = true;
                this.editingCommentId = commentId;
            }
        }
        
        
        if (e.target.classList.contains('delete-comment')) {
            const commentId = parseInt(e.target.dataset.id);
            this.showDeleteCommentModal(commentId);
        }
    }
    
    async showDeleteCommentModal(commentId) {
        const emailParam = '?email=' + encodeURIComponent(this.currentUser.email);
        const modal = new Modal({
            title: '댓글을 삭제하시겠습니까?',
            message: '삭제한 내용은 복구할 수 없습니다.'
        });
        
        document.body.appendChild(modal.element);
        
        modal.onConfirm(async () => {
            try {
                const success = await Api.delete(`/posts/${this.postId}/comments/${commentId}` + emailParam, {
                    userId: this.currentUser.id
                });
                
                if (success) {
                    await this.loadPostData();
                }
            } catch (error) {
                console.error('Failed to delete comment:', error);
            }
        });
        
        modal.onCancel(() => {
            // 취소 시 아무 작업 없음
        });
        
        modal.show();
    }
    
    async handlePostDelete() {
        const emailParam = '?email=' + encodeURIComponent(this.currentUser.email);
        const modal = new Modal({
            title: '게시글을 삭제하시겠습니까?',
            message: '삭제한 내용은 복구할 수 없습니다.'
        });
        
        document.body.appendChild(modal.element);
        
        modal.onConfirm(async () => {
            try {
                const success = await Api.delete(`/posts/${this.postId}` + emailParam, {
                    userId: this.currentUser.id
                });
                
                if (success) {
                    window.location.href = 'posts.html';
                }
            } catch (error) {
                console.error('Failed to delete post:', error);
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
    new PostDetail();
});