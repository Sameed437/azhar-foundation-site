/**
 * Single source of truth for school details, navigation and page content.
 * Editing copy here updates it everywhere it appears.
 */

export const school = {
  name: 'Azhar Foundation School',
  shortName: 'AFS',
  motto: 'The Foundation Builders',
  foundedYear: 2001,
  tagline: 'Excellence in education since 2001',
  address: '437 Karim Block, Allama Iqbal Town, Lahore',
  phone: '+92 300 4296150',
  phoneHref: 'tel:+923004296150',
  email: 'azharfs@hotmail.com',
  emailHref: 'mailto:azharfs@hotmail.com',
  whatsappHref:
    'https://wa.me/923004296150?text=' +
    encodeURIComponent('Assalam o Alaikum, I would like to ask about admission at Azhar Foundation School.'),
  board: 'BISE Lahore',
  officeHours: [
    { days: 'Monday – Friday', time: '8:00 AM – 2:00 PM' },
    { days: 'Saturday', time: '8:00 AM – 12:00 PM' },
    { days: 'Sunday', time: 'Closed' },
  ],
  mapEmbed:
    'https://www.google.com/maps?q=437+Karim+Block,+Allama+Iqbal+Town,+Lahore&output=embed',
  mapLink:
    'https://www.google.com/maps/search/?api=1&query=437+Karim+Block,+Allama+Iqbal+Town,+Lahore',
};

/**
 * The evening sister institution, run by the same founders since 1997 —
 * four years before the school itself opened.
 */
export const academy = {
  name: 'Anwar Memorial Academy',
  since: 1997,
  description:
    'Alongside the school day, our founders have run Anwar Memorial Academy since 1997 — evening tuition classes at the same campus, for students who want focused, supervised study after regular school hours.',
  timing: 'Evening classes, after school hours',
};

/** "2026–27" style session label, rolling over each March. */
export const admissionsSession = (date = new Date()) => {
  const year = date.getMonth() >= 2 ? date.getFullYear() : date.getFullYear() - 1;
  return `${year}–${String((year + 1) % 100).padStart(2, '0')}`;
};

/** Build a WhatsApp link with a custom prefilled message. */
export const whatsappLink = (message) =>
  `https://wa.me/923004296150?text=${encodeURIComponent(message)}`;

/**
 * Primary navigation. An item with `children` renders as a dropdown on desktop
 * and an expandable group in the mobile drawer.
 */
export const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  {
    label: 'Academics',
    to: '/academics',
    children: [
      { label: 'Curriculum', to: '/academics', description: 'What is taught at each stage' },
      { label: 'Faculty', to: '/faculty', description: 'Our teaching departments' },
    ],
  },
  { label: 'Admissions', to: '/admissions' },
  { label: 'Results', to: '/results' },
  {
    label: 'Campus',
    to: '/facilities',
    children: [
      { label: 'Facilities', to: '/facilities', description: 'Labs, library, sports and safety' },
      { label: 'Gallery', to: '/gallery', description: 'Photos from around the school' },
      { label: 'News & Events', to: '/news', description: 'Announcements and the calendar' },
      { label: 'Portal login', to: '/login', description: 'For enrolled families and staff' },
    ],
  },
  { label: 'Contact', to: '/contact' },
];

/** Flat list of every route, used by the footer and the 404 page. */
export const allPages = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Academics', to: '/academics' },
  { label: 'Faculty', to: '/faculty' },
  { label: 'Admissions', to: '/admissions' },
  { label: 'Results', to: '/results' },
  { label: 'Facilities', to: '/facilities' },
  { label: 'Gallery', to: '/gallery' },
  { label: 'News & Events', to: '/news' },
  { label: 'Contact', to: '/contact' },
];

