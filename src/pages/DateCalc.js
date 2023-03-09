import React, { useState } from 'react';

function DateCalculator() {
  const [dateType, setDateType] = useState('Años');
  const [value, setValue] = useState('');
  const [futureDate, setFutureDate] = useState(null);
  
  function handleChangeDateType(event) {
    setDateType(event.target.value);
  }
  
  function handleChangeValue(event) {
    setValue(parseInt(event.target.value));
  }
  
  function handleSubmit(event) {
    event.preventDefault();
    const today = new Date();
    let future = new Date(today);
  
    if (dateType === 'Años') {
      future.setFullYear(today.getFullYear() + value);
    } else if (dateType === 'Meses') {
      future.setMonth(today.getMonth() + value);
    } else if (dateType === 'Dias') {
      future.setDate(today.getDate() + value);
    } else {
      setFutureDate('Tipo de dato invalido');
      return;
    }
  
    if (isNaN(future.getTime())) {
      setFutureDate('Fecha inválida');
      return;
    }
  
    const options = {day: '2-digit', month: '2-digit', year: 'numeric'};
    setFutureDate(future.toLocaleDateString('es-ES', options));
  }
  
  
  return (
    <div style={{position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',}}>
      <h2>Calculador de Fechas</h2>
      <form onSubmit={handleSubmit} style={{ margin: "auto" }}>
        <label htmlFor="date-type">Tipo de dato:</label>
        <div>
        <select id="date-type" value={dateType} onChange={handleChangeDateType}>
          <option value="Años">Años</option>
          <option value="Meses">Meses</option>
          <option value="Dias">Dias</option>
        </select>
        </div>
        <br />
        <label htmlFor="value">Valor:</label>
        <input type="number" id="value" value={value} onChange={handleChangeValue} />
        <br />
        <button type="submit">Calcular fecha futura</button>
      </form>
      <br />
      {futureDate && <p>La fecha futura es: {futureDate}</p>}
    </div>
  );
}

export default DateCalculator;
