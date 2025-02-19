import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LayoutBloc } from '@/views/layout/LayoutBloc';
import { GetIt } from '@/config/register/GetIt';
import { VitestGetIt } from '@/__mocks__/VitestGetIt';
import { ProjectStore } from '@/base/store/ProjectStore';
import { XYFlowStore } from '@/base/store/XYFlowStore';
import { SaveProjectService } from '@/base/services/SaveProjectService';
import { ExperimentApi, ProjectResponse } from '@/base/api/ExperimentApi';
import { Toast } from '@/views/components/toast/Toast';
import { Location } from 'react-router-dom';

// 使用 vitest 的依赖注入配置
beforeEach(() => {
  GetIt.implement(new VitestGetIt());
  vi.clearAllMocks();
});

describe('LayoutBloc', () => {
  let bloc: LayoutBloc;
  let projectStore: ProjectStore;
  let xyFlowStore: XYFlowStore;
  let saveProjectService: SaveProjectService;
  let experimentApi: ExperimentApi;

  beforeEach(() => {
    bloc = new LayoutBloc();
    projectStore = GetIt.get(ProjectStore);
    xyFlowStore = GetIt.get(XYFlowStore);
    saveProjectService = GetIt.get(SaveProjectService);
    experimentApi = GetIt.get(ExperimentApi);

    // Mock Toast
    vi.spyOn(Toast, 'success').mockImplementation(() => {});
    vi.spyOn(Toast, 'error').mockImplementation(() => {});
  });

  describe('初始状态', () => {
    it('应该有正确的初始状态', () => {
      expect(bloc.state.showSaveModal.value).toBe(false);
      expect(bloc.state.nextLocation.value).toBeNull();
      expect(bloc.state.isSaving.value).toBe(false);
      expect(bloc.state.notFound.value).toBe(false);
      expect(bloc.state.showActions.value).toBe(false);
    });
  });

  describe('Props 设置', () => {
    it('应该正确设置 props', () => {
      const props = {
        isInitializing: true,
        projectId: '123',
        navigate: vi.fn(),
        location: {
          pathname: '/test',
          search: '',
          hash: '',
          state: {},
          key: ''
        }
      };

      bloc.setProps(props);
      expect(bloc.props).toEqual(props);
    });
  });

  describe('状态重置', () => {
    it('应该正确重置所有状态', () => {
      bloc.state.showSaveModal.value = true;
      bloc.state.nextLocation.value = '/test';

      vi.spyOn(xyFlowStore, 'resetState');
      vi.spyOn(projectStore, 'resetState');

      bloc.resetState();

      expect(bloc.state.showSaveModal.value).toBe(false);
      expect(xyFlowStore.resetState).toHaveBeenCalled();
      expect(projectStore.resetState).toHaveBeenCalled();
    });
  });

  describe('页面刷新和关闭处理', () => {
    it('如果有未保存的更改,应该阻止页面关闭', () => {
      const event = new Event('beforeunload') as BeforeUnloadEvent;
      vi.spyOn(event, 'preventDefault');
      vi.spyOn(projectStore, 'hasUnsavedChanges').mockReturnValue(true);

      bloc.handleBeforeUnload(event);

      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('如果没有未保存的更改,不应该阻止页面关闭', () => {
      const event = new Event('beforeunload') as BeforeUnloadEvent;
      vi.spyOn(event, 'preventDefault');
      vi.spyOn(projectStore, 'hasUnsavedChanges').mockReturnValue(false);

      bloc.handleBeforeUnload(event);

      expect(event.preventDefault).not.toHaveBeenCalled();
    });
  });

  describe('保存和退出', () => {
    it('应该正确保存项目并处理导航', async () => {
      bloc.props.projectId = '123';
      bloc.state.nextLocation.value = '/next';
      vi.spyOn(saveProjectService, 'handleSave').mockResolvedValue(undefined);
      vi.spyOn(bloc, 'handleLocationChange');

      await bloc.handleSaveAndExit();

      expect(saveProjectService.handleSave).toHaveBeenCalled();
      expect(Toast.success).toHaveBeenCalledWith('Project saved successfully');
      expect(bloc.handleLocationChange).toHaveBeenCalled();
      expect(bloc.state.isSaving.value).toBe(false);
    });

    it('保存失败时应该显示错误提示', async () => {
      bloc.props.projectId = '123';
      vi.spyOn(saveProjectService, 'handleSave').mockRejectedValue(new Error());

      await bloc.handleSaveAndExit();

      expect(Toast.error).toHaveBeenCalledWith('Failed to save project');
      expect(bloc.state.isSaving.value).toBe(false);
    });
  });

  describe('标题保存', () => {
    it('应该正确更新项目标题', async () => {
      const newTitle = '新标题';
      const mockResponse: ProjectResponse = {
        metadata: { name: newTitle },
        id: '123',
        created: 123,
        updated: 123,
        version: 1,
        type: 'project',
        properties: {}
      };
      vi.spyOn(experimentApi, 'updateProject').mockResolvedValue(mockResponse);
      vi.spyOn(projectStore, 'setMetadata');

      await bloc.handleSaveTitle(newTitle);

      expect(experimentApi.updateProject).toHaveBeenCalled();
      expect(projectStore.setMetadata).toHaveBeenCalledWith(
        mockResponse.metadata
      );
    });
  });

  describe('项目 ID 设置', () => {
    it('初始化时不应该进行 ID 检查', () => {
      bloc.props.isInitializing = true;
      bloc.setupProjectId();
      expect(bloc.state.notFound.value).toBe(false);
    });

    it('无效的项目 ID 应该设置 notFound 为 true', () => {
      bloc.props.isInitializing = false;
      bloc.props.projectId = 'invalid-id';
      bloc.props.location.pathname = '/project';

      bloc.setupProjectId();

      expect(bloc.state.notFound.value).toBe(true);
    });
  });

  describe('路由拦截器', () => {
    it('当有未保存的更改时应该拦截路由变化', () => {
      const currentLocation: Location = {
        pathname: '/current',
        search: '',
        hash: '',
        state: {},
        key: ''
      };

      const nextLocation: Location = {
        pathname: '/next',
        search: '',
        hash: '',
        state: {},
        key: ''
      };

      vi.spyOn(projectStore, 'hasUnsavedChanges').mockReturnValue(true);

      const result = bloc.handleLocationCompare(currentLocation, nextLocation);
      expect(result).toBe(true);
    });

    it('应该正确处理路由拦截器', () => {
      const blocker = {
        state: 'blocked',
        location: { pathname: '/reactflow/test' }
      } as any;

      bloc.handleBlocker(blocker);

      expect(bloc.state.showSaveModal.value).toBe(true);
      expect(bloc.state.nextLocation.value).toBe('/test');
    });
  });
});
