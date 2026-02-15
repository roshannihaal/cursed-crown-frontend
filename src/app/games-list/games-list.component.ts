import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../services/supabase.service';

@Component({
  selector: 'app-games-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './games-list.component.html',
  styleUrl: './games-list.component.css',
})
export class GamesListComponent implements OnInit {
  games: any[] = [];
  selectedFilter: string = 'all';
  loading: boolean = false;
  error: string | null = null;
  currentUserId: string | null = null;
  editingGameId: string | null = null;
  newStatus: string = '';

  filters = [
    { value: 'all', label: 'All Games' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'voting', label: 'Voting' },
    { value: 'completed', label: 'Completed' },
    { value: 'no_result', label: 'No Result' },
  ];

  statusOptions = this.filters.filter((f) => f.value !== 'all');

  constructor(private supabase: SupabaseService) {}

  async ngOnInit() {
    const {
      data: { user },
    } = await this.supabase.user;
    this.currentUserId = user?.id || null;
    this.fetchGames();
  }

  async fetchGames() {
    this.loading = true;
    this.error = null;
    try {
      const { data, error } = await this.supabase.getAllGames(this.selectedFilter);
      if (error) throw error;
      console.log('Fetched games:', data);
      this.games = data?.data?.games || [];
    } catch (err: any) {
      this.error = err.message || 'Failed to fetch games';
      console.error('Error fetching games:', err);
    } finally {
      this.loading = false;
    }
  }

  onFilterChange() {
    this.fetchGames();
  }

  enableEdit(game: any) {
    this.editingGameId = game.id;
    this.newStatus = game.status;
  }

  cancelEdit() {
    this.editingGameId = null;
    this.newStatus = '';
  }

  async saveStatus(game: any) {
    if (!this.editingGameId) return;

    try {
      const { error } = await this.supabase.updateGameStatus(this.editingGameId, this.newStatus);
      if (error) throw error;

      // Update local state
      game.status = this.newStatus;
      this.editingGameId = null;

      // If status became completed, we might want to refresh checking logic,
      // but UI will auto-update based on *ngIf conditions
    } catch (err: any) {
      console.error('Error updating game status:', err);
      alert('Failed to update status: ' + err.message);
    }
  }
}
