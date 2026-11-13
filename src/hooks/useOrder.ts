import { useState, useEffect, useCallback } from 'react';
import { GroupOrder, Participant } from '../types/order';
import {
  subscribeToOrder,
  getOrderById,
  getOrderParticipants,
  joinGroupOrder,
  leaveGroupOrder,
} from '../services/orderService';
import { useAuth } from './useAuth';

export function useOrder(orderId?: string) {
  const { user } = useAuth();
  const [order, setOrder] = useState<GroupOrder | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!orderId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const fetchedOrder = await getOrderById(orderId);
      const fetchedParticipants = await getOrderParticipants(orderId);
      setOrder(fetchedOrder);
      setParticipants(fetchedParticipants);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load order');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToOrder(orderId, async (updatedOrder) => {
      setOrder(updatedOrder);
      if (updatedOrder) {
        const fetchedParts = await getOrderParticipants(orderId);
        setParticipants(fetchedParts);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [orderId]);

  const join = async () => {
    if (!orderId || !user || !user.hostelId) {
      throw new Error('User must be in a hostel to join.');
    }
    const res = await joinGroupOrder(orderId, user.userId, user.displayName, user.hostelId);
    setOrder(res.order);
    await refresh();
    return res;
  };

  const leave = async () => {
    if (!orderId || !user) {
      throw new Error('User not authenticated.');
    }
    const res = await leaveGroupOrder(orderId, user.userId);
    await refresh();
    return res;
  };

  const isOrganizer = Boolean(user && order && order.organizerId === user.userId);
  const isParticipant = Boolean(
    user && participants.some((p) => p.userId === user.userId && p.isActive)
  );
  const currentParticipant =
    participants.find((p) => user && p.userId === user.userId && p.isActive) || null;

  return {
    order,
    participants,
    loading,
    error,
    isOrganizer,
    isParticipant,
    currentParticipant,
    join,
    leave,
    refresh,
  };
}

