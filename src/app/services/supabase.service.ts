import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.SUPABASE_URL, environment.SUPABASE_KEY);
  }

  get user() {
    return this.supabase.auth.getUser();
  }

  get session() {
    return this.supabase.auth.getSession();
  }

  get auth() {
    return this.supabase.auth;
  }

  // Helper for signup with metadata
  async signUp(email: string, password: string, username: string) {
    return await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
        },
      },
    });
  }

  async signIn(email: string, password: string) {
    return await this.supabase.auth.signInWithPassword({
      email,
      password,
    });
  }

  async signOut() {
    return await this.supabase.auth.signOut();
  }

  async verifyOTP(email: string, token: string) {
    return await this.supabase.auth.verifyOtp({
      email,
      token,
      type: 'signup',
    });
  }

  async resendOTP(email: string) {
    return await this.supabase.auth.resend({
      type: 'signup',
      email: email,
    });
  }
}
