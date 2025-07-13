import { supabase } from './supabaseClient';

export interface Skill {
  id: string;
  name: string;
  description: string;
  category: string;
  max_level: number;
  created_at: string;
  updated_at: string;
}

export interface PlayerSkill {
  id: string;
  player_id: string;
  skill_id: string;
  level: number;
  experience: number;
  created_at: string;
  updated_at: string;
  skill?: Skill;
}

export interface SkillWithProgress extends PlayerSkill {
  skill: Skill;
  xpForNextLevel: number;
  progressToNextLevel: number;
  xpForCurrentLevel: number;
}

export interface SkillResult {
  success: boolean;
  leveled_up?: boolean;
  skill_name?: string;
  old_level?: number;
  new_level?: number;
  xp_gained?: number;
  total_xp?: number;
  error?: string;
}

export class SkillsService {
  // Calculate XP required for a specific level
  static calculateXpForLevel(level: number): number {
    // Exponential XP formula: XP = 100 * (level^2.5)
    return Math.floor(100 * Math.pow(level, 2.5));
  }

  // Calculate level from total XP
  static calculateLevelFromXp(xp: number): number {
    let level = 1;
    while (level <= 99) {
      const xpForNextLevel = this.calculateXpForLevel(level + 1);
      if (xp < xpForNextLevel) {
        return level;
      }
      level++;
    }
    return 99;
  }

  // Get all available skills
  static async getAllSkills(): Promise<Skill[]> {
    try {
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching skills:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching skills:', error);
      return [];
    }
  }

  // Get player's skills with progress information
  static async getPlayerSkills(playerId: string): Promise<SkillWithProgress[]> {
    try {
      // Get all available skills first
      const allSkills = await this.getAllSkills();
      
      // Get player's existing skill records
      const { data: playerSkillsData, error } = await supabase
        .from('player_skills')
        .select(`
          *,
          skill:skills(*)
        `)
        .eq('player_id', playerId);

      if (error) {
        console.error('Error fetching player skills:', error);
        return [];
      }

      const playerSkillsMap = new Map();
      (playerSkillsData || []).forEach((ps: any) => {
        playerSkillsMap.set(ps.skill_id, ps);
      });

      // Create a complete list with all skills, using defaults for uninitialized ones
      const completeSkills: SkillWithProgress[] = allSkills.map((skill) => {
        const existingSkill = playerSkillsMap.get(skill.id);
        
        if (existingSkill) {
          // Player has this skill initialized
          const xpForCurrentLevel = this.calculateXpForLevel(existingSkill.level);
          const xpForNextLevel = this.calculateXpForLevel(existingSkill.level + 1);
          const progressToNextLevel = existingSkill.level >= 99 ? 100 : 
            ((existingSkill.experience - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100;

          return {
            ...existingSkill,
            xpForNextLevel,
            progressToNextLevel: Math.min(100, Math.max(0, progressToNextLevel)),
            xpForCurrentLevel
          };
        } else {
          // Player doesn't have this skill initialized yet, use defaults
          const defaultLevel = 1;
          const defaultXp = 0;
          const xpForCurrentLevel = this.calculateXpForLevel(defaultLevel);
          const xpForNextLevel = this.calculateXpForLevel(defaultLevel + 1);
          const progressToNextLevel = 0; // 0 XP = 0% progress

          return {
            id: '', // Will be empty until initialized
            player_id: playerId,
            skill_id: skill.id,
            level: defaultLevel,
            experience: defaultXp,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            skill: skill,
            xpForNextLevel,
            progressToNextLevel,
            xpForCurrentLevel
          };
        }
      });

      return completeSkills.sort((a, b) => a.skill.name.localeCompare(b.skill.name));
    } catch (error) {
      console.error('Error fetching player skills:', error);
      return [];
    }
  }

  // Add XP to a player's skill using the database function
  static async addSkillXp(playerId: string, skillName: string, xpAmount: number): Promise<SkillResult> {
    try {
      // First, check if the player has this skill initialized
      const skill = await this.getSkillByName(skillName);
      if (!skill) {
        return {
          success: false,
          error: 'Skill not found'
        };
      }

      // Check if player has this skill record
      const { data: existingSkill, error: checkError } = await supabase
        .from('player_skills')
        .select('*')
        .eq('player_id', playerId)
        .eq('skill_id', skill.id)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing skill:', checkError);
        return {
          success: false,
          error: checkError.message
        };
      }

      // If skill doesn't exist, initialize it first
      if (!existingSkill) {
        const { error: initError } = await supabase
          .from('player_skills')
          .insert({
            player_id: playerId,
            skill_id: skill.id,
            level: 1,
            experience: 0
          });

        if (initError) {
          console.error('Error initializing skill:', initError);
          return {
            success: false,
            error: initError.message
          };
        }
      }

      // Now add XP using the database function
      const { data, error } = await supabase
        .rpc('add_skill_xp', {
          p_player_id: playerId,
          p_skill_name: skillName,
          p_xp_amount: xpAmount
        });

      if (error) {
        console.error('Error adding skill XP:', error);
        return {
          success: false,
          error: error.message
        };
      }

      return data as SkillResult;
    } catch (error) {
      console.error('Error adding skill XP:', error);
      return {
        success: false,
        error: 'Failed to add skill XP'
      };
    }
  }

  // Get player's total skill levels and experience
  static async getPlayerSkillTotals(playerId: string): Promise<{ totalLevels: number; totalXp: number }> {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('total_skill_levels, total_skill_experience')
        .eq('id', playerId)
        .single();

      if (error) {
        console.error('Error fetching player skill totals:', error);
        return { totalLevels: 0, totalXp: 0 };
      }

      return {
        totalLevels: data.total_skill_levels || 0,
        totalXp: data.total_skill_experience || 0
      };
    } catch (error) {
      console.error('Error fetching player skill totals:', error);
      return { totalLevels: 0, totalXp: 0 };
    }
  }

