import { Header } from '../../components/Header/index.js';
import { Api } from '../../utils/api.js';

class PostsList {
    constructor() {
        this.header = new Header({ 
            title: '아무 말 대잔치',
            showBackButton: false
        });
        
        this.state = {
            page: 1,
            limit: 5,
            loading: false,
            hasMore: true
        };

        this.init();
    }

    async init() {
        this.setupElements();
        this.setupEventListeners();
        await this.loadPosts();
        this.setupInfiniteScroll();
    }

    setupElements() {
        this.postList = document.querySelector('.post-list');
        this.writeButton = document.querySelector('.write-button');
    }

    setupEventListeners() {
        this.writeButton.addEventListener('click', () => {
            window.location.href = '../html/make-post.html';
        });

        this.postList.addEventListener('click', (e) => {
            const postItem = e.target.closest('.post-item');
            if (postItem) {
                const postId = postItem.dataset.postId;
                window.location.href = `../html/post-detail.html?id=${postId}`;
            }
        });
    }

    async loadPosts() {
        if (this.state.loading || !this.state.hasMore) return;
        
        this.state.loading = true;
        
        try {
            const response = await Api.get(`/posts?page=${this.state.page}&limit=${this.state.limit}`);
            const posts = response.data;
            
            // 더 이상 불러올 게시글이 없는지 확인
            this.state.hasMore = posts.length === this.state.limit;
            
            // 게시글 렌더링
            if (posts && posts.length > 0) {
                this.renderPosts(posts);
            } else {
                this.state.hasMore = false;
            }
        } catch (error) {
            console.error('게시글을 불러오는데 실패했습니다:', error);
        } finally {
            this.state.loading = false;
        }
    }

    renderPosts(posts) {
        const postsHTML = posts.map(post => this.createPostElement(post)).join('');
        this.postList.insertAdjacentHTML('beforeend', postsHTML);
    }

    createPostElement(post) {
        return `
            <article class="post-item" data-post-id="${post.id}">
                <h2 class="post-title">${post.title}</h2>
                <div class="post-info">
                    <div class="post-stats">
                        <span>좋아요 ${post.likeCount}</span>
                        <span>댓글 ${post.commentCount}</span>
                        <span>조회수 ${post.viewCount}</span>
                    </div>
                    <span class="post-date">${post.createdAt}</span>
                </div>
                <div class="post-divider"></div>
                <div class="post-author">
                    <img src="${post.author.profileImageUrl}" alt="작성자 프로필" class="author-img">
                    <span class="author-name">${post.author.nickname}</span>
                </div>
            </article>
        `;
    }

    setupInfiniteScroll() {
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.state.loading && this.state.hasMore) {
                    this.state.page++;
                    this.loadPosts();
                }
            });
        }, options);

        const sentinel = document.createElement('div');
        sentinel.className = 'scroll-sentinel';
        this.postList.after(sentinel);

        observer.observe(sentinel);
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    new PostsList();
});