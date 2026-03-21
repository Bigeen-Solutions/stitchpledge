import { createBrowserRouter, Navigate } from 'react-router-dom';
import { PublicLayout } from '../layouts/PublicLayout.tsx';
import { ProtectedLayout } from '../layouts/ProtectedLayout.tsx';
import { LoginPage } from '../../pages/LoginPage.tsx';
import { NotFoundPage } from '../../pages/NotFoundPage.tsx';
import { OrdersPage } from '../../pages/OrdersPage.tsx';
import { OrderDetailPage } from '../../pages/OrderDetailPage.tsx';
import { StaffManagementPage } from '../../pages/StaffManagementPage.tsx';
import { NewOrderPage } from '../../pages/NewOrderPage.tsx';
import { Timeline, TimelineItem } from '../../components/timeline/Timeline.tsx';
import { WelcomePanel } from '../../features/dashboard/components/WelcomePanel.tsx';
import { WorkshopTable } from '../../components/ui/WorkshopTable.tsx';
import { StageStepper } from '../../components/ui/StageStepper.tsx';
import { DeadlineCard } from '../../components/ui/DeadlineCard.tsx';
import { RiskBadge } from '../../components/ui/RiskBadge.tsx';
import { CustomerPortalLayout } from '../../features/customer/layouts/CustomerPortalLayout.tsx';
import { CustomerOrderPage } from '../../features/customer/pages/CustomerOrderPage.tsx';

import { DesignSystemPage } from '../../pages/DesignSystemPage.tsx';

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/design-system', element: <DesignSystemPage /> },
    ],
  },
  {
    element: <ProtectedLayout />,
    children: [
      { path: '/', element: <Navigate to="/dashboard" replace /> },
      { 
        path: '/dashboard', 
        element: (
          <div className="dashboard-page container">
            <WelcomePanel />
            
            <div className="grid grid-cols-3 mb-lg">
              <DeadlineCard 
                orderId="1004" 
                deadline="March 18, 2026" 
                riskLevel="ON_TRACK" 
                customer="Golden Garments Ltd"
              />
              <DeadlineCard 
                orderId="1005" 
                deadline="TOMORROW" 
                riskLevel="AT_RISK" 
                customer="Elite Tailors"
              />
              <DeadlineCard 
                orderId="1006" 
                deadline="OVERDUE (2 days)" 
                riskLevel="OVERDUE" 
                customer="Bespoke Bros"
              />
            </div>

            <div className="grid grid-cols-2 gap-md mb-lg">
              <div className="sf-card">
                <h3 className="mb-lg">Active Production Batches</h3>
                <WorkshopTable headers={['Batch ID', 'Garment', 'Status', 'Progress']}>
                  <tr>
                    <td>BT-402</td>
                    <td>Bespoke Suit</td>
                    <td><RiskBadge level="ON_TRACK" /></td>
                    <td><StageStepper totalStages={5} currentStage={2} /></td>
                  </tr>
                  <tr>
                    <td>BT-405</td>
                    <td>Silk Scarf</td>
                    <td><RiskBadge level="AT_RISK" /></td>
                    <td><StageStepper totalStages={5} currentStage={1} status="WARNING" /></td>
                  </tr>
                </WorkshopTable>
              </div>
              
              <div className="sf-card">
                <h3 className="mb-lg">Workshop Audit Log</h3>
                <div className="timeline-section">
                  <Timeline>
                    <TimelineItem 
                      actor="John Cutter" 
                      action="Recorded New Measurement Version" 
                      timestamp="10 minutes ago" 
                    />
                    <TimelineItem 
                      actor="Sarah Stitch" 
                      action="Logged Material Intake: Italian Wool (Blue)" 
                      timestamp="2 hours ago"
                    />
                  </Timeline>
                </div>
              </div>
            </div>
          </div>
        ) 
      },
      { path: '/orders', element: <OrdersPage /> },
      { path: '/orders/new', element: <NewOrderPage /> },
      { path: '/orders/:id', element: <OrderDetailPage /> },
      { path: '/staff', element: <StaffManagementPage /> },
    ],
  },
  {
    element: <CustomerPortalLayout />,
    children: [
      { path: '/portal/orders/:id', element: <CustomerOrderPage /> },
    ],
  },
  { path: '/404', element: <NotFoundPage /> },
  { path: '*', element: <Navigate to="/404" replace /> },
]);
