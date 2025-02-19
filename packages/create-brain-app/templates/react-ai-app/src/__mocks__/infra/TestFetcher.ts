import { FetcherInterface } from '@/base/port/FetcherInterface';

type MockResponse = Response | (() => Response) | Promise<Response>;

export class TestFetcher implements FetcherInterface {
  private mockResponse?: MockResponse;
  private mockError?: Error;
  private requestCount: number = 0;

  /**
   * 模拟 fetch 请求
   */
  async fetch(
    _url: string | URL | RequestInfo,
    _options: RequestInit
  ): Promise<Response> {
    console.log('TestFetcher: ', _url.toString(), _options);

    this.requestCount++;

    if (this.mockError) {
      throw this.mockError;
    }

    if (this.mockResponse) {
      return typeof this.mockResponse === 'function'
        ? this.mockResponse()
        : this.mockResponse;
    }

    return new Response(null, {
      status: 404,
      statusText: 'Not Found'
    });
  }

  /**
   * 设置模拟响应
   */
  setMockResponse(response: MockResponse): void {
    this.mockResponse = response;
  }

  /**
   * 设置模拟错误
   */
  setMockError(error: Error): void {
    this.mockError = error;
  }

  /**
   * 清除所有模拟数据
   */
  reset(): void {
    this.mockResponse = undefined;
    this.mockError = undefined;
    this.requestCount = 0;
  }

  /**
   * 获取请求历史
   */
  getRequestCount(): number {
    return this.requestCount;
  }
}
