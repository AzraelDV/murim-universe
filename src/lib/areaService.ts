import { supabase } from './supabaseClient';

export interface Area {
  id: string;
  name: string;
  description: string;
  faction_id: string;
  faction_name?: string;
  faction_alignment?: string;
  created_at: string;
  updated_at: string;
}

export interface Location {
  id: string;
  area_id: string;
  name: string;
  description: string;
  location_type: 'weapons_shop' | 'armour_shop' | 'blacksmith' | 'faction_rep' | 'mines' | 'forest' | 'training_grounds';
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface AreaWithLocations extends Area {
  locations: Location[];
}

export class AreaService {
  // Get all areas with faction information
  static async getAreas(): Promise<Area[]> {
    try {
      const { data, error } = await supabase
        .from('areas')
        .select(`
          *,
          faction:factions(name, alignment)
        `)
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching areas:', error);
        return [];
      }

      return (data || []).map(area => ({
        ...area,
        faction_name: area.faction?.name,
        faction_alignment: area.faction?.alignment
      }));
    } catch (error) {
      console.error('Error fetching areas:', error);
      return [];
    }
  }

  // Get a specific area with all its locations
  static async getAreaWithLocations(areaId: string): Promise<AreaWithLocations | null> {
    try {
      const { data, error } = await supabase
        .from('areas')
        .select(`
          *,
          faction:factions(name, alignment),
          locations(*)
        `)
        .eq('id', areaId)
        .single();

      if (error) {
        console.error('Error fetching area with locations:', error);
        return null;
      }

      return {
        ...data,
        faction_name: data.faction?.name,
        faction_alignment: data.faction?.alignment,
        locations: data.locations || []
      };
    } catch (error) {
      console.error('Error fetching area with locations:', error);
      return null;
    }
  }

  // Get locations by type
  static async getLocationsByType(locationType: string): Promise<Location[]> {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('location_type', locationType)
        .eq('is_available', true)
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching locations by type:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching locations by type:', error);
      return [];
    }
  }

  // Get location type emoji
  static getLocationTypeEmoji(locationType: string): string {
    switch (locationType) {
      case 'weapons_shop': return '⚔️';
      case 'armour_shop': return '🛡️';
      case 'blacksmith': return '🔨';
      case 'faction_rep': return '👤';
      case 'mines': return '⛏️';
      case 'forest': return '🌲';
      case 'training_grounds': return '🏋️';
      default: return '📍';
    }
  }

  // Get location type name
  static getLocationTypeName(locationType: string): string {
    switch (locationType) {
      case 'weapons_shop': return 'Weapons Shop';
      case 'armour_shop': return 'Armor Shop';
      case 'blacksmith': return 'Blacksmith';
      case 'faction_rep': return 'Faction Representative';
      case 'mines': return 'Mines';
      case 'forest': return 'Forest';
      case 'training_grounds': return 'Training Grounds';
      default: return 'Unknown';
    }
  }

  // Get faction alignment color
  static getFactionAlignmentColor(alignment?: string): string {
    switch (alignment) {
      case 'good': return '#4caf50';
      case 'neutral': return '#ff9800';
      case 'evil': return '#f44336';
      default: return '#9e9e9e';
    }
  }
} 