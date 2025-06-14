import React, { useState, useEffect } from 'react';

export default function PCPZetamac2() {

  const [state, setState] = useState({
    putCall: true,
    straddle: true,
    combo: true,
    bwps: true,
    delta: true,
    duration: 120,
    randPos: false,
    randOrd: false,
    startGame: false,
    questions: []
  });

  function handleInputChange(event) {
    const {name, type, value, checked} = event.target;
    setState((prev) => ({
      ...prev,
      [name]: type == 'checkbox' ? checked : Number(value),
    }))
  }

  function handleSubmit(event) {
    var questions = []
    if (state.putCall){
      questions.push(0)
      questions.push(1)
    }
    if (state.combo){
      questions.push(2)
    }
    if (state.straddle){
      questions.push(3)
      questions.push(4)
      questions.push(5)
      questions.push(6)
    }
    if (state.bwps){
      questions.push(7)
      questions.push(8)
      questions.push(9)
      questions.push(10)
    }
    if (state.delta) {
      questions.push(11)
      questions.push(12)
    }
    if (questions.length > 0) {
      setState((prev) => ({
        ...prev,
        "startGame": true,
        "questions": questions
      }));
    }
    event.preventDefault();
  }

  var changeSettings = () => {
    setState((prev) => ({
        ...prev,
        "startGame": false,
      }))
  };

  if (state.startGame) {
    return <PCPZetamac2Question
              duration={state.duration}
              questions={state.questions}
              changeSettings={changeSettings}
              randomizePositions={state.randPos}
              randomizeOrder={state.randOrd}
            />
  }

  return (
    <div className="d-flex justify-content-center align-items-start">
      <div className='p-4' style={{ maxWidth: 500, backgroundColor: '#DDDDDD' }}>

        <h1 className="mb-4">PCP Zetamac ++</h1>


        <form onSubmit={handleSubmit} className="text-start">

          <dl>

            <dt>
              <label>Put-Call &nbsp;</label>
              <input name='putCall' type='checkbox' checked={state.putCall} onChange={handleInputChange} />
            </dt>
            <dd>Converting call to put and vice versa</dd>
          
            <dt>
              <label>Combo &nbsp;</label>
              <input name='combo' type='checkbox' checked={state.combo} onChange={handleInputChange} />
            </dt>
            <dd>Converting combo value to stock value</dd>
          
            <dt>
              <label>Straddle &nbsp;</label>
              <input name='straddle' type='checkbox' checked={state.straddle} onChange={handleInputChange} />
            </dt>
            <dd>Converting straddle to call or put value and vice versa</dd>
          
            <dt>
              <label>B/W and P+S &nbsp;</label>
              <input name='bwps' type='checkbox' checked={state.bwps} onChange={handleInputChange} />
            </dt>
            <dd>Converting B/W or P+S to call or put value</dd>

            <dt>
              <label>Delta Adjust &nbsp;</label>
              <input name='delta' type='checkbox' checked={state.delta} onChange={handleInputChange} />
            </dt>
            <dd>Repricing based on delta and underlying</dd>

          </dl>

          <p>
            Duration:
            <select name='duration' onChange={handleInputChange} value={state.duration}>
              <option value='30'>30 seconds</option>
              <option value='60'>60 seconds</option>
              <option value='120'>120 seconds</option>
              <option value='300'>300 seconds</option>
              <option value='600'>600 seconds</option>
            </select>
          </p>

          <dl>

            <dt>
              <label>Randomize Positions &nbsp;</label>
              <input name='randPos' type='checkbox' checked={state.randPos} onChange={handleInputChange} />
            </dt>
            <dd>Scatter values across screen randomly every question</dd>

            <dt>
              <label>Randomize Order &nbsp;</label>
              <input name='randOrd' type='checkbox' checked={state.randOrd} onChange={handleInputChange} />
            </dt>
            <dd>Randomly order values for each question</dd>

          </dl>

          <input type='submit' value='Start'>
          </input>

        </form>

      </div>
    </div>
  );

}


