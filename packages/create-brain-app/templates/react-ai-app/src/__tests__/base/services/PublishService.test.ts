import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PublishService } from '@/base/services/PublishService';
import { ProjectApi, PublishResponse } from '@/base/api/ProjectApi';
import { ProjectStore } from '@/base/store/ProjectStore';
import { PublishStore } from '@/base/store/PublishStore';
import { SaveProjectService } from '@/base/services/SaveProjectService';

describe('PublishService', () => {
  let publishService: PublishService;
  let publishStore: PublishStore;
  let projectApi: ProjectApi;
  let saveProjectService: SaveProjectService;
  let projectStore: ProjectStore;

  beforeEach(() => {
    // 创建所有依赖的模拟实例
    publishStore = {
      state: {
        publishLoading: false,
        unPublishLoading: false,
        showPublishModal: false,
        publishedUrl: '',
        publishError: null
      },
      openPublishPopup: vi.fn(),
      closePublishPopup: vi.fn(),
      startLoading: vi.fn(),
      stopLoading: vi.fn(),
      changePublishedUrl: vi.fn(),
      setPublishError: vi.fn(),
      setUnPublishLoading: vi.fn()
    } as unknown as PublishStore;

    projectApi = {
      publish: vi.fn(),
      unpublish: vi.fn()
    } as unknown as ProjectApi;

    saveProjectService = {
      save: vi.fn()
    } as unknown as SaveProjectService;

    projectStore = {
      state: {
        projectId: 'test-project-id',
        properties: {
          publishUrl: 'test-publish-url'
        }
      },
      setHasPublishUrl: vi.fn()
    } as unknown as ProjectStore;

    publishService = new PublishService(
      publishStore,
      projectApi,
      saveProjectService,
      projectStore
    );
  });

  describe('triggerPublish', () => {
    it('当有publishUrl时应该打开发布弹窗', () => {
      publishService.triggerPublish();

      expect(publishStore.openPublishPopup).toHaveBeenCalledWith(
        'test-publish-url'
      );
    });

    it('当没有publishUrl时不应该打开弹窗', () => {
      projectStore.state.properties = {};

      publishService.triggerPublish();

      expect(publishStore.openPublishPopup).not.toHaveBeenCalled();
    });
  });

  describe('publish', () => {
    it('当发布成功时应该更新状态并保存', async () => {
      const mockPublishResponse: PublishResponse = {
        properties: {
          publishUrl: 'new-publish-url',
          previewUrl: 'test-preview-url'
        }
      };
      vi.spyOn(projectApi, 'publish').mockResolvedValue(mockPublishResponse);

      await publishService.publish();

      expect(publishStore.startLoading).toHaveBeenCalled();
      expect(saveProjectService.save).toHaveBeenCalled();
      expect(projectApi.publish).toHaveBeenCalledWith('test-project-id');
      expect(publishStore.changePublishedUrl).toHaveBeenCalledWith(
        'new-publish-url'
      );
      expect(projectStore.setHasPublishUrl).toHaveBeenCalledWith(true);
      expect(saveProjectService.save).toHaveBeenCalledWith({
        message: 'Project published successfully'
      });
      expect(publishStore.openPublishPopup).toHaveBeenCalled();
      expect(publishStore.stopLoading).toHaveBeenCalled();
    });

    it('当发布失败时应该设置错误信息', async () => {
      const error = new Error('Publish failed');
      vi.spyOn(projectApi, 'publish').mockRejectedValue(error);

      await publishService.publish();

      expect(publishStore.setPublishError).toHaveBeenCalledWith(
        'Publish failed'
      );
      expect(publishStore.stopLoading).toHaveBeenCalled();
    });

    it('当发布响应没有URL时应该抛出错误', async () => {
      vi.spyOn(projectApi, 'publish').mockResolvedValue({
        properties: {
          publishUrl: '',
          previewUrl: ''
        }
      } as PublishResponse);

      await publishService.publish();

      expect(publishStore.setPublishError).toHaveBeenCalledWith(
        'Publish URL is not available'
      );
      expect(publishStore.stopLoading).toHaveBeenCalled();
    });
  });

  describe('unPublish', () => {
    it('当取消发布成功时应该更新状态并保存', async () => {
      await publishService.unPublish();

      expect(publishStore.setUnPublishLoading).toHaveBeenCalledWith(true);
      expect(projectApi.unpublish).toHaveBeenCalledWith('test-project-id');
      expect(projectStore.setHasPublishUrl).toHaveBeenCalledWith(false);
      expect(saveProjectService.save).toHaveBeenCalledWith({
        message: 'Project unpublished successfully'
      });
      expect(publishStore.closePublishPopup).toHaveBeenCalled();
      expect(publishStore.setUnPublishLoading).toHaveBeenCalledWith(false);
    });

    it('当取消发布失败时应该正确处理错误', async () => {
      const error = new Error('Unpublish failed');
      vi.spyOn(projectApi, 'unpublish').mockRejectedValue(error);

      await publishService.unPublish();

      expect(publishStore.setUnPublishLoading).toHaveBeenCalledWith(true);
      expect(projectApi.unpublish).toHaveBeenCalledWith('test-project-id');
      expect(publishStore.setUnPublishLoading).toHaveBeenCalledWith(false);
    });

    it('当projectId不存在时应该使用空字符串', async () => {
      projectStore.state.projectId = '';

      await publishService.unPublish();

      expect(projectApi.unpublish).toHaveBeenCalledWith('');
    });
  });
});
