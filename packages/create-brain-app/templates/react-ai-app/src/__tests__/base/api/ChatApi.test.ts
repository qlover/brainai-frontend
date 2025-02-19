import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetIt } from '@/config/register/GetIt';
import { VitestGetIt } from '@/__mocks__/VitestGetIt';
import { ChatApi } from '@/base/api/ChatApi';
import { AuthStore } from '@/base/store/AuthStore';
import {
  XYFlowEdge,
  XYFlowNode,
  XYFlowNodeData
} from '@/base/store/XYFlowStore';

describe('ChatApi', () => {
  let chatApi: ChatApi;
  let vitestGetIt: VitestGetIt;

  beforeEach(() => {
    vitestGetIt = new VitestGetIt();
    GetIt.implement(vitestGetIt);
    chatApi = GetIt.get(ChatApi);
    vi.clearAllMocks();
  });

  describe('getListDesigns', () => {
    it('应该正确处理获取设计列表请求', async () => {
      GetIt.get(AuthStore).setToken('123456');
      const mockResponse = [
        { id: '1', name: 'Design 1' },
        { id: '2', name: 'Design 2' }
      ];

      vitestGetIt.getFetcher().setMockResponse(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      );

      const result = await chatApi.getListDesigns();
      expect(result).toEqual(mockResponse);
    });

    it('获取设计列表失败时应抛出错误', async () => {
      GetIt.get(AuthStore).setToken('123456');
      vitestGetIt.getFetcher().setMockResponse(
        new Response(JSON.stringify({ message: '获取设计列表失败' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        })
      );

      await expect(chatApi.getListDesigns()).rejects.toThrow();
    });
  });

  describe('saveDesign', () => {
    it('应该正确处理保存设计请求', async () => {
      GetIt.get(AuthStore).setToken('123456');
      const mockResponse = { success: true };

      const mockNode: XYFlowNode = {
        id: '1',
        type: 'custom',
        position: { x: 100, y: 100 },
        data: { label: 'Test Node' }
      };

      const mockEdge: XYFlowEdge = {
        id: 'e1',
        source: '1',
        target: '2',
        type: 'custom',
        data: {}
      };

      const mockDesignThinking: XYFlowNodeData = {
        label: 'Test Design'
      };

      const requestData = {
        designId: '1',
        designThinking: mockDesignThinking,
        graphData: {
          nodes: [mockNode],
          edges: [mockEdge]
        },
        history: []
      };

      vitestGetIt.getFetcher().setMockResponse(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      );

      const result = await chatApi.saveDesign(requestData);
      expect(result).toEqual(mockResponse);
    });

    it('保存设计失败时应抛出错误', async () => {
      GetIt.get(AuthStore).setToken('123456');
      vitestGetIt.getFetcher().setMockResponse(
        new Response(JSON.stringify({ message: '保存设计失败' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        })
      );

      const requestData = {
        designId: '1',
        graphData: { nodes: [], edges: [] },
        history: []
      };

      await expect(chatApi.saveDesign(requestData)).rejects.toThrow();
    });
  });

  describe('getDesign', () => {
    it('应该正确处理获取设计请求', async () => {
      GetIt.get(AuthStore).setToken('123456');
      const mockNode: XYFlowNode = {
        id: '1',
        type: 'custom',
        position: { x: 100, y: 100 },
        data: { label: 'Test Node' }
      };

      const mockEdge: XYFlowEdge = {
        id: 'e1',
        source: '1',
        target: '2',
        type: 'custom',
        data: {}
      };

      const mockResponse = {
        currentGraph: {
          nodes: [mockNode],
          edges: [mockEdge]
        },
        history: [
          {
            nodes: [mockNode],
            edges: [mockEdge]
          }
        ]
      };

      vitestGetIt.getFetcher().setMockResponse(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      );

      const result = await chatApi.getDesign('1');
      expect(result).toEqual(mockResponse);
    });

    it('获取设计失败时应抛出错误', async () => {
      GetIt.get(AuthStore).setToken('123456');
      vitestGetIt.getFetcher().setMockResponse(
        new Response(JSON.stringify({ message: '获取设计失败' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        })
      );

      await expect(chatApi.getDesign('1')).rejects.toThrow();
    });
  });

  describe('processCommand', () => {
    it('应该正确处理命令处理请求', async () => {
      GetIt.get(AuthStore).setToken('123456');
      const mockResponse = {
        nodes: [],
        edges: []
      };

      vitestGetIt.getFetcher().setMockResponse(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      );

      const result = await chatApi.processCommand({
        command: 'test command',
        model: 'g'
      });
      expect(result).toEqual(mockResponse);
    });

    it('命令处理失败时应抛出错误', async () => {
      GetIt.get(AuthStore).setToken('123456');
      vitestGetIt.getFetcher().setMockResponse(
        new Response(JSON.stringify({ message: '命令处理失败' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        })
      );

      const command = {
        command: 'test command',
        model: 'g'
      };

      await expect(chatApi.processCommand(command)).rejects.toThrow();
    });
  });
});
