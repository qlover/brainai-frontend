import { signal } from '@preact/signals-react';
import { BlocInterface } from '@/base/port/BlocInterface';
import { Toast } from '@/views/components/toast/Toast';
import { Modal } from 'antd';
import { GetIt } from '@/config/register/GetIt';
import { ApiDirectoryApi } from '@/base/api/ApiDirectoryApi';
import { CreateDirectoryResponse } from '@/base/api/DomainTyped/DomainDirectory';
import { ApiTreeProps } from './ApiTree';
import {
  ApiType,
  TreeNode
} from '@/pages/apiManagementNewPage/ApiManagementNewPageBloc';
import { ApiParamType } from '@/base/api/DomainTyped/DomainDirectory';
import { ApiTreeUtil, STORAGE_KEY } from './ApiTreeUtil';

class State {
  prevApiType = '';
  searchValue = signal('');
  isDirectoryModalOpen = signal(false);
  isAddFileModalOpen = signal(false);
  newItemName = signal('');
  newItemContent = signal('');
  newItemDescription = signal('');
  selectedParentKey = signal<number>(0);
  isDirectoryLoading = signal(false);
  isFileLoading = signal(false);
  editingDirectoryKey = signal<number | null>(null); // null 表示新增，string 表示编辑
  expandedKeysByType = signal<Record<string, number[]>>({
    personal: JSON.parse(
      localStorage.getItem(`${STORAGE_KEY}_personal`) || '[]'
    ),
    global: JSON.parse(localStorage.getItem(`${STORAGE_KEY}_global`) || '[]')
  });
  selectedKeysByType = signal<Record<string, number[]>>({
    personal: [],
    global: []
  });
}

export class ApiTreeBloc extends BlocInterface<State> {
  private apiDirectoryApi = GetIt.get(ApiDirectoryApi);
  props: ApiTreeProps = new ApiTreeProps();

  constructor() {
    super(new State());
  }

  /**
   * 将新创建的目录添加到目录树中
   * @private
   * @param result 创建目录的响应数据
   */
  private addDirectoryToTree(result: CreateDirectoryResponse): void {
    const newNode: TreeNode = {
      title: this.state.newItemName.value,
      key: Number(result.id),
      children: [],
      isLeaf: false
    };
    this.props.bloc.state.treeData.value = [
      ...this.props.bloc.state.treeData.value,
      newNode
    ];
  }

  /**
   * 设置 props
   */
  setProps(props: ApiTreeProps): void {
    this.props = props;
  }

  /**
   * 处理节点选中逻辑
   * @param fileKey 文件 key
   * @param apiType 当前类型
   */
  private handleNodeSelection(fileKey: number, apiType: string): void {
    const nodeExists = ApiTreeUtil.checkNodeExists(
      fileKey,
      this.props.bloc.state.treeData.value
    );

    if (nodeExists) {
      this.setSelectedState(apiType, [fileKey]);
      this.props.bloc.handleApiSelect(fileKey.toString());
    } else {
      this.selectFirstNode(apiType);
    }
  }

  /**
   * 选中第一个节点
   * @param apiType 当前类型
   */
  private selectFirstNode(apiType: string): void {
    const { dataKey } = ApiTreeUtil.getFirstNodeKey(
      this.props.bloc.state.treeData.value
    );
    if (dataKey) {
      this.handleNodeSelect(dataKey, apiType);
    }
  }

  /**
   * 初始化 expandedKeys
   * @param apiType 当前类型
   */
  initializeExpandedKeys(apiType: string): void {
    // 获取缓存的展开节点
    const cachedExpandedKeys = ApiTreeUtil.getCachedExpandedKeys(apiType);
    const expandedKeysSet = new Set<number>(cachedExpandedKeys);

    // 获取 URL 参数中的 key
    const { folderKey, fileKey } = ApiTreeUtil.getKeysFromUrl(
      window.location.search
    );

    // 如果有文件夹参数，添加到展开集合中
    if (folderKey !== undefined) {
      expandedKeysSet.add(folderKey);
    }

    // 设置展开状态
    const expandedKeys = Array.from(expandedKeysSet);
    this.setExpandedState(apiType, expandedKeys);

    // 处理节点选中
    if (fileKey !== undefined) {
      this.handleNodeSelection(fileKey, apiType);
      // 初始化时将选中的节点滚动到顶部
      setTimeout(() => {
        const treeNode = document.querySelector(`.ant-tree-treenode-selected`);
        if (treeNode) {
          treeNode.scrollIntoView({
            behavior: 'auto',
            block: 'start'
          });
        }
      }, 0);
    } else {
      this.selectFirstNode(apiType);
    }
  }

  /**
   * 显示目录操作弹窗（新增/编辑）
   * @param key 目录ID，为空表示新增
   * @param title 目录名称，编辑时使用
   */
  showDirectoryModal(key?: number, title?: string): void {
    if (!this.props.bloc.shouldShowOperations()) {
      return;
    }
    this.state.isDirectoryModalOpen.value = true;
    this.state.editingDirectoryKey.value = key || null;
    this.state.newItemName.value = title || '';
  }

