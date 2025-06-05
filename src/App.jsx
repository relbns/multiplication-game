import { Routes, Route } from 'react-router-dom';
import MultiplicationGame from './components/MultiplicationGame';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<MultiplicationGame />} />
      </Routes>
    </div>
  );
}

export default App;
