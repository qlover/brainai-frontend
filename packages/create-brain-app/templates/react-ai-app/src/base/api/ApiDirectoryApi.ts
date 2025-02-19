import { HttpClient } from './HttpClient';
import {
  CreateDirectoryRequest,
  CreateDirectoryResponse,
  UpdateDirectoryRequest,
  UpdateDirectoryResponse,
  DeleteDirectoryRequest,
  DeleteDirectoryResponse,
  GetTreeStructureRequest,
  GetTreeStructureResponse,
  CreateDocumentRequest,
  UpdateDocumentRequest,
  DeleteDocumentRequest,
  DeleteDocumentResponse,
  DocumentDetail
} from './DomainTyped/DomainDirectory';

export class ApiDirectoryApi {
  constructor(private httpClient: HttpClient) {}

  /**
   * 创建新目录
   * @param data 目录创建参数
   * @returns 创建成功的目录信息
   */
  createDirectory(
    data: CreateDirectoryRequest
  ): Promise<CreateDirectoryResponse> {
    return this.httpClient.post('/apiDocument/createDirectory', data);
  }

  /**
   * 更新目录信息
   * @param data 目录更新参数
   * @returns 更新后的目录信息
   */
  updateDirectory(
    data: UpdateDirectoryRequest
  ): Promise<UpdateDirectoryResponse> {
    return this.httpClient.post('/apiDocument/updateDirectory', {
      id: data.id,
      name: data.name,
      parentId: data?.parentId || 0
    });
  }

  /**
   * 删除指定目录
   * @param data 目录删除参数
   * @returns 删除操作结果
   */
  deleteDirectory(
    data: DeleteDirectoryRequest
  ): Promise<DeleteDirectoryResponse> {
    return this.httpClient.delete(
      `/apiDocument/deleteDirectory?id=${data.directoryId}`
    );
  }

  /**
   * 获取完整的目录树结构
   * @param data 可选的查询参数
   * @returns 目录树结构数据
   */
  getFullTreeStructure(
    data?: GetTreeStructureRequest
  ): Promise<GetTreeStructureResponse> {
    return this.httpClient.get(
      `/apiDocument/getFullTreeStructure?type=${data?.type || 2}`
    );
  }

  /**
   * 创建新的API文档
   * @param data 文档创建参数
   * @returns 创建成功的文档详情
   */
  createDocument(data: CreateDocumentRequest): Promise<DocumentDetail> {
    return this.httpClient.post('/apiDocument/createDocument', data);
  }

  /**
   * 更新API文档内容
   * @param data 文档更新参数
   * @returns 更新后的文档详情
   */
  updateDocument(data: UpdateDocumentRequest): Promise<DocumentDetail> {
    return this.httpClient.post('/apiDocument/updateDocument', data);
  }

  /**
   * 删除指定的API文档
   * @param data 文档删除参数
   * @returns 删除操作结果
   */
  deleteDocument(data: DeleteDocumentRequest): Promise<DeleteDocumentResponse> {
    return this.httpClient.delete(`/apiDocument/deleteDocument?id=${data.id}`);
  }

  /**
   * 批量获取API文档详情
   * @param data 文档ID数组
   * @returns 文档详情数组
   */
  getDocuments(data: string[]): Promise<DocumentDetail[]> {
    return this.httpClient.post('/apiDocument/getDocuments', data);
  }
}
