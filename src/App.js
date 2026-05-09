import React from 'react';
import { BrowserRouter, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import DateCalc from './pages/DateCalc';
import PaymentCalc from './pages/PaymentCalc';
import RentalSimulator from './pages/RentalSimulator';
import JacquelinePage from './pages/JacquelinePage';
import AlejandroPaezPage from './pages/AlejandroPaezPage';
import LoginPage from './pages/LoginPage';
import Menu from './pages/Menu';
import { isAuthenticated } from './utils/auth';

function RequireAuth({ children }) {
  const location = useLocation();
  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Menu />
      <Routes>
        <Route exact path="/" element={<PaymentCalc />} />
        <Route path="/DateCalc" element={<DateCalc />} />
        <Route path="/Simulator" element={<RentalSimulator />} />
        <Route path="/jacqueline" element={<JacquelinePage />} />
        <Route
          path="/jacqueline/edit"
          element={
            <RequireAuth>
              <JacquelinePage isEditMode={true} />
            </RequireAuth>
          }
        />
        <Route path="/alejandro" element={<AlejandroPaezPage />} />
        <Route
          path="/alejandro/edit"
          element={
            <RequireAuth>
              <AlejandroPaezPage isEditMode={true} />
            </RequireAuth>
          }
        />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;