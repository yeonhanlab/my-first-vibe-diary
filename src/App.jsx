import { Navigate, Route, Routes } from 'react-router-dom'
import { useApp } from './context/AppContext.jsx'

import Onboarding from './screens/Onboarding.jsx'
import Home from './screens/Home.jsx'
import AllActivities from './screens/AllActivities.jsx'
import ActivityForm from './screens/ActivityForm.jsx'
import MoodBefore from './screens/MoodBefore.jsx'
import DurationSelect from './screens/DurationSelect.jsx'
import Focus from './screens/Focus.jsx'
import Done from './screens/Done.jsx'
import MoodAfter from './screens/MoodAfter.jsx'
import CalendarScreen from './screens/CalendarScreen.jsx'
import Profile from './screens/Profile.jsx'

// 휴식 흐름 도중 새로고침 등으로 session 이 사라지면 조용히 첫 화면으로 돌려보낸다.
function RequireSession({ children }) {
  const { session } = useApp()
  if (!session) return <Navigate to="/" replace />
  return children
}

function RequireProfile({ children }) {
  const { profile } = useApp()
  if (!profile) return <Navigate to="/welcome" replace />
  return children
}

export default function App() {
  const { profile } = useApp()

  return (
    <div className="app-frame">
      <Routes>
        <Route
          path="/welcome"
          element={profile ? <Navigate to="/" replace /> : <Onboarding />}
        />

        <Route path="/" element={<RequireProfile><Home /></RequireProfile>} />
        <Route path="/all" element={<RequireProfile><AllActivities /></RequireProfile>} />
        <Route path="/add" element={<RequireProfile><ActivityForm /></RequireProfile>} />
        <Route path="/edit/:id" element={<RequireProfile><ActivityForm /></RequireProfile>} />
        <Route path="/calendar" element={<RequireProfile><CalendarScreen /></RequireProfile>} />
        <Route path="/profile" element={<RequireProfile><Profile /></RequireProfile>} />

        <Route path="/flow/mood" element={<RequireSession><MoodBefore /></RequireSession>} />
        <Route path="/flow/time" element={<RequireSession><DurationSelect /></RequireSession>} />
        <Route path="/flow/focus" element={<RequireSession><Focus /></RequireSession>} />
        <Route path="/flow/done" element={<RequireSession><Done /></RequireSession>} />
        <Route path="/flow/after" element={<RequireSession><MoodAfter /></RequireSession>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}
