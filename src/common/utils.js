// shareUtils.js
import html2canvas from 'html2canvas';

export const shareResultsAsImage = async (elementRef, gameData, callbacks = {}) => {
    const {
        score,
        difficulty,
        totalCorrect,
        bestStreak,
        accuracy,
        setFeedback,
        setShowFeedback
    } = gameData;

    try {
        // Ensure the element is properly positioned before capture
        const element = elementRef.current;

        // Temporarily add some styling to ensure proper centering
        const originalStyle = {
            position: element.style.position,
            transform: element.style.transform,
            margin: element.style.margin
        };

        element.style.position = 'relative';
        element.style.transform = 'none';
        element.style.margin = 'auto';

        // Wait a brief moment for styles to apply
        await new Promise(resolve => setTimeout(resolve, 100));

        // Capture the results component as an image
        const canvas = await html2canvas(element, {
            backgroundColor: '#ffffff',
            scale: 2, // Higher quality
            useCORS: true,
            allowTaint: true,
            logging: false,
            scrollX: 0,
            scrollY: 0,
            x: 0,
            y: 0,
            width: element.offsetWidth,
            height: element.offsetHeight,
        });

        // Restore original styles
        element.style.position = originalStyle.position;
        element.style.transform = originalStyle.transform;
        element.style.margin = originalStyle.margin;

        // Convert canvas to blob
        canvas.toBlob(async (blob) => {
            const file = new File([blob], 'math-game-results.png', {
                type: 'image/png',
            });

            const difficultyText =
                difficulty === 'easy'
                    ? 'קל'
                    : difficulty === 'medium'
                        ? 'בינוני'
                        : difficulty === 'hard'
                            ? 'קשה'
                            : 'אלופות';

            const shareText = `השגתי ${score} נקודות במשחק לוח הכפל! 🎯\nרמה: ${difficultyText}\n\nבואו נתאמן יחד! 🌟`;

            // Check if Web Share API supports files
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                try {
                    await navigator.share({
                        title: 'משחק לוח הכפל',
                        text: shareText,
                        files: [file],
                    });
                } catch (err) {
                    console.log('Error sharing:', err);
                    fallbackShareImage(canvas, shareText, setFeedback, setShowFeedback);
                }
            } else {
                fallbackShareImage(canvas, shareText, setFeedback, setShowFeedback);
            }
        }, 'image/png');
    } catch (error) {
        console.error('Error capturing screenshot:', error);
        // Fallback to text sharing
        shareTextOnly(gameData);
    }
};

const fallbackShareImage = (canvas, shareText, setFeedback, setShowFeedback) => {
    // Create download link for the image
    const link = document.createElement('a');
    link.download = 'math-game-results.png';
    link.href = canvas.toDataURL();

    // Also copy text to clipboard
    navigator.clipboard.writeText(shareText).then(() => {
        // Auto-download the image
        link.click();

        // Show feedback
        if (setFeedback && setShowFeedback) {
            setFeedback('התמונה הורדה והטקסט הועתק! שתפו בוואטסאפ או SMS 📱');
            setShowFeedback(true);
            setTimeout(() => setShowFeedback(false), 3000);
        }
    });
};

export const shareTextOnly = (gameData) => {
    const {
        score,
        difficulty,
        totalCorrect,
        bestStreak,
        setFeedback,
        setShowFeedback
    } = gameData;

    const difficultyText =
        difficulty === 'easy'
            ? 'קל'
            : difficulty === 'medium'
                ? 'בינוני'
                : difficulty === 'hard'
                    ? 'קשה'
                    : 'אלופות';

    const shareText = `השגתי ${score} נקודות במשחק לוח הכפל! 🎯\nרמה: ${difficultyText}\nתשובות נכונות: ${totalCorrect}\nרצף הטוב ביותר: ${bestStreak}\n\nבואו נתאמן יחד! 🌟`;

    if (navigator.share) {
        navigator.share({
            title: 'משחק לוח הכפל',
            text: shareText,
        });
    } else {
        navigator.clipboard.writeText(shareText);
        if (setFeedback && setShowFeedback) {
            setFeedback('ההישג הועתק ללוח! 📋');
            setShowFeedback(true);
            setTimeout(() => setShowFeedback(false), 2000);
        }
    }
};