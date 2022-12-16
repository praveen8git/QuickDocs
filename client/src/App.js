import TextEditor from './TextEditor';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';
import { v4 as uuidV4 } from 'uuid';
import './App.css';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to={`/documents/${uuidV4()}`} />} />
        <Route path="/documents/:id" element={<TextEditor />} />
        <Route path="*" element={<Navigate to={`/documents/${uuidV4()}`} />} />
      </Routes>
    </Router>
  );
}

export default App;
