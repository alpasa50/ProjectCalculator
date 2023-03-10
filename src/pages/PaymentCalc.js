import React, { useState } from 'react';
import '../utils/PaymentCalc.css';

function PaymentCalc() {
  const [projectName, setProjectName] = useState('');
  const [reserve, setReserve] = useState('');
  const [totalCost, setTotalCost] = useState('');
  const [signingPercentage, setSigningPercentage] = useState('');
  const [buildingPercentage, setBuildingPercentage] = useState('');
  const [financialPercentage, setFinancialPercentage] = useState('');
  const [signingAmount, setSigningAmount] = useState('');
  const [buildingAmount, setBuildingAmount] = useState(0);
  const [financialAmount, setFinancialAmount] = useState(0);
  const [monthsToPay, setMonthsToPay] = useState('');
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
  function handleChangeProjectName(event) {
    setProjectName(event.target.value);
  }
  function handleChangeReserve(event) {
    setReserve(event.target.value);
  }

  function handleSubmit(event) {
    event.preventDefault();
    const signingAmount = (totalCost * signingPercentage) / 100 - reserve ;
    const buildingAmount = (totalCost * buildingPercentage) / 100;
    const financialAmount = (totalCost * financialPercentage) / 100;
    const paymentFee = buildingAmount / monthsToPay;
    setSigningAmount(signingAmount);
    setBuildingAmount(buildingAmount);
    setFinancialAmount(financialAmount);
    setPaymentFee(paymentFee);
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth',
    });
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '60px',
    }}>
      <h2 style={{fontSize: '2rem'}}>Calculadora de pagos</h2>
      <div>
      <form onSubmit={handleSubmit} style={{width: '100%'}}>
        <label htmlFor="project-name">Nombre del proyecto:</label>
        <input type="text" id="project-name" value={projectName} onChange={handleChangeProjectName} />
        <br />
        <label htmlFor="total-cost">Precio:</label>
        <input type="number" id="total-cost" value={totalCost} onChange={handleChangeTotalCost} />
        <br />
        <label htmlFor="total-cost">Reserva:</label>
        <input type="text" id="reserve" value={reserve} onChange={handleChangeReserve} />
        <br />
        <label htmlFor="signing-percentage">Completar separacion (%):</label>
        <input type="number" id="signing-percentage" value={signingPercentage} onChange={handleChangeSigningPercentage} />
        <br />
        <label htmlFor="building-percentage">Durante la construcci??n (%):</label>
        <input type="number" id="building-percentage" value={buildingPercentage} onChange={handleChangeBuildingPercentage} />
        <br />
        <label htmlFor="financial-percentage">Pago contra entrega (%):</label>
        <input type="number" id="financial-percentage" value={financialPercentage} onChange={handleChangeFinancialPercentage} />
        <br />
        <label htmlFor="months-to-pay">Meses para pagar:</label>
        <input type="number" id="months-to-pay" value={monthsToPay} onChange={handleChangeMonthsToPay} />
        <br />
        <button type="submit">Calcular plan de pago</button>
      </form>
      <br />
      {totalCost > 0 && (
          <table>
            <tbody>
            <tr>
                <td colSpan={2} style={{textAlign: 'Center'}}>{projectName}</td>
              </tr>
              <tr>
                <td>Precio Total:</td>
                <td>${totalCost.toLocaleString()}</td>
              </tr>
              <tr>
                <td>Completar separacion ({signingPercentage}%):</td>
                <td>${signingAmount.toLocaleString()}</td>
              </tr>
              <tr>
                <td>Durante la construcci??n ({buildingPercentage}%):</td>
                <td>${buildingAmount.toLocaleString()}</td>
              </tr>
              <tr>
                <td>Pago contra entrega ({financialPercentage}%):</td>
                <td>${financialAmount.toLocaleString()}</td>
              </tr>
            {monthsToPay > 0 && (
              <tr>
              <td>Cuotas mensuales durante {monthsToPay} Meses:</td>
              <td>${paymentFee.toLocaleString()}</td>
            </tr>
            )}
            </tbody>
          </table>
          )}

      </div>

    </div>
  );
}

export default PaymentCalc;

