-- DynamoDB PartiQL Commands

INSERT INTO "user_chat_sessions" VALUE {
  'user_id': '10010',
  'timestamp': '08112007',
  'session_history': 'I hope to pay off my student loans before I make bigger purchases in life. I do have parents who can help me pay some expenses and debt. I do not have any severe health issues now, but I want to have preventative checkups.'
};

INSERT INTO "user_chat_sessions" VALUE {
  'user_id': '30332',
  'timestamp': '10182025',
  'session_history': 'I am in my 50s, retired army veteran. Got kids who are about to head off to college, and I have severe asthma which needs treatment, as well as age-related macular degeneration in my eyes. My family needs my health insurance, and I am halfway through my mortgage.'
};

-- DynamoDB Larger DB

INSERT INTO "user_profiles" VALUE {
  'user_id': '10010',
  'is_active': 'true',
  'user_email': 'admin@cognizant.com',
  'user_phone': '555-555-5555',
  'full_name': 'Brittany Spears',
  'marital_status': 'Not Married',
  'veteran_status': 'Not a Veteran',
  'citizenship': 'US Citizen',
  'education_level': 'Bachelors',
  'major': 'Economics',
  'risk_aversion': '5/5',
  'tobacco_user': 'No',
  'disability_status': 'No',
  'work_country': 'USA',
  'dependents': 'None',
  'credit_score': '680'
};

INSERT INTO "user_profiles" VALUE {
  'user_id': '30332',
  'is_active': 'true',
  'user_email': 'engineer@accenture.com',
  'user_phone': '404-894-2500',
  'full_name': 'Abraham Lincoln',
  'marital_status': 'Married',
  'veteran_status': 'Veteran',
  'citizenship': 'US Citizen',
  'education_level': 'Masters',
  'major': 'Computer Science',
  'risk_aversion': '2/5',
  'tobacco_user': 'No',
  'disability_status': 'Yes',
  'work_country': 'USA',
  'dependents': '3',
  'credit_score': '850'
};
