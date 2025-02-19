import { describe, it, expect, beforeEach } from 'vitest';
import { ApiDirectoryApi } from '@/base/api/ApiDirectoryApi';
import { GetIt } from '@/config/register/GetIt';
import { VitestGetIt } from '@/__mocks__/VitestGetIt';
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
} from '@/base/api/DomainTyped/DomainDirectory';
import { AuthStore } from '@/base/store/AuthStore';

describe('ApiDirectoryApi', () => {
  let apiDirectoryApi: ApiDirectoryApi;
  let vitestGetIt: VitestGetIt;

  beforeEach(() => {
    vitestGetIt = new VitestGetIt();
    GetIt.implement(vitestGetIt);
    apiDirectoryApi = GetIt.get(ApiDirectoryApi);
  });

  describe('createDirectory', () => {
    it('应该正确处理 createDirectory 请求', async () => {
      GetIt.get(AuthStore).setToken('123456');
      const mockResponseData: CreateDirectoryResponse = {
        id: '1',
        name: 'Test Directory',
        parentId: 0,
        created: Date.now(),
        updated: Date.now()
      };

      vitestGetIt.getFetcher().setMockResponse(
        new Response(JSON.stringify(mockResponseData), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      );

      const requestData: CreateDirectoryRequest = {
        name: 'Test Directory',
        type: 2
      };

      const response = await apiDirectoryApi.createDirectory(requestData);
      expect(response).toEqual(mockResponseData);
    });

    it('创建目录失败时应抛出错误', async () => {
      GetIt.get(AuthStore).setToken('123456');
      vitestGetIt.getFetcher().setMockResponse(
        new Response(JSON.stringify({ message: '创建目录失败' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        })
      );

      const requestData: CreateDirectoryRequest = {
        name: 'Test Directory',
        type: 2
      };

      await expect(
        apiDirectoryApi.createDirectory(requestData)
      ).rejects.toThrow();
    });
  });

  describe('updateDirectory', () => {
    it('应该正确处理 updateDirectory 请求', async () => {
      GetIt.get(AuthStore).setToken('123456');
      const mockResponse: UpdateDirectoryResponse = {
        id: '1',
        name: 'Updated Directory',
        parentId: 1,
        created: Date.now(),
        updated: Date.now()
      };

      vitestGetIt.getFetcher().setMockResponse(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      );

      const requestData: UpdateDirectoryRequest = {
        id: '1',
        name: 'Updated Directory',
        parentId: 1
      };

      const response = await apiDirectoryApi.updateDirectory(requestData);
      expect(response).toEqual(mockResponse);
    });

    it('更新目录失败时应抛出错误', async () => {
      GetIt.get(AuthStore).setToken('123456');
      vitestGetIt.getFetcher().setMockResponse(
        new Response(JSON.stringify({ message: '更新目录失败' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        })
      );

      const requestData: UpdateDirectoryRequest = {
        id: '1',
        name: 'Updated Directory',
        parentId: 1
      };

      await expect(
        apiDirectoryApi.updateDirectory(requestData)
      ).rejects.toThrow();
    });
  });

  describe('deleteDirectory', () => {
    it('应该正确处理 deleteDirectory 请求', async () => {
      GetIt.get(AuthStore).setToken('123456');
      const mockResponse: DeleteDirectoryResponse = {
        success: true
      };

      vitestGetIt.getFetcher().setMockResponse(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      );

      const requestData: DeleteDirectoryRequest = {
        directoryId: '1'
      };

      const response = await apiDirectoryApi.deleteDirectory(requestData);
      expect(response).toEqual(mockResponse);
    });

    it('删除目录失败时应抛出错误', async () => {
      GetIt.get(AuthStore).setToken('123456');
      vitestGetIt.getFetcher().setMockResponse(
        new Response(JSON.stringify({ message: '删除目录失败' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        })
      );

      const requestData: DeleteDirectoryRequest = {
        directoryId: '1'
      };

      await expect(
        apiDirectoryApi.deleteDirectory(requestData)
      ).rejects.toThrow();
    });
  });

  describe('getFullTreeStructure', () => {
    it('应该正确处理 getFullTreeStructure 请求', async () => {
      GetIt.get(AuthStore).setToken('123456');
      const mockResponse: GetTreeStructureResponse = {
        items: [],
        types: 1
      };

      vitestGetIt.getFetcher().setMockResponse(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      );

      const requestData: GetTreeStructureRequest = {
        type: 2
      };

      const response = await apiDirectoryApi.getFullTreeStructure(requestData);
      expect(response).toEqual(mockResponse);
    });

    it('获取目录树失败时应抛出错误', async () => {
      GetIt.get(AuthStore).setToken('123456');
      vitestGetIt.getFetcher().setMockResponse(
        new Response(JSON.stringify({ message: '获取目录树失败' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        })
      );

      const requestData: GetTreeStructureRequest = {
        type: 2
      };

      await expect(
        apiDirectoryApi.getFullTreeStructure(requestData)
      ).rejects.toThrow();
    });
  });

  describe('createDocument', () => {
    it('应该正确处理 createDocument 请求', async () => {
      GetIt.get(AuthStore).setToken('123456');
      const mockResponse: DocumentDetail = {
        id: '1',
        name: 'Test Document',
        content: 'Test Content',
        parentId: '1',
        created: Date.now(),
        updated: Date.now(),
        enable: true
      };

      vitestGetIt.getFetcher().setMockResponse(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      );

      const requestData: CreateDocumentRequest = {
        name: 'Test Document',
        content: 'Test Content',
        parentId: '1',
        type: 2
      };

      const response = await apiDirectoryApi.createDocument(requestData);
      expect(response).toEqual(mockResponse);
    });

    it('创建文档失败时应抛出错误', async () => {
      GetIt.get(AuthStore).setToken('123456');
      vitestGetIt.getFetcher().setMockResponse(
        new Response(JSON.stringify({ message: '创建文档失败' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        })
      );

      const requestData: CreateDocumentRequest = {
        name: 'Test Document',
        content: 'Test Content',
        parentId: '1',
        type: 2
      };

      await expect(
        apiDirectoryApi.createDocument(requestData)
      ).rejects.toThrow();
    });
  });

  describe('updateDocument', () => {
    it('应该正确处理 updateDocument 请求', async () => {
      GetIt.get(AuthStore).setToken('123456');
      const mockResponse: DocumentDetail = {
        id: '1',
        name: 'Updated Document',
        content: 'Updated Content',
        parentId: '1',
        created: Date.now(),
        updated: Date.now(),
        enable: true
      };

      vitestGetIt.getFetcher().setMockResponse(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      );

      const requestData: UpdateDocumentRequest = {
        id: '1',
        name: 'Updated Document',
        content: 'Updated Content',
        enable: true,
        parentId: '1'
      };

      const response = await apiDirectoryApi.updateDocument(requestData);
      expect(response).toEqual(mockResponse);
    });

    it('更新文档失败时应抛出错误', async () => {
      GetIt.get(AuthStore).setToken('123456');
      vitestGetIt.getFetcher().setMockResponse(
        new Response(JSON.stringify({ message: '更新文档失败' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        })
      );

      const requestData: UpdateDocumentRequest = {
        id: '1',
        name: 'Updated Document',
        content: 'Updated Content',
        enable: true,
        parentId: '1'
      };

      await expect(
        apiDirectoryApi.updateDocument(requestData)
      ).rejects.toThrow();
    });
  });

  describe('deleteDocument', () => {
    it('应该正确处理 deleteDocument 请求', async () => {
      GetIt.get(AuthStore).setToken('123456');
      const mockResponse: DeleteDocumentResponse = {
        content: '',
        id: '1'
      };

      vitestGetIt.getFetcher().setMockResponse(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      );

      const requestData: DeleteDocumentRequest = {
        id: '1'
      };

      const response = await apiDirectoryApi.deleteDocument(requestData);
      expect(response).toEqual(mockResponse);
    });

    it('删除文档失败时应抛出错误', async () => {
      GetIt.get(AuthStore).setToken('123456');
      vitestGetIt.getFetcher().setMockResponse(
        new Response(JSON.stringify({ message: '删除文档失败' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        })
      );

      const requestData: DeleteDocumentRequest = {
        id: '1'
      };

      await expect(
        apiDirectoryApi.deleteDocument(requestData)
      ).rejects.toThrow();
    });
  });

  describe('getDocuments', () => {
    it('应该正确处理 getDocuments 请求', async () => {
      GetIt.get(AuthStore).setToken('123456');
      const mockResponse: DocumentDetail[] = [
        {
          id: '1',
          name: 'Document 1',
          content: 'Content 1',
          parentId: '1',
          created: Date.now(),
          updated: Date.now(),
          enable: true
        }
      ];

      vitestGetIt.getFetcher().setMockResponse(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      );

      const requestData = ['1'];

      const response = await apiDirectoryApi.getDocuments(requestData);
      expect(response).toEqual(mockResponse);
    });

    it('获取文档失败时应抛出错误', async () => {
      GetIt.get(AuthStore).setToken('123456');
      vitestGetIt.getFetcher().setMockResponse(
        new Response(JSON.stringify({ message: '获取文档失败' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        })
      );

      const requestData = ['1'];

      await expect(apiDirectoryApi.getDocuments(requestData)).rejects.toThrow();
    });
  });
});
