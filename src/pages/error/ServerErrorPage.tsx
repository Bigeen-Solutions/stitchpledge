import RefreshIcon from '@mui/icons-material/Refresh';
import BarChartIcon from '@mui/icons-material/BarChart';
import error500Image from '../../assets/error_500.png';
import '../../design-system/pages/error.css';

export function ServerErrorPage() {

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="error-page-container">
      <div className="error-visual-pane light">
        <img src={error500Image} alt="Tangled thread" />
        
        <div style={{ 
          position: 'absolute', 
          bottom: '24px', 
          left: '24px', 
          background: '#DC2626', 
          color: 'white',
          padding: '8px 16px', 
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          zIndex: 3,
          fontSize: '0.625rem',
          fontWeight: 800,
          letterSpacing: '1px'
        }}>
          <span style={{ fontSize: '12px' }}>▲</span> CRITICAL INTERSECTION
        </div>

        <div style={{ 
          position: 'absolute', 
          top: '24px', 
          left: '24px', 
          background: 'rgba(10, 12, 32, 0.9)', 
          color: 'white',
          padding: '8px 16px', 
          borderRadius: '4px',
          zIndex: 3,
          fontSize: '0.625rem',
          fontWeight: 700,
          letterSpacing: '1px'
        }}>
          SYSTEM FAULT 500
        </div>
      </div>

      <div className="error-message-pane">
        <div className="error-code-badge">Error Protocol</div>
        <h1 className="error-title">A Tangled Thread</h1>
        <p className="error-description">
          Something went wrong on our end. Our engineers are working to 
          untangle it. The production floor has encountered an unexpected 
          blocker.
        </p>

        <div className="error-actions">
          <button 
            className="error-button primary" 
            onClick={handleRefresh}
          >
            <RefreshIcon />
            Refresh Page
          </button>
          <a 
            href="https://status.bigeensolutions.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="error-button secondary"
          >
            <BarChartIcon />
            System Status
          </a>
        </div>

        <div className="error-meta">
          <div className="error-meta-item">
            Trace ID
            <strong>STR-882-X90-FF</strong>
          </div>
          <div className="error-meta-item" style={{ textAlign: 'right' }}>
            Node
            <strong>Industrial-04_Core</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
