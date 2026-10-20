export interface DocumentPageContent {
  pageNumber: number;
  header: string;
  subHeader?: string;
  sections: {
    heading?: string;
    text?: string;
    bullets?: string[];
    formula?: string;
    diagramType?: 'matrix' | 'table' | 'code' | 'exam_question';
    diagramData?: any;
    facultyNote?: string;
  }[];
}

export interface DocumentData {
  title: string;
  subtitle: string;
  collegeHeader: string;
  department: string;
  academicYear: string;
  totalPages: number;
  pages: DocumentPageContent[];
}

export function getMockDocumentContent(resourceId: string, title: string): DocumentData {
  // Customized content for different document types
  if (resourceId.includes('matrix-inv') || title.toLowerCase().includes('matrix')) {
    return {
      title: 'Unit 1: Inverse of a Matrix by Elementary Row Operations (Gauss-Jordan Method)',
      subtitle: 'Course: BAS-101 Engineering Mathematics-I | Department of Applied Sciences',
      collegeHeader: 'UNITED GROUP OF INSTITUTIONS (UGI) - ACADEMIC STUDY REPOSITORY',
      department: 'Faculty of Applied Sciences & Engineering',
      academicYear: '2024-2025',
      totalPages: 3,
      pages: [
        {
          pageNumber: 1,
          header: 'Lecture 04: Elementary Transformations & Invertibility Criteria',
          subHeader: 'Verified Class Lecture Notes by Prof. Rajesh Sharma',
          sections: [
            {
              heading: '1. Definition of Inverse Matrix',
              text: 'Let A be a square matrix of order n. If there exists another square matrix B of order n such that A · B = B · A = I_n (Identity Matrix), then B is called the inverse of A, denoted as A⁻¹.',
              formula: 'A · A⁻¹ = A⁻¹ · A = I',
              facultyNote: 'Important AKTU Rule: The inverse of a square matrix exists if and only if |A| ≠ 0 (i.e., A is non-singular).',
            },
            {
              heading: '2. Gauss-Jordan Elimination Method Algorithm',
              bullets: [
                'Step 1: Set up the augmented matrix [ A | I_n ] of size n × 2n.',
                'Step 2: Apply elementary row operations exclusively to transform the left block A into the identity matrix I_n.',
                'Step 3: The matrix that simultaneously appears on the right side is the exact inverse A⁻¹.',
                'Caution: Never mix column operations with row operations when computing inverse using this method.',
              ],
            },
          ],
        },
        {
          pageNumber: 2,
          header: 'Step-by-Step Solved Problem (AKTU 2023 - 7 Marks)',
          subHeader: 'Question: Find the inverse of matrix A using elementary row transformations.',
          sections: [
            {
              heading: 'Given Matrix A:',
              diagramType: 'matrix',
              diagramData: {
                matrix: [
                  [1, 2, -2],
                  [-1, 3, 0],
                  [0, -2, 1],
                ],
              },
              facultyNote: 'First verify determinant: |A| = 1(3 - 0) - 2(-1 - 0) - 2(2 - 0) = 3 + 2 - 4 = 1 ≠ 0. Hence A⁻¹ exists.',
            },
            {
              heading: 'Augmented System [A | I]:',
              diagramType: 'table',
              diagramData: {
                headers: ['Operation', 'Matrix Representation [A | I]', 'Explanation'],
                rows: [
                  ['R2 → R2 + R1', '[[1, 2, -2 | 1, 0, 0], [0, 5, -2 | 1, 1, 0], [0, -2, 1 | 0, 0, 1]]', 'Eliminates element a21'],
                  ['R2 → R2 + 2R3', '[[1, 2, -2 | 1, 0, 0], [0, 1, 0 | 1, 1, 2], [0, -2, 1 | 0, 0, 1]]', 'Simplifies pivot row 2'],
                  ['R3 → R3 + 2R2', '[[1, 2, -2 | 1, 0, 0], [0, 1, 0 | 1, 1, 2], [0, 0, 1 | 2, 2, 5]]', 'Creates triangular form'],
                  ['Final R1 back-sub', '[[1, 0, 0 | 3, 2, 6], [0, 1, 0 | 1, 1, 2], [0, 0, 1 | 2, 2, 5]]', 'A reduced to identity matrix I'],
                ],
              },
              formula: 'A⁻¹ = [[3, 2, 6], [1, 1, 2], [2, 2, 5]]',
              facultyNote: 'Verification: Check row 1: 1·3 + 2·1 + (-2)·2 = 3 + 2 - 4 = 1. Validated!',
            },
          ],
        },
        {
          pageNumber: 3,
          header: 'Practice Examination Set for Sessional 1',
          subHeader: 'Self-assessment questions curated from past 5 years of AKTU papers',
          sections: [
            {
              heading: 'Mandatory Practice Problems',
              bullets: [
                'Q1 (5 Marks): Find the rank of the matrix [[1, 2, 3], [2, 4, 7], [3, 6, 10]] by reducing to Echelon form.',
                'Q2 (7 Marks): If A = [[2, -1, 1], [-1, 2, -1], [1, -1, 2]], compute its eigenvalues and find eigenvectors corresponding to the smallest eigenvalue.',
                'Q3 (10 Marks): State Cayley-Hamilton theorem and use it to find the inverse of A = [[1, 1, 2], [3, 1, 1], [2, 3, 1]].',
              ],
              facultyNote: 'Submit solved handwritten assignments to Department Room 304 by Friday 4 PM.',
            },
          ],
        },
      ],
    };
  }

  if (resourceId.includes('sess') || title.toLowerCase().includes('sessional')) {
    return {
      title: 'UGI Departmental Sessional Examination Paper & Solution Key',
      subtitle: 'United Group of Institutions | Semester Examination Cell',
      collegeHeader: 'UNITED GROUP OF INSTITUTIONS (UGI) - EXAMINATION DIVISION',
      department: 'Department of Computer Science & Engineering',
      academicYear: '2024-2025',
      totalPages: 2,
      pages: [
        {
          pageNumber: 1,
          header: 'UGI Sessional Examination 2024-2025 (Official Paper)',
          subHeader: 'Subject: BAS-101 / BCS-101 | Time: 2 Hours | Max Marks: 50',
          sections: [
            {
              heading: 'General Instructions:',
              bullets: [
                'All questions are compulsory. Section A contains 5 questions of 2 marks each.',
                'Section B contains 4 questions of 5 marks each (Attempt any 3).',
                'Section C contains 3 questions of 10 marks each (Attempt any 2).',
                'Assume suitable missing data if any, and state the assumptions clearly.',
              ],
            },
            {
              heading: 'SECTION A (Short Answer Questions - 10 Marks)',
              diagramType: 'exam_question',
              diagramData: [
                { qNo: '1(a)', text: 'State the condition for consistency of a system of linear equations AX = B.', marks: '2 Marks' },
                { qNo: '1(b)', text: 'Define orthogonal matrix and give one 2x2 example.', marks: '2 Marks' },
                { qNo: '1(c)', text: 'If eigenvalues of matrix A are 2, 3, 5, find the determinant of A and trace of A.', marks: '2 Marks' },
                { qNo: '1(d)', text: 'State the Cayley-Hamilton theorem.', marks: '2 Marks' },
                { qNo: '1(e)', text: 'What is the rank of a null matrix of order 3?', marks: '2 Marks' },
              ],
            },
          ],
        },
        {
          pageNumber: 2,
          header: 'Verified Solution Key & Marking Scheme (Faculty Verified)',
          subHeader: 'Prepared by Subject Coordinators: Prof. Rajesh Sharma & Dr. Sunita Verma',
          sections: [
            {
              heading: 'Solution to 1(a): Consistency Conditions',
              text: 'By Rouche-Capelli Theorem, the system AX = B is consistent if and only if Rank(A) = Rank([A|B]). If Rank(A) = Rank([A|B]) = n (number of variables), the system has a unique solution. If Rank(A) = Rank([A|B]) < n, there are infinitely many solutions.',
              facultyNote: 'Award full 2 marks for stating Rouche-Capelli theorem correctly with augmented matrix rank equality.',
            },
            {
              heading: 'Solution to 1(c): Eigenvalues & Determinant Property',
              formula: 'det(A) = λ₁ · λ₂ · λ₃ = 2 · 3 · 5 = 30\ntrace(A) = λ₁ + λ₂ + λ₃ = 2 + 3 + 5 = 10',
              facultyNote: 'Properties of eigenvalues: Product = Determinant, Sum = Trace. Standard AKTU recurring 2-marker.',
            },
          ],
        },
      ],
    };
  }

  // Default PYQ / Resource view
  return {
    title: title,
    subtitle: 'Dr. A.P.J. Abdul Kalam Technical University (AKTU) Official Archive',
    collegeHeader: 'DR. A.P.J. ABDUL KALAM TECHNICAL UNIVERSITY, LUCKNOW',
    department: 'UGI Academic Study Hub Verified Archive',
    academicYear: '2023-2024',
    totalPages: 2,
    pages: [
      {
        pageNumber: 1,
        header: 'AKTU End Semester Examination - Question Paper & Topic Mapping',
        subHeader: 'Paper Code: BCS / BAS Series | Regular & Carry Over Examination',
        sections: [
          {
            heading: 'Syllabus Coverage Breakdown',
            bullets: [
              'Unit 1 Weightage: 24% of overall examination score (Matrices & Linear Systems).',
              'Unit 2 Weightage: 22% of overall examination score (Calculus / Core Concepts).',
              'Unit 3 & 4 Weightage: 38% of overall examination score (Applied Applications).',
              'Unit 5 Weightage: 16% of overall examination score (Synthesis & Algorithms).',
            ],
            facultyNote: 'Study Tip: Practicing Section C long answers from 2022-2024 guarantees covering 75% of repeated conceptual variations.',
          },
          {
            heading: 'Section B Solved Highlights (Important Repeat Topics)',
            text: 'Detailed solutions have been prepared by senior faculty members for this paper. Click the Download button above for the high-resolution vector PDF.',
            diagramType: 'table',
            diagramData: {
              headers: ['Question No.', 'Syllabus Topic', 'AKTU Repeat Frequency', 'Marks'],
              rows: [
                ['Q. 2(a)', 'Inverse of 3x3 Matrix via Row Reduction', 'Repeated 4 times in 5 years', '7'],
                ['Q. 2(b)', 'Cayley Hamilton Theorem verification', 'Repeated every alternate year', '7'],
                ['Q. 2(c)', 'Consistency of non-homogeneous system', 'Every year Section B or C', '7'],
                ['Q. 3(a)', 'Diagonalization of symmetric matrix', 'Frequent in Odd Sem', '7'],
              ],
            },
          },
        ],
      },
      {
        pageNumber: 2,
        header: 'Faculty Exam Preparation Strategy & Recommended Next Topics',
        subHeader: 'Recommendations for students seeking >85% score in AKTU End Sem',
        sections: [
          {
            heading: 'High-Scoring Strategy:',
            bullets: [
              'Always start with Section C if you know 2 long-form questions thoroughly (20 marks secured in first 45 mins).',
              'Write step-by-step matrix row operations explicitly (e.g., R2 → R2 - 2R1) rather than skipping arithmetic.',
              'Box your final answers clearly with units where applicable.',
            ],
            facultyNote: 'If you encounter any doubt in this paper, you can use the Video Lectures tab to watch topic-wise explanations.',
          },
        ],
      },
    ],
  };
}