  // Get skill by name
  static async getSkillByName(skillName: string): Promise<Skill | null> {
    try {
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .eq('name', skillName)
        .single();

      if (error) {
        console.error('Error fetching skill:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching skill:', error);
      return null;
    }
  }

  // Initialize player skills (create records for all skills at level 1)
  static async initializePlayerSkills(playerId: string): Promise<boolean> {
    try {
      const skills = await this.getAllSkills();
      
      for (const skill of skills) {
        const { error } = await supabase
          .from('player_skills')
          .upsert({
            player_id: playerId,
            skill_id: skill.id,
            level: 1,
            experience: 0
          }, {
            onConflict: 'player_id,skill_id'
          });

        if (error) {
          console.error(`Error initializing skill ${skill.name}:`, error);
        }
      }

      return true;
    } catch (error) {
      console.error('Error initializing player skills:', error);
      return false;
    }
  }

  // Get skill emoji based on skill name
  static getSkillEmoji(skillName: string): string {
    const emojiMap: Record<string, string> = {
      'Mining': '⛏️',
      'Smithing': '🔨',
      'Farming': '🌾',
      'Woodcutting': '🪓',
      'Alchemy': '🧪'
    };
    return emojiMap[skillName] || '📊';
  }

  // Get skill category color
  static getSkillCategoryColor(category: string): string {
    const colorMap: Record<string, string> = {
      'gathering': '#059669', // Green
      'crafting': '#ca8a04',  // Orange
      'combat': '#dc2626',    // Red
      'general': '#2563eb'    // Blue
    };
    return colorMap[category] || '#666';
  }

  // Format XP number with commas
  static formatXp(xp: number): string {
    return xp.toLocaleString();
  }

  // Get XP progress bar color based on progress
  static getProgressBarColor(progress: number): string {
    if (progress >= 80) return '#059669'; // Green
    if (progress >= 60) return '#ca8a04'; // Orange
    if (progress >= 40) return '#2563eb'; // Blue
    return '#666'; // Gray
  }
} 