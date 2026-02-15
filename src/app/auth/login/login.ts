import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly supabase = inject(SupabaseService);
  private readonly router = inject(Router);

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  async onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set(null);

      const { email, password } = this.loginForm.value;

      try {
        const { data, error } = await this.supabase.signIn(email!, password!);

        if (error) {
          if (error.code === 'email_not_confirmed') {
            await this.supabase.resendOTP(email!);
            this.router.navigate(['/auth/signup/verify'], { queryParams: { email: email } });
          } else {
            this.errorMessage.set(error.message);
          }
        } else {
          const userId = data.user?.id;
          this.router.navigate(['/user', userId]);
        }
      } catch (err) {
        this.errorMessage.set('An unexpected error occurred.');
      } finally {
        this.isLoading.set(false);
      }
    }
  }
}
