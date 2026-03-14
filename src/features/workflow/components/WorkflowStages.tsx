import { useWorkflow, useCompleteStage } from '../hooks/useWorkflowMutation';
import { StageStepper } from '../../../components/ui/StageStepper.tsx';

interface Stage {
  id: string;
  name: string;
  status: string;
  isWarning: boolean;
  isComplete: boolean;
  isActive: boolean;
}

export function WorkflowStages({ orderId }: { orderId: string }) {
  const { data: workflow, isLoading } = useWorkflow(orderId);
  const completeStage = useCompleteStage(orderId);

  if (isLoading) return <div>Syncing Workflow Engine...</div>;
  if (!workflow) return null;

  return (
    <div className="workflow-stages sf-card">
      <div className="flex justify-between items-center mb-lg">
        <h3 className="text-h3">Production Workflow</h3>
        <StageStepper 
          totalStages={workflow.stages.length} 
          currentStage={workflow.activeStageIndex} 
          status={workflow.isWarning ? 'WARNING' : 'NORMAL'}
        />
      </div>

      <div className="stages-list grid gap-md">
        {workflow.stages.map((stage: Stage) => (
          <div key={stage.id} className="stage-item flex justify-between items-center p-md sf-glass mb-md" style={{ borderRadius: 'var(--radius-card)' }}>
            <div>
              <span className="text-sm font-bold">{stage.name}</span>
              <p className="text-xs text-muted">{stage.status}</p>
            </div>
            {stage.isActive ? (
              <button 
                onClick={() => completeStage.mutate(stage.id)}
                disabled={completeStage.isPending}
                className="btn btn-accent btn-sm"
              >
                {completeStage.isPending ? 'Syncing...' : 'Complete Stage'}
              </button>
            ) : stage.isComplete ? (
              <span className="badge badge-ontrack">Done</span>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
