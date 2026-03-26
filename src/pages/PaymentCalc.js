import React, { useState, useRef, useEffect } from 'react';
import '../utils/PaymentCalc.css';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import logo from '../assets/plusval-logo-black.png';
import { PDFDocument } from 'pdf-lib'
import Swal from 'sweetalert2';
import ProjectsList from '../components/ProjectsList';
import PercentagePresets from '../components/PercentagePresets';
import { projectManager } from '../utils/projectManager';

// Remove PercentagePresets from direct rendering since it's now in a modal

function PaymentCalc() {

  const [greenColor] = useState('#75BD42');
  const [showImage] = useState(false);
  const [manejarPorPorcentajes, setManejarPorPorcentajes] = useState(true);
  const [pagosExtraordinarios, setPagosExtraordinarios] = useState(false);
  const [refreshProjectsList, setRefreshProjectsList] = useState(0);
  const [currentProjectId, setCurrentProjectId] = useState(null);
  const [showDatesSection, setShowDatesSection] = useState(true);
  const [showPaymentDays, setShowPaymentDays] = useState(true);
  const [paymentStartMonth, setPaymentStartMonth] = useState(12); // December by default
  const [targetMonthlyFee, setTargetMonthlyFee] = useState('');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showPresetsModal, setShowPresetsModal] = useState(false);
  const [showRecommendationsModal, setShowRecommendationsModal] = useState(false);
  const formRef = useRef(null);
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
    const paymentDates = [];
    let paymentYear = startDate.getFullYear();
    let paymentMonth = paymentStartMonth; // Use the selected start month
    
    // If selected month is before current month, start from next year
    if (paymentMonth <= startDate.getMonth() + 1) {
      paymentYear += 1;
    }
  
    for (let i = 1; i <= monthsToPay; i++) {
      if (paymentMonth > 12) {
        paymentYear++;
        paymentMonth = 1;
      }

      // Verificar si es febrero y ajustar el día a 28 si es necesario
      const isFebruary = paymentMonth === 2;
      const adjustedDay = showPaymentDays ? paymentDay : 1;
      const adjustedDayFinal = isFebruary ? Math.min(adjustedDay, 28) : adjustedDay;
      const paymentDate = new Date(paymentYear, paymentMonth - 1, adjustedDayFinal);
      paymentDates.push(paymentDate);
      paymentMonth++;
    }
  
    return paymentDates;
  };
  
  const paymentDates = getPaymentDates();

  // const handleToggleColors = () => {
  //   setGreenColor(color => color === '#75BD42' ? 'white' : '#75BD42');
  //   setShowImage(showImage => !showImage);
  // };

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
      const financialPercentage = (100 - (signingPercentage + buildingPercentage)); // AQUÍ 🔥
      financialAmount = (totalCost * financialPercentage) / 100;
      return { signingAmount, buildingAmount, financialAmount, financialPercentage };
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
        const financialPercentageTemp = 100 - (signingPercentage + buildingPercentage);  // Mantén el porcentaje como un número
        financialAmount = totalCost * (financialPercentageTemp / 100);
        setFinancialPercentage(financialPercentageTemp);  // Establece el porcentaje correcto (no el monto)
        buildinAmountPersist.current = buildingAmount;

        if (pagosExtraordinarios) {
            buildinAmountPersist.current = buildingAmount;
            buildingAmount = buildingAmount - extraPaymentsAmount.current;
        }
    } else {
        buildinAmountPersist.current = buildingAmount;
        signingAmount = signingPercentage;
        buildingAmount = buildingPercentage;
        financialAmount = totalCost - (signingAmount + buildingAmount + parseInt(reserve));
        setFinancialPercentage(financialAmount);  // Esto debe ser porcentaje, no monto

        if (pagosExtraordinarios) {
            buildinAmountPersist.current = buildingAmount;
            buildingAmount = buildingAmount - extraPaymentsAmount.current;
        }
    }

    let totalAmount = 0;
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

