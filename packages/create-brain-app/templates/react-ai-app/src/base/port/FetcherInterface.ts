export interface FetcherInterface {
  fetch(url: string | URL, options: RequestInit): Promise<Response>;
  fetch(url: RequestInfo, options?: RequestInit): Promise<Response>;
}
