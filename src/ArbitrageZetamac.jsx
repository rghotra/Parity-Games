import React, { useState, useEffect } from 'react';

export default function ArbitrageZetamac() {
  const [state, setState] = useState({
    duration: 120,
    randPos: true,
    startGame: false,
  });

  function handleInputChange(event) {
    const { name, type, value, checked } = event.target;
    setState((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : Number(value),
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setState((prev) => ({
      ...prev,
      startGame: true,
    }));
  }

  const changeSettings = () => {
    setState((prev) => ({
      ...prev,
      startGame: false,
    }));
  };

  if (state.startGame) {
    return (
      <PCPMispricingGame
        duration={state.duration}
        changeSettings={changeSettings}
        randomizePositions={state.randPos}
      />
    );
  }

  return (
    <div className="d-flex justify-content-center align-items-start">
      <div className="p-4" style={{ maxWidth: 500, backgroundColor: '#DDDDDD' }}>
        <h1 className="mb-4">PCP Mispricing Game</h1>
        <form onSubmit={handleSubmit} className="text-start">
          <p>
            Duration:
            <select name="duration" onChange={handleInputChange} value={state.duration}>
              <option value="30">30 seconds</option>
              <option value="60">60 seconds</option>
              <option value="120">120 seconds</option>
              <option value="300">300 seconds</option>
              <option value="600">600 seconds</option>
            </select>
          </p>
          <dl>
            <dt>
              <label>Randomize Positions &nbsp;</label>
              <input
                name="randPos"
                type="checkbox"
                checked={state.randPos}
                onChange={handleInputChange}
              />
            </dt>
            <dd>Scatter values across screen randomly every question</dd>
          </dl>
          <input type="submit" value="Start" />
        </form>
      </div>
    </div>
  );
}

function round(num) {
  return +num.toFixed(2);
}

// ... other imports
function PCPMispricingGame({ duration, questions, changeSettings, randomizePositions }) {
  const [state, setState] = useState({
    questionData: [],
    correctAnswer: '',
    mispricingDirection: '',
    score: 0,
    time: duration,
    history: [],
    questionStartTime: null,
  });

  const [gameKey, setGameKey] = useState(0);

  function round(num) {
    return +(num.toFixed(2));
  }

  const defaultPositions = (length) => {
    const positions = [];
    for (let i = 0; i < length; i++) {
      positions.push({
        top: (i + 0.5) * length / 60 * 100,
        left: 50,
      });
    }
    return positions;
  };

  const generatePositions = (length) => {
    if (!randomizePositions) return defaultPositions(length);

    const positions = [];
    const generateNonOverlappingPosition = () => {
      let attempt = 0;
      while (attempt < 100) {
        const top = Math.random() * 70 + 10;
        const left = Math.random() * 80 + 10;
        const tooCloseToInput = Math.abs(top - 50) < 10 && Math.abs(left - 50) < 15;
        const tooCloseToOthers = positions.some(
          (pos) => Math.abs(pos.top - top) < 12 && Math.abs(pos.left - left) < 15
        );
        if (!tooCloseToInput && !tooCloseToOthers) {
          positions.push({ top, left });
          return;
        }
        attempt++;
      }
      positions.push({ top: 10, left: 10 });
    };

    for (let i = 0; i < length; i++) {
      generateNonOverlappingPosition();
    }

    return positions;
  };

  const generateMispricedCallPutQuestion = () => {
    function gaussianNoise(mean = 0, stdDev = 0.05) {
      let u = 0, v = 0;
      while (u === 0) u = Math.random();
      while (v === 0) v = Math.random();
      return mean + stdDev * Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    }

    let callValue = -1;
    let putValue, strikeValue, stockValue, rcValue;

    while (callValue < 0) {
      strikeValue = Math.floor(Math.random() * 16) * 5 + 10;
      stockValue = round(Math.random() * 20 - 10 + strikeValue);
      rcValue = round(Math.random() * 0.3);
      putValue = round(Math.max(0, strikeValue - stockValue - rcValue) + Math.random() * 2);
      callValue = round(stockValue - strikeValue + putValue + rcValue);
    }

    const noise = gaussianNoise(0, 0.05);
    const noisyPutValue = round(putValue + noise);
    const parityCall = round(stockValue - strikeValue + noisyPutValue + rcValue);
    const callRounded = round(callValue);
    const parityRounded = round(parityCall);

    let correctAnswer;
    const isAskingForUnderpriced = Math.random() < 0.5;
    const mispricingDirection = isAskingForUnderpriced ? 'under' : 'over';

    if (callRounded === parityRounded) {
      correctAnswer = '-';
    } else {
      const isCallOverpriced = callRounded > parityRounded;
      correctAnswer = isAskingForUnderpriced
        ? (isCallOverpriced ? 'P' : 'C')
        : (isCallOverpriced ? 'C' : 'P');
    }

    const labels = [
      { label: 'C', value: callValue.toFixed(2) },
      { label: 'P', value: noisyPutValue.toFixed(2) },
      { label: 'K', value: strikeValue },
      { label: 'S', value: stockValue.toFixed(2) },
      { label: 'rc', value: rcValue.toFixed(2) },
    ];

    const positions = generatePositions(labels.length);
    const questionData = labels.map((item, idx) => ({ ...item, position: positions[idx] }));

    setState((prev) => ({
      ...prev,
      questionData,
      correctAnswer,
      mispricingDirection,
      questionStartTime: Date.now(),
    }));
  };

  function newQuestion() {
    generateMispricedCallPutQuestion();
  }

  function startGame() {
    newQuestion();
    const timerID = setInterval(() => {
      setState((prev) => {
        if (prev.time > 0) {
          return { ...prev, time: prev.time - 1 };
        } else {
          clearInterval(timerID);
          return prev;
        }
      });
    }, 1000);
    return () => clearInterval(timerID);
  }

  useEffect(() => {
    const cleanup = startGame();
    return cleanup;
  }, [gameKey]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      switch (event.key) {
        case 'ArrowLeft':
          handleAnswer('C');
          break;
        case 'ArrowRight':
          handleAnswer('P');
          break;
        case 'ArrowDown':
          handleAnswer('-');
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [state.correctAnswer, state.questionStartTime]);

  const handleAnswer = (choice) => {
    const timeTaken = (Date.now() - state.questionStartTime) / 1000;
    const isCorrect = choice === state.correctAnswer;

    const questionSummary = {
      questionData: state.questionData,
      userAnswer: choice,
      correctAnswer: state.correctAnswer,
      mispricingDirection: state.mispricingDirection,
      isCorrect,
      timeTaken: +timeTaken.toFixed(2),
      predictionType: state.mispricingDirection,
    };

    setState((prev) => ({
      ...prev,
      score: prev.score + (isCorrect ? 1 : -1),
      history: [...prev.history, questionSummary],
    }));

    newQuestion();
  };

  const restart = () => {
    setState((prev) => ({
      ...prev,
      time: duration,
      score: 0,
      history: [],
      questionStartTime: null,
    }));
    setGameKey((prev) => prev + 1);
  };

  if (state.time <= 0) {
    return (
      <div className="container py-4">
        <h2 className="text-center">Game Over</h2>
        <p className="text-center" style={{ fontSize: 24 }}>Final Score: {state.score}</p>
        <div className="text-center my-3">
          <button className="btn btn-primary mx-2" onClick={restart}>Restart</button>
          <button className="btn btn-secondary mx-2" onClick={changeSettings}>Change Settings</button>
        </div>
        <hr />
        <h4>Question Log</h4>
        <table className="table table-bordered mt-3">
          <thead>
            <tr>
              <th>#</th>
              <th>Correct</th>
              <th>User</th>
              <th>✓ / ✗</th>
              <th>Time (s)</th>
              <th>Prediction</th>
              <th>Inputs</th>
            </tr>
          </thead>
          <tbody>
            {state.history.map((entry, index) => (
              <tr key={index} className={entry.isCorrect ? 'table-success' : 'table-danger'}>
                <td>{index + 1}</td>
                <td>{entry.correctAnswer}</td>
                <td>{entry.userAnswer}</td>
                <td>{entry.isCorrect ? '✓' : '✗'}</td>
                <td>{entry.timeTaken}</td>
                <td>{entry.predictionType}</td>
                <td>
                  {entry.questionData.map(({ label, value }) => `${label}: ${value}`).join(', ')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column justify-content-start align-items-center vh-100">
      <div className="row w-100">
        <div className="d-flex justify-content-between px-3 py-3">
          <h4>Seconds left: {state.time}</h4>
          <h4>Score: {state.score}</h4>
        </div>
      </div>

      <div className="row w-100 h-100 position-relative" style={{ marginTop: 50, fontSize: 24 }}>
        <div className="position-absolute top-50 start-50 translate-middle text-center" style={{ zIndex: 10 }}>
          <p style={{ fontSize: 20 }}>
            {`Which is ${state.mispricingDirection}priced?`}
          </p>
          <div className="d-flex gap-3 justify-content-center mt-2">
            <button className="btn btn-primary px-4" style={{ fontSize: 20 }} onClick={() => handleAnswer('C')}>
              C
            </button>
            <button className="btn btn-danger px-4" style={{ fontSize: 20 }} onClick={() => handleAnswer('-')}>
              -
            </button>
            <button className="btn btn-success px-4" style={{ fontSize: 20 }} onClick={() => handleAnswer('P')}>
              P
            </button>
          </div>
        </div>

        {state.questionData.map((item, idx) => (
          <div
            key={idx}
            className="position-absolute p-2 rounded"
            style={{
              top: `${item.position.top}%`,
              left: `${item.position.left}%`,
              transform: 'translate(-50%, -50%)',
              whiteSpace: 'nowrap',
              pointerEvents: 'auto',
              width: 'auto',
              maxWidth: 'max-content',
              zIndex: 1,
            }}
          >
            {item.label}: {item.value}
          </div>
        ))}
      </div>
    </div>
  );
}
