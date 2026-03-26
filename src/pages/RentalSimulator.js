import React, { useState } from 'react';
import '../utils/PaymentCalc.css';
import Swal from 'sweetalert2';

function RentalSimulator() {
  const [propertyPrice, setPropertyPrice] = useState('');
  const [rentalType, setRentalType] = useState('fijo');
  const [monthlyRent, setMonthlyRent] = useState('');
  const [pricePerNight, setPricePerNight] = useState('');
  const [occupancyRate, setOccupancyRate] = useState(65);
  
  // Gastos
  const [maintenance, setMaintenance] = useState('');
  const [administration, setAdministration] = useState('');
  const [cleaning, setCleaning] = useState('');
  const [utilities, setUtilities] = useState('');
  const [taxes, setTaxes] = useState('');
  const [insurance, setInsurance] = useState('');
  
  // Financiamiento
  const [hasFinancing, setHasFinancing] = useState(false);
  const [monthlyPayment, setMonthlyPayment] = useState('');
  
  const [results, setResults] = useState(null);
  const [comparisonResults, setComparisonResults] = useState(null);

  const calculateResults = () => {
    if (!propertyPrice) {
      Swal.fire({
        title: 'Error',
        text: 'Por favor ingresa el precio de la propiedad.',
        icon: 'error'
      });
      return;
    }

    const property = parseInt(propertyPrice);
    const maintenanceCost = parseInt(maintenance) || 0;
    const adminCost = parseInt(administration) || 0;
    const cleaningCost = parseInt(cleaning) || 0;
    const utilitiesCost = parseInt(utilities) || 0;
    const taxesCost = parseInt(taxes) || 0;
    const insuranceCost = parseInt(insurance) || 0;
    
    const totalMonthlyExpenses = maintenanceCost + adminCost + cleaningCost + utilitiesCost + taxesCost + insuranceCost;
    
    let grossMonthlyIncome = 0;
    let scenarioName = '';
    
    if (rentalType === 'fijo') {
      grossMonthlyIncome = parseInt(monthlyRent) || 0;
      scenarioName = 'Renta Fija';
    } else {
      const nightPrice = parseInt(pricePerNight) || 0;
      const daysOccupied = Math.round((30 * occupancyRate) / 100);
      grossMonthlyIncome = nightPrice * daysOccupied;
      scenarioName = `Airbnb (${occupancyRate}% ocupación)`;
    }
    
    const netMonthlyIncome = grossMonthlyIncome - totalMonthlyExpenses;
    const annualIncome = netMonthlyIncome * 12;
    
    let finalMonthlyIncome = netMonthlyIncome;
    if (hasFinancing) {
      finalMonthlyIncome -= (parseInt(monthlyPayment) || 0);
    }
    
    const finalAnnualIncome = finalMonthlyIncome * 12;
    const roi = property > 0 ? ((annualIncome / property) * 100).toFixed(2) : 0;
    
    const result = {
      scenarioName,
      grossMonthlyIncome: Math.round(grossMonthlyIncome),
      totalExpenses: totalMonthlyExpenses,
      netMonthlyIncome: Math.round(netMonthlyIncome),
      annualIncome: Math.round(annualIncome),
      monthlyFinancing: hasFinancing ? parseInt(monthlyPayment) || 0 : 0,
      finalMonthlyIncome: Math.round(finalMonthlyIncome),
      finalAnnualIncome: Math.round(finalAnnualIncome),
      roi: roi,
      cashFlow: finalMonthlyIncome > 0 ? 'Positivo ✅' : 'Negativo ⚠️'
    };
    
    setResults(result);
    calculateComparison(property, totalMonthlyExpenses);
  };

  const calculateComparison = (property, expenses) => {
    // Scenario 1: Fixed Rent
    const fixedRent = parseInt(monthlyRent) || 0;
    const fixedNet = fixedRent - expenses;
    const fixedAnnual = fixedNet * 12;
    const fixedROI = property > 0 ? ((fixedAnnual / property) * 100).toFixed(2) : 0;

    // Scenario 2: Airbnb
    const nightPrice = parseInt(pricePerNight) || 0;
    const daysOccupied = Math.round((30 * occupancyRate) / 100);
    const airbnbGross = nightPrice * daysOccupied;
    const airbnbNet = airbnbGross - expenses;
    const airbnbAnnual = airbnbNet * 12;
    const airbnbROI = property > 0 ? ((airbnbAnnual / property) * 100).toFixed(2) : 0;

    const comparison = {
      fixed: {
        name: 'Renta Fija',
        monthly: Math.round(fixedNet),
        annual: Math.round(fixedAnnual),
        roi: fixedROI,
        pros: ['Más estable', 'Menos trabajo', 'Inquilino comprometido'],
        cons: ['Menos ingresos potenciales']
      },
      airbnb: {
        name: 'Airbnb / Corta Duración',
        monthly: Math.round(airbnbNet),
        annual: Math.round(airbnbAnnual),
        roi: airbnbROI,
        pros: ['Más ingresos', 'Mayor flexibilidad', 'Mejor ROI'],
        cons: ['Más gestión', 'Riesgo de ocupación', 'Más desgaste']
      }
    };

    // Calculate difference
    const difference = comparison.airbnb.annual - comparison.fixed.annual;
    const percentDifference = ((difference / comparison.fixed.annual) * 100).toFixed(1);

    setComparisonResults({ ...comparison, difference, percentDifference });
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px',
      backgroundColor: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
      minHeight: '100vh'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        boxShadow: '0px 20px 40px rgba(0,0,0,0.08)',
        padding: '20px',
        width: '100%',
        maxWidth: '900px'
      }}>
        <h1 style={{
          fontSize: 'clamp(1.5rem, 5vw, 2.5rem)',
          fontWeight: '700',
          color: '#1f2937',
          textAlign: 'center',
          marginBottom: '30px'
        }}>
          📊 Simulador de Ingresos por Alquiler
        </h1>

        {/* Información Básica */}
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: 'clamp(1.1rem, 3vw, 1.3rem)', color: '#10b981', marginBottom: '15px' }}>
            📍 Información Básica
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px'
          }}>
            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px', color: '#374151' }}>
                Precio de la Propiedad:
              </label>
              <input
                type="number"
                value={propertyPrice}
                onChange={(e) => setPropertyPrice(e.target.value)}
                placeholder="Ej: 250000"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px', color: '#374151' }}>
                Tipo de Alquiler:
              </label>
              <select value={rentalType} onChange={(e) => setRentalType(e.target.value)}>
                <option value="fijo">Renta Fija</option>
                <option value="corta">Renta Corta (Airbnb)</option>
                <option value="ambos">Ambos (para comparar)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Ingresos */}
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: 'clamp(1.1rem, 3vw, 1.3rem)', color: '#10b981', marginBottom: '15px' }}>
            💰 Ingresos
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px'
          }}>
            {(rentalType === 'fijo' || rentalType === 'ambos') && (
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px', color: '#374151' }}>
                  Renta Mensual:
                </label>
                <input
                  type="number"
                  value={monthlyRent}
                  onChange={(e) => setMonthlyRent(e.target.value)}
                  placeholder="Ej: 1200"
                />
              </div>
            )}

            {(rentalType === 'corta' || rentalType === 'ambos') && (
              <>
                <div>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px', color: '#374151' }}>
                    Precio por Noche:
                  </label>
                  <input
                    type="number"
                    value={pricePerNight}
                    onChange={(e) => setPricePerNight(e.target.value)}
                    placeholder="Ej: 100"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px', color: '#374151' }}>
                    Ocupación: {occupancyRate}%
                  </label>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    value={occupancyRate}
                    onChange={(e) => setOccupancyRate(parseInt(e.target.value))}
                    style={{ width: '100%', cursor: 'pointer' }}
                  />
                  <small style={{ color: '#6b7280' }}>
                    ~{Math.round((30 * occupancyRate) / 100)} días ocupados al mes
                  </small>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Gastos */}
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: 'clamp(1.1rem, 3vw, 1.3rem)', color: '#10b981', marginBottom: '15px' }}>
            💸 Gastos Mensuales
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '15px'
          }}>
            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px', color: '#374151', fontSize: 'clamp(0.85rem, 2vw, 1rem)' }}>
                Mantenimiento:
              </label>
              <input type="number" value={maintenance} onChange={(e) => setMaintenance(e.target.value)} placeholder="0" />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px', color: '#374151', fontSize: 'clamp(0.85rem, 2vw, 1rem)' }}>
                Administración:
              </label>
              <input type="number" value={administration} onChange={(e) => setAdministration(e.target.value)} placeholder="0" />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px', color: '#374151', fontSize: 'clamp(0.85rem, 2vw, 1rem)' }}>
                Limpieza:
              </label>
              <input type="number" value={cleaning} onChange={(e) => setCleaning(e.target.value)} placeholder="0" />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px', color: '#374151', fontSize: 'clamp(0.85rem, 2vw, 1rem)' }}>
                Servicios:
              </label>
              <input type="number" value={utilities} onChange={(e) => setUtilities(e.target.value)} placeholder="0" />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px', color: '#374151', fontSize: 'clamp(0.85rem, 2vw, 1rem)' }}>
                Impuestos:
              </label>
              <input type="number" value={taxes} onChange={(e) => setTaxes(e.target.value)} placeholder="0" />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px', color: '#374151', fontSize: 'clamp(0.85rem, 2vw, 1rem)' }}>
                Seguro:
              </label>
              <input type="number" value={insurance} onChange={(e) => setInsurance(e.target.value)} placeholder="0" />
            </div>
          </div>
        </div>

        {/* Financiamiento */}
        <div style={{ marginBottom: '30px', padding: '15px', backgroundColor: '#f0fdf4', borderRadius: '8px', borderLeft: '4px solid #10b981' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: '600' }}>
            <input
              type="checkbox"
              checked={hasFinancing}
              onChange={(e) => setHasFinancing(e.target.checked)}
            />
            🏦 Incluir Cuota de Financiamiento
          </label>
          
          {hasFinancing && (
            <div style={{ marginTop: '15px' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px', color: '#374151' }}>
                Cuota Mensual del Banco:
              </label>
              <input
                type="number"
                value={monthlyPayment}
                onChange={(e) => setMonthlyPayment(e.target.value)}
                placeholder="Ej: 1500"
              />
            </div>
          )}
        </div>

        {/* Botón Calcular */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <button
            onClick={calculateResults}
            style={{
              padding: '14px 28px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: 'clamp(0.9rem, 2vw, 1rem)',
              cursor: 'pointer',
              boxShadow: '0px 4px 12px rgba(16, 185, 129, 0.3)',
              transition: 'all 0.3s ease'
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
            📈 Calcular Simulación
          </button>
        </div>

        {/* Resultados */}
        {results && (
          <div style={{
            backgroundColor: '#f0fdf4',
            border: '2px solid #10b981',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '30px'
          }}>
            <h3 style={{ color: '#10b981', marginTop: 0, textAlign: 'center', fontSize: 'clamp(1.1rem, 3vw, 1.3rem)' }}>
              📊 Resultados - {results.scenarioName}
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '15px',
              marginTop: '20px'
            }}>
              <div style={{
                backgroundColor: '#ffffff',
                padding: '15px',
                borderRadius: '8px',
                border: '1px solid #d1fae5'
              }}>
                <p style={{ margin: '0 0 5px 0', color: '#6b7280', fontSize: 'clamp(0.85rem, 2vw, 0.9rem)' }}>Ingreso Bruto Mensual</p>
                <p style={{ margin: 0, fontSize: 'clamp(1.3rem, 4vw, 1.8rem)', fontWeight: '700', color: '#10b981' }}>
                  US${results.grossMonthlyIncome.toLocaleString()}
                </p>
              </div>

              <div style={{
                backgroundColor: '#ffffff',
                padding: '15px',
                borderRadius: '8px',
                border: '1px solid #d1fae5'
              }}>
                <p style={{ margin: '0 0 5px 0', color: '#6b7280', fontSize: 'clamp(0.85rem, 2vw, 0.9rem)' }}>Gastos Mensuales</p>
                <p style={{ margin: 0, fontSize: 'clamp(1.3rem, 4vw, 1.8rem)', fontWeight: '700', color: '#ef4444' }}>
                  -US${results.totalExpenses.toLocaleString()}
                </p>
              </div>

              <div style={{
                backgroundColor: '#ffffff',
                padding: '15px',
                borderRadius: '8px',
                border: '2px solid #10b981'
              }}>
                <p style={{ margin: '0 0 5px 0', color: '#6b7280', fontSize: 'clamp(0.85rem, 2vw, 0.9rem)' }}>Ingreso Neto Mensual</p>
                <p style={{ margin: 0, fontSize: 'clamp(1.3rem, 4vw, 1.8rem)', fontWeight: '700', color: '#10b981' }}>
                  US${results.netMonthlyIncome.toLocaleString()}
                </p>
              </div>

              {hasFinancing && (
                <div style={{
                  backgroundColor: '#ffffff',
                  padding: '15px',
                  borderRadius: '8px',
                  border: '1px solid #fca5a5'
                }}>
                  <p style={{ margin: '0 0 5px 0', color: '#6b7280', fontSize: 'clamp(0.85rem, 2vw, 0.9rem)' }}>Menos Cuota Banco</p>
                  <p style={{ margin: 0, fontSize: 'clamp(1.3rem, 4vw, 1.8rem)', fontWeight: '700', color: '#ef4444' }}>
                    -US${results.monthlyFinancing.toLocaleString()}
                  </p>
                </div>
              )}

              {hasFinancing && (
                <div style={{
                  backgroundColor: '#ffffff',
                  padding: '15px',
                  borderRadius: '8px',
                  border: '2px solid #3b82f6'
                }}>
                  <p style={{ margin: '0 0 5px 0', color: '#6b7280', fontSize: 'clamp(0.85rem, 2vw, 0.9rem)' }}>Flujo Real Mensual</p>
                  <p style={{ margin: 0, fontSize: 'clamp(1.3rem, 4vw, 1.8rem)', fontWeight: '700', color: '#3b82f6' }}>
                    US${results.finalMonthlyIncome.toLocaleString()}
                  </p>
                </div>
              )}

              <div style={{
                backgroundColor: '#ffffff',
                padding: '15px',
                borderRadius: '8px',
                border: '1px solid #d1fae5'
              }}>
                <p style={{ margin: '0 0 5px 0', color: '#6b7280', fontSize: 'clamp(0.85rem, 2vw, 0.9rem)' }}>Ganancia Anual</p>
                <p style={{ margin: 0, fontSize: 'clamp(1.3rem, 4vw, 1.8rem)', fontWeight: '700', color: '#10b981' }}>
                  US${results.annualIncome.toLocaleString()}
                </p>
              </div>

              <div style={{
                backgroundColor: '#ffffff',
                padding: '15px',
                borderRadius: '8px',
                border: '1px solid #d1fae5'
              }}>
                <p style={{ margin: '0 0 5px 0', color: '#6b7280', fontSize: 'clamp(0.85rem, 2vw, 0.9rem)' }}>ROI Aproximado</p>
                <p style={{ margin: 0, fontSize: 'clamp(1.3rem, 4vw, 1.8rem)', fontWeight: '700', color: '#f59e0b' }}>
                  {results.roi}%
                </p>
              </div>

              <div style={{
                backgroundColor: '#ffffff',
                padding: '15px',
                borderRadius: '8px',
                border: '2px solid #10b981'
              }}>
                <p style={{ margin: '0 0 5px 0', color: '#6b7280', fontSize: 'clamp(0.85rem, 2vw, 0.9rem)' }}>Flujo de Caja</p>
                <p style={{ margin: 0, fontSize: 'clamp(1.3rem, 4vw, 1.8rem)', fontWeight: '700', color: results.cashFlow.includes('Positivo') ? '#10b981' : '#ef4444' }}>
                  {results.cashFlow}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Comparación */}
        {comparisonResults && rentalType === 'ambos' && (
          <div style={{
            backgroundColor: '#fef3c7',
            border: '2px solid #f59e0b',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <h3 style={{ color: '#92400e', marginTop: 0, textAlign: 'center', fontSize: 'clamp(1.1rem, 3vw, 1.3rem)' }}>
              🔄 Comparación: Renta Fija vs Airbnb
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px',
              marginTop: '20px'
            }}>
              {['fixed', 'airbnb'].map((type) => (
                <div key={type} style={{
                  backgroundColor: '#ffffff',
                  padding: '20px',
                  borderRadius: '8px',
                  border: type === 'airbnb' ? '3px solid #f59e0b' : '1px solid #e5e7eb'
                }}>
                  <h4 style={{ margin: '0 0 15px 0', color: type === 'airbnb' ? '#f59e0b' : '#6b7280', fontSize: 'clamp(1rem, 2vw, 1.1rem)' }}>
                    {comparisonResults[type].name}
                    {type === 'airbnb' && ' ⭐'}
                  </h4>

                  <div style={{ marginBottom: '15px' }}>
                    <p style={{ margin: '5px 0', color: '#374151', fontWeight: '600' }}>
                      Ingreso Neto: <span style={{ color: '#10b981' }}>US${comparisonResults[type].monthly.toLocaleString()}/mes</span>
                    </p>
                    <p style={{ margin: '5px 0', color: '#374151', fontWeight: '600' }}>
                      Anual: <span style={{ color: '#10b981' }}>US${comparisonResults[type].annual.toLocaleString()}</span>
                    </p>
                    <p style={{ margin: '5px 0', color: '#374151', fontWeight: '600' }}>
                      ROI: <span style={{ color: '#f59e0b' }}>{comparisonResults[type].roi}%</span>
                    </p>
                  </div>

                  <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '15px' }}>
                    <p style={{ margin: '5px 0 10px 0', color: '#6b7280', fontWeight: '600', fontSize: 'clamp(0.85rem, 2vw, 0.9rem)' }}>
                      {type === 'fixed' ? 'Ventajas:' : 'Ventajas:'}
                    </p>
                    <ul style={{ margin: '0 0 10px 0', paddingLeft: '20px', color: '#10b981', fontSize: 'clamp(0.8rem, 2vw, 0.9rem)' }}>
                      {comparisonResults[type].pros.map((pro, i) => (
                        <li key={i}>{pro}</li>
                      ))}
                    </ul>

                    <p style={{ margin: '10px 0 5px 0', color: '#6b7280', fontWeight: '600', fontSize: 'clamp(0.85rem, 2vw, 0.9rem)' }}>
                      Desventajas:
                    </p>
                    <ul style={{ margin: 0, paddingLeft: '20px', color: '#ef4444', fontSize: 'clamp(0.8rem, 2vw, 0.9rem)' }}>
                      {comparisonResults[type].cons.map((con, i) => (
                        <li key={i}>{con}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

            {comparisonResults.difference !== 0 && (
              <div style={{
                marginTop: '20px',
                padding: '15px',
                backgroundColor: '#f0fdf4',
                borderRadius: '8px',
                textAlign: 'center',
                color: comparisonResults.difference > 0 ? '#10b981' : '#ef4444'
              }}>
                <p style={{ margin: 0, fontWeight: '700', fontSize: 'clamp(1rem, 2vw, 1.2rem)' }}>
                  Airbnb genera <strong>US${Math.abs(comparisonResults.difference).toLocaleString()}</strong> más al año
                  </p>
                <p style={{ margin: '5px 0 0 0', fontSize: 'clamp(0.85rem, 2vw, 0.95rem)' }}>
                  ({comparisonResults.percentDifference}% más que renta fija)
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default RentalSimulator;
