const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs'); // 🛡️ NEW: Required for secure password hashing

// Fetch tests available for the student (Both Live and Upcoming)
exports.getAvailableTests = async (req, res) => {
  try {
    const studentId = req.user?.id;
    if (!studentId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    // 1. Fetch Profile Data for the Dashboard UI
    const userProfile = await prisma.user.findUnique({
      where: { id: studentId },
      include: { studentProfile: true }
    });

    // 2. Fetch Past Results (The Root Fix for Issue #3)
    const pastResults = await prisma.studentResult.findMany({
      where: { studentId },
      include: { test: true },
      orderBy: { submittedAt: 'desc' }
    });
    const pastTestIds = pastResults.map(r => r.testId);

    // 3. Fetch Available Tests (Excluding tests already taken)
    const tests = await prisma.tnpTest.findMany({
      where: {
        deletedAt: null,
        status: { in: ['Upcoming', 'Live'] },
        id: { notIn: pastTestIds } // 🛡️ The Root Fix for Issue #2
      },
      select: {
        id: true,
        title: true,
        date: true,
        duration: true,
        status: true,
      },
      orderBy: {
        date: 'asc' 
      }
    });

    res.status(200).json({ 
      success: true, 
      data: {
        profile: userProfile,
        availableTests: tests,
        pastResults: pastResults.map(r => ({
          id: r.test.id,
          title: r.test.title,
          date: new Date(r.submittedAt).toLocaleDateString(),
          score: r.totalScore,
          status: (r.totalScore >= 60) ? 'Passed' : 'Needs Review'
        }))
      }
    });
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
      sections: exam.sections.map(sec => ({
        name: sec.name,
        questions: sec.questions.map(q => ({
          id: q.id,
          text: q.text,
          optA: q.optA,
          optB: q.optB,
          optC: q.optC,
          optD: q.optD,
        }))
      })),
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
    
    // ✅ FIX 1: Strict Auth Requirement
    const studentId = req.user?.id; 
    if (!studentId) {
      return res.status(401).json({ success: false, error: 'Unauthorized: User identity required.' });
    }

    // ✅ FIX 2: Idempotency Guard
    const existingSubmission = await prisma.studentResult.findFirst({
      where: { testId, studentId }
    });
    
    if (existingSubmission) {
      return res.status(409).json({ 
        success: false, 
        error: 'Exam already submitted.', 
        resultId: existingSubmission.id 
      });
    }

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

    test.sections.forEach(section => {
      section.questions.forEach((q) => {
        const selectedLetter = answers[q.id];
        const isCorrect = selectedLetter === q.ans;

        if (isCorrect) {
          const sectionKey = section.name.toLowerCase().startsWith('apt') ? 'apt' : 'tech';
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

    const result = await prisma.studentResult.create({
      data: {
        studentId,
        testId,
        timeTaken: timeTaken || 0,
        aptScore,
        techScore,
        totalScore: aptScore + techScore, 
        mcqSubmissions: { create: mcqSubmissions },
        codingSubmissions: {
          create: test.codingProblems.map(cp => ({
            problemId: cp.id,
            language: language || 'java',
            submittedCode: sourceCode || '',
            status: 'Accepted', 
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
    
    const studentId = req.user?.id; 
    if (!studentId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

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

    // ✅ ROOT FIX: Flag to tell the UI if it should render coding metrics
    const hasCoding = studentResult.codingSubmissions && studentResult.codingSubmissions.length > 0;

    const allScores = await prisma.studentResult.findMany({
      where: { testId },
      orderBy: { totalScore: 'desc' },
      select: { studentId: true, totalScore: true }
    });

    const topLeaderboard = await prisma.studentResult.findMany({
      where: { testId },
      orderBy: { totalScore: 'desc' },
      take: 5,
      select: { studentId: true, totalScore: true, timeTaken: true }
    });

    const totalParticipants = allScores.length;
    const rank = allScores.findIndex(r => r.studentId === studentId) + 1;
    const beatsPercent = totalParticipants > 1 
      ? (((totalParticipants - rank) / totalParticipants) * 100).toFixed(2) 
      : "100";

    const absoluteMaxScore = allScores.length > 0 ? allScores[0].totalScore : 100;
    const safeMaxScore = absoluteMaxScore > 0 ? absoluteMaxScore : 100;

    const chartData = allScores.map(r => ({
      height: (r.totalScore / safeMaxScore) * 100, 
      isUser: r.studentId === studentId
    }));

    res.status(200).json({
      success: true,
      data: {
        testTitle: studentResult.test.title,
        hasCoding, // Trigger passed to UI
        metrics: {
          runtime: studentResult.codingSubmissions[0]?.runtime || "0",
          memory: studentResult.codingSubmissions[0]?.memory || "0",
          beatsRuntime: beatsPercent,
          beatsMemory: (parseFloat(beatsPercent) * 0.9).toFixed(2)
        },
        chartData,
        leaderboard: topLeaderboard.map((r, i) => ({
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

// ... [Keep all your existing getAvailableTests, getExamDetails, submitExam, getAnalysis functions here exactly as they are] ...

// 🛡️ NEW FEATURE: Secure Password Update
exports.updatePassword = async (req, res) => {
  try {
    const studentId = req.user?.id;
    const { currentPassword, newPassword } = req.body;

    if (!studentId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, error: 'Missing password fields' });
    }

    // 1. Fetch user to get their current hashed password
    const user = await prisma.user.findUnique({ where: { id: studentId } });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // 2. Verify the provided current password
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Incorrect current password' });
    }

    // 3. Hash the new password securely
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    // 4. Update the database
    await prisma.user.update({
      where: { id: studentId },
      data: { passwordHash: newPasswordHash }
    });

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error("Update Password Error:", error);
    res.status(500).json({ success: false, error: 'Failed to update password' });
  }
};