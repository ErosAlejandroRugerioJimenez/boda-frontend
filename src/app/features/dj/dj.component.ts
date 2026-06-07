import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { MensajeService } from '../../core/services/mensaje.service';
import { WebsocketService } from '../../core/services/websocket.service';

@Component({
  selector: 'app-dj',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dj.component.html',
  styleUrl: './dj.component.css'
})
export class DjComponent implements OnInit {
  private mensajeService = inject(MensajeService);
  private wsService = inject(WebsocketService);
  private cdr = inject(ChangeDetectorRef);
  fotoExpandida: string | null = null;


 abrirFoto(url: string) {
    this.fotoExpandida = url;
    this.cdr.detectChanges(); // 👈 ¡El empujón mágico!
  }

  cerrarFoto() {
    this.fotoExpandida = null;
    this.cdr.detectChanges(); // 👈 ¡El empujón mágico!
  }

  saludos: any[] = [];

  ngOnInit() {
    // Cargar historial inicial
    this.mensajeService.obtenerHistorial().subscribe({ 
      next: (data: any[]) => {                        
        this.saludos = data;
        this.cdr.detectChanges(); // Refrescar pantalla
      },
      error: (err: any) => {                          
        console.error('Error al cargar historial', err);
      }
    });

    // Escuchar nuevos mensajes
    this.wsService.escucharSaludos().subscribe({
      next: (nuevoSaludo: any) => {                    
        this.saludos.unshift(nuevoSaludo); // Agregamos el mensaje al principio de la lista
        this.cdr.detectChanges(); // ¡ANGULAR, DIBUJA EL NUEVO MENSAJE YA!
      },
      error: (err: any) => {
        console.error('Error al recibir mensaje nuevo', err);
      }
    });
  }

  // ========================================================
  // 🎛️ HERRAMIENTAS DE MODERACIÓN DEL DJ
  // ========================================================

  // 1. Cambia el estado visual del mensaje (Leído / No leído)
  marcarVisto(mensaje: any) {
    // Si no tiene la propiedad 'leido', Angular la crea. Si la tiene, la invierte.
    mensaje.leido = !mensaje.leido; 
  }

  // 2. Elimina el mensaje solo de la pantalla del DJ (No toca la Base de Datos)
  // Elimina el mensaje con una animación suave
 // Elimina el mensaje con una animación suave y redibuja la lista
  borrarMensaje(index: number, mensaje: any) {
    // 1. Disparamos la animación CSS
    mensaje.eliminando = true;

    // 2. Esperamos a que termine la animación
    setTimeout(() => {
      
      // 3. Buscamos en qué posición quedó el mensaje REALMENTE en este momento
      const posicionReal = this.saludos.indexOf(mensaje);
      
      if (posicionReal !== -1) {
        // Lo sacamos de la lista
        this.saludos.splice(posicionReal, 1);
        
        // 4. ¡EL TRUCO! Le avisamos a Angular que la lista cambió para que quite el hueco
        this.cdr.detectChanges(); 
      }
      
    }, 400); // 400ms es el tiempo que dura tu animación
  }
  // ==========================================
  // VARIABLES Y FUNCIONES PARA EL MODAL DE LIMPIEZA
  // ==========================================
  mostrarModalLimpiar: boolean = false;

  abrirModalLimpiar() {
    this.mostrarModalLimpiar = true;
  }

  cerrarModalLimpiar() {
    this.mostrarModalLimpiar = false;
  }

  confirmarLimpiarTablero() {
    this.saludos = []; // Vacía la pantalla
    this.mostrarModalLimpiar = false; // Cierra el modal
    this.cdr.detectChanges(); // Actualiza la vista
  }
 
}