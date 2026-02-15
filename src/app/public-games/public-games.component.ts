import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../services/supabase.service';

@Component({
  selector: 'app-public-games',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './public-games.component.html',
  styleUrl: './public-games.component.css',
})
export class PublicGamesComponent implements OnInit {
  games: any[] = [];
  page: number = 0;
  limit: number = 20;
  loading: boolean = false;
  hasMore: boolean = true;
  error: string | null = null;

  constructor(private supabase: SupabaseService) {}

  ngOnInit() {
    this.fetchGames();
  }

  async fetchGames() {
    if (this.loading) return;
    this.loading = true;
    this.error = null;

    try {
      const { data, error, count } = await this.supabase.getPublicGames(this.page, this.limit);
      if (error) throw error;

      if (data) {
        this.games = [...this.games, ...data];
        // If we received fewer items than the limit, we've reached the end.
        if (data.length < this.limit) {
          this.hasMore = false;
        }
        this.page++;
      }
    } catch (err: any) {
      this.error = 'Failed to load games. Please try again later.';
      console.error('Error fetching public games:', err);
    } finally {
      this.loading = false;
    }
  }

  loadMore() {
    this.fetchGames();
  }
}
