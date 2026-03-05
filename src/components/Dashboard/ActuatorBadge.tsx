import React from 'react';
import { IonBadge } from '@ionic/react';

interface ActuatorBadgeProps {
  name: string;
  active: boolean;
}

export const ActuatorBadge: React.FC<ActuatorBadgeProps> = ({ name, active }) => {
  return (
    <IonBadge color={active ? 'success' : 'medium'} style={{ margin: '4px' }}>
      {name}: {active ? 'Active' : 'Idle'}
    </IonBadge>
  );
};
