import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { forkJoin, map, Observable, of, catchError } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiPost, ApiUser, SupportTicket, TicketPriority, TicketStatus } from '../models/support-ticket.model';

@Injectable({
  providedIn: 'root',
})
export class SupportTicketsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getTickets(): Observable<SupportTicket[]> {
    return forkJoin({
      posts: this.http.get<ApiPost[]>(`${this.apiUrl}/posts`),
      users: this.http.get<ApiUser[]>(`${this.apiUrl}/users`),
    }).pipe(
      map(({ posts, users }) => posts.map((post) => this.mapPostToTicket(post, users))),
      catchError(() => of(this.buildFallbackTickets())),
    );
  }

  private mapPostToTicket(post: ApiPost, users: ApiUser[]): SupportTicket {
    const user = users.find((item) => item.id === post.userId);
    const statuses: TicketStatus[] = ['Abierto', 'En progreso', 'Pendiente', 'Cerrado'];
    const priorities: TicketPriority[] = ['Baja', 'Media', 'Alta', 'Crítica'];
    const categories = ['Acceso', 'Infraestructura', 'Software', 'Facturación', 'Red'];
    const status = statuses[(post.id - 1) % statuses.length];
    const priority = priorities[(post.id - 1) % priorities.length];
    const estimatedHours = (post.id % 8) + 1;
    const openedAt = new Date(Date.now() - post.id * 3_600_000 * 5).toISOString();
    const requesterName = user?.name ?? `Usuario ${post.userId}`;

    return {
      id: post.id,
      title: this.toSentenceCase(post.title),
      description: this.toSentenceCase(post.body),
      requesterName,
      requesterEmail: user?.email ?? `usuario${post.userId}@soporte.local`,
      requesterUsername: user?.username ?? `user${post.userId}`,
      category: categories[(post.userId - 1) % categories.length],
      status,
      priority,
      estimatedHours,
      openedAt,
      avatarInitials: this.buildInitials(requesterName),
    };
  }

  private toSentenceCase(value: string): string {
    const normalized = value.replace(/\s+/g, ' ').trim();
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
  }

  private buildInitials(fullName: string): string {
    return fullName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');
  }

  private buildFallbackTickets(): SupportTicket[] {
    const users: ApiUser[] = [
      { id: 1, name: 'María Torres', username: 'mtorres', email: 'maria.torres@empresa.com', phone: '', website: '' },
      { id: 2, name: 'Carlos Pérez', username: 'cperez', email: 'carlos.perez@empresa.com', phone: '', website: '' },
      { id: 3, name: 'Laura Gómez', username: 'lgomez', email: 'laura.gomez@empresa.com', phone: '', website: '' },
    ];

    const posts: ApiPost[] = [
      {
        userId: 1,
        id: 1,
        title: 'Error al iniciar sesión en la mesa de ayuda',
        body: 'El usuario no puede ingresar al sistema y necesita restablecer credenciales.',
      },
      {
        userId: 2,
        id: 2,
        title: 'La impresora del área administrativa no responde',
        body: 'Se requiere validación de conectividad y reinstalación del controlador.',
      },
      {
        userId: 3,
        id: 3,
        title: 'Lentitud en el aplicativo académico',
        body: 'El módulo de consultas tarda demasiado tiempo en cargar durante horas pico.',
      },
      {
        userId: 1,
        id: 4,
        title: 'Actualización pendiente del antivirus',
        body: 'El equipo reporta definiciones desactualizadas y solicita revisión preventiva.',
      },
      {
        userId: 2,
        id: 5,
        title: 'Solicitud de acceso a carpeta compartida',
        body: 'Se necesita habilitar permisos para el equipo de soporte funcional.',
      },
    ];

    return posts.map((post) => this.mapPostToTicket(post, users));
  }
}
