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

  // 📸 FUNCIÓN ACTUALIZADA: Convierte automáticamente a WebP antes de guardar
  async onFotoSeleccionada(event: any) {
    const archivoOriginal = event.target.files[0];
    if (archivoOriginal) {
      try {
        // 1. Convertimos el archivo a WebP comprimido (Calidad 80%)
        const archivoWebP = await this.convertirAWebP(archivoOriginal, 0.8);
        
        this.archivoSeleccionado = archivoWebP;
        this.nombreArchivo = archivoWebP.name;

        // 2. Generamos la previsualización fluida
        const reader = new FileReader();
        reader.onload = (e) => {
          this.previsualizacionUrl = reader?.result as string | ArrayBuffer;
          this.cdr.detectChanges(); // Fuerza a Angular a mostrar la foto al instante
        };
        reader.readAsDataURL(archivoWebP);

      } catch (error) {
        console.error('Error al convertir la imagen a WebP:', error);
        alert('Hubo un problema procesando tu foto, intenta con otra.');
      }
    }
  }

  // NUEVA FUNCIÓN PRIVADA PARA CONVERTIR A WEBP EN EL NAVEGADOR
  private convertirAWebP(file: File, calidad: number = 0.8): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Limitamos el tamaño máximo a 1200px para ahorrar espacio y optimizar velocidad
          const maxWidth = 1200;
          const maxHeight = 1200;
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('No se pudo inicializar el canvas'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          // Exportamos como formato WebP
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Falló la conversión a WebP'));
                return;
              }
              const nombreSinExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
              const archivoWebp = new File([blob], `${nombreSinExt}.webp`, {
                type: 'image/webp',
                lastModified: Date.now(),
              });
              resolve(archivoWebp);
            },
            'image/webp',
            calidad
          );
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
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

      this.http.post<{url: string}>('/api/upload', formData).subscribe({
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