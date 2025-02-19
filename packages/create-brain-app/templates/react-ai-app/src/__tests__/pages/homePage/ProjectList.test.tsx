import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import { ProjectList } from '@/pages/HomePage/ProjectList';
import { signal } from '@preact/signals-react';
import { ProjectListItem } from '@/base/api/ProjectListApi';
import styles from '@/pages/HomePage/HomePage.module.css';

describe('ProjectList', () => {
  const mockProjects: ProjectListItem[] = [
    {
      id: '1',
      metadata: { name: 'Project 1' },
      created: 1234567890,
      updated: 1234567890,
      type: 'project',
      properties: {},
      version: 1
    },
    {
      id: '2',
      metadata: { name: 'Project 2' },
      created: 1234567890,
      updated: 1234567890,
      type: 'project',
      properties: {},
      version: 1
    }
  ];

  const defaultProps = {
    projects: signal<ProjectListItem[]>(mockProjects),
    onDelete: vi.fn(),
    onSelect: vi.fn(),
    loading: signal(false)
  };

  it('应该正确渲染项目列表', () => {
    render(<ProjectList {...defaultProps} />);

    expect(screen.getByText('Project 1')).toBeInTheDocument();
    expect(screen.getByText('Project 2')).toBeInTheDocument();
  });

  it('点击项目时应该触发onSelect', () => {
    render(<ProjectList {...defaultProps} />);

    const projectItem = screen.getByText('Project 1').closest('div');
    fireEvent.click(projectItem!);

    expect(defaultProps.onSelect).toHaveBeenCalledWith('1');
  });

  it('点击删除按钮时应该触发onDelete', () => {
    render(<ProjectList {...defaultProps} />);

    const deleteButtons = screen.getAllByTitle('delete project');
    fireEvent.click(deleteButtons[0]);

    expect(defaultProps.onDelete).toHaveBeenCalledWith('1');
  });

  it('loading为true时应该禁用交互', () => {
    const props = {
      ...defaultProps,
      loading: signal(true)
    };

    render(<ProjectList {...props} />);

    const projectItems = screen.getAllByRole('button');
    projectItems.forEach((item) => {
      expect(item).toBeDisabled();
    });
  });

  it('应该正确显示创建时间和更新时间', () => {
    render(<ProjectList {...defaultProps} />);

    const formatDate = (timestamp: number) => {
      return new Date(timestamp).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const firstProject = screen.getAllByTestId(
      'HomePage-ProjectList-ProjectItem'
    )[0];
    const createdTime = formatDate(mockProjects[0].created);
    const updatedTime = formatDate(mockProjects[0].updated);

    expect(
      firstProject.querySelector('[data-testid="created-time"]')
    ).toHaveTextContent(createdTime);
    expect(
      firstProject.querySelector('[data-testid="updated-time"]')
    ).toHaveTextContent(updatedTime);
  });

  it('空列表时不应该显示任何项目', () => {
    const props = {
      ...defaultProps,
      projects: signal<ProjectListItem[]>([])
    };

    const { container } = render(<ProjectList {...props} />);

    expect(
      container.querySelector(`.${styles.projectList}`)?.children.length
    ).toBe(0);
  });
});
