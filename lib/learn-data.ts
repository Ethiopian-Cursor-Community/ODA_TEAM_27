export type Grade = 9 | 10 | 11 | 12;

export type SubjectId =
  | 'mathematics'
  | 'physics'
  | 'chemistry'
  | 'biology'
  | 'english';

export interface LearnTopic {
  title: string;
  definition: string;
  googleSearch: string;
  youtubeSearch: string;
  wikipediaSlug: string;
}

export interface IndexedTopic extends LearnTopic {
  grade: Grade;
  subjectId: SubjectId;
  key: string;
}

export interface SubjectInfo {
  id: SubjectId;
  name: string;
  emoji: string;
}

export const GRADES: Grade[] = [9, 10, 11, 12];

export const SUBJECTS: SubjectInfo[] = [
  { id: 'mathematics', name: 'Mathematics', emoji: '📐' },
  { id: 'physics', name: 'Physics', emoji: '⚛️' },
  { id: 'chemistry', name: 'Chemistry', emoji: '🧪' },
  { id: 'biology', name: 'Biology', emoji: '🧬' },
  { id: 'english', name: 'English', emoji: '📚' },
];

const SUBJECT_NAMES: Record<SubjectId, string> = {
  mathematics: 'Mathematics',
  physics: 'Physics',
  chemistry: 'Chemistry',
  biology: 'Biology',
  english: 'English',
};

type TopicInput = [title: string, definition: string, wikipediaSlug?: string];

function buildTopic(
  grade: Grade,
  subjectId: SubjectId,
  title: string,
  definition: string,
  wikipediaSlug?: string
): LearnTopic {
  const subject = SUBJECT_NAMES[subjectId];
  const query = `Ethiopian Grade ${grade} ${subject} ${title}`;
  const slug =
    wikipediaSlug ??
    title
      .replace(/&/g, 'and')
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/\s+/g, '_');

  return {
    title,
    definition,
    googleSearch: query,
    youtubeSearch: query,
    wikipediaSlug: slug,
  };
}

function topicsFor(
  grade: Grade,
  subjectId: SubjectId,
  items: TopicInput[]
): LearnTopic[] {
  return items.map(([title, definition, wiki]) =>
    buildTopic(grade, subjectId, title, definition, wiki)
  );
}

