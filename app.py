from flask import Flask, render_template, request, jsonify, session
import os
import json
from modules.gemini_client import GeminiClient
from modules.qa_assistant import QAssistant
from modules.summarizer import Summarizer
from modules.quiz_generator import QuizGenerator
from modules.flashcard_maker import FlashcardMaker
from modules.study_planner import StudyPlanner
from modules.math_solver import MathSolver
from modules.file_parser import extract_text, is_supported, get_supported_extensions

app = Flask(__name__, 
            static_folder='static',
            template_folder='templates')
app.secret_key = 'smart_academic_assistant_secret_key'

# Initialize Gemini Client and modules
client = GeminiClient()
qa_assistant = QAssistant(client)
summarizer = Summarizer(client)
quiz_generator = QuizGenerator(client)
flashcard_maker = FlashcardMaker(client)
study_planner = StudyPlanner(client)
math_solver = MathSolver(client)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/settings/status', methods=['GET'])
def settings_status():
    has_key = client.api_key is not None and client.api_key != "YOUR_GEMINI_API_KEY_HERE"
    return jsonify({
        "success": True,
        "configured": has_key
    })

@app.route('/api/settings/verify', methods=['POST'])
def verify_settings():
    data = request.json or {}
    api_key = data.get("api_key")
    if not api_key:
        return jsonify({"success": False, "error": "No API Key provided"}), 400
        
    success, message = client.validate_api_key(api_key)
    if success:
        return jsonify({"success": True, "message": "API key verified and saved successfully!"})
    else:
        return jsonify({"success": False, "error": message}), 400

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json or {}
    message = data.get("message")
    history = data.get("history", [])
    model_name = data.get("model", "gemini-2.5-flash")
    image_data = data.get("image_data")
    image_mime = data.get("image_mime")
    
    if not message:
        return jsonify({"success": False, "error": "Message is required"}), 400
        
    try:
        response = qa_assistant.ask(
            question=message, 
            history=history, 
            model_name=model_name,
            image_data=image_data,
            image_mime=image_mime
        )
        return jsonify({"success": True, "reply": response})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/summarize', methods=['POST'])
def summarize_text():
    data = request.json or {}
    text = data.get("text")
    format_type = data.get("format", "key_takeaways")
    style = data.get("style", "academic")
    model_name = data.get("model", "gemini-2.5-flash")
    
    if not text:
        return jsonify({"success": False, "error": "Text to summarize is required"}), 400
        
    try:
        summary = summarizer.summarize(text, format_type=format_type, style=style, model_name=model_name)
        return jsonify({"success": True, "summary": summary})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/parse-file', methods=['POST'])
def parse_file():
    """
    Universal file parser endpoint.
    Accepts multipart/form-data with a 'file' field.
    Returns extracted plain text usable by all academic modules.
    """
    if 'file' not in request.files:
        return jsonify({"success": False, "error": "No file uploaded."}), 400

    file = request.files['file']
    if not file or file.filename == '':
        return jsonify({"success": False, "error": "Empty file upload."}), 400

    if not is_supported(file.filename):
        supported = ", ".join(get_supported_extensions())
        return jsonify({
            "success": False,
            "error": f"Unsupported file type. Supported: {supported}"
        }), 400

    try:
        text = extract_text(file.stream, file.filename)
        if not text or not text.strip():
            return jsonify({"success": False, "error": "No text could be extracted from this file."}), 400
        return jsonify({
            "success": True,
            "text": text,
            "filename": file.filename,
            "char_count": len(text)
        })
    except ValueError as ve:
        return jsonify({"success": False, "error": str(ve)}), 400
    except Exception as e:
        return jsonify({"success": False, "error": f"Extraction failed: {str(e)}"}), 500


@app.route('/api/quiz', methods=['POST'])
def make_quiz():
    data = request.json or {}
    topic_or_text = data.get("topic")
    num_questions = data.get("num_questions", 5)
    difficulty = data.get("difficulty", "medium")
    model_name = data.get("model", "gemini-2.5-flash")
    
    if not topic_or_text:
        return jsonify({"success": False, "error": "Topic or source text is required"}), 400
        
    try:
        quiz = quiz_generator.generate_quiz(topic_or_text, num_questions=num_questions, difficulty=difficulty, model_name=model_name)
        return jsonify({"success": True, "quiz": quiz})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/flashcard', methods=['POST'])
