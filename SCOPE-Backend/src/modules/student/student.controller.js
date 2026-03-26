const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Fetch tests available for the student
// Fetch tests available for the student (Both Live and Upcoming)
exports.getAvailableTests = async (req, res) => {
  try {
    const tests = await prisma.tnpTest.findMany({
      // 🚨 REMOVED the strict "lte: now" date filter so future tests show up!
      where: {
        // You can add logic here later if you want to hide "Drafts"
        // status: { not: "Draft" } 
      },
      select: {
        id: true,
        title: true,
        date: true,
        duration: true,
        status: true,
        // We do NOT send questions yet to prevent inspection-tool cheating
      },
      orderBy: {
        date: 'asc' // Sort them so the closest tests appear first
      }
    });

    res.status(200).json({ success: true, data: tests });
  } catch (error) {
    console.error("Error fetching student tests:", error);
    res.status(500).json({ success: false, error: 'Failed to load assessments.' });
  }
};

// Fetch full exam details but STRIP correct answers (Anti-Cheat)
exports.getExamDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const exam = await prisma.tnpTest.findUnique({
      where: { id: id },
      include: {
        sections: {
          include: { questions: true }
        },
        codingProblems: {
          include: { testCases: true }
        }
      }
    });

    if (!exam) {
      return res.status(404).json({ success: false, error: "Exam not found." });
    }

    // --- ANTI-CHEAT DATA TRANSFORMATION ---
    const secureExam = {
      title: exam.title,
      duration: exam.duration,
      // Map sections and remove the 'ans' field from each question
      sections: exam.sections.map(sec => ({
        name: sec.name,
        questions: sec.questions.map(q => ({
          id: q.id,
          text: q.text,
          optA: q.optA,
          optB: q.optB,
          optC: q.optC,
          optD: q.optD,
          // We DO NOT include q.ans here!
        }))
      })),
      // Map coding problems and hide 'expectedOutput' for hidden test cases
      codingProblems: exam.codingProblems.map(cp => ({
        id: cp.id,
        title: cp.title,
        description: cp.description,
        marks: cp.marks,
        timeLimit: cp.timeLimit,
        memoryLimit: cp.memoryLimit,
        testCases: cp.testCases.map(tc => ({
          id: tc.id,
          input: tc.input,
          isHidden: tc.isHidden,
          // Only send output if it's a "Sample" case, hide if 'isHidden' is true
          expectedOutput: tc.isHidden ? null : tc.expectedOutput 
        }))
      }))
    };

    res.status(200).json({ success: true, data: secureExam });
  } catch (error) {
    console.error("Error loading exam:", error);
    res.status(500).json({ success: false, error: "Failed to load exam workspace." });
  }
};


exports.submitExam = async (req, res) => {
  try {
    const { id: testId } = req.params;
    const { answers, sourceCode, language, timeTaken } = req.body;
    const studentId = req.user?.id || "student_1"; // Placeholder until Auth is merged

    // 1. Fetch the original test with correct answers for grading
    const test = await prisma.tnpTest.findUnique({
      where: { id: testId },
      include: {
        sections: { include: { questions: true } },
        codingProblems: true
      }
    });

    if (!test) return res.status(404).json({ success: false, error: "Test not found" });

    let aptScore = 0, techScore = 0, totalScore = 0;
    const mcqSubmissions = [];

    // 2. Grade MCQ Sections
    test.sections.forEach(section => {
      section.questions.forEach((q, idx) => {
        // Workspace.jsx uses format: { "tech_0": index, "apt_1": index }
        const sectionKey = section.name.toLowerCase().startsWith('apt') ? 'apt' : 'tech';
        const studentChoiceIndex = answers[`${sectionKey}_${idx}`];
        
        // Map index (0,1,2,3) to letter (A,B,C,D) to match DB
        const indexToLetter = ['A', 'B', 'C', 'D'];
        const selectedLetter = indexToLetter[studentChoiceIndex];
        const isCorrect = selectedLetter === q.ans;

        if (isCorrect) {
          if (sectionKey === 'apt') aptScore += 1;
          else techScore += 1;
        }

        mcqSubmissions.push({
          questionId: q.id,
          selectedOption: selectedLetter || 'None',
          isCorrect
        });
      });
    });

    // 3. Create the Result record (Coding is initialized as 'Pending' for Judge0)
    const result = await prisma.studentResult.create({
      data: {
        studentId,
        testId,
        timeTaken: timeTaken || 0,
        aptScore,
        techScore,
        totalScore: aptScore + techScore, // Coding score updated after Judge0 runs
        mcqSubmissions: { create: mcqSubmissions },
        codingSubmissions: {
          create: test.codingProblems.map(cp => ({
            problemId: cp.id,
            language: language || 'java',
            submittedCode: sourceCode || '',
            status: 'Accepted', // Placeholder: Usually 'Processing'
            testCasesPassed: 0,
            totalTestCases: 0
          }))
        }
      }
    });

    res.status(201).json({ 
      success: true, 
      message: "Exam submitted successfully", 
      resultId: result.id 
    });

  } catch (error) {
    console.error("Submission Error:", error);
    res.status(500).json({ success: false, error: "Critical failure during submission." });
  }
};


exports.getAnalysis = async (req, res) => {
  try {
    const { id: testId } = req.params;
    const studentId = req.user?.id || "student_1"; // Placeholder for Auth

    // 1. Fetch this student's specific result
    const studentResult = await prisma.studentResult.findFirst({
      where: { testId, studentId },
      include: {
        codingSubmissions: true,
        mcqSubmissions: true,
        test: {
          select: { title: true }
        }
      }
    });

    if (!studentResult) {
      return res.status(404).json({ success: false, error: "Result not found" });
    }

    // 2. Fetch all results for this test to calculate "Beats X%" and Leaderboard
    const allResults = await prisma.studentResult.findMany({
      where: { testId },
      orderBy: { totalScore: 'desc' },
      select: {
        studentId: true,
        totalScore: true,
        timeTaken: true,
        codingSubmissions: {
          select: { runtime: true, memory: true }
        }
      }
    });

    // 3. Calculate Percentile (Beats X%)
    const totalParticipants = allResults.length;
    const rank = allResults.findIndex(r => r.studentId === studentId) + 1;
    const beatsPercent = totalParticipants > 1 
      ? (((totalParticipants - rank) / totalParticipants) * 100).toFixed(2) 
      : "100";

    // 4. Prepare data for the Bell Curve Chart (AnalysisBoard.jsx requirement)
    // We group scores into buckets to show the distribution
    const chartData = allResults.map(r => ({
      height: (r.totalScore / 100) * 100, // Normalized height for the bar chart
      isUser: r.studentId === studentId
    }));

    res.status(200).json({
      success: true,
      data: {
        testTitle: studentResult.test.title,
        metrics: {
          runtime: studentResult.codingSubmissions[0]?.runtime || "0",
          memory: studentResult.codingSubmissions[0]?.memory || "0",
          beatsRuntime: beatsPercent, // Simplified for now
          beatsMemory: (parseFloat(beatsPercent) * 0.9).toFixed(2)
        },
        chartData,
        leaderboard: allResults.slice(0, 5).map((r, i) => ({
          rank: i + 1,
          name: r.studentId === studentId ? "You" : `Student ${r.studentId.slice(-4)}`,
          score: r.totalScore,
          time: `${r.timeTaken} mins`
        }))
      }
    });
  } catch (error) {
    console.error("Analysis Error:", error);
    res.status(500).json({ success: false, error: "Failed to load analysis." });
  }
};