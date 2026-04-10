import { useNavigate } from 'react-router-dom';
import LockPersonIcon from '@mui/icons-material/LockPerson';
import ShieldIcon from '@mui/icons-material/Shield';
import DashboardIcon from '@mui/icons-material/Dashboard';
import EmailIcon from '@mui/icons-material/Email';
import '../../design-system/pages/error.css';

export function ForbiddenPage() {
  const navigate = useNavigate();

  return (
    <div className="error-page-container">
      <div className="error-visual-pane dark">
        <div className="locked-icons-container">
          <LockPersonIcon className="locked-icon-main" />
          <div style={{ display: 'flex', gap: '8px', opacity: 0.5 }}>
            <ShieldIcon fontSize="large" />
            <ShieldIcon fontSize="large" />
            <ShieldIcon fontSize="large" />
          </div>
        </div>
        
        <div className="sf-brand-footer">STITCHFLOW</div>
        
        <div style={{ position: 'absolute', bottom: '48px', color: '#c49a1a', fontSize: '0.75rem', letterSpacing: '2px' }}>
          ERROR CODE 403
          <div style={{ width: '40px', height: '2px', background: '#c49a1a', margin: '8px auto 0' }}></div>
        </div>
      </div>

      <div className="error-message-pane">
        <div className="error-code-badge">Security Protocol Active</div>
        <h1 className="error-title">Restricted Access</h1>
        <p className="error-description">
          This area of the atelier is restricted. Your current security clearances 
          do not permit entry to this section. If you believe this is an error, 
          please contact your system administrator.
        </p>

        <div className="error-actions">
          <button 
            className="error-button primary" 
            onClick={() => navigate('/dashboard')}
          >
            <DashboardIcon />
            Go to Dashboard
          </button>
          <a 
            href="mailto:info@bigeensolutions.com" 
            className="error-button secondary"
          >
            <EmailIcon />
            Contact Admin
          </a>
        </div>

        <div className="error-meta">
          <div className="error-meta-item">
            Security Protocol
            <strong>ACTIVE_ENFORCEMENT</strong>
          </div>
          <div className="error-meta-item" style={{ textAlign: 'right' }}>
            ATELIER_REF
            <strong>REF_SEC_0403</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
