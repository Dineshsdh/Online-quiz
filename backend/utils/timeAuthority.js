/**
 * Time Authority - Server-side time management
 * All contest timing is controlled by the server
 */

/**
 * Get current server timestamp
 */
export const getServerTime = () => {
    return new Date();
};

/**
 * Calculate time remaining in seconds for a contest
 */
export const getTimeRemaining = (endTimestamp) => {
    const now = getServerTime();
    const end = new Date(endTimestamp);
    const remaining = Math.max(0, Math.floor((end - now) / 1000));
    return remaining;
};

/**
 * Check if a contest is still active
 */
export const isContestActive = (contest) => {
    if (contest.status !== 'live') return false;

    const now = getServerTime();
    const end = new Date(contest.endTimestamp);

    return now < end;
};

/**
 * Check if submission is within valid time window
 */
export const isSubmissionValid = (contest, gracePeriodSeconds = 5) => {
    if (contest.status === 'completed') return false;
    if (contest.status !== 'live') return false;

    const now = getServerTime();
    const end = new Date(contest.endTimestamp);

    // Allow a small grace period for network latency
    const endWithGrace = new Date(end.getTime() + (gracePeriodSeconds * 1000));

    return now <= endWithGrace;
};
