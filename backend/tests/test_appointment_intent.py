import pytest
from unittest.mock import MagicMock, patch
from app.services.grok_agent import grok_agent, LangGraphVoiceAgent, GrokAgentResponse


def test_appointment_retrieval_intent():
    """Verify retrieval queries map to retrieve_appointments and do not mutate DB."""
    agent = LangGraphVoiceAgent()

    test_queries = [
        "Show upcoming doctor appointments",
        "Show my appointments",
        "What appointments do I have?",
        "Do I have any doctor appointments?",
        "Check doctor appointments",
        "List my appointments",
    ]

    mock_appointments = [
        {
            "id": "apt_101",
            "patientId": "patient_001",
            "title": "Neurology Follow-up",
            "doctorName": "Dr. Sarah Jenkins",
            "date": "Tomorrow",
            "time": "10:00 AM",
            "status": "scheduled",
        }
    ]

    with patch("app.database.dynamodb.dynamodb_service.get_appointments", return_value=mock_appointments) as mock_get:
        with patch("app.database.dynamodb.dynamodb_service.save_appointment") as mock_save:
            for query in test_queries:
                resp = agent._fallback_agent_graph(query, [], patient_id="patient_001")
                assert resp is not None
                assert len(resp.actions) == 1
                action = resp.actions[0]
                assert action.toolType == "retrieve_appointments", f"Query '{query}' was wrongly classified as {action.toolType}"
                assert "Dr. Sarah Jenkins" in resp.ai_response or "Neurology" in resp.ai_response
                # Ensure no DB mutation occurred
                mock_save.assert_not_called()

            assert mock_get.call_count == len(test_queries)


def test_appointment_retrieval_empty():
    """Verify empty appointments list returns accurate message without error."""
    agent = LangGraphVoiceAgent()

    with patch("app.database.dynamodb.dynamodb_service.get_appointments", return_value=[]):
        with patch("app.database.dynamodb.dynamodb_service.save_appointment") as mock_save:
            resp = agent._fallback_agent_graph("Show upcoming doctor appointments", [], patient_id="patient_001")
            assert len(resp.actions) == 1
            assert resp.actions[0].toolType == "retrieve_appointments"
            assert "no upcoming doctor appointments" in resp.ai_response.lower()
            mock_save.assert_not_called()


def test_appointment_creation_intent():
    """Verify explicit booking/creation prompts map to create_appointment."""
    agent = LangGraphVoiceAgent()

    creation_queries = [
        ("Book a doctor appointment with Dr. X tomorrow at 10 AM", "Dr. X"),
        ("Schedule an appointment with Dr. Mehta tomorrow at 2 PM", "Dr. Mehta"),
        ("Create an appointment with Dr. Smith tomorrow at 11 AM", "Dr. Smith"),
        ("Make a new doctor appointment tomorrow", "Dr. Anita Sharma"),
    ]

    for query, expected_doctor in creation_queries:
        resp = agent._fallback_agent_graph(query, [], patient_id="patient_001")
        assert len(resp.actions) == 1
        action = resp.actions[0]
        assert action.toolType == "create_appointment", f"Query '{query}' was not recognized as create_appointment"
        assert expected_doctor in action.parameters.get("doctorName", "")


def test_reschedule_not_treated_as_create():
    """Requirement: Do not treat 'reschedule' as create_appointment."""
    agent = LangGraphVoiceAgent()

    with patch("app.database.dynamodb.dynamodb_service.get_appointments", return_value=[]):
        with patch("app.database.dynamodb.dynamodb_service.save_appointment") as mock_save:
            resp = agent._fallback_agent_graph("Can you reschedule my doctor appointment?", [], patient_id="patient_001")
            if resp.actions:
                assert resp.actions[0].toolType != "create_appointment"
            mock_save.assert_not_called()


