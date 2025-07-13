import { supabase } from './supabaseClient';
import { User } from '@supabase/supabase-js';

export interface Player {
  id: string;
  username: string;
  level: number;
  experience: number;
  health: number;
  max_health: number;
  energy: number;
  max_energy: number;
  strength: number;
  agility: number;
  intelligence: number;
  current_location_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Location {
  id: string;
  name: string;
  description: string;
  location_type: string;
  created_at: string;
}

export interface GameAction {
  id: string;
  player_id: string;
  action_type: string;
  description: string;
  location_id: string | null;
  created_at: string;
}

export class GameService {
  // Create a new player profile
  static async createPlayer(user: User, username: string): Promise<Player | null> {
    try {
      const { data, error } = await supabase
        .from('players')
        .insert({
          id: user.id,
          username,
          current_location_id: 'b5a4e2bf-79f7-4d94-8e8b-de2033d2b40c' // We'll set this to the first location
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating player:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error creating player:', error);
      return null;
    }
  }

  // Get player profile
  static async getPlayer(userId: string): Promise<Player | null> {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching player:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching player:', error);
      return null;
    }
  }

  // Get all locations
  static async getLocations(): Promise<Location[]> {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching locations:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching locations:', error);
      return [];
    }
  }

  // Get location by ID
  static async getLocation(locationId: string): Promise<Location | null> {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('id', locationId)
        .single();

      if (error) {
        console.error('Error fetching location:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching location:', error);
      return null;
    }
  }

  // Update player location
  static async updatePlayerLocation(playerId: string, locationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('players')
        .update({ current_location_id: locationId, updated_at: new Date().toISOString() })
        .eq('id', playerId);

      if (error) {
        console.error('Error updating player location:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating player location:', error);
      return false;
    }
  }

  // Log a game action
  static async logAction(playerId: string, actionType: string, description: string, locationId?: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('game_actions')
        .insert({
          player_id: playerId,
          action_type: actionType,
          description,
          location_id: locationId || null
        });

      if (error) {
        console.error('Error logging action:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error logging action:', error);
      return false;
    }
  }

  // Get recent actions for a location
  static async getLocationActions(locationId: string, limit: number = 10): Promise<GameAction[]> {
    try {
      const { data, error } = await supabase
        .from('game_actions')
        .select('*')
        .eq('location_id', locationId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching location actions:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching location actions:', error);
      return [];
    }
  }

  // Subscribe to real-time location updates
  static subscribeToLocationActions(locationId: string, callback: (action: GameAction) => void) {
    return supabase
      .channel(`location-${locationId}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'game_actions',
          filter: `location_id=eq.${locationId}`
        }, 
        (payload) => {
          callback(payload.new as GameAction);
        }
      )
      .subscribe();
  }
}