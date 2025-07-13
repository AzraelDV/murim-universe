import { supabase } from './supabaseClient';

export interface MiningMaterial {
  id: string;
  name: string;
  description: string;
  min_level: number;
  xp_reward: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  is_special_location: boolean;
}

export interface MiningAction {
  id: string;
  player_id: string;
  location_id: string;
  material_id: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
  ores_mined: number;
  xp_gained: number;
  material?: MiningMaterial;
  location?: {
    id: string;
    name: string;
    description: string;
  };
}

export interface SpecialMiningLocation {
  id: string;
  name: string;
  description: string;
  min_level: number;
  material: MiningMaterial;
}

export interface MiningResult {
  success: boolean;
  material_name?: string;
  ores_mined?: number;
  xp_gained?: number;
  mining_duration_minutes?: number;
  error?: string;
}

export class MiningService {
  // Get all mining materials available to a player
  static async getAvailableMaterials(playerLevel: number, isSpecialLocation: boolean = false): Promise<MiningMaterial[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_available_mining_materials', {
          p_player_level: playerLevel,
          p_is_special_location: isSpecialLocation
        });

      if (error) {
        console.error('Error fetching mining materials:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching mining materials:', error);
      return [];
    }
  }

  // Get all mining locations (regular mines)
  static async getMiningLocations(): Promise<any[]> {
    try {
      const { data: locations, error: locationsError } = await supabase
        .from('locations')
        .select('*')
        .eq('location_type', 'mines')
        .eq('name', 'Common Mine')  // Only get the common mine
        .order('name');

      if (locationsError) {
        console.error('Error fetching mining locations:', locationsError);
        return [];
      }

      // Filter for available locations in the frontend
      const availableLocations = (locations || []).filter(loc => loc.is_available === true);
      
      if (availableLocations.length === 0) {
        return [];
      }

      // Return the common mine without area info since it's accessible everywhere
      return availableLocations.map(location => ({
        ...location,
        area: null  // Common mine has no specific area
      }));
    } catch (error) {
      console.error('Error fetching mining locations:', error);
      return [];
    }
  }

  // Get special mining locations
  static async getSpecialMiningLocations(): Promise<SpecialMiningLocation[]> {
    try {
      const { data, error } = await supabase
        .from('special_mining_locations')
        .select(`
          id,
          name,
          description,
          min_level,
          material_id,
          material:mining_materials(*)
        `)
        .order('name');

      if (error) {
        console.error('Error fetching special mining locations:', error);
        return [];
      }
      
      // Transform the data to match the expected interface
      const transformedData = (data || []).map((loc: any) => ({
        id: loc.id,
        name: loc.name,
        description: loc.description,
        min_level: loc.min_level,
        material: loc.material,
        area: null // Special mining locations don't have area information
      }));

      return transformedData;
    } catch (error) {
      console.error('Error fetching special mining locations:', error);
      return [];
    }
  }

  // Start mining
  static async startMining(
    playerId: string, 
    locationId: string, 
    materialId: string, 
    durationHours: number = 6
  ): Promise<{ success: boolean; error?: string; data?: any }> {
    try {
      const { data, error } = await supabase
        .rpc('start_mining', {
          p_player_id: playerId,
          p_location_id: locationId,
          p_material_id: materialId,
          p_duration_hours: durationHours
        });

      if (error) {
        console.error('Error starting mining:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error starting mining:', error);
      return { success: false, error: 'Failed to start mining' };
    }
  }

  // Stop mining and collect rewards
  static async stopMining(playerId: string): Promise<MiningResult> {
    try {
      const { data, error } = await supabase
        .rpc('stop_mining', {
          p_player_id: playerId
        });

      if (error) {
        console.error('Error stopping mining:', error);
        return { success: false, error: error.message };
      }

      return data as MiningResult;
    } catch (error) {
      console.error('Error stopping mining:', error);
      return { success: false, error: 'Failed to stop mining' };
    }
  }

  // Renew mining action
  static async renewMining(playerId: string, durationHours: number = 6): Promise<{ success: boolean; error?: string; data?: any }> {
    try {
      const { data, error } = await supabase
        .rpc('renew_mining', {
          p_player_id: playerId,
          p_duration_hours: durationHours
        });

      if (error) {
        console.error('Error renewing mining:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error renewing mining:', error);
      return { success: false, error: 'Failed to renew mining' };
    }
  }

  // Get current mining action for a player
  static async getCurrentMiningAction(playerId: string): Promise<MiningAction | null> {
    try {
      // First, let's check if we can access the table at all
      const { error: testError } = await supabase
        .from('mining_actions')
        .select('id')
        .limit(1);

      if (testError) {
        console.error('Cannot access mining_actions table:', testError);
        console.error('Error details:', {
          message: testError.message,
          code: testError.code,
          details: testError.details,
          hint: testError.hint
        });
        return null;
      }

      console.log('Basic table access successful, proceeding with query...');

      // Now try the actual query
      const { data, error } = await supabase
        .from('mining_actions')
        .select('id, player_id, location_id, material_id, start_time, end_time, is_active, ores_mined, xp_gained')
        .eq('player_id', playerId)
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        console.error('Error fetching mining action for player:', playerId);
        console.error('Error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        return null;
      }

      if (!data) {
        console.log('No active mining action found for player:', playerId);
        return null;
      }

      console.log('Found mining action:', data.id);

      // Fetch related data with error handling
      let materialData = null;
      let locationData = null;

      try {
        const materialResult = await supabase
          .from('mining_materials')
          .select('*')
          .eq('id', data.material_id)
          .maybeSingle();
        
        if (materialResult.error) {
          console.error('Error fetching material:', materialResult.error);
        } else {
          materialData = materialResult.data;
        }
      } catch (materialError) {
        console.error('Exception fetching material data:', materialError);
      }

      try {
        const locationResult = await supabase
          .from('locations')
          .select('id, name, description')
          .eq('id', data.location_id)
          .maybeSingle();
        
        if (locationResult.error) {
          console.error('Error fetching location:', locationResult.error);
        } else {
          locationData = locationResult.data;
        }
      } catch (locationError) {
        console.error('Exception fetching location data:', locationError);
      }

      return {
        ...data,
        material: materialData || undefined,
        location: locationData || undefined
      };
    } catch (error) {
      console.error('Unexpected error in getCurrentMiningAction:', error);
      return null;
    }
  }

  // Get rarity color
  static getRarityColor(rarity: string): string {
    const colorMap: Record<string, string> = {
      'common': '#9ca3af',     // Gray
      'uncommon': '#10b981',   // Green
      'rare': '#3b82f6',       // Blue
      'epic': '#8b5cf6',       // Purple
      'legendary': '#f59e0b'   // Orange
    };
    return colorMap[rarity] || '#9ca3af';
  }

  // Get material emoji
  static getMaterialEmoji(materialName: string): string {
    const emojiMap: Record<string, string> = {
      'Common Iron Ore': '⛏️',
      'Copper Ore': '��',
      'Meteorite Ore': '☄️',
      'Black Iron Ore': '⚫',
      'Cold Iron Ore': '❄️',
      'Spirit Jade': '💎',
      'Bloodstone Ore': '🔴',
      'Thunderstone Ore': '⚡',
      'Moon Silver Ore': '🌙',
      'Dragonsteel Ore': '🐉',
      'Heavenly Dao Crystal': '✨'
    };
    return emojiMap[materialName] || '⛏️';
  }

  // Format time remaining
  static formatTimeRemaining(endTime: string): string {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) {
      return 'Completed';
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    } else {
      return `${minutes}m remaining`;
    }
  }

  // Calculate progress percentage
  static calculateProgress(startTime: string, endTime: string): number {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    const totalDuration = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    
    if (totalDuration <= 0) return 100;
    if (elapsed <= 0) return 0;
    
    return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
  }

  // Calculate current mining rewards
  static calculateCurrentRewards(miningAction: MiningAction): { ores: number; xp: number } {
    const now = new Date();
    const start = new Date(miningAction.start_time);
    const end = new Date(miningAction.end_time);
    
    // Mining rate: 1 ore every 5 minutes
    const miningRateMinutes = 5;
    const totalDurationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
    const elapsedMinutes = Math.min((now.getTime() - start.getTime()) / (1000 * 60), totalDurationMinutes);
    
    // Calculate ores mined (1 ore every 5 minutes)
    const oresMined = Math.floor(elapsedMinutes / miningRateMinutes);
    
    // Calculate XP gained (ores * xp per ore)
    const xpPerOre = miningAction.material?.xp_reward || 0;
    const xpGained = oresMined * xpPerOre;
    
    return { ores: oresMined, xp: xpGained };
  }
} 