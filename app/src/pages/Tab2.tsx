import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import mapboxgl from 'mapbox-gl';
import { useEffect, useRef } from 'react';
import './Tab2.css'; 

// ton token Mapbox
const MAPBOX_TOKEN = 'pk.eyJ1IjoiaGdycyIsImEiOiJjbWd0NjRiMG4wMHpzMmtxa2J6Z3ZmZDU2In0.DMtbtG-18hAPyVn6gon5xw';
mapboxgl.accessToken = MAPBOX_TOKEN;

const Tab2: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    const timer = setTimeout(() => {
      if (map.current) return;

      map.current = new mapboxgl.Map({
        container: mapContainer.current!,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [5.4474, 43.5297],
        zoom: 10,
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      map.current.resize();
    }, 50);

    return () => {
      clearTimeout(timer);
      map.current?.remove();
    };
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Carte interactive</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <div
          ref={mapContainer}
          style={{
            width: '100%',
            height: '100%',
            minHeight: '100vh',
          }}
        />
      </IonContent>
    </IonPage>
  );
};

export default Tab2;
