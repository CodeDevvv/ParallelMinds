-- run this in pgAdmin -> queryTool
CREATE EXTENSION IF NOT EXISTS postgis;

-- Custom Types
CREATE TYPE severity_enum AS ENUM (
    'None-Minimal', 
    'Mild', 
    'Moderate', 
    'Moderately severe', 
    'Severe'
);

CREATE TYPE event_category_enum AS ENUM (
    'Social', 
    'Therapeutic', 
    'Educational', 
    'Wellness', 
    'Creative', 
    'Volunteering', 
    'Peer-Led'
);

-- groups table 
CREATE TABLE groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    avg_phq_score DECIMAL(5,2) DEFAULT 0,
    avg_gad_score DECIMAL(5,2) DEFAULT 0,
    common_life_transitions TEXT[],
    shared_interests TEXT[],
    centroid GEOGRAPHY(POINT, 4326),
    max_size INT DEFAULT 10,
    current_size INT DEFAULT 0,
    is_open BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_groups_centroid ON groups USING GIST (centroid);

-- users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    date_of_birth DATE, 
    gender VARCHAR(50),
    
    location GEOGRAPHY(POINT, 4326),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    place_id VARCHAR(255),
    address TEXT,

    is_questionnaire_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    phq_score INT DEFAULT 0,
    -- USING THE ENUM HERE:
    phq_category severity_enum, 
    
    gad_score INT DEFAULT 0,
    -- USING THE ENUM HERE:
    gad_category severity_enum,
    
    life_transitions TEXT[], 
    interests TEXT[],        

    group_id UUID REFERENCES groups(id) ON DELETE SET NULL,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_users_location ON users USING GIST (location);

-- events table
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_date_time TIMESTAMP WITH TIME ZONE NOT NULL,
    capacity INT NOT NULL,
    
    event_type event_category_enum NOT NULL, 
    
    target_interests TEXT[],
    target_life_transitions TEXT[],
    
	target_phq_severity severity_enum[], 
    target_gad_severity severity_enum[],

    address TEXT,
    location GEOGRAPHY(POINT, 4326),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_events_location ON events USING GIST (location);

-- junction tables
CREATE TABLE user_events (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, event_id)
);


CREATE TABLE event_recommendations (
	group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    match_score DECIMAL(5,2), 
    matched_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (group_id, event_id)
);

CREATE TYPE message_type_enum AS ENUM ('user', 'admin', 'system');

CREATE TABLE group_chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE SET NULL,     
    sender_name VARCHAR(100) NOT NULL, 
    
    iv VARCHAR(255) NOT NULL,
    encrypted_payload TEXT NOT NULL, 
    auth_tag VARCHAR(255) NOT NULL,
    
    message_type message_type_enum DEFAULT 'user',
    is_admin_message BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index 1: Fast retrieval of a group's chat history (Sorted by time)
CREATE INDEX idx_chat_history ON group_chat_messages (group_id, created_at DESC);

-- Index 2: For cleaning up old messages (The TTL replacement)
CREATE INDEX idx_chat_cleanup ON group_chat_messages (created_at);

CREATE TABLE user_queries (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	user_id UUID REFERENCES users(id) ON DELETE SET NULL,     
	issueType VARCHAR(30) NOT NULL,
)

CREATE TYPE support_ticket_status AS ENUM ('Open', 'Closed');

CREATE TABLE support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- If user is deleted, delete their tickets
    
    issue_type VARCHAR(100) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message_text TEXT NOT NULL, 
    
    status support_ticket_status DEFAULT 'Open',
    admin_response TEXT,
    
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP WITH TIME ZONE
);

-- Find all tickets for a specific user 
CREATE INDEX idx_tickets_user ON support_tickets(user_id);
-- Find all 'Open' tickets for the admin dashboard 
CREATE INDEX idx_tickets_status ON support_tickets(status);


CREATE TABLE event_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    rating INT CHECK (rating >= 1 AND rating <= 5), 
    comment TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
    UNIQUE(event_id, user_id)
);

CREATE INDEX idx_event_feedback ON event_feedback(event_id);

CREATE TYPE log_event_enum AS ENUM (
    'user_registered', 
    'feedback_submitted', 
    'query_submitted', 
    'doctor_registered', 
    'user_profile_updated'
);

CREATE TYPE log_related_enum AS ENUM (
    'user', 
    'event', 
    'feedback', 
    'query', 
    'other'
);

CREATE TABLE system_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	event_type log_event_enum NOT NULL,
    related_type log_related_enum NOT NULL,
    description TEXT,
    related_entity_id UUID, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_logs_type ON system_logs(event_type);
CREATE INDEX idx_logs_date ON system_logs(created_at);

-- function that deletes old  System logs
CREATE OR REPLACE FUNCTION delete_old_logs() RETURNS TRIGGER AS $$
BEGIN
    -- Delete entries that are NOT from 'today' 
    DELETE FROM system_logs 
    WHERE created_at < CURRENT_DATE; 
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_cleanup_logs
AFTER INSERT ON system_logs
FOR EACH ROW
EXECUTE FUNCTION delete_old_logs();

ALTER TYPE log_event_enum ADD VALUE 'account_deleted';

CREATE TABLE admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	name VARCHAR(200),
	email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_admin_email ON admins(email);