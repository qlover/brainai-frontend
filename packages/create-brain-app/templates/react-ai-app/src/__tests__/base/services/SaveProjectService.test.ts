import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SaveProjectService } from '@/base/services/SaveProjectService';
import { ProjectStore } from '@/base/store/ProjectStore';
import { ProjectApi, UpdateFileResponse } from '@/base/api/ProjectApi';
import {
  ExperimentApi,
  ProjectResponse,
  Metadata
} from '@/base/api/ExperimentApi';
import { SaveStore } from '@/base/store/SaveStore';
import { XYFlowStore } from '@/base/store/XYFlowStore';
import { SaveEventsInterface } from '@/base/port/SaveEventsInterface';

// Mock SaveEvents
class MockSaveEvents implements SaveEventsInterface {
  onMetadataSaved(message?: string): void {}
  onSaveError(error: unknown): void {}
}

describe('SaveProjectService', () => {
  let saveProjectService: SaveProjectService;
  let projectApi: ProjectApi;
  let projectStore: ProjectStore;
  let experimentApi: ExperimentApi;
  let saveStore: SaveStore;
  let saveEvents: MockSaveEvents;
  let xyFlowStore: XYFlowStore;

  beforeEach(() => {
    // 创建所有依赖的模拟实例
    projectApi = {
      updateFile: vi.fn()
    } as unknown as ProjectApi;

    projectStore = {
      state: {
        metadata: {
          code: '',
          nodes: '',
          edges: '',
          name: 'test-project'
        },
        hasPreviewUrl: false,
        hasPublishUrl: false,
        properties: {}
      },
      setHasPreviewUrl: vi.fn(),
      setMetadata: vi.fn(),
      setProperties: vi.fn()
    } as unknown as ProjectStore;

    experimentApi = {
      updateProject: vi.fn()
    } as unknown as ExperimentApi;

    saveStore = {
      startLoading: vi.fn(),
      stopLoading: vi.fn()
    } as unknown as SaveStore;

    saveEvents = {
      onMetadataSaved: vi.fn(),
      onSaveError: vi.fn()
    } as unknown as MockSaveEvents;

    xyFlowStore = {
      state: {
        nodes: [],
        edges: []
      }
    } as unknown as XYFlowStore;

    saveProjectService = new SaveProjectService(
      projectApi,
      projectStore,
      experimentApi,
      saveStore,
      saveEvents,
      xyFlowStore
    );
  });

  describe('updateFile', () => {
    it('当更新文件成功时应该设置hasPreviewUrl为true', async () => {
      const mockResponse: UpdateFileResponse = {
        filePath: 'index.html',
        content: 'test-content',
        projectId: 'test-project-id',
        url: 'test-url'
      };
      vi.spyOn(projectApi, 'updateFile').mockResolvedValue(mockResponse);

      await saveProjectService.updateFile('test-project-id');

      expect(projectApi.updateFile).toHaveBeenCalledWith({
        filePath: 'index.html',
        content: '',
        projectId: 'test-project-id'
      });
      expect(projectStore.setHasPreviewUrl).toHaveBeenCalledWith(true);
    });

    it('当更新文件失败时应该抛出错误', async () => {
      vi.spyOn(projectApi, 'updateFile').mockResolvedValue(
        {} as UpdateFileResponse
      );

      await expect(
        saveProjectService.updateFile('test-project-id')
      ).rejects.toThrow('Failed to update file');
    });
  });

  describe('handleSave', () => {
    it('当有代码时应该先更新文件再更新项目', async () => {
      const projectId = 'test-project-id';
      const updateData: Metadata = {
        code: 'test-code',
        hasPreviewUrl: false,
        name: 'test-project',
        nodes: '',
        edges: ''
      };
      const mockResponse: ProjectResponse = {
        id: projectId,
        metadata: updateData,
        properties: {
          publishUrl: 'test-publish-url',
          previewUrl: 'test-preview-url'
        },
        created: 0,
        updated: 0,
        version: 1,
        type: 'project'
      };

      projectStore.state.metadata.code = 'test-code';
      vi.spyOn(projectApi, 'updateFile').mockResolvedValue({
        filePath: 'index.html',
        content: 'test-content',
        projectId: 'test-project-id',
        url: 'test-url'
      });
      vi.spyOn(experimentApi, 'updateProject').mockResolvedValue(mockResponse);

      const result = await saveProjectService.handleSave(projectId, updateData);

      expect(projectApi.updateFile).toHaveBeenCalled();
      expect(experimentApi.updateProject).toHaveBeenCalledWith(projectId, {
        metadata: { ...updateData, hasPreviewUrl: true }
      });
      expect(result).toEqual(mockResponse);
    });

    it('当没有代码时应该只更新项目', async () => {
      const projectId = 'test-project-id';
      const updateData: Metadata = {
        hasPreviewUrl: false,
        name: 'test-project',
        nodes: '',
        edges: ''
      };
      const mockResponse: ProjectResponse = {
        id: projectId,
        metadata: updateData,
        properties: {
          publishUrl: 'test-publish-url',
          previewUrl: 'test-preview-url'
        },
        created: 0,
        updated: 0,
        version: 1,
        type: 'project'
      };

      vi.spyOn(experimentApi, 'updateProject').mockResolvedValue(mockResponse);

      const result = await saveProjectService.handleSave(projectId, updateData);

      expect(projectApi.updateFile).not.toHaveBeenCalled();
      expect(experimentApi.updateProject).toHaveBeenCalledWith(projectId, {
        metadata: updateData
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('save', () => {
    it('当保存成功时应该更新store并触发成功回调', async () => {
      const projectId = 'test-project-id';
      const message = 'test-message';
      const mockResponse: ProjectResponse = {
        id: projectId,
        metadata: {
          code: 'test-code',
          name: 'test-project',
          nodes: '',
          edges: ''
        },
        properties: {
          publishUrl: 'test-publish-url',
          previewUrl: 'test-preview-url'
        },
        created: 0,
        updated: 0,
        version: 1,
        type: 'project'
      };

      vi.spyOn(experimentApi, 'updateProject').mockResolvedValue(mockResponse);

      await saveProjectService.save({ projectId, message });

      expect(saveStore.startLoading).toHaveBeenCalled();
      expect(projectStore.setMetadata).toHaveBeenCalledWith(
        mockResponse.metadata
      );
      expect(projectStore.setProperties).toHaveBeenCalledWith({
        publishUrl: mockResponse.properties.publishUrl,
        previewUrl: mockResponse.properties.previewUrl
      });
      expect(saveEvents.onMetadataSaved).toHaveBeenCalledWith(message);
      expect(saveStore.stopLoading).toHaveBeenCalled();
    });

    it('当没有projectId时应该抛出错误', async () => {
      await saveProjectService.save({ projectId: '' });

      expect(saveEvents.onSaveError).toHaveBeenCalled();
      expect(saveStore.stopLoading).toHaveBeenCalled();
    });

    it('当保存失败时应该触发错误回调', async () => {
      const error = new Error('Save failed');
      vi.spyOn(experimentApi, 'updateProject').mockRejectedValue(error);

      try {
        await saveProjectService.save({ projectId: 'test-project-id' });
      } catch (err) {
        // 错误会被 SaveProjectService 捕获并处理
      }

      expect(saveEvents.onSaveError).toHaveBeenCalledWith(error);
      expect(saveStore.stopLoading).toHaveBeenCalled();
    });
  });
});
