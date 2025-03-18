export class Api {
    static timeout = 30000; // 30초 타임아웃
    
    static async request(endpoint, options = {}) {
        const baseUrl = 'http://localhost:8080';
        const url = baseUrl + endpoint;
        
        // 타임아웃을 위한 AbortController 사용
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        
        try {
            // FormData인 경우 Content-Type 헤더를 설정하지 않음
            const isFormData = options.body instanceof FormData;
            const headers = isFormData 
                ? { ...options.headers } 
                : {
                    'Content-Type': 'application/json',
                    ...options.headers
                };
            
            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
                credentials: 'include',
                headers
            });
            
            // 타임아웃 타이머 제거
            clearTimeout(timeoutId);

            if (response.status === 401 || response.status === 403) {
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
            
            // 응답 처리
            try {
                const text = await response.text();
                return text ? JSON.parse(text) : {};
            } catch (parseError) {
                console.error('응답 파싱 오류:', parseError);
                return {}; 
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

    // 기존 메서드들
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
        const options = { method: 'DELETE' };
        if (data) {
            options.body = JSON.stringify(data);
        }
        return this.request(endpoint, options);
    }

    // 새로 추가하는 FormData 메서드들
    static async postForm(endpoint, formData) {
        return this.request(endpoint, {
            method: 'POST',
            body: formData
        });
    }

    static async patchForm(endpoint, formData) {
        return this.request(endpoint, {
            method: 'PATCH',
            body: formData
        });
    }
}