def test_completed_and_past_appointments_excluded_from_upcoming():
    """Requirement: completed, cancelled, and past appointments must NOT be reported as upcoming."""
    agent = LangGraphVoiceAgent()

    mixed_appointments = [
        {
            "id": "apt_1",
            "title": "Neurology Cognitive Evaluation",
            "doctorName": "Dr. Anita Sharma",
            "date": "Tomorrow, Sept 19",
            "time": "10:30 AM",
            "status": "Upcoming",
        },
        {
            "id": "apt_2",
            "title": "Physical Therapy & Balance Session",
            "doctorName": "Dr. Rajiv Mehta",
            "date": "Next Tuesday, Sept 22",
            "time": "3:00 PM",
            "status": "Upcoming",
        },
        {
            "id": "apt_3",
            "title": "Routine Blood Panel & BP Review",
            "doctorName": "Dr. S. K. Verma",
            "date": "Last Week, Sept 10",
            "time": "11:00 AM",
            "status": "Completed",  # Completed must be excluded
        },
        {
            "id": "apt_4",
            "title": "Cardiology Consultation",
            "doctorName": "Dr. Ramesh Gupta",
            "date": "Yesterday",
            "time": "9:00 AM",
            "status": "Cancelled",  # Cancelled must be excluded
        },
        {
            "id": "apt_5",
            "title": "Old Dermatology Check",
            "doctorName": "Dr. Sunita Sen",
            "date": "2020-01-15",
            "time": "2:00 PM",
            "status": "scheduled",  # Past date must be excluded
        },
    ]

    with patch("app.database.dynamodb.dynamodb_service.get_appointments", return_value=mixed_appointments):
        with patch("app.database.dynamodb.dynamodb_service.save_appointment") as mock_save:
            resp = agent._fallback_agent_graph("Show upcoming doctor appointments", [], patient_id="patient_001")
            assert len(resp.actions) == 1
            action = resp.actions[0]
            assert action.toolType == "retrieve_appointments"
            # Must count exactly 2 upcoming appointments (apt_1 and apt_2), NOT 5
            assert action.parameters["count"] == 2
            assert "Dr. S. K. Verma" not in resp.ai_response
            assert "Routine Blood Panel" not in resp.ai_response
            assert "Cardiology Consultation" not in resp.ai_response
            assert "Old Dermatology Check" not in resp.ai_response
            assert "You have 2 upcoming appointments" in resp.ai_response
            mock_save.assert_not_called()


def test_only_completed_appointments_yields_none_upcoming():
    """If all existing appointments are completed or cancelled, count must be 0."""
    agent = LangGraphVoiceAgent()

    only_completed = [
        {
            "id": "apt_3",
            "title": "Routine Blood Panel & BP Review",
            "doctorName": "Dr. S. K. Verma",
            "date": "Last Week, Sept 10",
            "time": "11:00 AM",
            "status": "Completed",
        }
    ]

    with patch("app.database.dynamodb.dynamodb_service.get_appointments", return_value=only_completed):
        resp = agent._fallback_agent_graph("Show upcoming doctor appointments", [], patient_id="patient_001")
        assert len(resp.actions) == 1
        assert resp.actions[0].toolType == "retrieve_appointments"
        assert resp.actions[0].parameters["count"] == 0
        assert "no upcoming doctor appointments" in resp.ai_response.lower()


def test_show_upcoming_appointments_dynamic_response():
    """
    Requirement: Verify 'Show upcoming appointments' displays actual appointment
    e.g. Dr Rocky — Tomorrow — 10:30 AM rather than hard-coded Dr. Anita data.
    """
    agent = LangGraphVoiceAgent()

    dynamic_appointments = [
        {
            "id": "apt_rocky",
            "patientId": "patient_001",
            "title": "Dr Rocky Consultation",
            "doctorName": "Dr Rocky",
            "date": "Tomorrow",
            "time": "10:30 AM",
            "status": "Upcoming",
        }
    ]

    with patch("app.database.dynamodb.dynamodb_service.get_appointments", return_value=dynamic_appointments):
        with patch("app.database.dynamodb.dynamodb_service.save_appointment") as mock_save:
            for query in ["Show upcoming appointments", "Show upcoming appointments."]:
                resp = agent._fallback_agent_graph(query, [], patient_id="patient_001")
                assert len(resp.actions) == 1
                assert resp.actions[0].toolType == "retrieve_appointments"
                assert "Dr Rocky" in resp.ai_response
                assert "Tomorrow at 10:30 AM" in resp.ai_response
                assert "Dr. Anita" not in resp.ai_response
                mock_save.assert_not_called()