/** Headline numbers shown in the hero strip and about page. */
export const stats = [
  { value: 200, suffix: '+', label: 'Students enrolled', caption: 'Playgroup to Matric' },
  { value: 95, suffix: '%', label: 'Board success rate', caption: 'Matriculation 2024' },
  {
    // derived so it can never disagree with the About-page badge
    value: new Date().getFullYear() - school.foundedYear,
    suffix: '+',
    label: 'Years of teaching',
    caption: `Established ${school.foundedYear}`,
  },
  { value: 25, suffix: ':1', label: 'Class size cap', caption: 'Students per teacher' },
];

/** Matriculation board toppers (out of 1100 marks). */
export const toppers = [
  { rank: 1, name: 'Anzal Azhar Ch.', score: 1093, grade: 'A+' },
  { rank: 2, name: 'Abdullah Bashir', score: 1092, grade: 'A+' },
  { rank: 3, name: 'Abdul Rehman', score: 1089, grade: 'A+' },
  { rank: 4, name: 'Minahil Azeem', score: 1081, grade: 'A+' },
];

/** Academic programmes, grouped by stage. */
export const programmes = [
  {
    stage: 'Early Years',
    grades: 'Playgroup · Nursery · Prep',
    ages: 'Ages 3 – 5',
    entry: 'Interview only',
    icon: 'sparkle',
    description:
      'Play-led learning that builds language, motor skills and curiosity before formal schooling begins.',
    highlights: ['Phonics & early numeracy', 'Structured play', 'Low pupil–teacher ratio'],
  },
  {
    stage: 'Primary',
    grades: 'Grade 1 – 5',
    ages: 'Ages 6 – 10',
    entry: 'Written assessment: English, Urdu, Maths',
    icon: 'book',
    description:
      'A broad foundation in English, Urdu, Mathematics, Science and Islamiyat with daily reading practice.',
    highlights: ['Concept-first Mathematics', 'Reading programme', 'Weekly activity periods'],
  },
  {
    stage: 'Middle',
    grades: 'Grade 6 – 8',
    ages: 'Ages 11 – 13',
    entry: 'Written assessment: English, Urdu, Maths',
    icon: 'compass',
    description:
      'Subject specialists take over as students build study habits, lab skills and independent research.',
    highlights: ['Science laboratory work', 'Computer studies', 'Debates & public speaking'],
  },
  {
    stage: 'Matriculation',
    grades: 'Grade 9 – 10',
    ages: 'Ages 14 – 16',
    entry: 'Assessment + last report card review',
    icon: 'cap',
    description:
      'Focused board preparation in Science and Arts groups, with past-paper drills and mock examinations.',
    highlights: ['Science & Arts groups', 'Monthly mock papers', 'One-to-one result reviews'],
  },
];

/** Why families choose the school. */
export const features = [
  {
    icon: 'screen',
    title: 'Smart classrooms',
    text: 'Multimedia-equipped rooms where lessons are taught with visuals, not just chalk and talk.',
  },
  {
    icon: 'users',
    title: 'Qualified faculty',
    text: 'Subject specialists with degrees in their field and ongoing in-house teacher training.',
  },
  {
    icon: 'heart',
    title: 'Moral development',
    text: 'Islamiyat, character education and daily assemblies that build honesty and responsibility.',
  },
  {
    icon: 'wallet',
    title: 'Affordable fees',
    text: 'Transparent fee structure with sibling concessions and merit scholarships for top performers.',
  },
  {
    icon: 'chart',
    title: 'Academic excellence',
    text: 'A consistent record of A+ board results and students placed in leading colleges.',
  },
  {
    icon: 'shield',
    title: 'Safe campus',
    text: 'Secure entry, CCTV monitoring and a trained staff presence throughout the school day.',
  },
];

