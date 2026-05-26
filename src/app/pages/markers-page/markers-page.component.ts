import {
  AfterViewInit,
  Component,
  ElementRef,
  signal,
  viewChild,
} from '@angular/core';
import mapboxgl, { LngLatLike } from 'mapbox-gl'; // or "const mapboxgl = require('mapbox-gl');"
import { environment } from '../../../environments/environment';
import { v4 as uuidV4 } from 'uuid';
import { JsonPipe } from '@angular/common';

mapboxgl.accessToken = environment.mapboxKey;

interface Marker {
  id: string;
  mapboxMarker: mapboxgl.Marker;
}

@Component({
  selector: 'app-markers-page',
  imports: [JsonPipe],
  templateUrl: './markers-page.component.html',
})
export class MarkersPageComponent implements AfterViewInit {
  divElement = viewChild<ElementRef>('map'); // referencia a este html, en vez de hacerlo por el document.querySelector
  map = signal<mapboxgl.Map | null>(null);
  markers = signal<Marker[]>([]);

  async ngAfterViewInit() {
    if (!this.divElement()?.nativeElement) return;

    await new Promise((resolve) => setTimeout(resolve, 80));

    const element = this.divElement()!.nativeElement;

    const map = new mapboxgl.Map({
      container: element, // container ID
      style: 'mapbox://styles/mapbox/streets-v12', // style URL
      center: [-90.406433, 15.4654], // starting position [lng, lat]
      zoom: 14, // starting zoom
    });

    // const marker = new mapboxgl.Marker({
    //   draggable: false,
    //   color: 'red',
    // }).setLngLat([-90.406433, 15.465400]).addTo(map);

    // marker.on('dragend', (event) => {
    //   console.log({event});
    // })

    this.mapListeners(map);
  }

  mapListeners(map: mapboxgl.Map) {
    // map.on('zoomend', (event) => {
    //   const newZoom = event.target.getZoom();
    //   this.zoom.set(newZoom);
    // });

    // map.on('moveend', () => {
    //   const center = map.getCenter();
    //   this.coordinates.set(center);
    // });

    // map.on('load', () => {
    //   console.log('map loader');
    // });

    // map.addControl(new mapboxgl.FullscreenControl());
    // map.addControl(new mapboxgl.NavigationControl());
    // map.addControl(new mapboxgl.ScaleControl());

    map.on('click', (event) => {
      this.mapClick(event); // no se puede abreviar, quitando las llaves por el this
    });

    this.map.set(map);
  }

  mapClick(event: mapboxgl.MapMouseEvent) {
    if (!this.map()) return;

    const map = this.map()!;

    const color = '#xxxxxx'.replace(/x/g, (y) =>
      ((Math.random() * 16) | 0).toString(16),
    );

    const coords = event.lngLat;

    const marker = new mapboxgl.Marker({
      color: color,
    })
      .setLngLat(coords)
      .addTo(map);

    const newMarker: Marker = {
      id: uuidV4(), //crypto.randomUUID()
      mapboxMarker: marker,
    };

    // this.markers.set([newMarker, ...this.markers()]);
    this.markers.update((markers) => [newMarker, ...markers]);

    console.log(this.markers());
  }

  flyToMarker(lngLat: LngLatLike) {
    if (!this.map()) return;

    this.map()?.flyTo({
      center: lngLat,
    });
  }

  deleteMarker(marker: Marker) {
    if (!this.map()) return;

    const map = this.map()!;
    marker.mapboxMarker.remove();

    this.markers.set(this.markers().filter((m) => m.id !== marker.id));
  }
}
