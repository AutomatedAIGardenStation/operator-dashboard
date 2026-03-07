import { useIonAlert } from '@ionic/react';
import { useCallback } from 'react';

interface ConfirmOptions {
  header?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  color?: string;
}

export const useConfirmAction = () => {
  const [presentAlert] = useIonAlert();

  const confirmAction = useCallback(
    (action: () => void | Promise<void>, options: ConfirmOptions) => {
      presentAlert({
        header: options.header || 'Confirm Action',
        message: options.message,
        buttons: [
          {
            text: options.cancelText || 'Cancel',
            role: 'cancel',
            handler: () => {
              // Cancel branch with zero side effects
            },
          },
          {
            text: options.confirmText || 'Confirm',
            role: 'confirm',
            handler: action,
            cssClass: options.color === 'danger' ? 'alert-button-danger' : '',
          },
        ],
      });
    },
    [presentAlert]
  );

  return confirmAction;
};
