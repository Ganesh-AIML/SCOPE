const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.scheduleTest = async (req, res) => {
  try {
    const { 
      title, date, duration, attemptLimit, 
      startPassword, endPassword, showScore, status, 
      codingProblems, aptitudeSections, techSections 
    } = req.body;

    // 2. Prepare the Sections Data dynamically
    const sectionsToCreate = [];
    
    // Process Aptitude Sections
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

    // Process Technical Sections
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

    // 3. Atomic transaction
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
        
        sections: {
          create: sectionsToCreate
        },
        
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

// ... Make sure your exports.getAllTests is still at the bottom!
exports.getAllTests = async (req, res) => {
  try {
    const tests = await prisma.tnpTest.findMany({
      orderBy: { date: 'desc' },
      select: {
        id: true, title: true, date: true, duration: true, status: true,
        _count: { select: { codingProblems: true } }
      }
    });
    res.status(200).json({ success: true, data: tests });
  } catch (error) {
    console.error("Error fetching tests:", error);
    res.status(500).json({ success: false, error: 'Failed to fetch tests.' });
  }
};

// Delete a Test
exports.deleteTest = async (req, res) => {
  try {
    const { id } = req.params; // Get the ID from the URL

    // This single command deletes the test AND all related questions/problems 
    // because of the onDelete: Cascade rule in our Prisma schema!
    await prisma.tnpTest.delete({
      where: { id: id }
    });

    res.status(200).json({ success: true, message: 'Test completely deleted.' });
  } catch (error) {
    console.error("Error deleting test:", error);
    res.status(500).json({ success: false, error: 'Failed to delete the test.' });
  }
};


// Get a single test by ID (with all nested questions and problems)
exports.getTestById = async (req, res) => {
  try {
    const { id } = req.params;

    const test = await prisma.tnpTest.findUnique({
      where: { id: id },
      include: {
        // Fetch MCQs
        sections: {
          include: {
            questions: true
          }
        },
        // Fetch Coding Problems and their Test Cases
        codingProblems: {
          include: {
            testCases: true
          }
        }
      }
    });

    if (!test) {
      return res.status(404).json({ success: false, error: 'Test not found.' });
    }

    res.status(200).json({ success: true, data: test });
  } catch (error) {
    console.error("Error fetching test details:", error);
    res.status(500).json({ success: false, error: 'Failed to fetch test details.' });
  }
};


// Fetch detailed performance of a specific student for a specific test
exports.getStudentPerformance = async (req, res) => {
  try {
    const { testId, studentId } = req.params;

    const performance = await prisma.studentResult.findFirst({
      where: { testId, studentId },
      include: {
        mcqSubmissions: true,
        codingSubmissions: true,
        // We include the test questions to show the "Question Text" in the UI
        test: {
          include: {
            sections: { include: { questions: true } },
            codingProblems: true
          }
        }
      }
    });

    if (!performance) {
      return res.status(404).json({ success: false, error: "No performance record found." });
    }

    // Transform data to match the StudentAnalyticsProfile.jsx mock structure
    const formattedMcqs = performance.mcqSubmissions.map(sub => {
      const originalQ = performance.test.sections
        .flatMap(s => s.questions)
        .find(q => q.id === sub.questionId);

      return {
        id: sub.questionId.slice(-4),
        section: performance.test.sections.find(s => s.questions.some(q => q.id === sub.questionId))?.name || "General",
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