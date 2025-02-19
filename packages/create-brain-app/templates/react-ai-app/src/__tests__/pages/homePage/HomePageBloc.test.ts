import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HomePageBloc } from '@/pages/HomePage/HomePageBloc';
import { GetIt } from '@/config/register/GetIt';
import {
  ProjectListApi,
  ProjectListItem,
  ProjectListResponse
} from '@/base/api/ProjectListApi';
import { VitestGetIt } from '@/__mocks__/VitestGetIt';
import { Modal } from 'antd';

describe('HomePageBloc', () => {
  let bloc: HomePageBloc;
  let projectListApi: ProjectListApi;

  beforeEach(() => {
    GetIt.implement(new VitestGetIt());
    projectListApi = GetIt.get(ProjectListApi);
    bloc = new HomePageBloc();

    // Mock Modal.confirm
    vi.spyOn(Modal, 'confirm');
  });

  describe('初始状态', () => {
    it('应该有正确的初始状态', () => {
      expect(bloc.state.projects.value).toEqual([]);
      expect(bloc.state.loading.value).toBe(false);
    });
  });

  describe('fetchProjects', () => {
    it('成功获取项目列表时应该更新状态', async () => {
      const mockProjects: ProjectListItem[] = [
        {
          id: '1',
          metadata: { name: 'Project 1' },
          created: Date.now(),
          updated: Date.now(),
          type: 'project',
          properties: {},
          version: 1
        },
        {
          id: '2',
          metadata: { name: 'Project 2' },
          created: Date.now(),
          updated: Date.now(),
          type: 'project',
          properties: {},
          version: 1
        }
      ];
      vi.spyOn(projectListApi, 'getProjectList').mockResolvedValue({
        items: mockProjects,
        extras: [],
        itemCount: 2,
        pageCount: 1,
        pageIndex: 1,
        pageSize: 100
      } as ProjectListResponse);

      await bloc.fetchProjects();

      expect(bloc.state.projects.value).toEqual(mockProjects);
      expect(bloc.state.loading.value).toBe(false);
      expect(projectListApi.getProjectList).toHaveBeenCalledWith({
        pageIndex: 1,
        pageSize: 100,
        sortProperties: 'updated'
      });
    });

    it('获取项目列表失败时应该处理错误', async () => {
      const error = new Error('API Error');
      vi.spyOn(projectListApi, 'getProjectList').mockRejectedValue(error);
      vi.spyOn(console, 'error').mockImplementation(() => {});

      await bloc.fetchProjects();

      expect(bloc.state.projects.value).toEqual([]);
      expect(bloc.state.loading.value).toBe(false);
      expect(console.error).toHaveBeenCalledWith(
        'Error fetching projects:',
        error
      );
    });
  });

  describe('createProject', () => {
    it('成功创建项目时应该返回项目ID', async () => {
      const mockProjectId = '123';
      vi.spyOn(projectListApi, 'createProject').mockResolvedValue({
        id: mockProjectId,
        metadata: {
          name: 'New Project'
        },
        created: Date.now(),
        updated: Date.now(),
        type: 'project',
        properties: {},
        version: 1
      });

      const result = await bloc.createProject();

      expect(result).toBe(mockProjectId);
      expect(bloc.state.loading.value).toBe(false);
    });

    it('创建项目失败时应该处理错误', async () => {
      const error = new Error('API Error');
      vi.spyOn(projectListApi, 'createProject').mockRejectedValue(error);
      vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await bloc.createProject();

      expect(result).toBeUndefined();
      expect(bloc.state.loading.value).toBe(false);
      expect(console.error).toHaveBeenCalledWith(
        'Error creating project:',
        error
      );
    });

    it('loading状态为true时不应该创建项目', async () => {
      bloc.state.loading.value = true;
      vi.spyOn(projectListApi, 'createProject');

      const result = await bloc.createProject();

      expect(result).toBeUndefined();
      expect(projectListApi.createProject).not.toHaveBeenCalled();
    });
  });

  describe('deleteProject', () => {
    it('成功删除项目后应该刷新项目列表', async () => {
      vi.spyOn(projectListApi, 'deleteProject').mockResolvedValue(undefined);
      vi.spyOn(bloc, 'fetchProjects').mockResolvedValue();

      await bloc.deleteProject('123');

      expect(projectListApi.deleteProject).toHaveBeenCalledWith('123');
      expect(bloc.fetchProjects).toHaveBeenCalled();
      expect(bloc.state.loading.value).toBe(false);
    });

    it('删除项目失败时应该处理错误', async () => {
      const error = new Error('API Error');
      vi.spyOn(projectListApi, 'deleteProject').mockRejectedValue(error);
      vi.spyOn(console, 'error').mockImplementation(() => {});

      await bloc.deleteProject('123');

      expect(bloc.state.loading.value).toBe(false);
      expect(console.error).toHaveBeenCalledWith(
        'Error deleting project:',
        error
      );
    });

    it('loading状态为true时不应该删除项目', async () => {
      bloc.state.loading.value = true;
      vi.spyOn(projectListApi, 'deleteProject');

      await bloc.deleteProject('123');

      expect(projectListApi.deleteProject).not.toHaveBeenCalled();
    });
  });

  describe('showDeleteConfirmModal', () => {
    it('点击确认时应该调用deleteProject方法', async () => {
      const projectId = '123';
      vi.spyOn(bloc, 'deleteProject').mockResolvedValue();

      // 模拟 Modal.confirm 的实现，立即执行 onOk 回调
      vi.mocked(Modal.confirm).mockImplementation(({ onOk }) => {
        // 确保 onOk 存在且是函数
        if (onOk && typeof onOk === 'function') {
          onOk();
        }
        return {
          destroy: vi.fn(),
          update: vi.fn()
        };
      });

      bloc.showDeleteConfirmModal(projectId);

      expect(bloc.deleteProject).toHaveBeenCalledWith(projectId);
    });

    it('应该显示确认对话框并设置正确的属性', () => {
      const projectId = '123';
      bloc.showDeleteConfirmModal(projectId);

      expect(Modal.confirm).toHaveBeenCalledWith({
        title: 'Confirm Delete',
        content:
          'Are you sure you want to delete this project? This action cannot be undone.',
        okText: 'Confirm',
        cancelText: 'Cancel',
        onOk: expect.any(Function),
        okButtonProps: { danger: true }
      });
    });
  });
});
