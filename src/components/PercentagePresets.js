import React from 'react';
import { percentagePresets } from '../utils/projectManager';
import Swal from 'sweetalert2';

function PercentagePresets({ onApplyPreset }) {
  const handleApplyPreset = (preset) => {
    onApplyPreset(preset);
    Swal.fire({
      title: 'Preset aplicado',
      text: `Se han establecido los porcentajes: ${preset.signing}% - ${preset.building}% - ${preset.financial}%`,
      icon: 'success',
      confirmButtonText: 'OK',
      timer: 2000
    });
  };

  return (
    <div style={{
      marginBottom: '20px',
      backgroundColor: '#f0fdf4',
      padding: '15px',
      borderRadius: '8px',
      border: '1px solid #86efac'
    }}>
      <h4 style={{ marginTop: 0, marginBottom: '12px', color: '#166534' }}>
        ⚡ Presets de Porcentajes (Haz clic para rellenar)
      </h4>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '10px'
      }}>
        {percentagePresets.map((preset, index) => (
          <button
            key={index}
            onClick={() => handleApplyPreset(preset)}
            style={{
              padding: '12px',
              backgroundColor: '#white',
              border: '2px solid #10b981',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              color: '#059669',
              transition: 'all 0.3s ease',
              fontSize: '0.9rem',
              textAlign: 'left'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#d1fae5';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'white';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            <div>{preset.name}</div>
            <div style={{ fontSize: '0.8rem', marginTop: '4px', color: '#666' }}>
              {preset.signing}% • {preset.building}% • {preset.financial}%
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default PercentagePresets;
