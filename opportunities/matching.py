# opportunities/matching.py
from collections import defaultdict
from .models import Opportunity
from accounts.models import User

def match_volunteers_to_opportunities(opportunity):
    """
    Match volunteers to a specific opportunity based on skills and interests
    Returns a list of potential volunteers sorted by match score
    """
    matches = []
    volunteers = User.objects.filter(is_volunteer=True)
    
    for volunteer in volunteers:
        score = 0
        # Check skills match
        volunteer_skills = volunteer.skills or []
        required_skills = opportunity.required_skills or []
        
        for skill in volunteer_skills:
            if skill in required_skills:
                score += 1
                
        if score > 0:
            matches.append({
                'volunteer': volunteer,
                'match_score': score
            })
    
    return sorted(matches, key=lambda x: x['match_score'], reverse=True)