/** Values used on the About page. */
export const values = [
  {
    icon: 'compass',
    title: 'Discipline',
    text: 'Punctuality, preparation and follow-through — the habits that outlast any single exam.',
  },
  {
    icon: 'book',
    title: 'Academic rigour',
    text: 'We teach for understanding, then test relentlessly, so results reflect real learning.',
  },
  {
    icon: 'heart',
    title: 'Character',
    text: 'Honesty, respect and service are held to the same standard as academic performance.',
  },
  {
    icon: 'sparkle',
    title: 'Curiosity',
    text: 'Questions are welcome in every classroom. Confident learners ask before they are told.',
  },
];

/** Milestones for the About page timeline. */
export const milestones = [
  {
    year: '1997',
    title: 'Anwar Memorial Academy',
    text: 'Our founders begin teaching with an evening tuition academy — four years before the school opens. It still runs every evening today.',
  },
  {
    year: '2001',
    title: 'The school opens',
    text: 'Azhar Foundation School is established in Allama Iqbal Town with a single primary section.',
  },
  {
    year: '2008',
    title: 'Middle school added',
    text: 'Grades 6 to 8 are introduced along with the first dedicated science laboratory.',
  },
  {
    year: '2014',
    title: 'First matric batch',
    text: 'The school registers for board examinations and graduates its first Matriculation cohort.',
  },
  {
    year: '2019',
    title: 'Smart classrooms',
    text: 'Multimedia teaching is rolled out across every section, from Prep through Grade 10.',
  },
  {
    year: '2024',
    title: 'A record result',
    text: 'Four students cross 1080 out of 1100, with a 95% overall board success rate.',
  },
];

/** Admissions steps. */
export const admissionSteps = [
  {
    step: '01',
    title: 'Enquire',
    text: 'Call the office or send the enquiry form. We will confirm seat availability in the class you need.',
  },
  {
    step: '02',
    title: 'Visit the campus',
    text: 'Tour the classrooms, meet the section head and ask everything you want to know about the programme.',
  },
  {
    step: '03',
    title: 'Assessment',
    text: 'A short written and oral assessment places your child at the right level. Early Years admissions are interview-only.',
  },
  {
    step: '04',
    title: 'Enrol',
    text: 'Submit the documents listed below, settle the admission fee, and collect the uniform and book list.',
  },
];

export const admissionRequirements = [
  'Completed admission form, signed by a parent or guardian',
  'Birth certificate or B-Form (photocopy)',
  'CNIC copies of both parents or the legal guardian',
  'Four recent passport-size photographs',
  'School leaving certificate and last report card (Grade 1 and above)',
];

export const faqs = [
  {
    q: 'When does the admission season open?',
    a: 'Main admissions run from March through August for the August session. Mid-year admissions are considered against available seats, so it is always worth calling the office.',
  },
  {
    q: 'What is the class size?',
    a: 'We cap sections at roughly 25 students so every child gets individual attention. Early Years groups are smaller still.',
  },
  {
    q: 'Which board do matric students appear under?',
    a: 'Students sit the Board of Intermediate and Secondary Education, Lahore examinations, in either the Science or Arts group.',
  },
  {
    q: 'Are scholarships available?',
    a: 'Yes. Merit scholarships are offered to high achievers in the board and annual examinations, and sibling concessions apply to families with more than one child enrolled.',
  },
  {
    q: 'What are the school timings?',
    a: 'Classes run 8:00 AM to 2:00 PM Monday through Friday, with a shorter Saturday for selected sections. The office is open from 8:00 AM to 2:00 PM on weekdays.',
  },
];

/* ==========================================================================
   ACADEMICS
   ========================================================================== */

