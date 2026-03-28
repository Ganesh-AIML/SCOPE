const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.scheduleTest = async (req, res) => {
  try {
    const { 
      title, date, duration, attemptLimit, 
      startPassword, endPassword, showScore, status, 
      codingProblems, aptitudeSections, techSections 
    } = req.body;

    const sectionsToCreate = [];
    
    let allAptitudeQs = [];
    if (aptitudeSections && aptitudeSections.length > 0) {
      aptitudeSections.forEach(sec => {
        const pool = [...(sec.fileQs || []), ...(sec.manualQs || [])];
        allAptitudeQs.push(...pool);
      });

      if (allAptitudeQs.length > 0) {
        sectionsToCreate.push({
          name: 'Aptitude',
          questions: {
            create: allAptitudeQs.map(q => ({
              text: q.text, optA: q.optA, optB: q.optB, optC: q.optC, optD: q.optD, ans: q.ans
            }))
          }
        });
      }
    }

    let allTechQs = [];
    if (techSections && techSections.length > 0) {
      techSections.forEach(sec => {
        const pool = [...(sec.fileQs || []), ...(sec.manualQs || [])];
        allTechQs.push(...pool);
      });

      if (allTechQs.length > 0) {
        sectionsToCreate.push({
          name: 'Technical',
          questions: {
            create: allTechQs.map(q => ({
              text: q.text, optA: q.optA, optB: q.optB, optC: q.optC, optD: q.optD, ans: q.ans
            }))
          }
        });
      }
    }

    const newTest = await prisma.tnpTest.create({
      data: {
        title,
        date: new Date(date),
        duration: parseInt(duration),
        attemptLimit: parseInt(attemptLimit || 1),
        startPassword,
        endPassword,
        showScore,
        status: status || 'Upcoming',
        sections: { create: sectionsToCreate },
        codingProblems: {
          create: codingProblems?.map((problem) => ({
            title: problem.title,
            description: problem.description,
            marks: parseInt(problem.marks || 10),
            timeLimit: parseFloat(problem.timeLimit),
            memoryLimit: parseInt(problem.memoryLimit),
            testCases: {
              create: problem.testCases?.map((tc) => ({
                input: Buffer.from(tc.input).toString('base64'),
                expectedOutput: Buffer.from(tc.expectedOutput).toString('base64'),
                isHidden: tc.isHidden || false
              }))
            }
          }))
        }
      },
      include: {
        sections: { include: { questions: true } },
        codingProblems: { include: { testCases: true } }
      }
    });

    res.status(201).json({ success: true, data: newTest });
  } catch (error) {
    console.error("Error scheduling test:", error);
    res.status(500).json({ success: false, error: 'Failed to schedule the test.' });
  }
};

exports.getAllTests = async (req, res) => {
  try {
    const tests = await prisma.tnpTest.findMany({
      where: { deletedAt: null },
      orderBy: { date: 'desc' },
      select: {
        id: true, title: true, date: true, duration: true, status: true,
        _count: { select: { codingProblems: true } }
      }
    });

    // 🛡️ THE ROOT FIX: Pull aggregated scores manually to avoid Prisma relation crashes
    const testIds = tests.map(t => t.id);
    const allResults = await prisma.studentResult.findMany({
        where: { testId: { in: testIds } },
        select: { testId: true, totalScore: true }
    });

    const formattedTests = tests.map(t => {
        const results = allResults.filter(r => r.testId === t.id);
        const participants = results.length;
        const avgScore = participants > 0
            ? (results.reduce((sum, r) => sum + r.totalScore, 0) / participants).toFixed(1)
            : 0;
        return { ...t, participants, avgScore };
    });

    res.status(200).json({ success: true, data: formattedTests });
  } catch (error) {
    console.error("Error fetching tests:", error);
    res.status(500).json({ success: false, error: 'Failed to fetch tests.' });
  }
};

exports.deleteTest = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.tnpTest.update({
      where: { id: id },
      data: { deletedAt: new Date() }
    });
    res.status(200).json({ success: true, message: 'Test archived successfully.' });
  } catch (error) {
    console.error("Error deleting test:", error);
    res.status(500).json({ success: false, error: 'Failed to delete the test.' });
  }
};

exports.getTestById = async (req, res) => {
  try {
    const { id } = req.params;
    const test = await prisma.tnpTest.findFirst({
      where: { id: id, deletedAt: null },
      include: {
        sections: { include: { questions: true } },
        codingProblems: { include: { testCases: true } }
      }
    });

    if (!test) return res.status(404).json({ success: false, error: 'Test not found.' });
    res.status(200).json({ success: true, data: test });
  } catch (error) {
    console.error("Error fetching test details:", error);
    res.status(500).json({ success: false, error: 'Failed to fetch test details.' });
  }
};

exports.getStudentPerformance = async (req, res) => {
  try {
    const { testId, studentId } = req.params;
    const performance = await prisma.studentResult.findFirst({
      where: { testId, studentId },
      include: {
        mcqSubmissions: true,
        codingSubmissions: true,
        test: {
          include: {
            sections: { include: { questions: true } },
            codingProblems: true
          }
        }
      }
    });

    if (!performance) return res.status(404).json({ success: false, error: "No performance record found." });

    const questionMap = new Map();
    if (performance.test?.sections) {
      performance.test.sections.forEach(sec => {
        sec.questions.forEach(q => { questionMap.set(q.id, { ...q, sectionName: sec.name }); });
      });
    }

    const formattedMcqs = performance.mcqSubmissions.map(sub => {
      const originalQ = questionMap.get(sub.questionId); 
      return {
        id: sub.questionId.slice(-4),
        section: originalQ?.sectionName || "General",
        question: originalQ?.text || "Question Deleted",
        selected: sub.selectedOption,
        correct: originalQ?.ans || "N/A",
        isRight: sub.isCorrect
      };
    });

    res.status(200).json({
      success: true,
      data: {
        mcqs: formattedMcqs,
        coding: performance.codingSubmissions.map(cs => ({
          problem: performance.test.codingProblems.find(p => p.id === cs.problemId)?.title || "Unknown",
          language: cs.language,
          status: cs.status,
          testCasesPassed: cs.testCasesPassed,
          totalTestCases: cs.totalTestCases,
          execTime: cs.runtime,
          memoryUsed: cs.memory,
          code: cs.submittedCode
        }))
      }
    });
  } catch (error) {
    console.error("Error fetching student performance:", error);
    res.status(500).json({ success: false, error: "Internal server error." });
  }
};

// 🛡️ THE ROOT FIX: New Aggregation Endpoint for Dashboard Analytics
exports.getTestAnalytics = async (req, res) => {
  try {
    const { id } = req.params;

    const test = await prisma.tnpTest.findUnique({
        where: { id },
        include: {
            sections: { include: { questions: true } },
            codingProblems: { include: { testCases: true } }
        }
    });

    if (!test) return res.status(404).json({ success: false, error: 'Test not found' });

    const results = await prisma.studentResult.findMany({
        where: { testId: id },
        include: {
            user: { select: { name: true, email: true, studentProfile: true } },
            mcqSubmissions: true,
            codingSubmissions: true
        }
    });

    res.status(200).json({ success: true, data: { test, results } });
  } catch (error) {
    console.error("Analytics Error:", error);
    res.status(500).json({ success: false, error: 'Failed to generate analytics.' });
  }
};