import { useState } from 'react';
import { useRecordMeasurement } from '../hooks/useMeasurementMutation';

interface RecordMeasurementFormProps {
  customerId: string;
}

export function RecordMeasurementForm({ customerId }: RecordMeasurementFormProps) {
  const [changes, setChanges] = useState('');
  const [chest, setChest] = useState('');
  const [waist, setWaist] = useState('');
  const [sleeve, setSleeve] = useState('');
  
  const recordMutation = useRecordMeasurement(customerId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    recordMutation.mutate({
      chest: parseFloat(chest),
      waist: parseFloat(waist),
      sleeve: parseFloat(sleeve),
    }, {
      onSuccess: () => {
        setChanges('');
        setChest('');
        setWaist('');
        setSleeve('');
      }
    });
  };

  return (
    <div className="record-measurement-form sf-card sf-glass mb-xl">
      <h3 className="text-h3 mb-md">Record New Measurement Version</h3>
      <form onSubmit={handleSubmit} className="grid gap-md">
        <div className="grid grid-cols-3 gap-md">
          <div className="form-group">
            <label>Chest (in)</label>
            <input 
              type="number" 
              step="0.1" 
              value={chest} 
              onChange={(e) => setChest(e.target.value)} 
              required 
              placeholder="e.g. 42.5"
            />
          </div>
          <div className="form-group">
            <label>Waist (in)</label>
            <input 
              type="number" 
              step="0.1" 
              value={waist} 
              onChange={(e) => setWaist(e.target.value)} 
              required 
              placeholder="e.g. 34.0"
            />
          </div>
          <div className="form-group">
            <label>Sleeve (in)</label>
            <input 
              type="number" 
              step="0.1" 
              value={sleeve} 
              onChange={(e) => setSleeve(e.target.value)} 
              required 
              placeholder="e.g. 25.5"
            />
          </div>
        </div>
        
        <div className="form-group">
          <label>Summary of Changes</label>
          <textarea 
            value={changes} 
            onChange={(e) => setChanges(e.target.value)} 
            required 
            placeholder="e.g. Adjusted sleeve length for customer preference"
            rows={2}
          />
        </div>

        <button 
          type="submit" 
          disabled={recordMutation.isPending} 
          className="btn btn-accent"
        >
          {recordMutation.isPending ? 'Synchronizing Archive...' : 'Record Version'}
        </button>
      </form>
    </div>
  );
}
