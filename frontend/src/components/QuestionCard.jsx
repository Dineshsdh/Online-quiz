import PropTypes from 'prop-types';
import OptionButton from './OptionButton';

/**
 * Question card component displaying a single question with options
 */
const QuestionCard = ({
    question,
    questionNumber,
    selectedOption,
    onSelectOption,
    showCorrectAnswer = false,
    disabled = false
}) => {
    return (
        <div className="question-card fade-in">
            <div className="flex items-center gap-md mb-md">
                <span className="badge badge-draft">Q{questionNumber}</span>
                {question.points && (
                    <span className="text-muted">{question.points} pts</span>
                )}
            </div>

            <p className="question-prompt">{question.prompt}</p>

            <div className="options-grid">
                {question.options.map((option, idx) => (
                    <OptionButton
                        key={idx}
                        letter={String.fromCharCode(65 + idx)}
                        text={option}
                        isSelected={selectedOption === idx}
                        isCorrect={showCorrectAnswer && idx === question.correctOption}
                        isIncorrect={showCorrectAnswer && selectedOption === idx && idx !== question.correctOption}
                        onClick={() => onSelectOption(question._id, idx)}
                        disabled={disabled}
                    />
                ))}
            </div>
        </div>
    );
};

QuestionCard.propTypes = {
    question: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        prompt: PropTypes.string.isRequired,
        options: PropTypes.arrayOf(PropTypes.string).isRequired,
        points: PropTypes.number,
        correctOption: PropTypes.number
    }).isRequired,
    questionNumber: PropTypes.number.isRequired,
    selectedOption: PropTypes.number,
    onSelectOption: PropTypes.func.isRequired,
    showCorrectAnswer: PropTypes.bool,
    disabled: PropTypes.bool
};

export default QuestionCard;
