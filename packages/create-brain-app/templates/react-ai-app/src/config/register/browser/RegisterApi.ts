import { ApiDirectoryApi } from '@/base/api/ApiDirectoryApi';
import { ChatApi } from '@/base/api/ChatApi';
import { ExperimentApi } from '@/base/api/ExperimentApi';
import { HttpClient } from '@/base/api/HttpClient';
import { ImagicaReactflowApi } from '@/base/api/ImagicaReactflowApi';
import { ProjectApi } from '@/base/api/ProjectApi';
import { ProjectListApi } from '@/base/api/ProjectListApi';
import { UserApi } from '@/base/api/UserApi';
import { settings } from '@/base/kernel/Settings';
import {
  GetItContainerInterface,
  RegisterInterface
} from '@/base/port/GetItContainerInterface';
import { AuthStore } from '@/base/store/AuthStore';
import { GetItDependencies } from '../BrowserGetIt';

function handleError(error: unknown) {
  console.error('request error:', error);
}

export class RegisterApi implements RegisterInterface {
  constructor(private dependencies: GetItDependencies) {}

  configure(container: GetItContainerInterface): void {
    const imagicaApiClient = new HttpClient({
      baseUrl: settings.reactFlowApiUrl,
      fetcher: this.dependencies.fetcher,
      token: () => container.get(AuthStore).getToken(),
      handleError
    });

    const imagicaReactFlowApiClient = imagicaApiClient.clone({
      baseUrl: settings.reactFlowApiUrl
    });

    const domainApiClient = imagicaApiClient.clone({
      baseUrl: settings.domainApiUrl
    });

    const projectApiClient = imagicaApiClient.clone({
      baseUrl: settings.projectManageApiBaseUrl
    });

    const userApiClient = imagicaApiClient.clone({
      baseUrl: settings.imagicaApiUrl
    });

    container.bind(ChatApi, new ChatApi(imagicaApiClient));
    container.bind(
      ImagicaReactflowApi,
      new ImagicaReactflowApi(imagicaReactFlowApiClient)
    );
    container.bind(ProjectApi, new ProjectApi(domainApiClient));
    container.bind(ExperimentApi, new ExperimentApi(imagicaApiClient));
    container.bind(ProjectListApi, new ProjectListApi(imagicaApiClient));
    container.bind(ApiDirectoryApi, new ApiDirectoryApi(projectApiClient));
    container.bind(UserApi, new UserApi(userApiClient));
  }
}
