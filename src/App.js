import React from 'react';
import { BrowserRouter, Route, Routes} from 'react-router-dom';
import DateCalc from './pages/DateCalc';
import PaymentCalc from './pages/PaymentCalc';
import RentalSimulator from './pages/RentalSimulator';
import Menu from './pages/Menu'

function App() {
  return (
    <BrowserRouter>
    <Menu />
    <Routes>
        <Route exact path="/" element={<PaymentCalc />} />
        <Route path="/DateCalc" element={<DateCalc />} />
        <Route path="/Simulator" element={<RentalSimulator />} />
    </Routes>
    </BrowserRouter>
  );
}

export default App;