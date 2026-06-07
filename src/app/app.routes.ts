import { Routes } from '@angular/router';
import { InvitadoComponent } from './features/invitado/invitado.component';
import { DjComponent } from './features/dj/dj.component';

export const routes: Routes = [
  // 1. Ruta principal (Invitados)
  { 
    path: '', 
    component: InvitadoComponent,
    title: '¡Manda tus saludos!' // El título de la pestaña del navegador
  },
  
  // 2. Ruta del DJ
  { 
    path: 'dj', 
    component: DjComponent,
    title: 'Saludos en Vivo' 
  },

  // 3. Ruta comodín (Error 404 - Opcional pero recomendado)
  { 
    path: '**', 
    redirectTo: '', // Si alguien escribe una ruta que no existe, lo mandamos a la principal
    pathMatch: 'full' 
  }
];