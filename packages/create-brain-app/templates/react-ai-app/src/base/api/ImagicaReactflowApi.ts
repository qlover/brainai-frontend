import { HttpClient } from './HttpClient';

export type ApiResult<Req, Res> = {
  request: Req;
  response: Res;
};

export type GetSuggestionsApiResult = ApiResult<
  { input: string },
  {
    selectedApis?: string[];
    selectedApiNames?: string[];
    explanation?: string;
    error?: string;
  }
>;

export type ProcessDesignWithCodeApiResult = ApiResult<
  { prompt: string; apis: string[] },
  { code: string } | { error: string }
>;

export class ImagicaReactflowApi {
  constructor(private readonly httpClient: HttpClient) {}

  getSuggestionsApi(
    data: GetSuggestionsApiResult['request']
  ): Promise<GetSuggestionsApiResult['response']> {
    return this.httpClient.post('/suggest-apis', data);
  }

  processDesignWithCode(
    data: ProcessDesignWithCodeApiResult['request']
  ): Promise<ProcessDesignWithCodeApiResult['response']> {
    return this.httpClient.post('/process-design-with-code', data);
  }
}
