import { useNavigate } from 'react-router-dom';
import { ViewType } from '../types';

/**
 * Maps the legacy `ViewType` union (used by the original views) to real routes,
 * so those views keep working unchanged now that the app uses react-router.
 */
export const VIEW_PATHS: Record<ViewType, string> = {
  home: '/',
  'course-detail': '/courses/exec-strategy-growth',
  'student-dashboard': '/portal',
  'command-center': '/command-center',
};

export const useLegacyNavigate = () => {
  const navigate = useNavigate();
  return (view: ViewType) => {
    navigate(VIEW_PATHS[view] ?? '/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
};
