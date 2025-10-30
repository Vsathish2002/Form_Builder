import React from 'react';
import Navbar from './components/Navbar';
import AppRoutes from './routes/AppRoutes';


function App() {
  return (
    <div>
      <Navbar />
      <div className=" pt-20 max-w-7xl mx-auto px-4">
        <AppRoutes />
      </div>
    </div>
  );
}

export default App;