// Calculate recommendations for extraordinary payments
const calculateExtraordinaryRecommendations = (buildingAmount, monthsToPay) => {
    const currentMonthlyFee = buildingAmount / monthsToPay;
    const recommendations = [];

    // Suggest different target monthly fees (50%, 60%, 70%, 80% of current)
    const targetPercentages = [50, 60, 70, 80];

    targetPercentages.forEach((percent) => {
        const targetMonthlyFee = currentMonthlyFee * (percent / 100);
        const totalNeeded = buildingAmount - (targetMonthlyFee * monthsToPay);

        // Try different payment frequencies
        for (let frequency = 1; frequency <= Math.min(5, monthsToPay); frequency++) {
            const extraordinaryAmount = totalNeeded / frequency;
            const savings = currentMonthlyFee - targetMonthlyFee;

            // IMPORTANT: Only include recommendations that reduce the fee (targetMonthlyFee < currentMonthlyFee)
            if (extraordinaryAmount > 0 && extraordinaryAmount < buildingAmount && targetMonthlyFee < currentMonthlyFee) {
                recommendations.push({
                    targetMonthlyFee: Math.round(targetMonthlyFee),
                    extraordinaryAmount: Math.round(extraordinaryAmount),
                    frequency,
                    savings: Math.round(savings),
                    percentageReduction: (100 - percent)
                });
            }
        }
    });

    // Remove duplicates and sort by best savings
    const uniqueRecommendations = recommendations.filter((item, index, self) =>
        index === self.findIndex((t) =>
            t.targetMonthlyFee === item.targetMonthlyFee &&
            t.extraordinaryAmount === item.extraordinaryAmount &&
            t.frequency === item.frequency
        )
    ).filter(rec => rec.targetMonthlyFee < currentMonthlyFee) // Double check all are less than current
    .sort((a, b) => b.percentageReduction - a.percentageReduction);

    return uniqueRecommendations.slice(0, 3); // Return top 3 recommendations
};

// Add a recommendation to the payment plan
const handleAddRecommendationToPayments = (recommendation) => {
  // Enable extraordinary payments if not already enabled
  if (!pagosExtraordinarios) {
    setPagosExtraordinarios(true);
  }

  // Calculate dates for the payments
  const allDates = [];
  const currentYear = new Date().getFullYear();
  
  for (let i = 0; i < recommendation.frequency; i++) {
    const monthOffset = Math.floor((monthsToPay * (i + 1)) / (recommendation.frequency + 1));
    let payMonth = paymentStartMonth + monthOffset;
    let payYear = currentYear;
    
    if (payMonth > 12) {
      payYear += Math.floor(payMonth / 12);
      payMonth = payMonth % 12;
      if (payMonth === 0) payMonth = 12;
    }
    
    allDates.push({
      year: payYear,
      month: payMonth,
      amount: recommendation.extraordinaryAmount
    });
  }

  setSelectedDates(allDates);
  extraPaymentsAmount.current = recommendation.extraordinaryAmount * recommendation.frequency;

  Swal.fire({
    title: '✅ Recomendación Agregada',
    text: `Se han programado ${recommendation.frequency} pago(s) extraordinario(s) de ${currency}${recommendation.extraordinaryAmount.toLocaleString()}.`,
    icon: 'success',
    confirmButtonText: 'OK'
  });

  // Auto-submit form after a brief delay
  setTimeout(() => {
    formRef.current?.dispatchEvent(new Event('submit', { bubbles: true }));
  }, 100);
};

