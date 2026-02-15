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

  async getProfiles() {
    return await this.supabase
      .from('profiles')
      .select('id, username')
      .order('username', { ascending: true });
  }

  async createGame(name: string, playerIds: string[]) {
    await this.supabase.functions.invoke('create-game', {
      body: {
        name,
        game_players: playerIds,
      },
    });

    // // 1. Create the game
    // const { data: game, error: gameError } = await this.supabase
    //   .from('games')
    //   .insert({
    //     name,
    //     created_by: createdBy,
    //     status: 'in_progress',
    //   })
    //   .select()
    //   .single();
    // if (gameError) throw gameError;
    // // 2. Add players to the game
    // const playersToInsert = playerIds.map((playerId) => ({
    //   game_id: game.id,
    //   player_id: playerId,
    // }));
    // const { error: playersError } = await this.supabase
    //   .from('game_players')
    //   .insert(playersToInsert);
    // if (playersError) throw playersError;
    // return game;
  }

  async getAllGames(status?: string) {
    const body: any = {};
    if (status && status !== 'all') {
      body.status = status;
    }
    return await this.supabase.functions.invoke('get-all-games', {
      body,
    });
  }

  async updateGameStatus(gameId: string, status: string) {
    return await this.supabase.functions.invoke('update-game-status', {
      body: {
        game_id: gameId,
        status,
      },
    });
  }
}
