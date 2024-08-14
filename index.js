import { ready } from 'https://lsong.org/scripts/dom.js';
import { h, render, useState, useEffect } from 'https://lsong.org/scripts/react/index.js';
import { ProgressBar } from 'https://lsong.org/scripts/react/components/progressbar.js';

const operations = ['+', '-', '*', '/'];

const generateQuestion = (round) => {
  const operation = operations[Math.floor(Math.random() * operations.length)];
  let num1, num2;

  switch (round) {
    case 1:
      num1 = Math.floor(Math.random() * 10) + 1;
      num2 = Math.floor(Math.random() * 10) + 1;
      break;
    case 10:
      num1 = Math.floor(Math.random() * 1000) + 1;
      num2 = Math.floor(Math.random() * 1000) + 1;
      break;
    default:
      const max = Math.min(10 * round, 100);
      num1 = Math.floor(Math.random() * max) + 1;
      num2 = Math.floor(Math.random() * max) + 1;
  }

  if (operation === '/') {
    [num1, num2] = [num1 * num2, num2];
  }

  const question = `${num1} ${operation} ${num2}`;
  const answer = eval(question);

  return { question, answer };
};

const App = () => {
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [currentAnswer, setCurrentAnswer] = useState(0);
  const [timeLeft, setTimeLeft] = useState(5);
  const [questionCount, setQuestionCount] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [round, setRound] = useState(1);
  const [showInstructions, setShowInstructions] = useState(true);
  const [startTime, setStartTime] = useState(0);

  useEffect(() => {
    console.log('App is ready');
  }, []);

  useEffect(() => {
    let timer;
    if (!gameOver && !showInstructions && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(prevTime => prevTime - 1), 1000);
    } else if (timeLeft === 0 && !gameOver && !showInstructions) {
      handleAnswer('');
    }
    return () => clearTimeout(timer);
  }, [timeLeft, gameOver, showInstructions]);

  const startGame = () => {
    setScore(0);
    setQuestionCount(0);
    setGameOver(false);
    setShowInstructions(false);
    nextQuestion();
  };

  const nextQuestion = () => {
    const { question, answer } = generateQuestion(round);
    setCurrentQuestion(question);
    setCurrentAnswer(answer);
    setStartTime(Date.now());
    setTimeLeft(5);
  };

  const handleAnswer = (userAnswer) => {
    const endTime = Date.now();
    const timeTaken = (endTime - startTime) / 1000;

    const isCorrect = parseFloat(userAnswer) === currentAnswer;

    if (isCorrect) {
      let pointsEarned = 0;
      if (timeTaken <= 1) pointsEarned = 5;
      else if (timeTaken <= 2) pointsEarned = 4;
      else if (timeTaken <= 3) pointsEarned = 3;
      else if (timeTaken <= 4) pointsEarned = 2;
      else if (timeTaken <= 5) pointsEarned = 1;
      setScore(prevScore => prevScore + pointsEarned);
    }

    setQuestionCount(prevCount => prevCount + 1);

    if (questionCount < 19) {
      setTimeout(nextQuestion, 1000);
    } else {
      endGame();
    }
  };

  const endGame = () => {
    setGameOver(true);
    if (score > highScore) {
      setHighScore(score);
    }
    if (score > 60) {
      setRound(prevRound => Math.min(prevRound + 1, 10));
    } else {
      setRound(1);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const userAnswer = formData.get('answer');
    handleAnswer(userAnswer);
    e.target.reset();
  };

  const renderInstructions = () => {
    return [
      h('h3', null, "How to Play:"),
      h('ul', null, [
        h('li', null, "Solve 20 math problems as quickly as possible"),
        h('li', null, "You have 5 seconds for each problem"),
        h('li', null, "Points awarded based on speed:"),
        h('ul', null, [
          h('li', null, "5 points: 1 second or less"),
          h('li', null, "4 points: 2 seconds"),
          h('li', null, "3 points: 3 seconds"),
          h('li', null, "2 points: 4 seconds"),
          h('li', null, "1 point: 5 seconds")
        ]),
        h('li', null, "No points for incorrect answers or timeouts"),
        h('li', null, "Score over 60 to advance to harder rounds")
      ]),
      h('button', { onClick: startGame }, "Start Game")
    ];
  };

  const renderGame = () => {
    const progressbarCls = timeLeft > 2 ? 'progress-bar-green' : 'progress-bar-red';
    return [
      h('p', { className: 'question' }, currentQuestion),
      h(ProgressBar, { value: timeLeft, max: 5, className: progressbarCls }),
      h('form', { onSubmit: handleSubmit }, [
        h('input', {
          type: 'number',
          name: 'answer',
          autoFocus: true,
          className: 'input input-block',
        }),
        // h('button', { type: 'submit' }, "Submit")
      ]),
      h('div', { className: 'game-info' }, [
        h('p', null, `Score: ${score}`),
        h('p', null, `Question: ${questionCount + 1}/20`),
        h('p', null, `Round: ${round}`)
      ])
    ];
  };

  const renderGameOver = () => {
    return h('div', { className: 'game-over card' }, [
      h('h3', null, "Game Over!"),
      h('p', null, `Final Score: ${score}`),
      h('p', null, `High Score: ${highScore}`),
      h('button', { onClick: startGame }, "Play Again")
    ]);
  };

  return h('div', {}, [
    h('h2', null, "Mental Arithmetic Game"),
    showInstructions ? renderInstructions() :
      gameOver ? renderGameOver() :
        renderGame()
  ]);
};

ready(() => {
  const app = document.getElementById('app');
  render(h(App), app);
});