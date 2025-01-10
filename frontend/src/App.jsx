import React from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import RoomAccess from "./pages/RoomAccess";
import Chat from "./pages/Chat";
const App = () => {
  return (

  <BrowserRouter>
    <Routes>
      <Route path="/" element={<RoomAccess />} />
      <Route path="/chat/:roomCode" element={<Chat />} />
    </Routes>
  </BrowserRouter>

  )
}
export default App;