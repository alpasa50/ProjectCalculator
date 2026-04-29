import React from 'react';
import { BrowserRouter, Route, Routes} from 'react-router-dom';
import DateCalc from './pages/DateCalc';
import PaymentCalc from './pages/PaymentCalc';
import RentalSimulator from './pages/RentalSimulator';
import JacquelinePage from './pages/JacquelinePage';
import AlejandroPaezPage from './pages/AlejandroPaezPage';
import Menu from './pages/Menu'

function App() {
  return (
    <BrowserRouter>
    <Menu />
    <Routes>
        <Route exact path="/" element={<PaymentCalc />} />
        <Route path="/DateCalc" element={<DateCalc />} />
        <Route path="/Simulator" element={<RentalSimulator />} />
        <Route path="/jacqueline" element={<JacquelinePage />} />
        <Route path="/jacqueline/edit" element={<JacquelinePage isEditMode={true} />} />
        <Route path="/alejandro" element={<AlejandroPaezPage />} />
        <Route path="/alejandro/edit" element={<AlejandroPaezPage isEditMode={true} />} />
    </Routes>
    </BrowserRouter>
  );
}

export default App;