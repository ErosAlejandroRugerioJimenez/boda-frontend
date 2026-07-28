import { Routes } from '@angular/router';
import { InvitadoComponent } from './features/invitado/invitado.component';
import { DjComponent } from './features/dj/dj.component';

export const routes: Routes = [
  // 1. Ruta principal (Invitados)
  { 
    path: '', 
    component: InvitadoComponent,
    title: 'Boda Oli y Diana' // El título que verán los invitados
  },
  
  // 2. Ruta del DJ
  { 
    path: 'dj', 
    component: DjComponent,
    title: 'Panel DJ - Saludos ' // Un título especial para el DJ
  },

  // 3. Ruta comodín
  { 
    path: '**', 
    redirectTo: '', 
    pathMatch: 'full' 
  }
];