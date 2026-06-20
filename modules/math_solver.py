import json

class MathSolver:
    def __init__(self, gemini_client):
        self.client = gemini_client

    def solve(self, question=None, image_data=None, image_mime=None, model_name="gemini-2.5-flash"):
        """
        Solves a math question (text or image) and returns structured solution data.
        """
        if not question and not image_data:
            raise ValueError("Either a text question or an image of the question must be provided.")

        system_instruction = (
            "You are an elite AI Math Tutor, full-stack Academic Dean, and expert in mathematics (algebra, calculus, geometry, and arithmetic). "
            "Your objective is to transcribe the math problem from any input, solve it correctly, "
            "and explain it like a world-class teacher (encouraging, structured, and easy to understand).\n\n"
            "You MUST return your output in the following JSON format:\n"
            "{\n"
            "  \"extracted_question\": \"Strict transcription of the problem text or mathematical equation found in the input (text/image).\",\n"
            "  \"final_answer\": \"The final simplified result or answer to the question.\",\n"
            "  \"steps\": [\n"
            "    \"Step 1 explanation with LaTeX equations.\",\n"
            "    \"Step 2 explanation with LaTeX equations.\"\n"
            "  ],\n"
            "  \"beginner_explanation\": \"An easy, beginner-friendly explanation suited for someone learning the concept for the first time. Use analogies and break it down in simple steps.\",\n"
            "  \"intermediate_explanation\": \"An intermediate-level explanation that covers the core rules used (e.g. power rule in calculus, factoring in algebra).\",\n"
            "  \"tutor_commentary\": \"Encouraging tutoring-style advice, tricks to remember, or common pitfalls to avoid.\"\n"
            "}\n\n"
            "Ensure all mathematical equations inside the JSON strings are formatted in standard KaTeX math delimiters ($...$ for inline or $$...$$ for display) to render beautifully."
        )

        prompt = "Please solve the math question."
        if question:
            prompt += f"\n\nQuestion Text Provided:\n{question}"
        if image_data:
            prompt += "\n\nAn image of the question has been uploaded. Please perform multimodal OCR to transcribe and solve it."

        try:
            # We call the client's generate method with json_mode=True
            raw_response = self.client.generate(
                prompt=prompt,
                system_instruction=system_instruction,
                json_mode=True,
                model_name=model_name,
                image_data=image_data,
                image_mime=image_mime
            )
            
            # Parse the JSON response
            solution_data = json.loads(raw_response)
            return solution_data
        except Exception as e:
            # Return a fallback JSON structure if something goes wrong
            import traceback
            return {
                "extracted_question": question or "Image/Document uploaded",
                "final_answer": "Error occurred while solving.",
                "steps": [f"An error occurred: {str(e)}"],
                "beginner_explanation": "We encountered an issue analyzing your input. Please make sure the math problem is clear.",
                "intermediate_explanation": traceback.format_exc(),
                "tutor_commentary": "Try typing the equation if the image is too blurry."
            }
