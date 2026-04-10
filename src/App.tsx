import { RouterProvider } from 'react-router-dom';
import { router } from './app/router/router';
import { Toast } from './components/feedback/Toast';
import { useSilentRefresh } from './features/auth';
import { GlobalErrorBoundary } from './infrastructure/error/GlobalErrorBoundary';
import './App.css';

function App() {
  useSilentRefresh();

  return (
    <GlobalErrorBoundary>
      <RouterProvider router={router} />
      <Toast />
    </GlobalErrorBoundary>
  );
}

export default App;
