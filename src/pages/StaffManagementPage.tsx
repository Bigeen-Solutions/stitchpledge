import { useState } from "react";
import { useStaffList, useInviteStaff, useUpdateStaffStatus, useStores } from "../features/auth/hooks/useStaff";
import { useMe } from "../features/auth/hooks/useAuth";

export function StaffManagementPage() {
  const { data: currentUser } = useMe();
  const { data: staff, isLoading: isLoadingStaff } = useStaffList();
  const { data: stores, isLoading: isLoadingStores } = useStores();
  const inviteStaff = useInviteStaff();
  const updateStatus = useUpdateStaffStatus();

  const [inviteData, setInviteData] = useState({
    email: "",
    role: "TAILOR",
    storeId: "",
    initialPassword: "",
  });

  if (currentUser?.role !== "COMPANY_ADMIN") {
    return (
      <div className="container p-xl text-center">
        <h1 className="text-h1">Access Denied</h1>
        <p className="text-muted">Only Company Admins can manage staff.</p>
      </div>
    );
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteData.storeId && stores && stores.length > 0) {
      // Auto-select first store if none selected
      await inviteStaff.mutateAsync({ ...inviteData, storeId: stores[0].id });
    } else {
      await inviteStaff.mutateAsync(inviteData as any);
    }
    setInviteData({ email: "", role: "TAILOR", storeId: "", initialPassword: "" });
  };

  if (isLoadingStaff || isLoadingStores) {
    return <div className="sf-loading-overlay sf-glass">Syncing Staff Roster...</div>;
  }

  return (
    <div className="staff-management-page container">
      <header className="mb-lg">
        <h1 className="text-h1">Identity & Access Perimeter</h1>
        <p className="text-muted">Manage your production team and store assignments.</p>
      </header>

      <div className="grid grid-cols-12 gap-xl">
        {/* SECTION A: THE ROSTER */}
        <div className="col-span-8">
          <div className="sf-card sf-glass p-lg">
            <h3 className="text-h3 mb-lg">Staff Roster</h3>
            <div className="overflow-x-auto">
              <table className="sf-table w-full">
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Store</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {staff?.map((member) => (
                    <tr key={member.id}>
                      <td>
                        <div className="flex items-center gap-xs">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              member.isActive ? "bg-success shadow-[0_0_8px_var(--sf-success)]" : "bg-danger"
                            }`}
                          />
                          <span className="text-xs uppercase font-bold">
                            {member.isActive ? "Active" : "Revoked"}
                          </span>
                        </div>
                      </td>
                      <td className="font-medium">{member.email}</td>
                      <td>
                        <span className="badge badge-secondary text-xs">
                          {member.role.replace("_", " ")}
                        </span>
                      </td>
                      <td className="text-muted text-sm">
                        {stores?.find((s) => s.id === member.storeId)?.name || "Global / HQ"}
                      </td>
                      <td>
                        <button
                          onClick={() => updateStatus.mutate({ id: member.id, isActive: !member.isActive })}
                          disabled={updateStatus.isPending || member.id === currentUser.id}
                          className={`btn btn-sm ${member.isActive ? "btn-outline-danger" : "btn-accent"}`}
                        >
                          {updateStatus.isPending ? "..." : member.isActive ? "Revoke" : "Restore"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* SECTION B: THE INVITATION GATE */}
        <div className="col-span-4">
          <div className="sf-card p-lg">
            <h3 className="text-h3 mb-lg">Invite New Staff</h3>
            <form onSubmit={handleInvite} className="grid gap-md">
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  required
                  value={inviteData.email}
                  onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                  placeholder="tailor@stitchflow.io"
                  className="sf-input"
                />
              </div>

              <div className="form-group">
                <label>Role</label>
                <select
                  value={inviteData.role}
                  onChange={(e) => setInviteData({ ...inviteData, role: e.target.value })}
                  className="sf-input"
                >
                  <option value="STORE_MANAGER">Store Manager</option>
                  <option value="TAILOR">Tailor</option>
                  <option value="FRONT_DESK">Front Desk Member</option>
                </select>
              </div>

              <div className="form-group">
                <label>Store Assignment</label>
                <select
                  value={inviteData.storeId}
                  onChange={(e) => setInviteData({ ...inviteData, storeId: e.target.value })}
                  className="sf-input"
                  required
                >
                  <option value="">Select a store...</option>
                  {stores?.map((store) => (
                    <option key={store.id} value={store.id}>
                      {store.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Temporary Password</label>
                <input
                  type="text"
                  required
                  value={inviteData.initialPassword}
                  onChange={(e) => setInviteData({ ...inviteData, initialPassword: e.target.value })}
                  placeholder="Set temp password"
                  className="sf-input"
                />
              </div>

              <button
                type="submit"
                disabled={inviteStaff.isPending}
                className="btn btn-primary w-full mt-md"
              >
                {inviteStaff.isPending ? "Sending Invitation..." : "Issue Credentials"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
