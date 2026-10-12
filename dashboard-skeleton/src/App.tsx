import { Routes, Route } from 'react-router-dom'
import Layout from './layouts/Layout'
import Home from './pages/Home'
import Docs from './pages/Docs'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import Chatbot from './pages/Chatbot'
import CodeHub from './pages/CodeHub'
import VelclawHub from './pages/VelclawHub'
import MCP from './pages/MCP'
import API from './pages/API'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/docs" element={<Docs />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/chatbot" element={<Chatbot />} />
        <Route path="/work/agent/chat/codehub" element={<CodeHub />} />
        <Route path="/VelclawHub" element={<VelclawHub />} />
        <Route path="/mcp.velclaw.com" element={<MCP />} />
        <Route path="/api.velclaw.com" element={<API />} />
      </Route>
    </Routes>
  )
}
