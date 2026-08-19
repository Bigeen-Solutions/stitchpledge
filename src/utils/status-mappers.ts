export const mapRiskStatus = (status: string): string => {
  switch (status) {
    case 'ON_TRACK': return 'On schedule';
    case 'AT_RISK': return 'Needs attention';
    case 'OVERDUE': return 'Running late';
    case 'UNKNOWN': return 'Unknown';
    default: return status;
  }
};

export const mapOrderStatus = (status: string): string => {
  switch (status) {
    case 'PENDING': return 'Awaiting start';
    case 'ACTIVE': return 'In progress';
    case 'IN_PRODUCTION': return 'Being made';
    case 'READY_FOR_COLLECTION': return 'Ready for pickup';
    case 'COLLECTED': return 'Picked up';
    case 'CANCELLED': return 'Cancelled';
    case 'IN_DISPUTE': return 'Paused for review';
    default: return status;
  }
};

export const mapWorkflowStageId = (stageId: string): string => {
  switch (stageId) {
    case 'INTAKE': return 'Intake';
    case 'CUTTING': return 'Cutting';
    case 'SEWING': return 'Sewing';
    case 'EMBELLISHMENT': return 'Embellishing';
    case 'FINISHING': return 'Finishing';
    case 'QC': return 'Quality Check';
    case 'READY': return 'Ready';
    default: return stageId;
  }
};

export const mapWorkflowStatus = (status: string): string => {
  switch (status) {
    case 'PENDING': return 'Awaiting start';
    case 'IN_PROGRESS': return 'In progress';
    case 'BLOCKED': return 'Blocked';
    case 'INHIBITED': return 'Inhibited';
    case 'COMPLETED': return 'Completed';
    default: return status;
  }
};

export const mapTimelineEntryType = (entryType: string): string => {
  switch (entryType) {
    case 'INTAKE': return 'Intake';
    case 'ADJUSTMENT': return 'Adjustment';
    case 'MEASUREMENT': return 'Measurement';
    case 'LOCKED': return 'Locked';
    default: return entryType;
  }
};
