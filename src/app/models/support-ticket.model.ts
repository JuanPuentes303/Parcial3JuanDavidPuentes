export interface ApiPost {
  userId: number;
  id: number;
  title: string;
  body: string;
}

export interface ApiUser {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  website: string;
}

export type TicketStatus = 'Abierto' | 'En progreso' | 'Pendiente' | 'Cerrado';
export type TicketPriority = 'Baja' | 'Media' | 'Alta' | 'Crítica';

export interface SupportTicket {
  id: number;
  title: string;
  description: string;
  requesterName: string;
  requesterEmail: string;
  requesterUsername: string;
  category: string;
  status: TicketStatus;
  priority: TicketPriority;
  estimatedHours: number;
  openedAt: string;
  avatarInitials: string;
}
