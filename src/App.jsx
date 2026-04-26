import {BrowserRouter, Routes, Route} from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import EmployeePage from './pages/EmployeePage';
import ManagerPage from './pages/ManagerPage';


function App(){
  return(
    <BrowserRouter>
      <Routes>
        <Route path = "/" element = {<LoginPage />}/>
        <Route path="/employee" element={<EmployeePage />} />
        <Route path="/hr" element={<ManagerPage />} />
        <Route path="/manager" element={<ManagerPage />} />
        </Routes>
    </BrowserRouter>
  );
}
export default App;