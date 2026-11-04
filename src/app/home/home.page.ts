import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonAvatar,
  IonBadge,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonRow,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { SupportTicket, TicketPriority, TicketStatus } from '../models/support-ticket.model';
import { SupportTicketsService } from '../services/support-tickets.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonAvatar,
    IonBadge,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonCol,
    IonContent,
    IonGrid,
    IonHeader,
    IonInput,
    IonItem,
    IonLabel,
    IonList,
    IonNote,
    IonRow,
    IonSearchbar,
    IonSelect,
    IonSelectOption,
    IonTitle,
    IonToolbar,
  ],
})
export class HomePage implements OnInit {
  tickets: SupportTicket[] = [];
  statuses: TicketStatus[] = ['Abierto', 'En progreso', 'Pendiente', 'Cerrado'];
  priorities: TicketPriority[] = ['Baja', 'Media', 'Alta', 'Crítica'];

  searchTerm = '';
  selectedStatus = '';
  selectedPriority = '';
  maxHours = '';
  isLoading = true;

  constructor(private readonly supportTicketsService: SupportTicketsService) {}

  get filteredTickets(): SupportTicket[] {
    return this.applyFilters(this.tickets);
  }

  get totalTickets(): number {
    return this.filteredTickets.length;
  }

  get openTickets(): number {
    return this.filteredTickets.filter((ticket) => ticket.status === 'Abierto' || ticket.status === 'En progreso').length;
  }

  get criticalTickets(): number {
    return this.filteredTickets.filter((ticket) => ticket.priority === 'Crítica').length;
  }

  ngOnInit(): void {
    this.loadTickets();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.selectedPriority = '';
    this.maxHours = '';
  }

  getStatusColor(status: TicketStatus): 'danger' | 'warning' | 'tertiary' | 'success' | 'medium' {
    const colors: Record<TicketStatus, 'danger' | 'warning' | 'tertiary' | 'success' | 'medium'> = {
      Abierto: 'danger',
      'En progreso': 'warning',
      Pendiente: 'tertiary',
      Cerrado: 'success',
    };

    return colors[status] ?? 'medium';
  }

  getPriorityColor(priority: TicketPriority): 'success' | 'warning' | 'danger' | 'medium' {
    const colors: Record<TicketPriority, 'success' | 'warning' | 'danger' | 'medium'> = {
      Baja: 'success',
      Media: 'warning',
      Alta: 'danger',
      Crítica: 'danger',
    };

    return colors[priority] ?? 'medium';
  }

  private loadTickets(): void {
    this.isLoading = true;

    this.supportTicketsService.getTickets().subscribe({
      next: (tickets) => {
        this.tickets = tickets;
        this.isLoading = false;
      },
      error: () => {
        this.tickets = [];
        this.isLoading = false;
      },
    });
  }

  private applyFilters(tickets: SupportTicket[]): SupportTicket[] {
    const term = this.searchTerm.trim().toLowerCase();
    const maxHours = Number(this.maxHours);

    return tickets.filter((ticket) => {
      const matchesTerm =
        !term ||
        ticket.title.toLowerCase().includes(term) ||
        ticket.description.toLowerCase().includes(term) ||
        ticket.requesterName.toLowerCase().includes(term) ||
        ticket.requesterEmail.toLowerCase().includes(term);

      const matchesStatus = !this.selectedStatus || ticket.status === this.selectedStatus;
      const matchesPriority = !this.selectedPriority || ticket.priority === this.selectedPriority;
      const matchesMaxHours = !this.maxHours || ticket.estimatedHours <= maxHours;

      return matchesTerm && matchesStatus && matchesPriority && matchesMaxHours;
    });
  }
}