  /**
   * 显示添加文件弹窗
   * @param parentKey 父目录ID
   */
  showAddFileModal(parentKey: number): void {
    this.state.isAddFileModalOpen.value = true;
    this.state.newItemName.value = '';
    this.state.newItemContent.value = '';
    this.state.newItemDescription.value = '';
    this.state.selectedParentKey.value = parentKey;
  }

  /**
   * 处理目录的添加/编辑提交
   * 根据 editingDirectoryKey 判断是新增还是编辑操作
   */
  async handleDirectorySubmit(): Promise<void> {
    if (!this.state.newItemName.value.trim()) {
      Toast.error('Please enter directory name');
      return;
    }

    try {
      this.state.isDirectoryLoading.value = true;
      if (this.state.editingDirectoryKey.value) {
        // 编辑目录
        await this.apiDirectoryApi.updateDirectory({
          id: this.state.editingDirectoryKey.value.toString(),
          name: this.state.newItemName.value
        });
        this.props.bloc.state.treeData.value = ApiTreeUtil.updateTreeNodes(
          this.props.bloc.state.treeData.value,
          this.state.editingDirectoryKey.value!,
          (node) => ({
            ...node,
            title: this.state.newItemName.value
          })
        );
        Toast.success('Directory updated');
      } else {
        // 新增目录
        const result = await this.apiDirectoryApi.createDirectory({
          name: this.state.newItemName.value,
          type:
            this.props.bloc.state.apiType.value === ApiType.GLOBAL
              ? ApiParamType.GLOBAL
              : ApiParamType.PERSONAL
        });
        this.addDirectoryToTree(result);
        Toast.success('Directory added');
      }
      this.state.isDirectoryModalOpen.value = false;
    } catch {
      Toast.error(
        `Failed to ${this.state.editingDirectoryKey.value ? 'update' : 'add'} directory`
      );
    } finally {
      this.state.isDirectoryLoading.value = false;
    }
  }

  /**
   * 处理添加文件的提交
   */
  async handleAddFile(): Promise<void> {
    if (!this.state.newItemName.value.trim()) {
      Toast.error('Please enter file name');
      return;
    }
    const apiType = this.props.bloc.state.apiType.value;
    try {
      this.state.isFileLoading.value = true;
      // 调用创建文档 API
      const result = await this.apiDirectoryApi.createDocument({
        parentId: this.state.selectedParentKey.value.toString(),
        name: this.state.newItemName.value,
        content: this.state.newItemContent.value,
        description: this.state.newItemDescription.value,
        type:
          apiType === ApiType.GLOBAL
            ? ApiParamType.GLOBAL
            : ApiParamType.PERSONAL
      });

      // 创建新节点并更新树结构
      const newNode: TreeNode = {
        title: this.state.newItemName.value,
        key: Number(result.id),
        isLeaf: true
      };

      this.props.bloc.state.treeData.value = ApiTreeUtil.updateTreeNodes(
        this.props.bloc.state.treeData.value,
        this.state.selectedParentKey.value,
        (node) => ({
          ...node,
          children: [...(node.children || []), newNode]
        })
      );
      this.state.isAddFileModalOpen.value = false;
      // 添加后展开对应目录
      const parentKey = ApiTreeUtil.findParentKey(
        this.props.bloc.state.treeData.value,
        newNode.key
      );
      if (parentKey) {
        this.setExpandedState(apiType, [
          ...this.state.expandedKeysByType.value[apiType],
          parentKey
        ]);
      }
      // 选中新增的文件
      this.handleNodeSelect(newNode.key, apiType);
      Toast.success('API file added');
    } catch {
      Toast.error('Failed to add file');
    } finally {
      this.state.isFileLoading.value = false;
    }
  }