/** Subjects taught at each stage, shown as a curriculum table. */
export const curriculum = [
  {
    stage: 'Early Years',
    grades: 'Playgroup – Prep',
    icon: 'sparkle',
    core: ['English language', 'Urdu language', 'Early Mathematics', 'Islamiyat (oral)'],
    plus: ['Art & craft', 'Rhymes & storytelling', 'Motor-skill play'],
    note: 'No formal examinations. Progress is reported through observation and a termly parent meeting.',
  },
  {
    stage: 'Primary',
    grades: 'Grade 1 – 5',
    icon: 'book',
    core: ['English', 'Urdu', 'Mathematics', 'General Science', 'Islamiyat', 'Social Studies'],
    plus: ['Computer basics', 'Drawing', 'Physical education'],
    note: 'Monthly class tests, two terminal examinations and a written report each term.',
  },
  {
    stage: 'Middle',
    grades: 'Grade 6 – 8',
    icon: 'compass',
    core: ['English', 'Urdu', 'Mathematics', 'Science', 'Islamiyat', 'Pakistan Studies', 'Computer Science'],
    plus: ['Laboratory practicals', 'Debating', 'Library period'],
    note: 'Subject teachers take over from class teachers. Term examinations follow the board paper pattern.',
  },
  {
    stage: 'Matriculation',
    grades: 'Grade 9 – 10',
    icon: 'cap',
    core: ['English', 'Urdu', 'Mathematics', 'Islamiyat', 'Pakistan Studies'],
    plus: ['Science group: Physics, Chemistry, Biology / Computer Science', 'Arts group: General Science, Civics, Economics'],
    note: 'Registered for board examinations. Monthly mock papers from Grade 9 onward.',
  },
];

/** How teaching is approached day to day. */
export const teachingApproach = [
  {
    icon: 'compass',
    title: 'Concept before procedure',
    text: 'A method is only taught once the idea behind it lands. Students who understand why a rule works stop forgetting it the week after the test.',
  },
  {
    icon: 'screen',
    title: 'Taught with visuals',
    text: 'Every section has a multimedia board. Diagrams, simulations and worked examples are projected rather than copied onto a blackboard.',
  },
  {
    icon: 'users',
    title: 'Small sections',
    text: 'Roughly 25 students per class means a teacher can see who is lost within the lesson, not a month later at the terminal exam.',
  },
  {
    icon: 'book',
    title: 'Daily reading',
    text: 'Primary students read aloud every day. Reading fluency is the single strongest predictor of how the rest of the syllabus goes.',
  },
];

/** Assessment cycle. */
export const assessmentCycle = [
  {
    step: '01',
    title: 'Weekly class tests',
    text: 'Short, low-stakes checks in each subject so gaps surface within days rather than at the end of term.',
  },
  {
    step: '02',
    title: 'Monthly assessments',
    text: 'A full paper per subject in the board format. Grade 9 and 10 sit these as timed mock examinations.',
  },
  {
    step: '03',
    title: 'Terminal examinations',
    text: 'Two major examinations a year, marked to board standards, with a written report for every student.',
  },
  {
    step: '04',
    title: 'Parent meeting',
    text: 'Each report is handed over in person. Subject teachers are available to talk through what the marks mean.',
  },
];

/** Term structure for the academic year. */
export const academicCalendar = [
  { term: 'First term', span: 'August – December', detail: 'Session opens, first terminal examination in December.' },
  { term: 'Winter break', span: 'Late December', detail: 'Approximately two weeks, dates confirmed each year.' },
  { term: 'Second term', span: 'January – May', detail: 'Second terminal examination and annual results in May.' },
  { term: 'Board examinations', span: 'March – April', detail: 'Grade 9 and 10 sit BISE Lahore papers.' },
  { term: 'Summer break', span: 'June – July', detail: 'Holiday work is set for Grade 6 and above.' },
];

/* ==========================================================================
   FACULTY
   ========================================================================== */

/**
 * Staff are described by role and qualification only — no names.
 * Add a `name` field to any entry when the school supplies its real list.
 */