function round(num){
  return +(num.toFixed(2))
}

const questionNames = [
  'Put to Call',
  'Call to Put',
  'Combo to Stock',
  'Straddle To Call',
  'Straddle To Put',
  'Call To Straddle',
  'Put To Straddle',
  'B/W To Call',
  'B/W To Put',
  'P+S To Call',
  'P+S To Put',
  'Call Delta Adjust',
  'Put Delta Adjust',
];

function PCPZetamac2Question({ duration, questions, changeSettings, randomizePositions, randomizeOrder }) {

  const [state, setState] = useState({
    questionData: [],
    questionType: 0,
    unknownValue: 0,
    unknownLabel: '',
    score: 0,
    time: duration,
    history: [],
    questionStartTime: null,
  });
  const [gameKey, setGameKey] = useState(0);




  const defaultPositions = (length) => {
    let positions = []

    for (let i = 0; i < length; i++) {
      positions.push({
        top: (i+0.5) * 45/length,
        left: 50,
      })
    }

    if (randomizeOrder) {
      positions = positions
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value)
    }

    return positions;
  }

  const generatePositions = (length) => {

    if (!randomizePositions) {
      return defaultPositions(length);
    }

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
      positions.push({ top: 10, left: 10 }); // fallback
    };

    for (let i = 0; i < length; i++) {
      generateNonOverlappingPosition();
    }

    return positions;
  };

  // Questions ------------------------------------------------------------------------------------------------------------

  const missingCallQuestion = () => {
    let callValue = -1;
    while (callValue < 0) {
      var strikeValue = Math.floor(Math.random() * 16) * 5 + 10;
      var stockValue = round(Math.random() * 20) - 10 + strikeValue;
      var rcValue = round(Math.random() * 0.3);
      var putValue = round(Math.max(0, strikeValue - stockValue - rcValue) + Math.random() * 2);
      callValue = round(stockValue - strikeValue + putValue + rcValue);
    }

    const labels = [
      { label: 'C', value: '?' },
      { label: 'P', value: putValue.toFixed(2) },
      { label: 'K', value: strikeValue },
      { label: 'S', value: stockValue.toFixed(2) },
      { label: 'rc', value: rcValue.toFixed(2) }
    ];

    const positions = generatePositions(labels.length);
    const questionData = labels.map((item, idx) => ({ ...item, position: positions[idx] }));

    setState((prev) => ({
      ...prev,
      questionType: 0,
      unknownValue: callValue,
      unknownLabel: 'C',
      questionData,
      questionStartTime: Date.now(),
    }));
  };

  const missingPutQuestion = () => {
    let putValue = -1;
    while (putValue < 0) {
      var strikeValue = Math.floor(Math.random() * 16) * 5 + 10;
      var stockValue = round(Math.random() * 20) - 10 + strikeValue;
      var rcValue = round(Math.random() * 0.3);
      var callValue = round(Math.max(0, stockValue - strikeValue + rcValue) + Math.random() * 2);
      putValue = round(strikeValue - stockValue + callValue - rcValue);
    }

    const labels = [
      { label: 'C', value: callValue.toFixed(2) },
      { label: 'P', value: '?' },
      { label: 'K', value: strikeValue },
      { label: 'S', value: stockValue.toFixed(2) },
      { label: 'rc', value: rcValue.toFixed(2) }
    ];

    const positions = generatePositions(labels.length);
    const questionData = labels.map((item, idx) => ({ ...item, position: positions[idx] }));

    setState((prev) => ({
      ...prev,
      questionType: 1,
      unknownValue: putValue,
      unknownLabel: 'P',
      questionData,
      questionStartTime: Date.now(),
    }));
  };

  const missingStockQuestion = () => {
    var strikeValue = Math.floor(Math.random() * 16) * 5 + 10;
    var comboValue = round(Math.random() * 20) - 10;
    var rcValue = round(Math.random() * 0.3);
    var stockValue = round(comboValue + strikeValue - rcValue);

    const labels = [
      { label: 'K', value: strikeValue },
      { label: 'S', value: '?' },
      { label: 'Combo', value: comboValue.toFixed(2) },
      { label: 'rc', value: rcValue.toFixed(2) }
    ];

    const positions = generatePositions(labels.length);
    const questionData = labels.map((item, idx) => ({ ...item, position: positions[idx] }));

    setState((prev) => ({
      ...prev,
      questionType: 2,
      unknownValue: stockValue,
      unknownLabel: 'S',
      questionData,
      questionStartTime: Date.now(),
    }));
  };

  const straddleToCall = () => {
    let callValue = -1;
    while (callValue < 0) {
      var strikeValue = Math.floor(Math.random() * 16) * 5 + 10;
      var stockValue = round(Math.random() * 20) - 10 + strikeValue;
      var rcValue = round(Math.random() * 0.3);
      var putValue = round(Math.max(0, strikeValue - stockValue - rcValue) + Math.random() * 2);
      callValue = round(stockValue - strikeValue + putValue + rcValue);
    }

    const straddleValue = callValue + putValue;
    const labels = [
      { label: 'Straddle', value: straddleValue.toFixed(2) },
      { label: 'C', value: '?' },
      { label: 'S', value: stockValue.toFixed(2) },
      { label: 'K', value: strikeValue },
      { label: 'rc', value: rcValue.toFixed(2) }
    ];

    const positions = generatePositions(labels.length);
    const questionData = labels.map((item, idx) => ({ ...item, position: positions[idx] }));

    setState((prev) => ({
      ...prev,
      questionType: 3,
      unknownValue: callValue,
      unknownLabel: 'C',
      questionData,
      questionStartTime: Date.now(),
    }));
  };

  const straddleToPut = () => {
    let putValue = -1;
    while (putValue < 0) {
      var strikeValue = Math.floor(Math.random() * 16) * 5 + 10;
      var stockValue = round(Math.random() * 20) - 10 + strikeValue;
      var rcValue = round(Math.random() * 0.3);
      var callValue = round(Math.max(0, stockValue - strikeValue + rcValue) + Math.random() * 2);
      putValue = round(strikeValue - stockValue + callValue - rcValue);
    }

    const straddleValue = callValue + putValue;
    const labels = [
      { label: 'Straddle', value: straddleValue.toFixed(2) },
      { label: 'P', value: '?' },
      { label: 'S', value: stockValue.toFixed(2) },
      { label: 'K', value: strikeValue },
      { label: 'rc', value: rcValue.toFixed(2) }
    ];

    const positions = generatePositions(labels.length);
    const questionData = labels.map((item, idx) => ({ ...item, position: positions[idx] }));

    setState((prev) => ({
      ...prev,
      questionType: 4,
      unknownValue: putValue,
      unknownLabel: 'P',
      questionData,
      questionStartTime: Date.now(),
    }));
  };

  const callToStraddle = () => {
    var strikeValue = Math.floor(Math.random() * 16) * 5 + 10;
    var stockValue = round(Math.random() * 20) - 10 + strikeValue;
    var rcValue = round(Math.random() * 0.3);
    var callValue = round(Math.max(0, stockValue - strikeValue + rcValue) + Math.random() * 2);
    var putValue = round(strikeValue - stockValue + callValue - rcValue);
    var straddleValue = round(callValue + putValue);

    const labels = [
      { label: 'Straddle', value: '?' },
      { label: 'C', value: callValue.toFixed(2) },
      { label: 'S', value: stockValue.toFixed(2) },
      { label: 'K', value: strikeValue },
      { label: 'rc', value: rcValue.toFixed(2) }
    ];

    const positions = generatePositions(labels.length);
    const questionData = labels.map((item, idx) => ({ ...item, position: positions[idx] }));

    setState((prev) => ({
      ...prev,
      questionType: 5,
      unknownValue: straddleValue,
      unknownLabel: 'Straddle',
      questionData,
      questionStartTime: Date.now(),
    }));
  };

  const putToStraddle = () => {
    var strikeValue = Math.floor(Math.random() * 16) * 5 + 10;
    var stockValue = round(Math.random() * 20) - 10 + strikeValue;
    var rcValue = round(Math.random() * 0.3);
    var callValue = round(Math.max(0, stockValue - strikeValue + rcValue) + Math.random() * 2);
    var putValue = round(strikeValue - stockValue + callValue - rcValue);
    var straddleValue = round(callValue + putValue);

    const labels = [
      { label: 'Straddle', value: '?' },
      { label: 'P', value: putValue.toFixed(2) },
      { label: 'S', value: stockValue.toFixed(2) },
      { label: 'K', value: strikeValue },
      { label: 'rc', value: rcValue.toFixed(2) }
    ];

    const positions = generatePositions(labels.length);
    const questionData = labels.map((item, idx) => ({ ...item, position: positions[idx] }));

    setState((prev) => ({
      ...prev,
      questionType: 6,
      unknownValue: straddleValue,
      unknownLabel: 'Straddle',
      questionData,
      questionStartTime: Date.now(),
    }));
  };

  const bwToCall = () => {
    let callValue = -1;
    while (callValue < 0) {
      var strikeValue = Math.floor(Math.random() * 16) * 5 + 10;
      var stockValue = round(Math.random() * 20) - 10 + strikeValue;
      var rcValue = round(Math.random() * 0.3);
      callValue = round(Math.max(0, stockValue - strikeValue + rcValue) + Math.random() * 2);
    }

    var bwValue = callValue - (stockValue - strikeValue);

    const labels = [
      { label: 'B/W', value: bwValue.toFixed(2) },
      { label: 'C', value: '?' },
      { label: 'S', value: stockValue.toFixed(2) },
      { label: 'K', value: strikeValue },
      { label: 'rc', value: rcValue.toFixed(2) }
    ];

    const positions = generatePositions(labels.length);
    const questionData = labels.map((item, idx) => ({ ...item, position: positions[idx] }));

    setState((prev) => ({
      ...prev,
      questionType: 7,
      unknownValue: callValue,
      unknownLabel: 'C',
      questionData,
      questionStartTime: Date.now(),
    }));
  };

  const bwToPut = () => {
    let putValue = -1;
    while (putValue < 0) {
      var strikeValue = Math.floor(Math.random() * 16) * 5 + 10;
      var stockValue = round(Math.random() * 20) - 10 + strikeValue;
      var rcValue = round(Math.random() * 0.3);
      putValue = round(Math.max(0, strikeValue - stockValue - rcValue) + Math.random() * 2);
    }

    var bwValue = putValue + rcValue;

    const labels = [
      { label: 'B/W', value: bwValue.toFixed(2) },
      { label: 'P', value: '?' },
      { label: 'S', value: stockValue.toFixed(2) },
      { label: 'K', value: strikeValue },
      { label: 'rc', value: rcValue.toFixed(2) }
    ];

    const positions = generatePositions(labels.length);
    const questionData = labels.map((item, idx) => ({ ...item, position: positions[idx] }));

    setState((prev) => ({
      ...prev,
      questionType: 8,
      unknownValue: putValue,
      unknownLabel: 'P',
      questionData,
      questionStartTime: Date.now(),
    }));
  };

  const psToCall = () => {
    let callValue = -1;
    while (callValue < 0) {
      var strikeValue = Math.floor(Math.random() * 16) * 5 + 10;
      var stockValue = round(Math.random() * 20) - 10 + strikeValue;
      var rcValue = round(Math.random() * 0.3);
      callValue = round(Math.max(0, stockValue - strikeValue + rcValue) + Math.random() * 2);
    }

    var psValue = callValue - rcValue;

    const labels = [
      { label: 'P+S', value: psValue.toFixed(2) },
      { label: 'C', value: '?' },
      { label: 'S', value: stockValue.toFixed(2) },
      { label: 'K', value: strikeValue },
      { label: 'rc', value: rcValue.toFixed(2) }
    ];

    const positions = generatePositions(labels.length);
    const questionData = labels.map((item, idx) => ({ ...item, position: positions[idx] }));

    setState((prev) => ({
      ...prev,
      questionType: 9,
      unknownValue: callValue,
      unknownLabel: 'C',
      questionData,
      questionStartTime: Date.now(),
    }));
  };

  const psToPut = () => {
    let putValue = -1;
    while (putValue < 0) {
      var strikeValue = Math.floor(Math.random() * 16) * 5 + 10;
      var stockValue = round(Math.random() * 20) - 10 + strikeValue;
      var rcValue = round(Math.random() * 0.3);
      putValue = round(Math.max(0, strikeValue - stockValue - rcValue) + Math.random() * 2);
    }

    var psValue = putValue - (strikeValue - stockValue);

    const labels = [
      { label: 'P+S', value: psValue.toFixed(2) },
      { label: 'P', value: '?' },
      { label: 'S', value: stockValue.toFixed(2) },
      { label: 'K', value: strikeValue },
      { label: 'rc', value: rcValue.toFixed(2) }
    ];

    const positions = generatePositions(labels.length);
    const questionData = labels.map((item, idx) => ({ ...item, position: positions[idx] }));

    setState((prev) => ({
      ...prev,
      questionType: 10,
      unknownValue: putValue,
      unknownLabel: 'P',
      questionData,
      questionStartTime: Date.now(),
    }));
  };

  const callDeltaAdjust = () => {
    let newCall = -1
    while (newCall < 0) {
      var strikeValue = Math.floor(Math.random() * 16) * 5 + 10;
      var stockValue = round(Math.random() * 20) - 10 + strikeValue;
      var rcValue = round(Math.random() * 0.3);
      var callValue = round(Math.max(0, stockValue - strikeValue + rcValue) + Math.random() * 2);

      var delta = Math.floor(Math.random() * 101);
      var newStock = Math.max(0, stockValue + round(Math.random() * 1 - 0.5))

      newCall = round(callValue + (newStock - stockValue)*(delta/100))
    }

    const labels = [
      { label: 'C', value: callValue.toFixed(2) },
      { label: 'K', value: strikeValue },
      { label: 'ref', value: stockValue.toFixed(2) },
      { label: 'rc', value: rcValue.toFixed(2) },
      { label: 'Δ', value: delta },
      { label: 'S', value: newStock.toFixed(2) },
      { label: 'C\'', value: '?' },
    ];

    const positions = generatePositions(labels.length);
    const questionData = labels.map((item, idx) => ({ ...item, position: positions[idx] }));

    setState((prev) => ({
      ...prev,
      questionType: 11,
      unknownValue: newCall,
      unknownLabel: 'C\'',
      questionData,
      questionStartTime: Date.now(),
    }));
  }

  const putDeltaAdjust = () => {
    let newPut = -1
    while (newPut < 0) {
      var strikeValue = Math.floor(Math.random() * 16) * 5 + 10;
      var stockValue = round(Math.random() * 20) - 10 + strikeValue;
      var rcValue = round(Math.random() * 0.3);
      var putValue = round(Math.max(0, strikeValue - stockValue - rcValue) + Math.random() * 2);

      var delta = Math.floor(Math.random() * -101);
      var newStock = Math.max(0, stockValue + round(Math.random() * 1 - 0.5))

      newPut = round(putValue + (newStock - stockValue)*(delta/100))
    }

    const labels = [
      { label: 'P', value: putValue.toFixed(2) },
      { label: 'K', value: strikeValue },
      { label: 'ref', value: stockValue.toFixed(2) },
      { label: 'rc', value: rcValue.toFixed(2) },
      { label: 'Δ', value: delta },
      { label: 'S', value: newStock.toFixed(2) },
      { label: 'P\'', value: '?' },
    ];

    const positions = generatePositions(labels.length);
    const questionData = labels.map((item, idx) => ({ ...item, position: positions[idx] }));

    setState((prev) => ({
      ...prev,
      questionType: 12,
      unknownValue: newPut,
      unknownLabel: 'P\'',
      questionData,
      questionStartTime: Date.now(),
    }));
  }



  // ---------------------------------------------------------------------------------------------------------------------

  function newQuestion() {
    const questionList = [
      missingCallQuestion,
      missingPutQuestion,
      missingStockQuestion,
      straddleToCall,
      straddleToPut,
      callToStraddle,
      putToStraddle,
      bwToCall,
      bwToPut,
      psToCall,
      psToPut,
      callDeltaAdjust,
      putDeltaAdjust,
    ];
    const questionType = questions[Math.floor(Math.random() * questions.length)];
    questionList[questionType]();
  }

  function startGame() {
    newQuestion();

    const timerID = setInterval(() => {
      setState((prev) => {
        if (prev.time > 0) {
          return {
            ...prev,
            time: prev.time - 1,
          };
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



  const validate = (event) => {

    var guess = parseFloat(event.target.value)
    var correct = false
    if (state.questionType >= 11) {
      correct = Math.abs(state.unknownValue - guess) <= 0.01
    } else {
      correct = guess == state.unknownValue
    }

    if (correct) {

      const timeTaken = (Date.now() - state.questionStartTime) / 1000;
      const questionSummary = {
        questionData: state.questionData,
        correctAnswer: state.unknownValue,
        questionType: state.questionType,
        timeTaken: +timeTaken.toFixed(2),
      };

      setState((prev) => ({
        ...prev,
        score: prev.score + 1,
        history: [...prev.history, questionSummary],
      }));
      event.target.value = '';
      newQuestion();

    }
  }

  const restart = () => {
    setState((prev) => ({
      ...prev,
      time: duration,
      score: 0,
      history: [],
      questionStartTime: null,
    }));
    setGameKey((prev) => prev+1);
  }


  if (state.time <= 0) {

      if (state.history[state.history.length - 1].timeTaken > 0) {
        const timeTaken = (Date.now() - state.questionStartTime) / 1000;
        const questionSummary = {
          questionData: state.questionData,
          correctAnswer: state.unknownValue,
          questionType: state.questionType,
          timeTaken: -timeTaken.toFixed(2),
        };

        setState((prev) => ({
          ...prev,
          history: [...prev.history, questionSummary],
        }));
      }

    return (
      <div className="d-flex flex-column justify-content-center align-items-center min-vh-100">

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
              <th>Inputs</th>
              <th>Answer</th>
              <th>Type</th>
              <th>Time (s)</th>
            </tr>
          </thead>
          <tbody>
            {state.history.map((entry, index) => (
              <tr key={index} className={entry.timeTaken > 0 ? 'table-success' : 'table-danger'}>
                <td>{index + 1}</td>
                <td>
                  {entry.questionData.map(({ label, value }) => `${label}: ${value}`).join(' ; ')}
                </td>
                <td>{entry.correctAnswer}</td>
                <td>{questionNames[entry.questionType]}</td>
                <td>{entry.timeTaken}</td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>
    )
  }


  return (
    <div className="d-flex flex-column justify-content-start align-items-center vh-100">
      <div className="row w-100">
        <div className='d-flex justify-content-between px-3 py-3'>
          <h4>Seconds left: {state.time}</h4>
          <h4>Score: {state.score}</h4>
        </div>
      </div>

      <div className="row w-100 h-100 position-relative" style={{ marginTop: 50, fontSize: 24 }}>
        <div className="position-absolute top-50 start-50 translate-middle text-center" style={{ zIndex: 10 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <input
              id="answerInput"
              type="text"
              className="form-control text-center"
              style={{ width: 150, fontSize: 24 }}
              onChange={validate}
              placeholder={state.unknownLabel}
            />
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
              zIndex: 1
            }}
          >
            {item.label}: {item.value}
          </div>
        ))}
      </div>
    </div>
  );
}













