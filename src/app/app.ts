import { Component, signal, inject, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { ThemeService } from './services/theme.service';
import { SupabaseService } from './services/supabase.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  protected readonly title = signal('cursed-crown-frontend');
  protected readonly themeService = inject(ThemeService);
  private readonly supabase = inject(SupabaseService);
  private readonly router = inject(Router);

  currentUser = signal<any>(null);
  userProfile = signal<any>(null);

  async ngOnInit() {
    const { data } = await this.supabase.user;
    this.currentUser.set(data?.user || null);

    if (data?.user) {
      this.fetchProfile(data.user.id);
    }

    this.supabase.auth.onAuthStateChange(async (event, session) => {
      this.currentUser.set(session?.user || null);
      if (session?.user) {
        this.fetchProfile(session.user.id);
      } else {
        this.userProfile.set(null);
      }
    });
  }

  async fetchProfile(userId: string) {
    const { data } = await this.supabase.getProfile(userId);
    if (data) {
      this.userProfile.set(data);
    }
  }

  async signOut() {
    await this.supabase.signOut();
    this.currentUser.set(null);
    this.userProfile.set(null);
    this.router.navigate(['/auth/login']);
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }
}
