import { FetcherInterface } from '@/base/port/FetcherInterface';

export class BrowserFetch implements FetcherInterface {
  fetch(
    url: string | URL | RequestInfo,
    options?: RequestInit
  ): Promise<Response> {
    return window.fetch(url, options);
  }
}
