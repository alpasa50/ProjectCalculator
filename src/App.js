import React from 'react';
import { BrowserRouter, Route, Routes, Navigate, useLocation, useSearchParams } from 'react-router-dom';
import DateCalc from './pages/DateCalc';
import PaymentCalc from './pages/PaymentCalc';
import RentalSimulator from './pages/RentalSimulator';
import JacquelinePage from './pages/JacquelinePage';
import AlejandroPaezPage from './pages/AlejandroPaezPage';
import LoginPage from './pages/LoginPage';
import Menu from './pages/Menu';
import { isAuthenticated } from './utils/auth';

const SECRET_CODE = process.env.REACT_APP_SECRET_CODE;
 


function RequireAuth({ children }) {
  const location = useLocation();
  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

function AppContent() {
  

  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");

  // Si el código es correcto, lo guarda en sessionStorage
  if (code === SECRET_CODE) {
    sessionStorage.setItem("appAccess", "true");
  }

  // Verifica URL o sessionStorage
  const hasAccess = code === SECRET_CODE || sessionStorage.getItem("appAccess") === "true";

  if (!hasAccess) {
    return null;
  }

  return (
    
    <>
      <Menu />
      <Routes>
        <Route path="/" element={<PaymentCalc />} />
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
        <Route path="*" element={null} />
      </Routes>
    </>
  );
}

function App() {

  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
