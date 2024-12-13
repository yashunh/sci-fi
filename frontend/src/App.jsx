import { BrowserRouter, Routes, Route } from "react-router-dom"
import './App.css'
import Homepage from "../pages/Homepage"
import CoreTeam from "../pages/CoreTeam"

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage/>}></Route>
        <Route path="/home" element={<Homepage/>}></Route>
        <Route path="/coreTeam" element={<CoreTeam/>}></Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
