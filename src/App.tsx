import { RouterProvider } from 'react-router-dom';
import { router } from './app/router/router';
import { Toast } from './components/feedback/Toast';
import './App.css';

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toast />
    </>
  );
}

export default App;
