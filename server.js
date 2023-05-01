// Require necessary modules
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');

// Create express app
const app = express();

// Set view engine and views directory
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Set up middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));

// Set up MongoDB connection
mongoose.connect('mongodb+srv://nrjoshi02:kaQYPwbSu0FdEhIm@cluster.1qtmfwp.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB connected');
}).catch((err) => {
  console.log('MongoDB connection error', err);
});

// Set up quiz questions schema
const questionSchema = new mongoose.Schema({
  id: Number,
  question: String,
  choices: [String],
  answer: String
});

const Question = mongoose.model('Question', questionSchema);

// Set up user response schema
const responseSchema = new mongoose.Schema({
  Name:String,
  // questionId: Number,
  // answer: String
  Score:Number
});

const Response = mongoose.model('Response', responseSchema);

// Set up routes
app.get('/take-quiz', async (req, res) => {
  const questions = await Question.find();
  res.render('index', { questions });
});

app.post('/check-answers', async (req, res) => {
  const answers = req.body;
  const Name = req.body.Name;
  let score = 0;

  // Calculate score
  const questions = await Question.find();
  questions.forEach(async (question) => {
    if (answers[question.id] === question.answer) {
      score++;
    }
    // // Save user response
    // const responses = new Response({
    //   Name:Name,
    //   questionId: question.id,
    //   answer: answers[question.id]
    // });
    // await responses.save();
  });

  // Save user response
  const responses = new Response({
    Name:Name,
    Score:score
  });
  responses.save();

  res.render('result', { score, totalQuestions: questions.length });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

