import React, { useState } from 'react';

function DateCalculator() {
  const [dateType, setDateType] = useState('years');
  const [value, setValue] = useState(0);
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
    
    if (dateType === 'years') {
      future.setFullYear(today.getFullYear() + value);
    } else if (dateType === 'months') {
      future.setMonth(today.getMonth() + value);
    } else if (dateType === 'days') {
      future.setDate(today.getDate() + value);
    } else {
      setFutureDate('Invalid date type.');
      return;
    }
    
    setFutureDate(future);
  }
  
  return (
    <div style={{ textAlign: "center" }}>
      <h2>Date Calculator</h2>
      <form onSubmit={handleSubmit} style={{ margin: "auto" }}>
        <label htmlFor="date-type">Date Type:</label>
        <div>
        <select id="date-type" value={dateType} onChange={handleChangeDateType}>
          <option value="years">Years</option>
          <option value="months">Months</option>
          <option value="days">Days</option>
        </select>
        </div>
        <br />
        <label htmlFor="value">Value:</label>
        <input type="number" id="value" value={value} onChange={handleChangeValue} />
        <br />
        <button type="submit">Calculate Future Date</button>
      </form>
      <br />
      {futureDate && <p>The future date is: {futureDate.toLocaleDateString()}</p>}
    </div>
  );
}

export default DateCalculator;
