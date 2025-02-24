document.addEventListener('DOMContentLoaded', function() {
    displayProfileIcon();
    const postList = document.querySelector('.post-list');
    const writeButton = document.querySelector('.write-button');
    const profileIcon = document.querySelector('.profile-icon');
    const dropdownMenu = document.querySelector('.dropdown-menu');
    
    // 페이지네이션 상태 관리
    const state = {
        page: 1,
        limit: 5,
        loading: false,
        hasMore: true
    };

    // 프로필 아이콘 클릭 이벤트 추가
    profileIcon.addEventListener('click', function(e) {
        e.stopPropagation();
        dropdownMenu.classList.toggle('show');
    });
    
    // 다른 곳을 클릭하면 드롭다운 메뉴 닫기
    document.addEventListener('click', function(e) {
        if (!profileIcon.contains(e.target)) {
            dropdownMenu.classList.remove('show');
        }
    });
    
    // ESC 키를 누르면 드롭다운 메뉴 닫기
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            dropdownMenu.classList.remove('show');
        }
    });

    // 게시글 작성 버튼 클릭 이벤트
    writeButton.addEventListener('click', function() {
        window.location.href = './make-post.html';
    });

    // 게시글 HTML 생성
    function createPostElement(post) {
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

    // 게시글 클릭 이벤트
    postList.addEventListener('click', function(e) {
        const postItem = e.target.closest('.post-item');
        if (postItem) {
            const postId = postItem.dataset.postId;
            window.location.href = `./post-detail.html?id=${postId}`;
        }
    });

    // 게시글 목록 조회 API 호출
    async function fetchPosts(page, limit) {
        try {
            const response = await fetch('/data/posts.json');
            const result = await response.json();
            
            // API 응답 형식에 맞게 데이터 가공
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            const paginatedPosts = result.data.slice(startIndex, endIndex);
            
            // comments 제외하고 필요한 데이터만 반환
            const posts = paginatedPosts.map(post => ({
                id: post.id,
                title: post.title,
                createdAt: post.createdAt,
                likeCount: post.likeCount,
                commentCount: post.commentCount,
                viewCount: post.viewCount,
                author: post.author
            }));
    
            return {
                message: "fetch_posts_success",
                data: posts,
                hasNextPage: endIndex < result.data.length
            };
        } catch (error) {
            console.error('Error fetching posts:', error);
            return {
                message: "internal_server_error",
                data: null
            };
        }
    }

    // 게시글 표시
    async function displayPosts(append = false) {
        if (state.loading || !state.hasMore) return;
        
        state.loading = true;
        
        try {
            const response = await fetchPosts(state.page, state.limit);
            const posts = response.data;
            state.hasMore = response.hasNextPage;
    
            if (!posts || posts.length === 0) {
                state.hasMore = false;
                state.loading = false;
                return;
            }
    
            const postsHTML = posts.map(post => createPostElement(post)).join('');
            
            if (append) {
                postList.insertAdjacentHTML('beforeend', postsHTML);
            } else {
                postList.innerHTML = postsHTML;
            }
            
        } catch (error) {
            console.error('Error displaying posts:', error);
        } finally {
            state.loading = false;
        }
    }

    // 무한 스크롤 설정
    function setupInfiniteScroll() {
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !state.loading && state.hasMore) {
                    state.page++;
                    displayPosts(true);
                }
            });
        }, options);

        const sentinel = document.createElement('div');
        sentinel.className = 'scroll-sentinel';
        postList.after(sentinel);

        observer.observe(sentinel);
    }

    async function displayProfileIcon() {
        try {
            const response = await fetch('/users');
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            const currentUser = data.data;
            
            const profileImg = document.querySelector('.profile-icon img');
            if (currentUser && currentUser.profileImage) {
                profileImg.src = currentUser.profileImage;
            }
        } catch (error) {
            console.error('Error fetching current user:', error);
            const response = await fetch('/data/users.json');
            const data = await response.json();
            const currentUser = data.data[0];
            
            const profileImg = document.querySelector('.profile-icon img');
            if (currentUser && currentUser.profileImage) {
                profileImg.src = currentUser.profileImage;
            }
        }
    }

    displayPosts();
    setupInfiniteScroll();
});