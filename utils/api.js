export class Api {
    static async request(endpoint, options = {}) {
        try {
            let url = endpoint;
            let result = null;
            
            console.log("API 요청:", endpoint);
            
            // 특정 게시글 ID 요청 처리
            if (endpoint.match(/^\/posts\/\d+$/)) {
                const id = parseInt(endpoint.split('/')[2]);
                console.log("특정 게시글 요청 ID:", id);
                
                // posts.json에서 모든 게시글 가져오기
                const response = await fetch('../data/posts.json');
                const allPosts = await response.json();
                console.log("전체 게시글 데이터:", allPosts);
                
                // ID로 특정 게시글 찾기
                const post = allPosts.data.find(p => p.id === id);
                console.log("찾은 게시글:", post);
                
                if (post) {
                    result = {
                        message: "post_detail_success",
                        data: post
                    };
                } else {
                    throw new Error(`ID가 ${id}인 게시글을 찾을 수 없습니다.`);
                }
                
                return result;
            }
            
            // 일반 API 요청 처리
            if (options.method === undefined || options.method === 'GET') {
                if (endpoint.startsWith('/users')) {
                    url = '../data/users.json';
                } else if (endpoint.startsWith('/posts')) {
                    url = '../data/posts.json';
                }
            }
            
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            });
            
            return await response.json();
        } catch (error) {
            console.error('API 요청 실패:', error);
            throw error;
        }
    }

    static async get(endpoint) {
        return this.request(endpoint);
    }

    static async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    static async patch(endpoint, data) {
        return this.request(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    }

    static async delete(endpoint, data) {
        return this.request(endpoint, {
            method: 'DELETE',
            body: JSON.stringify(data)
        });
    }
}