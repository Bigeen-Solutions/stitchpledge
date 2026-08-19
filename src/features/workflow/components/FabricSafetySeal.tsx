import React from 'react';

interface FabricSafetySealProps {
  reasonCode: string;
}

const REASON_MAP: Record<string, string> = {
  'MATERIAL_DISRUPTION': 'Material Custody Dispute: Production frozen to prevent irreversible fabric damage.',
  'FINANCIAL_GAP': 'Financial Commitment Void: Production halted pending deposit verification.',
  'DESIGN_VOID': 'Design Brief Conflict: production paused to resolve measurement or style ambiguity.',
};

export const FabricSafetySeal: React.FC<FabricSafetySealProps> = ({ reasonCode }) => {
  const message = REASON_MAP[reasonCode] || 'Production Inhibit Active: The Digital Foreman has paused this stage for your safety.';

  return (
    <div className="p-4 mt-2 border-2 border-red-500/50 bg-red-50/10 backdrop-blur-md rounded-xl flex items-center gap-4 animate-pulse">
      <div className="w-12 h-12 flex-shrink-0 bg-red-600 rounded-full flex items-center justify-center shadow-lg shadow-red-900/40">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m4-11a4 4 0 11-8 0 4 4 0 018 0zM7 10h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <div>
        <h4 className="text-red-500 font-bold uppercase tracking-widest text-xs">Fabric Safety Inhibit</h4>
        <p className="text-white text-sm font-medium leading-tight">
          {message}
        </p>
      </div>
    </div>
  );
};
