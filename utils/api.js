export class Api {
    static timeout = 30000; // 30초 타임아웃
    
    static async request(endpoint, options = {}) {
        const baseUrl = 'http://localhost:8080';
        const url = baseUrl + endpoint;
        
        // 타임아웃을 위한 AbortController 사용
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        
        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
                credentials: 'include',  // 쿠키 전송 허용
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            });
            
            // 타임아웃 타이머 제거
            clearTimeout(timeoutId);

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
            
            // 응답 처리를 더 안전하게 수행
            try {
                const text = await response.text();
                return text ? JSON.parse(text) : {};
            } catch (parseError) {
                console.error('응답 파싱 오류:', parseError);
                return {}; // 파싱 실패 시 빈 객체 반환
            }
        } catch (error) {
            // 타임아웃 타이머 제거
            clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                console.error('요청 타임아웃');
                throw new Error('요청 시간이 초과되었습니다. 다시 시도해 주세요.');
            }
            
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
        // DELETE 요청에 body가 필요한 경우와 필요하지 않은 경우를 구분
        const options = { method: 'DELETE' };
        
        // data가 있는 경우만 body 추가
        if (data) {
            options.body = JSON.stringify(data);
        }
        
        return this.request(endpoint, options);
    }
}