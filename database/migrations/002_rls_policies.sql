
-- Enable RLS on all tables
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

-- Workspaces policies
CREATE POLICY "Users can view their own workspace" ON workspaces
    FOR SELECT USING (
        id IN (
            SELECT workspace_id FROM profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own workspace" ON workspaces
    FOR UPDATE USING (
        id IN (
            SELECT workspace_id FROM profiles 
            WHERE id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (id = auth.uid());

-- Subscriptions policies
CREATE POLICY "Users can view their workspace subscriptions" ON subscriptions
    FOR SELECT USING (
        workspace_id IN (
            SELECT workspace_id FROM profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can manage their workspace subscriptions" ON subscriptions
    FOR ALL USING (
        workspace_id IN (
            SELECT workspace_id FROM profiles 
            WHERE id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

-- Documents policies
CREATE POLICY "Users can view their workspace documents" ON documents
    FOR SELECT USING (
        workspace_id IN (
            SELECT workspace_id FROM profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can manage their workspace documents" ON documents
    FOR ALL USING (
        workspace_id IN (
            SELECT workspace_id FROM profiles WHERE id = auth.uid()
        )
    );

-- Leads policies
CREATE POLICY "Users can view their workspace leads" ON leads
    FOR SELECT USING (
        workspace_id IN (
            SELECT workspace_id FROM profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can manage their workspace leads" ON leads
    FOR ALL USING (
        workspace_id IN (
            SELECT workspace_id FROM profiles WHERE id = auth.uid()
        )
    );

-- Chat sessions policies
CREATE POLICY "Users can view their workspace chat sessions" ON chat_sessions
    FOR SELECT USING (
        workspace_id IN (
            SELECT workspace_id FROM profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can manage their workspace chat sessions" ON chat_sessions
    FOR ALL USING (
        workspace_id IN (
            SELECT workspace_id FROM profiles WHERE id = auth.uid()
        )
    );
