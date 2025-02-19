import { Box } from '@mui/material';
import { ApiTree } from '@/views/apiManagementNew/apiTree/ApiTree';
import { ApiDetail } from '@/views/apiManagementNew/apiDetail/ApiDetail';
import { useBloc } from '@/uikit/hooks/useBloc';
import { ApiManagementNewPageBloc, ApiType } from './ApiManagementNewPageBloc';
import styles from './ApiManagementNewPage.module.css';
import { useEffect } from 'react';
import { Radio, Space } from 'antd';
import { GlobalOutlined, UserOutlined } from '@ant-design/icons';

export function ApiManagementNewPage() {
  const bloc = useBloc(ApiManagementNewPageBloc);

  useEffect(() => {
    // 检查 URL 中是否有 apiType 参数
    const urlParams = new URLSearchParams(window.location.search);
    if (!urlParams.has('apiType')) {
      // 如果没有 apiType 参数，设置为默认值 personal
      bloc.updateUrlParam('apiType', ApiType.PERSONAL);
      bloc.state.apiType.value = ApiType.PERSONAL;
    } else {
      // 如果有 apiType 参数，从 URL 中获取并设置
      bloc.state.apiType.value = bloc.getApiTypeFromUrl();
    }

    bloc.loadTreeData();
  }, []);

  return (
    <Box className={styles.container}>
      <Box className={styles.leftPanel}>
        <Box className={styles.tabContainer}>
          <Radio.Group
            value={bloc.state.apiType.value}
            onChange={(e) => bloc.switchApiType(e.target.value)}
            buttonStyle="solid"
            size="middle"
            className={styles.radioGroup}
          >
            <Radio.Button value="personal" className={styles.radioButton}>
              <Space>
                <UserOutlined />
                Personal
              </Space>
            </Radio.Button>
            <Radio.Button value="global" className={styles.radioButton}>
              <Space>
                <GlobalOutlined />
                Global
              </Space>
            </Radio.Button>
          </Radio.Group>
        </Box>
        <ApiTree bloc={bloc} />
      </Box>
      <Box className={styles.rightPanel}>
        {bloc.state.currentApi.value ? (
          <ApiDetail bloc={bloc} />
        ) : (
          <Box className={styles.emptyState}>please select a document</Box>
        )}
      </Box>
    </Box>
  );
}
