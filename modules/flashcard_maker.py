import json

class FlashcardMaker:
    def __init__(self, gemini_client):
        self.client = gemini_client
        self.system_instruction = (
            "You are a Senior Full-Stack AI Developer and Educational System Designer.\n"
            "Your goal is to create high-impact flashcards that help students quickly learn, memorize, and revise concepts using a simple Question-Answer format with repetition-based learning.\n"
            "Flashcards should improve memory retention, quick revision before exams, concept understanding, and active recall practice.\n"
            "You MUST return the output in a strict JSON array format."
        )

    def make_flashcards(self, topic_or_text, num_cards=10, model_name="gemini-2.5-flash"):
        """
        Creates a deck of study flashcards based on a topic or text.
        Generates the strict [ { "question": "...", "answer": "..." } ] JSON array format as requested,
        then transforms it to the internal schema expected by the frontend.
        """
        prompt = (
            f"Generate {num_cards} flashcards based on the following topic:\n"
            f"Topic: \"\"\"\n{topic_or_text}\n\"\"\"\n\n"
            f"Content Rules:\n"
            f"- Have a clear question.\n"
            f"- Have a short, simple, correct answer.\n"
            f"- Be easy to understand for students.\n"
            f"- Focus on exam revision.\n\n"
            f"What should be included in the flashcards (if applicable):\n"
            f"- Basic Definition (What is X?)\n"
            f"- Key Concepts (Important points about X)\n"
            f"- Types / Classification (Types of X)\n"
            f"- Examples (Real-world examples)\n"
            f"- Short Facts (Important exam points)\n\n"
            f"Output Format:\n"
            f"You MUST generate the flashcards in this EXACT JSON array format:\n"
            f"[\n"
            f"  {{\n"
            f"    \"question\": \"string\",\n"
            f"    \"answer\": \"string\"\n"
            f"  }}\n"
            f"]\n\n"
            f"Strict Rules:\n"
            f"- Always include both question AND answer.\n"
            f"- Do not generate only questions.\n"
            f"- Do not output text outside JSON format.\n"
            f"- Ensure clean, structured response."
        )
        
        raw_response = self.client.generate(
            prompt=prompt,
            system_instruction=self.system_instruction,
            json_mode=True,
            model_name=model_name
        )
        
        try:
            # Clean up the response in case Gemini wrapped it in markdown code blocks
            cleaned_response = raw_response.strip()
            if cleaned_response.startswith('```json'):
                cleaned_response = cleaned_response[7:]
            elif cleaned_response.startswith('```'):
                cleaned_response = cleaned_response[3:]
                
            if cleaned_response.endswith('```'):
                cleaned_response = cleaned_response[:-3]
                
            cleaned_response = cleaned_response.strip()
            
            # Parse the strict JSON array format [ {"question": "...", "answer": "..."} ]
            cards_array = json.loads(cleaned_response)
            
            # If the model returned a dict with a key instead of an array, attempt to unpack it
            if isinstance(cards_array, dict):
                # Sometimes models wrap arrays inside a dictionary, e.g., {"flashcards": [...]}
                for key in cards_array:
                    if isinstance(cards_array[key], list):
                        cards_array = cards_array[key]
                        break
            
            if not isinstance(cards_array, list):
                raise ValueError("Expected a JSON array of flashcards.")
                
            # Transform to the frontend's expected internal schema:
            # { "deck_name": "...", "cards": [ {"front": "...", "back": "...", "context": ""} ] }
            deck_name = topic_or_text if len(topic_or_text) < 40 else "Study Deck"
            transformed_cards = []
            
            for card in cards_array:
                question = card.get("question", "No Question")
                answer = card.get("answer", "No Answer")
                transformed_cards.append({
                    "front": question,
                    "back": answer,
                    "context": "" # Context not required by user format
                })
                
            deck_data = {
                "deck_name": deck_name.title(),
                "cards": transformed_cards
            }
            
            return deck_data
        except Exception as e:
            raise ValueError(f"Failed to generate valid JSON flashcards. Error: {str(e)}")
