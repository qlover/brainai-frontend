import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { HomePage } from '@/pages/HomePage/HomePage';
import { GetIt } from '@/config/register/GetIt';
import { VitestGetIt } from '@/__mocks__/VitestGetIt';
import { AuthStore } from '@/base/store/AuthStore';

// 所有的 mock 需要放在导入语句之后，测试用例之前
vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn()
}));

// 将 mock 函数的创建移到工厂函数内部
vi.mock('@/uikit/utils/auth', () => {
  const redirectToLogin = vi.fn();
  return { redirectToLogin };
});

describe('HomePage', () => {
  let vitestGetIt: VitestGetIt;

  beforeEach(() => {
    vitestGetIt = new VitestGetIt();
    GetIt.implement(vitestGetIt);
    vi.clearAllMocks();
  });

  describe('基础渲染', () => {
    it('应该正确渲染标题和创建按钮，当项目列表查询成功时', async () => {
      // 设置假的 token
      GetIt.get(AuthStore).setToken('123456');

      // 设置模拟响应
      const mockResponse = {
        items: [
          {
            id: '1',
            created: 1,
            updated: 1,
            metadata: { name: 'Project 1' },
            type: 'project',
            properties: {},
            version: 1
          },
          {
            id: '2',
            created: 1,
            updated: 1,
            metadata: { name: 'Project 2' },
            type: 'project',
            properties: {},
            version: 1
          }
        ],
        extras: [],
        itemCount: 0,
        pageCount: 0,
        pageIndex: 0,
        pageSize: 0
      };

      // 使用 TestFetcher 设置模拟响应
      vitestGetIt.getFetcher().setMockResponse(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      );

      await act(async () => {
        render(<HomePage />);
      });

      // 验证项目列表出现
      const projectList = screen.getByTestId('HomePage-ProjectList');
      expect(projectList).toBeInTheDocument();

      // 等待异步操作完成
      expect(screen.getByText('React Flow UI Design')).toBeInTheDocument();
      expect(screen.getByTitle('create new project')).toBeInTheDocument();
    });

    it('应该正确处理项目列表查询失败的情况，当目列表查询发生500错误时', async () => {
      // 设置假的 token
      GetIt.get(AuthStore).setToken('123456');

      // 模拟 API 错误响应
      vitestGetIt.getFetcher().setMockResponse(
        new Response(JSON.stringify({ message: 'Failed to fetch projects' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        })
      );

      // 监听 console.error
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      await act(async () => {
        render(<HomePage />);
      });

      // 等待异步操作完成
      expect(screen.getByText('React Flow UI Design')).toBeInTheDocument();
      expect(screen.getByTitle('create new project')).toBeInTheDocument();
      // 验证错误被正确记录
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error fetching projects:',
        expect.any(Error)
      );

      // 清理 console.error 的模拟
      consoleSpy.mockRestore();
    });

    it('应该正确处理项目列表查询失败的情况，当目列表查询发生401错误时，应该重定向到登录页面', async () => {
      // 模拟 401 错误响应
      vitestGetIt.getFetcher().setMockResponse(
        new Response(JSON.stringify({ message: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        })
      );

      await act(async () => {
        render(<HomePage />);
      });

      // 从 auth 模块中获取 mock 函数
      const { redirectToLogin } = vi.mocked(await import('@/uikit/utils/auth'));

      // 等待异步操作完成
      expect(redirectToLogin).toHaveBeenCalled();
    });
  });

  describe('创建项目', () => {
    it('应该正确创建项目', async () => {
      // 设置假的 token
      GetIt.get(AuthStore).setToken('123456');

      // 正确模拟 useNavigate
      const mockNavigate = vi.fn();
      const { useNavigate } = await import('react-router-dom');
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      // 设置项目列表的模拟响应
      const mockListResponse = {
        items: [],
        extras: [],
        itemCount: 0,
        pageCount: 0,
        pageIndex: 0,
        pageSize: 0
      };

      // 设置创建项目的模拟响应
      const mockCreateResponse = {
        id: 'new-project-id',
        created: 1,
        updated: 1,
        metadata: { name: 'Untitled' },
        type: 'project',
        properties: {},
        version: 1
      };

      let isFirstCall = true;
      vitestGetIt.getFetcher().setMockResponse(() => {
        if (isFirstCall) {
          isFirstCall = false;
          return new Response(JSON.stringify(mockListResponse), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        return new Response(JSON.stringify(mockCreateResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      });

      // 初始化 component 变量并立即赋值
      const component = await act(async () => {
        return render(<HomePage />);
      });

      // 等待初始加载完成
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      // 点击创建按钮
      const createButton = screen.getByTitle('create new project');
      await act(async () => {
        fireEvent.click(createButton);
        // 等待创建操作完成
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      // 验证导航到新项目页面
      expect(mockNavigate).toHaveBeenCalledWith('/experiment/new-project-id');

      // 清理
      component.unmount();
    });

    it('创建项目失败时应该正确处理错误', async () => {
      // 设置假的 token
      GetIt.get(AuthStore).setToken('123456');

      // 模拟 API 错误响应
      vitestGetIt.getFetcher().setMockResponse(
        new Response(JSON.stringify({ message: 'Failed to create project' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        })
      );

      // 监听 console.error
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      await act(async () => {
        render(<HomePage />);
      });

      // 点击创建按钮
      const createButton = screen.getByTitle('create new project');
      await act(async () => {
        fireEvent.click(createButton);
      });

      // 验证错误被正确记录
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error creating project:',
        expect.any(Error)
      );

      // 清理 console.error 的模拟
      consoleSpy.mockRestore();
    });

    it('创建项目时应该显示加载状态', async () => {
      // 设置假的 token
      GetIt.get(AuthStore).setToken('123456');

      // 使用延迟响应模拟加载状态
      const mockResponse = {
        id: 'new-project-id',
        created: 1,
        updated: 1,
        metadata: { name: 'Untitled' },
        type: 'project',
        properties: {},
        version: 1
      };

      // 设置延迟响应
      vitestGetIt.getFetcher().setMockResponse(
        () =>
          new Response(JSON.stringify(mockResponse), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          })
      );

      await act(async () => {
        render(<HomePage />);
      });

      // 点击创建按钮
      const createButton = screen.getByTitle('create new project');
      fireEvent.click(createButton);

      // 验证加载状态
      expect(screen.getByTestId('loading-container')).toBeInTheDocument();
      expect(createButton).toBeDisabled();
    });
  });

  describe('项目列表交互', () => {
    it('点击项目列表项时应该正确导航到项目详情页', async () => {
      // 设置假的 token
      GetIt.get(AuthStore).setToken('123456');

      // 正确模拟 useNavigate
      const mockNavigate = vi.fn();
      const { useNavigate } = await import('react-router-dom');
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      // 设置项目列表的模拟响应
      const mockResponse = {
        items: [
          {
            id: '1',
            created: 1,
            updated: 1,
            metadata: { name: 'Project 1' },
            type: 'project',
            properties: {},
            version: 1
          }
        ],
        extras: [],
        itemCount: 1,
        pageCount: 1,
        pageIndex: 0,
        pageSize: 10
      };

      // 使用 TestFetcher 设置模拟响应
      vitestGetIt.getFetcher().setMockResponse(
        () =>
          new Response(JSON.stringify(mockResponse), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          })
      );

      // 渲染组件
      await act(async () => {
        render(<HomePage />);
      });
      // 验证项目列表出现
      const projectList = screen.getByTestId('HomePage-ProjectList');
      expect(projectList).toBeInTheDocument();

      const projectMain = screen.getAllByTestId('ProjectItem-Main')[0];

      // 直接点击项目列表项
      await act(async () => {
        fireEvent.click(projectMain);
      });

      // 验证导航到正确的项目详情页
      expect(mockNavigate).toHaveBeenCalledWith('/experiment/1');
    });
  });
});
