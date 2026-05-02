import axios from 'axios';

// Align with backend DTOs
export interface RaiseDisputeDTO {
  orderId: string;
  category: 'MATERIAL' | 'MEASUREMENT' | 'FINANCIAL' | 'AESTHETIC';
  severity: 'CRITICAL' | 'WARNING';
  description: string;
  initiatedBy: 'CUSTOMER' | 'STAFF';
  evidenceArtifacts?: string[];
}

export interface SubmitEvidenceDTO {
  disputeId: string;
  evidenceType: 'PHOTO' | 'STATEMENT' | 'PAYMENT_PROOF';
  artifactUrl: string;
  metadata: Record<string, any>;
}

export interface ResolveDisputeDTO {
  disputeId: string;
  resolutionToken: string;
}

export interface DisputeStandoffDTO {
  disputeId: string;
  orderId: string;
  status: 'OPEN' | 'EVIDENCE_REQUIRED' | 'UNDER_REVIEW' | 'RESOLVED' | 'TERMINATED';
  category: string;
  daysInStandoff: number;
  lastActivityAt: string;
  blockingGarmentIds: string[];
  requiredAction: 'UPLOAD_PHOTO' | 'SIGN_AGREEMENT' | 'WAIT_FOR_REVIEW' | 'NONE';
}

const API_BASE = '/api/disputes';

export const disputeApi = {
  raiseDispute: async (dto: RaiseDisputeDTO) => {
    const response = await axios.post(`${API_BASE}`, dto);
    return response.data;
  },

  submitEvidence: async (dto: SubmitEvidenceDTO) => {
    await axios.post(`${API_BASE}/${dto.disputeId}/evidence`, dto);
  },

  resolveDispute: async (dto: ResolveDisputeDTO) => {
    const response = await axios.post(`${API_BASE}/${dto.disputeId}/resolve`, dto);
    return response.data;
  },

  getProjection: async (orderId: string): Promise<DisputeStandoffDTO> => {
    const response = await axios.get(`${API_BASE}/order/${orderId}/projection`);
    return response.data;
  }
};
