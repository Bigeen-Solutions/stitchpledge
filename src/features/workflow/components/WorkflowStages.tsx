import React from 'react'
import { useWorkflow, useCompleteStage } from "../hooks/useWorkflowMutation"
import { StageStepper } from "../../../components/ui/StageStepper.tsx"
import type { StageInstance } from "../workflow.api"
import { FabricSafetySeal } from "./FabricSafetySeal"

export function WorkflowStages({ garmentId }: { garmentId: string }) {
  const { data: workflow, isLoading } = useWorkflow(garmentId)
  const completeStage = useCompleteStage(garmentId)

  if (isLoading) return <div>Syncing Workflow Engine...</div>
  if (!workflow) return null

  const activeStageIndex = workflow.stages.findIndex(
    (stage) => stage.status === "IN_PROGRESS" || stage.status === "PENDING" || stage.status === "INHIBITED",
  )

  const isWarning = workflow.stages.some((stage) => stage.status === "BLOCKED" || stage.status === "INHIBITED")

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
          const isInProgress = stage.status === "IN_PROGRESS"
          const isComplete = stage.status === "COMPLETED"
          const isInhibited = stage.status === "INHIBITED"

          return (
            <React.Fragment key={stage.id}>
              <div
                className="stage-item flex justify-between items-center p-md sf-glass mb-md"
                style={{ borderRadius: "var(--radius-card)" }}
              >
              <div className="flex items-center gap-4">
                <div>
                  <span className="text-sm font-bold uppercase tracking-tight">{stage.stageId}</span>
                  <p className={`text-[10px] font-bold ${isInhibited ? 'text-red-500' : 'text-muted'}`}>{stage.status}</p>
                </div>
              </div>
              {isInProgress ? (
                <button
                  onClick={() => completeStage.mutate(stage.id)}
                  disabled={completeStage.isPending}
                  className="btn btn-accent btn-sm shadow-lg shadow-accent/20"
                >
                  {completeStage.isPending ? "Syncing..." : "Complete Stage"}
                </button>
              ) : isInhibited ? (
                <div className="flex flex-col items-end">
                   <span className="text-[10px] text-red-500 font-bold bg-red-500/10 px-2 py-0.5 rounded uppercase tracking-widest">Inhibited</span>
                </div>
              ) : isComplete ? (
                <span className="badge badge-ontrack px-4">Done</span>
              ) : null}
            </div>
            {isInhibited && (
              <div className="px-md pb-md">
                <FabricSafetySeal reasonCode={stage.reasonCode || 'MATERIAL_DISRUPTION'} />
              </div>
            )}
          </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}
