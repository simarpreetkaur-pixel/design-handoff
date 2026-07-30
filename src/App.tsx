import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { CallProvider } from "@/context/CallContext"
import { AuthProvider } from "@/contexts/AuthContext"
import { Homepage } from "@/components/Homepage"
import { CRMView } from "@/components/CRMView"
import { SuiteLogin } from "@/components/suite/SuiteLogin"
import { SuiteShell } from "@/components/suite/SuiteShell"
import { SuiteDashboard } from "@/components/suite/SuiteDashboard"
import { UserManagement } from "@/components/suite/admin/UserManagement"
import { UserDetail } from "@/components/suite/admin/UserDetail"
import { TeamManagement } from "@/components/suite/admin/TeamManagement"
import { RoleAccess } from "@/components/suite/admin/RoleAccess"
import { OnboardUser } from "@/components/suite/admin/OnboardUser"
import { AuditLogs } from "@/components/suite/admin/AuditLogs"
import { ToolConfigurations } from "@/components/suite/admin/ToolConfigurations"
import { Settings } from "@/components/suite/admin/Settings"
import { Preferences } from "@/components/suite/admin/Preferences"
import { Security } from "@/components/suite/admin/Security"
import { Announcements } from "@/components/suite/admin/Announcements"
import { UsageReports } from "@/components/suite/admin/UsageReports"
import { ToolPlaceholder } from "@/components/suite/ToolPlaceholder"


function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<SuiteLogin />} />

      {/* Suite shell — authenticated suite admin pages */}
      <Route element={<SuiteShell />}>
        <Route path="/suite" element={<SuiteDashboard />} />
        <Route path="/suite/users" element={<UserManagement />} />
        <Route path="/suite/users/:id" element={<UserDetail />} />
        <Route path="/suite/teams" element={<TeamManagement />} />
        <Route path="/suite/roles" element={<RoleAccess />} />
        <Route path="/suite/onboard" element={<OnboardUser />} />
        <Route path="/suite/audit-logs" element={<AuditLogs />} />
        <Route path="/suite/configurations" element={<ToolConfigurations />} />
        <Route path="/suite/settings" element={<Settings />} />
        <Route path="/suite/preferences" element={<Preferences />} />
        <Route path="/suite/security" element={<Security />} />
        <Route path="/suite/announcements" element={<Announcements />} />
        <Route path="/suite/reports" element={<UsageReports />} />
        <Route path="/suite/sales" element={<ToolPlaceholder tool="sales" />} />
        <Route path="/suite/insights" element={<ToolPlaceholder tool="insights" />} />
        <Route path="/suite/neo" element={<ToolPlaceholder tool="neo" />} />
      </Route>

      {/* Support tool — full-screen, no auth required */}
      <Route path="/" element={<Homepage />} />
      <Route path="/crm/call/:customerId" element={<CRMView />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <CallProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </CallProvider>
    </AuthProvider>
  )
}

export default App
