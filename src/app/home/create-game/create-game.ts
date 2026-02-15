import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-create-game',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './create-game.html',
  styleUrl: './create-game.css',
})
export class CreateGameComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly supabase = inject(SupabaseService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  userId = signal<string | null>(null);
  isLoading = signal(false);
  isSaving = signal(false);
  errorMessage = signal<string | null>(null);

  profiles = signal<any[]>([]);
  selectedPlayerIds = signal<Set<string>>(new Set());

  gameForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
  });

  async ngOnInit() {
    this.userId.set(this.route.snapshot.paramMap.get('id'));
    if (!this.userId()) {
      this.router.navigate(['/auth/login']);
      return;
    }

    // Default: include the creator
    this.selectedPlayerIds.update((s) => {
      s.add(this.userId()!);
      return new Set(s);
    });

    await this.fetchProfiles();
  }

  async fetchProfiles() {
    this.isLoading.set(true);
    try {
      const { data, error } = await this.supabase.getProfiles();
      if (error) throw error;
      // Exclude the creator from the list to display (since they are added by default)
      this.profiles.set(data.filter((p) => p.id !== this.userId()));
    } catch (err: any) {
      this.errorMessage.set(err.message);
    } finally {
      this.isLoading.set(false);
    }
  }

  togglePlayer(playerId: string) {
    this.selectedPlayerIds.update((s) => {
      if (s.has(playerId)) {
        s.delete(playerId);
      } else {
        s.add(playerId);
      }
      return new Set(s);
    });
  }

  isSelected(playerId: string): boolean {
    return this.selectedPlayerIds().has(playerId);
  }

  get canSubmit(): boolean {
    // Total players must be >= 3 (Creator + 2 others)
    return this.gameForm.valid && this.selectedPlayerIds().size >= 3;
  }

  async onSubmit() {
    if (!this.canSubmit) return;

    this.isSaving.set(true);
    this.errorMessage.set(null);

    const { name } = this.gameForm.value;
    const playerIds = Array.from(this.selectedPlayerIds());

    try {
      await this.supabase.createGame(name!, playerIds);
      this.router.navigate(['/user', this.userId()]);
    } catch (err: any) {
      this.errorMessage.set(err.message);
    } finally {
      this.isSaving.set(false);
    }
  }
}
