import { supabase } from './supabaseClient';

export interface Item {
  id: string;
  custom_id?: string;
  name: string;
  description: string;
  item_type: 'weapon' | 'armour' | 'book' | 'currency' | 'resource' | 'potion' | 'accessory' | 'tool';
  armour_slot?: 'head' | 'chest' | 'legs' | 'feet' | 'hands' | 'shoulders' | 'waist' | 'bag';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  level_requirement: number;
  weight: number;
  // Weapon stats
  base_damage?: number;
  armor_penetration?: number;
  critical_hit_rate?: number;
  critical_hit_multiplier?: number;
  recovery_speed?: number;
  parry_rate?: number;
  qi_usage_efficiency?: number;
  strength_scaling?: number;
  // Armor stats
  armor_value?: number;
  armor_type?: 'light' | 'medium' | 'heavy';
  dodge_rate?: number;
  // Equippable effects
  health_bonus?: number;
  energy_bonus?: number;
  strength_bonus?: number;
  constitution_bonus?: number;
  qi_bonus?: number;
  wisdom_bonus?: number;
  intellect_bonus?: number;
  perception_bonus?: number;
  charisma_bonus?: number;
  // Additional stats
  stats: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface InventoryItem {
  id: string;
  player_id: string;
  item_id: string;
  quantity: number;
  equipped: boolean;
  created_at: string;
  updated_at: string;
  item?: Item;
}

export class InventoryService {
  // Get all items of a specific type
  static async getItemsByType(itemType: string): Promise<Item[]> {
    try {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('item_type', itemType)
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching items:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching items:', error);
      return [];
    }
  }

  // Get player's inventory items
  static async getPlayerInventory(playerId: string): Promise<InventoryItem[]> {
    try {
      const { data, error } = await supabase
        .from('player_inventory')
        .select(`
          *,
          item:items(*)
        `)
        .eq('player_id', playerId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching player inventory:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching player inventory:', error);
      return [];
    }
  }

  // Add item to player inventory
  static async addItemToInventory(playerId: string, itemId: string, quantity: number = 1): Promise<boolean> {
    try {
      // Check if player already has this item
      const { data: existingItem } = await supabase
        .from('player_inventory')
        .select('id, quantity')
        .eq('player_id', playerId)
        .eq('item_id', itemId)
        .single();

      if (existingItem) {
        // Update quantity if item already exists
        const { error } = await supabase
          .from('player_inventory')
          .update({ 
            quantity: existingItem.quantity + quantity,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingItem.id);

        if (error) {
          console.error('Error updating item quantity:', error);
          return false;
        }
      } else {
        // Insert new item
        const { error } = await supabase
          .from('player_inventory')
          .insert({
            player_id: playerId,
            item_id: itemId,
            quantity
          });

        if (error) {
          console.error('Error adding item to inventory:', error);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error adding item to inventory:', error);
      return false;
    }
  }

  // Remove item from player inventory
  static async removeItemFromInventory(playerId: string, itemId: string, quantity: number = 1): Promise<boolean> {
    try {
      const { data: existingItem } = await supabase
        .from('player_inventory')
        .select('id, quantity')
        .eq('player_id', playerId)
        .eq('item_id', itemId)
        .single();

      if (!existingItem) {
        console.error('Item not found in inventory');
        return false;
      }

      if (existingItem.quantity <= quantity) {
        // Remove entire item
        const { error } = await supabase
          .from('player_inventory')
          .delete()
          .eq('id', existingItem.id);

        if (error) {
          console.error('Error removing item from inventory:', error);
          return false;
        }
      } else {
        // Update quantity
        const { error } = await supabase
          .from('player_inventory')
          .update({ 
            quantity: existingItem.quantity - quantity,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingItem.id);

        if (error) {
          console.error('Error updating item quantity:', error);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error removing item from inventory:', error);
      return false;
    }
  }

  // Toggle item equipped status
  static async toggleItemEquipped(inventoryItemId: string, equipped: boolean): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('player_inventory')
        .update({ 
          equipped,
          updated_at: new Date().toISOString()
        })
        .eq('id', inventoryItemId);

      if (error) {
        console.error('Error toggling item equipped status:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error toggling item equipped status:', error);
      return false;
    }
  }

  // Get rarity color
  static getRarityColor(rarity: string): string {
    switch (rarity) {
      case 'common': return '#9e9e9e';
      case 'uncommon': return '#4caf50';
      case 'rare': return '#2196f3';
      case 'epic': return '#9c27b0';
      case 'legendary': return '#ff9800';
      default: return '#9e9e9e';
    }
  }

  // Calculate total inventory weight
  static calculateInventoryWeight(inventoryItems: InventoryItem[]): number {
    return inventoryItems.reduce((total, invItem) => {
      return total + (invItem.item?.weight || 0) * invItem.quantity;
    }, 0);
  }

  // Calculate max carry weight (base 50kg + 1kg per strength point)
  static calculateMaxWeight(strength: number, equippedBags: InventoryItem[] = []): number {
    const baseWeight = 50;
    const strengthBonus = strength;
    const bagBonus = equippedBags.reduce((total, bag) => {
      return total + (bag.item?.stats?.weight_bonus || 0);
    }, 0);
    
    return baseWeight + strengthBonus + bagBonus;
  }
} 