import React from 'react';
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
} from '@ionic/react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface DataKeyConfig {
  key: string;
  color: string;
  name: string;
  yAxisId: string;
}

export interface SensorChartProps {
  title: string;
  data: any[];
  dataKeys: DataKeyConfig[];
}

export const SensorChart: React.FC<SensorChartProps> = ({ title, data, dataKeys }) => {
  // Determine if we need a right y-axis based on whether any config uses "right" as yAxisId
  const hasRightAxis = dataKeys.some((k) => k.yAxisId === 'right');

  return (
    <IonCard data-testid="sensor-chart">
      <IonCardHeader>
        <IonCardTitle>{title}</IonCardTitle>
      </IonCardHeader>
      <IonCardContent style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" />
            <YAxis yAxisId="left" orientation="left" />
            {hasRightAxis && <YAxis yAxisId="right" orientation="right" />}
            <Tooltip />
            <Legend />
            {dataKeys.map((k) => (
              <Line
                key={k.key}
                type="monotone"
                dataKey={k.key}
                name={k.name}
                stroke={k.color}
                yAxisId={k.yAxisId}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </IonCardContent>
    </IonCard>
  );
};
