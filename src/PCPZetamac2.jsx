import React, { useState, useEffect } from 'react';

export default function PCPZetamac2() {

  const [state, setState] = useState({
    putCall: true,
    straddle: false,
    combo: false,
    bwps: false,
    duration: 120,
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
    return <PCPZetamac2Question duration={state.duration} questions={state.questions} changeSettings={changeSettings} />
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

function PCPZetamac2Question({ duration, questions, changeSettings }) {
  const [state, setState] = useState({
    questionData: [],
    questionType: 0,
    unknownValue: 0,
    score: 0,
    time: duration,
  });

  const generatePositions = (length) => {
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
      questionData,
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
      questionData,
    }));
  };

  // ---------------------------------------------------------------------------------------------------------------------

  function newQuestion() {
    const questionList = [missingCallQuestion, missingPutQuestion];
    const questionType = questions[Math.floor(Math.random() * questions.length)];
    questionList[questionType]();
  }

  useEffect(() => {
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
  }, []);



  const validate = (event) => {
    if (parseFloat(event.target.value) == state.unknownValue) {
      setState((prev) => ({
        ...prev,
        score: prev.score + 1,
      }));
      event.target.value = '';
      newQuestion();
    }
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













