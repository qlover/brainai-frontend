import { Card, Input, Button, Spin, Switch, Tooltip } from 'antd';
import {
  EditOutlined,
  SaveOutlined,
  CopyOutlined,
  DeleteOutlined,
  CloseOutlined
} from '@ant-design/icons';
import { useBloc } from '@/uikit/hooks/useBloc';
import { ApiDetailBloc } from './ApiDetailBloc';
import styles from './ApiDetail.module.css';
import { useEffect } from 'react';
import { ApiManagementNewPageBloc } from '@/pages/apiManagementNewPage/ApiManagementNewPageBloc';
export class Props {
  bloc: ApiManagementNewPageBloc = new ApiManagementNewPageBloc();
}

export function ApiDetail(props: Props) {
  const bloc = useBloc(ApiDetailBloc);

  bloc.setProps(props);
  useEffect(() => {
    bloc.updateContent();
  }, [props.bloc.state.currentApi.value]);

  return (
    <Spin spinning={props.bloc.state.isApiDetailLoading.value}>
      <Card
        title={
          bloc.state.isEditing.value ? (
            <Input
              value={bloc.state.name.value}
              onChange={(e) => (bloc.state.name.value = e.target.value)}
              style={{ width: '200px' }}
            />
          ) : (
            bloc.state.name.value
          )
        }
        extra={
          <div className={styles.actions}>
            <div className={styles.actionGroup}>
              {props.bloc.shouldShowOperations() && (
                <Tooltip
                  title={
                    bloc.state.enabled.value ? 'Disable API' : 'Enable API'
                  }
                >
                  <Switch
                    className={styles.switch}
                    size="small"
                    checked={bloc.state.enabled.value}
                    disabled={!bloc.state.isEditing.value}
                    onChange={(checked) => bloc.handleToggleEnabled(checked)}
                  />
                </Tooltip>
              )}
              <Tooltip title="Copy Content">
                <Button
                  className={styles.actionButton}
                  type="text"
                  icon={<CopyOutlined />}
                  onClick={() => bloc.handleCopy()}
                />
              </Tooltip>
              {props.bloc.shouldShowOperations() && (
                <Tooltip title="Delete API">
                  <Button
                    className={styles.actionButton}
                    type="text"
                    danger
                    loading={bloc.state.deleteLoading.value}
                    icon={<DeleteOutlined />}
                    onClick={() => bloc.handleDelete()}
                  />
                </Tooltip>
              )}
            </div>

            {props.bloc.shouldShowOperations() && (
              <div className={styles.actionGroup}>
                {bloc.state.isEditing.value ? (
                  <>
                    <Tooltip title="Save">
                      <Button
                        className={styles.actionButton}
                        type="primary"
                        loading={bloc.state.saveLoading.value}
                        icon={<SaveOutlined />}
                        onClick={() => bloc.handleSave()}
                      />
                    </Tooltip>
                    <Tooltip title="Cancel">
                      <Button
                        className={styles.actionButton}
                        icon={<CloseOutlined />}
                        onClick={() => bloc.handleCancelEdit()}
                      />
                    </Tooltip>
                  </>
                ) : (
                  <Tooltip title="Edit">
                    <Button
                      className={styles.actionButton}
                      type="primary"
                      icon={<EditOutlined />}
                      onClick={() => bloc.handleEditToggle()}
                    />
                  </Tooltip>
                )}
              </div>
            )}
          </div>
        }
        className={styles.card}
      >
        <div className={styles.description}>
          <label>Description</label>
          <Input.TextArea
            value={bloc.state.description.value}
            onChange={(e) => (bloc.state.description.value = e.target.value)}
            placeholder="Enter API description"
            autoSize={{ minRows: 2, maxRows: 4 }}
            readOnly={!bloc.state.isEditing.value}
            variant={bloc.state.isEditing.value ? 'outlined' : 'borderless'}
          />
        </div>
        <div className={styles.contentWrapper}>
          <label>Content</label>
          <Input.TextArea
            value={bloc.state.content.value}
            onChange={(e) => bloc.handleContentChange(e.target.value)}
            readOnly={!bloc.state.isEditing.value}
            variant={bloc.state.isEditing.value ? 'outlined' : 'borderless'}
            className={styles.content}
          />
        </div>
      </Card>
    </Spin>
  );
}
