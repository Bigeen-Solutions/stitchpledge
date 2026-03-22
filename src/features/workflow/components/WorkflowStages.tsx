import { useWorkflow, useCompleteStage } from "../hooks/useWorkflowMutation"
import { StageStepper } from "../../../components/ui/StageStepper.tsx"
import type { StageInstance } from "../workflow.api"

export function WorkflowStages({ garmentId }: { garmentId: string }) {
  const { data: workflow, isLoading } = useWorkflow(garmentId)
  const completeStage = useCompleteStage(garmentId)

  if (isLoading) return <div>Syncing Workflow Engine...</div>
  if (!workflow) return null

  const activeStageIndex = workflow.stages.findIndex(
    (stage) => stage.status === "ACTIVE" || stage.status === "PENDING",
  )

  const isWarning = workflow.stages.some((stage) => stage.status === "BLOCKED")

  return (
    <div className="workflow-stages sf-card">
      <div className="flex justify-between items-center mb-lg">
        <h3 className="text-h3">Production Workflow</h3>
        <StageStepper
          totalStages={workflow.stages.length}
          currentStage={activeStageIndex === -1 ? 0 : activeStageIndex}
          status={isWarning ? "WARNING" : "NORMAL"}
        />
      </div>

      <div className="stages-list grid gap-md">
        {workflow.stages.map((stage: StageInstance) => {
          const isActive = stage.status === "ACTIVE"
          const isComplete = stage.status === "COMPLETED"

          return (
            <div
              key={stage.id}
              className="stage-item flex justify-between items-center p-md sf-glass mb-md"
              style={{ borderRadius: "var(--radius-card)" }}
            >
              <div>
                <span className="text-sm font-bold">{stage.stageId}</span>
                <p className="text-xs text-muted">{stage.status}</p>
              </div>
              {isActive ? (
                <button
                  onClick={() => completeStage.mutate(stage.id)}
                  disabled={completeStage.isPending}
                  className="btn btn-accent btn-sm"
                >
                  {completeStage.isPending ? "Syncing..." : "Complete Stage"}
                </button>
              ) : isComplete ? (
                <span className="badge badge-ontrack">Done</span>
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}
