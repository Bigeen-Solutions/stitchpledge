import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCustomerSearch, useCreateCustomer, useCreateMeasurement } from "../features/customers/hooks/useCustomerIntake";
import { useWorkflowTemplates } from "../features/workflow/hooks/useWorkflowTemplates";
import { useMe } from "../features/auth/hooks/useAuth";
import { useStores } from "../features/auth/hooks/useStaff";
import { ordersApi } from "../features/orders/orders.api";
import { useToastStore } from "../components/feedback/Toast";

type Step = "CUSTOMER" | "MEASUREMENTS" | "GARMENTS" | "SUMMARY";

export function NewOrderPage() {
  const navigate = useNavigate();
  const showToast = useToastStore((state) => state.showToast);
  const { data: user } = useMe();
  const { data: stores } = useStores();
  const { data: templates } = useWorkflowTemplates();
  const createCustomer = useCreateCustomer();
  const createMeasurement = useCreateMeasurement();

  const [step, setStep] = useState<Step>("CUSTOMER");
  const [searchQuery, setSearchQuery] = useState("");
  const { data: searchResults, isLoading: isSearching } = useCustomerSearch(searchQuery);

  // Form State
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [newCustomer, setNewCustomer] = useState({ name: "", email: "", phone: "" });
  const [measurements, setMeasurements] = useState<Record<string, number>>({
    Chest: 100,
    Waist: 85,
    Inseam: 78,
    Sleeve: 62,
    Shoulder: 46,
    Neck: 40,
  });
  const [eventDate, setEventDate] = useState("");
  const [selectedStoreId, setSelectedStoreId] = useState("");
  const [garments, setGarments] = useState<{ workflowTemplateId: string; estimatedTotalDurationHours: number }[]>([]);

  const handleCreateOrder = async () => {
    try {
      let finalCustomerId = selectedCustomer?.id;
      let finalCustomerName = selectedCustomer?.name;

      // 1. Resolve Customer Identity
      if (!finalCustomerId) {
        if (!newCustomer.name.trim()) {
          throw new Error("Customer identification is required.");
        }
        showToast("Creating new customer profile...", "success");
        const c = await createCustomer.mutateAsync(newCustomer);
        finalCustomerId = c.id;
        finalCustomerName = c.name;
      }

      // 2. Generate Locked Measurement Version
      showToast("Recording immutable measurements...", "success");
      const mv = await createMeasurement.mutateAsync({ 
        customerId: finalCustomerId, 
        measurements 
      });

      if (!mv?.id) {
        throw new Error("Critical: Measurement version ID not returned by system.");
      }

      // 3. Finalize Order & Risk Projection
      const storeId = user?.storeId || selectedStoreId;
      if (!storeId) {
        throw new Error("Store assignment is required.");
      }
      
      showToast("Finalizing order & calculating risk...", "success");
      await ordersApi.createOrder({
        customerId: finalCustomerId,
        customerName: finalCustomerName.trim(),
        storeId,
        eventDate: new Date(eventDate).toISOString(),
        lockedMeasurementVersionId: mv.id,
        garments: garments.map(g => ({
          workflowTemplateId: g.workflowTemplateId,
          estimatedTotalDurationHours: g.estimatedTotalDurationHours || 24
        }))
      });

      showToast("Order intake complete. Redirecting to dashboard.", "success");
      navigate("/dashboard");
    } catch (err: any) {
      console.error("[Intake Engine Error]", err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to finalize order";
      showToast(errorMessage, "error");
    }
  };

  const addGarment = () => {
    if (templates && templates.length > 0) {
      setGarments([...garments, { workflowTemplateId: templates[0].id, estimatedTotalDurationHours: 24 }]);
    }
  };

  return (
    <div className="new-order-page container max-w-4xl py-xl">
      <header className="mb-xl text-center">
        <h1 className="text-h1 mb-xs">Intake Engine</h1>
        <p className="text-muted">High-fidelity order capture & measurement synchronization.</p>
      </header>

      {/* STEP INDICATOR */}
      <div className="flex justify-between mb-xl px-xl relative">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-sf-border -z-10" />
        {["CUSTOMER", "MEASUREMENTS", "GARMENTS", "SUMMARY"].map((s, idx) => (
          <div 
            key={s} 
            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all shadow-md ${
              step === s ? "bg-primary text-white scale-110" : idx < ["CUSTOMER", "MEASUREMENTS", "GARMENTS", "SUMMARY"].indexOf(step) ? "bg-success text-white" : "bg-sf-glass text-muted"
            }`}
          >
            {idx + 1}
          </div>
        ))}
      </div>

      <div className="sf-card sf-glass p-xl shadow-2xl border border-white/10">
        {step === "CUSTOMER" && (
          <section className="space-y-xl animate-in fade-in duration-500">
            <h2 className="text-h2">1. Identify the Client</h2>
            
            <div className="grid grid-cols-2 gap-xl">
              <div className="space-y-md">
                <label className="text-xs uppercase font-bold text-muted">Search Existing</label>
                <div className="relative">
                  <input 
                    type="text" 
                    className="sf-input w-full"
                    placeholder="Search by name, email or phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {isSearching && <div className="absolute right-3 top-3 text-xs">...</div>}
                </div>
                
                <div className="max-h-60 overflow-y-auto space-y-sm">
                  {searchResults?.map(c => (
                    <button 
                      key={c.id}
                      onClick={() => setSelectedCustomer(c)}
                      className={`w-full text-left p-md rounded-lg border transition-all ${
                        selectedCustomer?.id === c.id ? "bg-primary/20 border-primary" : "border-sf-border hover:bg-white/5"
                      }`}
                    >
                      <div className="font-bold">{c.name}</div>
                      <div className="text-xs text-muted">{c.email || c.phone || "No contact info"}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-md border-l border-sf-border pl-xl">
                <label className="text-xs uppercase font-bold text-muted">Create New Customer</label>
                <input 
                  type="text" 
                  className="sf-input w-full" 
                  placeholder="Full Name" 
                  value={newCustomer.name}
                  onChange={(e) => { setNewCustomer({...newCustomer, name: e.target.value}); setSelectedCustomer(null); }}
                />
                <input 
                  type="email" 
                  className="sf-input w-full" 
                  placeholder="Email" 
                  value={newCustomer.email}
                  onChange={(e) => { setNewCustomer({...newCustomer, email: e.target.value}); setSelectedCustomer(null); }}
                />
                <input 
                  type="tel" 
                  className="sf-input w-full" 
                  placeholder="Phone" 
                  value={newCustomer.phone}
                  onChange={(e) => { setNewCustomer({...newCustomer, phone: e.target.value}); setSelectedCustomer(null); }}
                />
              </div>
            </div>

            <div className="flex justify-end pt-lg">
              <button 
                className="btn btn-primary px-xl"
                disabled={!selectedCustomer && !newCustomer.name}
                onClick={() => setStep("MEASUREMENTS")}
              >
                Proceed to Measurements
              </button>
            </div>
          </section>
        )}

        {step === "MEASUREMENTS" && (
          <section className="space-y-xl animate-in fade-in duration-500">
            <h2 className="text-h2">2. Capture Measurements (cm)</h2>
            <p className="text-muted text-sm italic">Recording an immutable measurement version for {selectedCustomer?.name || newCustomer.name || "New Client"}.</p>
            
            <div className="grid grid-cols-3 gap-lg">
              {Object.keys(measurements).map(key => (
                <div key={key} className="form-group">
                  <label>{key}</label>
                  <input 
                    type="number" 
                    className="sf-input mt-xs"
                    value={measurements[key]}
                    onChange={(e) => setMeasurements({...measurements, [key]: Number(e.target.value)})}
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-lg">
              <button className="btn btn-muted" onClick={() => setStep("CUSTOMER")}>Back</button>
              <button className="btn btn-primary px-xl" onClick={() => setStep("GARMENTS")}>Record & Next</button>
            </div>
          </section>
        )}

        {step === "GARMENTS" && (
          <section className="space-y-xl animate-in fade-in duration-500">
            <h2 className="text-h2">3. Config Garments & Deadline</h2>
            
            <div className="grid grid-cols-2 gap-xl">
              <div className="form-group">
                <label className="block mb-xs">Requested Event Date</label>
                <input 
                  type="datetime-local" 
                  className="sf-input w-full" 
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  required
                />
                <p className="text-[10px] text-muted mt-xs uppercase font-bold">Mandatory for Risk Projection</p>
              </div>

              {!user?.storeId && (
                <div className="form-group">
                  <label className="block mb-xs">Store Assignment (Admin Only)</label>
                  <select 
                    className="sf-input w-full"
                    value={selectedStoreId}
                    onChange={(e) => setSelectedStoreId(e.target.value)}
                    required
                  >
                    <option value="">Select Target Store...</option>
                    {stores?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              )}
            </div>

            <div className="space-y-md">
              <div className="flex justify-between items-center">
                <h3 className="text-h3">Order Items</h3>
                <button className="btn btn-sm btn-accent" onClick={addGarment}>+ Add Garment</button>
              </div>

              {garments.map((g, idx) => (
                <div key={idx} className="flex gap-md items-end bg-white/5 p-md rounded-lg border border-sf-border shadow-inner">
                  <div className="flex-1">
                    <label className="text-xs font-bold text-muted uppercase">Template</label>
                    <select 
                      className="sf-input w-full mt-xs"
                      value={g.workflowTemplateId}
                      onChange={(e) => {
                        const newGarments = [...garments];
                        newGarments[idx].workflowTemplateId = e.target.value;
                        setGarments(newGarments);
                      }}
                    >
                      {templates?.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                  <button className="btn btn-icon btn-outline-danger" onClick={() => setGarments(garments.filter((_, i) => i !== idx))}>🗑️</button>
                </div>
              ))}
              {garments.length === 0 && <div className="text-center p-xl border border-dashed border-sf-border rounded-lg text-muted">No garments added yet.</div>}
            </div>

            <div className="flex justify-between pt-lg">
              <button className="btn btn-muted" onClick={() => setStep("MEASUREMENTS")}>Back</button>
              <button 
                className="btn btn-primary px-xl" 
                disabled={garments.length === 0 || !eventDate || (!user?.storeId && !selectedStoreId)}
                onClick={() => setStep("SUMMARY")}
              >
                Review Order
              </button>
            </div>
          </section>
        )}

        {step === "SUMMARY" && (
          <section className="space-y-xl animate-in zoom-in-95 duration-300">
            <h2 className="text-h2">Summary & Commitment</h2>
            
            <div className="grid grid-cols-2 gap-lg bg-white/5 p-lg rounded-xl border border-sf-border">
              <div>
                <div className="text-xs text-muted uppercase font-bold">Customer</div>
                <div className="font-bold text-lg">{selectedCustomer?.name || newCustomer.name}</div>
                <div className="text-sm text-muted">{selectedCustomer?.email || newCustomer.email}</div>
              </div>
              <div>
                <div className="text-xs text-muted uppercase font-bold">Production Deadline</div>
                <div className="font-bold text-lg text-primary">{new Date(eventDate).toLocaleDateString()}</div>
                <div className="text-sm text-muted">@ {user?.storeId ? "Assigned Store" : stores?.find(s => s.id === selectedStoreId)?.name}</div>
              </div>
            </div>

            <div className="space-y-sm">
              <div className="text-xs text-muted uppercase font-bold">Line Items ({garments.length})</div>
              {garments.map((g, i) => (
                <div key={i} className="flex justify-between p-md sf-glass border border-sf-border rounded-lg">
                  <span className="font-medium">{templates?.find(t => t.id === g.workflowTemplateId)?.name}</span>
                  <span className="badge badge-secondary">Pending Start</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-lg">
              <button className="btn btn-muted" onClick={() => setStep("GARMENTS")}>Back</button>
              <button 
                className="btn btn-primary px-xl shadow-[0_0_20px_var(--sf-primary)]" 
                onClick={handleCreateOrder}
              >
                Formalize Order
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
