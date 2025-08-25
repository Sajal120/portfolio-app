import { useLocation } from 'react-router-dom';

const RouteDebug = () => {
  const location = useLocation();
  
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-2xl mb-4">Route Debug Information</h1>
      <div className="space-y-2">
        <p><strong>Current Pathname:</strong> {location.pathname}</p>
        <p><strong>Current Search:</strong> {location.search}</p>
        <p><strong>Current Hash:</strong> {location.hash}</p>
        <p><strong>Full URL:</strong> {window.location.href}</p>
        <p><strong>Base URL:</strong> {window.location.origin}</p>
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl mb-4">Test Routes:</h2>
        <div className="space-y-2">
          <a href="/admin/login" className="block text-blue-400 hover:text-blue-300">
            Go to /admin/login
          </a>
          <a href="/admin" className="block text-blue-400 hover:text-blue-300">
            Go to /admin
          </a>
          <a href="/" className="block text-blue-400 hover:text-blue-300">
            Go to /
          </a>
        </div>
      </div>
    </div>
  );
};

export default RouteDebug;