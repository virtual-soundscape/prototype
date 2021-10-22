import { BrowserRouter as Router, Route } from "react-router-dom";

import Landing from './pages/Landing';
import Room from './pages/Room'

function App() {
  return (
    <Router>
    <div>
      <Route exact path="/" component={Landing}/>
      <Route path="/room" component={Room}/>
    </div>
  </Router>

  );
}

export default App;
