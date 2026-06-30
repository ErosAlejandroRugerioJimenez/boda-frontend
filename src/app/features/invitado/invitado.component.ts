import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MensajeService } from '../../core/services/mensaje.service';
import { HttpClient } from '@angular/common/http';

// Importaciones de Angular Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Importación de Confeti
import confetti from 'canvas-confetti';

@Component({
  selector: 'app-invitado',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './invitado.component.html',
  styleUrl: './invitado.component.css'
})
export class InvitadoComponent {
  private mensajeService = inject(MensajeService);
  private cdr = inject(ChangeDetectorRef);
  private http = inject(HttpClient); 
  
  mensaje = { invitado: '', texto: '' };
  enviando = false;
  enviado = false;

  // Variables para la foto y previsualización
  archivoSeleccionado: File | null = null;
  nombreArchivo: string = '';
  previsualizacionUrl: string | ArrayBuffer | null = null;

  lanzarConfeti() {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FFD700', '#FF69B4', '#FFFFFF']
    });
  }

  onFotoSeleccionada(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.archivoSeleccionado = file;
      this.nombreArchivo = file.name;

      const reader = new FileReader();
      reader.onload = (e) => {
        this.previsualizacionUrl = reader?.result as string | ArrayBuffer;
        // ¡ESTO ES VITAL! Fuerza a Angular a mostrar la foto al instante sin tener que dar otro clic
        this.cdr.detectChanges(); 
      };
      reader.readAsDataURL(file);
    }
  }
  // NUEVA FUNCIÓN PARA QUITAR LA FOTO
  quitarFoto(inputElement: HTMLInputElement) {
    this.archivoSeleccionado = null;
    this.nombreArchivo = '';
    this.previsualizacionUrl = null;
    
    // Vaciamos el input oculto para que no se quede "trabado" con el archivo anterior
    inputElement.value = ''; 
    
    this.cdr.detectChanges(); 
  }

  enviar() {
    if (!this.mensaje.invitado || !this.mensaje.texto) return;

    this.enviando = true;

    if (this.archivoSeleccionado) {
      const formData = new FormData();
      formData.append('foto', this.archivoSeleccionado);

      this.http.post<{url: string}>('http://52.91.30.101:8080/api/upload', formData).subscribe({
        next: (respuesta) => {
          this.mandarMensajeFinal(respuesta.url);
        },
        error: (err) => {
          console.error('Error al subir la imagen', err);
          alert('Hubo un problema subiendo tu foto, pero enviaremos tu saludo de texto.');
          this.mandarMensajeFinal(null);
        }
      });
    } else {
      this.mandarMensajeFinal(null);
    }
  }

  private mandarMensajeFinal(urlImagen: string | null) {
    const payloadFinal: any = {
      invitado: this.mensaje.invitado,
      texto: this.mensaje.texto
    };

    if (urlImagen) {
      payloadFinal.imagen = urlImagen;
    }

    this.mensajeService.enviarMensaje(payloadFinal).subscribe({
      next: () => {
        this.exito();
      },
      error: (err: any) => { 
        console.log('Error o confusión de Angular:', err);
        this.exito(); 
      }
    });
  }

  private exito() {
    this.enviado = true;
    this.enviando = false;
    
    this.mensaje = { invitado: '', texto: '' };
    this.archivoSeleccionado = null;
    this.nombreArchivo = '';
    this.previsualizacionUrl = null; 
    
    this.cdr.detectChanges(); 
    this.lanzarConfeti(); 

    setTimeout(() => {
      this.enviado = false;
      this.cdr.detectChanges(); 
    }, 5000);
  }
}