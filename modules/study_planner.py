import json

class StudyPlanner:
    def __init__(self, gemini_client):
        self.client = gemini_client
        self.system_instruction = (
            "You are a professional academic advisor and learning strategist. Your goal is to design highly efficient, realistic, and motivating study plans tailored to students' needs.\n"
            "Each plan should distribute topics logically, balance cognitive load, build up difficulty gradually, and include actionable, discrete tasks.\n"
            "Include estimated study times, priority levels for each task, and helpful advice or study strategies.\n"
            "You MUST return the output in a strict JSON format matching the schema requested."
        )

    def generate_plan(self, topic, timeframe="1 week", hours_per_day=2, level="beginner", model_name="gemini-2.5-flash"):
        """
        Generates a custom study plan.
        Returns a parsed JSON object matching the study plan schema.
        """
        prompt = (
            f"Generate a customized study plan based on the following student inputs:\n"
            f"Subject/Topic: \"{topic}\"\n"
            f"Timeframe available: {timeframe} (e.g. 1 week, 4 weeks)\n"
            f"Daily study budget: {hours_per_day} hours/day\n"
            f"Current proficiency level: {level.upper()}\n\n"
            f"You must return a JSON object with this exact schema:\n"
            f"{{\n"
            f"  \"plan_title\": \"A descriptive, encouraging title for the study plan\",\n"
            f"  \"summary\": \"A short, positive, 2-sentence summary outlining what they will achieve and tips for success.\",\n"
            f"  \"weeks\": [\n"
            f"    {{\n"
            f"      \"week_number\": 1,\n"
            f"      \"focus\": \"The core objective or focus area for this week\",\n"
            f"      \"days\": [\n"
            f"        {{\n"
            f"          \"day_name\": \"Day 1\",\n"
            f"          \"focus\": \"Daily focus area\",\n"
            f"          \"tasks\": [\n"
            f"            {{\n"
            f"              \"description\": \"Specific task, e.g. Read about arrays and take notes\",\n"
            f"              \"duration_mins\": 45,\n"
            f"              \"priority\": \"High\"\n"
            f"            }}\n"
            f"          ],\n"
            f"          \"resources\": [\n"
            f"            \"Recommended type of resource (e.g. documentation, video tutorial, textbook chapter)\"\n"
            f"          ]\n"
            f"        }}\n"
            f"      ]\n"
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
            plan_data = json.loads(raw_response)
            return plan_data
        except Exception:
            raise ValueError("Failed to generate a valid JSON study plan. Please try again.")
