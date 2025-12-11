import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from '@/Layout';
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import Dashboard from '@/pages/Dashboard';
import CreateQuiz from '@/pages/CreateQuiz';
import Explore from '@/pages/Explore';
import JoinGame from '@/pages/JoinGame';
import Play from '@/pages/Play';
import PlaySolo from '@/pages/PlaySolo';
import HostGame from '@/pages/HostGame';
import Analytics from '@/pages/Analytics';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create-quiz" element={<CreateQuiz />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/join-game" element={<JoinGame />} />
          <Route path="/play" element={<Play />} />
          <Route path="/play-solo" element={<PlaySolo />} />
          <Route path="/host-game" element={<HostGame />} />
          <Route path="/analytics" element={<Analytics />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
