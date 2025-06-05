import React from 'react';

const ShareableStats = ({
  score,
  difficulty,
  totalCorrect,
  bestStreak,
  accuracy,
}) => {
  const difficultyText =
    difficulty === 'easy'
      ? 'קל'
      : difficulty === 'medium'
      ? 'בינוני'
      : difficulty === 'hard'
      ? 'קשה'
      : 'אלופות';

  return (
    <div
      style={{
        padding: '20px',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        fontFamily: 'Arial, sans-serif',
        direction: 'rtl',
        textAlign: 'center',
        width: '320px',
        margin: '0 auto',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '24px', marginBottom: '8px' }}>🎯 מדהים!</div>
        <div style={{ fontSize: '16px', color: '#666', marginBottom: '4px' }}>
          מבחן ברמה {difficultyText}
        </div>
        <div style={{ fontSize: '14px', color: '#888' }}>ממשיכים להתקדם!</div>
      </div>

      {/* Statistics */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div
          style={{
            padding: '12px',
            backgroundColor: '#e3f2fd',
            borderRadius: '12px',
            border: '1px solid #bbdefb',
          }}
        >
          <div
            style={{
              color: '#1565c0',
              fontWeight: 'bold',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '38px', // Ensure consistent height
            }}
          >
            הניקוד שלך: {score}
          </div>
        </div>

        <div
          style={{
            padding: '12px',
            backgroundColor: '#e8f5e8',
            borderRadius: '12px',
            border: '1px solid #c8e6c9',
          }}
        >
          <div
            style={{
              color: '#2e7d32',
              fontWeight: 'bold',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '38px', // Ensure consistent height
            }}
          >
            תשובות נכונות: {totalCorrect}
          </div>
        </div>

        <div
          style={{
            padding: '12px',
            backgroundColor: '#fff3e0',
            borderRadius: '12px',
            border: '1px solid #ffcc02',
          }}
        >
          <div
            style={{
              color: '#f57c00',
              fontWeight: 'bold',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '38px', // Ensure consistent height
            }}
          >
            הרצף הטוב ביותר: {bestStreak}
          </div>
        </div>

        {accuracy > 0 && (
          <div
            style={{
              padding: '12px',
              backgroundColor: '#f3e5f5',
              borderRadius: '12px',
              border: '1px solid #ce93d8',
            }}
          >
            <div
              style={{
                color: '#7b1fa2',
                fontWeight: 'bold',
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '38px', // Ensure consistent height
              }}
            >
              דיוק: {accuracy}%
            </div>
          </div>
        )}

        {accuracy >= 80 && (
          <div
            style={{
              padding: '16px',
              background: 'linear-gradient(135deg, #ffd54f, #42a5f5)',
              borderRadius: '12px',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: '16px',
              marginTop: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '38px', // Ensure consistent height
            }}
          >
            🌟 ביצוע מעולה! את אלופה אמיתית! 🌟
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: '20px',
          fontSize: '12px',
          color: '#999',
          borderTop: '1px solid #eee',
          paddingTop: '12px',
        }}
      >
        משחק לוח הכפל 🧮
      </div>
    </div>
  );
};

export default ShareableStats;
