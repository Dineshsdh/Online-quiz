import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/axios';

/**
 * Hook for server-synchronized countdown timer
 */
export const useTimer = (endTimestamp, onTimeout) => {
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [serverOffset, setServerOffset] = useState(0);
    const intervalRef = useRef(null);
    const hasTimedOut = useRef(false);

    // Sync with server time
    const syncTime = useCallback(async () => {
        try {
            const before = Date.now();
            const response = await api.get('/contests/time/sync');
            const after = Date.now();

            // Estimate server time accounting for round trip
            const roundTrip = after - before;
            const serverTime = new Date(response.data.serverTime).getTime() + (roundTrip / 2);
            const offset = serverTime - Date.now();

            setServerOffset(offset);
        } catch (error) {
            console.error('Time sync failed:', error);
        }
    }, []);

    // Calculate time remaining using server-adjusted time
    const calculateRemaining = useCallback(() => {
        if (!endTimestamp) return 0;

        const serverNow = Date.now() + serverOffset;
        const end = new Date(endTimestamp).getTime();
        const remaining = Math.max(0, Math.floor((end - serverNow) / 1000));

        return remaining;
    }, [endTimestamp, serverOffset]);

    useEffect(() => {
        // Initial sync
        syncTime();

        // Sync periodically (every 30 seconds)
        const syncInterval = setInterval(syncTime, 30000);

        return () => clearInterval(syncInterval);
    }, [syncTime]);

    useEffect(() => {
        if (!endTimestamp) return;

        // Update timer every second
        intervalRef.current = setInterval(() => {
            const remaining = calculateRemaining();
            setTimeRemaining(remaining);

            if (remaining <= 0 && !hasTimedOut.current) {
                hasTimedOut.current = true;
                if (onTimeout) onTimeout();
                clearInterval(intervalRef.current);
            }
        }, 1000);

        // Initial calculation
        setTimeRemaining(calculateRemaining());

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [endTimestamp, calculateRemaining, onTimeout]);

    // Format time as MM:SS or HH:MM:SS
    const formatTime = useCallback((seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hrs > 0) {
            return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }, []);

    return {
        timeRemaining,
        formattedTime: formatTime(timeRemaining),
        isWarning: timeRemaining <= 60 && timeRemaining > 10,
        isDanger: timeRemaining <= 10,
        syncTime
    };
};

export default useTimer;
