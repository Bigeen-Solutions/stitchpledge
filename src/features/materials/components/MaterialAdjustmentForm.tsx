import { useState } from 'react';
import { useAdjustMaterial } from '../hooks/useMaterialMutation';

interface MaterialAdjustmentFormProps {
  orderId: string;
}

export function MaterialAdjustmentForm({ orderId }: MaterialAdjustmentFormProps) {
  const [delta, setDelta] = useState('0');
  const [reason, setReason] = useState('');
  
  const adjustmentMutation = useAdjustMaterial(orderId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    adjustmentMutation.mutate({
      delta: parseFloat(delta),
      reason
    }, {
      onSuccess: () => {
        setDelta('0');
        setReason('');
      }
    });
  };

  return (
    <div className="material-adjustment-form sf-card sf-glass">
      <h3 className="text-h3 mb-md">Log Material Adjustment</h3>
      <form onSubmit={handleSubmit} className="grid gap-md">
        <div className="grid grid-cols-2 gap-sm">
          <div className="form-group">
            <label>Quantity Delta</label>
            <input 
              type="number" 
              step="0.01" 
              value={delta} 
              onChange={(e) => setDelta(e.target.value)} 
              required 
              placeholder="e.g. -1.5 or +2.0"
            />
          </div>
          <div className="form-group">
            <label>Reason / Note</label>
            <input 
              type="text" 
              value={reason} 
              onChange={(e) => setReason(e.target.value)} 
              required 
              placeholder="e.g. Scraps from trimming"
            />
          </div>
        </div>
        <button 
          type="submit" 
          disabled={adjustmentMutation.isPending} 
          className="btn btn-primary btn-sm"
        >
          {adjustmentMutation.isPending ? 'Syncing Ledger...' : 'Log Transaction'}
        </button>
      </form>
    </div>
  );
}
