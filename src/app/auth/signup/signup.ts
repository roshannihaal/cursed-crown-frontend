import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
})
export class SignupComponent {
  private readonly fb = inject(FormBuilder);
  private readonly supabase = inject(SupabaseService);
  private readonly router = inject(Router);

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  signupForm = this.fb.group(
    {
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: this.passwordMatchValidator },
  );

  passwordMatchValidator(g: any) {
    const password = g.get('password').value;
    const confirmPassword = g.get('confirmPassword').value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  async onSubmit() {
    if (this.signupForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set(null);
      this.successMessage.set(null);

      const { username, email, password } = this.signupForm.value;

      try {
        const { data, error } = await this.supabase.signUp(email!, password!, username!);

        if (error) {
          this.errorMessage.set(error.message);
        } else {
          this.successMessage.set('Sign up successful! Redirecting to verification...');
          this.router.navigate(['auth', 'signup', 'verify'], { queryParams: { email: email } });
        }
      } catch (err) {
        this.errorMessage.set('An unexpected error occurred.');
      } finally {
        this.isLoading.set(false);
      }
    }
  }
}
