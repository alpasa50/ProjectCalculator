import React, { useState } from "react";
import "../utils/LoanCalculator.css";
function LoanCalculator() {
  const [monto, setMonto] = useState("");
  const [interes, setInteres] = useState("");
  const [plazo, setPlazo] = useState("");
  const [resultado, setResultado] = useState(null);
  const [tabla, setTabla] = useState([]);

  const formatNumber = (value) => {

  if (!value) return '';

  const number =
    value.toString().replace(/,/g, '');

  return Number(number).toLocaleString(
    'en-US'
  );

};

const handleMontoChange = (e) => {

  const rawValue =
    e.target.value.replace(/,/g, '');

  if (isNaN(rawValue)) return;

  setMonto(rawValue);

};

  /* ======================================== FORMATO DINERO ======================================== */ const formatCurrency =
    (value) => {
      return Number(value).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    };
  /* ======================================== CALCULAR ======================================== */ const calcularPrestamo =
    () => {
      const principal = parseFloat(monto);
      const annualRate = parseFloat(interes);
      const months = parseInt(plazo);
      if (!principal || !annualRate || !months) {
        alert("Completa todos los campos");
        return;
      }
      /* ======================================== FORMULA PRESTAMO ======================================== */ const monthlyRate =
        annualRate / 100 / 12;
      const cuota =
        (principal * (monthlyRate * Math.pow(1 + monthlyRate, months))) /
        (Math.pow(1 + monthlyRate, months) - 1);
      setResultado(cuota);
      /* ======================================== TABLA AMORTIZACION ======================================== */ let balance =
        principal;
      const amortizacion = [];
      for (let i = 1; i <= months; i++) {
        const interesPago = balance * monthlyRate;
        const capitalPago = cuota - interesPago;
        balance = balance - capitalPago;
        amortizacion.push({
          numero: i,
          cuota: cuota,
          capital: capitalPago,
          interes: interesPago,
          balance: balance > 0 ? balance : 0,
        });
      }
      setTabla(amortizacion);
    };
  return (
    <div className="loan-container">
      {" "}
      <div className="loan-card">
        {" "}
        <h1>💸 Calculadora de Préstamos </h1>{" "}
        <p className="loan-note">
          {" "}
          * Los resultados de esta simulación son aproximados.{" "}
        </p>{" "}
        {/* ======================================== INPUTS ======================================== */}{" "}
        <div className="loan-form">
          {" "}
          <input
            type="text"
            placeholder="Monto del préstamo"
            value={formatNumber(monto)}
            onChange={handleMontoChange}
            />{" "}
          <input
            type="number"
            step="0.01"
            placeholder="Interés anual (%)"
            value={interes}
            onChange={(e) => setInteres(e.target.value)}
          />{" "}
          <input
            type="number"
            placeholder="Plazo en meses"
            value={plazo}
            onChange={(e) => setPlazo(e.target.value)}
          />{" "}
          <button onClick={calcularPrestamo}> Calcular </button>{" "}
        </div>{" "}
        {/* ======================================== RESULTADO ======================================== */}{" "}
        {resultado && (
          <div className="resultado-box">
            {" "}
            <h2> Resultado: </h2> <p> La cuota mensual sería de: </p>{" "}
            <div className="resultado-cuota">
              {" "}
              $ {formatCurrency(resultado)}{" "}
            </div>{" "}
            <p className="resultado-text">
              {" "}
              Considerando un monto de $ {formatCurrency(monto)} a una tasa de
              interés de {interes}% por un plazo de {plazo} meses.{" "}
            </p>{" "}
          </div>
        )}{" "}
        {/* ======================================== TABLA ======================================== */}{" "}
        {tabla.length > 0 && (
          <div className="tabla-container">
            {" "}
            <h2> Tabla de amortización </h2>{" "}
            <table>
              {" "}
              <thead>
                {" "}
                <tr>
                  {" "}
                  <th>No.</th> <th>Cuota</th> <th>Capital</th> <th>Interés</th>{" "}
                  <th>Balance</th>{" "}
                </tr>{" "}
              </thead>{" "}
              <tbody>
                {" "}
                {tabla.map((item) => (
                  <tr key={item.numero}>
                    {" "}
                    <td> {item.numero} </td>{" "}
                    <td> $ {formatCurrency(item.cuota)} </td>{" "}
                    <td> $ {formatCurrency(item.capital)} </td>{" "}
                    <td> $ {formatCurrency(item.interes)} </td>{" "}
                    <td> $ {formatCurrency(item.balance)} </td>{" "}
                  </tr>
                ))}{" "}
              </tbody>{" "}
            </table>{" "}
          </div>
        )}{" "}
      </div>{" "}
    </div>
  );
}
export default LoanCalculator;
