import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { useLegacyNavigate } from './lib/legacyNav';

// Existing views (kept intact, fed a legacy ViewType-based navigate adapter)
import { HomeView } from './views/HomeView';
import { CourseDetailView } from './views/CourseDetailView';
import { StudentDashboardView } from './views/StudentDashboardView';
import { CommandCenterView } from './views/CommandCenterView';

// New PRD public-website pages
import { AboutView } from './views/AboutView';
import { CoursesView } from './views/CoursesView';
import { MentorsView } from './views/MentorsView';
import { EventsView } from './views/EventsView';
import { BlogView } from './views/BlogView';
import { ContactView } from './views/ContactView';
import { RegisterView } from './views/RegisterView';
import { MentorRegistrationView } from './views/MentorRegistrationView';

// Enrolment and payments
import { PricingView } from './views/PricingView';
import { CheckoutView } from './views/CheckoutView';
import { PaymentCallbackView } from './views/PaymentCallbackView';

// Admin panel — its own chrome, so it sits outside <Layout>
import { AdminLayout } from './views/admin/AdminLayout';
import { AdminOverviewView } from './views/admin/AdminOverviewView';
import { AdminEnrolmentsView } from './views/admin/AdminEnrolmentsView';
import { AdminStudentsView } from './views/admin/AdminStudentsView';
import { AdminMentorsView } from './views/admin/AdminMentorsView';
import { AdminCatalogueView } from './views/admin/AdminCatalogueView';
import { AdminIntegrationsView } from './views/admin/AdminIntegrationsView';

// ── Legacy route adapters ────────────────────────────────────────────────
const HomeRoute: React.FC = () => <HomeView onNavigate={useLegacyNavigate()} />;
const CourseDetailRoute: React.FC = () => <CourseDetailView onNavigate={useLegacyNavigate()} />;
const PortalRoute: React.FC = () => <StudentDashboardView onNavigate={useLegacyNavigate()} />;
const CommandCenterRoute: React.FC = () => <CommandCenterView onNavigate={useLegacyNavigate()} />;

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/*
          The admin panel is deliberately outside <Layout>: it has its own
          navigation and must never render the public header, footer or the
          Growth AI widget. Access is gated inside AdminLayout, and every
          /api/admin route verifies the session independently — hiding the UI
          is convenience, not the security boundary.
        */}
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<AdminOverviewView />} />
          <Route path="enrolments" element={<AdminEnrolmentsView />} />
          <Route path="students" element={<AdminStudentsView />} />
          <Route path="mentors" element={<AdminMentorsView />} />
          <Route path="catalogue" element={<AdminCatalogueView />} />
          <Route path="integrations" element={<AdminIntegrationsView />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>

        <Route element={<Layout />}>
          <Route index element={<HomeRoute />} />
          <Route path="about" element={<AboutView />} />

          <Route path="courses" element={<CoursesView />} />
          <Route path="courses/:courseId" element={<CourseDetailRoute />} />

          <Route path="mentors" element={<MentorsView />} />
          <Route path="events" element={<EventsView />} />
          <Route path="blog" element={<BlogView />} />
          <Route path="blog/:slug" element={<BlogView />} />
          <Route path="contact" element={<ContactView />} />

          {/*
            Bare /register defaults to the student form inside the view.
            Mentors get their own route rather than a tab: their application
            is a five-step wizard with its own draft state, and nesting that
            inside a tabbed view would reset it on every tab switch.
          */}
          <Route path="register" element={<RegisterView />} />
          <Route path="register/mentor" element={<MentorRegistrationView />} />
          <Route path="register/:role" element={<RegisterView />} />

          {/*
            Payments. /checkout/:plan takes an optional ?mentor= so a
            subscription started from the directory remembers who it is for,
            and /payment/callback is the absolute URL given to Paystack.
          */}
          <Route path="pricing" element={<PricingView />} />
          <Route path="checkout/:plan" element={<CheckoutView />} />
          <Route path="payment/callback" element={<PaymentCallbackView />} />

          <Route path="portal" element={<PortalRoute />} />
          <Route path="command-center" element={<CommandCenterRoute />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
