// Require necessary modules
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const { LocalStorage } = require('node-localstorage');


const localStorage = new LocalStorage('./localStorage');


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
  Email:String,
  // questionId: Number,
  // answer: String
  Score:Number
});

const Response = mongoose.model('Response', responseSchema);

// Set up routes

app.get('/login',async(req,res)=>{
  res.render('login');
})

app.post('/take-quiz', async (req, res) => {
  const Name = req.body.Name;
  const Email = req.body.Email;
  localStorage.setItem('user',JSON.stringify({Name,Email}));
  const questions = await Question.find();

  const message = 'Welcome ' + Name + '..!';
  res.render('index', { questions,message });
});


app.post('/login',async(req,res)=>{
  const Name = req.body.Name;
  const Email = req.body.Email;
  res.redirect('index');
})

app.post('/check-answers', async (req, res) => {
  const myValue = JSON.parse(localStorage.getItem('user'));

  const answers = req.body;
  const getUser = await Response.findOne({Email:myValue.Email});
  if(!getUser){
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
    Name:myValue.Name,
    Email:myValue.Email,
    Score:score
  });
  responses.save();

  res.render('result', { score, totalQuestions: questions.length });
  
  }
  else{
    res.render('error');
    
  }
  
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);8
});
