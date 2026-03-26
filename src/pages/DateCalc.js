import React, { useState } from 'react';
import '../utils/PaymentCalc.css';

function DateCalculator() {
  const [dateType, setDateType] = useState('Meses');
  const [value, setValue] = useState('');
  const [futureDate, setFutureDate] = useState(null);
  
  function handleChangeDateType(event) {
    setDateType(event.target.value);
  }
  
  function handleChangeValue(event) {
    setValue(parseInt(event.target.value) || '');
  }
  
  function handleSubmit(event) {
    event.preventDefault();
    
    if (!value || value < 0) {
      setFutureDate('Por favor ingresa un valor válido');
      return;
    }

    const today = new Date();
    let future = new Date(today);
  
    if (dateType === 'Años') {
      future.setFullYear(today.getFullYear() + value);
    } else if (dateType === 'Meses') {
      future.setMonth(today.getMonth() + value);
    } else if (dateType === 'Días') {
      future.setDate(today.getDate() + value);
    } else {
      setFutureDate('Tipo de dato inválido');
      return;
    }
  
    if (isNaN(future.getTime())) {
      setFutureDate('Fecha inválida');
      return;
    }
  
    const options = {day: '2-digit', month: '2-digit', year: 'numeric'};
    setFutureDate(future.toLocaleDateString('es-ES', options));
  }

  const handleReset = () => {
    setDateType('Meses');
    setValue('');
    setFutureDate(null);
  };
  
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        boxShadow: '0px 8px 24px rgba(0,0,0,0.1)',
        padding: '40px',
        maxWidth: '500px',
        width: '100%'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '700',
          color: '#1f2937',
          textAlign: 'center',
          marginBottom: '30px'
        }}>
          📅 Calculador de Fechas
        </h1>

        <form onSubmit={handleSubmit} style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <div>
            <label style={{
              display: 'block',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px',
              fontSize: '0.95rem'
            }}>
              Tipo de cálculo:
            </label>
            <select 
              id="date-type" 
              value={dateType} 
              onChange={handleChangeDateType}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '15px',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              <option value="Años">Años</option>
              <option value="Meses">Meses</option>
              <option value="Días">Días</option>
            </select>
          </div>

          <div>
            <label style={{
              display: 'block',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px',
              fontSize: '0.95rem'
            }}>
              Cantidad de {dateType.toLowerCase()}:
            </label>
            <input 
              type="number" 
              id="value" 
              value={value} 
              onChange={handleChangeValue}
              placeholder="Ej: 12"
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '15px',
                transition: 'all 0.3s ease',
                textAlign: 'right'
              }}
            />
          </div>

          <div style={{
            display: 'flex',
            gap: '12px',
            marginTop: '20px'
          }}>
            <button 
              type="submit"
              style={{
                flex: 1,
                padding: '12px 24px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '1rem',
                transition: 'all 0.3s ease',
                boxShadow: '0px 4px 12px rgba(16, 185, 129, 0.2)'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#059669';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#10b981';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              Calcular
            </button>
            <button 
              type="button"
              onClick={handleReset}
              style={{
                flex: 1,
                padding: '12px 24px',
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '1rem',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#4b5563';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#6b7280';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              Limpiar
            </button>
          </div>
        </form>

        {futureDate && (
          <div style={{
            marginTop: '30px',
            padding: '20px',
            backgroundColor: '#f0fdf4',
            border: '2px solid #10b981',
            borderRadius: '8px',
            textAlign: 'center',
            animation: 'slideUp 0.3s ease'
          }}>
            <p style={{
              margin: 0,
              fontSize: '0.95rem',
              color: '#6b7280',
              marginBottom: '8px'
            }}>
              La fecha resultante es:
            </p>
            <p style={{
              margin: 0,
              fontSize: '1.8rem',
              fontWeight: '700',
              color: '#10b981'
            }}>
              {futureDate}
            </p>
          </div>
        )}

        <style>{`
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    </div>
  );
}

export default DateCalculator;