export const LEARN_TOPICS: Record<string, LearnTopic[]> = {
  '9-mathematics': topicsFor(9, 'mathematics', [
    [
      'Set Theory',
      'Set theory studies collections of objects called elements. You learn union, intersection, complement, and how to represent sets on a Venn diagram—foundations for logic and algebra in the Ethiopian Grade 9 textbook.',
      'Set_(mathematics)',
    ],
    [
      'Number Systems',
      'Natural numbers (ℕ), integers (ℤ), rational numbers (ℚ), and real numbers (ℝ) are classified by how they are written and used. The textbook explains closure, density on the number line, and converting between fractions and decimals.',
      'Number',
    ],
    [
      'Solving Equations',
      'Linear equations in one variable are solved by balancing both sides: adding, subtracting, multiplying, or dividing equally. Ethiopian students practice word problems that translate daily situations into equations like ax + b = c.',
      'Linear_equation',
    ],
    [
      'Inequalities',
      'An inequality compares two expressions using <, >, ≤, or ≥. Solutions are often shown on a number line; multiplying or dividing by a negative number reverses the inequality sign—a key rule in Grade 9 mathematics.',
      'Inequality_(mathematics)',
    ],
    [
      'Geometry Basics',
      'Points, lines, angles, triangles, and quadrilaterals are studied with properties of parallel lines, angle sums, and simple constructions. Perimeter and area formulas for common shapes prepare you for formal proofs in later grades.',
      'Geometry',
    ],
  ]),

  '9-physics': topicsFor(9, 'physics', [
    [
      'Motion',
      'Motion describes how position changes over time. Speed, velocity, and acceleration are defined; distance-time and velocity-time graphs help Ethiopian students interpret uniform and non-uniform motion.',
      'Motion',
    ],
    [
      'Force',
      'A force is a push or pull measured in newtons (N). Contact forces (friction, tension) and non-contact forces (gravity, magnetism) change an object’s motion according to Newton’s laws introduced in the Grade 9 physics unit.',
      'Force',
    ],
    [
      'Work and Energy',
      'Work is done when a force moves an object in the force’s direction (W = F × d). Kinetic and potential energy convert between forms; the law of conservation of energy explains why total energy in a closed system stays constant.',
      'Work_(physics)',
    ],
    [
      'Sound',
      'Sound is a longitudinal wave that needs a medium to travel. Pitch relates to frequency, loudness to amplitude, and echo to reflection—the Ethiopian textbook links these ideas to musical instruments and hearing.',
      'Sound',
    ],
    [
      'Electricity',
      'Electric current is the flow of charge through a conductor. Circuits include cells, switches, resistors, and lamps; Ohm’s law (V = IR) and series vs. parallel connections are introduced with safety rules for household wiring.',
      'Electricity',
    ],
  ]),

  '9-chemistry': topicsFor(9, 'chemistry', [
    [
      'Atomic Structure',
      'Atoms contain protons and neutrons in the nucleus with electrons in shells. Atomic number Z counts protons; mass number A is protons plus neutrons—isotopes share Z but differ in neutrons.',
      'Atom',
    ],
    [
      'Periodic Table',
      'Elements are arranged by increasing atomic number in periods (rows) and groups (columns) with similar properties. The Ethiopian curriculum highlights metals, non-metals, and metalloids and trends in valency across groups.',
      'Periodic_table',
    ],
    [
      'Chemical Bonding',
      'Atoms bond by losing, gaining, or sharing electrons. Ionic bonds form between metals and non-metals; covalent bonds share electron pairs in molecules like H₂O and CO₂ explained in your textbook.',
      'Chemical_bond',
    ],
    [
      'Chemical Reactions',
      'Reactants transform into products with conservation of mass. Students learn to balance equations, identify combination, decomposition, displacement, and combustion reactions, and use state symbols (s), (l), (g), (aq).',
      'Chemical_reaction',
    ],
    [
      'Acids and Bases (Introduction)',
      'Acids release H⁺ ions in water; bases release OH⁻ ions. The pH scale from 0–14 measures acidity; neutralisation produces salt and water—previewing deeper work in Grade 10 chemistry.',
      'Acid',
    ],
  ]),

  '9-biology': topicsFor(9, 'biology', [
    [
      'Cell Biology',
      'The cell is the basic unit of life. Plant cells have cell walls and chloroplasts; animal cells do not. Organelles such as nucleus, mitochondria, and ribosomes each perform roles described in the Ethiopian Grade 9 biology text.',
      'Cell_(biology)',
    ],
    [
      'Digestive System',
      'Food is ingested, digested, absorbed, and egested. Enzymes in saliva, stomach, and intestines break down carbohydrates, proteins, and fats; villi in the small intestine increase surface area for absorption.',
      'Human_digestive_system',
    ],
    [
      'Respiratory System',
      'Gas exchange occurs in the alveoli of the lungs where oxygen diffuses into blood and carbon dioxide diffuses out. Breathing involves inhalation and exhalation controlled by the diaphragm and rib muscles.',
      'Respiratory_system',
    ],
    [
      'Photosynthesis',
      'Plants use chlorophyll to convert carbon dioxide and water into glucose and oxygen in the presence of light: 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂. This process feeds ecosystems and replenishes atmospheric oxygen.',
      'Photosynthesis',
    ],
    [
      'Classification of Living Things',
      'Organisms are grouped into kingdoms, phyla, classes, orders, families, genera, and species (binomial nomenclature). The Ethiopian textbook uses this system to compare plants, animals, fungi, and microorganisms.',
      'Taxonomy_(biology)',
    ],
  ]),

  '9-english': topicsFor(9, 'english', [
    [
      'Parts of Speech',
      'Nouns, pronouns, verbs, adjectives, adverbs, prepositions, conjunctions, and interjections are the building blocks of sentences. Recognising each part helps you analyse structure in reading and write clearer paragraphs.',
      'Part_of_speech',
    ],
    [
      'Tenses',
      'Simple present, past, and future tenses show when actions occur. Continuous and perfect forms add detail about duration and completion—essential for national exam grammar sections in Ethiopia.',
      'Grammatical_tense',
    ],
    [
      'Reading Comprehension',
      'Comprehension means understanding main ideas, supporting details, vocabulary in context, and author purpose. Ethiopian students practice summarising passages and answering inference questions from textbook excerpts.',
      'Reading_comprehension',
    ],
    [
      'Essay Writing',
      'Essays have an introduction with a thesis, body paragraphs with evidence, and a conclusion. Narrative, descriptive, and simple argumentative formats are taught with emphasis on unity and coherence.',
      'Essay',
    ],
    [
      'Vocabulary Development',
      'Word roots, prefixes, and suffixes expand academic vocabulary. Context clues, synonyms, and antonyms support reading science and social studies texts in English—the medium of instruction for many Ethiopian schools.',
      'Vocabulary',
    ],
  ]),

  '10-mathematics': topicsFor(10, 'mathematics', [
    [
      'Functions',
      'A function assigns exactly one output to each input. Domain and range, function notation f(x), and graphs of linear and quadratic functions are central to Ethiopian Grade 10 Unit 1 mathematics.',
      'Function_(mathematics)',
    ],
    [
      'Quadratic Equations',
      'A quadratic equation has the form ax² + bx + c = 0 (a ≠ 0). Solutions come from factoring, completing the square, or the quadratic formula; the discriminant tells whether roots are real and distinct.',
      'Quadratic_equation',
    ],
    [
      'Logarithms',
      'Logarithms are the inverse of exponents: if bˣ = y, then log_b(y) = x. Rules for product, quotient, and power help solve exponential growth problems in the Ethiopian Grade 10 textbook.',
      'Logarithm',
    ],
    [
      'Coordinate Geometry',
      'Points (x, y) on the Cartesian plane represent algebraic relationships. Distance, midpoint, slope, and equations of lines connect algebra to geometry for proofs and graphing.',
      'Analytic_geometry',
    ],
    [
      'Polynomials',
      'Polynomials are sums of terms with non-negative integer powers. Addition, multiplication, and factorisation prepare students for remainder and factor theorems used in later grades.',
      'Polynomial',
    ],
  ]),

  '10-physics': topicsFor(10, 'physics', [
    [
      'Magnetism',
      'Magnets have north and south poles; like poles repel, unlike attract. Magnetic fields are represented by field lines; electromagnets are made by passing current through a coil around an iron core.',
      'Magnetism',
    ],
    [
      'Waves',
      'Waves transfer energy without transferring matter. Transverse and longitudinal waves are defined by wavelength, frequency, amplitude, and speed v = fλ—applied to sound and water ripples in the textbook.',
      'Wave',
    ],
    [
      'Light',
      'Light travels in straight lines and reflects off surfaces (angle of incidence = angle of reflection). Refraction bends light at boundaries; lenses form images studied with ray diagrams.',
      'Light',
    ],
    [
      'Electric Circuits',
      'Current, voltage, and resistance relate by Ohm’s law. Series circuits share one current; parallel circuits share one voltage. Power P = IV explains energy use in bulbs and appliances.',
      'Electrical_circuit',
    ],
    [
      'Heat and Temperature',
      'Temperature measures average kinetic energy of particles; heat is energy transfer due to temperature difference. Conduction, convection, and radiation explain heating in homes and the environment.',
      'Heat',
    ],
  ]),

  '10-chemistry': topicsFor(10, 'chemistry', [
    [
      'Chemical Equations',
      'Balanced equations show equal numbers of each atom on both sides. Coefficients scale whole molecules; students practice writing equations for reactions studied in the lab and textbook.',
      'Chemical_equation',
    ],
    [
      'Acids and Bases',
      'Acids donate H⁺; bases accept H⁺ or donate OH⁻. pH indicators and neutralisation reactions produce salts—key content for Ethiopian Grade 10 national exam chemistry.',
      'Acid',
    ],
    [
      'Salts',
      'Salts form when acids react with bases, metals, or carbonates. Naming salts (e.g., sodium chloride) and preparing crystals by evaporation are practical skills in the curriculum.',
      'Salt',
    ],
    [
      'Electrolysis',
      'Electrolysis uses electric current to decompose ionic compounds in solution or molten state. Products appear at the cathode (reduction) and anode (oxidation) as taught in Grade 10 chemistry.',
      'Electrolysis',
    ],
    [
      'Stoichiometry',
      'Mole ratios from balanced equations predict masses and volumes of reactants and products. Relative atomic mass links the mole to grams for quantitative chemistry calculations.',
      'Stoichiometry',
    ],
  ]),

  '10-biology': topicsFor(10, 'biology', [
    [
      'Genetics',
      'Genes on chromosomes carry hereditary information. Dominant and recessive alleles, Punnett squares, and Mendel’s laws explain how traits pass from parents to offspring.',
      'Genetics',
    ],
    [
      'Evolution',
      'Evolution is change in inherited traits over generations. Natural selection, adaptation, and fossil evidence support the unity and diversity of life in the Ethiopian Grade 10 biology syllabus.',
      'Evolution',
    ],
    [
      'Human Body Systems',
      'Circulatory, excretory, nervous, and endocrine systems work together to maintain homeostasis. The textbook links structure of organs to their function in health and disease.',
      'Organ_system',
    ],
    [
      'Ecology',
      'Ecosystems include biotic and abiotic factors, food chains, food webs, and energy pyramids. Population growth, pollution, and conservation are discussed in the Ethiopian context.',
      'Ecology',
    ],
    [
      'Cell Division',
      'Mitosis produces identical body cells for growth and repair; meiosis halves chromosome number to form gametes for sexual reproduction. Stages are named and diagrammed in the textbook.',
      'Cell_division',
    ],
  ]),

  '10-english': topicsFor(10, 'english', [
    [
      'Literary Devices',
      'Simile, metaphor, personification, alliteration, and symbolism enrich literature. Identifying devices in poems and short stories is required for Ethiopian Grade 10 English analysis.',
      'Literary_device',
    ],
    [
      'Advanced Tenses',
      'Present perfect, past perfect, and future perfect connect time periods. Reported speech shifts pronouns and tenses when retelling what someone said.',
      'Grammatical_tense',
    ],
    [
      'Reading Comprehension',
      'Students analyse tone, purpose, and implied meaning in longer passages. Summaries must be concise and in your own words for exam success.',
      'Reading_comprehension',
    ],
    [
      'Formal Letter Writing',
      'Formal letters include sender address, date, recipient, salutation, body paragraphs, closing, and signature. Applications and letters to officials follow formats in the Ethiopian English textbook.',
      'Letter_(message)',
    ],
    [
      'Debate and Speech',
      'Persuasive speeches use a clear claim, reasons, and evidence. Debate structure includes proposition, opposition, rebuttal, and conclusion—skills for school competitions and exams.',
      'Public_speaking',
    ],
  ]),

  '11-mathematics': topicsFor(11, 'mathematics', [
    [
      'Matrices',
      'A matrix is a rectangular array of numbers. Addition and scalar multiplication are element-wise; matrix multiplication combines rows and columns for solving systems in the Ethiopian Grade 11 text.',
      'Matrix_(mathematics)',
    ],
    [
      'Vectors',
      'Vectors have magnitude and direction. Addition by triangle or parallelogram rule and resolution into components support physics and geometry problems in the curriculum.',
      'Euclidean_vector',
    ],
    [
      'Trigonometry',
      'Sine, cosine, and tangent ratios relate angles to sides in right triangles. Identities and graphs of trigonometric functions extend to non-right triangles and periodic models.',
      'Trigonometry',
    ],
    [
      'Calculus Basics',
      'Limits describe approaching values; the derivative measures instantaneous rate of change. Ethiopian Grade 11 introduces differentiation of simple power functions as preparation for Grade 12.',
      'Calculus',
    ],
    [
      'Sequences and Series',
      'Arithmetic and geometric sequences have explicit formulas for the nth term. Series sum finite terms; convergence ideas preview university mathematics.',
      'Sequence',
    ],
  ]),

  '11-physics': topicsFor(11, 'physics', [
    [
      'Kinematics',
      'Kinematics describes motion without forces: displacement, velocity, acceleration, and equations of motion for uniform acceleration (e.g., v = u + at). Graphical analysis is emphasised.',
      'Kinematics',
    ],
    [
      'Dynamics',
      'Newton’s laws connect force, mass, and acceleration (F = ma). Friction, tension, and free-body diagrams solve problems on inclined planes and connected masses.',
      'Dynamics_(physics)',
    ],
    [
      'Fluid Mechanics',
      'Pressure in fluids is P = hρg. Pascal’s principle and Archimedes’ principle explain hydraulics and buoyancy—applications in dams and ships appear in the Ethiopian textbook.',
      'Fluid_mechanics',
    ],
    [
      'Thermodynamics',
      'Temperature scales, heat capacity, and latent heat describe energy in heating and phase change. The first law states energy is conserved in thermal processes.',
      'Thermodynamics',
    ],
    [
      'Simple Harmonic Motion',
      'Oscillations like a mass on a spring repeat with period and frequency. Energy alternates between kinetic and potential forms—linking waves and mechanics in Grade 11.',
      'Harmonic_oscillator',
    ],
  ]),

  '11-chemistry': topicsFor(11, 'chemistry', [
    [
      'Atomic Theory',
      'Electrons occupy quantised energy levels in atoms. Electron configuration and periodic trends in atomic radius, ionisation energy, and electronegativity explain chemical behaviour.',
      'Atomic_theory',
    ],
    [
      'Chemical Kinetics',
      'Reaction rate depends on concentration, temperature, surface area, and catalysts. Collision theory states particles must collide with sufficient energy and correct orientation.',
      'Chemical_kinetics',
    ],
    [
      'Chemical Equilibrium',
      'Reversible reactions reach dynamic equilibrium when forward and reverse rates are equal. Le Chatelier’s principle predicts how stress shifts equilibrium position.',
      'Chemical_equilibrium',
    ],
    [
      'Organic Chemistry Introduction',
      'Hydrocarbons contain carbon and hydrogen: alkanes, alkenes, and alkynes differ by bond type. Functional groups introduce alcohols and acids in the Ethiopian Grade 11 syllabus.',
      'Organic_chemistry',
    ],
    [
      'Redox Reactions',
      'Oxidation is loss of electrons; reduction is gain. Balancing redox equations and identifying oxidising and reducing agents supports electrochemistry units.',
      'Redox',
    ],
  ]),

  '11-biology': topicsFor(11, 'biology', [
    [
      'Biochemistry',
      'Carbohydrates, lipids, proteins, and nucleic acids are biological macromolecules. Enzymes speed reactions by lowering activation energy—essential for metabolism.',
      'Biochemistry',
    ],
    [
      'Cell Division',
      'Mitosis and meiosis are compared stage by stage. Chromosome number, crossing over, and genetic variation from meiosis support the genetics unit.',
      'Cell_division',
    ],
    [
      'Plant Biology',
      'Root, stem, and leaf structures adapt plants to transport water (xylem) and sugars (phloem). Transpiration and tropisms connect physiology to ecology.',
      'Botany',
    ],
    [
      'Human Reproduction',
      'Male and female reproductive systems produce gametes. Fertilisation, development, and family planning topics align with Ethiopian health education guidelines.',
      'Human_reproductive_system',
    ],
    [
      'Immunity',
      'The immune system uses white blood cells, antibodies, and memory cells to fight pathogens. Vaccination and HIV/AIDS awareness are discussed in the national curriculum.',
      'Immune_system',
    ],
  ]),

  '11-english': topicsFor(11, 'english', [
    [
      'Literary Analysis',
      'Students interpret theme, character, plot, and setting in novels and plays. Evidence from the text supports each point in structured exam essays.',
      'Literary_criticism',
    ],
    [
      'Report Writing',
      'Reports use headings, objective language, and data presentation. Laboratory and survey reports follow formats prescribed in the Ethiopian Grade 11 English book.',
      'Report',
    ],
    [
      'Oral Communication',
      'Clear pronunciation, eye contact, and organised ideas improve speeches and interviews. Listening skills include note-taking from lectures and discussions.',
      'Communication',
    ],
    [
      'Grammar: Clauses',
      'Independent and dependent clauses build simple, compound, and complex sentences. Relative, adverbial, and noun clauses are identified and punctuated correctly.',
      'Clause',
    ],
    [
      'Critical Reading',
      'Critical reading questions bias, fact vs. opinion, and argument strength. Media literacy connects classroom English to news and online sources.',
      'Critical_literacy',
    ],
  ]),

  '12-mathematics': topicsFor(12, 'mathematics', [
    [
      'Limits',
      'A limit is the value a function approaches as the input approaches a point. Limits underpin continuity and differentiation in Ethiopian Grade 12 calculus.',
      'Limit_(mathematics)',
    ],
    [
      'Derivatives',
      'The derivative f′(x) gives the slope of the tangent and instantaneous rate of change. Rules for power, product, quotient, and chain functions are applied to optimisation problems.',
      'Derivative',
    ],
    [
      'Integrals',
      'Integration finds area under curves and reverses differentiation. Definite integrals use the fundamental theorem of calculus; applications include area and simple volume.',
      'Integral',
    ],
    [
      'Probability',
      'Probability measures likelihood from 0 to 1. Permutations, combinations, and conditional probability solve exam problems on chance and data.',
      'Probability',
    ],
    [
      'Statistics',
      'Mean, median, mode, variance, and standard deviation summarise data. Histograms and normal distribution basics support the Ethiopian university entrance exam mathematics section.',
      'Statistics',
    ],
  ]),

  '12-physics': topicsFor(12, 'physics', [
    [
      'Electromagnetism',
      'Moving charges create magnetic fields; changing magnetic flux induces emf (electromagnetic induction). Transformers and generators apply Faraday’s law in the textbook.',
      'Electromagnetism',
    ],
    [
      'Modern Physics',
      'Photoelectric effect and wave-particle duality introduce quantum ideas. Special relativity notes that light speed is constant for all observers—overview for advanced students.',
      'Modern_physics',
    ],
    [
      'Nuclear Physics',
      'The nucleus contains protons and neutrons bound by strong force. Radioactive decay (alpha, beta, gamma), half-life, and nuclear energy E = mc² are Grade 12 topics.',
      'Nuclear_physics',
    ],
    [
      'Alternating Current',
      'AC voltage and current vary sinusoidally. Peak and RMS values, transformers, and power transmission losses are studied for Ethiopian national exam physics.',
      'Alternating_current',
    ],
    [
      'Electronics Basics',
      'Diodes, transistors, and logic gates form the basis of digital circuits. Semiconductors and applications in communication technology close the physics syllabus.',
      'Electronics',
    ],
  ]),

  '12-chemistry': topicsFor(12, 'chemistry', [
    [
      'Organic Chemistry',
      'Carbon forms four covalent bonds in chains and rings. Isomerism, nomenclature, and reactions of hydrocarbons and functional groups dominate Ethiopian Grade 12 chemistry.',
      'Organic_chemistry',
    ],
    [
      'Polymer Chemistry',
      'Polymers are large molecules built from repeating monomers. Addition and condensation polymerisation produce plastics, fibres, and rubber studied for industry and environment.',
      'Polymer',
    ],
    [
      'Industrial Chemistry',
      'The Haber process, contact process, and electrolysis of brine link laboratory chemistry to factories. Environmental impact and green chemistry are discussed in the textbook.',
      'Industrial_chemistry',
    ],
    [
      'Electrochemistry',
      'Galvanic cells convert chemical energy to electrical energy; electrolytic cells do the reverse. Standard electrode potentials rank oxidising and reducing strength.',
      'Electrochemistry',
    ],
    [
      'Qualitative Analysis',
      'Systematic tests identify cations, anions, and gases in unknown samples. Flame tests and precipitate reactions are practical skills for the Ethiopian school leaving exam.',
      'Qualitative_inorganic_analysis',
    ],
  ]),

  '12-biology': topicsFor(12, 'biology', [
    [
      'Microbiology',
      'Bacteria, viruses, fungi, and protists are classified by structure and reproduction. Beneficial microbes (fermentation) and pathogens (disease) are compared in the curriculum.',
      'Microbiology',
    ],
    [
      'Biotechnology',
      'Biotechnology uses living organisms for medicine and agriculture. Genetic engineering, fermentation, and ethical issues appear in Ethiopian Grade 12 biology.',
      'Biotechnology',
    ],
    [
      'Disease and Immunity',
      'Infectious and non-infectious diseases differ in cause and prevention. Immune response, vaccination programmes, and public health in Ethiopia are emphasised.',
      'Immune_system',
    ],
    [
      'Genetic Engineering',
      'Recombinant DNA technology inserts genes into host cells. Applications include insulin production and crop improvement; risks and ethics are debated.',
      'Genetic_engineering',
    ],
    [
      'Environmental Biology',
      'Biodiversity, deforestation, climate change, and conservation strategies protect ecosystems. Sustainable development links biology to national policy goals.',
      'Conservation_biology',
    ],
  ]),

  '12-english': topicsFor(12, 'english', [
    [
      'Advanced Composition',
      'Argumentative essays defend a thesis with logical reasoning and counter-arguments. Cohesion, formal register, and paragraph unity are assessed on the leaving exam.',
      'Essay',
    ],
    [
      'Poetry Analysis',
      'Poems are analysed for form, rhyme, metre, imagery, and theme. Ethiopian and world poets appear in anthologies used for oral and written interpretation.',
      'Poetry',
    ],
    [
      'Exam Preparation',
      'Time management, question types, and marking criteria for the Ethiopian university entrance English exam are practised with past papers and model answers.',
      'Test_preparation',
    ],
    [
      'Drama and Prose',
      'One-act plays and short novels are studied for plot structure, dialogue, and character development. Students compare social issues in literature to real life.',
      'Drama',
    ],
    [
      'Research Skills',
      'Finding credible sources, citing references, and avoiding plagiarism support project work. Note cards and outlines precede long research essays in Grade 12.',
      'Research',
    ],
  ]),
};

