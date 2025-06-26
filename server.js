import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import stopword from 'stopword';
const port = process.env.PORT || 3000;
const app = express()
app.use(cors());
app.use(express.json());
import path from 'path';
import { fileURLToPath } from 'url';

// This is required when using ES modules instead of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from public folder
app.use(express.static(path.join(__dirname, 'public')));

// Optional: fallback route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

mongoose.connect(process.env.MONGODB_URI
    , {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });

const Chatbot = mongoose.model('Chatbot', new mongoose.Schema({
    question: String,
    answer: String
}));

app.post('/knowledgebase', async (req, res) => {
    const data = req.body

    if (!Array.isArray(data)) {
        const { question, answer } = data;
        if (!question || !answer) {
            return res.status(400).json({ message: 'Please check the input' });
        }

        try {
            const newquestion = new Chatbot({ question, answer });
            await newquestion.save();
            res.status(201).json({ message: 'Thanks for your feedback', Chatbot: newquestion });
        } catch (error) {
            res.status(500).json({ message: 'error while adding', error: error.message })
        }
    }
    else {
        try {
            const entries = await Chatbot.insertMany(data);

            res.status(201).json({ message: "Multiple entries are added", entries });
        } catch (error) {
            return res.status(500).json({ message: "error while fetching data", error: error.message })
        }
    }


})

app.get('/getanswer', async (req, res) => {
    const { question } = req.query;

    if (!question) {
        return res.status(400).json({ message: 'Question is required' });
    }

    const input = stopword.removeStopwords(question.toLowerCase().replace(/[^\w\s]/g, '').split(" "));
    const rawinput = stopword.removeStopwords(question.toLowerCase().replace(/[^\w\s]/g, '').split(" "));

    try {

        const allQuestion = await Chatbot.find();

        const matchingentry = [];


        allQuestion.forEach(entry => {
            const words = stopword.removeStopwords(entry.question.toLowerCase().replace(/[^\w\s]/g, '').split(" "));
            const count = input.filter(word => words.includes(word));

            if (count.length > 0) {
                matchingentry.push(entry);
            }

        });


        if (matchingentry.length > 1) {
            return res.status(409).json({ message: "Ambiguous question. Please specify further." });
        } else if (matchingentry.length === 1) {
            return res.status(200).json({ answer: matchingentry[0].answer });
        }
        else {
            return res.status(404).json({ message: "No matching answer found." });
        }
    } catch (error) {
        return res.status(500).json({ message: "Error while searching", error: error.message });
    }
});



app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
