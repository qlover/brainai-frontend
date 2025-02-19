import { HttpClient } from './HttpClient';

export interface UpdateFileRequest {
  filePath: string;
  content: string;
  projectId: string;
}

export interface UpdateFileResponse {
  filePath: string;
  content: string;
  projectId: string;
  url: string;
}

export interface PublishResponse {
  properties: {
    publishUrl: string;
    previewUrl: string;
  };
}

export class ProjectApi {
  constructor(private httpClient: HttpClient) {}

  /**
   * 更新项目文件内容
   * @param data 更新文件请求参数
   * @returns Promise<UpdateFileResponse>
   */
  updateFile(data: UpdateFileRequest): Promise<UpdateFileResponse> {
    return this.httpClient.post('/api/filemanager/file-manager/update', data);
  }

  /**
   * 发布项目
   * @param projectId 项目ID
   * @returns Promise<PublishResponse>
   */
  publish(projectId: string): Promise<PublishResponse> {
    return this.httpClient.post(
      `/api/imagica/project/publish?id=${projectId}`,
      {}
    );
  }

  /**
   * 取消发布项目
   * @param projectId 项目ID
   * @returns Promise<PublishResponse>
   */
  unpublish(projectId: string): Promise<PublishResponse> {
    return this.httpClient.post(
      `/api/imagica/project/unpublish?id=${projectId}`,
      {}
    );
  }
}
