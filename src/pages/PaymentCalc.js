import React, { useState, useRef, useEffect } from 'react';
import '../utils/PaymentCalc.css';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import logo from '../assets/plusval-logo-black.png';
import { PDFDocument } from 'pdf-lib'
import Swal from 'sweetalert2';

function PaymentCalc() {

  const [greenColor, setGreenColor] = useState('#75BD42');
  const [showImage, setShowImage] = useState(true);
  const [manejarPorPorcentajes, setManejarPorPorcentajes] = useState(true);
  const [pagosExtraordinarios, setPagosExtraordinarios] = useState(false);
  // const [isInputEnabled, setIsInputEnabled] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [reserve, setReserve] = useState('');
  const [totalCost, setTotalCost] = useState('');
  const [signingPercentage, setSigningPercentage] = useState('');
  const [buildingPercentage, setBuildingPercentage] = useState('');
  const [financialPercentage, setFinancialPercentage] = useState('');
  const [signingAmount, setSigningAmount] = useState('');
  const [buildingAmount, setBuildingAmount] = useState(0);
  const [financialAmount, setFinancialAmount] = useState(0);
  const [paymentDay, setPaymentDay] = useState(30); // Por defecto, el día de pago será el 30
  const buildinAmountPersist = useRef(buildingAmount);


  const [monthsToPay, setMonthsToPay] = useState('');
  const [paymentFee, setPaymentFee] = useState(0);

  const [availableYears, setAvailableYears] = useState([]);
  const [availableMonths, setAvailableMonths] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedAmount, setSelectedAmount] = useState(0);
  const [selectedDates, setSelectedDates] = useState([]);
  const extraPaymentsAmount = useRef(selectedAmount);
  const [currency, setCurrency] = useState('US$');


  const tableRef = useRef(null);

  const extraTableRef = useRef(null);

  useEffect(() => {
    if (monthsToPay) {
      const years = [];
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;
      let remainingMonths = parseInt(monthsToPay, 10);
      
      // Agregar el año actual y calcular los meses restantes del primer año
      if (remainingMonths > 12 - currentMonth + 1) {
        years.push(currentYear);
        remainingMonths -= (12 - currentMonth + 1);
      } else {
        years.push(currentYear);
        remainingMonths = 0;
      }

      let year = currentYear + 1;
      
      // Agrega años al arreglo mientras haya meses restantes
      while (remainingMonths > 0) {
        if (remainingMonths > 12) {
          years.push(year);
          remainingMonths -= 12;
        } else {
          years.push(year);
          remainingMonths = 0;
        }
        year++;
      }
      
      setAvailableYears(years);
    }
  }, [monthsToPay]);

  useEffect(() => {
    if (selectedYear) {
      const months = [];
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;
      let remainingMonths = parseInt(monthsToPay, 10);
      
      // Calcular los meses disponibles en el año seleccionado
      if (selectedYear === currentYear) {
        for (let i = currentMonth + 1; i <= 12 && remainingMonths > 0; i++) {
          if (!selectedDates.find(date => date.year === selectedYear && date.month === i)) {
            months.push(i);
          }
          remainingMonths--;
        }
      } else {
        let startMonth = 1;
        let endMonth = 12;
        let fullYears = Math.floor((monthsToPay - (12 - currentMonth)) / 12);
        let remainingMonthsAfterFullYears = monthsToPay - (12 - currentMonth) - fullYears * 12;
        
        if (selectedYear === currentYear + fullYears + 1) {
          endMonth = remainingMonthsAfterFullYears;
        }
        
        for (let i = startMonth; i <= endMonth && remainingMonths > 0; i++) {
          if (!selectedDates.find(date => date.year === selectedYear && date.month === i)) {
            months.push(i);
          }
          remainingMonths--;
        }
      }
      
      setAvailableMonths(months);
    }
  }, [selectedYear, monthsToPay, selectedDates]);

  const handleChangeMonthsToPay = (event) => {
    setMonthsToPay(parseInt(event.target.value, 10));
    setSelectedYear('');
    setSelectedMonth('');
    setAvailableYears([]);
    setAvailableMonths([]);
  };

  const handleChangeYear = (event) => {
    const value = parseInt(event.target.value, 10)
    setSelectedYear(value);
    setSelectedMonth('');
  };

  const handleChangeMonth = (event) => {
    const value = parseInt(event.target.value, 10)
    setSelectedMonth(value);
  };

  const handleAddDate = () => {
    if (selectedYear && selectedMonth) {
      // Verificar si el monto total de los pagos extra excede el monto de construcción
      if (selectedAmount + extraPaymentsAmount.current > buildingAmount) {
        Swal.fire({
          title: 'Error',
          text: 'El monto total de los pagos extra no puede exceder el monto de construcción',
          icon: 'error',
          confirmButtonText: 'OK'
        });
        setSelectedAmount(''); // Limpiar el valor del input
        return; // No agregar el nuevo pago extra si excede el límite
      }
      const newDate = { year: selectedYear, month: selectedMonth, amount: selectedAmount };
      setSelectedDates([...selectedDates, newDate]);
      setSelectedYear('');
      setSelectedMonth('');
      setSelectedAmount('');
      setMonthsToPay(monthsToPay);

      let acumulator = selectedAmount + extraPaymentsAmount.current;

      extraPaymentsAmount.current = acumulator
    }
  };

  const handleChangeAmount = (event) => {
    const value = parseInt(event.target.value, 10)
    setSelectedAmount(value);
    
  };

  const handleChangeManejo = (porPorcentajes) => {
    setManejarPorPorcentajes(porPorcentajes);
  
    // Mostrar la alerta al usuario
    Swal.fire({
      title: 'Cambio de modo',
      text: `Ahora estás calculando en base a ${porPorcentajes ? 'porcentajes' : 'montos'}.`,
      icon: 'info',
      confirmButtonText: 'Entendido'
    });
  };

  const handlePagosExtra = () =>{
    setPagosExtraordinarios(!pagosExtraordinarios);

    // Mostrar la alerta al usuario
    Swal.fire({
      title: 'Cambio de modo',
      text: `Se ha cambiado a ${pagosExtraordinarios ? 'sin pagos extraordinarios' : 'pagos extraordinarios'}.`,
      icon: 'info',
      confirmButtonText: 'Entendido'
    });

  }

  async function generatePDF() {
    // Get the table element
    const table = document.querySelector('table');
  
    // Get the dimensions of the table
    const tableWidth = table.clientWidth;
    const tableHeight = table.clientHeight;
  
    // Calculate the aspect ratio of the table
    const aspectRatio = tableWidth / tableHeight;
  
    // Set the maximum paper size (adjust as needed)
    const maxPaperWidth = 600;
    const maxPaperHeight = 800;
  
    // Calculate the paper size based on the aspect ratio and maximum paper size
    let paperWidth, paperHeight;
    if (aspectRatio > 1) {
      paperWidth = Math.min(tableWidth, maxPaperWidth);
      paperHeight = paperWidth / aspectRatio;
    } else {
      paperHeight = Math.min(tableHeight, maxPaperHeight);
      paperWidth = paperHeight * aspectRatio;
    }
  
    // Create a new PDF document with the calculated paper size
    const pdf = new jsPDF('p', 'pt', [paperWidth, paperHeight]);
  
    // Use html2canvas to capture the table as an image
    const canvas = await html2canvas(table);
    const imgData = canvas.toDataURL('image/png');
  
    // Add the image to the PDF document
    pdf.addImage(imgData, 'PNG', 0, 0, paperWidth, paperHeight);
  
    // Compress and download the PDF document
    compressAndDownloadPDF(pdf);
  }
  
  async function compressAndDownloadPDF(pdf) {
    // Load the PDF document using pdf-lib
    const pdfBytes = await pdf.output('arraybuffer');
    const pdfDoc = await PDFDocument.load(pdfBytes);
  
    // You can now perform compression or other operations on the PDF here
  
    // Create a new PDF with the compressed content
    const compressedPdfBytes = await pdfDoc.save();
  
    // Create a blob from the compressed PDF
    const blob = new Blob([compressedPdfBytes], { type: 'application/pdf' });
  
    // Create a download link and trigger the download
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plan_de_pagos_${projectName}.pdf`;
    a.click();
  
    // Revoke the object URL to free up memory
    window.URL.revokeObjectURL(url);
  }
  
  const getPaymentDates = () => {
    const startDate = new Date();
    const startMonth = startDate.getMonth() + 1; // Adding 1 to get the next month;
    const paymentDates = [];
    let paymentYear = startDate.getFullYear();
    let paymentMonth = startMonth + 1;
  
    for (let i = 1; i <= monthsToPay; i++) {
      if (paymentMonth > 12) {
        paymentYear++;
        paymentMonth = 1;
      }

      // Verificar si es febrero y ajustar el día a 28 si es necesario
      const isFebruary = paymentMonth === 2;
      const adjustedDay = isFebruary ? Math.min(paymentDay, 28) : paymentDay;
      const paymentDate = new Date(paymentYear, paymentMonth - 1, adjustedDay);
      paymentDates.push(paymentDate);
      paymentMonth++;
    }
  
    return paymentDates;
  };
  
  const paymentDates = getPaymentDates();

  const handleToggleColors = () => {
    setGreenColor(color => color === '#75BD42' ? 'white' : '#75BD42');
    setShowImage(showImage => !showImage);
  };

  function handleChangeTotalCost(event) {

    setTotalCost(parseInt(event.target.value));
  }

  function handleChangeSigningPercentage(event) {
    setSigningPercentage(parseInt(event.target.value));
  }

  function handleChangeBuildingPercentage(event) {
    const value = parseInt(event.target.value);
  
    if (manejarPorPorcentajes) {
      // Validar que la suma de los porcentajes no exceda el 100%
      if (signingPercentage + value > 100) {
        Swal.fire({
          title: 'Error en los cálculos',
          text: 'La suma de los porcentajes no puede ser mayor que 100.',
          icon: 'error',
          confirmButtonText: 'Entendido'
        });
        return;
      }
    } else {
      // Validar que el monto no sea mayor que el totalCost
      if (value > totalCost) {
        Swal.fire({
          title: 'Error en los cálculos',
          text: 'El monto durante la construcción no puede ser mayor que el precio total.',
          icon: 'error',
          confirmButtonText: 'Entendido'
        });
        return;
      }
    }
  
    setBuildingPercentage(value);
  
    const { signingAmount, buildingAmount, financialAmount, financialPercentage } = calculateAmounts(signingPercentage, value, totalCost, reserve, manejarPorPorcentajes);
    setSigningAmount(signingAmount);
    setBuildingAmount(buildingAmount);
    setFinancialAmount(financialAmount);
    setFinancialPercentage(financialPercentage);
  }

  function calculateAmounts(signingPercentage, buildingPercentage, totalCost, reserve, manejarPorPorcentajes) {
    let signingAmount, buildingAmount, financialAmount;
  
    if (manejarPorPorcentajes) {
      signingAmount = (totalCost * signingPercentage) / 100 - reserve;
      buildingAmount = (totalCost * buildingPercentage) / 100;
      const financialAmountTemp = (100 - (signingPercentage + buildingPercentage)) / 100;
      financialAmount = totalCost * financialAmountTemp;
      return { signingAmount, buildingAmount, financialAmount, financialPercentage: financialAmountTemp };

    } else {
      buildinAmountPersist.current = buildingAmount;
      signingAmount = signingPercentage;
      buildingAmount = buildingPercentage;
      financialAmount = totalCost - (signingAmount + buildingAmount + parseInt(reserve));
      return { signingAmount, buildingAmount, financialAmount, financialPercentage: financialAmount };
    }
  }

  function handleChangeProjectName(event) {
    setProjectName(event.target.value);
  }

  const handleCurrencyChange = (event) => {
    setCurrency(event.target.value);
  };

  function handleChangeReserve(event) {
    setReserve(event.target.value);
  }

  function handleSubmit(event) {
    event.preventDefault();
  
    let signingAmount, buildingAmount, financialAmount, paymentFee;

  
    if (manejarPorPorcentajes) {
      signingAmount = (totalCost * signingPercentage) / 100 - reserve;
      buildingAmount = (totalCost * buildingPercentage) / 100;
      const financialAmountTemp = (100 - (signingPercentage + buildingPercentage)) / 100;
      financialAmount = totalCost * financialAmountTemp;
      setFinancialPercentage(financialAmountTemp);
      buildinAmountPersist.current = buildingAmount;
      
      if(pagosExtraordinarios){
        buildinAmountPersist.current = buildingAmount;
        buildingAmount = buildingAmount - extraPaymentsAmount.current;
      }
    } else {


      buildinAmountPersist.current = buildingAmount;
      signingAmount = signingPercentage;
      buildingAmount = buildingPercentage;
      financialAmount = totalCost - (signingAmount + buildingAmount + parseInt(reserve));
      setFinancialPercentage(financialAmount);

      if(pagosExtraordinarios){
        buildinAmountPersist.current = buildingAmount;
        buildingAmount = buildingAmount - extraPaymentsAmount.current;
      }
    }

    let totalAmount = 0    
    totalAmount = signingAmount + buildingAmount + extraPaymentsAmount.current + financialAmount + parseInt(reserve, 10);
    paymentFee = buildingAmount / monthsToPay;
  
    if (totalAmount !== totalCost) {
      // Mostrar una alerta si la suma no coincide
      Swal.fire({
        title: 'Error en los cálculos',
        text: 'La suma de los montos no coincide con el precio total.',
        icon: 'error',
        confirmButtonText: 'Entendido'
      });
      return; // Salir de la función handleSubmit
    }
  
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
    <div className='container' style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '30px',
    }}><div style={{
      display: 'flex',
      alignItems: 'center', // Alinea verticalmente los elementos
    }}>
      <h2 style={{ fontSize: '2rem' }}>Calculadora de pagos</h2>
      <button
      style={{marginLeft:"30px"}}
      onClick={handleToggleColors}
    >
      Plusvalizar
    </button>  
      </div>
      <div>
      Calcular: { ' ' }
      <label>
        <input
          type="checkbox"
          checked={manejarPorPorcentajes}
          onChange={() => handleChangeManejo(true)}
        />
        Porcentajes
      </label>
      { ' ' }
      <label>
        <input
          type="checkbox"
          checked={!manejarPorPorcentajes}
          onChange={() => handleChangeManejo(false)}
        />
        Montos
      </label>
    </div>
    <div>
      <label>
      Pagos extraordinarios: { ' ' }
      <input
        type="checkbox"
        checked={pagosExtraordinarios}
        onChange={handlePagosExtra}
      />
      Añadir
    </label>
    { ' ' }
    <label>
      <input
        type="checkbox"
        checked={!pagosExtraordinarios}
        onChange={() => handlePagosExtra(!pagosExtraordinarios)}
      />
      No añadir
    </label>

    </div>
      <div>
        <form onSubmit={handleSubmit} style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <label htmlFor="project-name">Nombre del proyecto:</label>
          <input type="text" id="project-name" value={projectName} onChange={handleChangeProjectName} />
          <label htmlFor="currency-select">Seleccionar moneda:</label>
          <select id="currency-select" value={currency} onChange={handleCurrencyChange}>
            <option value="RD$">RD$</option>
            <option value="US$">US$</option>
          </select>
          <label htmlFor="total-cost">Precio:</label>
          <input type="number" id="total-cost" value={totalCost} onChange={handleChangeTotalCost} />
          <label htmlFor="total-cost">Reserva:</label>
          <input type="text" id="reserve" value={reserve} onChange={handleChangeReserve} />
          <label htmlFor="signing-percentage">Completar separacion ({manejarPorPorcentajes ? '%' : "Montos"}):</label>
          <input type="number" id="signing-percentage" value={signingPercentage} onChange={handleChangeSigningPercentage} />
          <label htmlFor="building-percentage">Durante la construcción ({manejarPorPorcentajes ? '%' : "Montos"}):</label>
          <input type="number" id="building-percentage" value={buildingPercentage} onChange={handleChangeBuildingPercentage} />
          <label htmlFor="financial-percentage">Pago contra entrega ({manejarPorPorcentajes ? '%' : "Montos"}):</label>
          {manejarPorPorcentajes ? (
            <span>{financialPercentage * 100}%</span>
          ) : (
            <span>${financialAmount.toLocaleString()}</span>
          )}
          <label htmlFor="months-to-pay">Meses para pagar:</label>
          <input type="number" id="months-to-pay" value={monthsToPay} onChange={handleChangeMonthsToPay} min="1"/>
          <label htmlFor="payment-day">Día de pago:</label>
          <select id="payment-day" value={paymentDay} onChange={(e) => setPaymentDay(parseInt(e.target.value))}>
            {Array.from({ length: 30 }, (_, index) => (
              <option key={index + 1} value={index + 1}>{index + 1}</option>
            ))}
          </select>
          {pagosExtraordinarios && (
            <>
            <>
      {availableYears.length > 0 && (
        <>
          <label htmlFor="select-year">Seleccionar año:</label>
          <select id="select-year" value={selectedYear} onChange={handleChangeYear}>
            <option value="">Seleccione un año</option>
            {availableYears.map((year, index) => (
              <option key={index} value={year}>{year}</option>
            ))}
          </select>
        </>
      )}

      {availableMonths.length > 0 && (
        <>
          <label htmlFor="select-month">Seleccionar mes:</label>
          <select id="select-month" value={selectedMonth} onChange={handleChangeMonth}>
            <option value="">Seleccione un mes</option>
            {availableMonths.map((month, index) => (
              <option key={index} value={month}>{new Date(2000, month - 1).toLocaleString('es', { month: 'long' })} - {selectedYear}</option>
            ))}
          </select>
          <label htmlFor="select-month">Seleccionar monto:</label>
          <input type="number" id="extra-amount-to-pay" value={selectedAmount} onChange={handleChangeAmount} min="1"/>
        </>
      )}
      <div>
      {selectedYear && selectedMonth && selectedAmount > 0 &&(
        <button style={{alignItems:'center'}} onClick={handleAddDate}>Agregar</button>
      )}
      </div>
      {selectedDates.length > 0 && (
        <div>
          <h5>Fechas seleccionadas:</h5>
          <ul>
            {selectedDates.map((date, index) => (
              <li key={index}>
                {new Date(2000, date.month - 1).toLocaleString('es', { month: 'long' })} - {date.year} - {"monto: " + date.amount}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  </>
)}
          <div style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
            <button type="submit">Calcular plan de pago</button>
          </div>
        </form>
        <br/>
        {totalCost > 0 && (
          
          <div ref={tableRef}>
          <table style={{margin: '0 auto'}}>      
            <tbody>
              {showImage && (
            <img src={logo} alt="plusval" style={{width: '250px', height: 'auto', margin: 'auto', display: 'block'}}></img>

              )}

              <tr>  

                <td colSpan={2} style={{ textAlign: 'Center', backgroundColor: greenColor }}>{projectName}</td>
                
              </tr>
              <tr>
                <td>Precio Total:</td>
                <td>{currency}{totalCost.toLocaleString()}</td>
              </tr>
              <tr>
                <td>Reserva:</td>
                <td>{currency}{reserve.toLocaleString()}</td>
              </tr>
              <tr>
                <td>Completar separacion ({manejarPorPorcentajes ? signingPercentage + "%" : signingPercentage}):</td>
                <td>{currency}{signingAmount.toLocaleString()}</td>
              </tr>
              <tr>
                <td>Durante la construcción ({manejarPorPorcentajes ? buildingPercentage + "%" : buildingPercentage}):</td>
                <td>{currency}{(buildinAmountPersist.current || 0) === 0 ? buildingAmount : (buildinAmountPersist.current || 0).toLocaleString()}</td>
              </tr>
              <tr>
                <td>Pago contra entrega ({manejarPorPorcentajes ? financialPercentage * 100 + "%" : financialPercentage}):</td>
                <td>{currency}{financialAmount.toLocaleString()}</td>
                
              </tr>
              <tr>
                <td colSpan={2}>
                {selectedDates.length > 0 && (
          <div ref={extraTableRef}>
          <table style={{margin: '0 auto'}}>      
            <tbody>
              <tr>  
                <td colSpan={2}>
                <h4 style={{textAlign: 'center', backgroundColor: greenColor}}>Pagos extraordinarios</h4>
                </td>            
              </tr>
          <tr>
            <td colSpan={2}>
              <table>
                <thead>
                  <tr>
                    <th>Año</th>
                    <th>Fecha de Pago</th>
                    <th>Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedDates.map((values) => {
                    const year = values.year;
                    const month = new Date(2000, values.month - 1).toLocaleString('es', { month: 'long' });
                    const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);
                    const lastDayOfMonth = new Date(year, values.month, 0).getDate();
                    const paymentDate = new Date(year, values.month - 1, Math.min(paymentDay, lastDayOfMonth));
                    const formattedPaymentDate = paymentDate.toLocaleString('es-ES', { day: 'numeric' });
                    
                    const amount = values.amount;
                    return (
                      <tr>
                        <td>{year}</td>
                        <td>{formattedPaymentDate} de {capitalizedMonth}</td>
                        <td>{currency}{amount}</td>
                      </tr>
                    );
                  })}
                      </tbody>
                    </table>
                  </td>
                </tr>
            </tbody>
          </table>
          </div>
        )}

                </td>
                
              </tr>
              {monthsToPay > 0 && (
                
          <tr>
            
            <td colSpan={2}>
              <h4 style={{textAlign: 'center', backgroundColor: greenColor}}>Cuotas mensuales</h4>
              <table>
                <thead>
                  <tr>
                    <th>Año</th>
                    <th>Fecha de Pago</th>
                    <th>Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentDates.map(date => {
                    const year = date.getFullYear();
                    const month = date.toLocaleString("es-ES", { month: "long" });
                    const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);
                    const day = date.getDate()
                    return (
                      <tr key={date}>
                        <td>{year}</td>
                        <td>{day} de {capitalizedMonth}</td>
                        <td>{currency}{paymentFee.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                      </tbody>
                    </table>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        )}

      </div>
      <button onClick={generatePDF}>Generar PDF</button>   
    </div>
  );
}

export default PaymentCalc;

