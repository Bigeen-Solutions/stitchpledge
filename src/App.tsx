import { RouterProvider } from 'react-router-dom';
import { router } from './app/router/router';
import { Toast } from './components/feedback/Toast';
import { useSilentRefresh } from './features/auth';
import './App.css';

function App() {
  useSilentRefresh();

  return (
    <>
      <RouterProvider router={router} />
      <Toast />
    </>
  );
}

export default App;
