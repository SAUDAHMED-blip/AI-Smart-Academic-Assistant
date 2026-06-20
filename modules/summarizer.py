class Summarizer:
    def __init__(self, gemini_client):
        self.client = gemini_client
        self.system_instruction = (
            "You are an elite academic editor and summarizer. Your goal is to condense study materials, textbooks, or notes into extremely clear, accurate, and structured summaries.\n"
            "Identify and emphasize key terms, formulas, dates, or core theories.\n"
            "Strictly avoid fabricating any external claims or facts not supported by the input text.\n"
            "Format your output professionally using markdown (bolding, headers, lists) for high readability."
        )

    def summarize(self, text, format_type="key_takeaways", style="academic", model_name="gemini-2.5-flash"):
        """
        Summarize the given text.
        format_type can be: 'bullet_points', 'paragraph', 'key_takeaways', 'study_guide'
        style can be: 'academic', 'eli5' (simple), 'technical'
        """
        prompt = (
            f"Please summarize the following text.\n"
            f"Format requirements: {format_type.replace('_', ' ').title()}\n"
            f"Tone/Style: {style.upper()}\n\n"
            f"Input Text:\n\"\"\"\n{text}\n\"\"\"\n\n"
            f"Summary:"
        )
        
        return self.client.generate(
            prompt=prompt,
            system_instruction=self.system_instruction,
            model_name=model_name
        )
