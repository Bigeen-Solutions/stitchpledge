import { useGarmentWorkflow, useReportStageCompletion } from '../hooks/useWorkflowMutation';
import type { StageInstance } from '../workflow.api';

interface WorkflowGraphProps {
  garmentId: string;
  orderId: string;
}

export function WorkflowGraph({ garmentId, orderId }: WorkflowGraphProps) {
  const { data: workflow, isLoading } = useGarmentWorkflow(garmentId);
  const reportCompletion = useReportStageCompletion(garmentId, orderId);

  if (isLoading) return <div className="p-md text-muted animate-pulse">Syncing Workflow DAG...</div>;
  if (!workflow) return null;

  const { stages } = workflow;

  return (
    <div className="workflow-graph sf-card p-lg">
      <div className="flex justify-between items-center mb-xl">
        <h3 className="text-h3">Production Workflow</h3>
        <div className="text-xs text-muted uppercase tracking-wider font-bold">
          High-Fidelity DAG Execution
        </div>
      </div>

      <div className="flex flex-col gap-lg relative">
        {stages.map((stage: StageInstance, index: number) => {
          const isActive = stage.status === 'ACTIVE';
          const isCompleted = stage.status === 'COMPLETED';
          
          return (
            <div key={stage.id} className="relative flex items-start gap-lg">
              {/* Connection Line */}
              {index < stages.length - 1 && (
                <div 
                  className="absolute left-[15px] top-[30px] w-[2px] h-[calc(100%)] bg-sf-border" 
                  style={{ 
                    backgroundColor: isCompleted ? 'var(--sf-success)' : 'var(--sf-border)',
                    zIndex: 0 
                  }}
                />
              )}

              {/* Node Indicator */}
              <div 
                className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  isActive ? 'border-primary bg-primary text-white animate-pulse' : 
                  isCompleted ? 'border-success bg-success text-white' : 
                  'border-sf-border bg-sf-glass text-muted'
                }`}
              >
                {isCompleted ? '✓' : index + 1}
              </div>

              {/* Node Content */}
              <div className={`flex-1 p-md rounded-lg border sf-glass transition-all duration-300 ${
                isActive ? 'border-primary shadow-sm' : 'border-sf-border opacity-80'
              }`}>
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-sm">{stage.stageId.replace('_', ' ').toUpperCase()}</h4>
                    <p className="text-xs text-muted">
                      {isCompleted ? `Completed at ${new Date(stage.completedAt!).toLocaleTimeString()}` : 
                       isActive ? 'Active - Ready for specialized work' : 'Pending upstream stages'}
                    </p>
                  </div>
                  
                  {isActive && (
                    <button 
                      onClick={() => reportCompletion.mutate({ stageId: stage.stageId })}
                      disabled={reportCompletion.isPending}
                      className="btn btn-accent btn-sm py-1"
                    >
                      {reportCompletion.isPending ? 'Syncing...' : 'Mark Complete'}
                    </button>
                  )}

                  {isCompleted && (
                    <span className="text-success text-xs font-bold uppercase">Ready</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