  /**
   * 处理删除目录操作
   * 会弹出确认框，确认后删除目录及其所有子内容
   * @param key 要删除的目录ID
   */
  async handleDeleteDirectory(key: number): Promise<void> {
    // 检查目录是否包含文件
    const hasFiles = ApiTreeUtil.checkDirectoryHasFiles(
      this.props.bloc.state.treeData.value,
      key
    );

    if (hasFiles) {
      Modal.error({
        title: 'Cannot Delete Directory',
        content: 'Please delete all files in this directory first'
      });
      return;
    }

    Modal.confirm({
      title: 'Delete Directory',
      content: 'Are you sure you want to delete this directory?',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          this.state.isDirectoryLoading.value = true;
          await this.apiDirectoryApi.deleteDirectory({
            directoryId: key.toString()
          });

          this.props.bloc.state.treeData.value = ApiTreeUtil.removeNodeFromTree(
            this.props.bloc.state.treeData.value,
            key
          );
          Toast.success('Directory deleted');
        } catch {
          Toast.error('Failed to delete directory');
        } finally {
          this.state.isDirectoryLoading.value = false;
        }
      }
    });
  }

  /**
   * 根据搜索关键字过滤树节点
   * @returns 过滤后的树节点
   */
  getFilteredTreeData(): TreeNode[] {
    const searchValue = this.state.searchValue.value.toLowerCase().trim();
    if (!searchValue) {
      return this.props.bloc.state.treeData.value;
    }

    const filterNodes = (nodes: TreeNode[]): TreeNode[] => {
      return nodes
        .map((node) => {
          // 如果是文件节点，直接匹配标题
          if (node.isLeaf) {
            return node.title.toLowerCase().includes(searchValue) ? node : null;
          }

          // 如果是目录节点，递归过滤子节点
          const filteredChildren = node.children
            ? filterNodes(node.children)
            : [];
          if (
            filteredChildren.length > 0 ||
            node.title.toLowerCase().includes(searchValue)
          ) {
            return {
              ...node,
              children: filteredChildren
            };
          }
          return null;
        })
        .filter((node): node is TreeNode => node !== null);
    };

    return filterNodes(this.props.bloc.state.treeData.value);
  }
  /**
   * 设置展开状态
   * @param apiType 当前类型
   * @param expandedKeys 展开的节点keys
   */
  setExpandedState(apiType: string, expandedKeys: number[]): void {
    // 将 expandedKeys 去重
    const uniqueKeys = Array.from(new Set(expandedKeys));

    this.state.expandedKeysByType.value = {
      ...this.state.expandedKeysByType.value,
      [apiType]: uniqueKeys
    };

    // 保存到 localStorage
    localStorage.setItem(
      `${STORAGE_KEY}_${apiType}`,
      JSON.stringify(uniqueKeys)
    );
  }

  /**
   * 展开所有节点
   * @param apiType 当前类型
   */
  expandAll(apiType: string): void {
    const allKeys = ApiTreeUtil.getAllKeys(
      this.props.bloc.state.treeData.value
    );
    this.setExpandedState(apiType, allKeys);
  }

  /**
   * 收起所有节点
   * @param apiType 当前类型
   */
  collapseAll(apiType: string): void {
    this.setExpandedState(apiType, []);
  }

  /**
   * 获取当前类型的选中 keys
   */
  getSelectedKeys(apiType: string): number[] {
    return this.state.selectedKeysByType.value[apiType] || [];
  }

  /**
   * 设置选中状态
   * @param apiType 当前类型
   * @param selectedKeys 选中的节点keys
   */
  setSelectedState(apiType: string, selectedKeys: number[]): void {
    this.state.selectedKeysByType.value = {
      ...this.state.selectedKeysByType.value,
      [apiType]: selectedKeys
    };
  }

  /**
   * 更新 URL 参数
   * @param parentKey 父节点 key
   * @param fileKey 当前节点 key
   */
  updateUrlParams(
    parentKey: number | undefined,
    fileKey: number | undefined
  ): void {
    const newParams = ApiTreeUtil.generateUrlParams(
      window.location.search,
      parentKey,
      fileKey
    );
    window.history.replaceState(null, '', `?${newParams}`);
  }

  /**
   * 处理节点选中时的逻辑
   * @param key 节点的 key
   * @param apiType 当前的 API 类型
   */
  handleNodeSelect(key: number, apiType: string): void {
    // 设置选中状态
    this.setSelectedState(apiType, [key]);

    // 加载对应的 API 详情
    this.props.bloc.handleApiSelect(key.toString());

    // 查找父节点 key，传入树数据作为参数
    const parentKey = ApiTreeUtil.findParentKey(
      this.props.bloc.state.treeData.value,
      key
    );

    // 更新 URL 参数
    this.updateUrlParams(parentKey, key);

    // 将父节点 key 保存到缓存
    if (parentKey !== undefined) {
      const cachedExpandedKeys = ApiTreeUtil.getCachedExpandedKeys(apiType);
      const expandedKeysSet = new Set<number>([
        ...cachedExpandedKeys,
        parentKey
      ]);
      this.setExpandedState(apiType, Array.from(expandedKeysSet));
    }
  }

  /**
   * 检查是否所有节点都已展开
   */
  isAllExpanded(): boolean {
    const treeData = this.props?.bloc?.state?.treeData?.value || [];
    if (treeData.length === 0) {
      return false;
    }
    const allKeys = ApiTreeUtil.getAllKeys(treeData);
    const currentExpandedKeys =
      this.state.expandedKeysByType.value[
        this.props.bloc.state.apiType.value
      ] || [];
    return allKeys.length === currentExpandedKeys.length;
  }

  /**
   * 切换全部展开/收起状态
   */
  toggleExpandAll(apiType: string): void {
    if (this.isAllExpanded()) {
      this.collapseAll(apiType);
    } else {
      this.expandAll(apiType);
    }
  }
}
