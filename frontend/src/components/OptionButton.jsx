import PropTypes from 'prop-types';

/**
 * Single answer option button
 */
const OptionButton = ({
    letter,
    text,
    isSelected = false,
    isCorrect = false,
    isIncorrect = false,
    onClick,
    disabled = false
}) => {
    const getClassName = () => {
        let className = 'option-btn';
        if (isSelected) className += ' selected';
        if (isCorrect) className += ' correct';
        if (isIncorrect) className += ' incorrect';
        return className;
    };

    return (
        <button
            className={getClassName()}
            onClick={onClick}
            disabled={disabled}
            type="button"
        >
            <span className="option-letter">{letter}</span>
            <span>{text}</span>
            {isCorrect && <span className="text-success" style={{ marginLeft: 'auto' }}>✓</span>}
            {isIncorrect && <span className="text-danger" style={{ marginLeft: 'auto' }}>✗</span>}
        </button>
    );
};

OptionButton.propTypes = {
    letter: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    isSelected: PropTypes.bool,
    isCorrect: PropTypes.bool,
    isIncorrect: PropTypes.bool,
    onClick: PropTypes.func.isRequired,
    disabled: PropTypes.bool
};

export default OptionButton;
