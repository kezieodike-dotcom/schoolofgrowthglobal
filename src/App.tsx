import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import { BooksView } from './views/BooksView';
import { GrowthJobsView } from './views/GrowthJobsView';
import { EventsView } from './views/EventsView';
import { BlogView } from './views/BlogView';
import { DonationsView } from './views/DonationsView';
import { ContactView } from './views/ContactView';
import { RegisterView } from './views/RegisterView';
import { MentorRegistrationView } from './views/MentorRegistrationView';
import { MentorInboxView } from './views/MentorInboxView';
import { DemoReviewerAccessView } from './views/DemoReviewerAccessView';

// Enrolment and payments
import { PricingView } from './views/PricingView';
import { CheckoutView } from './views/CheckoutView';
import { BookCheckoutView } from './views/BookCheckoutView';
import { PaymentCallbackView } from './views/PaymentCallbackView';

// Admin panel - its own chrome, so it sits outside <Layout>
import { AdminLayout } from './views/admin/AdminLayout';
import { AdminOverviewView } from './views/admin/AdminOverviewView';
import { AdminEnrolmentsView } from './views/admin/AdminEnrolmentsView';
import { AdminStudentsView } from './views/admin/AdminStudentsView';
import { AdminMentorsView } from './views/admin/AdminMentorsView';
import { AdminMessagesView } from './views/admin/AdminMessagesView';
import { AdminCatalogueView } from './views/admin/AdminCatalogueView';
import { AdminIntegrationsView } from './views/admin/AdminIntegrationsView';

// ── Legacy route adapters ────────────────────────────────────────────────
const HomeRoute: React.FC = () => <HomeView onNavigate={useLegacyNavigate()} />;
const CourseDetailRoute: React.FC = () => <CourseDetailView onNavigate={useLegacyNavigate()} />;
const PortalRoute: React.FC = () => <StudentDashboardView onNavigate={useLegacyNavigate()} />;
const CommandCenterRoute: React.FC = () => <CommandCenterView onNavigate={useLegacyNavigate()} />;

const useScrollReveal = (pathname: string) => {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const selector = [
      '[data-scroll-reveal]',
      '.scroll-card',
      '.scroll-card-grid > *',
    ].join(',');
    const cleanups: Array<() => void> = [];
    let revealIndex = 0;

    const prepareElement = (element: Element) => {
      const target = element as HTMLElement;
      if (target.dataset.scrollRevealBound === 'true') return;
      if (target.closest('[data-no-scroll-reveal], [role="dialog"]')) return;

      target.dataset.scrollRevealBound = 'true';
      target.style.setProperty('--scroll-index', String(revealIndex % 8));
      target.style.setProperty('--reveal-delay', `${(revealIndex % 8) * 80}ms`);
      revealIndex += 1;

      if (reducedMotion) {
        target.classList.add('scroll-card-reveal-in');
        return;
      }

      target.classList.add('scroll-card-reveal');
      observer.observe(target);
      cleanups.push(() => observer.unobserve(target));
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const target = entry.target as HTMLElement;
          target.classList.add('scroll-card-reveal-in');
          observer.unobserve(target);
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );

    const hydrate = () => {
      window.requestAnimationFrame(() => {
        document.querySelectorAll(selector).forEach(prepareElement);
      });
    };

    document.querySelectorAll(selector).forEach((element) => {
      const target = element as HTMLElement;
      delete target.dataset.scrollRevealBound;
      target.classList.remove('scroll-card-reveal', 'scroll-card-reveal-in');
      target.style.removeProperty('--scroll-index');
      target.style.removeProperty('--reveal-delay');
    });

    hydrate();

    const mutationObserver = new MutationObserver(hydrate);
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      mutationObserver.disconnect();
      observer.disconnect();
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [pathname]);
};

const AppRoutes: React.FC = () => {
  const { pathname } = useLocation();
  useScrollReveal(pathname);

  return (
    <Routes>
      {/*
        The admin panel is deliberately outside <Layout>: it has its own
        navigation and must never render the public header, footer or the
        Growth AI widget. Access is gated inside AdminLayout, and every
        /api/admin route verifies the session independently - hiding the UI
        is convenience, not the security boundary.
      */}
      <Route path="admin" element={<AdminLayout />}>
        <Route index element={<AdminOverviewView />} />
        <Route path="enrolments" element={<AdminEnrolmentsView />} />
        <Route path="students" element={<AdminStudentsView />} />
        <Route path="mentors" element={<AdminMentorsView />} />
        <Route path="messages" element={<AdminMessagesView />} />
        <Route path="catalogue" element={<AdminCatalogueView />} />
        <Route path="integrations" element={<AdminIntegrationsView />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>

      <Route path="mentor/inbox" element={<MentorInboxView />} />

      <Route element={<Layout />}>
        <Route index element={<HomeRoute />} />
        <Route path="about" element={<AboutView />} />

        <Route path="courses" element={<CoursesView />} />
        <Route path="courses/:courseId" element={<CourseDetailRoute />} />

        <Route path="mentorship" element={<MentorsView />} />
        <Route path="mentors" element={<MentorsView />} />
        <Route path="books" element={<BooksView />} />
        <Route path="jobs" element={<GrowthJobsView />} />
        <Route path="events" element={<EventsView />} />
        <Route path="blog" element={<BlogView />} />
        <Route path="blog/:slug" element={<BlogView />} />
        <Route path="donate" element={<DonationsView />} />
        <Route path="contact" element={<ContactView />} />
        <Route path="demo-reviewer" element={<DemoReviewerAccessView />} />

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
        <Route path="checkout/book/:bookId" element={<BookCheckoutView />} />
        <Route path="payment/callback" element={<PaymentCallbackView />} />

        <Route path="portal" element={<PortalRoute />} />
        <Route path="command-center" element={<CommandCenterRoute />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
