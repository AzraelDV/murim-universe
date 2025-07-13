import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';
import { SkillsService } from '../lib/skillsService';
import { MiningService, type MiningAction } from '../lib/miningService';

interface GameState {
  // Add your game state properties here
  // For now, we'll start with basic player info
  playerId: string | null;
  playerName: string | null;
  level: number;
  experience: number;
  health: number;
  maxHealth: number;
  energy: number;
  maxEnergy: number;
  currentLocationId: string | null;
  currentLocationName: string | null;
  currentAreaName: string | null;
  currentMiningAction: MiningAction | null;
  currentActivity: string | null;
}

interface GameContextType {
  gameState: GameState;
  loading: boolean;
  error: string | null;
  initializePlayer: (playerName: string) => Promise<void>;
  updateGameState: (updates: Partial<GameState>) => void;
  updatePlayerLocation: (locationId: string, locationName: string, areaName: string) => Promise<void>;
  updateMiningAction: (miningAction: MiningAction | null) => void;
  updateCurrentActivity: (activity: string | null) => Promise<void>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

const initialGameState: GameState = {
  playerId: null,
  playerName: null,
  level: 1,
  experience: 0,
  health: 100,
  maxHealth: 100,
  energy: 100,
  maxEnergy: 100,
  currentLocationId: null,
  currentLocationName: null,
  currentAreaName: null,
  currentMiningAction: null,
  currentActivity: null,
};

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadPlayerData();
    } else {
      setGameState(initialGameState);
    }
  }, [user]);

  const loadPlayerData = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch player data from the database
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        // Player exists, load their data
        // Load current mining action
        const currentMiningAction = await MiningService.getCurrentMiningAction(data.id);
        
        setGameState({
          playerId: data.id,
          playerName: data.username,
          level: data.level,
          experience: data.experience,
          health: data.health,
          maxHealth: data.max_health,
          energy: data.energy,
          maxEnergy: data.max_energy,
          currentLocationId: data.current_location_id,
          currentLocationName: data.current_location_name,
          currentAreaName: data.current_area_name,
          currentMiningAction,
          currentActivity: data.current_activity || null,
        });
      } else {
        // No player record exists, reset to initial state
        setGameState(initialGameState);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load player data');
    } finally {
      setLoading(false);
    }
  };

  const initializePlayer = async (playerName: string) => {
    if (!user) throw new Error('User must be authenticated');

    setLoading(true);
    setError(null);

    try {
      // Create a new player record in the database
      const { data, error } = await supabase
        .from('players')
        .insert({
          id: user.id,
          username: playerName,
          level: 1,
          experience: 0,
          health: 100,
          max_health: 100,
          energy: 100,
          max_energy: 100,
          strength: 5,
          dexterity: 5,
          constitution: 5,
          qi: 5,
          wisdom: 5,
          intellect: 5,
          perception: 5,
          charisma: 5,
          current_location_id: null,
          current_location_name: null,
          current_area_name: null,
          current_activity: null,
        })
        .select()
        .single();

      if (error) throw error;

      // Initialize player skills
      await SkillsService.initializePlayerSkills(user.id);

      // Update local state with the created player data
      setGameState({
        playerId: user.id,
        playerName,
        level: data.level,
        experience: data.experience,
        health: data.health,
        maxHealth: data.max_health,
        energy: data.energy,
        maxEnergy: data.max_energy,
        currentLocationId: data.current_location_id,
        currentLocationName: data.current_location_name,
        currentAreaName: data.current_area_name,
        currentMiningAction: null, // New players won't have mining actions
        currentActivity: null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize player');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateGameState = (updates: Partial<GameState>) => {
    setGameState(prev => ({ ...prev, ...updates }));
  };

  const updatePlayerLocation = async (locationId: string, locationName: string, areaName: string) => {
    if (!user) throw new Error('User must be authenticated');

    setLoading(true);
    setError(null);

    try {
      // Update the database
      const { error } = await supabase
        .from('players')
        .update({ 
          current_location_id: locationId,
          current_location_name: locationName,
          current_area_name: areaName,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      // Update local state
      setGameState(prev => ({
        ...prev,
        currentLocationId: locationId,
        currentLocationName: locationName,
        currentAreaName: areaName,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update location');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateMiningAction = (miningAction: MiningAction | null) => {
    setGameState(prev => ({
      ...prev,
      currentMiningAction: miningAction,
    }));
  };

  const updateCurrentActivity = async (activity: string | null) => {
    if (!user) throw new Error('User must be authenticated');

    setLoading(true);
    setError(null);

    try {
      // Update the database
      const { error } = await supabase
        .from('players')
        .update({ 
          current_activity: activity,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      // Update local state
      setGameState(prev => ({
        ...prev,
        currentActivity: activity,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update activity');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    gameState,
    loading,
    error,
    initializePlayer,
    updateGameState,
    updatePlayerLocation,
    updateMiningAction,
    updateCurrentActivity,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};