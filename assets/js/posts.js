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

    // 게시글 작성 버튼 클릭 이벤트 수정
    writeButton.addEventListener('click', function() {
        window.location.href = './make-post.html';
    });

    // 게시글 HTML 생성 수정 
    function createPostElement(post) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const author = users.find(user => user.nickname === post.author);
        const profileImage = author?.profileImage || '/api/placeholder/24/24';
    
        return `
            <article class="post-item" data-post-id="${post.id}">
                <h2 class="post-title">${post.title}</h2>
                <div class="post-info">
                    <div class="post-stats">
                        <span>좋아요 ${post.likes}</span>
                        <span>댓글 ${post.comments?.length || 0}</span>
                        <span>조회수 ${post.views}</span>
                    </div>
                    <span class="post-date">${post.date}</span>
                </div>
                <div class="post-divider"></div>
                <div class="post-author">
                    <img src="${profileImage}" alt="작성자 프로필" class="author-img">
                    <span class="author-name">${post.author}</span>
                </div>
            </article>
        `;
    }

    // 게시글 클릭 이벤트 추가
    postList.addEventListener('click', function(e) {
        const postItem = e.target.closest('.post-item');
        if (postItem) {
            const postId = postItem.dataset.postId;
            window.location.href = `./post-detail.html?id=${postId}`;
        }
    });

  
    function getPostsFromStorage() {
        const posts = localStorage.getItem('posts');
        return posts ? JSON.parse(posts) : [];
    }

    function savePostsToStorage(posts) {
        localStorage.setItem('posts', JSON.stringify(posts));
    }

    function getPostsByPage(page, limit) {
        const posts = getPostsFromStorage();
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        return {
            posts: posts.slice(startIndex, endIndex),
            hasMore: endIndex < posts.length
        };
    }

    function initializeSampleData() {
        const currentPosts = getPostsFromStorage();
        if (currentPosts.length === 0) {
            savePostsToStorage(samplePosts);
        }
    }

    function displayPosts(append = false) {
        if (state.loading || !state.hasMore) return;
        
        state.loading = true;
        
        const { posts, hasMore } = getPostsByPage(state.page, state.limit);
        state.hasMore = hasMore;

        const postsHTML = posts.map(post => createPostElement(post)).join('');
        
        if (append) {
            postList.insertAdjacentHTML('beforeend', postsHTML);
        } else {
            postList.innerHTML = postsHTML;
        }

        state.loading = false;
    }

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

    function displayProfileIcon() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const profileImg = document.querySelector('.profile-icon img');
        
        if (currentUser && currentUser.profileImage) {
            profileImg.src = currentUser.profileImage;
        }
    }


    initializeSampleData();
    displayPosts();
    setupInfiniteScroll();
});