export const leadership = [
  {
    role: 'Patron-in-Chief',
    icon: 'shield',
    remit: 'Founder and custodian of the school’s direction, standards and long-term planning.',
  },
  {
    role: 'Principal',
    icon: 'cap',
    remit: 'Academic leadership, staff appraisal, discipline and the relationship with the board.',
  },
  {
    role: 'Vice Principal',
    icon: 'compass',
    remit: 'Day-to-day running of the timetable, examinations and cover for absent staff.',
  },
  {
    role: 'Head of Administration',
    icon: 'users',
    remit: 'Admissions, fee records, transport, campus safety and the front office.',
  },
];

export const departments = [
  {
    name: 'Languages',
    icon: 'book',
    subjects: 'English · Urdu',
    stages: 'Playgroup – Grade 10',
    roles: [
      { title: 'Head of English', qualification: 'MA English', scope: 'Grades 6 – 10' },
      { title: 'Head of Urdu', qualification: 'MA Urdu', scope: 'Grades 6 – 10' },
      { title: 'Language teachers', qualification: 'BA / BEd', scope: 'Primary sections' },
    ],
  },
  {
    name: 'Mathematics',
    icon: 'chart',
    subjects: 'Mathematics',
    stages: 'Grade 1 – 10',
    roles: [
      { title: 'Head of Mathematics', qualification: 'MSc Mathematics', scope: 'Grades 9 – 10' },
      { title: 'Middle-school specialist', qualification: 'BSc / BEd', scope: 'Grades 6 – 8' },
      { title: 'Primary mathematics teachers', qualification: 'BA / BEd', scope: 'Grades 1 – 5' },
    ],
  },
  {
    name: 'Science',
    icon: 'sparkle',
    subjects: 'Physics · Chemistry · Biology · General Science',
    stages: 'Grade 4 – 10',
    roles: [
      { title: 'Head of Science', qualification: 'MSc Physics', scope: 'Grades 9 – 10' },
      { title: 'Chemistry specialist', qualification: 'MSc Chemistry', scope: 'Grades 9 – 10' },
      { title: 'Biology specialist', qualification: 'MSc Botany / Zoology', scope: 'Grades 9 – 10' },
      { title: 'Laboratory assistant', qualification: 'BSc', scope: 'All practical work' },
    ],
  },
  {
    name: 'Computer Science',
    icon: 'screen',
    subjects: 'Computer Studies · Computer Science',
    stages: 'Grade 3 – 10',
    roles: [
      { title: 'Head of Computer Science', qualification: 'BS Computer Science', scope: 'Grades 6 – 10' },
      { title: 'IT lab instructor', qualification: 'BSc / Diploma', scope: 'Grades 3 – 5' },
    ],
  },
  {
    name: 'Islamiyat & Social Studies',
    icon: 'heart',
    subjects: 'Islamiyat · Pakistan Studies · Civics',
    stages: 'Grade 1 – 10',
    roles: [
      { title: 'Head of Islamiyat', qualification: 'MA Islamic Studies', scope: 'Grades 6 – 10' },
      { title: 'Social studies teachers', qualification: 'MA / BEd', scope: 'Grades 1 – 8' },
    ],
  },
  {
    name: 'Early Years',
    icon: 'users',
    subjects: 'Integrated play-based curriculum',
    stages: 'Playgroup – Prep',
    roles: [
      { title: 'Early Years coordinator', qualification: 'BEd (Early Childhood)', scope: 'Playgroup – Prep' },
      { title: 'Class teachers', qualification: 'BA / Montessori diploma', scope: 'One per section' },
      { title: 'Classroom assistants', qualification: 'Intermediate + training', scope: 'One per section' },
    ],
  },
];

/** Commitments the school makes about its staff. */
export const facultyCommitments = [
  {
    icon: 'cap',
    title: 'Specialists from Grade 6',
    text: 'Middle and matric classes are taught by teachers who hold a degree in the subject they teach, not by generalists covering a timetable gap.',
  },
  {
    icon: 'users',
    title: 'In-house training',
    text: 'Staff meet each term for lesson observation and shared planning. New teachers are paired with a department head for their first year.',
  },
  {
    icon: 'shield',
    title: 'Vetted appointments',
    text: 'Every appointment is subject to reference checks and a demonstration lesson before a contract is offered.',
  },
];

