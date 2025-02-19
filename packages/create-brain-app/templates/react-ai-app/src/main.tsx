/* eslint-disable react-refresh/only-export-components */
import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  Navigate,
  useLocation,
  createBrowserRouter,
  RouterProvider
} from 'react-router-dom';
import { ExperimentPage } from './pages/Experiment/ExperimentPage';
import { Layout } from './views/layout/Layout';
import '@/uikit/styles/index.css';
import '@xyflow/react/dist/style.css';
import 'antd/dist/reset.css';
import { HomePage } from './pages/HomePage/HomePage';
import { isLocalHost } from './uikit/utils/env';
import { BrowserGetIt } from './config/register/BrowserGetIt';
import { GetIt } from './config/register/GetIt';
import { ApiManagementNewPage } from './pages/apiManagementNewPage/ApiManagementNewPage';

// 配置依赖注入容器， 仅在生产环境使用
// 当测试环境时， 使用 VitestGetIt
GetIt.implement(new BrowserGetIt());

// 修改重定向组件
const RedirectToExperiment = () => {
  const location = useLocation();
  // 本地环境显示首页，线上环境直接跳转到实验页面
  if (isLocalHost) {
    return <HomePage />;
  }
  return <Navigate to={`/experiment${location.search}`} replace />;
};

// 创建一个包装组件来处理带 ID 的路由
const ExperimentPageWrapper = () => {
  const location = useLocation();
  return <ExperimentPage key={location.search} />;
};

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <Layout />,
      children: [
        {
          index: true,
          element: <RedirectToExperiment />
        },
        {
          path: 'experiment/:id',
          element: <ExperimentPageWrapper />
        },
        {
          path: 'api-management',
          element: <ApiManagementNewPage />
        }
      ]
    }
  ],
  {
    basename: '/reactflow/'
  }
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
