import {
  CAREER_JOBS_EMAIL,
  EMPLOYER_JOB_POSTING_MESSAGE,
  TALENT_POOL_MESSAGE,
} from './careerJobsCopy.js';

if (CAREER_JOBS_EMAIL !== 'careerjobs.schoolofgrowthglobal@gmail.com') {
  throw new Error('Career Jobs should use the official Career Jobs email.');
}

if (!EMPLOYER_JOB_POSTING_MESSAGE.toLowerCase().includes('job opportunity')) {
  throw new Error('Employers should be told where to send job opportunities.');
}

if (!TALENT_POOL_MESSAGE.toLowerCase().includes('skillful talented and competent')) {
  throw new Error('The talent pool invitation should call out skillful, talented and competent people.');
}

if (!TALENT_POOL_MESSAGE.toLowerCase().includes('send your cv')) {
  throw new Error('The talent pool invitation should ask people to send their CV.');
}
