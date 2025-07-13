import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';

interface ItemFormData {
  custom_id: string;
  name: string;
  description: string;
  item_type: 'weapon' | 'armour';
  armour_slot?: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  level_requirement: number;
  weight: number;
  // Weapon stats
  base_damage: number;
  armor_penetration: number;
  critical_hit_rate: number;
  critical_hit_multiplier: number;
  recovery_speed: number;
  parry_rate: number;
  qi_usage_efficiency: number;
  strength_scaling: number;
  // Armor stats
  armor_value: number;
  armor_type: 'light' | 'medium' | 'heavy';
  dodge_rate: number;
  // Equippable effects
  health_bonus: number;
  energy_bonus: number;
  strength_bonus: number;
  constitution_bonus: number;
  qi_bonus: number;
  wisdom_bonus: number;
  intellect_bonus: number;
  perception_bonus: number;
  charisma_bonus: number;
}

const AdminItemCreation: React.FC = () => {
  const { user } = useAuth();
  const [role, setRole] = useState<string>('player');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'weapon' | 'armour'>('weapon');

  const [formData, setFormData] = useState<ItemFormData>({
    custom_id: '',
    name: '',
    description: '',
    item_type: 'weapon',
    rarity: 'common',
    level_requirement: 1,
    weight: 0,
    // Weapon stats
    base_damage: 0,
    armor_penetration: 0,
    critical_hit_rate: 0,
    critical_hit_multiplier: 1.0,
    recovery_speed: 1.0,
    parry_rate: 0,
    qi_usage_efficiency: 1.0,
    strength_scaling: 0,
    // Armor stats
    armor_value: 0,
    armor_type: 'light',
    dodge_rate: 0,
    // Equippable effects
    health_bonus: 0,
    energy_bonus: 0,
    strength_bonus: 0,
    constitution_bonus: 0,
    qi_bonus: 0,
    wisdom_bonus: 0,
    intellect_bonus: 0,
    perception_bonus: 0,
    charisma_bonus: 0,
  });

  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from('players')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data }) => setRole(data?.role || 'player'));
  }, [user]);

  const isAdmin = ['admin', 'owner', 'developer'].includes(role);

  const handleInputChange = (field: keyof ItemFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    setLoading(true);

    try {
      const { error } = await supabase
        .from('items')
        .insert({
          custom_id: formData.custom_id || null,
          name: formData.name,
          description: formData.description,
          item_type: formData.item_type,
          armour_slot: formData.item_type === 'armour' ? formData.armour_slot : null,
          rarity: formData.rarity,
          level_requirement: formData.level_requirement,
          weight: formData.weight,
          // Weapon stats
          base_damage: formData.base_damage,
          armor_penetration: formData.armor_penetration,
          critical_hit_rate: formData.critical_hit_rate,
          critical_hit_multiplier: formData.critical_hit_multiplier,
          recovery_speed: formData.recovery_speed,
          parry_rate: formData.parry_rate,
          qi_usage_efficiency: formData.qi_usage_efficiency,
          strength_scaling: formData.strength_scaling,
          // Armor stats
          armor_value: formData.armor_value,
          armor_type: formData.armor_type,
          dodge_rate: formData.dodge_rate,
          // Equippable effects
          health_bonus: formData.health_bonus,
          energy_bonus: formData.energy_bonus,
          strength_bonus: formData.strength_bonus,
          constitution_bonus: formData.constitution_bonus,
          qi_bonus: formData.qi_bonus,
          wisdom_bonus: formData.wisdom_bonus,
          intellect_bonus: formData.intellect_bonus,
          perception_bonus: formData.perception_bonus,
          charisma_bonus: formData.charisma_bonus,
        });

      if (error) throw error;

      setStatus('Item created successfully!');
      // Reset form
      setFormData({
        custom_id: '',
        name: '',
        description: '',
        item_type: 'weapon',
        rarity: 'common',
        level_requirement: 1,
        weight: 0,
        base_damage: 0,
        armor_penetration: 0,
        critical_hit_rate: 0,
        critical_hit_multiplier: 1.0,
        recovery_speed: 1.0,
        parry_rate: 0,
        qi_usage_efficiency: 1.0,
        strength_scaling: 0,
        armor_value: 0,
        armor_type: 'light',
        dodge_rate: 0,
        health_bonus: 0,
        energy_bonus: 0,
        strength_bonus: 0,
        constitution_bonus: 0,
        qi_bonus: 0,
        wisdom_bonus: 0,
        intellect_bonus: 0,
        perception_bonus: 0,
        charisma_bonus: 0,
      });
    } catch (err: any) {
      setStatus('Error: ' + (err.message || 'Failed to create item'));
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return <div style={{ color: 'white', textAlign: 'center', padding: 40 }}>You do not have permission to access this page.</div>;
  }

  return (
    <div style={{ color: 'white' }}>
      <h1 style={{ marginBottom: '32px', fontSize: '28px', fontWeight: 'bold' }}>Create New Item</h1>

      {/* Tabs */}
      <div style={{ 
        display: 'flex', 
        borderBottom: '2px solid #333', 
        marginBottom: '32px',
        gap: '4px'
      }}>
        <button
          onClick={() => setActiveTab('weapon')}
          style={{
            background: activeTab === 'weapon' ? '#2196F3' : 'transparent',
            color: activeTab === 'weapon' ? 'white' : '#ccc',
            border: 'none',
            padding: '12px 20px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600',
            borderRadius: '8px 8px 0 0',
            transition: 'all 0.2s'
          }}
        >
          ⚔️ Create Weapon
        </button>
        <button
          onClick={() => setActiveTab('armour')}
          style={{
            background: activeTab === 'armour' ? '#2196F3' : 'transparent',
            color: activeTab === 'armour' ? 'white' : '#ccc',
            border: 'none',
            padding: '12px 20px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600',
            borderRadius: '8px 8px 0 0',
            transition: 'all 0.2s'
          }}
        >
          🛡️ Create Armor
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ maxWidth: '800px' }}>
        {/* Basic Information */}
        <div style={{ background: '#2a2a2a', padding: '24px', borderRadius: '12px', marginBottom: '24px' }}>
          <h3 style={{ marginBottom: '20px', fontSize: '20px', fontWeight: 'bold' }}>Basic Information</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                Custom ID (Optional)
              </label>
              <input
                type="text"
                value={formData.custom_id}
                onChange={(e) => handleInputChange('custom_id', e.target.value)}
                placeholder="e.g., SWORD_001, ARMOR_LEGENDARY"
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#1a1a1a',
                  border: '2px solid #444',
                  borderRadius: '6px',
                  color: 'white',
                  fontSize: '14px'
                }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                Item Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#1a1a1a',
                  border: '2px solid #444',
                  borderRadius: '6px',
                  color: 'white',
                  fontSize: '14px'
                }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                Rarity *
              </label>
              <select
                value={formData.rarity}
                onChange={(e) => handleInputChange('rarity', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#1a1a1a',
                  border: '2px solid #444',
                  borderRadius: '6px',
                  color: 'white',
                  fontSize: '14px'
                }}
              >
                <option value="common">Common</option>
                <option value="uncommon">Uncommon</option>
                <option value="rare">Rare</option>
                <option value="epic">Epic</option>
                <option value="legendary">Legendary</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              required
              rows={3}
              style={{
                width: '100%',
                padding: '12px',
                background: '#1a1a1a',
                border: '2px solid #444',
                borderRadius: '6px',
                color: 'white',
                fontSize: '14px',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                Level Requirement *
              </label>
              <input
                type="number"
                value={formData.level_requirement}
                onChange={(e) => handleInputChange('level_requirement', parseInt(e.target.value))}
                min="1"
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#1a1a1a',
                  border: '2px solid #444',
                  borderRadius: '6px',
                  color: 'white',
                  fontSize: '14px'
                }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                Weight (kg) *
              </label>
              <input
                type="number"
                value={formData.weight}
                onChange={(e) => handleInputChange('weight', parseFloat(e.target.value))}
                min="0"
                step="0.1"
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#1a1a1a',
                  border: '2px solid #444',
                  borderRadius: '6px',
                  color: 'white',
                  fontSize: '14px'
                }}
              />
            </div>

            {activeTab === 'armour' && (
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                  Armor Slot *
                </label>
                <select
                  value={formData.armour_slot || ''}
                  onChange={(e) => handleInputChange('armour_slot', e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#1a1a1a',
                    border: '2px solid #444',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '14px'
                  }}
                >
                  <option value="">Select Slot</option>
                  <option value="head">Head</option>
                  <option value="chest">Chest</option>
                  <option value="legs">Legs</option>
                  <option value="feet">Feet</option>
                  <option value="hands">Hands</option>
                  <option value="shoulders">Shoulders</option>
                  <option value="waist">Waist</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Weapon Stats */}
        {activeTab === 'weapon' && (
          <div style={{ background: '#2a2a2a', padding: '24px', borderRadius: '12px', marginBottom: '24px' }}>
            <h3 style={{ marginBottom: '20px', fontSize: '20px', fontWeight: 'bold' }}>Weapon Stats</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                  Base Damage *
                </label>
                <input
                  type="number"
                  value={formData.base_damage}
                  onChange={(e) => handleInputChange('base_damage', parseInt(e.target.value))}
                  min="0"
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#1a1a1a',
                    border: '2px solid #444',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                  Armor Penetration (%)
                </label>
                <input
                  type="number"
                  value={formData.armor_penetration}
                  onChange={(e) => handleInputChange('armor_penetration', parseFloat(e.target.value))}
                  min="0"
                  max="100"
                  step="0.1"
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#1a1a1a',
                    border: '2px solid #444',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                  Critical Hit Rate (%)
                </label>
                <input
                  type="number"
                  value={formData.critical_hit_rate}
                  onChange={(e) => handleInputChange('critical_hit_rate', parseFloat(e.target.value))}
                  min="0"
                  max="100"
                  step="0.1"
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#1a1a1a',
                    border: '2px solid #444',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                  Critical Hit Multiplier
                </label>
                <input
                  type="number"
                  value={formData.critical_hit_multiplier}
                  onChange={(e) => handleInputChange('critical_hit_multiplier', parseFloat(e.target.value))}
                  min="1"
                  max="5"
                  step="0.1"
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#1a1a1a',
                    border: '2px solid #444',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                  Recovery Speed
                </label>
                <input
                  type="number"
                  value={formData.recovery_speed}
                  onChange={(e) => handleInputChange('recovery_speed', parseFloat(e.target.value))}
                  min="0.1"
                  max="3"
                  step="0.1"
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#1a1a1a',
                    border: '2px solid #444',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                  Parry Rate (%)
                </label>
                <input
                  type="number"
                  value={formData.parry_rate}
                  onChange={(e) => handleInputChange('parry_rate', parseFloat(e.target.value))}
                  min="0"
                  max="100"
                  step="0.1"
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#1a1a1a',
                    border: '2px solid #444',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                  Qi Usage Efficiency
                </label>
                <input
                  type="number"
                  value={formData.qi_usage_efficiency}
                  onChange={(e) => handleInputChange('qi_usage_efficiency', parseFloat(e.target.value))}
                  min="0.1"
                  max="3"
                  step="0.1"
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#1a1a1a',
                    border: '2px solid #444',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                  Strength Scaling
                </label>
                <input
                  type="number"
                  value={formData.strength_scaling}
                  onChange={(e) => handleInputChange('strength_scaling', parseFloat(e.target.value))}
                  min="0"
                  max="2"
                  step="0.1"
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#1a1a1a',
                    border: '2px solid #444',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Armor Stats */}
        {activeTab === 'armour' && (
          <div style={{ background: '#2a2a2a', padding: '24px', borderRadius: '12px', marginBottom: '24px' }}>
            <h3 style={{ marginBottom: '20px', fontSize: '20px', fontWeight: 'bold' }}>Armor Stats</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                  Armor Value *
                </label>
                <input
                  type="number"
                  value={formData.armor_value}
                  onChange={(e) => handleInputChange('armor_value', parseInt(e.target.value))}
                  min="0"
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#1a1a1a',
                    border: '2px solid #444',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                  Armor Type *
                </label>
                <select
                  value={formData.armor_type}
                  onChange={(e) => handleInputChange('armor_type', e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#1a1a1a',
                    border: '2px solid #444',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '14px'
                  }}
                >
                  <option value="light">Light</option>
                  <option value="medium">Medium</option>
                  <option value="heavy">Heavy</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                  Dodge Rate (%)
                </label>
                <input
                  type="number"
                  value={formData.dodge_rate}
                  onChange={(e) => handleInputChange('dodge_rate', parseFloat(e.target.value))}
                  min="0"
                  max="100"
                  step="0.1"
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#1a1a1a',
                    border: '2px solid #444',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Equippable Effects */}
        <div style={{ background: '#2a2a2a', padding: '24px', borderRadius: '12px', marginBottom: '24px' }}>
          <h3 style={{ marginBottom: '20px', fontSize: '20px', fontWeight: 'bold' }}>Equippable Effects</h3>
          <p style={{ marginBottom: '20px', color: '#ccc', fontSize: '14px' }}>
            These effects are applied while the item is equipped. Use negative values for penalties.
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                Health Bonus
              </label>
              <input
                type="number"
                value={formData.health_bonus}
                onChange={(e) => handleInputChange('health_bonus', parseInt(e.target.value))}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#1a1a1a',
                  border: '2px solid #444',
                  borderRadius: '6px',
                  color: 'white',
                  fontSize: '14px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                Energy Bonus
              </label>
              <input
                type="number"
                value={formData.energy_bonus}
                onChange={(e) => handleInputChange('energy_bonus', parseInt(e.target.value))}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#1a1a1a',
                  border: '2px solid #444',
                  borderRadius: '6px',
                  color: 'white',
                  fontSize: '14px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                Strength Bonus
              </label>
              <input
                type="number"
                value={formData.strength_bonus}
                onChange={(e) => handleInputChange('strength_bonus', parseInt(e.target.value))}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#1a1a1a',
                  border: '2px solid #444',
                  borderRadius: '6px',
                  color: 'white',
                  fontSize: '14px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                Constitution Bonus
              </label>
              <input
                type="number"
                value={formData.constitution_bonus}
                onChange={(e) => handleInputChange('constitution_bonus', parseInt(e.target.value))}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#1a1a1a',
                  border: '2px solid #444',
                  borderRadius: '6px',
                  color: 'white',
                  fontSize: '14px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                Qi Bonus
              </label>
              <input
                type="number"
                value={formData.qi_bonus}
                onChange={(e) => handleInputChange('qi_bonus', parseInt(e.target.value))}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#1a1a1a',
                  border: '2px solid #444',
                  borderRadius: '6px',
                  color: 'white',
                  fontSize: '14px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                Wisdom Bonus
              </label>
              <input
                type="number"
                value={formData.wisdom_bonus}
                onChange={(e) => handleInputChange('wisdom_bonus', parseInt(e.target.value))}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#1a1a1a',
                  border: '2px solid #444',
                  borderRadius: '6px',
                  color: 'white',
                  fontSize: '14px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                Intellect Bonus
              </label>
              <input
                type="number"
                value={formData.intellect_bonus}
                onChange={(e) => handleInputChange('intellect_bonus', parseInt(e.target.value))}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#1a1a1a',
                  border: '2px solid #444',
                  borderRadius: '6px',
                  color: 'white',
                  fontSize: '14px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                Perception Bonus
              </label>
              <input
                type="number"
                value={formData.perception_bonus}
                onChange={(e) => handleInputChange('perception_bonus', parseInt(e.target.value))}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#1a1a1a',
                  border: '2px solid #444',
                  borderRadius: '6px',
                  color: 'white',
                  fontSize: '14px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                Charisma Bonus
              </label>
              <input
                type="number"
                value={formData.charisma_bonus}
                onChange={(e) => handleInputChange('charisma_bonus', parseInt(e.target.value))}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#1a1a1a',
                  border: '2px solid #444',
                  borderRadius: '6px',
                  color: 'white',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div style={{ textAlign: 'center' }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? '#666' : '#4caf50',
              color: 'white',
              border: 'none',
              padding: '16px 32px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s'
            }}
          >
            {loading ? 'Creating Item...' : `Create ${activeTab === 'weapon' ? 'Weapon' : 'Armor'}`}
          </button>
        </div>

        {status && (
          <div style={{ 
            marginTop: '20px', 
            padding: '16px', 
            borderRadius: '8px',
            background: status.includes('Error') ? '#f44336' : '#4caf50',
            textAlign: 'center',
            fontSize: '16px',
            fontWeight: '600'
          }}>
            {status}
          </div>
        )}
      </form>
    </div>
  );
};

export default AdminItemCreation; 