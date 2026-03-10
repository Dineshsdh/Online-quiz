import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

/**
 * Hook for synchronizing with server time
 * Calculates offset between client and server clocks
 */
export const useServerSync = () => {
    const [serverOffset, setServerOffset] = useState(0);
    const [lastSyncTime, setLastSyncTime] = useState(null);
    const [isSyncing, setIsSyncing] = useState(false);

    /**
     * Synchronize with server time
     * Accounts for network round-trip time
     */
    const syncTime = useCallback(async () => {
        setIsSyncing(true);

        try {
            const before = Date.now();
            const response = await api.get('/contests/time/sync');
            const after = Date.now();

            // Estimate server time accounting for round trip
            const roundTrip = after - before;
            const serverTime = new Date(response.data.serverTime).getTime() + (roundTrip / 2);
            const offset = serverTime - Date.now();

            setServerOffset(offset);
            setLastSyncTime(new Date());

            return offset;
        } catch (error) {
            console.error('Time sync failed:', error);
            return serverOffset; // Return existing offset on failure
        } finally {
            setIsSyncing(false);
        }
    }, [serverOffset]);

    /**
     * Get current server time (client time + offset)
     */
    const getServerTime = useCallback(() => {
        return new Date(Date.now() + serverOffset);
    }, [serverOffset]);

    /**
     * Get server timestamp in milliseconds
     */
    const getServerTimestamp = useCallback(() => {
        return Date.now() + serverOffset;
    }, [serverOffset]);

    // Initial sync on mount
    useEffect(() => {
        syncTime();
    }, []);

    // Auto-sync every 30 seconds
    useEffect(() => {
        const interval = setInterval(syncTime, 30000);
        return () => clearInterval(interval);
    }, [syncTime]);

    return {
        serverOffset,
        lastSyncTime,
        isSyncing,
        syncTime,
        getServerTime,
        getServerTimestamp
    };
};

export default useServerSync;
