import { Tree, Input, Spin, Button, Tooltip, Modal, Empty, Form } from 'antd';
import {
  FolderOutlined,
  FileOutlined,
  SearchOutlined,
  FolderAddOutlined,
  FileAddOutlined,
  DeleteOutlined,
  EditOutlined,
  ArrowsAltOutlined,
  ShrinkOutlined
} from '@ant-design/icons';
import { useBloc } from '@/uikit/hooks/useBloc';
import { ApiTreeBloc } from './ApiTreeBloc';
import styles from './ApiTree.module.css';
import { ApiManagementNewPageBloc } from '@/pages/apiManagementNewPage/ApiManagementNewPageBloc';
import { useEffect } from 'react';

export class ApiTreeProps {
  bloc: ApiManagementNewPageBloc = new ApiManagementNewPageBloc();
}
export function ApiTree(props: ApiTreeProps) {
  const bloc = useBloc(ApiTreeBloc);
  const apiType = props.bloc.state.apiType.value;

  bloc.setProps(props);

  // 监听到 treeData 有值，切换 apiType 时才触发初始化
  useEffect(() => {
    if (props.bloc.state.treeData.value.length > 0) {
      if (bloc.state.prevApiType !== apiType) {
        bloc.state.prevApiType = apiType;
        bloc.initializeExpandedKeys(apiType);
      }
    } else {
      bloc.state.prevApiType = apiType;
    }
    return () => {
      bloc.state.prevApiType = '';
    };
  }, [props.bloc.state.treeData.value.length]);

  const treeData = bloc.getFilteredTreeData();
  const isEmpty =
    !props.bloc.state.isTreeLoading.value &&
    (!treeData || treeData.length === 0);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.searchBox}>
          <Input
            placeholder="Search APIs"
            allowClear
            prefix={<SearchOutlined />}
            value={bloc.state.searchValue.value}
            onChange={(e) => (bloc.state.searchValue.value = e.target.value)}
          />
        </div>
        <Tooltip title={bloc.isAllExpanded() ? 'Collapse All' : 'Expand All'}>
          <Button
            icon={
              bloc.isAllExpanded() ? (
                <ShrinkOutlined style={{ transform: 'rotateZ(-45deg)' }} />
              ) : (
                <ArrowsAltOutlined style={{ transform: 'rotateZ(-45deg)' }} />
              )
            }
            onClick={() => bloc.toggleExpandAll(apiType)}
          />
        </Tooltip>
        <Tooltip title="Add Directory">
          {props.bloc.shouldShowOperations() && (
            <Button
              type="primary"
              icon={<FolderAddOutlined />}
              onClick={() => bloc.showDirectoryModal()}
            />
          )}
        </Tooltip>
      </div>
      <Spin spinning={props.bloc.state.isTreeLoading.value}>
        {isEmpty ? (
          <div className={styles.emptyState}>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No API directories found"
            >
              {props.bloc.shouldShowOperations() && (
                <Button
                  type="primary"
                  icon={<FolderAddOutlined />}
                  onClick={() => bloc.showDirectoryModal()}
                >
                  Create Directory
                </Button>
              )}
            </Empty>
          </div>
        ) : (
          <Tree
            showIcon
            expandedKeys={bloc.state.expandedKeysByType.value[apiType] || []}
            selectedKeys={bloc.getSelectedKeys(apiType)}
            onExpand={(keys) => {
              bloc.setExpandedState(apiType, keys as number[]);
            }}
            expandAction="click"
            onSelect={(keys, info) => {
              if (keys.length > 0 && info.node) {
                const key = keys[0] as number;
                if (info.node.isLeaf) {
                  bloc.handleNodeSelect(key, apiType);
                }
              }
            }}
            treeData={treeData}
            titleRender={(node) => (
              <div className={styles.treeNode}>
                <span className={styles.nodeTitle}>{node.title}</span>
                {props.bloc.shouldShowOperations() && (
                  <div className={styles.nodeActions}>
                    {!node.isLeaf && (
                      <>
                        <Tooltip title="Edit Directory">
                          <Button
                            type="text"
                            size="small"
                            className={styles.actionBtn}
                            icon={<EditOutlined />}
                            onClick={(e) => {
                              e.stopPropagation();
                              bloc.showDirectoryModal(node.key, node.title);
                            }}
                          />
                        </Tooltip>
                        <Tooltip title="Add File">
                          <Button
                            type="text"
                            size="small"
                            className={styles.actionBtn}
                            icon={<FileAddOutlined />}
                            onClick={(e) => {
                              e.stopPropagation();
                              bloc.showAddFileModal(node.key);
                            }}
                          />
                        </Tooltip>
                        <Tooltip title="Delete Directory">
                          <Button
                            type="text"
                            size="small"
                            className={styles.actionBtn}
                            danger
                            icon={<DeleteOutlined />}
                            onClick={(e) => {
                              e.stopPropagation();
                              bloc.handleDeleteDirectory(node.key);
                            }}
                          />
                        </Tooltip>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
            icon={({ isLeaf }) =>
              isLeaf ? <FileOutlined /> : <FolderOutlined />
            }
          />
        )}
      </Spin>

      <Modal
        title={
          bloc.state.editingDirectoryKey.value
            ? 'Edit Directory'
            : 'Add Directory'
        }
        style={{ top: '32%' }}
        open={bloc.state.isDirectoryModalOpen.value}
        onOk={() => bloc.handleDirectorySubmit()}
        onCancel={() => (bloc.state.isDirectoryModalOpen.value = false)}
        confirmLoading={bloc.state.isDirectoryLoading.value}
      >
        <Input
          placeholder="Enter directory name"
          value={bloc.state.newItemName.value}
          onChange={(e) => (bloc.state.newItemName.value = e.target.value)}
          disabled={bloc.state.isDirectoryLoading.value}
        />
      </Modal>

      <Modal
        title="Add File"
        width={700}
        open={bloc.state.isAddFileModalOpen.value}
        onOk={() => bloc.handleAddFile()}
        onCancel={() => (bloc.state.isAddFileModalOpen.value = false)}
        confirmLoading={bloc.state.isFileLoading.value}
      >
        <Form layout="vertical">
          <Form.Item label="Name" required>
            <Input
              value={bloc.state.newItemName.value}
              onChange={(e) => (bloc.state.newItemName.value = e.target.value)}
              placeholder="Enter file name"
            />
          </Form.Item>
          <Form.Item label="Description">
            <Input.TextArea
              value={bloc.state.newItemDescription.value}
              onChange={(e) =>
                (bloc.state.newItemDescription.value = e.target.value)
              }
              placeholder="Enter file description"
              rows={3}
            />
          </Form.Item>
          <Form.Item label="Content">
            <Input.TextArea
              value={bloc.state.newItemContent.value}
              onChange={(e) =>
                (bloc.state.newItemContent.value = e.target.value)
              }
              placeholder="Enter file content"
              rows={5}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
