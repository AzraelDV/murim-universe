import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { SkillsService, type SkillWithProgress } from '../lib/skillsService';

const SkillsPage: React.FC = () => {
  const { user } = useAuth();
  const [skills, setSkills] = useState<SkillWithProgress[]>([]);
  const [totalLevels, setTotalLevels] = useState(0);
  const [totalXp, setTotalXp] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!user?.id) return;
    loadSkillsData();
  }, [user]);

  const loadSkillsData = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const [skillsData, totalsData] = await Promise.all([
        SkillsService.getPlayerSkills(user.id),
        SkillsService.getPlayerSkillTotals(user.id)
      ]);
      
      setSkills(skillsData);
      setTotalLevels(totalsData.totalLevels);
      setTotalXp(totalsData.totalXp);
    } catch (err: any) {
      setError(err.message || 'Failed to load skills data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ color: 'white', width: '100%' }}>
        <div style={{ 
          background: '#2a2a2a', 
          padding: '40px', 
          borderRadius: '8px', 
          border: '1px solid #444',
          textAlign: 'center',
          color: '#ccc'
        }}>
          Loading skills...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ color: 'white', width: '100%' }}>
        <div style={{ 
          background: '#2a2a2a', 
          padding: '40px', 
          borderRadius: '8px', 
          border: '1px solid #444',
          textAlign: 'center',
          color: '#dc2626'
        }}>
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div style={{ color: 'white', width: '100%' }}>
      {/* Header */}
      <div style={{ background: '#2a2a2a', padding: '16px', borderBottom: '1px solid #444', marginBottom: '20px', borderRadius: '8px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffd700', margin: '0 0 8px 0' }}>Skills & Proficiencies</h1>
        <p style={{ color: '#ccc', fontSize: '14px', margin: 0, lineHeight: '1.4' }}>
          Master various skills through gameplay activities. Skills will improve as you perform related actions throughout your journey.
        </p>
      </div>



      {/* Skills Overview */}
      <div style={{ 
        background: '#2a2a2a', 
        padding: '20px', 
        borderRadius: '8px', 
        border: '1px solid #444',
        marginBottom: '20px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px'
      }}>
        <div style={{ textAlign: 'center', background: '#1a1a1a', padding: '16px', borderRadius: '6px', border: '1px solid #444' }}>
          <div style={{ fontSize: '1.2rem', marginBottom: '8px', color: '#ffd700', fontWeight: '600' }}>📊 Total Levels</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#2563eb' }}>
            {totalLevels}
          </div>
        </div>
        <div style={{ textAlign: 'center', background: '#1a1a1a', padding: '16px', borderRadius: '6px', border: '1px solid #444' }}>
          <div style={{ fontSize: '1.2rem', marginBottom: '8px', color: '#ffd700', fontWeight: '600' }}>⭐ Total XP</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#ca8a04' }}>
            {SkillsService.formatXp(totalXp)}
          </div>
        </div>
        <div style={{ textAlign: 'center', background: '#1a1a1a', padding: '16px', borderRadius: '6px', border: '1px solid #444' }}>
          <div style={{ fontSize: '1.2rem', marginBottom: '8px', color: '#ffd700', fontWeight: '600' }}>🏆 Average Level</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#059669' }}>
            {skills.length > 0 ? Math.round(totalLevels / skills.length) : 0}
          </div>
        </div>
      </div>

      {/* Skills Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', 
        gap: '20px'
      }}>
        {skills.map((playerSkill) => {
          const skill = playerSkill.skill;
          const emoji = SkillsService.getSkillEmoji(skill.name);
          const categoryColor = SkillsService.getSkillCategoryColor(skill.category);
          const progressColor = SkillsService.getProgressBarColor(playerSkill.progressToNextLevel);
          
          return (
            <div 
              key={playerSkill.id}
              style={{
                background: '#2a2a2a',
                border: '1px solid #444',
                borderRadius: '8px',
                padding: '20px',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.4)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Skill Header */}
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '2rem', marginRight: '12px' }}>{emoji}</span>
                <div style={{ flex: 1 }}>
                  <h3 style={{ 
                    fontSize: '18px', 
                    fontWeight: 'bold', 
                    color: '#ffd700', 
                    margin: '0 0 4px 0' 
                  }}>
                    {skill.name}
                  </h3>
                  <div style={{ 
                    fontSize: '12px', 
                    color: categoryColor, 
                    fontWeight: '600',
                    textTransform: 'uppercase'
                  }}>
                    {skill.category}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ 
                    fontSize: '24px', 
                    fontWeight: 'bold', 
                    color: '#2563eb' 
                  }}>
                    {playerSkill.level}
                  </div>
                  <div style={{ 
                    fontSize: '10px', 
                    color: '#666',
                    textTransform: 'uppercase'
                  }}>
                    Level
                  </div>
                </div>
              </div>

              {/* Skill Description */}
              <p style={{ 
                color: '#ccc', 
                fontSize: '13px', 
                lineHeight: '1.4', 
                margin: '0 0 16px 0' 
              }}>
                {skill.description}
              </p>

              {/* XP Progress */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  marginBottom: '8px',
                  fontSize: '12px',
                  color: '#ccc'
                }}>
                  <span>XP: {SkillsService.formatXp(playerSkill.experience)}</span>
                  <span>
                    {playerSkill.level < 99 ? 
                      `${SkillsService.formatXp(playerSkill.xpForNextLevel)} XP for next level` : 
                      'Max Level'
                    }
                  </span>
                </div>
                <div style={{ 
                  background: '#1a1a1a', 
                  height: '8px', 
                  borderRadius: '4px', 
                  overflow: 'hidden'
                }}>
                  <div style={{
                    background: progressColor,
                    height: '100%',
                    width: `${playerSkill.progressToNextLevel}%`,
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>


            </div>
          );
        })}
      </div>

      {/* No Skills Message */}
      {skills.length === 0 && (
        <div style={{ 
          background: '#2a2a2a', 
          padding: '40px', 
          borderRadius: '8px', 
          border: '1px solid #444',
          textAlign: 'center',
          color: '#666',
          fontSize: '16px'
        }}>
          No skills available. Skills will be added as you progress through the game.
        </div>
      )}
    </div>
  );
};

export default SkillsPage; 