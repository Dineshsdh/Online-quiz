import PropTypes from 'prop-types';

/**
 * Leaderboard component displaying ranked participants
 */
const Leaderboard = ({ entries, highlightParticipantId, maxEntries = 100 }) => {
    const getRankColor = (rank) => {
        if (rank === 1) return 'gold';
        if (rank === 2) return 'silver';
        if (rank === 3) return 'bronze';
        return '';
    };

    const getRankEmoji = (rank) => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return rank;
    };

    const displayEntries = entries.slice(0, maxEntries);

    if (!entries || entries.length === 0) {
        return (
            <div className="leaderboard">
                <p className="text-muted text-center" style={{ padding: '2rem' }}>
                    No submissions yet
                </p>
            </div>
        );
    }

    return (
        <div className="leaderboard">
            <div className="leaderboard-header">
                <span>Rank</span>
                <span>Name</span>
                <span style={{ textAlign: 'right' }}>Score</span>
            </div>

            {displayEntries.map((entry, idx) => {
                const rank = idx + 1;
                const isHighlighted = entry.participantId === highlightParticipantId;

                return (
                    <div
                        key={entry.participantId || idx}
                        className={`leaderboard-row ${isHighlighted ? 'highlight' : ''}`}
                    >
                        <span className={`rank ${getRankColor(rank)}`}>
                            {getRankEmoji(rank)}
                        </span>
                        <span>
                            {entry.participantName}
                            {isHighlighted && <span className="text-muted"> (You)</span>}
                        </span>
                        <span style={{ textAlign: 'right', fontWeight: '600' }}>
                            {entry.score}
                            {entry.correctAnswers !== undefined && (
                                <span className="text-muted" style={{ fontSize: '0.875rem' }}>
                                    {' '}({entry.correctAnswers}/{entry.totalQuestions})
                                </span>
                            )}
                        </span>
                    </div>
                );
            })}

            {entries.length > maxEntries && (
                <p className="text-muted text-center mt-md">
                    Showing top {maxEntries} of {entries.length} participants
                </p>
            )}
        </div>
    );
};

Leaderboard.propTypes = {
    entries: PropTypes.arrayOf(PropTypes.shape({
        participantId: PropTypes.string,
        participantName: PropTypes.string.isRequired,
        score: PropTypes.number.isRequired,
        correctAnswers: PropTypes.number,
        totalQuestions: PropTypes.number
    })).isRequired,
    highlightParticipantId: PropTypes.string,
    maxEntries: PropTypes.number
};

export default Leaderboard;
