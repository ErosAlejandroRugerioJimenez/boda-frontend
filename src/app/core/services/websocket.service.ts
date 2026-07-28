import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RxStomp } from '@stomp/rx-stomp';
import { map } from 'rxjs/operators';
import { EMPTY } from 'rxjs'; 

@Injectable({ providedIn: 'root' })
export class WebsocketService {
  private rxStomp: RxStomp;
  private isBrowser: boolean;

  // Inyectamos PLATFORM_ID para saber si estamos en Node.js o en Chrome
  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.rxStomp = new RxStomp();

    // ¡La magia! Solo activamos el WebSocket si estamos en un navegador real
   if (this.isBrowser) {
      // 1. Detectamos automáticamente si estamos en HTTP o HTTPS
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';

      this.rxStomp.configure({
        // 2. Armamos la URL usando el protocolo correcto
        brokerURL: `${wsProtocol}//${window.location.host}/ws-boda`,
        
        reconnectDelay: 5000, 
        heartbeatIncoming: 20000,
        heartbeatOutgoing: 20000,
      });
      this.rxStomp.activate();
    }
  }

  escucharSaludos() {
    // Si Angular está renderizando en el servidor, devolvemos un vacío para evitar el crash
    if (!this.isBrowser) {
      return EMPTY; 
    }

    // Si estamos en la pantalla del DJ (navegador), escuchamos los mensajes
    // (Asegúrate de que el backend esté enviando los mensajes a '/topic/saludos')
    return this.rxStomp.watch('/topic/saludos').pipe(
      map((message) => JSON.parse(message.body))
    );
  }
}