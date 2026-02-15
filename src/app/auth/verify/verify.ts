import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { interval, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-verify',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './verify.html',
  styleUrl: './verify.css',
})
export class VerifyComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly supabase = inject(SupabaseService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  email = signal<string | null>(null);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  // Timer logic
  timeLeft = signal(90); // 1:30 = 90 seconds
  canResend = signal(false);
  private timerSubscription?: Subscription;

  otpForm = this.fb.group({
    otp: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]],
  });

  ngOnInit() {
    this.email.set(this.route.snapshot.queryParamMap.get('email'));
    if (!this.email()) {
      this.router.navigate(['/auth/signup']);
      return;
    }
    this.startTimer();
  }

  ngOnDestroy() {
    this.timerSubscription?.unsubscribe();
  }

  startTimer() {
    this.timeLeft.set(90);
    this.canResend.set(false);
    this.timerSubscription?.unsubscribe();

    this.timerSubscription = interval(1000)
      .pipe(take(90))
      .subscribe({
        next: () => {
          this.timeLeft.update((t) => t - 1);
        },
        complete: () => {
          this.canResend.set(true);
        },
      });
  }

  get formattedTime() {
    const minutes = Math.floor(this.timeLeft() / 60);
    const seconds = this.timeLeft() % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  async onSubmit() {
    if (this.otpForm.valid && this.email()) {
      this.isLoading.set(true);
      this.errorMessage.set(null);
      this.successMessage.set(null);

      const token = this.otpForm.value.otp!;

      try {
        const { data, error } = await this.supabase.verifyOTP(this.email()!, token);

        if (error) {
          this.errorMessage.set(error.message);
        } else {
          const userId = data.user?.id;
          if (userId) {
            this.router.navigate(['/user', userId]);
          } else {
            this.router.navigate(['/auth/login']);
          }
        }
      } catch (err) {
        this.errorMessage.set('An unexpected error occurred.');
      } finally {
        this.isLoading.set(false);
      }
    }
  }

  async resendOtp() {
    if (!this.canResend() || !this.email()) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const { error } = await this.supabase.resendOTP(this.email()!);
      if (error) {
        this.errorMessage.set(error.message);
      } else {
        this.successMessage.set('OTP resent successfully!');
        this.startTimer();
      }
    } catch (err) {
      this.errorMessage.set('Could not resend OTP.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