let _allTopicsCache: IndexedTopic[] | null = null;

export function getAllTopics(): IndexedTopic[] {
  if (_allTopicsCache) return _allTopicsCache;

  const indexed: IndexedTopic[] = [];
  for (const [key, topics] of Object.entries(LEARN_TOPICS)) {
    const [gradeStr, subjectId] = key.split('-') as [string, SubjectId];
    const grade = Number(gradeStr) as Grade;
    topics.forEach((topic) => {
      indexed.push({
        ...topic,
        grade,
        subjectId,
        key: `${key}-${topic.title}`,
      });
    });
  }
  _allTopicsCache = indexed;
  return indexed;
}

export function getTopics(grade: Grade, subjectId: SubjectId): LearnTopic[] {
  return LEARN_TOPICS[`${grade}-${subjectId}`] ?? [];
}

export function getGoogleUrl(topic: LearnTopic): string {
  return `https://www.google.com/search?q=${encodeURIComponent(topic.googleSearch)}`;
}

export function getYoutubeUrl(topic: LearnTopic): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(topic.youtubeSearch)}`;
}

export function getWikipediaUrl(topic: LearnTopic): string {
  return `https://en.wikipedia.org/wiki/${encodeURIComponent(topic.wikipediaSlug)}`;
}

export function searchTopics(query: string): IndexedTopic[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return [];

  return getAllTopics().filter(
    (item) =>
      item.title.toLowerCase().includes(trimmed) ||
      item.definition.toLowerCase().includes(trimmed)
  );
}

export function getSubjectName(subjectId: SubjectId): string {
  return SUBJECT_NAMES[subjectId];
}
