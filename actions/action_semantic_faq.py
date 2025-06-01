import yaml
import os
from sentence_transformers import SentenceTransformer, util
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher

class ActionSemanticFAQ(Action):
    def name(self):
        return "action_semantic_faq"
        
    def __init__(self):
        self.model = SentenceTransformer('paraphrase-MiniLM-L6-v2')

        current_dir = os.path.dirname(os.path.abspath(__file__))
        file_path = os.path.join(current_dir, "faq_data.yml")

        self.faq_data = self.load_faq_data(file_path)
        self.questions = list(self.faq_data.keys())
        self.embeddings = self.model.encode(self.questions, convert_to_tensor=True)
    def load_faq_data(self, file_path):
        with open(file_path, "r", encoding="utf-8") as file:
            return yaml.safe_load(file)

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: dict) -> list:

        user_input = tracker.latest_message.get("text")

        # Embedding de la question utilisateur
        user_embedding = self.model.encode(user_input, convert_to_tensor=True)

        # Similarité cosinus avec toutes les questions
        similarities = util.cos_sim(user_embedding, self.embeddings)[0]
        best_score = similarities.max().item()
        best_index = similarities.argmax().item()

        if best_score > 0.7:  # seuil configurable
            best_question = self.questions[best_index]
            answer = self.faq_data[best_question]
            dispatcher.utter_message(text=answer)
        else:
            dispatcher.utter_message(text="Je ne suis pas sûr de comprendre. Peux-tu reformuler ?")

        return []


############################# Stockage de la dernière question ########
from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher


class ActionSetLastTopic(Action):
    def name(self) -> Text:
        return "action_set_last_topic"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        # Get the latest intent
        latest_intent = tracker.latest_message.get('intent', {}).get('name')
        
        # Map intents to topics
        topic_mapping = {
            'ask_port': 'port',
            'ask_socket': 'socket',
            'ask_checksum': 'checksum',
            'ask_tcp_overview': 'tcp',
            'udp_intro': 'udp',
            'tcp_connection': 'tcp_connection',
            'primitive_detail': 'primitive',
            'ask_tcp_features': 'tcp_features',
            'transport_protocols_summary': 'transport',
            'tcp_vs_udp': 'protocol_comparison'
        }
        
        # Set the topic based on intent
        topic = topic_mapping.get(latest_intent)
        
        if topic:
            return [{"event": "slot", "name": "last_topic", "value": topic}]
        return []


