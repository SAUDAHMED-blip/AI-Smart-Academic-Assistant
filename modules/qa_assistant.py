class QAssistant:
    def __init__(self, gemini_client):
        self.client = gemini_client
        self.system_instruction = (
            "You are a brilliant academic assistant and expert tutor. Your goal is to help students learn and understand complex concepts.\n"
            "Explain things step-by-step, use clear formatting, markdown tables, bullet points, and syntax-highlighted code snippets when relevant.\n"
            "Always be polite, encouraging, and academically rigorous. Encourage critical thinking.\n"
            "If the student asks a question unrelated to academic topics, learning, or productivity, gently remind them that you are their smart academic assistant and guide them back to their studies."
        )

    def ask(self, question, history=None, model_name="gemini-2.5-flash", image_data=None, image_mime=None):
        """
        Ask a question with optional chat history and optional image attachment.
        History should be a list of dicts: [{'role': 'user'|'model', 'text': '...'}]
        """
        prompt = ""
        if history:
            for msg in history:
                role = "Student" if msg['role'] == 'user' else "Academic Assistant"
                prompt += f"{role}: {msg['text']}\n\n"
        
        prompt += f"Student: {question}\nAcademic Assistant:"
        
        return self.client.generate(
            prompt=prompt,
            system_instruction=self.system_instruction,
            model_name=model_name,
            image_data=image_data,
            image_mime=image_mime
        )

