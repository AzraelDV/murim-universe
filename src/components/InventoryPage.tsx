import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { InventoryService } from '../lib/inventoryService';
import type { Item, InventoryItem } from '../lib/inventoryService';
import { supabase } from '../lib/supabaseClient';

type TabType = 'weapon' | 'armour' | 'accessory' | 'book' | 'currency' | 'resource' | 'potion' | 'tool';

const tabConfig = [
  { key: 'weapon' as TabType, label: 'Weapons', emoji: '⚔️' },
  { key: 'armour' as TabType, label: 'Armour', emoji: '🛡️' },
  { key: 'accessory' as TabType, label: 'Accessories', emoji: '💍' },
  { key: 'book' as TabType, label: 'Books', emoji: '📚' },
  { key: 'currency' as TabType, label: 'Currency', emoji: '💰' },
  { key: 'resource' as TabType, label: 'Resources', emoji: '🔧' },
  { key: 'potion' as TabType, label: 'Potions', emoji: '🧪' },
  { key: 'tool' as TabType, label: 'Tools', emoji: '🔨' },
];

const gearSlots = [
  { key: 'weapon', label: 'Weapon', emoji: '⚔️' },
  { key: 'head', label: 'Head', emoji: '👑' },
  { key: 'chest', label: 'Chest', emoji: '👕' },
  { key: 'legs', label: 'Legs', emoji: '👖' },
  { key: 'feet', label: 'Feet', emoji: '👟' },
  { key: 'hands', label: 'Hands', emoji: '🧤' },
  { key: 'shoulders', label: 'Shoulders', emoji: '🦾' },
  { key: 'waist', label: 'Waist', emoji: '👔' },
  { key: 'bag', label: 'Bag', emoji: '🎒' },
];

const toolSlots = [
  { key: 'tool1', label: 'Tool 1', emoji: '🔨' },
  { key: 'tool2', label: 'Tool 2', emoji: '🔨' },
  { key: 'tool3', label: 'Tool 3', emoji: '🔨' },
  { key: 'tool4', label: 'Tool 4', emoji: '🔨' },
  { key: 'tool5', label: 'Tool 5', emoji: '🔨' },
];

const InventoryPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('weapon');
  const [availableItems, setAvailableItems] = useState<Item[]>([]);
  const [playerInventory, setPlayerInventory] = useState<InventoryItem[]>([]);
  const [playerStats, setPlayerStats] = useState<{ strength: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    loadInventoryData();
  }, [user, activeTab]);

  const loadInventoryData = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Load player stats
      const { data: statsData } = await supabase
        .from('players')
        .select('strength')
        .eq('id', user.id)
        .single();
      
      setPlayerStats(statsData);

      // Load inventory
      const inventoryData = await InventoryService.getPlayerInventory(user.id);
      setPlayerInventory(inventoryData);
      
      // Filter inventory items by the active tab type
      const filteredItems = inventoryData
        .filter(invItem => invItem.item?.item_type === activeTab)
        .map(invItem => invItem.item!)
        .filter(Boolean);
      
      setAvailableItems(filteredItems);
    } catch (err: any) {
      setError(err.message || 'Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  const removeItemFromInventory = async (itemId: string) => {
    if (!user?.id) return;
    
    try {
      const success = await InventoryService.removeItemFromInventory(user.id, itemId, 1);
      if (success) {
        loadInventoryData(); // Reload data
      }
    } catch (err: any) {
      setError(err.message || 'Failed to remove item');
    }
  };

  const toggleEquipped = async (inventoryItemId: string, currentlyEquipped: boolean) => {
    try {
      const success = await InventoryService.toggleItemEquipped(inventoryItemId, !currentlyEquipped);
      if (success) {
        loadInventoryData(); // Reload data
      }
    } catch (err: any) {
      setError(err.message || 'Failed to toggle equipped status');
    }
  };

  const getPlayerItemQuantity = (itemId: string): number => {
    const inventoryItem = playerInventory.find(inv => inv.item_id === itemId);
    return inventoryItem ? inventoryItem.quantity : 0;
  };

  const isItemEquipped = (itemId: string): boolean => {
    const inventoryItem = playerInventory.find(inv => inv.item_id === itemId);
    return inventoryItem ? inventoryItem.equipped : false;
  };

  const getInventoryItemId = (itemId: string): string | null => {
    const inventoryItem = playerInventory.find(inv => inv.item_id === itemId);
    return inventoryItem ? inventoryItem.id : null;
  };

  const getEquippedItem = (slot: string): InventoryItem | null => {
    return playerInventory.find(inv => 
      inv.equipped && 
      ((slot === 'weapon' && inv.item?.item_type === 'weapon') ||
       (slot === 'bag' && inv.item?.armour_slot === 'bag') ||
       (inv.item?.armour_slot === slot))
    ) || null;
  };

  const getEquippedTools = (): InventoryItem[] => {
    return playerInventory.filter(inv => 
      inv.equipped && inv.item?.item_type === 'tool'
    ).slice(0, 5); // Max 5 tools
  };

  const getArmourSlotEmoji = (slot?: string): string => {
    switch (slot) {
      case 'head': return '👑';
      case 'chest': return '👕';
      case 'legs': return '👖';
      case 'feet': return '👟';
      case 'hands': return '🧤';
      case 'shoulders': return '🦾';
      case 'waist': return '👔';
      case 'bag': return '🎒';
      default: return '';
    }
  };

  const calculateWeight = () => {
    const currentWeight = InventoryService.calculateInventoryWeight(playerInventory);
    const maxWeight = playerStats ? InventoryService.calculateMaxWeight(
      playerStats.strength,
      playerInventory.filter(inv => inv.equipped && inv.item?.armour_slot === 'bag')
    ) : 50;
    
    return { currentWeight, maxWeight };
  };

  if (loading) return <div style={{ color: 'white', textAlign: 'center', padding: '40px' }}>Loading inventory...</div>;
  if (error) return <div style={{ color: 'red', textAlign: 'center', padding: '40px' }}>Error: {error}</div>;

  const { currentWeight, maxWeight } = calculateWeight();
  const weightPercentage = (currentWeight / maxWeight) * 100;

  return (
    <div style={{ color: 'white', width: '100%' }}>
      {/* Header */}
      <div style={{ background: '#2a2a2a', padding: '16px', borderBottom: '1px solid #444', marginBottom: '20px', borderRadius: '8px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffd700', margin: 0 }}>Inventory Management</h1>
      </div>

      <div style={{ display: 'flex', gap: '24px', height: 'calc(100vh - 200px)', width: '100%', flexWrap: 'wrap' }}>
        {/* Left Side - Inventory */}
        <div style={{ flex: 2, display: 'flex', flexDirection: 'column', minWidth: 0, width: '100%' }}>
          {/* Weight Display */}
          <div style={{ 
            background: '#2a2a2a', 
            padding: '16px', 
            borderRadius: '8px', 
            marginBottom: '16px',
            border: weightPercentage > 90 ? '2px solid #dc2626' : weightPercentage > 75 ? '2px solid #ca8a04' : '1px solid #444',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#ffd700' }}>Weight</span>
              <span style={{ fontSize: '16px', color: '#ccc' }}>
                {currentWeight.toFixed(1)} / {maxWeight.toFixed(1)} kg
              </span>
            </div>
            <div style={{ 
              background: '#1a1a1a', 
              height: '12px', 
              borderRadius: '6px', 
              overflow: 'hidden',
              width: '100%'
            }}>
              <div style={{
                background: weightPercentage > 90 ? '#dc2626' : weightPercentage > 75 ? '#ca8a04' : '#059669',
                height: '100%',
                width: `${Math.min(weightPercentage, 100)}%`,
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>
          
          {/* Tabs */}
          <div style={{ 
            display: 'flex', 
            borderBottom: '2px solid #444', 
            marginBottom: '20px',
            gap: '2px',
            flexWrap: 'wrap',
            width: '100%'
          }}>
            {tabConfig.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  background: activeTab === tab.key ? '#ca8a04' : '#2a2a2a',
                  color: activeTab === tab.key ? 'white' : '#ccc',
                  border: 'none',
                  padding: '12px 16px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  borderRadius: '8px 8px 0 0',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  minWidth: 'fit-content'
                }}
              >
                <span>{tab.emoji}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Items Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
            gap: '16px',
            overflowY: 'auto',
            flex: 1,
            width: '100%'
          }}>
            {availableItems.map(item => {
              const quantity = getPlayerItemQuantity(item.id);
              const equipped = isItemEquipped(item.id);
              const inventoryItemId = getInventoryItemId(item.id);
              
              return (
                <div
                  key={item.id}
                  style={{
                    background: '#2a2a2a',
                    border: `2px solid ${InventoryService.getRarityColor(item.rarity)}`,
                    borderRadius: '8px',
                    padding: '16px',
                    position: 'relative',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.4)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
                  }}
                >
                  {/* Rarity indicator */}
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: InventoryService.getRarityColor(item.rarity),
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase'
                  }}>
                    {item.rarity}
                  </div>

                  {/* Item name */}
                  <h3 style={{ 
                    margin: '0 0 8px 0', 
                    fontSize: '16px', 
                    fontWeight: 'bold',
                    color: InventoryService.getRarityColor(item.rarity)
                  }}>
                    {item.name}
                    {item.custom_id && (
                      <span style={{ 
                        fontSize: '12px', 
                        color: '#666', 
                        fontWeight: 'normal',
                        display: 'block',
                        marginTop: '4px'
                      }}>
                        ID: {item.custom_id}
                      </span>
                    )}
                  </h3>

                  {/* Description */}
                  <p style={{ 
                    margin: '0 0 12px 0', 
                    color: '#ccc', 
                    fontSize: '13px',
                    lineHeight: '1.4'
                  }}>
                    {item.description}
                  </p>

                  {/* Weight */}
                  <div style={{ 
                    marginBottom: '12px', 
                    fontSize: '12px', 
                    color: '#aaa' 
                  }}>
                    Weight: {item.weight}kg
                  </div>

                  {/* Stats */}
                  <div style={{ marginBottom: '12px' }}>
                    <h4 style={{ margin: '0 0 6px 0', fontSize: '12px', color: '#ffd700', fontWeight: '600' }}>Stats:</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {/* Weapon Stats */}
                      {item.item_type === 'weapon' && (
                        <>
                          {item.base_damage && (
                            <span style={{ background: '#1a1a1a', color: '#fff', padding: '4px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: '500' }}>
                              Damage: {item.base_damage}
                            </span>
                          )}
                          {item.armor_penetration && (
                            <span style={{ background: '#1a1a1a', color: '#fff', padding: '4px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: '500' }}>
                              Penetration: {item.armor_penetration}%
                            </span>
                          )}
                          {item.critical_hit_rate && (
                            <span style={{ background: '#1a1a1a', color: '#fff', padding: '4px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: '500' }}>
                              Crit Rate: {item.critical_hit_rate}%
                            </span>
                          )}
                          {item.strength_scaling && (
                            <span style={{ background: '#1a1a1a', color: '#fff', padding: '4px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: '500' }}>
                              Str Scaling: {item.strength_scaling}
                            </span>
                          )}
                        </>
                      )}
                      
                      {/* Armor Stats */}
                      {item.item_type === 'armour' && (
                        <>
                          {item.armor_value && (
                            <span style={{ background: '#1a1a1a', color: '#fff', padding: '4px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: '500' }}>
                              Armor: {item.armor_value}
                            </span>
                          )}
                          {item.armor_type && (
                            <span style={{ background: '#1a1a1a', color: '#fff', padding: '4px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: '500' }}>
                              Type: {item.armor_type}
                            </span>
                          )}
                          {item.dodge_rate && (
                            <span style={{ background: '#1a1a1a', color: '#fff', padding: '4px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: '500' }}>
                              Dodge: {item.dodge_rate}%
                            </span>
                          )}
                        </>
                      )}
                      
                      {/* Equippable Effects */}
                      {item.health_bonus && (
                        <span style={{ background: '#059669', color: '#fff', padding: '4px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: '500' }}>
                          HP: {item.health_bonus > 0 ? '+' : ''}{item.health_bonus}
                        </span>
                      )}
                      {item.strength_bonus && (
                        <span style={{ background: '#ca8a04', color: '#fff', padding: '4px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: '500' }}>
                          STR: {item.strength_bonus > 0 ? '+' : ''}{item.strength_bonus}
                        </span>
                      )}
                      {item.qi_bonus && (
                        <span style={{ background: '#2563eb', color: '#fff', padding: '4px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: '500' }}>
                          QI: {item.qi_bonus > 0 ? '+' : ''}{item.qi_bonus}
                        </span>
                      )}
                      
                      {/* Additional stats from JSON */}
                      {Object.entries(item.stats).map(([key, value]) => (
                        <span
                          key={key}
                          style={{
                            background: '#444',
                            color: '#fff',
                            padding: '4px 6px',
                            borderRadius: '4px',
                            fontSize: '10px',
                            fontWeight: '500'
                          }}
                        >
                          {key.replace(/_/g, ' ')}: {value}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Level requirement and armor slot */}
                  <div style={{ 
                    marginBottom: '12px', 
                    fontSize: '12px', 
                    color: '#aaa' 
                  }}>
                    Level: {item.level_requirement}
                    {item.armour_slot && (
                      <span style={{ marginLeft: '8px' }}>
                        {getArmourSlotEmoji(item.armour_slot)} {item.armour_slot.charAt(0).toUpperCase() + item.armour_slot.slice(1)}
                      </span>
                    )}
                  </div>

                  {/* Quantity and actions */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#ffd700' }}>
                      Owned: {quantity}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {/* Remove item button */}
                      {quantity > 0 && (
                        <button
                          onClick={() => removeItemFromInventory(item.id)}
                          style={{
                            background: '#dc2626',
                            color: 'white',
                            border: 'none',
                            padding: '6px 10px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '11px',
                            fontWeight: '600',
                            transition: 'background 0.2s'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.background = '#b91c1c'}
                          onMouseOut={(e) => e.currentTarget.style.background = '#dc2626'}
                        >
                          Remove
                        </button>
                      )}

                      {/* Equip/Unequip button */}
                      {quantity > 0 && inventoryItemId && (
                        <button
                          onClick={() => toggleEquipped(inventoryItemId, equipped)}
                          style={{
                            background: equipped ? '#ca8a04' : '#2563eb',
                            color: 'white',
                            border: 'none',
                            padding: '6px 10px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '11px',
                            fontWeight: '600',
                            transition: 'background 0.2s'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.background = equipped ? '#a16207' : '#1d4ed8'}
                          onMouseOut={(e) => e.currentTarget.style.background = equipped ? '#ca8a04' : '#2563eb'}
                        >
                          {equipped ? 'Unequip' : 'Equip'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Equipped indicator */}
                  {equipped && (
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      left: '8px',
                      background: '#ca8a04',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: 'bold'
                    }}>
                      EQUIPPED
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {availableItems.length === 0 && (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px', 
              color: '#666',
              fontSize: '16px',
              background: '#2a2a2a',
              borderRadius: '8px',
              border: '1px solid #444'
            }}>
              No {activeTab} items owned.
            </div>
          )}
        </div>

        {/* Right Side - Equipped Gear */}
        <div style={{ flex: 1, minWidth: 280, maxWidth: 400, display: 'flex', flexDirection: 'column' }}>
          <div style={{ background: '#2a2a2a', padding: '16px', borderRadius: '8px', border: '1px solid #444', height: 'fit-content' }}>
            <h2 style={{ marginBottom: '20px', fontSize: '20px', fontWeight: 'bold', color: '#ffd700' }}>Equipped Gear</h2>
            
            {/* Gear Slots */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ marginBottom: '12px', fontSize: '16px', color: '#ffd700', fontWeight: '600' }}>Equipment</h3>
              <div style={{ display: 'grid', gap: '8px' }}>
                {gearSlots.map(slot => {
                  const equippedItem = getEquippedItem(slot.key);
                  
                  return (
                    <div
                      key={slot.key}
                      style={{
                        background: equippedItem ? '#1a1a1a' : '#2a2a2a',
                        border: equippedItem ? `2px solid ${InventoryService.getRarityColor(equippedItem?.item?.rarity || 'common')}` : '1px solid #444',
                        borderRadius: '6px',
                        padding: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        minHeight: '50px'
                      }}
                    >
                      <span style={{ fontSize: '20px' }}>{slot.emoji}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '12px', color: '#aaa', marginBottom: '2px' }}>
                          {slot.label}
                        </div>
                        {equippedItem ? (
                          <div style={{ fontSize: '14px', fontWeight: 'bold', color: InventoryService.getRarityColor(equippedItem.item?.rarity || 'common') }}>
                            {equippedItem.item?.name}
                          </div>
                        ) : (
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            Nothing equipped
                          </div>
                        )}
                      </div>
                      {equippedItem && (
                        <button
                          onClick={() => toggleEquipped(equippedItem.id, true)}
                          style={{
                            background: '#dc2626',
                            color: 'white',
                            border: 'none',
                            padding: '4px 8px',
                            borderRadius: '3px',
                            cursor: 'pointer',
                            fontSize: '10px',
                            fontWeight: '600'
                          }}
                        >
                          Unequip
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tool Slots */}
            <div>
              <h3 style={{ marginBottom: '12px', fontSize: '16px', color: '#ffd700', fontWeight: '600' }}>Tools (5 slots)</h3>
              <div style={{ display: 'grid', gap: '8px' }}>
                {toolSlots.map((slot, index) => {
                  const equippedTools = getEquippedTools();
                  const equippedItem = equippedTools[index];
                  
                  return (
                    <div
                      key={slot.key}
                      style={{
                        background: equippedItem ? '#1a1a1a' : '#2a2a2a',
                        border: equippedItem ? `2px solid ${InventoryService.getRarityColor(equippedItem?.item?.rarity || 'common')}` : '1px solid #444',
                        borderRadius: '6px',
                        padding: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        minHeight: '50px'
                      }}
                    >
                      <span style={{ fontSize: '20px' }}>{slot.emoji}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '12px', color: '#aaa', marginBottom: '2px' }}>
                          {slot.label}
                        </div>
                        {equippedItem ? (
                          <div style={{ fontSize: '14px', fontWeight: 'bold', color: InventoryService.getRarityColor(equippedItem.item?.rarity || 'common') }}>
                            {equippedItem.item?.name}
                          </div>
                        ) : (
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            Empty
                          </div>
                        )}
                      </div>
                      {equippedItem && (
                        <button
                          onClick={() => toggleEquipped(equippedItem.id, true)}
                          style={{
                            background: '#dc2626',
                            color: 'white',
                            border: 'none',
                            padding: '4px 8px',
                            borderRadius: '3px',
                            cursor: 'pointer',
                            fontSize: '10px',
                            fontWeight: '600'
                          }}
                        >
                          Unequip
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryPage; 