def make_flashcard():
    data = request.json or {}
    topic_or_text = data.get("topic")
    num_cards = data.get("num_cards", 10)
    model_name = data.get("model", "gemini-2.5-flash")
    
    if not topic_or_text:
        return jsonify({"success": False, "error": "Topic or source text is required"}), 400
        
    try:
        deck = flashcard_maker.make_flashcards(topic_or_text, num_cards=num_cards, model_name=model_name)
        return jsonify({"success": True, "deck": deck})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/study-plan', methods=['POST'])
def make_study_plan():
    data = request.json or {}
    topic = data.get("topic")
    timeframe = data.get("timeframe", "1 week")
    hours_per_day = data.get("hours_per_day", 2)
    level = data.get("level", "beginner")
    model_name = data.get("model", "gemini-2.5-flash")
    
    if not topic:
        return jsonify({"success": False, "error": "Subject/Topic is required"}), 400
        
    try:
        plan = study_planner.generate_plan(topic, timeframe=timeframe, hours_per_day=hours_per_day, level=level, model_name=model_name)
        return jsonify({"success": True, "plan": plan})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/analytics/advisor', methods=['POST'])
def get_advisor_report():
    """
    AI Academic Advisor Report Generator.
    Accepts student study stats and compiles motivational, data-driven academic advice.
    """
    data = request.json or {}
    quizzes = data.get("quizzes", [])
    flashcards = data.get("flashcards", [])
    model_name = data.get("model", "gemini-2.5-flash")

    if not quizzes and not flashcards:
        return jsonify({
            "success": True, 
            "report": "### 🌱 Let's Get Started!\nWelcome to your **HSA AI Academy Advisor Report**! Since you haven't taken any quizzes or completed flashcard sessions yet, our tracking system has no data to analyze. \n\n**To start generating customized insights:**\n1. Go to the **Quiz Generator** tab and test your knowledge on a subject.\n2. Create dynamic cards in the **Flashcards Maker** and practice active recall.\n3. Return here to generate a comprehensive, personalized study strategy!"
        })

    # Prepare stats for prompt
    quiz_summary = ""
    if quizzes:
        quiz_summary = "\n- **Quizzes Completed:**\n" + "\n".join([
            f"  * Topic: '{q.get('topic')}' | Score: {q.get('score')}% | Questions: {q.get('total')}" for q in quizzes
        ])
    
    fc_summary = ""
    if flashcards:
        fc_summary = "\n- **Flashcard Decks Reviewed:**\n" + "\n".join([
            f"  * Deck Name: '{fc.get('deckName')}' | Recall Rate: {fc.get('mastery')}% | Cards: {fc.get('total')}" for fc in flashcards
        ])

    system_instruction = (
        "You are an elite, highly encouraging university academic dean and advisor. Your goal is to review a student's study metrics, "
        "provide clear conceptual weaknesses, actionable advice to plug their knowledge gaps, and an elite motivational message. "
        "Always use rich markdown (bold headings, bullet points, numbered lists) for outstanding readability. Do not make up facts."
    )

    prompt = (
        f"Please analyze the following academic performance statistics of a student using the HSA AI Academy:\n\n"
        f"### STUDY DATA RECORDED:{quiz_summary}{fc_summary}\n\n"
        f"Please provide a comprehensive study report containing:\n"
        f"1. **Core Strength Analysis**: Congratulate them on topics where they did well.\n"
        f"2. **Priority Knowledge Gaps**: Pinpoint topics or subjects with low scores (< 70%) and state exactly what concepts they should re-review.\n"
        f"3. **Custom Spaced Repetition Advice**: Suggest a revision schedule based on their flashcard mastery rates.\n"
        f"4. **Motivational Closing Word**: An elite, inspiring closing comment to push them towards academic greatness."
    )

    try:
        report = client.generate(
            prompt=prompt,
            system_instruction=system_instruction,
            model_name=model_name
        )
        return jsonify({"success": True, "report": report})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/math/solve', methods=['POST'])
def solve_math():
    data = request.json or {}
    question = data.get("question")
    image_data = data.get("image_data")
    image_mime = data.get("image_mime")
    model_name = data.get("model", "gemini-2.5-flash")
    
    if not question and not image_data:
        return jsonify({"success": False, "error": "Either a text question or an image of the question is required."}), 400
        
    try:
        solution = math_solver.solve(
            question=question,
            image_data=image_data,
            image_mime=image_mime,
            model_name=model_name
        )
        return jsonify({"success": True, "solution": solution})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


if __name__ == '__main__':
    # Run server on port 8080 as requested
    app.run(host='0.0.0.0', port=8080, debug=True)
