import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import stopword from 'stopword';

const port = process.env.PORT || 3000;
const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const Chatbot = mongoose.model('chatbot', new mongoose.Schema({
    question: String,
    answer: String,
}));

const chat = mongoose.model('chat', new mongoose.Schema({
    messages: [{
        sender: String,
        text: String,
        timestamp: { type: Date, default: Date.now }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
}));

const Feedback = mongoose.model('feedback', new mongoose.Schema({
    feedback: String
}))
// Add knowledgebase data (single or multiple entries)
app.post('/knowledgebase', async (req, res) => {
    const data = req.body;

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
            res.status(500).json({ message: 'Error while adding', error: error.message });
        }
    } else {
        try {
            const entries = await Chatbot.insertMany(data);
            res.status(201).json({ message: "Multiple entries added", entries });
        } catch (error) {
            res.status(500).json({ message: "Error while adding entries", error: error.message });
        }
    }
});

// Get answer for a question
app.post('/getanswer', async (req, res) => {
    const { question } = req.body;

    if (!question) {
        return res.status(400).json({ message: 'Question is required' });
    }

    const input = stopword.removeStopwords(
        question.toLowerCase().replace(/[^\w\s]/g, '').split(" ")
    );

    try {
        const allQuestions = await Chatbot.find();
        let highestscore = 0;
        let bestmatch = null;
        let ambiguous = false;

        allQuestions.forEach(entry => {
            const words = stopword.removeStopwords(
                entry.question.toLowerCase().replace(/[^\w\s]/g, '').split(" ")
            );

            const matches = input.filter(word => words.includes(word));
            const matchCount = matches.length;

            if (matchCount > highestscore) {
                highestscore = matchCount;
                bestmatch = entry;
                ambiguous = false;
            } else if (matchCount === highestscore && matchCount > 0) {
                ambiguous = true;
            }
        });

        // Move response logic OUTSIDE the loop
        if (highestscore === 0) {
            return res.status(404).json({ message: "No matching found" });
        }
        if (ambiguous) {
            return res.status(409).json({ message: "Ambiguous question. Please specify further." });
        }

        return res.status(200).json({ answer: bestmatch.answer });

    } catch (error) {
        return res.status(500).json({ message: "Error while searching", error: error.message });
    }
});

app.post('/savechat', async (req, res) => {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ message: "invalid chat data" })
    }
    try {
        const newchat = new chat({ messages });
        await newchat.save();
        res.status(201).json({ message: "Chat saved", chatId: newchat._id });
    } catch (error) {
        res.status(500).json({ message: "Error saving chat", error: error.message });
    }

});
app.post('/feedback', async (req, res) => {
    const { feedback } = req.body;
    try {
        const feed = new Feedback({ feedback });
        await feed.save();
        res.status(201).json({ message: "Feedback saved", feedback: feed });

    } catch (error) {
        res.status(500).json({ message: "Error", error: error.message });
    }
})

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
