import { BrowserRouter, Routes, Route } from "react-router-dom"
import { CallProvider } from "@/context/CallContext"
import { Homepage } from "@/components/Homepage"
import { CRMView } from "@/components/CRMView"

function App() {
  return (
    <CallProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/crm/call/:customerId" element={<CRMView />} />
        </Routes>
      </BrowserRouter>
    </CallProvider>
  )
}

export default App
