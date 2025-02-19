import { redirectToLogin } from '@/uikit/utils/auth';
import { FetcherInterface } from '../port/FetcherInterface';

// 类型定义
interface RequestConfig<T = unknown> extends RequestInit {
  data?: T;
  params?: Record<string, string | number>;
  withAuth?: boolean;
}
export interface ResponseType<T = unknown> {
  code: number;
  data: T;
  message: string;
}
class RequestError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = 'RequestError';
  }
}

type HttpClientOptions = {
  baseUrl: string;
  token: string | (() => string);
  handleError?: (error: unknown) => unknown;
  defaultHeaders?: Record<string, string>;
  fetcher: FetcherInterface;

  /**
   * @default 'token'
   */
  tokenKey?: string;
};

export class HttpClient {
  constructor(private options: HttpClientOptions) {}

  /**
   * 克隆一个新的 HttpClient 实例
   * @param options 新的配置
   * @returns 新的 HttpClient 实例
   */
  clone(options: Partial<HttpClientOptions>): HttpClient {
    return new HttpClient({
      ...this.options,
      ...options
    });
  }

  async request<T = unknown>(
    endpoint: string,
    {
      data,
      params,
      headers: customHeaders,
      withAuth = true,
      ...customConfig
    }: RequestConfig = {}
  ): Promise<T> {
    const url =
      endpoint.startsWith('http') || endpoint.startsWith('https')
        ? new URL(endpoint)
        : new URL(
            `${this.options.baseUrl.replace(/\/+$/, '')}/${endpoint.replace(/^\/+/, '')}`
          );

    // 处理查询参数
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }
    // 处理请求头
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...this.options.defaultHeaders,
      ...(customHeaders as Record<string, string>)
    };
    if (withAuth) {
      const { tokenKey = 'token', token } = this.options;
      const tokenValue = typeof token === 'function' ? token() : token;
      if (tokenValue) {
        headers.Authorization = `${tokenKey} ${tokenValue}`;
      }
    }

    // 构建请求配置
    const config: RequestConfig = {
      method: data ? 'POST' : 'GET',
      headers,
      ...customConfig
    };
    if (data) {
      config.body = JSON.stringify(data);
    }
    try {
      const response = await this.options.fetcher.fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        // 处理 401 错误，跳转到登录页
        if (response.status === 401) {
          // FIXME: 你需要将 redirectToLogin 移动到接口中，在不同环境分别实现跳转
          redirectToLogin();
        }
        throw new RequestError(
          response.status,
          errorData.message || response.statusText
        );
      }
      const result = await response.json();

      return result as T;
    } catch (error) {
      if (this.options.handleError) {
        this.options.handleError(error);
      }

      throw error;
    }
  }

  get<D, T>(
    endpoint: string,
    data?: D,
    config?: RequestConfig,
    params?: Record<string, string | number>
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'GET',
      data,
      params
    });
  }

  post<D, T>(
    endpoint: string,
    data?: D,
    config?: RequestConfig,
    params?: Record<string, string | number>
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      data,
      params
    });
  }

  put<D, T>(endpoint: string, data?: D, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'PUT', data });
  }

  delete<D, T>(endpoint: string, data?: D, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE', data });
  }

  patch<D, T>(endpoint: string, data?: D, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'PATCH', data });
  }
}
