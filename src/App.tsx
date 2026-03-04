import React from 'react';
import {
  IonApp,
  IonRouterOutlet,
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
  setupIonicReact,
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Route, Redirect } from 'react-router-dom';
import { home, statsChart, construct, leaf, settings } from 'ionicons/icons';

import { DashboardPage } from './components/Dashboard/DashboardPage';
import { MonitoringPage } from './components/Monitoring/MonitoringPage';
import { ControlsPage } from './components/Controls/ControlsPage';
import { PlantsPage } from './components/Plants/PlantsPage';
import { SettingsPage } from './components/Settings/SettingsPage';
import { LoginPage } from './components/Auth/LoginPage';
import { HarvestQueuePage } from './components/Harvest/HarvestQueuePage';
import { useWebSocket } from './hooks/useWebSocket';
import { usePushNotifications } from './hooks/usePushNotifications';

import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import './theme/variables.css';

setupIonicReact();

const App: React.FC = () => {
  useWebSocket();
  usePushNotifications();

  return (
    <IonApp>
      <IonReactRouter>
        <IonTabs>
          <IonRouterOutlet>
            <Route exact path="/dashboard" component={DashboardPage} />
            <Route exact path="/monitoring" component={MonitoringPage} />
            <Route exact path="/controls" component={ControlsPage} />
            <Route exact path="/plants" component={PlantsPage} />
            <Route exact path="/settings" component={SettingsPage} />
            <Route exact path="/harvest" component={HarvestQueuePage} />
            <Route exact path="/login" component={LoginPage} />
            <Redirect exact from="/" to="/dashboard" />
          </IonRouterOutlet>
          <IonTabBar slot="bottom">
            <IonTabButton tab="dashboard" href="/dashboard">
              <IonIcon icon={home} />
              <IonLabel>Dashboard</IonLabel>
            </IonTabButton>
            <IonTabButton tab="monitoring" href="/monitoring">
              <IonIcon icon={statsChart} />
              <IonLabel>Monitoring</IonLabel>
            </IonTabButton>
            <IonTabButton tab="controls" href="/controls">
              <IonIcon icon={construct} />
              <IonLabel>Controls</IonLabel>
            </IonTabButton>
            <IonTabButton tab="plants" href="/plants">
              <IonIcon icon={leaf} />
              <IonLabel>Plants</IonLabel>
            </IonTabButton>
            <IonTabButton tab="settings" href="/settings">
              <IonIcon icon={settings} />
              <IonLabel>Settings</IonLabel>
            </IonTabButton>
          </IonTabBar>
        </IonTabs>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
