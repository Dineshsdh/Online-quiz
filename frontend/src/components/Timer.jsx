import PropTypes from 'prop-types';

/**
 * Timer component displaying countdown
 * Changes color when time is running low
 */
const Timer = ({ timeRemaining, formattedTime, size = 'large' }) => {
    const isWarning = timeRemaining <= 60 && timeRemaining > 10;
    const isDanger = timeRemaining <= 10;

    const sizeClasses = {
        small: { fontSize: '1.5rem', padding: '0.5rem' },
        medium: { fontSize: '2.5rem', padding: '0.75rem 1rem' },
        large: { fontSize: '4rem', padding: '1rem 1.5rem' }
    };

    const getTimerClass = () => {
        let className = 'timer';
        if (isWarning) className += ' timer-warning';
        if (isDanger) className += ' timer-danger';
        return className;
    };

    return (
        <div
            className={getTimerClass()}
            style={sizeClasses[size]}
        >
            {formattedTime}
        </div>
    );
};

Timer.propTypes = {
    timeRemaining: PropTypes.number.isRequired,
    formattedTime: PropTypes.string.isRequired,
    size: PropTypes.oneOf(['small', 'medium', 'large'])
};

export default Timer;
