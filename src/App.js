import React from 'react';
import { BrowserRouter, Route, Routes} from 'react-router-dom';
import DateCalc from './pages/DateCalc';
import PaymentCalc from './pages/PaymentCalc';
import Menu from './pages/Menu'

function App() {
  return (
    <BrowserRouter>
      <Menu />
    <Routes>
        <Route exact path="/" element={<PaymentCalc />} />
        <Route path="/DateCalc" element={<DateCalc />} />
    </Routes>
    </BrowserRouter>
  );
}

export default App;