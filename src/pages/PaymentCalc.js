import React, { useState } from 'react';

function PaymentCalc() {
  const [totalCost, setTotalCost] = useState(null);
  const [signingPercentage, setSigningPercentage] = useState(null);
  const [buildingPercentage, setBuildingPercentage] = useState(null);
  const [financialPercentage, setFinancialPercentage] = useState(null);
  const [signingAmount, setSigningAmount] = useState(null);
  const [buildingAmount, setBuildingAmount] = useState(0);
  const [financialAmount, setFinancialAmount] = useState(0);
  const [monthsToPay, setMonthsToPay] = useState(null);
  const [paymentFee, setPaymentFee] = useState(0);


  function handleChangeTotalCost(event) {
    
    setTotalCost(parseInt(event.target.value));
  }

  function handleChangeSigningPercentage(event) {
    setSigningPercentage(parseInt(event.target.value));
  }

  function handleChangeBuildingPercentage(event) {
    setBuildingPercentage(parseInt(event.target.value));
  }

  function handleChangeFinancialPercentage(event) {
    setFinancialPercentage(parseInt(event.target.value));
  }

  function handleChangeMonthsToPay(event) {
    setMonthsToPay(parseInt(event.target.value));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const signingAmount = (totalCost * signingPercentage) / 100;
    const buildingAmount = (totalCost * buildingPercentage) / 100;
    const financialAmount = (totalCost * financialPercentage) / 100;
    const paymentFee = buildingAmount / monthsToPay;
    setSigningAmount(signingAmount);
    setBuildingAmount(buildingAmount);
    setFinancialAmount(financialAmount);
    setPaymentFee(paymentFee);

  }

  return (
    <div style={{position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',}}>
      <h2>Building Payment Calculator</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="total-cost">Total Cost:</label>
        <input type="number" id="total-cost" value={totalCost} onChange={handleChangeTotalCost} />
        <br />
        <label htmlFor="signing-percentage">Signing Percentage:</label>
        <input type="number" id="signing-percentage" value={signingPercentage} onChange={handleChangeSigningPercentage} />
        <br />
        <label htmlFor="building-percentage">Building Percentage:</label>
        <input type="number" id="building-percentage" value={buildingPercentage} onChange={handleChangeBuildingPercentage} />
        <br />
        <label htmlFor="financial-percentage">Financial Percentage:</label>
        <input type="number" id="financial-percentage" value={financialPercentage} onChange={handleChangeFinancialPercentage} />
        <br />
        <label htmlFor="months-to-pay">Months to Pay:</label>
        <input type="number" id="months-to-pay" value={monthsToPay} onChange={handleChangeMonthsToPay} />
        <br />
        <button type="submit">Calculate Payment Schedule</button>
      </form>
      <br />
      {signingAmount > 0 && <p>Signing payment amount: ${signingAmount.toLocaleString(undefined, {
            style: 'currency',
            currency: 'USD',
          })}</p>}
      {buildingAmount > 0 && <p>Building payment amount: ${buildingAmount.toLocaleString(undefined, {
            style: 'currency',
            currency: 'USD',
          })}</p>}
      {financialAmount > 0 && <p>Financial payment amount: ${financialAmount.toLocaleString(undefined, {
            style: 'currency',
            currency: 'USD',
          })}</p>}
       {paymentFee > 0 && <p>Payment fee per month: ${paymentFee.toLocaleString(undefined, {
            style: 'currency',
            currency: 'USD',
          })}</p>}
    </div>
  );
}

export default PaymentCalc;

