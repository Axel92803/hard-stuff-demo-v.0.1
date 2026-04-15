import { Routes, Route } from 'react-router'
import Layout from './components/Layout'
import Home from './pages/Home'
import Project from './pages/Project'
import ReactLogo from '/HS_logo.svg';

export default function App() {
  return (
    <div className="App">
      <ReactLogo />
    </div>,
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="projects/:id" element={<Project />} />
      </Route>
    </Routes>
  )
}
