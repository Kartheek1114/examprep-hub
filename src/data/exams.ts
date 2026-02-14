export interface Exam {
  id: string;
  name: string;
  shortName: string;
  description: string;
  icon: string;
  category: string;
  vacancies: string;
  lastCutoff: string;
  nextExamDate: string;
  eligibility: string;
  syllabus: SyllabusSection[];
  previousYearPapers: PYQPaper[];
}

export interface SyllabusSection {
  subject: string;
  topics: string[];
  marks: number;
}

export interface PYQPaper {
  year: number;
  questions: Question[];
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  subject: string;
  difficulty: "easy" | "medium" | "hard";
  explanation: string;
}

export const examCategories = ["All", "SSC", "UPSC", "Banking", "Railway", "State PSC", "Defence"];

export const exams: Exam[] = [
  {
    id: "ssc-cgl",
    name: "SSC Combined Graduate Level",
    shortName: "SSC CGL",
    description: "One of the most popular government exams for graduates. Recruits for Group B and Group C posts in various ministries and departments.",
    icon: "🏛️",
    category: "SSC",
    vacancies: "14,582+",
    lastCutoff: "142.50 / 200",
    nextExamDate: "March 2026",
    eligibility: "Graduate from recognized university",
    syllabus: [
      { subject: "Quantitative Aptitude", topics: ["Number System", "Algebra", "Geometry", "Trigonometry", "Statistics", "Mensuration"], marks: 50 },
      { subject: "English Language", topics: ["Reading Comprehension", "Grammar", "Vocabulary", "Sentence Correction", "Cloze Test"], marks: 50 },
      { subject: "General Intelligence & Reasoning", topics: ["Analogies", "Coding-Decoding", "Puzzles", "Blood Relations", "Direction Sense", "Syllogism"], marks: 50 },
      { subject: "General Awareness", topics: ["History", "Geography", "Polity", "Economics", "Science", "Current Affairs"], marks: 50 },
    ],
    previousYearPapers: [
      {
        year: 2024,
        questions: [
          { id: "ssc-cgl-1", text: "If the sum of two numbers is 15 and the sum of their squares is 113, then the product of the two numbers is:", options: ["56", "60", "64", "52"], correctAnswer: 0, subject: "Quantitative Aptitude", difficulty: "medium", explanation: "Let numbers be a and b. a+b=15, a²+b²=113. (a+b)²=a²+2ab+b². 225=113+2ab. ab=56." },
          { id: "ssc-cgl-2", text: "Select the word which means the same as 'Ephemeral':", options: ["Eternal", "Transient", "Permanent", "Durable"], correctAnswer: 1, subject: "English Language", difficulty: "easy", explanation: "Ephemeral means lasting for a very short time, which is synonymous with 'Transient'." },
          { id: "ssc-cgl-3", text: "In a certain code language, 'COMPUTER' is written as 'DPNQVUFS'. How will 'SCIENCE' be written?", options: ["TDJFODF", "TDKFMBD", "TDJFMDF", "TDJFOCE"], correctAnswer: 0, subject: "General Intelligence & Reasoning", difficulty: "medium", explanation: "Each letter is shifted by +1 in the alphabet. S→T, C→D, I→J, E→F, N→O, C→D, E→F." },
          { id: "ssc-cgl-4", text: "The Indian Constitution came into effect on:", options: ["26 January 1950", "15 August 1947", "26 November 1949", "2 October 1950"], correctAnswer: 0, subject: "General Awareness", difficulty: "easy", explanation: "The Indian Constitution came into effect on 26 January 1950, which is celebrated as Republic Day." },
          { id: "ssc-cgl-5", text: "A train 120m long passes a pole in 12 seconds. What is the speed of the train in km/hr?", options: ["36", "40", "32", "28"], correctAnswer: 0, subject: "Quantitative Aptitude", difficulty: "easy", explanation: "Speed = 120/12 = 10 m/s = 10 × 18/5 = 36 km/hr." },
        ],
      },
    ],
  },
  {
    id: "upsc-cse",
    name: "UPSC Civil Services Examination",
    shortName: "UPSC CSE",
    description: "The most prestigious examination for recruitment to the All India Services including IAS, IPS, and IFS.",
    icon: "🇮🇳",
    category: "UPSC",
    vacancies: "1,056+",
    lastCutoff: "747 / 1050 (General)",
    nextExamDate: "May 2026",
    eligibility: "Graduate, Age 21-32 years",
    syllabus: [
      { subject: "General Studies I", topics: ["Indian Heritage & Culture", "History", "World Geography", "Society"], marks: 250 },
      { subject: "General Studies II", topics: ["Governance", "Constitution", "Polity", "International Relations"], marks: 250 },
      { subject: "General Studies III", topics: ["Technology", "Economic Development", "Environment", "Disaster Management"], marks: 250 },
      { subject: "General Studies IV", topics: ["Ethics", "Integrity", "Aptitude", "Case Studies"], marks: 250 },
    ],
    previousYearPapers: [
      {
        year: 2024,
        questions: [
          { id: "upsc-1", text: "Which Article of the Indian Constitution deals with the Right to Equality?", options: ["Article 14", "Article 19", "Article 21", "Article 32"], correctAnswer: 0, subject: "General Studies II", difficulty: "easy", explanation: "Article 14 guarantees the Right to Equality before law and equal protection of laws." },
          { id: "upsc-2", text: "The 'Green Revolution' in India was primarily led by:", options: ["Verghese Kurien", "M.S. Swaminathan", "Norman Borlaug", "C. Subramaniam"], correctAnswer: 1, subject: "General Studies I", difficulty: "medium", explanation: "M.S. Swaminathan is known as the Father of the Green Revolution in India." },
          { id: "upsc-3", text: "Which of the following is NOT a Fundamental Right?", options: ["Right to Property", "Right to Freedom", "Right to Equality", "Right against Exploitation"], correctAnswer: 0, subject: "General Studies II", difficulty: "easy", explanation: "Right to Property was removed from Fundamental Rights by the 44th Amendment Act, 1978." },
          { id: "upsc-4", text: "The Tropic of Cancer passes through how many Indian states?", options: ["6", "7", "8", "9"], correctAnswer: 2, subject: "General Studies I", difficulty: "medium", explanation: "The Tropic of Cancer passes through 8 states: Gujarat, Rajasthan, MP, Chhattisgarh, Jharkhand, West Bengal, Tripura, and Mizoram." },
        ],
      },
    ],
  },
  {
    id: "ibps-po",
    name: "IBPS Probationary Officer",
    shortName: "IBPS PO",
    description: "Recruitment exam for Probationary Officers in public sector banks across India.",
    icon: "🏦",
    category: "Banking",
    vacancies: "8,432+",
    lastCutoff: "78.25 / 100 (Prelims)",
    nextExamDate: "October 2026",
    eligibility: "Graduate, Age 20-30 years",
    syllabus: [
      { subject: "Quantitative Aptitude", topics: ["Simplification", "Number Series", "Data Interpretation", "Quadratic Equations"], marks: 35 },
      { subject: "Reasoning Ability", topics: ["Puzzles", "Seating Arrangement", "Syllogism", "Inequality", "Coding-Decoding"], marks: 35 },
      { subject: "English Language", topics: ["Reading Comprehension", "Cloze Test", "Error Spotting", "Para Jumbles"], marks: 30 },
    ],
    previousYearPapers: [
      {
        year: 2024,
        questions: [
          { id: "ibps-1", text: "What is 45% of 800?", options: ["320", "360", "400", "340"], correctAnswer: 1, subject: "Quantitative Aptitude", difficulty: "easy", explanation: "45% of 800 = (45/100) × 800 = 360." },
          { id: "ibps-2", text: "In a row of 40 students, R is 7th from the right end. What is his position from the left end?", options: ["33rd", "34th", "35th", "32nd"], correctAnswer: 1, subject: "Reasoning Ability", difficulty: "easy", explanation: "Position from left = Total - Position from right + 1 = 40 - 7 + 1 = 34th." },
        ],
      },
    ],
  },
  {
    id: "rrb-ntpc",
    name: "RRB Non-Technical Popular Categories",
    shortName: "RRB NTPC",
    description: "Railway recruitment for non-technical posts including Station Master, Goods Guard, and Clerk positions.",
    icon: "🚂",
    category: "Railway",
    vacancies: "35,281+",
    lastCutoff: "102.5 / 120",
    nextExamDate: "June 2026",
    eligibility: "Graduate / 12th Pass (varies by post)",
    syllabus: [
      { subject: "Mathematics", topics: ["Number System", "Decimals", "Fractions", "LCM & HCF", "Ratio", "Percentage", "Time & Work"], marks: 30 },
      { subject: "General Intelligence & Reasoning", topics: ["Analogies", "Number Series", "Coding-Decoding", "Syllogism", "Venn Diagrams"], marks: 30 },
      { subject: "General Awareness", topics: ["Current Affairs", "Indian History", "Geography", "Polity", "Economics", "Science"], marks: 40 },
    ],
    previousYearPapers: [
      {
        year: 2024,
        questions: [
          { id: "rrb-1", text: "The headquarters of Indian Railways is located in:", options: ["Mumbai", "Kolkata", "New Delhi", "Chennai"], correctAnswer: 2, subject: "General Awareness", difficulty: "easy", explanation: "The headquarters of Indian Railways is in New Delhi." },
          { id: "rrb-2", text: "Find the odd one out: 2, 5, 10, 17, 28, 37", options: ["28", "37", "17", "10"], correctAnswer: 0, subject: "General Intelligence & Reasoning", difficulty: "medium", explanation: "Pattern: +3, +5, +7, +9, +11. After 17, it should be 26, not 28." },
        ],
      },
    ],
  },
  {
    id: "ssc-chsl",
    name: "SSC Combined Higher Secondary Level",
    shortName: "SSC CHSL",
    description: "Recruitment for LDC, JSA, PA, SA, and DEO posts in various government departments.",
    icon: "📋",
    category: "SSC",
    vacancies: "6,850+",
    lastCutoff: "180 / 200",
    nextExamDate: "April 2026",
    eligibility: "12th Pass from recognized Board",
    syllabus: [
      { subject: "Quantitative Aptitude", topics: ["Arithmetic", "Algebra", "Geometry", "Trigonometry", "Statistics"], marks: 50 },
      { subject: "English Language", topics: ["Vocabulary", "Grammar", "Reading Comprehension", "Sentence Formation"], marks: 50 },
      { subject: "General Intelligence", topics: ["Reasoning", "Analogy", "Classification", "Coding-Decoding", "Matrix"], marks: 50 },
      { subject: "General Awareness", topics: ["History", "Culture", "Geography", "Economics", "Polity", "Science"], marks: 50 },
    ],
    previousYearPapers: [
      {
        year: 2024,
        questions: [
          { id: "chsl-1", text: "Who wrote 'Discovery of India'?", options: ["Mahatma Gandhi", "Jawaharlal Nehru", "Sardar Patel", "Dr. Ambedkar"], correctAnswer: 1, subject: "General Awareness", difficulty: "easy", explanation: "'Discovery of India' was written by Jawaharlal Nehru during his imprisonment at Ahmednagar Fort." },
        ],
      },
    ],
  },
  {
    id: "nda",
    name: "National Defence Academy",
    shortName: "NDA",
    description: "Entry exam for candidates aspiring to join the Indian Armed Forces — Army, Navy, and Air Force.",
    icon: "⭐",
    category: "Defence",
    vacancies: "400+",
    lastCutoff: "343 / 900",
    nextExamDate: "April 2026",
    eligibility: "12th Pass, Age 16.5 - 19.5 years",
    syllabus: [
      { subject: "Mathematics", topics: ["Algebra", "Matrices", "Trigonometry", "Calculus", "Statistics", "Probability"], marks: 300 },
      { subject: "General Ability Test", topics: ["English", "Physics", "Chemistry", "General Science", "History", "Geography", "Current Events"], marks: 600 },
    ],
    previousYearPapers: [
      {
        year: 2024,
        questions: [
          { id: "nda-1", text: "The rank of a matrix is defined as:", options: ["Number of rows", "Number of columns", "Order of highest non-zero minor", "Sum of all elements"], correctAnswer: 2, subject: "Mathematics", difficulty: "medium", explanation: "The rank of a matrix is the order of the highest order non-zero minor of the matrix." },
        ],
      },
    ],
  },
];
