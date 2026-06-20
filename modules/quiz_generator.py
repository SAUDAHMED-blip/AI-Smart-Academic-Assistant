import json

class QuizGenerator:
    def __init__(self, gemini_client):
        self.client = gemini_client
        self.system_instruction = (
            "You are a professional educational assessment developer. Your goal is to generate high-quality multiple-choice quizzes (MCQs) that effectively test comprehension and recall.\n"
            "Each question must have exactly 4 plausible options, only one correct option (0-indexed), and a clear, constructive educational explanation of why the correct option is right and the others are incorrect.\n"
            "Ensure the questions test actual conceptual understanding rather than simple keyword matching.\n"
            "You MUST return the output in a strict JSON format matching the schema requested."
        )

    def generate_quiz(self, topic_or_text, num_questions=5, difficulty="medium", model_name="gemini-2.5-flash"):
        """
        Generates a multiple choice quiz based on a topic or raw text.
        Returns a parsed JSON object matching the quiz schema.
        """
        prompt = (
            f"Generate a multiple-choice quiz based on the following input (which may be a topic or source text):\n"
            f"Input: \"\"\"\n{topic_or_text}\n\"\"\"\n\n"
            f"Number of Questions: {num_questions}\n"
            f"Difficulty Level: {difficulty.upper()}\n\n"
            f"You must return a JSON object with this exact schema:\n"
            f"{{\n"
            f"  \"title\": \"A descriptive title for the quiz based on the topic/text\",\n"
            f"  \"questions\": [\n"
            f"    {{\n"
            f"      \"id\": 1,\n"
            f"      \"question\": \"The question text\",\n"
            f"      \"options\": [\n"
            f"        \"Option A\",\n"
            f"        \"Option B\",\n"
            f"        \"Option C\",\n"
            f"        \"Option D\"\n"
            f"      ],\n"
            f"      \"correct_answer\": 0, // The 0-based index (0, 1, 2, or 3) of the correct option in the options array\n"
            f"      \"explanation\": \"Detailed explanation explaining why the correct answer is right, and clarifying key misconceptions for other choices.\"\n"
            f"    }}\n"
            f"  ]\n"
            f"}}\n"
        )
        
        raw_response = self.client.generate(
            prompt=prompt,
            system_instruction=self.system_instruction,
            json_mode=True,
            model_name=model_name
        )
        
        try:
            quiz_data = json.loads(raw_response)
            return quiz_data
        except Exception:
            raise ValueError("Failed to generate a valid JSON quiz. Please try again.")
