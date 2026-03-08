import React, { useEffect, useState } from 'react';
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonSpinner,
  IonText,
  IonProgressBar
} from '@ionic/react';

// Mocks the shape of future yield prediction data
export interface YieldPrediction {
  plantId: number;
  plantName: string;
  expectedYieldKg: number;
  confidence: number;
  harvestDateEst: string;
}

// Scaffold data hook contract
export const useYieldData = () => {
  const [data, setData] = useState<YieldPrediction[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, _setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate an API call latency for MVP visualization
    const timer = setTimeout(() => {
      setData([
        {
          plantId: 1,
          plantName: 'Tomato - Alpha',
          expectedYieldKg: 4.2,
          confidence: 0.85,
          harvestDateEst: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] || '',
        },
        {
          plantId: 2,
          plantName: 'Lettuce - Beta',
          expectedYieldKg: 1.1,
          confidence: 0.92,
          harvestDateEst: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] || '',
        }
      ]);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return { data, loading, error };
};

export const YieldPredictor: React.FC = () => {
  const { data, loading, error } = useYieldData();

  return (
    <IonCard>
      <IonCardHeader>
        <IonCardTitle>Yield Predictor (MVP)</IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        {loading ? (
          <div className="ion-text-center">
            <IonSpinner name="crescent" />
            <p>Loading predictions...</p>
          </div>
        ) : error ? (
          <IonText color="danger">{error}</IonText>
        ) : data && data.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data.map((prediction) => (
              <div key={prediction.plantId}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <strong>{prediction.plantName}</strong>
                  <span>{prediction.expectedYieldKg} kg</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8em', color: 'gray', marginBottom: '4px' }}>
                  <span>Est. Harvest: {prediction.harvestDateEst}</span>
                  <span>{(prediction.confidence * 100).toFixed(0)}% Confidence</span>
                </div>
                <IonProgressBar
                  value={prediction.confidence}
                  color={prediction.confidence > 0.8 ? 'success' : 'warning'}
                />
              </div>
            ))}
          </div>
        ) : (
          <IonText color="medium">No yield predictions available.</IonText>
        )}
      </IonCardContent>
    </IonCard>
  );
};
