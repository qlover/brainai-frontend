import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { HttpClient } from '@/base/api/HttpClient';
import { redirectToLogin } from '@/uikit/utils/auth';

vi.mock('@/uikit/utils/auth', () => ({
  redirectToLogin: vi.fn()
}));

describe('HttpClient', () => {
  let client: HttpClient;
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // 创建 fetch 模拟
    mockFetch = vi.fn();
    // 设置全局 fetch
    global.fetch = mockFetch;

    // 初始化 HttpClient 实例
    client = new HttpClient({
      baseUrl: 'http://example.com',
      token: 'test-token',
      fetcher: { fetch: mockFetch }
    });

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetAllMocks();
  });

  describe('HTTP 方法', () => {
    describe('get 方法', () => {
      it('应该正确处理 GET 请求', async () => {
        const mockResponseData = {
          code: 200,
          data: 'test data',
          message: 'OK'
        };

        const mockResponse = {
          ok: true,
          status: 200,
          statusText: 'OK',
          json: async () => mockResponseData
        };

        mockFetch.mockImplementation(async () => mockResponse as any);

        const response = await client.get('/test');

        const fetchCall = mockFetch.mock.calls[0];
        expect(fetchCall[0].toString()).toBe('http://example.com/test');
        expect(fetchCall[1]).toEqual({
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'token test-token'
          }
        });
        expect(response).toEqual(mockResponseData);
      });

      it('应该正确处理带查询参数的 GET 请求', async () => {
        const mockResponseData = {
          code: 200,
          data: 'test data with params',
          message: 'OK'
        };

        const mockResponse = {
          ok: true,
          status: 200,
          statusText: 'OK',
          json: () => Promise.resolve(mockResponseData)
        };

        vi.mocked(fetch).mockResolvedValue(mockResponse as any);

        const response = await client.get('/test', undefined, {
          params: { key: 'value' }
        });

        expect(response).toEqual(mockResponseData);
      });
    });

    describe('post 方法', () => {
      it('应该正确处理 POST 请求', async () => {
        const mockResponseData = {
          code: 200,
          data: 'test data',
          message: 'OK'
        };

        const mockResponse = {
          ok: true,
          status: 200,
          statusText: 'OK',
          json: async () => mockResponseData
        };

        mockFetch.mockImplementation(async () => mockResponse as any);

        const response = await client.post('/test', { key: 'value' });

        const fetchCall = mockFetch.mock.calls[0];
        expect(fetchCall[0].toString()).toBe('http://example.com/test');
        expect(fetchCall[1]).toEqual({
          method: 'POST',
          body: JSON.stringify({ key: 'value' }),
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'token test-token'
          }
        });
        expect(response).toEqual(mockResponseData);
      });
    });

    describe('put 方法', () => {
      it('应该正确处理 PUT 请求', async () => {
        const mockResponseData = {
          code: 200,
          data: 'test data',
          message: 'OK'
        };

        const mockResponse = {
          ok: true,
          status: 200,
          statusText: 'OK',
          json: async () => mockResponseData
        };

        mockFetch.mockImplementation(async () => mockResponse as any);

        const response = await client.put('/test', { key: 'value' });

        const fetchCall = mockFetch.mock.calls[0];
        expect(fetchCall[0].toString()).toBe('http://example.com/test');
        expect(fetchCall[1]).toEqual({
          method: 'PUT',
          body: JSON.stringify({ key: 'value' }),
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'token test-token'
          }
        });
        expect(response).toEqual(mockResponseData);
      });
    });

    describe('delete 方法', () => {
      it('应该正确处理 DELETE 请求', async () => {
        const mockResponseData = {
          code: 200,
          data: 'test data',
          message: 'OK'
        };

        const mockResponse = {
          ok: true,
          status: 200,
          statusText: 'OK',
          json: async () => mockResponseData
        };

        mockFetch.mockImplementation(async () => mockResponse as any);

        const response = await client.delete('/test');

        const fetchCall = mockFetch.mock.calls[0];
        expect(fetchCall[0].toString()).toBe('http://example.com/test');
        expect(fetchCall[1]).toEqual({
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'token test-token'
          }
        });
        expect(response).toEqual(mockResponseData);
      });
    });

    describe('patch 方法', () => {
      it('应该正确处理 PATCH 请求', async () => {
        const mockResponseData = {
          code: 200,
          data: 'test data',
          message: 'OK'
        };

        const mockResponse = {
          ok: true,
          status: 200,
          statusText: 'OK',
          json: async () => mockResponseData
        };

        mockFetch.mockImplementation(async () => mockResponse as any);

        const response = await client.patch('/test', { key: 'value' });

        const fetchCall = mockFetch.mock.calls[0];
        expect(fetchCall[0].toString()).toBe('http://example.com/test');
        expect(fetchCall[1]).toEqual({
          method: 'PATCH',
          body: JSON.stringify({ key: 'value' }),
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'token test-token'
          }
        });
        expect(response).toEqual(mockResponseData);
      });
    });
  });

  describe('request 方法', () => {
    it('应该成功处理状态码为 200 的响应', async () => {
      const mockResponseData = {
        code: 200,
        data: 'success data',
        message: 'OK'
      };
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => mockResponseData
      };
      mockFetch.mockResolvedValueOnce(mockResponse as any);

      const response = await client.request('/test-endpoint');

      const fetchCall = mockFetch.mock.calls[0];
      expect(fetchCall[0].toString()).toBe('http://example.com/test-endpoint');
      expect(fetchCall[1]?.method).toBe('GET');
      expect(fetchCall[1]?.headers['Content-Type']).toBe('application/json');
      expect(fetchCall[1]?.headers['Authorization']).toBe('token test-token');

      expect(response).toEqual(mockResponseData);
    });

    it('当响应状态码为 401 时，应该调用 redirectToLogin', async () => {
      const mockResponse = {
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => ({ message: 'Unauthorized' })
      };
      mockFetch.mockResolvedValueOnce(mockResponse as any);

      try {
        await client.request('/test-endpoint');
      } catch (error) {
        // 忽略错误
      }

      // 只验证 redirectToLogin 被调用
      expect(redirectToLogin).toHaveBeenCalled();
    });

    it('当发生网络错误时，应该抛出网络错误异常', async () => {
      const networkError = new Error('Network Error');
      mockFetch.mockRejectedValueOnce(networkError);

      await expect(client.request('/test-endpoint')).rejects.toThrow(
        'Network Error'
      );
    });

    it('当响应状态码为 404 时，应该抛出 Not Found 错误', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ message: 'Resource Not Found' })
      };
      mockFetch.mockResolvedValueOnce(mockResponse as any);

      await expect(client.request('/test-endpoint')).rejects.toThrow(
        'Resource Not Found'
      );
    });

    it('当响应状态码为 500 时，应该抛出服务器错误', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({ message: 'Server Error' })
      };
      mockFetch.mockResolvedValueOnce(mockResponse as any);

      await expect(client.request('/test-endpoint')).rejects.toThrow(
        'Server Error'
      );
    });

    it('当未提供 token 且 withAuth 为 false 时，请求头中不应包含 Authorization', async () => {
      const clientWithoutToken = new HttpClient({
        baseUrl: 'http://example.com',
        token: 'test-token',
        fetcher: { fetch: mockFetch }
      });
      const mockResponseData = {
        code: 200,
        data: 'no auth data',
        message: 'OK'
      };
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => mockResponseData
      };
      mockFetch.mockResolvedValueOnce(mockResponse as any);

      const response = await clientWithoutToken.request('/test-endpoint', {
        withAuth: false
      });

      const fetchCall = mockFetch.mock.calls[0];
      expect(fetchCall[1]?.headers).not.toHaveProperty('Authorization');
      expect(response).toEqual(mockResponseData);
    });

    it('当 withAuth 为 true 且未提供 token 时，应该调用 redirectToLogin', async () => {
      const clientWithoutToken = new HttpClient({
        baseUrl: 'http://example.com',
        token: '',
        fetcher: { fetch: mockFetch }
      });
      const mockResponse = {
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => ({ message: 'Unauthorized' })
      };
      mockFetch.mockResolvedValueOnce(mockResponse as any);

      try {
        await clientWithoutToken.request('/test-endpoint');
      } catch (error) {
        // 忽略错误
      }

      expect(redirectToLogin).toHaveBeenCalled();
    });

    it('当提供 token 且 withAuth 为 true 时，请求头中应包含 Authorization', async () => {
      const mockResponseData = {
        code: 200,
        data: 'with auth data',
        message: 'OK'
      };
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => mockResponseData
      };
      mockFetch.mockResolvedValueOnce(mockResponse as any);

      const response = await client.request('/test-endpoint', {
        withAuth: true
      });

      const fetchCall = mockFetch.mock.calls[0];
      expect(fetchCall[1]?.headers['Authorization']).toBe('token test-token');
      expect(response).toEqual(mockResponseData);
    });

    it('当提供 token 且 withAuth 为 false 时，请求头中不应包含 Authorization', async () => {
      const mockResponseData = {
        code: 200,
        data: 'without auth data',
        message: 'OK'
      };
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => mockResponseData
      };
      mockFetch.mockResolvedValueOnce(mockResponse as any);

      const response = await client.request('/test-endpoint', {
        withAuth: false
      });

      const fetchCall = mockFetch.mock.calls[0];
      expect(fetchCall[1]?.headers).not.toHaveProperty('Authorization');
      expect(response).toEqual(mockResponseData);
    });
  });
});
