import React, { useState, useRef } from 'react';
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

  const tableRef = useRef(null);

  const handleChangeManejo = () => {
    setManejarPorPorcentajes(!manejarPorPorcentajes);

    // Mostrar la alerta al usuario
    Swal.fire({
      title: 'Cambio de modo',
      text: `Ahora estás calculando en base a ${manejarPorPorcentajes ? 'montos' : 'porcentajes'}.`,
      icon: 'info',
      confirmButtonText: 'Entendido'
    });
  };

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
  
      const paymentDate = new Date(paymentYear, paymentMonth - 1, 1);
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
  
    let signingAmount, buildingAmount, financialAmount, paymentFee;
  
    if (manejarPorPorcentajes) {
      signingAmount = (totalCost * signingPercentage) / 100 - reserve;
      buildingAmount = (totalCost * buildingPercentage) / 100;
      financialAmount = (totalCost * financialPercentage) / 100;
    } else {
      signingAmount = signingPercentage;
      buildingAmount = buildingPercentage;
      financialAmount = financialPercentage;
    }
  
    paymentFee = buildingAmount / monthsToPay;

    const totalAmount = signingAmount + buildingAmount + financialAmount + parseInt(reserve, 10);
    console.log(totalAmount)
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
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '60px',
    }}>
      <h2 style={{ fontSize: '2rem' }}>Calculadora de pagos</h2>
      <div>
      <label>
        <input
          type="checkbox"
          checked={manejarPorPorcentajes}
          onChange={handleChangeManejo}
        />
        {manejarPorPorcentajes ? 'Calcular en base a porcentajes' : 'Calcular en base a montos'}
      </label>
    </div>
      <div>
        <form onSubmit={handleSubmit} style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <label htmlFor="project-name">Nombre del proyecto:</label>
          <input type="text" id="project-name" value={projectName} onChange={handleChangeProjectName} />
          <label htmlFor="total-cost">Precio:</label>
          <input type="number" id="total-cost" value={totalCost} onChange={handleChangeTotalCost} />
          <label htmlFor="total-cost">Reserva:</label>
          <input type="text" id="reserve" value={reserve} onChange={handleChangeReserve} />
          <label htmlFor="signing-percentage">Completar separacion ({manejarPorPorcentajes ? '%' : "Montos"}):</label>
          <input type="number" id="signing-percentage" value={signingPercentage} onChange={handleChangeSigningPercentage} />
          <label htmlFor="building-percentage">Durante la construcción ({manejarPorPorcentajes ? '%' : "Montos"}):</label>
          <input type="number" id="building-percentage" value={buildingPercentage} onChange={handleChangeBuildingPercentage} />
          <label htmlFor="financial-percentage">Pago contra entrega ({manejarPorPorcentajes ? '%' : "Montos"}):</label>
          <input type="number" id="financial-percentage" value={financialPercentage} onChange={handleChangeFinancialPercentage} />
          <label htmlFor="months-to-pay">Meses para pagar:</label>
          <input type="number" id="months-to-pay" value={monthsToPay} onChange={handleChangeMonthsToPay} />
          <div style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
            <button type="submit">Calcular plan de pago</button>
          </div>
        </form>
        <br/>
        <button
      style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        zIndex: '1',
      }}
      onClick={handleToggleColors}
    >
      Plusvalizar
    </button>
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
                <td>${totalCost.toLocaleString()}</td>
              </tr>
              <tr>
                <td>Reserva:</td>
                <td>${reserve.toLocaleString()}</td>
              </tr>
              <tr>
                <td>Completar separacion ({manejarPorPorcentajes ? signingPercentage + "%" : signingPercentage}):</td>
                <td>${signingAmount.toLocaleString()}</td>
              </tr>
              <tr>
                <td>Durante la construcción ({manejarPorPorcentajes ? buildingPercentage + "%" : buildingPercentage}):</td>
                <td>${buildingAmount.toLocaleString()}</td>
              </tr>
              <tr>
                <td>Pago contra entrega ({manejarPorPorcentajes ? financialPercentage + "%" : financialPercentage}):</td>
                <td>${financialAmount.toLocaleString()}</td>
              </tr>
              {monthsToPay > 0 && (
          <tr>
            <td colSpan={2}>
              <h4 style={{textAlign: 'center', backgroundColor: greenColor}}>Plan de Pagos</h4>
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
                    return (
                      <tr key={date}>
                        <td>{year}</td>
                        <td>{capitalizedMonth}</td>
                        <td>${paymentFee.toLocaleString()}</td>
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