/* ==========================================================================
   RESULTS
   ========================================================================== */

/** Board results history. Add a row each year. */
export const resultHistory = [
  { year: '2024', candidates: 38, passRate: 95, aPlus: 17, topScore: 1093 },
  { year: '2023', candidates: 34, passRate: 94, aPlus: 14, topScore: 1081 },
  { year: '2022', candidates: 31, passRate: 92, aPlus: 11, topScore: 1074 },
  { year: '2021', candidates: 29, passRate: 90, aPlus: 9, topScore: 1068 },
  { year: '2020', candidates: 27, passRate: 91, aPlus: 8, topScore: 1063 },
];

/** Grade spread for the most recent board cohort. */
export const gradeDistribution = [
  { grade: 'A+', share: 45, note: '1000 marks and above' },
  { grade: 'A', share: 29, note: '880 – 999' },
  { grade: 'B', share: 16, note: '770 – 879' },
  { grade: 'C', share: 7, note: '660 – 769' },
  { grade: 'Below C', share: 3, note: 'Under 660' },
];

/** Where the 2024 leavers went next. */
export const placements = [
  { institution: 'Government College University, Lahore', count: 6 },
  { institution: 'Punjab Group of Colleges', count: 9 },
  { institution: 'Superior Group of Colleges', count: 5 },
  { institution: 'Kinnaird / Lahore College for Women', count: 4 },
  { institution: 'Other colleges across Lahore', count: 12 },
];

/* ==========================================================================
   FACILITIES
   ========================================================================== */

export const facilities = [
  {
    icon: 'screen',
    title: 'Smart classrooms',
    text: 'Every section from Prep to Grade 10 has a multimedia board. Lessons are delivered with diagrams, simulations and projected worked examples.',
    stat: 'All sections',
  },
  {
    icon: 'sparkle',
    title: 'Science laboratory',
    text: 'A combined Physics, Chemistry and Biology lab with the apparatus required for the full BISE practical syllabus, supervised by a lab assistant.',
    stat: 'Grades 6 – 10',
  },
  {
    icon: 'screen',
    title: 'Computer laboratory',
    text: 'Desktop workstations with broadband access, used for Computer Studies from Grade 3 and for Computer Science practicals at matric level.',
    stat: 'Grades 3 – 10',
  },
  {
    icon: 'book',
    title: 'Library',
    text: 'A reading room stocked with English and Urdu titles, reference sets and past papers. Primary classes have a timetabled library period each week.',
    stat: 'Weekly period',
  },
  {
    icon: 'trophy',
    title: 'Sports & assembly ground',
    text: 'An open ground used for the daily assembly, physical education periods, and inter-house cricket and athletics through the year.',
    stat: 'Daily use',
  },
  {
    icon: 'heart',
    title: 'Prayer area',
    text: 'A dedicated space for Zuhr prayer, supervised by staff, with wudu facilities adjacent to the main corridor.',
    stat: 'Daily',
  },
];

export const safetyMeasures = [
  {
    icon: 'shield',
    title: 'Controlled entry',
    text: 'A single monitored gate. Children are released only to a parent or a guardian named on the admission form.',
  },
  {
    icon: 'screen',
    title: 'CCTV coverage',
    text: 'Cameras cover corridors, the entrance and the assembly ground, with recordings retained by the administration office.',
  },
  {
    icon: 'heart',
    title: 'First aid',
    text: 'A stocked first-aid room and staff trained in basic first aid. Parents are called immediately for anything beyond a minor scrape.',
  },
  {
    icon: 'users',
    title: 'Supervised breaks',
    text: 'Teachers are rostered onto break and dispersal duty every day. No section is left unsupervised.',
  },
];

/* ==========================================================================
   GALLERY
   ========================================================================== */

