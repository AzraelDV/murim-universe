import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { GameService, Player, Location, GameAction } from '../lib/gameService';
import { useAuth } from '../hooks/useAuth';

interface GameContextType {
  player: Player | null;
  currentLocation: Location | null;
  locations: Location[];
  locationActions: GameAction[];
  loading: boolean;
  error: string | null;
  
  // Actions
  initializePlayer: (username: string) => Promise<boolean>;
  moveToLocation: (locationId: string) => Promise<boolean>;
  performAction: (actionType: string, description: string) => Promise<boolean>;
  refreshLocationActions: () => Promise<void>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [player, setPlayer] = useState<Player | null>(null);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [locationActions, setLocationActions] = useState<GameAction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize game data when user logs in
  useEffect(() => {
    if (user) {
      loadGameData();
    } else {
      // Reset game state when user logs out
      setPlayer(null);
      setCurrentLocation(null);
      setLocations([]);
      setLocationActions([]);
    }
  }, [user]);

  // Subscribe to real-time location updates
  useEffect(() => {
    if (currentLocation) {
      const subscription = GameService.subscribeToLocationActions(
        currentLocation.id,
        (newAction: GameAction) => {
          setLocationActions(prev => [newAction, ...prev.slice(0, 9)]);
        }
      );

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [currentLocation]);

  const loadGameData = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      // Load player data
      const playerData = await GameService.getPlayer(user.id);
      setPlayer(playerData);

      // Load all locations
      const locationsData = await GameService.getLocations();
      setLocations(locationsData);

      // Load current location if player exists
      if (playerData?.current_location_id) {
        const locationData = await GameService.getLocation(playerData.current_location_id);
        setCurrentLocation(locationData);
        
        // Load recent actions for current location
        if (locationData) {
          const actionsData = await GameService.getLocationActions(locationData.id);
          setLocationActions(actionsData);
        }
      }
    } catch (err) {
      setError('Failed to load game data');
      console.error('Error loading game data:', err);
    } finally {
      setLoading(false);
    }
  };

  const initializePlayer = async (username: string): Promise<boolean> => {
    if (!user) return false;

    setLoading(true);
    setError(null);

    try {
      const newPlayer = await GameService.createPlayer(user, username);
      if (newPlayer) {
        setPlayer(newPlayer);
        
        // Load the starting location
        if (newPlayer.current_location_id) {
          const locationData = await GameService.getLocation(newPlayer.current_location_id);
          setCurrentLocation(locationData);
          
          // Load recent actions for starting location
          if (locationData) {
            const actionsData = await GameService.getLocationActions(locationData.id);
            setLocationActions(actionsData);
          }
        }
        
        // Log initial action
        await GameService.logAction(
          newPlayer.id,
          'join',
          `${username} has entered the world of cultivation`,
          newPlayer.current_location_id || undefined
        );
        
        return true;
      }
      return false;
    } catch (err) {
      setError('Failed to create player');
      console.error('Error creating player:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const moveToLocation = async (locationId: string): Promise<boolean> => {
    if (!player) return false;

    setLoading(true);
    setError(null);

    try {
      const success = await GameService.updatePlayerLocation(player.id, locationId);
      if (success) {
        const locationData = await GameService.getLocation(locationId);
        if (locationData) {
          setCurrentLocation(locationData);
          setPlayer(prev => prev ? { ...prev, current_location_id: locationId } : null);
          
          // Load actions for new location
          const actionsData = await GameService.getLocationActions(locationId);
          setLocationActions(actionsData);
          
          // Log movement action
          await GameService.logAction(
            player.id,
            'move',
            `${player.username} arrived at ${locationData.name}`,
            locationId
          );
        }
        return true;
      }
      return false;
    } catch (err) {
      setError('Failed to move to location');
      console.error('Error moving to location:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const performAction = async (actionType: string, description: string): Promise<boolean> => {
    if (!player || !currentLocation) return false;

    try {
      const success = await GameService.logAction(
        player.id,
        actionType,
        description,
        currentLocation.id
      );
      
      if (success) {
        // The real-time subscription will handle updating the UI
        return true;
      }
      return false;
    } catch (err) {
      setError('Failed to perform action');
      console.error('Error performing action:', err);
      return false;
    }
  };

  const refreshLocationActions = async () => {
    if (!currentLocation) return;

    try {
      const actionsData = await GameService.getLocationActions(currentLocation.id);
      setLocationActions(actionsData);
    } catch (err) {
      console.error('Error refreshing location actions:', err);
    }
  };

  const value: GameCont