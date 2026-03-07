import React, { useEffect, useState } from 'react';
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonSpinner,
  IonBadge,
} from '@ionic/react';
import { getSocket } from '../../hooks/useWebSocket';
import { dockTool, releaseTool, getCurrentTool } from '../../api/tools';
import type { ToolType } from '../../api/types';
import { useConfirmAction } from '../../hooks/useConfirmAction';

interface ToolPanelProps {
  disabled: boolean;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}

export const ToolPanel: React.FC<ToolPanelProps> = ({ disabled, onSuccess, onError }) => {
  const [loading, setLoading] = useState(false);
  const confirmAction = useConfirmAction();
  const [currentTool, setCurrentTool] = useState<ToolType>('NONE');
  const [selectedTool, setSelectedTool] = useState<ToolType>('CAMERA');

  useEffect(() => {
    const fetchTool = async () => {
      try {
        const { tool_type } = await getCurrentTool();
        setCurrentTool(tool_type);
      } catch (e) {
        console.error('Failed to fetch initial tool state', e);
      }
    };
    void fetchTool();

    const socket = getSocket();
    if (!socket) return;

    function handleToolUpdate(data: { tool_type: ToolType }) {
      setCurrentTool(data.tool_type);
    }

    socket.on('tool.update', handleToolUpdate);

    return () => {
      socket.off('tool.update', handleToolUpdate);
    };
  }, []);

  const handleDock = async () => {
    confirmAction(async () => {
      setLoading(true);
      try {
        await dockTool();
        onSuccess('Docking current tool');
      } catch {
        onError('Failed to dock tool');
      } finally {
        setLoading(false);
      }
    }, {
      header: 'Confirm Dock',
      message: 'Are you sure you want to dock the current tool?',
      color: 'danger',
      confirmText: 'Dock Tool',
    });
  };

  const handleRelease = async () => {
    confirmAction(async () => {
      setLoading(true);
      try {
        await releaseTool(selectedTool);
        onSuccess(`Releasing tool: ${selectedTool}`);
      } catch {
        onError('Failed to release tool');
      } finally {
        setLoading(false);
      }
    }, {
      header: 'Confirm Release',
      message: `Are you sure you want to release the ${selectedTool} tool?`,
    });
  };

  return (
    <IonCard>
      <IonCardHeader>
        <IonCardTitle>Tool Swap</IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <strong>Current Tool:</strong>
          <IonBadge color={currentTool !== 'NONE' ? 'primary' : 'medium'}>{currentTool}</IonBadge>
        </div>

        <IonItem>
          <IonLabel>Tool Selector</IonLabel>
          <IonSelect
            value={selectedTool}
            disabled={disabled || loading}
            onIonChange={(e) => setSelectedTool(e.detail.value)}
          >
            <IonSelectOption value="CAMERA">Camera</IonSelectOption>
            <IonSelectOption value="GRIPPER">Gripper</IonSelectOption>
            <IonSelectOption value="POLLINATOR">Pollinator</IonSelectOption>
            <IonSelectOption value="SCISSORS">Scissors</IonSelectOption>
          </IonSelect>
        </IonItem>

        <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
          <IonButton expand="block" onClick={handleRelease} disabled={disabled || loading}>
            {loading ? <IonSpinner name="dots" /> : 'Release'}
          </IonButton>
          <IonButton expand="block" color="danger" onClick={handleDock} disabled={disabled || loading}>
            {loading ? <IonSpinner name="dots" /> : 'Dock'}
          </IonButton>
        </div>
      </IonCardContent>
    </IonCard>
  );
};
