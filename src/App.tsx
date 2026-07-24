import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { useLegacyNavigate } from './lib/legacyNav';

// Existing views (kept intact, fed a legacy ViewType-based navigate adapter)
import { HomeView } from './views/HomeView';
import { LeadershipSchoolView } from './views/LeadershipSchoolView';
import { CourseDetailView } from './views/CourseDetailView';
import { StudentDashboardView } from './views/StudentDashboardView';
import { CommandCenterView } from './views/CommandCenterView';

// New PRD public-website pages
import { AboutView } from './views/AboutView';
import { SchoolsView } from './views/SchoolsView';
import { SchoolDetailView } from './views/SchoolDetailView';
import { CoursesView } from './views/CoursesView';
import { MentorsView } from './views/MentorsView';
import { EventsView } from './views/EventsView';
import { BlogView } from './views/BlogView';
import { ContactView } from './views/ContactView';

// ── Legacy route adapters ────────────────────────────────────────────────
const HomeRoute: React.FC = () => {
  const legacyNav = useLegacyNavigate();
  const navigate = useNavigate();
  return <HomeView onNavigate={legacyNav} onSelectSchool={(id) => navigate(`/schools/${id}`)} />;
};
const LeadershipRoute: React.FC = () => <LeadershipSchoolView onNavigate={useLegacyNavigate()} />;
const CourseDetailRoute: React.FC = () => <CourseDetailView onNavigate={useLegacyNavigate()} />;
const PortalRoute: React.FC = () => <StudentDashboardView onNavigate={useLegacyNavigate()} />;
const CommandCenterRoute: React.FC = () => <CommandCenterView onNavigate={useLegacyNavigate()} />;

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomeRoute />} />
          <Route path="about" element={<AboutView />} />

          <Route path="schools" element={<SchoolsView />} />
          <Route path="schools/leadership" element={<LeadershipRoute />} />
          <Route path="schools/:schoolId" element={<SchoolDetailView />} />

          <Route path="courses" element={<CoursesView />} />
          <Route path="courses/:courseId" element={<CourseDetailRoute />} />

          <Route path="mentors" element={<MentorsView />} />
          <Route path="events" element={<EventsView />} />
          <Route path="blog" element={<BlogView />} />
          <Route path="blog/:slug" element={<BlogView />} />
          <Route path="contact" element={<ContactView />} />

          <Route path="portal" element={<PortalRoute />} />
          <Route path="command-center" element={<CommandCenterRoute />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
