import {
  Outlet,
  useParams,
  useLocation,
  useNavigate,
  useBlocker
} from 'react-router-dom';
import { useEffect } from 'react';
import { GetIt } from '@/config/register/GetIt';
import styles from './Layout.module.css';
import { NotFound } from './notFound/NotFound';
import { isLocalHost } from '@/uikit/utils/env';
import { Modal } from 'antd';
import { useStore } from '@/uikit/hooks/useStore';
import { AuthStore } from '@/base/store/AuthStore';
import { AuthService } from '@/base/services/AuthService';
import { redirectToLogin } from '@/uikit/utils/auth';
import { useBloc } from '@/uikit/hooks/useBloc';
import { LayoutBloc } from './LayoutBloc';
import { Header } from './header/Header';

export function Layout() {
  const { id: projectId } = useParams<{ id: string }>();
  const authStore = GetIt.get(AuthStore);
  const authService = GetIt.get(AuthService);

  const isInitializing = useStore(authStore, (state) => state.isInitializing);
  const location = useLocation();
  const navigate = useNavigate();

  const bloc = useBloc(LayoutBloc);

  bloc.setProps({
    isInitializing,
    projectId,
    navigate,
    location
  });

  // 添加 beforeunload 事件监听
  useEffect(() => {
    bloc.setupBeforeUnloadListener();
    return () => bloc.cleanupBeforeUnloadListener();
  }, [bloc]);

  const blocker = useBlocker(({ currentLocation, nextLocation }) =>
    bloc.handleLocationCompare(currentLocation, nextLocation)
  );

  // 拦截路由变化，如果项目有未保存的更改，则显示保存弹窗
  useEffect(() => {
    bloc.handleBlocker(blocker);
  }, [blocker]);

  useEffect(() => {
    authService.init(new URL(window.location.href)).catch(redirectToLogin);
  }, []);

  useEffect(() => {
    bloc.setupProjectId();
    bloc.switchShowActions();
  }, [projectId, isInitializing, location.pathname]);

  // 如果正在初始化认证，显示加载状态
  if (isInitializing) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
          <div className={styles.loadingSpinner} />
          <div className={styles.loadingText}>Initializing...</div>
        </div>
      </div>
    );
  }

  if (bloc.state.notFound.value) {
    return <NotFound message="Project not found" />;
  }

  // 是否显示导航栏（仅在非本地环境首页时显示）
  const showNav = !(isLocalHost && location.pathname === '/');

  return (
    <div className={styles.layout}>
      {showNav && <Header bloc={bloc} />}
      <div className={styles.content}>
        <Outlet />
      </div>
      <Modal
        title="Unsaved Changes"
        open={bloc.state.showSaveModal.value}
        confirmLoading={bloc.state.isSaving.value}
        onOk={() => bloc.handleSaveAndExit()}
        onCancel={() => (bloc.state.showSaveModal.value = false)}
        centered
        closeIcon={
          <span
            onClick={(e) => {
              e.stopPropagation();
              bloc.state.showSaveModal.value = false;
            }}
          >
            ×
          </span>
        }
        okText="Save and Exit"
        cancelText="Exit Without Saving"
        cancelButtonProps={{
          onClick: () => bloc.handleLocationChange()
        }}
      >
        <p>You have unsaved changes. Would you like to save before leaving?</p>
      </Modal>
    </div>
  );
}
