import { TreeNode } from '@/pages/apiManagementNewPage/ApiManagementNewPageBloc';

export const STORAGE_KEY = 'apiTree_expandedState';

export class ApiTreeUtil {
  /**
   * 从缓存中获取展开的节点 keys
   * @param apiType 当前类型
   * @returns 缓存的展开节点 keys
   */
  static getCachedExpandedKeys(apiType: string): number[] {
    return JSON.parse(
      localStorage.getItem(`${STORAGE_KEY}_${apiType}`) || '[]'
    );
  }

  /**
   * 从 URL 参数中获取文件夹和文件的 key
   * @returns 文件夹和文件的 key
   */
  static getKeysFromUrl(search: string): {
    folderKey?: number;
    fileKey?: number;
  } {
    const urlParams = new URLSearchParams(search);
    const folderParam = urlParams.get('folder');
    const fileParam = urlParams.get('file');

    return {
      folderKey: folderParam ? Number(folderParam) : undefined,
      fileKey: fileParam ? Number(fileParam) : undefined
    };
  }
  /**
   * 通用的树节点更新方法
   * @param nodes 原始树节点数组
   * @param targetKey 目标节点的key
   * @param updateFn 更新节点的函数
   * @param parentKey 父节点key
   * @returns 更新后的树节点数组
   */
  static updateTreeNodes(
    nodes: TreeNode[],
    targetKey: number,
    updateFn: (node: TreeNode) => TreeNode,
    parentKey?: number
  ): TreeNode[] {
    return nodes.map((node) => {
      const updatedNode = {
        ...node,
        parentKey: parentKey
      };
      if (node.key === targetKey) {
        return updateFn(updatedNode);
      }
      if (node.children) {
        return {
          ...updatedNode,
          children: ApiTreeUtil.updateTreeNodes(
            node.children,
            targetKey,
            updateFn,
            node.key
          )
        };
      }
      return updatedNode;
    });
  }

  static removeNodeFromTree(nodes: TreeNode[], targetKey: number): TreeNode[] {
    return nodes.filter((node) => {
      if (node.key === targetKey) return false;
      if (node.children) {
        node.children = ApiTreeUtil.removeNodeFromTree(
          node.children,
          targetKey
        );
      }
      return true;
    });
  }

  /**
   * 检查目录是否包含文件
   * @param nodes 树节点数组
   * @param targetKey 目标目录的key
   * @returns 是否包含文件
   */
  static checkDirectoryHasFiles(nodes: TreeNode[], targetKey: number): boolean {
    for (const node of nodes) {
      if (node.key === targetKey) {
        return node.children?.some((child) => child.isLeaf) || false;
      }
      if (node.children && node.children.length > 0) {
        const hasFiles = ApiTreeUtil.checkDirectoryHasFiles(
          node.children,
          targetKey
        );
        if (hasFiles) return true;
      }
    }
    return false;
  }

  /**
   * 检查指定的节点是否存在于树中
   * @param key 要检查的节点 key
   * @param nodes 树节点数组
   * @returns 若存在，返回 true；否则返回 false
   */
  static checkNodeExists(key: number, nodes: TreeNode[]): boolean {
    for (const node of nodes) {
      if (node.key === key) {
        return true;
      }
      if (node.children) {
        if (ApiTreeUtil.checkNodeExists(key, node.children)) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * 获取所有父组件的 key
   * @param nodes 树节点数组
   * @returns 所有父组件的 key 数组
   */
  static getAllKeys(nodes: TreeNode[]): number[] {
    let keys: number[] = [];
    nodes.forEach((node: TreeNode) => {
      if (!node.isLeaf) {
        keys.push(node.key);
      }
      if (node.children) {
        keys = keys.concat(ApiTreeUtil.getAllKeys(node.children));
      }
    });
    return keys;
  }

  /**
   * 获取第一个节点 key
   * @param nodes 树节点数组
   * @returns 第一个节点 key 或 undefined
   */
  static getFirstNodeKey(nodes: TreeNode[]): {
    directoryKey: number | undefined;
    dataKey: number | undefined;
  } {
    for (const node of nodes) {
      if (!node.isLeaf) {
        const directoryKey = node.key;
        let dataKey: number | undefined = undefined;

        // 递归寻找第一个包含数据节点的子节点
        dataKey = ApiTreeUtil.findFirstDataKey(node.children || []);
        if (dataKey !== undefined) {
          return { directoryKey, dataKey };
        }
      }
    }
    return { directoryKey: undefined, dataKey: undefined };
  }

  /**
   * 递归寻找第一个数据节点的 key
   * @param nodes 树节点数组
   * @returns 数据节点的 key 或 undefined
   */
  static findFirstDataKey(nodes: TreeNode[]): number | undefined {
    for (const node of nodes) {
      if (node.isLeaf) {
        return node.key;
      }
      if (node.children && node.children.length > 0) {
        const dataKey = ApiTreeUtil.findFirstDataKey(node.children);
        if (dataKey !== undefined) {
          return dataKey;
        }
      }
    }
    return undefined;
  }
  /**
   * 生成新的 URL 参数字符串
   * @param currentSearch 当前的 search 字符串
   * @param parentKey 父节点 key
   * @param fileKey 当前节点 key
   * @returns 新的 URL 参数字符串
   */
  static generateUrlParams(
    currentSearch: string,
    parentKey: number | undefined,
    fileKey: number | undefined
  ): string {
    const searchParams = new URLSearchParams(currentSearch);
    if (parentKey !== undefined) {
      searchParams.set('folder', parentKey.toString());
    }
    if (fileKey !== undefined) {
      searchParams.set('file', fileKey.toString());
    }
    return searchParams.toString();
  }

  /**
   * 根据节点 key，找到其父节点的 key
   * @param nodes 树节点数组
   * @param targetKey 目标节点 key
   * @returns 父节点 key 或 undefined
   */
  static findParentKey(
    nodes: TreeNode[],
    targetKey: number
  ): number | undefined {
    const parentMap = new Map<number, number>();

    const buildParentMap = (nodes: TreeNode[], parentKey?: number) => {
      nodes.forEach((node) => {
        if (parentKey !== undefined) {
          parentMap.set(node.key, parentKey);
        }
        if (node.children) {
          buildParentMap(node.children, node.key);
        }
      });
    };

    buildParentMap(nodes);
    return parentMap.get(targetKey);
  }
}
