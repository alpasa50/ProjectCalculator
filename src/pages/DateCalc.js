import React, { useState } from 'react';
import '../utils/PaymentCalc.css';

function DateCalculator() {

  const [dateType, setDateType] =
    useState('Meses');

  const [value, setValue] =
    useState('');

  const [futureDate, setFutureDate] =
    useState(null);

  /*
  ========================================
  INVERSE MODE
  ========================================
  */

  const [inverseMode, setInverseMode] =
    useState(false);

  const [targetMonth, setTargetMonth] =
    useState('');

  const [targetYear, setTargetYear] =
    useState('');

  const [inverseResult, setInverseResult] =
    useState(null);

  /*
  ========================================
  NORMAL MODE
  ========================================
  */

  function handleChangeDateType(event) {

    setDateType(
      event.target.value
    );

  }

  function handleChangeValue(event) {

    setValue(
      parseInt(
        event.target.value
      ) || ''
    );

  }

  function handleSubmit(event) {

    event.preventDefault();

    if (
      !value ||
      value < 0
    ) {

      setFutureDate(
        'Por favor ingresa un valor válido'
      );

      return;

    }

    const today =
      new Date();

    let future =
      new Date(today);

    if (
      dateType === 'Años'
    ) {

      future.setFullYear(
        today.getFullYear() + value
      );

    } else if (
      dateType === 'Meses'
    ) {

      future.setMonth(
        today.getMonth() + value
      );

    } else if (
      dateType === 'Días'
    ) {

      future.setDate(
        today.getDate() + value
      );

    } else {

      setFutureDate(
        'Tipo de dato inválido'
      );

      return;

    }

    if (
      isNaN(
        future.getTime()
      )
    ) {

      setFutureDate(
        'Fecha inválida'
      );

      return;

    }

    const options = {

      day: '2-digit',

      month: '2-digit',

      year: 'numeric'

    };

    setFutureDate(

      future.toLocaleDateString(
        'es-ES',
        options
      )

    );

  }

  /*
  ========================================
  RESET
  ========================================
  */

  const handleReset = () => {

    setDateType('Meses');

    setValue('');

    setFutureDate(null);

    setTargetMonth('');

    setTargetYear('');

    setInverseResult(null);

  };

  /*
  ========================================
  INVERSE CALC
  ========================================
  */

  const calculateInverseMonths = () => {

    if (
      !targetMonth ||
      !targetYear
    ) {

      setInverseResult(
        'Completa mes y año'
      );

      return;

    }

    const today =
      new Date();

    const currentMonth =
      today.getMonth() + 1;

    const currentYear =
      today.getFullYear();

    const totalCurrentMonths =
      currentYear * 12 +
      currentMonth;

    const totalTargetMonths =
      parseInt(targetYear) * 12 +
      parseInt(targetMonth);

    const difference =
      totalTargetMonths -
      totalCurrentMonths;

    if (difference < 0) {

      setInverseResult(
        'La fecha ya pasó'
      );

      return;

    }

    setInverseResult(
      `${difference} meses`
    );

  };

  return (

    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f9fafb',
        padding: '20px'
      }}
    >

      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          boxShadow:
            '0px 8px 24px rgba(0,0,0,0.1)',
          padding: '40px',
          maxWidth: '500px',
          width: '100%'
        }}
      >

        <h1
          style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            color: '#1f2937',
            textAlign: 'center',
            marginBottom: '30px'
          }}
        >

          {
            inverseMode
              ? '🔄 Calculadora Inversa'
              : '📅 Calculador de Fechas'
          }

        </h1>

        {
          !inverseMode ? (

            <form
              onSubmit={handleSubmit}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
              }}
            >

              <div>

                <label
                  style={{
                    display: 'block',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '8px',
                    fontSize: '0.95rem'
                  }}
                >
                  Tipo de cálculo:
                </label>

                <select
                  value={dateType}
                  onChange={
                    handleChangeDateType
                  }
                  style={{
                    width: '100%',
                    padding: '12px',
                    border:
                      '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '15px'
                  }}
                >

                  <option value="Años">
                    Años
                  </option>

                  <option value="Meses">
                    Meses
                  </option>

                  <option value="Días">
                    Días
                  </option>

                </select>

              </div>

              <div>

                <label
                  style={{
                    display: 'block',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '8px',
                    fontSize: '0.95rem'
                  }}
                >

                  Cantidad de {' '}
                  {dateType.toLowerCase()}:

                </label>

                <input
                  type="number"
                  value={value}
                  onChange={
                    handleChangeValue
                  }
                  placeholder="Ej: 12"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border:
                      '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '15px',
                    textAlign: 'right'
                  }}
                />

              </div>

              <div
                style={{
                  display: 'flex',
                  gap: '12px',
                  marginTop: '20px'
                }}
              >

                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor:
                      '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Calcular
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor:
                      '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Limpiar
                </button>

              </div>

            </form>

          ) : (

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
              }}
            >

              <div>

                <label
                  style={{
                    display: 'block',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '8px'
                  }}
                >
                  Mes:
                </label>

                <select
                  value={targetMonth}
                  onChange={(e) =>
                    setTargetMonth(
                      e.target.value
                    )
                  }
                  style={{
                    width: '100%',
                    padding: '12px',
                    border:
                      '2px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                >

                  <option value="">
                    Selecciona
                  </option>

                  {[
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre'
].map((mes, i) => (

  <option
    key={i + 1}
    value={i + 1}
  >
    {mes}
  </option>

))}

                </select>

              </div>

              <div>

                <label
                  style={{
                    display: 'block',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '8px'
                  }}
                >
                  Año:
                </label>

                <input
                  type="number"
                  placeholder="2027"
                  value={targetYear}
                  onChange={(e) =>
                    setTargetYear(
                      e.target.value
                    )
                  }
                  style={{
                    width: '100%',
                    padding: '12px',
                    border:
                      '2px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />

              </div>

              <button
                onClick={
                  calculateInverseMonths
                }
                style={{
                  padding: '12px',
                  backgroundColor:
                    '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Calcular Meses
              </button>

            </div>

          )
        }

        {/* ========================================
        TOGGLE BUTTON
        ======================================== */}

        <div
          style={{
            marginTop: '20px',
            textAlign: 'center'
          }}
        >

          <button
            onClick={() =>
              setInverseMode(
                !inverseMode
              )
            }
            style={{
              background:
                'transparent',
              border: 'none',
              color: '#10b981',
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '1rem'
            }}
          >

            {
              inverseMode
                ? '← Volver calculadora normal'
                : '🔄 Modo inverso'
            }

          </button>

        </div>

        {/* ========================================
        NORMAL RESULT
        ======================================== */}

        {
          futureDate &&
          !inverseMode && (

            <div
              style={{
                marginTop: '30px',
                padding: '20px',
                backgroundColor:
                  '#f0fdf4',
                border:
                  '2px solid #10b981',
                borderRadius: '8px',
                textAlign: 'center'
              }}
            >

              <p
                style={{
                  margin: 0,
                  fontSize: '0.95rem',
                  color: '#6b7280',
                  marginBottom: '8px'
                }}
              >
                La fecha resultante es:
              </p>

              <p
                style={{
                  margin: 0,
                  fontSize: '1.8rem',
                  fontWeight: '700',
                  color: '#10b981'
                }}
              >
                {futureDate}
              </p>

            </div>

          )
        }

        {/* ========================================
        INVERSE RESULT
        ======================================== */}

        {
          inverseResult &&
          inverseMode && (

            <div
              style={{
                marginTop: '30px',
                padding: '20px',
                backgroundColor:
                  '#f0fdf4',
                border:
                  '2px solid #10b981',
                borderRadius: '8px',
                textAlign: 'center'
              }}
            >

              <p
                style={{
                  margin: 0,
                  fontSize: '0.95rem',
                  color: '#6b7280',
                  marginBottom: '8px'
                }}
              >
                Faltan:
              </p>

              <p
                style={{
                  margin: 0,
                  fontSize: '2rem',
                  fontWeight: '700',
                  color: '#10b981'
                }}
              >
                {inverseResult}
              </p>

            </div>

          )
        }

      </div>

    </div>

  );

}

export default DateCalculator;