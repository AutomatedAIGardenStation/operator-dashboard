import React, { useEffect, useState, useMemo } from 'react';
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent } from '@ionic/react';
import { getSocket } from '../../hooks/useWebSocket';
import { getGantryPosition } from '../../api/gantry';
import type { GantryPosition } from '../../api/types';
import { usePlantsStore } from '../../store/plantsStore';

export const PlantGrid: React.FC = () => {
  const { plants } = usePlantsStore();
  const [gantryPosition, setGantryPosition] = useState<GantryPosition>({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    let mounted = true;

    const fetchInitialPosition = async () => {
      try {
        const pos = await getGantryPosition();
        if (mounted) {
          setGantryPosition(pos);
        }
      } catch (e) {
        console.error('Failed to fetch initial gantry position', e);
      }
    };
    void fetchInitialPosition();

    const socket = getSocket();
    if (!socket) return;

    function handlePosition(data: GantryPosition) {
      if (mounted) {
        setGantryPosition((prev) => ({ ...prev, ...data }));
      }
    }

    socket.on('gantry.position', handlePosition);

    return () => {
      mounted = false;
      socket.off('gantry.position', handlePosition);
    };
  }, []);

  const { maxX, maxY } = useMemo(() => {
    let max_x = gantryPosition.x;
    let max_y = gantryPosition.y;

    plants.forEach((plant) => {
      if (plant.location && plant.location.position) {
        max_x = Math.max(max_x, plant.location.position.x);
        max_y = Math.max(max_y, plant.location.position.y);
      }
    });

    // Add padding to prevent dots from rendering on the exact edge
    return {
      maxX: Math.max(max_x + 50, 100),
      maxY: Math.max(max_y + 50, 100),
    };
  }, [plants, gantryPosition]);

  return (
    <IonCard data-testid="plant-grid-card">
      <IonCardHeader>
        <IonCardTitle>2D Plant Grid</IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        <div
          data-testid="plant-grid-container"
          style={{
            position: 'relative',
            width: '100%',
            height: '300px',
            backgroundColor: '#f4f5f8',
            border: '1px solid #ccc',
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          {plants.map((plant) => {
            if (!plant.location?.position) return null;

            const left = `${(plant.location.position.x / maxX) * 100}%`;
            const top = `${(plant.location.position.y / maxY) * 100}%`;

            return (
              <div
                key={plant.id}
                data-testid={`plant-marker-${plant.id}`}
                style={{
                  position: 'absolute',
                  left,
                  top,
                  width: '12px',
                  height: '12px',
                  backgroundColor: '#2dd36f',
                  borderRadius: '50%',
                  transform: 'translate(-50%, -50%)',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                }}
                title={`${plant.name} (${plant.location.position.x}, ${plant.location.position.y})`}
              />
            );
          })}

          <div
            data-testid="gantry-marker"
            style={{
              position: 'absolute',
              left: `${(gantryPosition.x / maxX) * 100}%`,
              top: `${(gantryPosition.y / maxY) * 100}%`,
              width: '16px',
              height: '16px',
              backgroundColor: '#eb445a',
              borderRadius: '50%',
              transform: 'translate(-50%, -50%)',
              border: '2px solid white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
            }}
            title={`Robotic Arm (${gantryPosition.x}, ${gantryPosition.y})`}
          >
            <div style={{ width: '4px', height: '4px', backgroundColor: 'white', borderRadius: '50%' }} />
          </div>
        </div>
        <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem', fontSize: '0.85rem', color: '#666' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <div style={{ width: '10px', height: '10px', backgroundColor: '#2dd36f', borderRadius: '50%' }} />
            <span>Plant</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <div style={{ width: '10px', height: '10px', backgroundColor: '#eb445a', borderRadius: '50%' }} />
            <span>Robotic Arm</span>
          </div>
        </div>
      </IonCardContent>
    </IonCard>
  );
};
