import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';

@Component({
  selector: 'app-games-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
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
  votingGameId: string | null = null;
  selectedChampionId: string = '';
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
      const { data, error } = await this.supabase.updateGameStatus(
        this.editingGameId,
        this.newStatus,
      );
      if (error) throw error;

      if (data?.data?.game) {
        this.updateGameInList(data.data.game);
      } else {
        // Fallback if structure is different, though we expect the new structure
        game.status = this.newStatus;
      }

      this.editingGameId = null;
    } catch (err: any) {
      console.error('Error updating game status:', err);
      alert('Failed to update status: ' + err.message);
    }
  }

  isPlayerInGame(game: any): boolean {
    if (!this.currentUserId || !game.players) return false;
    // Assuming backend returns a list of player objects or IDs.
    // Based on previous response structure, it might be nested or direct.
    // Let's assume game.players is an array of objects with player_id or id.
    // The previous diff showed "game.players" usage.
    // Adjusting based on standard join or previous code context:
    // "game_players" was used in loop, then user changed it to "players".
    // I'll check both just in case, or rely on what's in the object.
    const players = game.players || game.game_players || [];
    return players.some(
      (p: any) =>
        p.player_id === this.currentUserId ||
        p.id === this.currentUserId ||
        p.user_id === this.currentUserId,
    );
  }

  initiateVote(game: any) {
    this.votingGameId = game.id;
    this.selectedChampionId = '';
  }

  cancelVote() {
    this.votingGameId = null;
    this.selectedChampionId = '';
  }

  async submitVote(game: any) {
    if (!this.votingGameId || !this.selectedChampionId) return;

    try {
      const { data, error } = await this.supabase.voteForChampion(
        this.votingGameId,
        this.selectedChampionId,
      );
      if (error) throw error;

      alert('Vote submitted successfully!');

      if (data?.data?.game) {
        this.updateGameInList(data.data.game);
      }

      this.votingGameId = null;
      this.selectedChampionId = '';
    } catch (err: any) {
      console.error('Error submitting vote:', err);
      alert('Failed to submit vote: ' + err.message);
    }
  }

  private updateGameInList(updatedGame: any) {
    const index = this.games.findIndex((g) => g.id === updatedGame.id);
    if (index !== -1) {
      this.games[index] = updatedGame;
    }
  }

  hasPlayerVoted(game: any): boolean {
    if (!this.currentUserId || !game.voted_players) return false;
    return game.voted_players.some((p: any) => p.id === this.currentUserId);
  }

  getRemainingVotes(game: any): number {
    const totalPlayers = game.players?.length || game.game_players?.length || 0;
    const votedPlayers = game.voted_players?.length || 0;
    return Math.max(0, totalPlayers - votedPlayers);
  }
}
