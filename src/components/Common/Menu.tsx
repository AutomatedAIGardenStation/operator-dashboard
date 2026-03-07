import React from 'react';
import {
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonMenu,
  IonMenuToggle,
  IonNote,
} from '@ionic/react';
import { useLocation } from 'react-router-dom';
import { homeOutline, homeSharp, statsChartOutline, statsChartSharp, constructOutline, constructSharp, leafOutline, leafSharp, settingsOutline, settingsSharp, listOutline, listSharp } from 'ionicons/icons';

interface AppPage {
  url: string;
  iosIcon: string;
  mdIcon: string;
  title: string;
}

const appPages: AppPage[] = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    iosIcon: homeOutline,
    mdIcon: homeSharp,
  },
  {
    title: 'Monitoring',
    url: '/monitoring',
    iosIcon: statsChartOutline,
    mdIcon: statsChartSharp,
  },
  {
    title: 'Controls',
    url: '/controls',
    iosIcon: constructOutline,
    mdIcon: constructSharp,
  },
  {
    title: 'Plants',
    url: '/plants',
    iosIcon: leafOutline,
    mdIcon: leafSharp,
  },
  {
    title: 'Harvest Queue',
    url: '/harvest',
    iosIcon: listOutline,
    mdIcon: listSharp,
  },
  {
    title: 'Settings',
    url: '/settings',
    iosIcon: settingsOutline,
    mdIcon: settingsSharp,
  },
];

export const Menu: React.FC = () => {
  const location = useLocation();

  return (
    <IonMenu contentId="main" type="overlay">
      <IonContent>
        <IonList id="inbox-list" style={{ paddingTop: '50px' }}>
          <IonListHeader>GardenStation</IonListHeader>
          <IonNote>Operator Dashboard</IonNote>
          {appPages.map((appPage, index) => {
            return (
              <IonMenuToggle key={index} autoHide={false}>
                <IonItem
                  className={location.pathname === appPage.url ? 'selected' : ''}
                  routerLink={appPage.url}
                  routerDirection="none"
                  lines="none"
                  detail={false}
                >
                  <IonIcon aria-hidden="true" slot="start" ios={appPage.iosIcon} md={appPage.mdIcon} />
                  <IonLabel>{appPage.title}</IonLabel>
                </IonItem>
              </IonMenuToggle>
            );
          })}
        </IonList>
      </IonContent>
    </IonMenu>
  );
};
