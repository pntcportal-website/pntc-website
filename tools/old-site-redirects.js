// Permanent (301) redirects from the old WordPress site at pntc.edu.ph to the matching pages of this site,
// so Google moves its rankings and sitelinks over, and old links and bookmarks keep working.
// The list of old addresses came from the Web Archive (pages Google and visitors knew, 2014 to 2026).
// Used by tools/build-cloudflare.js, which writes them into dist/_redirects.
// Each entry: [old address, new address]. "/*" at the end covers every page under that folder.

const R = [
  // About
  ['/about-us/history', '/about/history'],
  ['/about-us/*', '/about'],
  ['/at-a-glance', '/about'],
  ['/mission-vision', '/about'],
  ['/message-from-the-president', '/about/leadership'],
  ['/pntc-advantage', '/about'],
  ['/pntc-advantages/shipboard-training-and-vessel', '/philnautical/onboard-training'],
  ['/pntc-advantages/k-12-ready', '/shs/'],
  ['/pntc-advantages/facilities-and-equipment', '/college/student-life'],
  ['/pntc-advantages/*', '/about'],
  ['/regimental-system-and-discipline', '/about'],
  ['/the-merchant-marine-regimental-program', '/about'],
  ['/outcomes-based', '/about'],
  ['/quality-policy', '/about'],
  ['/alumni-2', '/about'],
  ['/pntc-colleges-alumni-association', '/about'],
  ['/features-pntc-colleges', '/'],
  ['/features-college', '/college/'],
  ['/features-maritime-training-center', '/training/'],

  // College and Senior High School
  ['/pntc-college', '/college/'],
  ['/pntc-colleges', '/college/'],
  ['/academics', '/college/programs'],
  ['/courses/school-of-business', '/college/programs'],
  ['/courses/school-of-maritime', '/college/programs'],
  ['/courses/senior-high-school-programs', '/shs/strands'],
  ['/senior-high-school', '/shs/'],
  ['/k-12-ready', '/shs/'],
  ['/admissions', '/college/admissions'],
  ['/faq', '/college/admissions'],
  ['/shs-college-enrollment-2024', '/college/admissions'],
  ['/applications-for-a-y-2024-2025-is-ongoing', '/college/admissions'],
  ['/ending-soon-late-enrollment-for-2nd-sem-ay-2024-25', '/college/admissions'],
  ['/your-future-starts-here-enrollment-for-a-y-2026-2027-is-now-open-*', '/college/admissions'],
  ['/payment-channels', '/college/resources'],
  ['/guide-to-online-advising', '/college/resources'],
  ['/school-automate', '/college/resources'],
  ['/student-section/school-automate', '/college/resources'],
  ['/student-section/registrars-office', '/college/directory'],
  ['/student-section/message-from-the-president', '/about/leadership'],
  ['/student-section/message', '/about/leadership'],
  ['/student-section/shipboard-training-office', '/philnautical/onboard-training'],
  ['/student-section/*', '/college/student-life'],
  ['/list-of-organizations', '/college/student-life'],
  ['/facilities', '/college/student-life'],
  ['/facilities-pntc', '/college/student-life'],
  ['/facilities-and-equipment', '/college/student-life'],
  ['/dasmarinas-city-cavite', '/college/'],
  ['/locations/dasmarinas-cavite', '/college/'],
  ['/locations/*', '/'],
  ['/contact-us', '/college/directory'],

  // Maritime Training Center
  ['/maritime-training-center', '/training/'],
  ['/maritime-about-us-2/*', '/training/'],
  ['/maritime-about-us-2', '/training/'],
  ['/maritime-admission', '/training/maritime-courses'],
  ['/maritime-courses/practical-assessments', '/training/assessment'],
  ['/maritime-courses/in-house-training-programs', '/training/corporate'],
  ['/maritime-courses/*', '/training/maritime-courses'],
  ['/maritime-courses', '/training/maritime-courses'],
  ['/practical-assessments', '/training/assessment'],
  ['/in-house-training-courses', '/training/corporate'],
  ['/stcw-courses', '/training/maritime-courses'],
  ['/training-calendar', '/training/maritime-courses'],
  ['/new-refresher-tanker-and-igf-code-courses', '/training/maritime-courses'],
  ['/maritime-facilities', '/training/'],
  ['/maritime-pntc-advantages/*', '/training/'],
  ['/maritime-locations/dasmarinas', '/college/'],
  ['/maritime-locations/*', '/training/'],
  ['/intramuros-manila', '/training/'],
  ['/tanza-cavite', '/training/'],
  ['/maritime-contact-us', '/training/#join'],
  ['/contact-mtc', '/training/#join'],
  ['/FAQ-Maritime-Training_EN', '/training/'],
  ['/srn', '/training/'],
  ['/how-to-verify-certificates-pntc', 'https://secur-a-print.net/pntc2.sap'],
  ['/verify', 'https://secur-a-print.net/pntc2.sap'],
  ['/news_updates/how-to-verify-tagged-certificates', 'https://secur-a-print.net/pntc2.sap'],

  // PNSC on board training
  ['/applications-open-for-pntc-onboard-training-program', '/philnautical/onboard-training'],
  ['/news_updates/applications-open-for-pntc-structured-shipboard-training-program', '/philnautical/onboard-training'],

  // Careers
  ['/jobs/*', '/careers'],
  ['/jobs', '/careers'],
  ['/maritime-careers', '/careers'],

  // News, events and announcements
  ['/news-and-updates', '/college/blog/'],
  ['/news_updates/*', '/college/blog/'],
  ['/news_updates_category/*', '/college/blog/'],
  ['/category/*', '/college/blog/'],
  ['/events/*', '/college/calendar'],
  ['/events_category/*', '/college/calendar'],
  ['/walangpasok-*', '/college/blog/'],
  ['/advisory-beware-of-scams', '/college/blog/'],

  // very old pages of the first site
  ['/index/*', '/'],
  ['/photo/*', '/'],
  ['/photo', '/'],
  ['/thank-you', '/'],
  ['/secure', '/'],
  ['/52', '/'],
];

// Cloudflare matches the exact path, so each single page gets a line with and without the closing slash
function lines() {
  const out = [];
  for (const [from, to] of R) {
    if (from.endsWith('*')) out.push(`${from}  ${to}  301`);
    else { out.push(`${from}  ${to}  301`); out.push(`${from}/  ${to}  301`); }
  }
  return out;
}

module.exports = { R, lines };
