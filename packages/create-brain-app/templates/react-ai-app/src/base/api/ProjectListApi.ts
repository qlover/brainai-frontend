import { settings } from '@/base/kernel/Settings';
import { HttpClient } from './HttpClient';

// 定义一个通用的项目属性类型
export interface ProjectProperties {
  publishUrl?: string;
  previewUrl?: string;
  [key: string]: string | undefined;
}

export interface ProjectListItem {
  id: string;
  created: number;
  updated: number;
  metadata: {
    name: string;
  };
  type: string;
  properties: ProjectProperties;
  version: number;
}

export interface ProjectListResponse {
  items: ProjectListItem[];
  extras: unknown[]; // 如果不确定具体类型，使用 unknown 比 any 更安全
  itemCount: number;
  pageCount: number;
  pageIndex: number;
  pageSize: number;
}

export interface ProjectListParams {
  pageIndex: number;
  pageSize: number;
  sortProperties?: string;
}

export class ProjectListApi {
  constructor(private httpClient: HttpClient) {}

  /**
   * 获取项目列表
   * @param params 分页和排序参数
   * @returns Promise<ProjectListResponse>
   */
  async getProjectList(
    params: ProjectListParams
  ): Promise<ProjectListResponse> {
    const result = await this.httpClient.post(
      `${settings.projectManageApiBaseUrl}/project/find`,
      {},
      undefined,
      {
        ...params,
        sortDirection: 'DESC',
        pageIndex: params.pageIndex - 1
      }
    );

    if (!result) {
      throw new Error('Failed to get project list');
    }

    return result as ProjectListResponse;
  }

  /**
   * 删除项目
   * @param id 项目ID
   * @returns Promise<void>
   */
  async deleteProject(id: number | string): Promise<void> {
    const result = await this.httpClient.post(
      `${settings.projectManageApiBaseUrl}/project/delete`,
      {},
      undefined,
      { id }
    );

    if (!result) {
      throw new Error('Failed to delete project');
    }
  }

  /**
   * 创建新项目
   * @returns Promise<ProjectListItem>
   */
  async createProject(): Promise<ProjectListItem> {
    const result = await this.httpClient.post(
      `${settings.projectManageApiBaseUrl}/project/create`,
      { metadata: { name: 'Untitled' } }
    );

    if (!result) {
      throw new Error('Failed to create project');
    }

    return result as ProjectListItem;
  }
}
