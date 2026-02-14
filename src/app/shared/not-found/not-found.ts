import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './not-found.html',
  styleUrl: './not-found.css',
})
export class NotFoundComponent implements OnInit {
  private readonly supabase = inject(SupabaseService);
  private readonly router = inject(Router);

  isLoggedIn = signal(false);
  userId = signal<string | null>(null);

  async ngOnInit() {
    const {
      data: { session },
    } = await this.supabase.session;
    if (session) {
      this.isLoggedIn.set(true);
      this.userId.set(session.user.id);
    }
  }

  handleBackAction() {
    if (this.isLoggedIn()) {
      this.router.navigate(['/home', this.userId()]);
    } else {
      this.router.navigate(['/auth/login']);
    }
  }
}
