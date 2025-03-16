export class Api {
    static async request(endpoint, options = {}) {
        const baseUrl = 'http://localhost:8080';
        const url = baseUrl + endpoint;
        
        try {
            const response = await fetch(url, {
                ...options,
                credentials: 'include',  // 쿠키 전송 허용
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            });

            if (response.status === 401 || response.status === 403) {
                // 세션이 만료되었거나 인증 오류가 발생한 경우
                window.location.href = 'index.html';
                throw new Error('인증이 필요합니다.');
            }
    
            if (!response.ok) {
                throw new Error(`HTTP 오류! 상태: ${response.status}`);
            }
    
            // 응답 본문이 없거나 상태가 204(No Content)일 경우 빈 객체 반환
            if (response.status === 204) {
                return {};
            }
            
            const text = await response.text();
            return text ? JSON.parse(text) : {};
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

    static async delete(endpoint, data = null) {
        const options = {
            method: 'DELETE'
        };
        
        if (data) {
            options.body = JSON.stringify(data);
        }
        
        return this.request(endpoint, options);
    }
}
