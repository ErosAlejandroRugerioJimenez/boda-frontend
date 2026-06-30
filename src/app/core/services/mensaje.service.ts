import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MensajeService {

  // AQUÍ ESTÁ EL CAMBIO PRINCIPAL
  // Cambiamos 'http://localhost:8080/historial' por la ruta completa:
  private historialUrl = 'http://52.91.30.101:8080/api/mensajes/historial';
  
  // Te dejo también la de enviar, para que coincida con tu backend:
  private enviarUrl = 'http://52.91.30.101:8080/api/mensajes/enviar';

  constructor(private http: HttpClient) { }

  // Método para obtener el historial (el que te daba error 404)
  obtenerHistorial(): Observable<any[]> {
    return this.http.get<any[]>(this.historialUrl);
  }

  // Método para enviar el mensaje (por si acaso)
  enviarMensaje(mensaje: any): Observable<any> {
    return this.http.post<any>(this.enviarUrl, mensaje);
  }
}