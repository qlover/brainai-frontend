import { signal } from '@preact/signals-react';
import { BlocInterface } from '@/base/port/BlocInterface';
import { GetIt } from '@/config/register/GetIt';
import { ApiDirectoryApi } from '@/base/api/ApiDirectoryApi';
import {
  ApiParamType,
  DocumentDetail,
  TreeItem,
  TreeTypes
} from '@/base/api/DomainTyped/DomainDirectory';
import { Toast } from '@/views/components/toast/Toast';
import { UserStore } from '@/base/store/UserStore';

export class TreeNode {
  title: string = '';
  key: number = 0;
  children?: TreeNode[] = [];
  isLeaf?: boolean = false;
}
export enum ApiType {
  PERSONAL = 'personal',
  GLOBAL = 'global'
}

class State {
  isTreeLoading = signal(false);
  isApiDetailLoading = signal(false);
  selectedApiId = signal<string | null>(null);
  currentApi = signal<DocumentDetail | null>(null);
  treeData = signal<TreeNode[]>([]);
  apiType = signal<ApiType>(ApiType.PERSONAL);
  personalTreeData = signal<TreeNode[]>([]);
  globalTreeData = signal<TreeNode[]>([]);
}

export class ApiManagementNewPageBloc extends BlocInterface<State> {
  private apiDirectoryApi = GetIt.get(ApiDirectoryApi);
  private userStore = GetIt.get(UserStore);

  constructor() {
    super(new State());
  }

  /**
   * 从 URL 参数中获取 apiType，默认为 'personal'
   */
  getApiTypeFromUrl(): ApiType {
    const urlParams = new URLSearchParams(window.location.search);
    const apiTypeParam = urlParams.get('apiType');
    if (apiTypeParam === ApiType.PERSONAL || apiTypeParam === ApiType.GLOBAL) {
      return apiTypeParam as ApiType;
    }
    return ApiType.PERSONAL;
  }

  handleApiSelect(id: string): void {
    this.state.selectedApiId.value = id;
    this.loadSingleApiDetail(id);
  }
  /**
   * 检查是否显示操作按钮
   */
  shouldShowOperations(): boolean {
    return (
      this.state.apiType.value === ApiType.PERSONAL ||
      this.userStore.hasGlobalApiPermission()
    );
  }
  /**
   * 切换 API 类型（个人/全局）
   */
  async switchApiType(type: ApiType): Promise<void> {
    this.state.currentApi.value = null;
    this.state.apiType.value = type;

    // 更新 URL 中的 apiType 参数
    this.updateUrlParam('apiType', type);

    // 移除 URL 中的 folder 和 file 参数
    this.removeUrlParams();
    this.loadTreeData();
  }

  // 新增方法：更新 URL 中的参数
  updateUrlParam(key: string, value: string): void {
    const url = new URL(window.location.href);
    url.searchParams.set(key, value);
    window.history.replaceState({}, '', url.toString());
  }

  // 更新方法：移除 URL 参数
  private removeUrlParams(): void {
    const url = new URL(window.location.href);
    url.searchParams.delete('folder');
    url.searchParams.delete('file');
    // 确保移除了 folder 和 file 参数后，保留其他参数
    window.history.replaceState({}, '', url.toString());
  }

  async loadSingleApiDetail(id: string): Promise<void> {
    try {
      this.state.isApiDetailLoading.value = true;
      const response = await this.apiDirectoryApi.getDocuments([id]);
      if (response.length > 0) {
        this.state.currentApi.value = response[0];
      }
    } catch {
      Toast.error('Failed to load API detail');
      this.state.currentApi.value = null;
    } finally {
      this.state.isApiDetailLoading.value = false;
    }
  }

  /**
   * 加载完整的目录树结构
   */
  async loadTreeData(): Promise<void> {
    try {
      this.state.isTreeLoading.value = true;
      const [personalResult, globalResult] = await Promise.all([
        this.apiDirectoryApi.getFullTreeStructure({
          type: ApiParamType.PERSONAL
        }),
        this.apiDirectoryApi.getFullTreeStructure({ type: ApiParamType.GLOBAL })
      ]);

      const convertToTreeNode = (items: TreeItem[]): TreeNode[] => {
        return items.map((item) => ({
          title: item.name,
          key: item.id,
          children: item.children ? convertToTreeNode(item.children) : [],
          isLeaf: item.nodeType === TreeTypes.DOCUMENT
        }));
      };

      this.state.personalTreeData.value = convertToTreeNode(
        personalResult.items
      );
      this.state.globalTreeData.value = convertToTreeNode(globalResult.items);

      this.state.treeData.value =
        this.state.apiType.value === ApiType.PERSONAL
          ? this.state.personalTreeData.value
          : this.state.globalTreeData.value;
    } catch {
      Toast.error('Failed to load directory structure');
    } finally {
      this.state.isTreeLoading.value = false;
    }
  }
}
