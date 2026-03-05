import React from 'react';
import { IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCardContent, IonProgressBar } from '@ionic/react';

interface SensorCardProps {
  title: string;
  value?: string | number | null;
  unit?: string;
  type?: 'default' | 'progress' | 'array';
  progress?: number;
  arrayValues?: number[];
}

export const SensorCard: React.FC<SensorCardProps> = ({ title, value, unit, type = 'default', progress, arrayValues }) => {
  return (
    <IonCard>
      <IonCardHeader>
        <IonCardSubtitle>{title}</IonCardSubtitle>
        {type === 'default' && (
          <IonCardTitle>
            {value !== undefined && value !== null ? value : '--'} {unit && unit}
          </IonCardTitle>
        )}
      </IonCardHeader>
      <IonCardContent>
        {type === 'progress' && (
          <>
            <div style={{ marginBottom: '8px', fontSize: '1.2em', fontWeight: 'bold' }}>
              {value !== undefined && value !== null ? value : '--'}{unit}
            </div>
            <IonProgressBar value={(progress || 0) / 100} />
          </>
        )}
        {type === 'array' && arrayValues && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {arrayValues.map((val, idx) => (
              <div key={idx} style={{ background: '#f4f5f8', padding: '4px 8px', borderRadius: '4px', fontSize: '0.9em' }}>
                Z{idx + 1}: {val}{unit}
              </div>
            ))}
            {arrayValues.length === 0 && <span>No data</span>}
          </div>
        )}
      </IonCardContent>
    </IonCard>
  );
};
