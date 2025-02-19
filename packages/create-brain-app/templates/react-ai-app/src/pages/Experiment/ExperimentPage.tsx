import { useCallback, useEffect } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  addEdge,
  MarkerType,
  ReactFlowProvider,
  OnConnect,
  NodeTypes,
  BackgroundVariant,
  EdgeTypes
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { GetIt } from '@/config/register/GetIt';
import { ResultDisplay } from '@/views/experiment/ResultDisplay/ResultDisplay';
import { useParams } from 'react-router-dom';
import { XYFlowStore } from '@/base/store/XYFlowStore';
import '@/views/components/modal/Modal.css';
import { Modal } from '@/views/components/modal/Modal';
import { Publish } from '@/views/publish/Publish';
import { CustomNode } from '@/views/experiment/customNode/CustomNode';
import { ExperimentBloc } from './ExperimentBloc';
import { useStore } from '@/uikit/hooks/useStore';
import { CommandInput } from '@/views/experiment/commandInput/CommandInput';
import { CopyToast } from '@/views/experiment/copyToast/CopyToast';
import { useBloc } from '@/uikit/hooks/useBloc';
import { ThemeStore } from '@/base/store/ThemeStore';
import { PublishStore } from '@/base/store/PublishStore';
import { CustomEdge } from '@/views/custom-edges/CustomEdge';

// Add default edge options configuration
const defaultEdgeOptions = {
  type: 'smoothstep',
  animated: true,
  style: { stroke: '#555', strokeWidth: 3 },
  markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 },
  labelStyle: { fill: '#555', fontWeight: 700 },
  zIndex: 1000,
  interactionWidth: 10
};

// Node Types
const nodeTypes = {
  custom: CustomNode
} as unknown as NodeTypes;

const edgeTypes = {
  smoothstep: CustomEdge
} as unknown as EdgeTypes;

function ExperimentPageInner() {
  const xyFlowStore = GetIt.get(XYFlowStore);
  const themeStore = GetIt.get(ThemeStore);
  const publishStore = GetIt.get(PublishStore);

  const { nodes, edges } = useStore(xyFlowStore);
  const themeStoreState = useStore(themeStore);
  const publishStoreState = useStore(publishStore);
  const { id: projectId } = useParams<{ id: string }>();

  const bloc = useBloc(ExperimentBloc);

  // Handle connection
  const onConnect: OnConnect = useCallback(
    (params) =>
      xyFlowStore.changeEdges(addEdge(params, xyFlowStore.state.edges)),
    [xyFlowStore]
  );

  // Update isFirstQuery after first successful query
  useEffect(() => {
    if (nodes.length > 0 && bloc.state.isFirstQuery.value) {
      bloc.state.isFirstQuery.value = false;
    }
  }, [nodes.length, bloc.state.isFirstQuery.value]);

  // 加载保存的项目数据
  useEffect(() => {
    bloc.loadProjectData(projectId);
  }, [projectId]);

  return (
    <div
      style={{
        width: '100vw',
        height: 'calc(100vh - 64px)',
        background: themeStoreState.isDarkMode ? '#1a1a1a' : '#ffffff'
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={xyFlowStore.onNodesChange}
        onEdgesChange={xyFlowStore.onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        fitViewOptions={{
          padding: 0.2,
          duration: 800,
          maxZoom: 2
        }}
      >
        <Controls />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>

      <ResultDisplay />

      <CommandInput bloc={bloc} />

      {/* Success Modal */}
      <Publish
        isCopied={bloc.state.isCopied.value}
        setIsCopied={(val) => (bloc.state.isCopied.value = val)}
        handleCopy={() => bloc.handleCopy()}
      />

      {/* Error Modal */}
      <Modal
        title="Publishing Failed"
        isOpen={!!publishStoreState.publishError}
        onClose={() => publishStore.setPublishError(null)}
      >
        <p>{publishStoreState.publishError}</p>
      </Modal>

      <CopyToast bloc={bloc} />
    </div>
  );
}

// Wrap ExperimentPage with ReactFlowProvider and export
export function ExperimentPage() {
  return (
    <ReactFlowProvider>
      <ExperimentPageInner />
    </ReactFlowProvider>
  );
}