// Calculate reverse (target fee to determine needed extraordinary payments)
const handleCalculateTargetFee = () => {
  if (!targetMonthlyFee || !buildingAmount || !monthsToPay) {
    Swal.fire({
      title: 'Error',
      text: 'Por favor completa todos los datos: cuota actual, meses de pago y cuota objetivo.',
      icon: 'error'
    });
    return;
  }

  const target = parseInt(targetMonthlyFee);
  const totalWithTarget = target * monthsToPay;
  const totalNeeded = buildingAmount - totalWithTarget;

  if (totalNeeded <= 0) {
    Swal.fire({
      title: 'Error',
      text: 'La cuota objetivo no puede ser mayor o igual a la cuota actual.',
      icon: 'error'
    });
    return;
  }

  // Show detailed recommendations for this target
  const suggestions = [];
  for (let freq = 1; freq <= Math.min(6, monthsToPay); freq++) {
    const extraordinaryAmount = Math.round(totalNeeded / freq);
    suggestions.push({
      frequency: freq,
      amount: extraordinaryAmount,
      total: extraordinaryAmount * freq
    });
  }

  const buttonsHtml = suggestions.map(s => {
    return `<button onclick="window.handleTargetOption_${s.frequency}()" 
      style="
        width: 100%;
        padding: 12px;
        margin: 10px 0;
        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
        color: white;
        border: 2px solid #1d4ed8;
        border-radius: 8px;
        cursor: pointer;
        font-weight: bold;
        font-size: 1rem;
        transition: all 0.3s;
      "
      onmouseover="this.style.background='linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)'; this.style.boxShadow='0 4px 12px rgba(29, 78, 216, 0.4)'"
      onmouseout="this.style.background='linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'; this.style.boxShadow='none'"
    >${s.frequency} pago(s) de ${currency}${s.amount.toLocaleString()}</button>`;
  }).join('');

  const message = `<div style="text-align: left;">
    <p><strong style="font-size: 1.1rem;">Para lograr una cuota de ${currency}${target.toLocaleString()}:</strong></p>
    <p>Necesitas ahorrar: <strong>${currency}${Math.round(totalNeeded).toLocaleString()}</strong></p>
    <br/>
    <p><strong>Selecciona una opción para agregar:</strong></p>
    ${buttonsHtml}
  </div>`;

  // Handle option selection
  const handleSelectOption = (option) => {
    setSelectedDates([]);
    const allDates = [];
    const currentYear = new Date().getFullYear();
    
    for (let i = 0; i < option.frequency; i++) {
      const monthOffset = Math.floor((monthsToPay * (i + 1)) / (option.frequency + 1));
      let payMonth = paymentStartMonth + monthOffset;
      let payYear = currentYear;
      
      if (payMonth > 12) {
        payYear += Math.floor(payMonth / 12);
        payMonth = payMonth % 12;
        if (payMonth === 0) payMonth = 12;
      }
      
      allDates.push({
        year: payYear,
        month: payMonth,
        amount: option.amount
      });
    }

    setSelectedDates(allDates);
    extraPaymentsAmount.current = option.amount * option.frequency;
    if (!pagosExtraordinarios) setPagosExtraordinarios(true);
    
    Swal.close();
    setTargetMonthlyFee('');
    
    Swal.fire({
      title: '✅ Opción Seleccionada',
      text: `${option.frequency} pago(s) de ${currency}${option.amount.toLocaleString()} agregado(s). Haz clic en Calcular para actualizar el plan.`,
      icon: 'success',
      confirmButtonText: 'OK'
    });
    
    setTimeout(() => {
      formRef.current?.dispatchEvent(new Event('submit', { bubbles: true }));
    }, 100);
  };

  // Attach handlers to window for button clicks
  suggestions.forEach(s => {
    window[`handleTargetOption_${s.frequency}`] = () => handleSelectOption(s);
  });

  Swal.fire({
    title: '💡 Recomendación de Cuota',
    html: message,
    icon: 'info',
    confirmButtonText: 'Cerrar',
    didOpen: () => {
      // Clean up handlers when modal closes
      return () => {
        suggestions.forEach(s => {
          delete window[`handleTargetOption_${s.frequency}`];
        });
      };
    }
  });
};

  // Save current project
  const handleSaveProject = () => {
    if (!projectName.trim()) {
      Swal.fire({
        title: 'Error',
        text: 'Por favor ingresa un nombre para el proyecto.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return;
    }

    const projectData = {
      projectName,
      currency,
      totalCost: parseInt(totalCost),
      reserve: parseInt(reserve),
      signingPercentage: parseInt(signingPercentage),
      buildingPercentage: parseInt(buildingPercentage),
      signingAmount,
      buildingAmount,
      financialAmount,
      financialPercentage,
      monthsToPay: parseInt(monthsToPay),
      paymentDay,
      showPaymentDays,
      paymentStartMonth,
      manejarPorPorcentajes,
      pagosExtraordinarios,
      showDatesSection,
      selectedDates
    };

    if (currentProjectId) {
      // Update existing project
      projectManager.updateProject(currentProjectId, projectData);
      Swal.fire({
        title: 'Proyecto actualizado',
        text: `${projectName} ha sido actualizado correctamente.`,
        icon: 'success',
        confirmButtonText: 'OK'
      });
    } else {
      // Save as new project (always creates new, never overwrites)
      projectManager.saveProject(projectData);
      
      // Clear form for next project - and reset currentProjectId for new projects
      setProjectName('');
      setTotalCost('');
      setReserve('');
      setSigningPercentage('');
      setBuildingPercentage('');
      setMonthsToPay('');
      setCurrentProjectId(null);
      
      Swal.fire({
        title: 'Proyecto guardado',
        text: `${projectData.projectName} ha sido guardado correctamente. Puedes crear otro nuevo.`,
        icon: 'success',
        confirmButtonText: 'OK'
      });
    }

    setRefreshProjectsList(prev => prev + 1);
  };

  // Load a project
  const handleLoadProject = (project) => {
    setProjectName(project.projectName);
    setCurrency(project.currency);
    setTotalCost(project.totalCost);
    setReserve(project.reserve);
    setSigningPercentage(project.signingPercentage);
    setBuildingPercentage(project.buildingPercentage);
    setSigningAmount(project.signingAmount);
    setBuildingAmount(project.buildingAmount);
    setFinancialAmount(project.financialAmount);
    setFinancialPercentage(project.financialPercentage);
    setMonthsToPay(project.monthsToPay);
    setPaymentDay(project.paymentDay);
    setShowPaymentDays(project.showPaymentDays ?? true);
    setPaymentStartMonth(project.paymentStartMonth ?? 1);
    setManejarPorPorcentajes(project.manejarPorPorcentajes);
    setPagosExtraordinarios(project.pagosExtraordinarios);
    setShowDatesSection(project.showDatesSection ?? true);
    setSelectedDates(project.selectedDates || []);
    setCurrentProjectId(project.id);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // Apply percentage preset
  const handleApplyPercentagePreset = (preset) => {
    setSigningPercentage(preset.signing);
    setBuildingPercentage(preset.building);
    setFinancialPercentage(preset.financial);

    const { signingAmount, buildingAmount, financialAmount } = calculateAmounts(
      preset.signing,
      preset.building,
      totalCost,
      reserve,
      true
    );

    setSigningAmount(signingAmount);
    setBuildingAmount(buildingAmount);
    setFinancialAmount(financialAmount);
  };

  // Handle edit date for extraordinary payments
  const handleEditDate = (yearValue, monthValue, values, idx) => {
    const yearOptions = [yearValue - 1, yearValue, yearValue + 1]
      .map(y => `<option value="${y}" ${y === yearValue ? 'selected' : ''}>${y}</option>`)
      .join('');
    
    const monthOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
      .map(m => {
        const monthName = new Date(2000, m - 1).toLocaleString('es', { month: 'long' });
        return `<option value="${m}" ${m === monthValue ? 'selected' : ''}>${monthName}</option>`;
      })
      .join('');

    const htmlContent = `<div style="text-align: left;">
                          <label style="display: block; margin-bottom: 8px;">
                            <strong>Año:</strong>
                            <select id="edit-year" style="width: 100%; padding: 8px; margin-top: 4px;">
                              ${yearOptions}
                            </select>
                          </label>
                          <label style="display: block; margin-bottom: 8px;">
                            <strong>Mes:</strong>
                            <select id="edit-month" style="width: 100%; padding: 8px; margin-top: 4px;">
                              ${monthOptions}
                            </select>
                          </label>
                        </div>`;

    Swal.fire({
      title: 'Editar Fecha',
      html: htmlContent,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      showCancelButton: true,
      preConfirm: () => {
        const newYear = parseInt(document.getElementById('edit-year').value);
        const newMonth = parseInt(document.getElementById('edit-month').value);
        const newDates = [...selectedDates];
        newDates[idx] = { ...newDates[idx], year: newYear, month: newMonth };
        setSelectedDates(newDates);
      }
    });
  };

  return (
    <div className='container' style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '50px 40px',
      background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
      borderRadius: '20px',
      boxShadow: '0px 20px 40px rgba(0,0,0,0.08)',
      maxWidth: '900px',
      margin: '20px auto',
      minHeight: '100vh'
    }}>
      
      <ProjectsList onLoadProject={handleLoadProject} onRefresh={refreshProjectsList} />
      
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '20px',
      }}>
       <h2 className='titulo-pagos'>Calculadora de pagos</h2>
    {/* <button
      style={{
        marginLeft: '20px',
        padding: '10px 20px',
        borderRadius: '10px',
        backgroundColor: '#3b82f6',
        color: '#fff',
        border: 'none',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '1rem',
      }}
      onClick={handleToggleColors}
    >
      Plusvalizar
    </button> */}
  </div>


      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '25px',
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}>
        <button
          type="button"
          onClick={() => setShowSettingsModal(true)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#64748b',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.95rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.3s ease',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#475569'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#64748b'}
        >
          ⚙️ Configuración
        </button>
        
        {manejarPorPorcentajes && (
          <button
            type="button"
            onClick={() => setShowPresetsModal(true)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#f59e0b',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.95rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 8px rgba(245,158,11,0.2)',
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#d97706'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#f59e0b'}
          >
            📊 Presets
          </button>
        )}
      </div>

      {showSettingsModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }} onClick={() => setShowSettingsModal(false)}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '30px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
            maxWidth: '500px',
            width: '90%',
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 20px 0', color: '#1f2937' }}>⚙️ Configuración</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {/* Modo de Cálculo */}
              <div style={{ backgroundColor: '#f3f4f6', padding: '15px', borderRadius: '8px' }}>
                <strong style={{ display: 'block', marginBottom: '10px', color: '#374151' }}>📊 Modo Cálculo</strong>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="radio" name="calculo" checked={manejarPorPorcentajes} onChange={() => handleChangeManejo(true)} />
                    Porcentajes
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="radio" name="calculo" checked={!manejarPorPorcentajes} onChange={() => handleChangeManejo(false)} />
                    Montos
                  </label>
                </div>
              </div>

              {/* Pagos Extraordinarios */}
              <div style={{ backgroundColor: '#f3f4f6', padding: '15px', borderRadius: '8px' }}>
                <strong style={{ display: 'block', marginBottom: '10px', color: '#374151' }}>💰 Pagos Extra</strong>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="radio" name="pagosExtra" checked={pagosExtraordinarios} onChange={() => setPagosExtraordinarios(true)} />
                    Incluir
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="radio" name="pagosExtra" checked={!pagosExtraordinarios} onChange={() => setPagosExtraordinarios(false)} />
                    Sin Incluir
                  </label>
                </div>
              </div>

              {/* Mostrar Fechas */}
              <div style={{ backgroundColor: '#f3f4f6', padding: '15px', borderRadius: '8px' }}>
                <strong style={{ display: 'block', marginBottom: '10px', color: '#374151' }}>📅 Mostrar Fechas</strong>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="radio" name="showDates" checked={showDatesSection} onChange={() => setShowDatesSection(true)} />
                    Mostrar
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="radio" name="showDates" checked={!showDatesSection} onChange={() => setShowDatesSection(false)} />
                    Ocultar
                  </label>
                </div>
              </div>

              {/* Mostrar Días */}
              <div style={{ backgroundColor: '#f3f4f6', padding: '15px', borderRadius: '8px' }}>
                <strong style={{ display: 'block', marginBottom: '10px', color: '#374151' }}>🕐 Mostrar Días</strong>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="radio" name="showDays" checked={showPaymentDays} onChange={() => setShowPaymentDays(true)} />
                    Sí
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="radio" name="showDays" checked={!showPaymentDays} onChange={() => setShowPaymentDays(false)} />
                    No
                  </label>
                </div>
              </div>
            </div>
            
            <button
              type="button"
              onClick={() => setShowSettingsModal(false)}
              style={{
                width: '100%',
                marginTop: '20px',
                padding: '10px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {showPresetsModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }} onClick={() => setShowPresetsModal(false)}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '30px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
            maxWidth: '500px',
            width: '90%',
          }} onClick={(e) => e.stopPropagation()}>
            <PercentagePresets onApplyPreset={(preset) => {
              handleApplyPercentagePreset(preset);
              setShowPresetsModal(false);
            }} />
            <button
              type="button"
              onClick={() => setShowPresetsModal(false)}
              style={{
                width: '100%',
                marginTop: '20px',
                padding: '10px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      <div>
        <form ref={formRef} onSubmit={handleSubmit} style={{
    width: '100%',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '30px',
  }}>
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
            <span>{financialPercentage}%</span>
          ) : (
            <span>${financialAmount.toLocaleString()}</span>
          )}
          <label htmlFor="months-to-pay">Meses para pagar:</label>
          <input type="number" id="months-to-pay" value={monthsToPay} onChange={handleChangeMonthsToPay} min="1"/>
          <label htmlFor="payment-start-month">Mes de inicio de pagos:</label>
          <select id="payment-start-month" value={paymentStartMonth} onChange={(e) => setPaymentStartMonth(parseInt(e.target.value))}>
            <option value="1">Enero</option>
            <option value="2">Febrero</option>
            <option value="3">Marzo</option>
            <option value="4">Abril</option>
            <option value="5">Mayo</option>
            <option value="6">Junio</option>
            <option value="7">Julio</option>
            <option value="8">Agosto</option>
            <option value="9">Septiembre</option>
            <option value="10">Octubre</option>
            <option value="11">Noviembre</option>
            <option value="12">Diciembre</option>
          </select>

          <label htmlFor="target-fee">¿Cuota objetivo? (opcional):</label>
          <input 
            type="number" 
            id="target-fee" 
            value={targetMonthlyFee}
            onChange={(e) => {
              const value = e.target.value;
              // Solo aceptar números enteros para la cuota objetivo
              if (value === '' || /^\d+$/.test(value)) {
                setTargetMonthlyFee(value);
              }
            }}
            step="1"
            inputMode="numeric"
            placeholder={`ej: ${buildingAmount / monthsToPay || 'monto'}`}
          />
          <button
            type="button"
            onClick={handleCalculateTargetFee}
            style={{
              padding: '10px 16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              fontWeight: 'bold',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.9rem',
              whiteSpace: 'nowrap',
              width: '100%'
            }}
          >
            💡 Ver Cuota Objetivo
          </button>
          <label htmlFor="payment-day">Día de pago:</label>
          <select id="payment-day" value={paymentDay} onChange={(e) => setPaymentDay(parseInt(e.target.value))}>
            {Array.from({ length: 30 }, (_, index) => (
              <option key={index + 1} value={index + 1}>{index + 1}</option>
            ))}
          </select>
          {showDatesSection && pagosExtraordinarios && (
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
        <div style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#f0fdf4',
          borderRadius: '8px',
          borderLeft: '4px solid #10b981'
        }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: '600', color: '#374151' }}>Pagos extraordinarios seleccionados:</p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '10px'
          }}>
            {selectedDates.map((date, index) => {
              const monthName = new Date(2000, date.month - 1).toLocaleString('es', { month: 'long' });
              const displayText = showDatesSection 
                ? `${monthName} ${date.year}` 
                : `Extraordinario ${index + 1}`;
              return (
              <div key={index} style={{
                backgroundColor: 'white',
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid #d1fae5',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '0.9rem', color: '#374151' }}>
                  {displayText} - {currency}{date.amount}
                </span>
                <button
                  type="button"
                  onClick={() => handleEditDate(date.year, date.month, date, index)}
                  style={{
                    padding: '5px 10px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    whiteSpace: 'nowrap'
                  }}
                >
                  ✏️ Editar
                </button>
              </div>
            );
            })}
          </div>
        </div>
      )}
    </>
  </>
)}
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
      <button type="submit" style={{
        padding: '12px 24px',
        backgroundColor: '#10b981',
        color: 'white',
        fontWeight: 'bold',
        borderRadius: '10px',
        border: 'none',
        cursor: 'pointer',
        fontSize: '1rem',
        boxShadow: '0px 4px 12px rgba(0,0,0,0.1)',
      }}>
        Calcular plan de pago
      </button>
      <button type="button" onClick={handleSaveProject} style={{
        padding: '12px 24px',
        backgroundColor: '#3b82f6',
        color: 'white',
        fontWeight: 'bold',
        borderRadius: '10px',
        border: 'none',
        cursor: 'pointer',
        fontSize: '1rem',
        boxShadow: '0px 4px 12px rgba(0,0,0,0.1)',
      }}>
        💾 Guardar Proyecto
      </button>
      {currentProjectId && (
        <button type="button" onClick={() => {
          setProjectName('');
          setTotalCost('');
          setReserve('');
          setSigningPercentage('');
          setBuildingPercentage('');
          setMonthsToPay('');
          setPaymentDay(1);
          setTargetMonthlyFee('');
          setPagosExtraordinarios(false);
          setSelectedDates([]);
          setCurrentProjectId(null);
        }} style={{
          padding: '12px 24px',
          backgroundColor: '#ef4444',
          color: 'white',
          fontWeight: 'bold',
          borderRadius: '10px',
          border: 'none',
          cursor: 'pointer',
          fontSize: '1rem',
          boxShadow: '0px 4px 12px rgba(0,0,0,0.1)',
        }}>
          ➕ Nuevo Proyecto
        </button>
      )}
    </div>
  </form>
        <br/>
        {totalCost > 0 && (
          
          <div ref={tableRef} style={{
            backgroundColor: '#ffffff',
            padding: '30px',
            borderRadius: '15px',
            boxShadow: '0px 6px 18px rgba(0,0,0,0.1)',
            width: '100%',
            overflowX: 'auto',
          }}>
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
              <td colSpan="2" style={{fontSize:'12px'}}><strong>*La Reserva no es Reembolsable</strong></td>
              
              <tr>
                <td>Completar separacion ({manejarPorPorcentajes ? signingPercentage + "%" : signingPercentage}):</td>
                <td>{currency}{signingAmount.toLocaleString()}</td>
              </tr>
              <tr>
                <td>Durante la construcción ({manejarPorPorcentajes ? buildingPercentage + "%" : buildingPercentage}):</td>
                <td>{currency}{(buildinAmountPersist.current || 0) === 0 ? buildingAmount : (buildinAmountPersist.current || 0).toLocaleString()}</td>
              </tr>
              <tr>
                <td>Pago contra entrega ({manejarPorPorcentajes ? financialPercentage + "%" : financialPercentage}):</td>
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
                  {selectedDates.map((values, idx) => {
                    const year = values.year;
                    const month = new Date(2000, values.month - 1).toLocaleString('es', { month: 'long' });
                    const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);
                    const lastDayOfMonth = new Date(year, values.month, 0).getDate();
                    const paymentDate = new Date(year, values.month - 1, Math.min(paymentDay, lastDayOfMonth));
                    const formattedPaymentDate = paymentDate.toLocaleString('es-ES', { day: 'numeric' });
                    
                    let dateDisplay;
                    if (!showDatesSection) {
                      dateDisplay = `Extraordinario ${idx + 1}`;
                    } else if (showPaymentDays) {
                      dateDisplay = `${formattedPaymentDate} de ${capitalizedMonth}`;
                    } else {
                      dateDisplay = capitalizedMonth;
                    }
                    
                    const amount = values.amount;
                    return (
                      <tr key={idx}>
                        <td>{year}</td>
                        <td>{dateDisplay}</td>
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
                  {paymentDates.map((date, index) => {
                    const year = date.getFullYear();
                    const month = date.toLocaleString("es-ES", { month: "long" });
                    const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);
                    const day = date.getDate();
                    let dateDisplay;
                    
                    if (!showDatesSection) {
                      dateDisplay = `Cuota ${index + 1}`;
                    } else if (showPaymentDays) {
                      dateDisplay = `${day} de ${capitalizedMonth}`;
                    } else {
                      dateDisplay = capitalizedMonth;
                    }
                    
                    return (
                      <tr key={date}>
                        <td>{year}</td>
                        <td>{dateDisplay}</td>
                        <td>{currency}{parseFloat(paymentFee).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</td>
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

        {paymentFee > 0 && pagosExtraordinarios && monthsToPay > 0 && (
          <div style={{
            marginTop: '30px',
            padding: '25px',
            backgroundColor: '#fef3c7',
            borderRadius: '12px',
            border: '2px solid #f59e0b',
          }}>
            
            <h3 style={{
              color: '#92400e',
              marginTop: 0,
              marginBottom: '20px',
              textAlign: 'center',
              fontSize: '1.3rem'
            }}>
              💡 Recomendaciones para Reducir tu Cuota Mensual
            </h3>
            
            <p style={{ color: '#78350f', marginBottom: '20px', textAlign: 'center', fontWeight: '500' }}>
              Actualmente pagas <strong>{currency}{Math.round(paymentFee).toLocaleString()}</strong> al mes
            </p>

            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <button
                type="button"
                onClick={() => setShowRecommendationsModal(true)}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#f59e0b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#d97706'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#f59e0b'}
              >
                📊 Ver 3 Opciones
              </button>
            </div>
</div>)}
            {showRecommendationsModal && (
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
              }} onClick={() => setShowRecommendationsModal(false)}>
                <div style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  padding: '30px',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                  maxWidth: '700px',
                  width: '95%',
                  maxHeight: '85vh',
                  overflowY: 'auto',
                }} onClick={(e) => e.stopPropagation()}>
                  <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#1f2937' }}>
                    💡 Opciones para Reducir tu Cuota
                  </h3>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '15px',
                    marginBottom: '20px'
                  }}>
              {calculateExtraordinaryRecommendations(buildinAmountPersist.current || buildingAmount, monthsToPay).map((rec, index) => (
                <div key={index} style={{
                  padding: '15px',
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  border: '1px solid #f59e0b',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}>
                  <div style={{ marginBottom: '10px' }}>
                    <p style={{ margin: '5px 0', color: '#374151' }}>
                      <strong style={{ color: '#10b981', fontSize: '1.1rem' }}>Si quieres:</strong>
                    </p>
                    <p style={{ margin: '8px 0', fontSize: '1.3rem', color: '#059669', fontWeight: 'bold' }}>
                      {currency}{rec.targetMonthlyFee.toLocaleString()} mensuales
                    </p>
                    <p style={{ margin: '8px 0', color: '#666', fontSize: '0.9rem' }}>
                      (Ahorro: {currency}{rec.savings.toLocaleString()} al mes)
                    </p>
                  </div>
                  
                  <div style={{
                    backgroundColor: '#f0fdf4',
                    padding: '12px',
                    borderRadius: '6px',
                    borderLeft: '4px solid #10b981',
                    marginBottom: '10px'
                  }}>
                    <p style={{ margin: '0 0 8px 0', color: '#374151', fontSize: '0.9rem' }}>
                      Necesitas hacer <strong>{rec.frequency} pago{rec.frequency > 1 ? 's' : ''} extraordinario{rec.frequency > 1 ? 's' : ''}</strong> de:
                    </p>
                    <p style={{ margin: 0, color: '#10b981', fontWeight: 'bold', fontSize: '1.2rem' }}>
                      {currency}{rec.extraordinaryAmount.toLocaleString()} cada uno
                    </p>
                  </div>

                  <div style={{ 
                    textAlign: 'center',
                    padding: '8px',
                    backgroundColor: '#dbeafe',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    color: '#1e40af',
                    marginBottom: '12px'
                  }}>
                    Reduce tu cuota un <strong>{rec.percentageReduction}%</strong>
                  </div>

                  <button 
                    type="button"
                    onClick={() => {
                      handleAddRecommendationToPayments(rec);
                      setShowRecommendationsModal(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '10px',
                      backgroundColor: '#10b981',
                      color: 'white',
                      fontWeight: 'bold',
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#059669'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#10b981'}
                  >
                    📌 Agregar Este Plan
                  </button>
                </div>
              ))}
                  <div style={{ gridColumn: '1 / -1', textAlign: 'center', marginTop: '20px' }}>
                    <button
                      type="button"
                      onClick={() => setShowRecommendationsModal(false)}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: '#6b7280',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '600',
                      }}
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              </div>
             )

          </div>
          
        )}

        <div style={{ marginTop: '20px' }}>
          <button  
            onClick={generatePDF}
            style={{
              padding: '14px 28px',
              backgroundColor: '#f59e0b',
              color: 'white',
              fontWeight: '700',
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem',
              boxShadow: '0px 4px 16px rgba(245, 158, 11, 0.3)',
              transition: 'all 0.3s ease',
              marginTop: '20px'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#d97706';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#f59e0b';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            📄 Generar PDF
          </button>
        </div>
    </div>
    </div>
)}


export default PaymentCalc;

