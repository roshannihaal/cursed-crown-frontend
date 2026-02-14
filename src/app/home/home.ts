import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class HomeComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly supabase = inject(SupabaseService);

  userId = signal<string | null>(null);
  username = signal<string | null>(null);

  async ngOnInit() {
    this.userId.set(this.route.snapshot.paramMap.get('id'));

    // Attempt to get user profile/metadata
    const {
      data: { user },
    } = await this.supabase.user;
    if (user) {
      this.username.set(user.user_metadata?.['username'] || 'Champion');
    }
  }

  async signOut() {
    await this.supabase.signOut();
  }
}
