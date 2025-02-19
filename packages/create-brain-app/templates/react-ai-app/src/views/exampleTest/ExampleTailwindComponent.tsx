import clsx from 'clsx';
import reactLogo from '@/assets/react.svg';
export type ExampleTailwindComponentProps = {
  className?: string;
};

export function ExampleTailwindComponent({
  className
}: ExampleTailwindComponentProps) {
  return (
    <div
      data-testid="ExampleTailwindComponent"
      className={clsx('p-4 sm:p-8 md:p-12', className)}
    >
      {/* 卡片容器 */}
      <div
        data-testid="card-container"
        className="w-full max-w-sm md:max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden"
      >
        {/* 卡片内容 */}
        <div className="flex flex-col">
          {/* 图片区域 */}
          <div>
            <img
              className="h-48 sm:h-56 w-full object-cover"
              src={reactLogo}
              alt="示例图片"
            />
          </div>
          {/* 文字内容区域 */}
          <div data-testid="content-area" className="p-4 sm:p-6 md:p-8">
            <div className="text-blue-600 font-semibold text-sm sm:text-base">
              TAILWIND 示例
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-2 sm:mt-3">
              使用 Tailwind CSS 创建精美的用户界面
            </h2>
            <p className="mt-2 sm:mt-4 text-gray-600 text-sm sm:text-base">
              这是一个使用 Tailwind CSS
              构建的示例组件，展示了响应式设计、颜色、间距等样式效果。
            </p>
            {/* 按钮 */}
            <button className="w-full sm:w-auto mt-4 sm:mt-6 px-4 sm:px-6 py-2 sm:py-2.5 bg-blue-600 text-white text-sm sm:text-base rounded-md hover:bg-blue-700 transition duration-300">
              了解更多
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