export const galleryFilters = ['All', 'Events', 'People', 'Campus'];

/** Captions describe what each photo actually shows.
 *  pos = object-position focal point; portrait photos are letterboxed
 *  rather than cropped in the carousel. */
export const gallery = [
  {
    src: '/images/slide1.jpg',
    title: 'Results day',
    caption: 'A certificate of excellence presented at the annual results ceremony.',
    category: 'Events',
    pos: '50% 28%',
    orientation: 'portrait',
  },
  {
    src: '/images/slide2.jpg',
    title: 'Our teaching staff',
    caption: 'Faculty gathered at a school celebration.',
    category: 'People',
    pos: '50% 42%',
  },
  {
    src: '/images/slide3.jpg',
    title: 'The winter fair',
    caption: 'Students at the photo booth during the winter fair.',
    category: 'Events',
    pos: '50% 35%',
    orientation: 'portrait',
  },
  {
    src: '/images/slide4.jpg',
    title: 'Students and staff',
    caption: 'A student group with staff under the school banner.',
    category: 'People',
    pos: '50% 45%',
  },
  {
    src: '/images/banner.jpg',
    title: 'The campus',
    caption: 'Our building on Karim Block, Allama Iqbal Town.',
    category: 'Campus',
    pos: '50% 60%',
  },
];

/**
 * Parent testimonials — INTENTIONALLY EMPTY until the school supplies real
 * quotes. The testimonial band renders nothing while this is empty, because
 * invented praise is worse than none. Format:
 *   { quote: '...', attribution: 'Parent, Grade 5', context: 'With us since 2019' }
 */
export const testimonials = [];

/* ==========================================================================
   NEWS & EVENTS
   ========================================================================== */

/**
 * Placeholder announcements — replace with the school's real notices.
 * `date` is ISO so it sorts and formats predictably.
 */
export const newsPosts = [
  {
    date: '2026-08-12',
    category: 'Admissions',
    title: 'Admissions open for the 2026–27 session',
    excerpt:
      'Seats are available across Early Years, Primary and Middle. Assessments are held every weekday morning; call the office to book a slot.',
  },
  {
    date: '2026-07-28',
    category: 'Results',
    title: 'Matriculation results announced',
    excerpt:
      'Our latest cohort recorded a 95% success rate with seventeen A+ grades. Detailed results are available on the results page.',
  },
  {
    date: '2026-06-15',
    category: 'Campus',
    title: 'Science laboratory refit completed',
    excerpt:
      'New apparatus has been installed ahead of the coming session, covering the full board practical syllabus for Physics, Chemistry and Biology.',
  },
  {
    date: '2026-05-20',
    category: 'Academics',
    title: 'Annual examination results and reports',
    excerpt:
      'Reports for all sections are ready for collection. Subject teachers will be available during the parent meeting on the dates circulated.',
  },
];

export const upcomingEvents = [
  {
    date: '2026-09-10',
    title: 'Parent–teacher meeting',
    detail: 'First-term progress review for Grades 1 – 8. Reports handed over in person.',
    audience: 'Grades 1 – 8',
  },
  {
    date: '2026-09-25',
    title: 'Inter-house sports day',
    detail: 'Athletics and cricket on the school ground. Parents are welcome to attend.',
    audience: 'All sections',
  },
  {
    date: '2026-10-14',
    title: 'Science fair',
    detail: 'Middle-school project exhibition, judged by staff and visiting teachers.',
    audience: 'Grades 6 – 8',
  },
  {
    date: '2026-11-05',
    title: 'First terminal examinations begin',
    detail: 'Datesheets are issued two weeks in advance. Timings follow the regular school day.',
    audience: 'Grades 1 – 10',
  },
  {
    date: '2026-12-18',
    title: 'Annual function & prize distribution',
    detail: 'Performances, prize-giving and the year in review. Invitations sent to all families.',
    audience: 'All sections',
  },
];
