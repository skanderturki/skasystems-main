const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const Chapter = require('../models/Chapter');
const Topic = require('../models/Topic');
const Question = require('../models/Question');
const Exam = require('../models/Exam');

const MONGODB_URI = process.env.MONGODB_URI;

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      Chapter.deleteMany({}),
      Topic.deleteMany({}),
      Question.deleteMany({}),
      Exam.deleteMany({}),
    ]);
    console.log('Cleared existing data');

    // Seed chapters
    const chaptersData = JSON.parse(
      fs.readFileSync(path.join(__dirname, 'data/chapters.json'), 'utf8')
    );
    const chapters = await Chapter.insertMany(chaptersData);
    console.log(`Seeded ${chapters.length} chapters`);

    // Create chapter code to ID map
    const chapterMap = {};
    chapters.forEach((ch) => {
      chapterMap[ch.chapterCode] = ch._id;
    });

    // Seed topics for each chapter
    const topicFiles = [
      { file: 'ch01-1-topics.json', chapterCode: 'CH01-1' },
      { file: 'ch01-2-topics.json', chapterCode: 'CH01-2' },
      { file: 'ch01-3-topics.json', chapterCode: 'CH01-3' },
      { file: 'ch02-topics.json', chapterCode: 'CH02' },
      { file: 'ch03-topics.json', chapterCode: 'CH03' },
      { file: 'ch05-topics.json', chapterCode: 'CH05' },
      { file: 'ch06-1-topics.json', chapterCode: 'CH06-1' },
      { file: 'ch06-2-topics.json', chapterCode: 'CH06-2' },
      { file: 'ch07-topics.json', chapterCode: 'CH07' },
      { file: 'ch08-topics.json', chapterCode: 'CH08' },
      { file: 'ch09-topics.json', chapterCode: 'CH09' },
    ];

    let totalTopics = 0;
    for (const { file, chapterCode } of topicFiles) {
      const filePath = path.join(__dirname, 'data/topics', file);
      if (!fs.existsSync(filePath)) {
        console.log(`  Skipping ${file} (not found)`);
        continue;
      }

      const topicsData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const chapterId = chapterMap[chapterCode];

      const topicDocs = topicsData.map((t) => ({
        ...t,
        chapter: chapterId,
      }));

      const topics = await Topic.insertMany(topicDocs);

      // Update chapter with topic references
      await Chapter.findByIdAndUpdate(chapterId, {
        topics: topics.map((t) => t._id),
      });

      totalTopics += topics.length;
      console.log(`  Seeded ${topics.length} topics for ${chapterCode}`);
    }
    console.log(`Seeded ${totalTopics} total topics`);

    // Seed questions for each chapter
    const questionFiles = fs.readdirSync(path.join(__dirname, 'data/questions'))
      .filter((f) => f.endsWith('.json'));

    let totalQuestions = 0;
    for (const file of questionFiles) {
      const questionsData = JSON.parse(
        fs.readFileSync(path.join(__dirname, 'data/questions', file), 'utf8')
      );

      // Map chapter codes to IDs in questions
      const questionDocs = questionsData.map((q) => ({
        ...q,
        chapter: chapterMap[q.chapterCode],
      }));

      // Remove chapterCode field
      questionDocs.forEach((q) => delete q.chapterCode);

      await Question.insertMany(questionDocs);
      totalQuestions += questionDocs.length;
      console.log(`  Seeded ${questionDocs.length} questions from ${file}`);
    }
    console.log(`Seeded ${totalQuestions} total questions`);

    // Seed exams
    const allChapterIds = chapters.map((ch) => ch._id);

    const exams = [
      // Practice exams per chapter
      ...chapters.map((ch) => ({
        title: `Practice: ${ch.title}`,
        description: `Practice test covering ${ch.title}. Get feedback on every question.`,
        examType: 'practice',
        chapters: [ch._id],
        questionCount: 10,
        timeLimit: null,
        passingScore: 70,
        shuffleQuestions: true,
        shuffleOptions: true,
        maxAttempts: null,
        isPublished: true,
      })),
      // Comprehensive practice
      {
        title: 'Comprehensive Practice Test',
        description: 'Practice test covering all chapters. Great preparation for the final exam.',
        examType: 'practice',
        chapters: allChapterIds,
        questionCount: 30,
        timeLimit: 45,
        passingScore: 70,
        shuffleQuestions: true,
        shuffleOptions: true,
        maxAttempts: null,
        isPublished: true,
      },
      // Formal certification exam
      {
        title: 'Software Project Management Certification Exam',
        description: 'Comprehensive certification exam covering all chapters. You must score at least 80% to pass and receive your certificate.',
        examType: 'formal',
        chapters: allChapterIds,
        questionCount: 50,
        timeLimit: 90,
        passingScore: 80,
        shuffleQuestions: true,
        shuffleOptions: true,
        maxAttempts: 3,
        isPublished: true,
      },
    ];

    await Exam.insertMany(exams);
    console.log(`Seeded ${exams.length} exams`);

    console.log('\nSeeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
