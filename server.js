const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json()); // Updated to use express.json()

mongoose
    .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.log(err));

const questionsGroupSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        questions: [
            {
                question: { type: String, required: true },
                answer: { type: String, required: true },
            },
        ],
    },
    {
        timestamps: true,
    }
);

const QuestionsGroup = mongoose.model("QuestionsGroup", questionsGroupSchema);

app.post("/api/questions", async (req, res) => {
    try {
        const { name, questions } = req.body;

        if (!name || questions.length !== 10) {
            return res.status(400).json({
                error: "Must provide a name and exactly 10 questions",
            });
        }

        const newQuestionsGroup = new QuestionsGroup({ name, questions });
        await newQuestionsGroup.save();

        res.status(201).json({ message: "Questions saved successfully" });
    } catch (error) {
        console.error("Error saving questions to the database:", error);
        res.status(400).json({
            error: `Error saving questions: ${error.message}`,
        });
    }
});
app.get("/api/questions", async (req, res) => {
    try {
        const questionsGroups = await QuestionsGroup.find().select(
            "name createdAt"
        );
        res.json(questionsGroups);
    } catch (error) {
        res.status(500).json({ error: "Error fetching responses" });
    }
});

app.get("/api/questions/:id", async (req, res) => {
    try {
        const questionsGroup = await QuestionsGroup.findById(req.params.id);
        if (!questionsGroup)
            return res.status(404).json({ error: "Response not found" });
        res.json(questionsGroup);
    } catch (error) {
        res.status(500).json({ error: "Error fetching the response" });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
