import { useState } from "react"
import {
  useStaffList,
  useInviteStaff,
  useUpdateStaffStatus,
  useStores,
} from "../features/auth/hooks/useStaff"
import { useAuthStore } from "../features/auth/auth.store"

export function StaffManagementPage() {
  const currentUser = useAuthStore((state) => state.user)

  if (!currentUser) return <div>Loading...</div>
  const { data: staff, isLoading: isLoadingStaff } = useStaffList()
  const { data: stores, isLoading: isLoadingStores } = useStores()
  const inviteStaff = useInviteStaff()
  const updateStatus = useUpdateStaffStatus()

  const [inviteData, setInviteData] = useState({
    email: "",
    fullName: "",
    role: "TAILOR",
    storeId: "",
    initialPassword: "",
  })

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteData.storeId && stores && stores.length > 0) {
      // Auto-select first store if none selected
      await inviteStaff.mutateAsync({ ...inviteData, storeId: stores[0].id })
    } else {
      await inviteStaff.mutateAsync(inviteData)
    }
    setInviteData({
      email: "",
      fullName: "",
      role: "TAILOR",
      storeId: "",
      initialPassword: "",
    })
  }

  if (isLoadingStaff || isLoadingStores) {
    return (
      <div className="sf-loading-overlay sf-glass">Syncing Staff Roster...</div>
    )
  }

  return (
    <div className="staff-management-page container">
      <header className="mb-lg">
        <h1 className="text-h1">Identity & Access Perimeter</h1>
        <p className="text-muted">
          Manage your production team and store assignments.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-xl">
        {/* SECTION A: THE ROSTER */}
        <div className="md:col-span-8 order-2 md:order-1">
          <div className="sf-card sf-glass p-lg">
            <h3 className="text-h3 mb-lg">Staff Roster</h3>
            <div className="overflow-x-auto">
              <table className="sf-table w-full" style={{ tableLayout: 'fixed' }}>
                <thead>
                  <tr>
                    <th style={{ width: '12%' }}>Status</th>
                    <th style={{ width: '22%' }}>Full Name</th>
                    <th style={{ width: '25%' }}>Email</th>
                    <th style={{ width: '15%' }}>Role</th>
                    <th style={{ width: '15%' }}>Store</th>
                    <th style={{ width: '11%' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {staff?.map((member) => (
                    <tr key={member.id}>
                      <td>
                        <div className="flex items-center gap-xs">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              member.isActive
                                ? "bg-success shadow-[0_0_8px_var(--sf-success)]"
                                : "bg-danger"
                            }`}
                          />
                          <span className="text-xs uppercase font-bold">
                            {member.isActive ? "Active" : "Revoked"}
                          </span>
                        </div>
                      </td>
                      <td className="font-bold truncate" title={member.fullName || ""}>{member.fullName || "—"}</td>
                      <td className="text-muted truncate" title={member.email}>{member.email}</td>
                      <td>
                        <span className="badge badge-secondary text-xs">
                          {member.role?.replace("_", " ")}
                        </span>
                      </td>
                      <td className="text-muted text-sm truncate">
                        {stores?.find((s) => s.id === member.storeId)?.name ||
                          "Global / HQ"}
                      </td>
                      <td>
                        <button
                          onClick={() =>
                            updateStatus.mutate({
                              id: member.id,
                              isActive: !member.isActive,
                            })
                          }
                          disabled={
                            updateStatus.isPending ||
                            member.id === currentUser.userId
                          }
                          className={`btn btn-sm ${member.isActive ? "btn-outline-danger" : "btn-accent"}`}
                        >
                          {updateStatus.isPending
                            ? "..."
                            : member.isActive
                              ? "Revoke"
                              : "Restore"}
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
        <div className="md:col-span-4 order-1 md:order-2">
          <div className="sf-card sf-glass p-lg border-accent">
            <h3 className="text-h3 mb-lg">Invite New Staff</h3>
            <form onSubmit={handleInvite} className="grid gap-md">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  required
                  value={inviteData.fullName}
                  onChange={(e) =>
                    setInviteData({ ...inviteData, fullName: e.target.value })
                  }
                  placeholder="Tailor's Name"
                  className="sf-input"
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  required
                  value={inviteData.email}
                  onChange={(e) =>
                    setInviteData({ ...inviteData, email: e.target.value })
                  }
                  placeholder="tailor@stitchflow.io"
                  className="sf-input"
                />
              </div>

              <div className="form-group">
                <label>Role</label>
                <select
                  value={inviteData.role}
                  onChange={(e) =>
                    setInviteData({ ...inviteData, role: e.target.value })
                  }
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
                  onChange={(e) =>
                    setInviteData({ ...inviteData, storeId: e.target.value })
                  }
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
                  onChange={(e) =>
                    setInviteData({
                      ...inviteData,
                      initialPassword: e.target.value,
                    })
                  }
                  placeholder="Set temp password"
                  className="sf-input"
                />
              </div>

              <button
                type="submit"
                disabled={inviteStaff.isPending}
                className="btn btn-primary w-full mt-md"
              >
                {inviteStaff.isPending
                  ? "Sending Invitation..."
                  : "Issue Credentials"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
