import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import mapboxgl from 'mapbox-gl';
import { useEffect, useRef, useState } from 'react';
import { usePhotoGallery } from '../hooks/usePhotoGallery';
import './Tab2.css'; 
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = 'pk.eyJ1IjoiaGdycyIsImEiOiJjbWd0NjRiMG4wMHpzMmtxa2J6Z3ZmZDU2In0.DMtbtG-18hAPyVn6gon5xw';
mapboxgl.accessToken = MAPBOX_TOKEN;

const Tab2: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [isMapReady, setIsMapReady] = useState(false);

  const { photos } = usePhotoGallery();

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

      map.current.on('load', () => {
        setIsMapReady(true);
      });

      map.current.resize();
    }, 50);

    return () => {
      clearTimeout(timer);
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      map.current?.remove();
    };
  }, []);
  useEffect(() => {
    if (!map.current) return;

    const features = photos
      .filter((p) => p.location)
      .map((p, idx) => ({
        type: 'Feature',
        properties: {
          id: idx,
          webviewPath: p.webviewPath,
          date: p.date,
        },
        geometry: {
          type: 'Point',
          coordinates: [p.location!.lon, p.location!.lat],
        },
      }));

    const geojson = {
      type: 'FeatureCollection',
      features,
    } as GeoJSON.FeatureCollection<GeoJSON.Point>;

    const sourceId = 'photos';

    const mapRef = map.current;

  if (!mapRef.getSource(sourceId)) {
      mapRef.addSource(sourceId, {
        type: 'geojson',
        data: geojson,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      } as any);

      mapRef.addLayer({
        id: 'clusters',
        type: 'circle',
        source: sourceId,
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': '#00ff80',
          'circle-radius': ['step', ['get', 'point_count'], 20, 5, 25, 10, 30],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff',
        },
      } as any);

      mapRef.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: sourceId,
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-size': 12,
        },
        paint: {
          'text-color': '#000',
        },
      } as any);

      mapRef.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: sourceId,
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': '#51bbd6',
          'circle-radius': 8,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff',
        },
      } as any);

      const updateUnclusteredMarkers = () => {
        markersRef.current.forEach((m) => m.remove());
        markersRef.current = [];

        const unclustered = mapRef.queryRenderedFeatures({ layers: ['unclustered-point'] }) as any[];
        for (const f of unclustered) {
          const coords = (f.geometry as any).coordinates.slice();
          const props = f.properties || {};
          const el = document.createElement('div');
          el.className = 'photo-marker small';
          el.style.backgroundImage = `url(${props.webviewPath})`;

          const marker = new mapboxgl.Marker({ element: el })
            .setLngLat(coords)
            .addTo(mapRef);
            const html = `<div style="max-width:300px"><img class="popup-photo" src="${props.webviewPath}" style="width:100%;height:auto;border-radius:6px"/><div class="photo-info">${props.date ? new Date(props.date).toLocaleString() : ''}</div></div>`;
          marker.setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(html));
          markersRef.current.push(marker);
        }
      };

      mapRef.on('click', 'clusters', (e) => {
        const features = mapRef.queryRenderedFeatures(e.point, { layers: ['clusters'] });
        if (!features.length) return;
        const clusterId = features[0].properties?.cluster_id;
        if (clusterId == null) return;

        (mapRef.getSource(sourceId) as any).getClusterLeaves(clusterId, 100, 0, (err: any, leaves: any[]) => {
          if (err) return;
          const imgs = leaves.map((l) => ({
            src: l.properties.webviewPath,
            date: l.properties.date,
          }));

          let idx = 0;
          const container = document.createElement('div');
          container.className = 'cluster-popup';

          const imgEl = document.createElement('img');
          imgEl.className = 'popup-photo';
          imgEl.src = imgs[0].src || '';

          const info = document.createElement('div');
          info.className = 'photo-info';
          info.textContent = imgs[0].date ? new Date(imgs[0].date).toLocaleString() : '';

          const controls = document.createElement('div');
          controls.className = 'controls';
          controls.style.marginTop = '6px';

          const prev = document.createElement('button');
          prev.className = 'cluster-btn';
          prev.textContent = '◀';
          const next = document.createElement('button');
          next.className = 'cluster-btn';
          next.textContent = '▶';

          prev.onclick = () => {
            idx = (idx - 1 + imgs.length) % imgs.length;
            imgEl.src = imgs[idx].src || '';
            info.textContent = imgs[idx].date ? new Date(imgs[idx].date).toLocaleString() : '';
          };
          next.onclick = () => {
            idx = (idx + 1) % imgs.length;
            imgEl.src = imgs[idx].src || '';
            info.textContent = imgs[idx].date ? new Date(imgs[idx].date).toLocaleString() : '';
          };

          controls.appendChild(prev);
          controls.appendChild(next);

          container.appendChild(imgEl);
          info.className = 'photo-info';
          container.appendChild(info);
          container.appendChild(controls);

          const coordinates = (features[0].geometry as any).coordinates.slice();
          new mapboxgl.Popup({ offset: 25 }).setDOMContent(container).setLngLat(coordinates).addTo(mapRef);
        });
      });

      mapRef.on('click', 'unclustered-point', (e) => {
        const feature = e.features && e.features[0];
        if (!feature) return;
        const props = feature.properties || {};
          const html = `<div style="max-width:300px"><img class="popup-photo" src="${props.webviewPath}" style="width:100%;height:auto;border-radius:6px"/><div class="photo-info">${props.date ? new Date(props.date).toLocaleString() : ''}</div></div>`;
        const coords = (feature.geometry as any).coordinates.slice();
        new mapboxgl.Popup({ offset: 25 }).setLngLat(coords).setHTML(html).addTo(mapRef);
      });

      // update HTML markers initially and when viewport changes (cluster state can change)
      updateUnclusteredMarkers();
      mapRef.on('moveend', updateUnclusteredMarkers);
      mapRef.on('zoomend', updateUnclusteredMarkers);

      // change cursor
      mapRef.on('mouseenter', 'clusters', () => {
        mapRef.getCanvas().style.cursor = 'pointer';
      });
      mapRef.on('mouseleave', 'clusters', () => {
        mapRef.getCanvas().style.cursor = '';
      });
      mapRef.on('mouseenter', 'unclustered-point', () => {
        mapRef.getCanvas().style.cursor = 'pointer';
      });
      mapRef.on('mouseleave', 'unclustered-point', () => {
        mapRef.getCanvas().style.cursor = '';
      });
    } else {
      (mapRef.getSource(sourceId) as mapboxgl.GeoJSONSource).setData(geojson as any);

      setTimeout(() => {
        try {
          const unclustered = mapRef.queryRenderedFeatures({ layers: ['unclustered-point'] });
          markersRef.current.forEach((m) => m.remove());
          markersRef.current = [];
          for (const f of unclustered as any[]) {
            const coords = (f.geometry as any).coordinates.slice();
            const props = f.properties || {};
            const el = document.createElement('div');
            el.className = 'photo-marker';
            el.style.width = '36px';
            el.style.height = '36px';
            el.style.backgroundImage = `url(${props.webviewPath})`;
            el.style.backgroundSize = 'cover';
            el.style.borderRadius = '50%';
            el.style.border = '2px solid white';

            const marker = new mapboxgl.Marker({ element: el })
              .setLngLat(coords)
              .addTo(mapRef);
            const html = `<div style="max-width:240px"><img src="${props.webviewPath}" style="width:100%;height:auto;border-radius:6px"/><div style="font-size:12px;margin-top:6px">${props.date ? new Date(props.date).toLocaleString() : ''}</div></div>`;
            marker.setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(html));
            markersRef.current.push(marker);
          }
        } catch (e) {
        }
      }, 50);
    }
  }, [photos]);

  // Listen for global photosUpdated event so map refreshes when photos change elsewhere
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as any[] | undefined;
      const currentPhotos = detail ?? photos;
      if (!map.current) return;
      const mapRef = map.current;
      const sourceId = 'photos';

      const features = (currentPhotos || [])
        .filter((p: any) => p.location)
        .map((p: any, idx: number) => ({
          type: 'Feature',
          properties: { id: idx, webviewPath: p.webviewPath, date: p.date },
          geometry: { type: 'Point', coordinates: [p.location!.lon, p.location!.lat] },
        }));

      const geojson = { type: 'FeatureCollection', features } as GeoJSON.FeatureCollection<GeoJSON.Point>;

      try {
        const src = mapRef.getSource(sourceId) as mapboxgl.GeoJSONSource | undefined;
        if (src) {
          src.setData(geojson as any);
        } else {
          // if source missing, create it and layers will be added by the existing effect when photos changes
          mapRef.addSource(sourceId, { type: 'geojson', data: geojson, cluster: true, clusterMaxZoom: 14, clusterRadius: 50 } as any);
        }
        // refresh markers
        // call the same marker update by dispatching a tiny timeout to allow map to render
        setTimeout(() => {
          try {
            const unclustered = mapRef.queryRenderedFeatures({ layers: ['unclustered-point'] }) as any[];
            markersRef.current.forEach((m) => m.remove());
            markersRef.current = [];
            for (const f of unclustered) {
              const coords = (f.geometry as any).coordinates.slice();
              const props = f.properties || {};
              const el = document.createElement('div');
              el.className = 'photo-marker small';
              el.style.backgroundImage = `url(${props.webviewPath})`;
              const marker = new mapboxgl.Marker({ element: el }).setLngLat(coords).addTo(mapRef);
              const html = `<div style="max-width:300px"><img class="popup-photo" src="${props.webviewPath}" style="width:100%;height:auto;border-radius:6px"/><div class="photo-info">${props.date ? new Date(props.date).toLocaleString() : ''}</div></div>`;
              marker.setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(html));
              markersRef.current.push(marker);
            }
          } catch (err) {
            // ignore transient
          }
        }, 50);
      } catch (err) {
        // ignore
      }
    };

    window.addEventListener('photosUpdated', handler as EventListener);
    return () => window.removeEventListener('photosUpdated', handler as EventListener);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photos]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Carte interactive</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <div style={{ position: 'relative' }}>
          {!isMapReady && (
            <div className="map-loader">
              <div className="spinner" />
            </div>
          )}
          <div ref={mapContainer} className="map-container" />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Tab2;
